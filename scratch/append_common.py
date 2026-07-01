import os

file_path = 'e:/Antigravity project/LumenForge/js/common.js'

with open(file_path, 'a', encoding='utf-8') as f:
    f.write('''

/* ==========================================================================
   LUMENFORGE COMMERCIAL: SERVICE WORKER & PWA SUPPORT
   ========================================================================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Attempt to register service worker. The path is always root '/sw.js'
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.log('[PWA] ServiceWorker registration failed:', error);
      });
  });
}

/* ==========================================================================
   LUMENFORGE COMMERCIAL: LIVE SALES NOTIFICATION (SOCIAL PROOF)
   ========================================================================== */
(function initLiveSalesNotifications() {
  // Only initialize on actual frontend pages, not admin
  if (window.location.pathname.includes('admin.html')) return;

  const names = ['Tuấn A.', 'Hoàng Đ.', 'Nhật M.', 'Quang V.', 'Lê H.', 'Trần K.', 'Ngọc T.', 'Bảo N.'];
  const products = [
    { name: 'Creator Starter Bundle', link: 'creator-starter-bundle.html', img: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=150&auto=format&fit=crop' },
    { name: 'Gói LumenForge PRO (1 Năm)', link: 'pro-hub.html', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=150&auto=format&fit=crop' },
    { name: 'Cyberpunk Neon Nights LUTs', link: 'cyberpunk-neon-nights.html', img: 'https://images.unsplash.com/photo-1555861496-faa3e1174f76?q=80&w=150&auto=format&fit=crop' },
    { name: 'Ebook Tâm lý học Màu sắc', link: 'ebook-color-psychology.html', img: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=150&auto=format&fit=crop' }
  ];

  // Inject CSS for the popup
  const style = document.createElement('style');
  style.innerHTML = `
    .lf-sales-popup {
      position: fixed;
      bottom: -100px;
      left: 20px;
      background: rgba(15, 15, 20, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 9999;
      opacity: 0;
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      pointer-events: none;
      max-width: 300px;
    }
    .lf-sales-popup.show {
      bottom: 20px;
      opacity: 1;
      pointer-events: auto;
    }
    .lf-sales-img {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid var(--accent-gold, rgba(212, 175, 55, 0.5));
    }
    .lf-sales-content {
      display: flex;
      flex-direction: column;
    }
    .lf-sales-text {
      color: #fff;
      font-size: 0.85rem;
      margin: 0 0 4px 0;
      line-height: 1.3;
    }
    .lf-sales-time {
      color: var(--text-dim, #888);
      font-size: 0.75rem;
      font-family: var(--font-mono, monospace);
    }
    .lf-sales-product {
      color: var(--accent-cyan, #00f0ff);
      text-decoration: none;
      font-weight: bold;
    }
    .lf-sales-product:hover {
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);

  // Create popup DOM
  const popup = document.createElement('div');
  popup.className = 'lf-sales-popup';
  document.body.appendChild(popup);

  function triggerNotification() {
    if (document.hidden) return; // Don't show if user is on another tab

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomTime = Math.floor(Math.random() * 15) + 1; // 1 to 15 mins ago

    popup.innerHTML = `
      <img src="${randomProduct.img}" alt="Product" class="lf-sales-img">
      <div class="lf-sales-content">
        <p class="lf-sales-text"><strong>${randomName}</strong> vừa mua <br><a href="${randomProduct.link}" class="lf-sales-product">${randomProduct.name}</a></p>
        <span class="lf-sales-time">Khoảng ${randomTime} phút trước</span>
      </div>
    `;

    popup.classList.add('show');
    
    // Track impression
    if (typeof trackEvent === 'function') {
      trackEvent('sales_notification_shown', { product: randomProduct.name });
    }

    setTimeout(() => {
      popup.classList.remove('show');
    }, 5000); // Hide after 5 seconds
  }

  // Initial delay (15s) then trigger every 45-60s
  setTimeout(() => {
    triggerNotification();
    setInterval(() => {
      triggerNotification();
    }, 45000 + Math.random() * 15000);
  }, 15000);
})();
''')
print("Successfully appended PWA and Live Sales logic to js/common.js")
