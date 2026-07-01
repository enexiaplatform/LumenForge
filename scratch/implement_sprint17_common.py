import os

file_path = 'e:/Antigravity project/LumenForge/js/common.js'

logic_to_append = '''
/* ==========================================================================
   LUMENFORGE COMMERCIAL SPRINT 17: ADVANCED E-COMMERCE
   ========================================================================== */

(function initEcommerceSupercharge() {
  if (window.location.pathname.includes('admin.html')) return;

  // 1. Affiliate Tracking System
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  if (ref) {
    localStorage.setItem('lf_affiliate_ref', ref);
    console.log(`[AFFILIATE] Captured referral code: ${ref}`);
  }

  // 2. Abandoned Cart Recovery Banner
  const abandonedProductId = localStorage.getItem('lf_abandoned_cart');
  if (abandonedProductId && typeof window.openCheckoutModal === 'function') {
    // Only show if we know the product name
    const productNames = {
      'bundle-starter': 'Creator Starter Bundle',
      'pro-annual': 'LumenForge PRO',
      'preset-cyberpunk': 'Cyberpunk LUTs',
      'preset-film': 'Analog Film Pack',
      'ebook-chiaroscuro': 'Ebook Chiaroscuro',
      'ebook-color': 'Ebook Tâm lý học Màu sắc'
    };
    
    const productName = productNames[abandonedProductId] || 'sản phẩm';
    
    const banner = document.createElement('div');
    banner.style.cssText = `
      background: linear-gradient(90deg, #d4af37, #b38b22);
      color: #000;
      text-align: center;
      padding: 10px 20px;
      font-weight: bold;
      font-size: 0.9rem;
      cursor: pointer;
      position: relative;
      z-index: 99999;
      box-shadow: 0 4px 10px rgba(212, 175, 55, 0.3);
    `;
    banner.innerHTML = `🛒 Bạn quên hoàn tất đơn hàng <strong>${productName}</strong>? Nhấn vào đây để nhận mã giảm giá 10% (Nhập: LF10).`;
    
    // Insert at very top
    document.body.insertBefore(banner, document.body.firstChild);
    
    banner.addEventListener('click', () => {
      // Logic assumes base price, in real app we fetch it
      let defaultPrice = 149000;
      if(abandonedProductId.includes('bundle')) defaultPrice = 249000;
      if(abandonedProductId.includes('pro')) defaultPrice = 990000;
      if(abandonedProductId.includes('ebook')) defaultPrice = 99000;
      
      // Re-open checkout minus 10% mock
      const discountedPrice = defaultPrice * 0.9;
      window.openCheckoutModal(abandonedProductId, discountedPrice);
    });
  }

  // 3. Exit-Intent Lead Gen Popup
  const exitIntentShown = localStorage.getItem('lf_exit_intent_shown');
  if (!exitIntentShown) {
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !localStorage.getItem('lf_exit_intent_shown')) {
        showExitIntent();
        // 24hr cooldown
        localStorage.setItem('lf_exit_intent_shown', Date.now().toString());
      }
    });
  }

  function showExitIntent() {
    const modalHtml = `
      <div id="lf-exit-intent" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 100000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(8px); opacity: 0; transition: opacity 0.4s;">
        <div style="background: var(--bg-card, #0a0a0c); width: 90%; max-width: 500px; border-radius: 16px; border: 1px solid var(--accent-gold); padding: 40px; text-align: center; box-shadow: 0 0 40px rgba(212,175,55,0.2);">
          <h2 style="color: var(--accent-gold); margin-top: 0; font-family: var(--font-heading);">KHOAN ĐÃ! 🎁</h2>
          <p style="color: #fff; font-size: 1.1rem; line-height: 1.5; margin-bottom: 25px;">Đừng vội rời đi. Nhận ngay <strong>Bộ 5 Preset Phim Nhựa Độc Quyền</strong> hoàn toàn miễn phí gửi trực tiếp vào hòm thư của bạn.</p>
          <input type="email" placeholder="Email của bạn..." style="width: 100%; padding: 12px; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.5); color: #fff; margin-bottom: 15px; box-sizing: border-box;">
          <button class="btn-primary" onclick="document.getElementById('lf-exit-intent').remove()" style="width: 100%; padding: 14px; background: var(--accent-gold); color: #000; font-weight: bold; border-radius: 6px; border: none; cursor: pointer;">NHẬN QUÀ NGAY</button>
          <button onclick="document.getElementById('lf-exit-intent').remove()" style="margin-top: 15px; background: none; border: none; color: var(--text-dim); text-decoration: underline; cursor: pointer; font-size: 0.85rem;">Không, tôi không thích quà miễn phí</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    setTimeout(() => {
      const el = document.getElementById('lf-exit-intent');
      if (el) el.style.opacity = '1';
    }, 50);
    
    if(typeof trackEvent === 'function') trackEvent('exit_intent_shown');
  }

})();
'''

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'LUMENFORGE COMMERCIAL SPRINT 17' not in content:
    with open(file_path, 'a', encoding='utf-8') as f:
        f.write(logic_to_append)
    print("Sprint 17 Common Logic appended.")
else:
    print("Sprint 17 Logic already exists in common.js")
