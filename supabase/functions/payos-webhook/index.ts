import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const payosChecksumKey = Deno.env.get("PAYOS_CHECKSUM_KEY");

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
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (!supabaseUrl || !supabaseServiceKey || !payosChecksumKey) {
      throw new Error("Missing server environment variables (PayOS or Supabase).");
    }

    const payload = await req.json();

    // Handle PayOS test / confirmation ping
    if (payload.desc === "confirm" || payload.desc === "confirm-webhook" || !payload.data || !payload.signature) {
      console.log("[PAYOS WEBHOOK] Received confirmation or test ping:", payload);
      return new Response(JSON.stringify({ success: true, message: "Webhook confirmed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { data, signature } = payload;

    // Verify PayOS signature
    // PayOS signature formula: Sort data keys alphabetically, join key=value with & and sign with checksum key
    const sortedKeys = Object.keys(data).sort();
    const dataString = sortedKeys
      .map((key) => {
        let val = data[key];
        if (typeof val === "object" && val !== null) {
          val = JSON.stringify(val);
        }
        return `${key}=${val}`;
      })
      .join("&");

    const calculatedSignature = await signHmacSha256(dataString, payosChecksumKey);

    if (calculatedSignature !== signature) {
      console.error("[PAYOS WEBHOOK] Signature verification failed.");
      return new Response("Unauthorized signature mismatch", { status: 401 });
    }

    // Process PayOS webhook success event
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (data.desc === "success" || data.status === "PAID") {
      const orderCode = data.orderCode;
      const amountPaid = data.amount;

      console.log(`[PAYOS WEBHOOK] Confirmed paid orderCode: ${orderCode}, amount: ${amountPaid}`);

      // 1. Find the pending order in Supabase
      const { data: pendingOrder, error: fetchError } = await supabase
        .from("pending_orders")
        .select("*")
        .eq("order_code", orderCode)
        .single();

      if (fetchError || !pendingOrder) {
        console.error(`[PAYOS WEBHOOK] Pending order not found for orderCode: ${orderCode}`, fetchError);
        return new Response(JSON.stringify({ error: "Pending order not found" }), { status: 404 });
      }

      // Check if already processed
      if (pendingOrder.status === "completed") {
        return new Response(JSON.stringify({ success: true, message: "Order already processed" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      // 2. Insert into purchases table
      const { error: insertError } = await supabase
        .from("purchases")
        .insert({
          user_id: pendingOrder.user_id,
          product_id: pendingOrder.product_id,
          product_name: pendingOrder.product_name,
          product_type: pendingOrder.product_type,
          product_link: pendingOrder.product_link,
          price: pendingOrder.price
        });

      if (insertError) {
        console.error("[PAYOS WEBHOOK] Error inserting purchase:", insertError);
        return new Response(JSON.stringify({ error: "Failed to record purchase" }), { status: 500 });
      }

      // 3. Add XP and rank update to user
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, email, xp, rank")
        .eq("id", pendingOrder.user_id)
        .single();

      if (profile) {
        const newXp = (profile.xp || 0) + 50;
        let newRank = profile.rank || "Novice";
        if (newXp >= 1000) newRank = "Director of Photography";
        else if (newXp >= 300) newRank = "Advanced Shooter";

        await supabase
          .from("profiles")
          .update({ xp: newXp, rank: newRank })
          .eq("id", pendingOrder.user_id);
      }

      // 4. Record sale if it is a creator's product
      const { data: productData } = await supabase
        .from("products")
        .select("creator, creator_email")
        .eq("id", pendingOrder.product_id)
        .single();

      if (productData && productData.creator_email) {
        const { data: sellerProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", productData.creator_email)
          .single();

        if (sellerProfile) {
          const { error: saleError } = await supabase
            .from("sales")
            .insert({
              id: `TX-${orderCode}`,
              product_id: pendingOrder.product_id,
              product_name: pendingOrder.product_name,
              price: pendingOrder.price,
              buyer_name: profile ? profile.name : "Khách",
              buyer_email: profile ? (profile.email || "guest@lumenforge.com") : "guest@lumenforge.com",
              seller_id: sellerProfile.id,
              status: "completed"
            });
          
          if (saleError) {
            console.error("[PAYOS WEBHOOK] Error inserting sale log:", saleError);
          }

          // Move product status to testing if it's currently draft
          await supabase
            .from("products")
            .update({ status: "testing" })
            .eq("id", pendingOrder.product_id)
            .in("status", ["draft"]);
        }
      }

      // 5. Mark pending order as completed
      await supabase
        .from("pending_orders")
        .update({ status: "completed" })
        .eq("order_code", orderCode);

      console.log(`[PAYOS WEBHOOK] Successfully synced orderCode: ${orderCode}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[PAYOS WEBHOOK ERROR] Internal error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
