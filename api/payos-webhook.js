const { PayOS } = require('@payos/node');
const { createClient } = require('@supabase/supabase-js');

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body;

    // Handle PayOS test / confirmation ping
    if (!body || body.desc === 'confirm' || body.desc === 'confirm-webhook' || !body.data || !body.signature) {
      console.log('[PAYOS WEBHOOK] Received confirmation or test ping:', body);
      return res.status(200).json({ success: true, message: 'Webhook confirmed' });
    }

    // Verify Webhook Data
    const webhookData = getPayOS().verifyPaymentWebhookData(body);

    // If payment is successful
    if (webhookData.code === '00' || webhookData.success === true) {
      const orderCode = webhookData.orderCode;

      // Find the pending order in Supabase
      const { data: pendingOrder, error: fetchError } = await getSupabase()
        .from('pending_orders')
        .select('*')
        .eq('order_code', orderCode)
        .single();

      if (fetchError || !pendingOrder) {
         console.error('Order not found or error fetching:', fetchError);
        return res.status(404).json({ error: 'Pending order not found' });
      }

      // Check if already processed
      if (pendingOrder.status === 'completed') {
        return res.status(200).json({ message: 'Order already processed' });
      }

      // Insert into purchases table
      const { error: insertError } = await getSupabase()
        .from('purchases')
        .insert({
          user_id: pendingOrder.user_id,
          product_id: pendingOrder.product_id,
          product_name: pendingOrder.product_name,
          product_type: pendingOrder.product_type,
          product_link: pendingOrder.product_link,
          price: pendingOrder.price
        });

      if (insertError) {
        console.error('Error inserting purchase:', insertError);
        return res.status(500).json({ error: 'Failed to record purchase' });
      }

      // Add XP to user
      const { data: profile } = await getSupabase()
        .from('profiles')
        .select('xp, rank, name, email')
        .eq('id', pendingOrder.user_id)
        .single();

      if (profile) {
        const newXp = (profile.xp || 0) + 50;
        let newRank = profile.rank || 'Novice';
        if (newXp >= 1000) newRank = 'Director of Photography';
        else if (newXp >= 300) newRank = 'Advanced Shooter';

        await getSupabase()
          .from('profiles')
          .update({ xp: newXp, rank: newRank })
          .eq('id', pendingOrder.user_id);
      }

      // Record sale if it is a creator's product
      const { data: productData } = await getSupabase()
        .from('products')
        .select('creator, creator_email, creator_id')
        .eq('id', pendingOrder.product_id)
        .single();

      if (productData) {
        let sellerId = productData.creator_id;
        if (!sellerId && productData.creator_email) {
          const { data: sellerProfile } = await getSupabase()
            .from('profiles')
            .select('id')
            .eq('email', productData.creator_email)
            .single();
          if (sellerProfile) sellerId = sellerProfile.id;
        }

        if (sellerId) {
          const { error: saleError } = await getSupabase()
            .from('sales')
            .insert({
              id: `TX-${orderCode}`,
              product_id: pendingOrder.product_id,
              product_name: pendingOrder.product_name,
              price: pendingOrder.price,
              buyer_name: profile ? (profile.name || 'Khách') : 'Khách',
              buyer_email: profile ? (profile.email || 'guest@lumenforge.com') : 'guest@lumenforge.com',
              seller_id: sellerId,
              status: 'completed'
            });
          
          if (saleError) {
            console.error('[PAYOS WEBHOOK] Error inserting sale log:', saleError);
          }

          // Move product status to testing/testing if not already approved/submitted
          await getSupabase()
            .from('products')
            .update({ status: 'testing' })
            .eq('id', pendingOrder.product_id)
            .in('status', ['draft']);
        }
      }

      // Mark pending order as completed
      await getSupabase()
        .from('pending_orders')
        .update({ status: 'completed' })
        .eq('order_code', orderCode);

      return res.status(200).json({ success: true, message: 'Purchase recorded' });
    }

    return res.status(200).json({ success: true, message: 'Webhook received but payment not completed' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
