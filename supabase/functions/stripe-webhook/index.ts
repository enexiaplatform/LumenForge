import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (!stripeSecret || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing server environment variables (Stripe or Supabase).");
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2022-11-15",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const body = await req.text();
    let event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        stripeWebhookSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (metadata && metadata.productId) {
        const productId = metadata.productId;
        let userId = metadata.userId || null;
        const customerEmail = metadata.email || session.customer_details?.email || session.customer_email || "";
        const addInfo = metadata.addInfo || "";
        const amountVnd = session.amount_total || 0;

        console.log(`[STRIPE WEBHOOK] Payment succeeded for ${customerEmail || userId}, product: ${productId}`);

        // 1. Resolve user profile in Supabase profiles
        let userData = null;
        if (userId) {
          const { data } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", userId)
            .single();
          userData = data;
        }

        if (!userData && customerEmail) {
          const { data } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", customerEmail)
            .single();
          userData = data;
        }

        if (userData) {
          userId = userData.id;
        } else if (customerEmail) {
          // If user does not exist in profiles, we can create a placeholder user in auth
          const { data: newAuthUser } = await supabase.auth.admin.createUser({
            email: customerEmail,
            email_confirm: true,
            user_metadata: { source: "stripe-checkout-edge" }
          });
          if (newAuthUser?.user) {
            userId = newAuthUser.user.id;
          }
        }

        if (userId) {
          // Get product info
          const { data: productData } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .single();

          const pName = productData ? productData.name : `LumenForge - ${productId.toUpperCase()}`;
          const pType = productData ? productData.type : "Tài liệu số";
          const pLink = productData ? productData.file_link : "#";

          // 2. Insert to purchases table
          const { error: purchaseError } = await supabase
            .from("purchases")
            .insert({
              user_id: userId,
              product_id: productId,
              product_name: pName,
              product_type: pType,
              product_link: pLink,
              price: amountVnd
            });

          if (purchaseError) {
            console.error("[STRIPE WEBHOOK] Error inserting purchase:", purchaseError);
            throw purchaseError;
          }

          // 3. Add XP and rank update to user
          const { data: profile } = await supabase
            .from("profiles")
            .select("xp, rank")
            .eq("id", userId)
            .single();

          if (profile) {
            const newXp = (profile.xp || 0) + 50;
            let newRank = profile.rank || "Novice";
            if (newXp >= 1000) newRank = "Director of Photography";
            else if (newXp >= 300) newRank = "Advanced Shooter";

            await supabase
              .from("profiles")
              .update({ xp: newXp, rank: newRank })
              .eq("id", userId);
          }

          // 3. Record sale if it is a creator's product
          if (productData && productData.creator_email) {
            const { data: sellerProfile } = await supabase
              .from("profiles")
              .select("id")
              .eq("email", productData.creator_email)
              .single();

            if (sellerProfile) {
              const txId = `TX-STRIPE-${session.id.substring(12, 22)}`;
              const { error: saleError } = await supabase
                .from("sales")
                .insert({
                  id: txId,
                  product_id: productId,
                  product_name: pName,
                  price: amountVnd,
                  buyer_name: customerEmail.split("@")[0],
                  buyer_email: customerEmail,
                  seller_id: sellerProfile.id,
                  status: "completed"
                });
              
              if (saleError) {
                console.error("[STRIPE WEBHOOK] Error inserting sale log:", saleError);
              }

              // Move product status to testing if it's currently draft
              await supabase
                .from("products")
                .update({ status: "testing" })
                .eq("id", productId)
                .in("status", ["draft"]);
            }
          }

          console.log(`[STRIPE WEBHOOK] Sync complete for order ${session.id}`);
        } else {
          console.error("[STRIPE WEBHOOK] Failed to resolve user ID for " + customerEmail);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[STRIPE WEBHOOK ERROR] Internal error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
