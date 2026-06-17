const { PayOS } = require('@payos/node');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

let payosInstance = null;
function getPayOS() {
  if (!payosInstance) {
    payosInstance = new PayOS(
      process.env.PAYOS_CLIENT_ID || '',
      process.env.PAYOS_API_KEY || '',
      process.env.PAYOS_CHECKSUM_KEY || ''
    );
  }
  return payosInstance;
}

let stripeInstance = null;
function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2022-11-15'
    });
  }
  return stripeInstance;
}

let supabaseInstance = null;
function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }
  return supabaseInstance;
}

module.exports = async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, productId, productName, productType, productLink, price, returnUrl, cancelUrl } = req.body;

    if (!userId || !productId || !price) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const provider = (process.env.LIVE_GATEWAY_PROVIDER || 'stripe').toLowerCase();

    if (provider === 'stripe') {
      const stripe = getStripe();
      
      // Resolve customer email from profiles if possible
      let customerEmail = undefined;
      if (userId) {
        try {
          const { data: profile } = await getSupabase()
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .single();
          if (profile && profile.email) {
            customerEmail = profile.email;
          }
        } catch (e) {
          console.error('[STRIPE CHECKOUT] Failed to fetch profile email:', e.message);
        }
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'vnd',
              product_data: {
                name: productName || productId,
                description: `Tài liệu/Presets số của LumenForge: ${productName || productId}`,
              },
              unit_amount: price,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: customerEmail || undefined,
        metadata: {
          productId,
          userId,
          email: customerEmail || '',
          addInfo: productName || productId,
        },
        success_url: `${returnUrl || 'https://lumenforge.studio/dashboard.html?payment=success'}&session_id={CHECKOUT_SESSION_ID}&status=success`,
        cancel_url: cancelUrl || 'https://lumenforge.studio/store.html?payment=cancel',
      });

      return res.status(200).json({
        checkoutUrl: session.url
      });
    } else if (provider === 'payos') {
      // Generate unique order code (max 53 bit integer)
      const orderCode = Number(String(Date.now()).slice(-9)) + Math.floor(Math.random() * 100);

      // Store pending order in Supabase
      const { error: dbError } = await getSupabase()
        .from('pending_orders')
        .insert({
          order_code: orderCode,
          user_id: userId,
          product_id: productId,
          product_name: productName || productId,
          product_type: productType || 'Tài liệu số',
          product_link: productLink || '#',
          price: price
        });

      if (dbError) {
        console.error('Supabase Error:', dbError);
        return res.status(500).json({ error: 'Failed to create pending order in database' });
      }

      // Create PayOS payment link
      const payos = getPayOS();
      const body = {
        orderCode: orderCode,
        amount: price,
        description: `LumenForge ${productId}`.substring(0, 25),
        items: [
          {
            name: productName || productId,
            quantity: 1,
            price: price
          }
        ],
        returnUrl: returnUrl || 'https://lumenforge.studio/dashboard.html?payment=success',
        cancelUrl: cancelUrl || 'https://lumenforge.studio/store.html?payment=cancel'
      };

      const paymentLinkRes = await payos.createPaymentLink(body);

      return res.status(200).json({
        checkoutUrl: paymentLinkRes.checkoutUrl
      });
    } else {
      return res.status(400).json({ error: `Unsupported payment provider: ${provider}` });
    }

  } catch (error) {
    console.error('Checkout Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
