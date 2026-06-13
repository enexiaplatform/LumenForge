const PayOS = require('@payos/node');
const { createClient } = require('@supabase/supabase-js');

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body;

    // Verify Webhook Data
    const webhookData = payos.verifyPaymentWebhookData(body);

    // If payment is successful
    if (webhookData.code === '00' || webhookData.success === true) {
      const orderCode = webhookData.orderCode;

      // Find the pending order in Supabase
      const { data: pendingOrder, error: fetchError } = await supabase
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
      const { error: insertError } = await supabase
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, rank')
        .eq('id', pendingOrder.user_id)
        .single();

      if (profile) {
        const newXp = profile.xp + 50;
        let newRank = profile.rank;
        if (newXp >= 1000) newRank = 'Director of Photography';
        else if (newXp >= 300) newRank = 'Advanced Shooter';

        await supabase
          .from('profiles')
          .update({ xp: newXp, rank: newRank })
          .eq('id', pendingOrder.user_id);
      }

      // Mark pending order as completed
      await supabase
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
