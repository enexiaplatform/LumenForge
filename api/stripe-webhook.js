const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getRawBody = (req) => {
  return new Promise((resolve, reject) => {
    let chunks = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    if (!stripeSecret || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing server environment variables (Stripe or Supabase).');
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: '2022-11-15',
    });

    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    // Stripe webhooks need raw body for verification.
    // In Vercel, we can read raw body if it is not parsed, or use req.body if it is raw.
    // However, Vercel helper exposes standard parsing. To support constructEvent correctly,
    // we use req.body if it's a Buffer/String, or we construct it.
    let event;
    let rawBody;
    try {
      rawBody = await getRawBody(req);
    } catch (err) {
      console.error(`Error reading raw body: ${err.message}`);
      return res.status(400).json({ error: 'Failed to read request body' });
    }
    
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        stripeWebhookSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata;

      if (metadata && metadata.productId) {
        const productId = metadata.productId;
        let userId = metadata.userId;
        const customerEmail = metadata.email || session.customer_details?.email || session.customer_email;
        const amountVnd = session.amount_total || 0;

        console.log(`[STRIPE WEBHOOK] Payment succeeded for user ${userId || customerEmail}, product: ${productId}`);

        // 1. Resolve user profile in Supabase profiles
        let profile = null;
        if (userId) {
          const { data } = await supabase
            .from('profiles')
            .select('id, name, email, xp, rank')
            .eq('id', userId)
            .single();
          profile = data;
        }

        if (!profile && customerEmail) {
          const { data } = await supabase
            .from('profiles')
            .select('id, name, email, xp, rank')
            .eq('email', customerEmail)
            .single();
          profile = data;
          if (profile) {
            userId = profile.id;
          }
        }

        // If user does not exist in profiles at all, create a placeholder user in Auth
        if (!profile && customerEmail) {
          try {
            const { data: newAuthUser } = await supabase.auth.admin.createUser({
              email: customerEmail,
              email_confirm: true,
              user_metadata: { source: 'stripe-webhook-vercel' }
            });
            if (newAuthUser?.user) {
              userId = newAuthUser.user.id;
              // Re-fetch profile created by trigger
              const { data } = await supabase
                .from('profiles')
                .select('id, name, email, xp, rank')
                .eq('id', userId)
                .single();
              profile = data;
            }
          } catch (createErr) {
            console.error('[STRIPE WEBHOOK] Failed to create placeholder user:', createErr.message);
          }
        }

        if (profile && userId) {
          const actualEmail = profile.email || customerEmail || 'guest@lumenforge.com';

          // Get product info
          const { data: productData } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

          const pName = productData ? productData.name : `LumenForge - ${productId.toUpperCase()}`;
          const pType = productData ? productData.type : 'Tài liệu số';
          const pLink = productData ? productData.file_link : '#';

          // 2. Insert to purchases table
          const { error: purchaseError } = await supabase
            .from('purchases')
            .insert({
              user_id: userId,
              product_id: productId,
              product_name: pName,
              product_type: pType,
              product_link: pLink,
              price: amountVnd
            });

          if (purchaseError) {
            console.error('[STRIPE WEBHOOK] Error inserting purchase:', purchaseError);
            throw purchaseError;
          }

          // 3. Add XP and rank update to user
          const newXp = (profile.xp || 0) + 50;
          let newRank = profile.rank || 'Novice';
          if (newXp >= 1000) newRank = 'Director of Photography';
          else if (newXp >= 300) newRank = 'Advanced Shooter';

          await supabase
            .from('profiles')
            .update({ xp: newXp, rank: newRank })
            .eq('id', userId);

          // 4. Record sale if it is a creator's product
          if (productData) {
            let sellerId = productData.creator_id;
            if (!sellerId && productData.creator_email) {
              const { data: sellerProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', productData.creator_email)
                .single();
              if (sellerProfile) sellerId = sellerProfile.id;
            }

            if (sellerId) {
              const txId = `TX-STRIPE-${session.id.substring(12, 22)}`;
              const { error: saleError } = await supabase
                .from('sales')
                .insert({
                  id: txId,
                  product_id: productId,
                  product_name: pName,
                  price: amountVnd,
                  buyer_name: profile.name || customerEmail.split('@')[0],
                  buyer_email: customerEmail,
                  seller_id: sellerId,
                  status: 'completed'
                });
              
              if (saleError) {
                console.error('[STRIPE WEBHOOK] Error inserting sale log:', saleError);
              }

              // Move product status to testing if it's currently draft
              await supabase
                .from('products')
                .update({ status: 'testing' })
                .eq('id', productId)
                .in('status', ['draft']);
            }
          }

          console.log(`[STRIPE WEBHOOK] Sync complete for order ${session.id}`);
        } else {
          console.error('[STRIPE WEBHOOK] Failed to resolve user ID for ' + userId);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[STRIPE WEBHOOK ERROR] Internal error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
