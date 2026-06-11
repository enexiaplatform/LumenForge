/* ==========================================================================
   LUMENFORGE — Local Checkout Flow (VN Market)
   ========================================================================== */

function openCheckoutModal(productId, priceVnd) {
  // Check if modal already exists
  if (document.getElementById('lf-checkout-modal')) {
    document.getElementById('lf-checkout-modal').remove();
  }

  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceVnd);

  // Bank details for VietQR
  const BANK_ID = 'MSB'; // Ngân hàng Hàng Hải (MSB)
  const ACCOUNT_NO = '04201013810536'; // Số tài khoản MSB của user
  const TEMPLATE = 'compact';
  const ADD_INFO = `LF ${productId}`;
  
  // VietQR generation API
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${priceVnd}&addInfo=${encodeURIComponent(ADD_INFO)}`;

  const modalHtml = `
    <div id="lf-checkout-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); opacity: 0; transition: opacity 0.3s;">
      <div style="background: var(--bg-card); width: 90%; max-width: 800px; border-radius: 16px; border: 1px solid var(--border-color); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <div style="padding: 20px 30px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);">
          <h3 style="margin: 0; font-size: 1.25rem;">Thanh toán An toàn</h3>
          <button onclick="closeCheckoutModal()" style="background: none; border: none; color: var(--text-dim); font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>

        <div style="display: flex; flex-direction: row; flex-wrap: wrap;">
          
          <!-- Left: Order Summary -->
          <div style="flex: 1; padding: 30px; border-right: 1px solid var(--border-color); background: rgba(0,0,0,0.2);">
            <h4 style="color: var(--text-dim); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Thông tin Đơn hàng</h4>
            <div style="font-size: 1.1rem; margin-bottom: 5px; font-weight: bold;">${productId}</div>
            <div style="font-size: 2rem; color: var(--accent-amber); font-weight: bold; margin-bottom: 20px;">${formattedPrice}</div>
            
            <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px;">
              Hệ thống sẽ tự động gửi File gốc (PDF/Presets) qua Email cho bạn trong vòng 5-10 phút sau khi chuyển khoản thành công.
            </p>

            <div style="background: rgba(245, 166, 35, 0.1); border-left: 3px solid var(--accent-amber); padding: 15px; border-radius: 0 8px 8px 0;">
              <h5 style="margin: 0 0 10px 0; font-size: 0.95rem;">Bước 1: Quét mã QR</h5>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Mở App Ngân hàng, MoMo hoặc ZaloPay để quét mã QR bên cạnh. Số tiền và lời nhắn sẽ được điền tự động.</p>
            </div>
          </div>

          <!-- Right: Payment Methods -->
          <div style="flex: 1; padding: 30px;">
            
            <!-- Tabs -->
            <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
              <button onclick="switchTab('tab-vietqr')" id="btn-tab-vietqr" style="background: none; border: none; color: var(--accent-amber); font-weight: bold; cursor: pointer; padding: 5px;">Ngân hàng (VietQR)</button>
              <button onclick="switchTab('tab-momo')" id="btn-tab-momo" style="background: none; border: none; color: var(--text-dim); font-weight: bold; cursor: pointer; padding: 5px;">MoMo / Ví</button>
            </div>

            <!-- Tab Content: VietQR -->
            <div id="tab-vietqr" style="text-align: center; display: block;">
              <img src="${qrUrl}" alt="VietQR" style="width: 200px; height: 200px; border-radius: 8px; border: 1px solid #fff; padding: 5px; background: #fff; margin-bottom: 15px;">
              <div style="font-size: 0.9rem; color: var(--text-secondary);">Ngân hàng: <strong>MSB (Ngân hàng Hàng Hải)</strong></div>
              <div style="font-size: 0.9rem; color: var(--text-secondary);">Số tài khoản: <strong>04201013810536</strong></div>
            </div>

            <!-- Tab Content: MoMo -->
            <div id="tab-momo" style="text-align: center; display: none;">
              <div style="width: 200px; height: 200px; background: linear-gradient(135deg, #a50064 0%, #0068ff 100%); color: #fff; border-radius: 8px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-direction: column; padding: 10px;">
                <div style="font-size: 0.85rem; opacity: 0.9;">MoMo / ZaloPay</div>
                <div style="font-size: 1.8rem; margin: 15px 0;">0708450246</div>
                <div style="font-size: 0.8rem; font-weight: normal;">Chuyển đúng số tiền: ${formattedPrice}</div>
              </div>
              <div style="font-size: 0.9rem; color: var(--text-secondary);">SĐT nhận tiền: <strong>0708.450.246</strong></div>
              <div style="font-size: 0.9rem; color: var(--text-secondary);">Nội dung CK: <strong>${ADD_INFO}</strong></div>
            </div>

            <!-- Step 2: Email form -->
            <div style="margin-top: 30px;">
              <h5 style="margin: 0 0 10px 0; font-size: 0.95rem;">Bước 2: Xác nhận Email nhận hàng</h5>
              <input type="email" id="checkout-email" placeholder="Nhập email của bạn (Ví dụ: abc@gmail.com)" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: 6px; color: #fff; margin-bottom: 15px;">
              <button onclick="submitCheckout()" class="btn-primary" style="width: 100%; padding: 12px; border-radius: 6px; font-weight: bold;">Xác nhận Đã chuyển khoản</button>
            </div>

          </div>

        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Trigger fade in
  setTimeout(() => {
    document.getElementById('lf-checkout-modal').style.opacity = '1';
  }, 10);
}

function closeCheckoutModal() {
  const modal = document.getElementById('lf-checkout-modal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 300);
  }
}

function switchTab(tabId) {
  document.getElementById('tab-vietqr').style.display = 'none';
  document.getElementById('tab-momo').style.display = 'none';
  document.getElementById('btn-tab-vietqr').style.color = 'var(--text-dim)';
  document.getElementById('btn-tab-momo').style.color = 'var(--text-dim)';

  document.getElementById(tabId).style.display = 'block';
  document.getElementById('btn-' + tabId).style.color = 'var(--accent-amber)';
}

function submitCheckout() {
  const email = document.getElementById('checkout-email').value;
  if (!email || !email.includes('@')) {
    alert('Vui lòng nhập Email hợp lệ để nhận File!');
    return;
  }
  
  alert(`Cảm ơn bạn! Hệ thống đang xác minh giao dịch.\n\nLink tải File sẽ được tự động gửi đến [${email}] ngay sau khi tiền nổi. Vui lòng kiểm tra cả hộp thư rác (Spam).`);
  closeCheckoutModal();
}
