import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// PayOS Cryptography Helpers
async function signHmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { productId, priceVnd, email, addInfo, redirectUrl } = await req.json();

    if (!productId || !priceVnd || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: productId, priceVnd, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const provider = Deno.env.get("LIVE_GATEWAY_PROVIDER")?.toLowerCase() || "stripe";

    if (provider === "stripe") {
      const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeSecret) {
        throw new Error("Stripe secret key is not configured in Supabase Environment Variables.");
      }

      const stripe = new Stripe(stripeSecret, {
        apiVersion: "2022-11-15",
        httpClient: Stripe.createFetchHttpClient(),
      });

      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "vnd",
              product_data: {
                name: `LumenForge - ${productId.toUpperCase()}`,
                description: `Tài liệu/Presets số của LumenForge: ${addInfo}`,
              },
              unit_amount: priceVnd,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        customer_email: email,
        metadata: {
          productId,
          email,
          addInfo,
        },
        success_url: `${redirectUrl}?session_id={CHECKOUT_SESSION_ID}&status=success`,
        cancel_url: redirectUrl,
      });

      return new Response(
        JSON.stringify({ checkoutUrl: session.url }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (provider === "payos") {
      const payosClientId = Deno.env.get("PAYOS_CLIENT_ID");
      const payosApiKey = Deno.env.get("PAYOS_API_KEY");
      const payosChecksumKey = Deno.env.get("PAYOS_CHECKSUM_KEY");

      if (!payosClientId || !payosApiKey || !payosChecksumKey) {
        throw new Error("PayOS credentials are not configured in Supabase Environment Variables.");
      }

      // PayOS requires a unique numeric orderCode
      const orderCode = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 10000);
      const description = `LF ${productId.substring(0, 10)}`;

      // PayOS Request Object
      const paymentData = {
        orderCode,
        amount: priceVnd,
        description: description,
        cancelUrl: redirectUrl,
        returnUrl: `${redirectUrl}?order_code=${orderCode}&status=success`,
      };

      // Sign the request
      // PayOS signing string format: amount=xxx&cancelUrl=xxx&description=xxx&orderCode=xxx&returnUrl=xxx
      const signString = `amount=${paymentData.amount}&cancelUrl=${paymentData.cancelUrl}&description=${paymentData.description}&orderCode=${paymentData.orderCode}&returnUrl=${paymentData.returnUrl}`;
      const signature = await signHmacSha256(signString, payosChecksumKey);

      const response = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": payosClientId,
          "x-api-key": payosApiKey,
        },
        body: JSON.stringify({
          ...paymentData,
          signature: signature,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`PayOS API error: ${errText}`);
      }

      const resData = await response.json();
      if (resData.code !== "00") {
        throw new Error(`PayOS creation failed: ${resData.desc}`);
      }

      return new Response(
        JSON.stringify({ checkoutUrl: resData.data.checkoutUrl }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      throw new Error(`Unsupported gateway provider: ${provider}`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
