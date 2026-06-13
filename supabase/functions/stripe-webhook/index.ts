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

      if (metadata && metadata.productId && metadata.email) {
        const productId = metadata.productId;
        const customerEmail = metadata.email;
        const addInfo = metadata.addInfo || "";
        const amountVnd = session.amount_total || 0;

        console.log(`[STRIPE WEBHOOK] Payment succeeded for ${customerEmail}, product: ${productId}`);

        // 1. Find or create user profile in Supabase auth / profiles
        // We look up user by email
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", customerEmail)
          .single();

        let userId = null;
        if (userData) {
          userId = userData.id;
        } else {
          // If user does not exist in profiles, we can create a placeholder user in auth
          const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
            email: customerEmail,
            email_confirm: true,
            user_metadata: { source: "stripe-checkout" }
          });
          if (newAuthUser?.user) {
            userId = newAuthUser.user.id;
          }
        }

        if (userId) {
          // 2. Insert to purchases table
          const { error: purchaseError } = await supabase
            .from("purchases")
            .insert({
              user_id: userId,
              product_id: productId,
              product_name: `LumenForge - ${productId.toUpperCase()}`,
              price_paid: amountVnd,
              email: customerEmail,
              status: "completed",
              reference_code: session.id.substring(0, 15)
            });

          if (purchaseError) {
            console.error("[STRIPE WEBHOOK] Error inserting purchase:", purchaseError);
            throw purchaseError;
          }

          // 3. Record sale if it is a creator's product
          const { data: productData } = await supabase
            .from("products")
            .select("creator, creator_email")
            .eq("id", productId)
            .single();

          if (productData && productData.creator_email) {
            const { error: saleError } = await supabase
              .from("sales")
              .insert({
                product_id: productId,
                product_name: `LumenForge - ${productId.toUpperCase()}`,
                price: amountVnd,
                buyer_name: customerEmail.split("@")[0],
                buyer_email: customerEmail,
                creator_email: productData.creator_email,
                status: "completed"
              });
            
            if (saleError) {
              console.error("[STRIPE WEBHOOK] Error inserting sale log:", saleError);
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
