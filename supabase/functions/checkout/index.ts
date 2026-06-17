import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing server database configuration environment variables.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();

    const productId = body.productId;
    const priceVnd = body.price || body.priceVnd;
    const email = body.email || "";
    const userId = body.userId || "";
    const productName = body.productName || `LumenForge - ${productId?.toUpperCase()}`;
    const productType = body.productType || "Tài liệu số";
    const productLink = body.productLink || "#";

    if (!productId || !priceVnd) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: productId, price" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve user email / user ID
    let userEmail = email;
    let resolvedUserId = userId;

    if (userId && !userEmail) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();
      if (profile?.email) {
        userEmail = profile.email;
      }
    }

    if (userEmail && !resolvedUserId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();
      if (profile?.id) {
        resolvedUserId = profile.id;
      }
    }

    // If still no user ID, check if we can list or create a placeholder user for tracking
    if (!resolvedUserId && userEmail) {
      const { data: newAuthUser } = await supabase.auth.admin.createUser({
        email: userEmail,
        email_confirm: true,
        user_metadata: { source: "edge-checkout" }
      });
      if (newAuthUser?.user) {
        resolvedUserId = newAuthUser.user.id;
      }
    }

    if (!resolvedUserId) {
      throw new Error("Could not resolve or create user profile for checkout.");
    }

    const returnUrl = body.returnUrl || body.redirectUrl || "https://lumenforge.studio/dashboard.html?payment=success";
    const cancelUrl = body.cancelUrl || body.redirectUrl || "https://lumenforge.studio/store.html?payment=cancel";
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
                name: productName,
                description: `Tài liệu/Presets số của LumenForge: ${productName}`,
              },
              unit_amount: priceVnd,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        customer_email: userEmail || undefined,
        metadata: {
          productId,
          userId: resolvedUserId,
          email: userEmail,
          addInfo: productName,
        },
        success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&status=success`,
        cancel_url: cancelUrl,
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
      const orderCode = Number(String(Date.now()).slice(-9)) + Math.floor(Math.random() * 100);
      const description = `LF ${productId.substring(0, 10)}`;

      // Store pending order in Supabase
      const { error: dbError } = await supabase
        .from("pending_orders")
        .insert({
          order_code: orderCode,
          user_id: resolvedUserId,
          product_id: productId,
          product_name: productName,
          product_type: productType,
          product_link: productLink,
          price: priceVnd,
          status: "pending"
        });

      if (dbError) {
        console.error("Supabase pending_orders error:", dbError);
        throw new Error(`Failed to create pending order: ${dbError.message}`);
      }

      // PayOS Request Object
      const paymentData = {
        orderCode,
        amount: priceVnd,
        description: description,
        cancelUrl: cancelUrl,
        returnUrl: `${returnUrl}?order_code=${orderCode}&status=success`,
      };

      // Sign the request
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
