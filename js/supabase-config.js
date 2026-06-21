/**
 * LUMENFORGE — Supabase Connection Configuration
 * 
 * To connect a live Supabase backend:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Run the SQL schema from 'supabase_schema.sql' in the Supabase SQL Editor.
 * 3. Copy your Project URL and anon key from Project Settings -> API.
 * 4. Paste them here or use the database settings panel in the Dashboard footer.
 */

window.SUPABASE_URL = "";
window.SUPABASE_KEY = "";

// Cấu hình tài khoản thanh toán mặc định của LumenForge (cho các sản phẩm chính của hệ thống)
window.PLATFORM_PAYMENT = {
    bankId: 'MSB',                  // Tên viết tắt ngân hàng (ví dụ: MSB, VCB, MB, ACB...)
    accountNo: '04201013810536',    // Số tài khoản ngân hàng nhận tiền
    accountOwner: 'NGUYEN THE ANH',  // Tên chủ tài khoản viết hoa không dấu
    momoNo: '0708450246'            // Số điện thoại nhận ví MoMo
};

// Cấu hình cổng thanh toán tự động (Stripe / PayOS) qua Edge Functions
window.LIVE_GATEWAY = {
    provider: localStorage.getItem('lf_gateway_provider') || "",               // "payos" hoặc "stripe" hoặc "" (để dùng VietQR thủ công mặc định)
    createPaymentLinkUrl: localStorage.getItem('lf_gateway_url') || (window.location.origin + "/api/create-payment-link")    // URL của Supabase Edge Function hoặc Vercel Serverless Function
};

// Cấu hình kiểm soát phân phối và tính năng Admin
window.LUMENFORGE_ADMIN_CONFIG = {
    allowCreatorMarketplace: localStorage.getItem('lf_allow_creator_marketplace') === 'true',  // Cấu hình lưu trữ động qua localStorage
    devModeAllowed: localStorage.getItem('lf_dev_mode_allowed') !== 'false'             // Cho phép Sandbox/Dev Mode mặc định true
};


