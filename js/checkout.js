/* ==========================================================================
   LUMENFORGE — Live-ready Checkout Flow (VietQR & Creator Integration)
   ========================================================================== */

// Product Metadata Mapper for Official Products
const PRODUCT_MAP = {
  'starter-kit-pro': {
    name: 'LumenForge Starter Kit (Pro Edition)',
    title: 'LumenForge Starter Kit (Pro Edition)',
    type: 'Presets & Guides (ZIP)',
    link: 'downloads/lumenforge-starter-kit-pro.zip'
  },
  'free-kit': {
    name: 'LumenForge Starter Kit (Free Edition)',
    title: 'LumenForge Starter Kit (Free Edition)',
    type: 'Presets & Guides (ZIP)',
    link: 'downloads/lumenforge-starter-kit-free.zip'
  },
  'bundle-starter': { 
    name: 'Creator Starter Bundle', 
    title: 'Creator Starter Bundle',
    type: 'Bundle', 
    link: 'downloads/creator-starter-bundle.zip' 
  },
  'ebook-chiaroscuro': { 
    name: 'Bậc thầy Chiaroscuro: Nghệ thuật điêu khắc bóng tối', 
    title: 'Bậc thầy Chiaroscuro: Nghệ thuật điêu khắc bóng tối',
    type: 'Ebook (PDF)', 
    link: 'ebook-reader.html?book=chiaroscuro'
  },
  'ebook-color': { 
    name: 'Tâm lý học Màu sắc trong Điện ảnh', 
    title: 'Tâm lý học Màu sắc trong Điện ảnh',
    type: 'Ebook (PDF)', 
    link: 'ebook-reader.html?book=color'
  },
  'preset-film': { 
    name: 'Analog Film Emulation Pack (10 Presets)', 
    title: 'Analog Film Emulation Pack (10 Presets)',
    type: 'Presets & LUTs', 
    link: 'downloads/analog-film-pack.zip' 
  },
  'preset-cyberpunk': { 
    name: 'Cyberpunk Neon Nights (5 LUTs)', 
    title: 'Cyberpunk Neon Nights (5 LUTs)',
    type: 'LUTs (.CUBE)', 
    link: 'downloads/cyberpunk-neon-luts.zip' 
  },
  'pro-monthly': {
    name: 'LumenForge PRO (1-Month Membership)',
    title: 'LumenForge PRO (1-Month Membership)',
    type: 'Membership',
    link: 'pro-hub.html?status=active'
  },
  'pro-annual': {
    name: 'LumenForge PRO (1-Year Membership)',
    title: 'LumenForge PRO (1-Year Membership)',
    type: 'Membership',
    link: 'pro-hub.html?status=active'
  },
  'pro-lifetime': {
    name: 'LumenForge PRO (Lifetime Membership)',
    title: 'LumenForge PRO (Lifetime Membership)',
    type: 'Membership',
    link: 'pro-hub.html?status=active'
  }
};

// Async helper to get product metadata from Database (Supabase) or Local Storage fallback
async function getProductMetadata(productId) {
  if (PRODUCT_MAP[productId]) {
    return { ...PRODUCT_MAP[productId], id: productId, isCustom: false };
  }

  // Check Supabase if online
  if (window.lfSupabase && window.lfSupabase.isOnline) {
    try {
      const { data } = await window.lfSupabase.client
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (data) {
        return {
          id: data.id,
          name: data.name,
          title: data.name,
          type: data.type === 'ebook' ? 'Ebook (PDF)' : data.type === 'preset' ? 'Presets & LUTs' : 'Video LUTs (.CUBE)',
          link: data.file_link || '#',
          isCustom: true,
          creator: data.creator,
          creatorEmail: data.creator_email,
          bankName: data.bank_name,
          bankAccount: data.bank_account,
          bankOwner: data.bank_owner,
          momoNumber: data.momo_number,
          price: data.price
        };
      }
    } catch (e) {
      console.error('[CHECKOUT] Error loading product from Supabase:', e);
    }
  }

  // Fallback to local storage
  const customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
  const customProduct = customProducts.find(p => p.id === productId);
  if (customProduct) {
    return {
      id: customProduct.id,
      name: customProduct.name,
      title: customProduct.name,
      type: customProduct.type === 'ebook' ? 'Ebook (PDF)' : customProduct.type === 'preset' ? 'Presets & LUTs' : 'Video LUTs (.CUBE)',
      link: customProduct.fileLink || '#',
      isCustom: true,
      creator: customProduct.creator,
      creatorEmail: customProduct.creatorEmail,
      bankName: customProduct.bankName,
      bankAccount: customProduct.bankAccount,
      bankOwner: customProduct.bankOwner,
      momoNumber: customProduct.momoNumber,
      price: customProduct.price
    };
  }

  return { id: productId, name: productId, title: productId, type: 'Digital Publication', link: '#', isCustom: false };
}

async function openCheckoutModal(productId, priceVnd) {
  // Fetch product metadata asynchronously
  const product = await getProductMetadata(productId);
  
  // Check if modal already exists
  if (document.getElementById('lf-checkout-modal')) {
    document.getElementById('lf-checkout-modal').remove();
  }

  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceVnd);

  // Default Central Payout Account (Henry's Bank)
  const defaultPay = window.PLATFORM_PAYMENT || {};
  let BANK_ID = defaultPay.bankId || 'MSB'; 
  let ACCOUNT_NO = defaultPay.accountNo || '04201013810536';
  let ACCOUNT_OWNER = defaultPay.accountOwner || 'TRAN TIEN THONG';
  let MOMO_NO = defaultPay.momoNo || '0708450246';
  let ADD_INFO = `LF ${productId}`;
  let isCreatorProduct = product.isCustom;
  let creatorName = product.creator || '';

  if (isCreatorProduct) {
    BANK_ID = product.bankName || BANK_ID;
    ACCOUNT_NO = product.bankAccount || ACCOUNT_NO;
    ACCOUNT_OWNER = (product.bankOwner || ACCOUNT_OWNER).toUpperCase();
    MOMO_NO = product.momoNumber || MOMO_NO;
    // Format message tag for bank transfer: e.g. "LF CREATOR123"
    const cleanId = product.id.replace('prod-', '').substring(0, 6).toUpperCase();
    ADD_INFO = `LF ${cleanId}`;
  }

  const TEMPLATE = 'compact';
  // VietQR generation API (Free service provided by VietQR.io)
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${priceVnd}&addInfo=${encodeURIComponent(ADD_INFO)}`;

  // Check live payment gateway configuration
  const gateway = window.LIVE_GATEWAY || {};
  const hasGateway = !!(gateway.provider && gateway.createPaymentLinkUrl);
  const gatewayLabel = (gateway.provider || '').toLowerCase() === 'stripe' ? 'Thẻ Quốc Tế (Stripe)' : 'Cổng Tự Động (PayOS)';

  let tabsHtml = `
    <div style="display: flex; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
      <button onclick="switchTab('tab-vietqr')" id="btn-tab-vietqr" style="background: none; border: none; color: var(--accent-amber); font-weight: bold; cursor: pointer; padding: 5px; font-size: 0.9rem; font-family: var(--font-mono);">Ngân hàng (VietQR)</button>
      <button onclick="switchTab('tab-momo')" id="btn-tab-momo" style="background: none; border: none; color: var(--text-dim); font-weight: bold; cursor: pointer; padding: 5px; font-size: 0.9rem; font-family: var(--font-mono);">Ví Điện Tử</button>
      ${hasGateway ? `
        <button onclick="switchTab('tab-gateway')" id="btn-tab-gateway" style="background: none; border: none; color: var(--text-dim); font-weight: bold; cursor: pointer; padding: 5px; font-size: 0.9rem; font-family: var(--font-mono);">${gatewayLabel}</button>
      ` : ''}
    </div>
  `;

  let gatewayTabContent = '';
  if (hasGateway) {
    gatewayTabContent = `
      <!-- Tab Content: Live Auto Gateway -->
      <div id="tab-gateway" style="text-align: center; display: none; padding: 10px 0;">
        <div style="width: 80px; height: 80px; background: rgba(0, 212, 170, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; border: 1.5px solid var(--accent-cyan);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
        </div>
        <div style="font-size: 1rem; color: #fff; font-weight: bold; margin-bottom: 5px;">Thanh toán qua ${(gateway.provider || '').toUpperCase() === 'STRIPE' ? 'Stripe Gateway' : 'Cổng PayOS'}</div>
        <p style="font-size: 0.8rem; color: var(--text-secondary); max-width: 250px; margin: 0 auto 15px; line-height: 1.4;">Hệ thống sẽ tạo hóa đơn bảo mật. Xác nhận đơn hàng tự động ngay sau khi hoàn tất thanh toán.</p>
      </div>
    `;
  }

  const modalHtml = `
    <div id="lf-checkout-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); opacity: 0; transition: opacity 0.3s;">
      <div style="background: var(--bg-card); width: 90%; max-width: 800px; border-radius: 16px; border: 1px solid var(--border-color); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <div style="padding: 20px 30px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);">
          <h3 style="margin: 0; font-size: 1.25rem; font-family: var(--font-heading);">
            Thanh toán An toàn ${isCreatorProduct ? '<span style="color: var(--accent-cyan); font-size: 0.8rem; border: 1px solid var(--accent-cyan); padding: 2px 6px; border-radius: 4px; margin-left: 10px;">DIRECT PAYOUT TO CREATOR</span>' : ''}
          </h3>
          <button onclick="closeCheckoutModal()" style="background: none; border: none; color: var(--text-dim); font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>

        <div style="display: flex; flex-direction: row; flex-wrap: wrap;">
          
          <!-- Left: Order Summary -->
          <div style="flex: 1; padding: 30px; border-right: 1px solid var(--border-color); background: rgba(0,0,0,0.2);">
            <h4 style="color: var(--text-dim); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; font-family: var(--font-mono);">Thông tin Đơn hàng</h4>
            <div style="font-size: 1.2rem; margin-bottom: 5px; font-weight: bold; color: #fff;">
              ${product.name}
            </div>
            ${isCreatorProduct ? `<div style="font-size: 0.85rem; color: var(--accent-cyan); margin-bottom: 15px;">Tác giả: ${creatorName}</div>` : ''}
            <div style="font-size: 2rem; color: var(--accent-amber); font-weight: bold; margin-bottom: 20px; font-family: var(--font-mono);">${formattedPrice}</div>
            
            <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px;">
              Giao dịch chuyển khoản thủ công được xác thực thủ công. File tải sẽ được kích hoạt tại Dashboard của bạn ngay sau khi chúng tôi xác nhận giao dịch thành công.
            </p>

            <div style="background: rgba(245, 166, 35, 0.1); border-left: 3px solid var(--accent-amber); padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 15px;">
              <h5 style="margin: 0 0 5px 0; font-size: 0.95rem; color: var(--accent-amber);">Hướng dẫn thanh toán</h5>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Hoàn tất chuyển khoản ngân hàng hoặc Ví điện tử ở cột bên phải với nội dung chính xác. Đơn hàng chuyển khoản sẽ được nhân viên duyệt thủ công trong 1-4 giờ.</p>
            </div>
          </div>

          <!-- Right: Payment Methods & Action Column -->
          <div id="checkout-interactive-col" style="flex: 1; padding: 30px; display: flex; flex-direction: column; justify-content: space-between;">
            
            <div>
              <!-- Tabs -->
              ${tabsHtml}

              <!-- Tab Content: VietQR -->
              <div id="tab-vietqr" style="text-align: center; display: block;">
                <img src="${qrUrl}" alt="VietQR" style="width: 200px; height: 200px; border-radius: 8px; border: 1px solid #fff; padding: 5px; background: #fff; margin-bottom: 15px; box-shadow: 0 0 15px rgba(255,255,255,0.1);">
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 4px;">Ngân hàng: <strong>${BANK_ID}</strong></div>
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 4px;">Số tài khoản: <strong>${ACCOUNT_NO}</strong></div>
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 4px;">Chủ tài khoản: <strong>${ACCOUNT_OWNER}</strong></div>
                <div style="font-size: 0.8rem; color: var(--text-dim); margin-top: 10px; font-family: var(--font-mono);">Nội dung chuyển khoản: <strong style="color: var(--accent-amber);">${ADD_INFO}</strong></div>
              </div>

              <!-- Tab Content: MoMo -->
              <div id="tab-momo" style="text-align: center; display: none;">
                <div style="width: 200px; height: 200px; background: linear-gradient(135deg, #a50064 0%, #7d004b 100%); color: #fff; border-radius: 8px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-direction: column; padding: 15px; box-shadow: 0 5px 15px rgba(165,0,100,0.3); box-sizing: border-box;">
                  <div style="font-size: 0.85rem; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Chuyển ví MoMo</div>
                  <div style="font-size: 1.5rem; margin: 15px 0; font-family: var(--font-mono);">${MOMO_NO}</div>
                  <div style="font-size: 0.8rem; font-weight: normal; opacity: 0.85;">Người nhận: ${ACCOUNT_OWNER}</div>
                  <div style="font-size: 0.8rem; font-weight: normal; margin-top: 5px;">Chuyển đúng: ${formattedPrice}</div>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">SĐT Ví nhận: <strong>${MOMO_NO}</strong></div>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">Nội dung CK: <strong style="color: var(--accent-amber);">${ADD_INFO}</strong></div>
              </div>

              ${gatewayTabContent}
            </div>

            <!-- Step 2: Email form -->
            <div style="margin-top: 25px; border-top: 1px dashed var(--border-color); padding-top: 20px;">
              <h5 style="margin: 0 0 10px 0; font-size: 0.95rem; color: var(--accent-cyan); font-family: var(--font-mono);">Bước 2: Email nhận hàng</h5>
              <input type="email" id="checkout-email" value="${lfAuth.isLoggedIn() ? lfAuth.currentUser.email : ''}" placeholder="Nhập email của bạn (Ví dụ: name@gmail.com)" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: 6px; color: #fff; margin-bottom: 15px; font-family: inherit; box-sizing: border-box;">
              
              <button id="btn-submit-checkout" onclick="submitCheckout('${productId}', ${priceVnd}, '${ADD_INFO}')" class="btn-primary" style="width: 100%; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; border: none; font-size: 0.95rem;">
                Tôi đã chuyển khoản thành công
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Trigger fade in
  setTimeout(() => {
    const modal = document.getElementById('lf-checkout-modal');
    if (modal) modal.style.opacity = '1';
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
  const tabs = ['tab-vietqr', 'tab-momo', 'tab-gateway'];
  tabs.forEach(t => {
    const el = document.getElementById(t);
    const btn = document.getElementById('btn-' + t);
    if (el) el.style.display = 'none';
    if (btn) {
      btn.style.color = 'var(--text-dim)';
    }
  });

  const activeTab = document.getElementById(tabId);
  const activeBtn = document.getElementById('btn-' + tabId);
  if (activeTab) activeTab.style.display = 'block';
  if (activeBtn) {
    activeBtn.style.color = 'var(--accent-amber)';
  }

  // Update button text based on payment tab selection
  const submitBtn = document.getElementById('btn-submit-checkout');
  if (submitBtn) {
    if (tabId === 'tab-gateway') {
      submitBtn.innerHTML = 'Tiếp tục thanh toán tự động &rarr;';
    } else {
      submitBtn.innerHTML = 'Tôi đã chuyển khoản thành công';
    }
  }
}

async function initiateLiveGatewayPayment(productId, priceVnd, email, addInfo) {
  const btn = document.getElementById('btn-submit-checkout');
  const originalText = btn.innerText;
  btn.disabled = true;
  btn.innerText = 'Đang khởi tạo cổng thanh toán...';

  try {
    const gateway = window.LIVE_GATEWAY || {};
    
    // We auto-register the user if not logged in to make download seamless
    if (!lfAuth.isLoggedIn()) {
      await lfAuth.login(email, 'password123');
    }

    const productMeta = await getProductMetadata(productId);

    const response = await fetch(gateway.createPaymentLinkUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: productId,
        productName: productMeta.name,
        productType: productMeta.type,
        productLink: productMeta.link,
        price: priceVnd,
        userId: lfAuth.currentUser.id,
        returnUrl: window.location.origin + '/dashboard.html?payment=success&product_id=' + productId,
        cancelUrl: window.location.href + '?payment=cancel'
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || errData.message || `Lỗi từ server (${response.status})`);
    }

    const data = await response.json();
    if (data.checkoutUrl) {
      // Redirect user to Stripe or PayOS secure page
      window.location.href = data.checkoutUrl;
    } else {
      throw new Error('Không nhận được link thanh toán từ cổng');
    }
  } catch (err) {
    console.error('[GATEWAY CHECKOUT] Error:', err);
    alert('Không thể kết nối cổng thanh toán tự động:\n' + err.message + '\n\nVui lòng thử phương thức chuyển khoản ngân hàng VietQR thủ công.');
    btn.disabled = false;
    btn.innerText = originalText;
  }
}

async function submitCheckout(productId, priceVnd, addInfo) {
  const email = document.getElementById('checkout-email').value.trim();
  if (!email || !email.includes('@')) {
    alert('Vui lòng nhập Email hợp lệ để nhận File!');
    return;
  }

  // Check if Gateway tab is active
  const tabGateway = document.getElementById('tab-gateway');
  const isGatewayTab = tabGateway && tabGateway.style.display === 'block';

  if (isGatewayTab) {
    initiateLiveGatewayPayment(productId, priceVnd, email, addInfo);
    return;
  }

  const interactiveCol = document.getElementById('checkout-interactive-col');
  if (!interactiveCol) return;

  const refCode = `LF-${Math.floor(100000 + Math.random() * 900000)}`;

  // Log to console for dev visibility
  console.log(`%c[COMMERCIAL PAYMENT WEBHOOK] Order Initiated: ${refCode}`, 'color: #00b4ff; font-weight: bold;');
  console.log({
    event: 'order.created',
    ref: refCode,
    productId: productId,
    priceVnd: priceVnd,
    customerEmail: email,
    timestamp: new Date().toISOString()
  });

  // Inject CSS Keyframes for pulse animation if missing
  if (!document.getElementById('lf-checkout-anim-style')) {
    const style = document.createElement('style');
    style.id = 'lf-checkout-anim-style';
    style.innerHTML = `
      @keyframes pulse-ring {
        0% { transform: scale(0.95); opacity: 1; }
        100% { transform: scale(1.3); opacity: 0; }
      }
      @keyframes checkmark {
        0% { stroke-dashoffset: 50; stroke-dasharray: 50; }
        100% { stroke-dashoffset: 0; stroke-dasharray: 50; }
      }
    `;
    document.head.appendChild(style);
  }

  // Auto-login if not logged in
  if (typeof lfAuth !== 'undefined' && !lfAuth.isLoggedIn()) {
    await lfAuth.login(email, 'password123');
  }

  const adminConfig = window.LUMENFORGE_ADMIN_CONFIG || { devModeAllowed: true };
  const isDevMode = adminConfig.devModeAllowed && (localStorage.getItem('lf_dev_mode') === 'true' || window.location.search.includes('dev=true'));

  if (isDevMode) {
    // Swap Column with Interactive Polling/Simulation UI
    interactiveCol.innerHTML = `
      <div style="text-align: center; padding: 20px 0; display: flex; flex-direction: column; justify-content: center; height: 100%; box-sizing: border-box;">
        <div style="position: relative; width: 85px; height: 85px; margin: 0 auto 20px;">
          <!-- Pulsing Ring -->
          <div style="position: absolute; border: 4px solid var(--accent-cyan, #00d4aa); border-radius: 50%; width: 100%; height: 100%; animation: pulse-ring 1.5s infinite; box-sizing: border-box;"></div>
          <!-- Inner Spinner Icon -->
          <div style="position: absolute; width: 65px; height: 65px; top: 10px; left: 10px; background: rgba(0, 212, 255, 0.08); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan, #00d4aa)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 3s linear infinite;">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
          </div>
        </div>

        <h4 style="color: #fff; margin: 0 0 10px 0; font-size: 1.15rem; font-family: var(--font-heading);">Đang kiểm tra Giao dịch...</h4>
        <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; margin-bottom: 25px; max-width: 320px; margin-left: auto; margin-right: auto;">
          Cổng thanh toán đang lắng nghe tín hiệu chuyển khoản ngân hàng với nội dung <strong style="color: var(--accent-amber); font-family: monospace;">${addInfo}</strong>.
        </p>
        
        <div style="background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; box-sizing: border-box;">
          <span style="font-size: 0.7rem; color: var(--text-dim); display: block; margin-bottom: 10px; font-family: var(--font-mono); letter-spacing: 0.5px;">🛠️ CHẾ ĐỘ NHÀ PHÁT TRIỂN / SANDBOX ACTIVE</span>
          <button id="btn-simulate-webhook" onclick="triggerSimulatedPayment('${productId}', ${priceVnd}, '${email}', '${refCode}')" class="btn-primary" style="padding: 12px; font-size: 0.85rem; width: 100%; border-radius: 6px; font-weight: bold; background: #10b981; border: none; color: #000; cursor: pointer; transition: all 0.3s; text-transform: uppercase;">
            Kích hoạt Webhook giả lập
          </button>
        </div>
      </div>
    `;
  } else {
    // Normal honest manual transfer flow: record order as 'pending'
    if (typeof lfAuth !== 'undefined') {
      try {
        const productMeta = await getProductMetadata(productId);
        await lfAuth.addPurchase(productId, {
          name: productMeta.name,
          type: productMeta.type,
          link: productMeta.link,
          price: priceVnd
        }, 'pending');
      } catch (err) {
        console.error('[CHECKOUT] Failed to record pending order:', err);
      }
    }

    interactiveCol.innerHTML = `
      <div style="text-align: center; padding: 15px 0; display: flex; flex-direction: column; justify-content: center; height: 100%; box-sizing: border-box;">
        <div style="background: rgba(245, 166, 35, 0.1); width: 65px; height: 65px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; border: 2px solid var(--accent-amber); box-sizing: border-box;">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <h3 style="color: var(--accent-amber); margin: 0 0 8px 0; font-size: 1.25rem; font-family: var(--font-heading); font-weight: bold;">Đơn Hàng Chờ Xác Nhận</h3>
        <p style="color: var(--text-secondary); font-size: 0.82rem; line-height: 1.5; margin-bottom: 15px; max-width: 320px; margin-left: auto; margin-right: auto; text-align: left;">
          Cảm ơn bạn! Thông tin giao dịch chuyển khoản đã được tiếp nhận. Đơn hàng đang được kiểm tra thủ công.
          <br><br>
          • File tải sẽ được kích hoạt tại <strong>Dashboard</strong> ngay sau khi chúng tôi xác nhận giao dịch thành công.
          <br>
          • Email thông báo hướng dẫn sẽ được gửi tới: <strong>${email}</strong>.
          <br>
          • Nội dung chuyển khoản cần đối soát: <strong>${addInfo}</strong>.
          <br><br>
          Nếu cần hỗ trợ gấp, vui lòng gửi bill qua mail <strong>support@lumenforge.studio</strong> hoặc liên hệ <strong>0708450246</strong>.
        </p>
        <a href="dashboard.html" class="btn-primary" style="padding: 12px; font-size: 0.9rem; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; display: block; border: none; cursor: pointer; background: var(--accent-cyan); color: #000;">
          Vào Dashboard của bạn
        </a>
      </div>
    `;
  }
}

// Global scope expose for checkout trigger
async function triggerSimulatedPayment(productId, priceVnd, email, refCode) {
  const btn = document.getElementById('btn-simulate-webhook');
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Đang đồng bộ cơ sở dữ liệu...";
    btn.style.background = '#888';
  }

  // 1. Authenticate user asynchronously if not already logged in
  if (!lfAuth.isLoggedIn()) {
    const loginResult = await lfAuth.login(email, 'password123'); // Easy account creation
    if (loginResult && loginResult.success === false) {
      alert('Không thể tạo tài khoản: ' + loginResult.error);
      if (btn) {
        btn.disabled = false;
        btn.innerText = "Kích hoạt Webhook giả lập";
        btn.style.background = '#10b981';
      }
      return;
    }
  }

  // 2. Load product metadata to get actual download links and title
  const productMeta = await getProductMetadata(productId);

  // 3. Save purchase to local state & cloud DB
  await lfAuth.addPurchase(productId, {
    name: productMeta.name,
    type: productMeta.type,
    link: productMeta.link,
    price: priceVnd
  });

  // 4. Record sales log if it is a creator's custom product
  if (productMeta.isCustom) {
    // Record to database or local storage
    if (window.lfSupabase && window.lfSupabase.isOnline) {
      await window.lfSupabase.recordSale({
        id: refCode,
        productId: productId,
        productName: productMeta.name,
        price: priceVnd,
        buyerName: email.split('@')[0],
        buyerEmail: email
      });
      // Move status from draft/testing to testing
      await window.lfSupabase.updateProductStatus(productId, 'testing');
    } else {
      // Local Storage mock sales
      const sales = JSON.parse(localStorage.getItem('lf_creator_sales') || '[]');
      sales.push({
        id: refCode,
        productId: productId,
        productName: productMeta.name,
        price: priceVnd,
        buyerName: email.split('@')[0],
        buyerEmail: email,
        timestamp: Date.now(),
        status: 'completed'
      });
      localStorage.setItem('lf_creator_sales', JSON.stringify(sales));

      // Local product status change
      const customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
      const idx = customProducts.findIndex(p => p.id === productId);
      if (idx > -1 && (!customProducts[idx].status || customProducts[idx].status === 'draft')) {
        customProducts[idx].status = 'testing';
        localStorage.setItem('lf_custom_products', JSON.stringify(customProducts));
      }
    }
  }

  // 5. Show Success Screen
  const interactiveCol = document.getElementById('checkout-interactive-col');
  if (interactiveCol) {
    interactiveCol.innerHTML = `
      <div style="text-align: center; padding: 30px 0; display: flex; flex-direction: column; justify-content: center; height: 100%; box-sizing: border-box;">
        <div style="background: rgba(16, 185, 129, 0.1); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; border: 2px solid #10b981; box-sizing: border-box;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray: 50; stroke-dashoffset: 50; animation: checkmark 0.6s ease-in-out forwards;">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 style="color: #10b981; margin: 0 0 10px 0; font-size: 1.4rem; font-family: var(--font-heading);">Thành công!</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.6; margin-bottom: 20px; max-width: 280px; margin-left: auto; margin-right: auto;">
          Giao dịch <strong>${refCode}</strong> đã được thanh toán. File đã được kích hoạt trong Dashboard của bạn.
        </p>
        <span style="font-size: 0.75rem; color: var(--text-dim); font-family: var(--font-mono); display: block;">Chuyển hướng sau 2 giây... ⏳</span>
      </div>
    `;
  }

  console.log(`%c[COMMERCIAL PAYMENT SUCCESS] Approved for: ${email}`, 'color: #10b981; font-weight: bold;');

  // Redirect
  setTimeout(() => {
    closeCheckoutModal();
    window.location.href = 'dashboard.html';
  }, 2000);
}

// Expose functions globally for layout execution
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.switchTab = switchTab;
window.submitCheckout = submitCheckout;
window.triggerSimulatedPayment = triggerSimulatedPayment;
