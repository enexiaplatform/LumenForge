const PayOS = require('@payos/node');
const { createClient } = require('@supabase/supabase-js');

// Initialize PayOS
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

// Initialize Supabase Admin (Needs Service Role Key to insert into DB securely)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

    // Generate unique order code (max 53 bit integer)
    const orderCode = Number(String(Date.now()).slice(-9));

    // Store pending order in Supabase
    const { error: dbError } = await supabase
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

  } catch (error) {
    console.error('PayOS Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
