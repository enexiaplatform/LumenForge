/* ============================================================
   LUMENFORGE — Common JavaScript
   Shared across all pages
   ============================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------------
     1. MOBILE NAVIGATION TOGGLE
     -------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const nav = document.getElementById('main-nav');
  let navOverlay = null;

  function createOverlay() {
    if (navOverlay) return;
    navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    navOverlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(navOverlay);

    navOverlay.addEventListener('click', closeMenu);
  }

  function openMenu() {
    navToggle.classList.add('active');
    navMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    createOverlay();
    requestAnimationFrame(() => {
      navOverlay.classList.add('active');
    });
  }

  function closeMenu() {
    navToggle.classList.remove('active');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
    if (navOverlay) {
      navOverlay.classList.remove('active');
    }
  }

  function toggleMenu() {
    const isOpen = navMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', toggleMenu);

    // Close menu on nav link click (mobile)
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  /* --------------------------------------------------------
     2. SCROLL ANIMATIONS (IntersectionObserver)
     -------------------------------------------------------- */
  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible'); // old logic
            entry.target.classList.add('active');  // new reveal logic
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    // Function to observe elements under a given root
    function observeElements(root) {
      if (!root) return;
      if (root.classList && (root.classList.contains('animate-on-scroll') || root.classList.contains('reveal'))) {
        observer.observe(root);
      }
      const elements = root.querySelectorAll ? root.querySelectorAll('.animate-on-scroll, .reveal') : [];
      elements.forEach(el => observer.observe(el));
    }

    // Observe initial elements
    observeElements(document.body);

    // Watch for dynamically added elements using MutationObserver
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            observeElements(node);
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /* --------------------------------------------------------
     3. ACTIVE NAV LINK
     -------------------------------------------------------- */
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Normalize both paths for comparison
      const linkPath = href.replace(/^\.\//, '');
      const pageName = currentPath.split('/').pop() || 'index.html';

      // Check for exact match or index.html equivalence
      if (
        linkPath === pageName ||
        (pageName === '' && linkPath === 'index.html') ||
        (pageName === 'index.html' && linkPath === 'index.html')
      ) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* --------------------------------------------------------
     4. SMOOTH SCROLL FOR ANCHOR LINKS
     -------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const navHeight = nav ? nav.offsetHeight : 0;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /* --------------------------------------------------------
     5. NAV BACKGROUND ON SCROLL
     -------------------------------------------------------- */
  function initNavScroll() {
    if (!nav) return;

    let ticking = false;

    function updateNav() {
      if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateNav);
        ticking = true;
      }
    }, { passive: true });

    // Run once on load
    updateNav();
  }

  /* --------------------------------------------------------
     6. MAGNETIC BUTTON EFFECT
     -------------------------------------------------------- */
  function initMagneticButtons() {
    const magnetics = document.querySelectorAll('.magnetic');
    
    magnetics.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Move button slightly towards mouse
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        // Reset
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  /* --------------------------------------------------------
     7. ARTICLE READ TRACKING
     -------------------------------------------------------- */
  function initReadTracking() {
    const articleHeader = document.querySelector('.article-header');
    if (!articleHeader) return; // Not an article page

    // Extract current path as identifier (e.g., "white-balance-science.html")
    const pathParts = window.location.pathname.split('/');
    const currentFile = pathParts[pathParts.length - 1] || 'unknown';
    
    if (currentFile !== 'unknown') {
      let readArticles = JSON.parse(localStorage.getItem('lumenforge_read_articles') || '[]');
      if (!readArticles.includes(currentFile)) {
        readArticles.push(currentFile);
        localStorage.setItem('lumenforge_read_articles', JSON.stringify(readArticles));
        
        // Also update the legacy counter for dashboard compatibility
        localStorage.setItem('lumenforge_read', readArticles.length);

        // Add 50 XP per article
        let currentXP = parseInt(localStorage.getItem('lumenforge_xp') || '0', 10);
        currentXP += 50;
        localStorage.setItem('lumenforge_xp', currentXP);
      }
    }
  }

  /* --------------------------------------------------------
     INIT
     -------------------------------------------------------- */
  function init() {
    setActiveNavLink();
    initScrollAnimations();
    initSmoothScroll();
    initNavScroll();
    initMagneticButtons();
    initReadTracking();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* ==========================================================================
   ELITE UX (Sprint 27): Custom Cursor, Active Nav, Back-to-Top
   ========================================================================== */
(function initEliteUX() {
  if (window.location.pathname.includes('admin.html')) return;

  // 1. Dynamic Active Nav
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentPath) {
      link.classList.add('nav-link-active');
    }
  });

  // 2. Custom Cinematic Cursor
  // Only init on non-touch devices
  if (window.matchMedia("(pointer: fine)").matches) {
    const dot = document.createElement('div');
    dot.className = 'lf-cursor-dot';
    
    const ring = document.createElement('div');
    ring.className = 'lf-cursor-ring';
    
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Dot follows exactly
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    // Ring follows with easing (requestAnimationFrame loop)
    function renderRing() {
      ringX += (mouseX - ringX) * 0.15; // Easing factor
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);

    // Hover states for links and buttons
    const hoverElements = document.querySelectorAll('a, button, input, textarea, select, .magnetic, .product-card');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('lf-cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('lf-cursor-hover'));
    });
  }

  // 3. Back-to-Top Button
  const b2t = document.createElement('a');
  b2t.href = 'javascript:void(0)';
  b2t.className = 'lf-b2t';
  b2t.innerHTML = '&uarr;';
  b2t.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(b2t);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      b2t.classList.add('visible');
    } else {
      b2t.classList.remove('visible');
    }
  });

  b2t.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();
  /* --------------------------------------------------------
     AUTO-ACTIVE NAVIGATION LINK
     -------------------------------------------------------- */
  function setActiveNav() {
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const targetPage = href.substring(href.lastIndexOf('/') + 1);
      link.classList.remove('active');
      if (pageName === targetPage) {
        link.classList.add('active');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
  });


/* ==========================================================================
   LUMENFORGE ANALYTICS (SIMULATED)
   ========================================================================== */
function trackEvent(eventName, eventData = {}) {
    console.log(`%c[LFA ANALYTICS] Event Logged: ${eventName}`, 'color: #00b4ff; font-weight: bold;');
    if (Object.keys(eventData).length > 0) {
        console.log(eventData);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Track page views
    trackEvent('page_view', { path: window.location.pathname });

    // Track button clicks (download, buy, play tool)
    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('a, button');
        if (!target) return;
        
        const text = (target.textContent || '').trim().toLowerCase();
        if (text.includes('tải') || text.includes('download')) {
            trackEvent('file_download_click', { url: target.href });
        } else if (text.includes('mua') || text.includes('buy')) {
            trackEvent('checkout_initiated', { text: text });
        } else if (target.classList.contains('tool-gallery-card')) {
            trackEvent('tool_opened', { url: target.href });
        }
    });
});


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
      triggerNotification();
    }, 45000 + Math.random() * 15000);
  }, 15000);
})();

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

/* ==========================================================================
   LUMENFORGE COMMERCIAL SPRINT 19: RETENTION & URGENCY
   ========================================================================== */

(function initSprint19() {
  if (window.location.pathname.includes('admin.html')) return;

  // --- 1. EVERGREEN FLASH SALE TIMER ---
  const saleEndKey = 'lf_flash_sale_end';
  let saleEndTime = localStorage.getItem(saleEndKey);
  
  // If not set or already expired, set to 2 hours 45 mins from now
  if (!saleEndTime || parseInt(saleEndTime) < Date.now()) {
    saleEndTime = Date.now() + (2 * 60 * 60 * 1000) + (45 * 60 * 1000);
    localStorage.setItem(saleEndKey, saleEndTime);
  }

  // Create Timer UI Ribbon (Global Ticker)
  const ribbon = document.createElement('div');
  ribbon.style.cssText = `
    background: rgba(10, 10, 12, 0.95);
    border-bottom: 1px solid rgba(0, 240, 255, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: var(--text-dim, #a0a0a0);
    text-align: center;
    padding: 10px 15px;
    font-size: 0.85rem;
    position: relative;
    z-index: 99998;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: var(--font-mono, monospace);
    transition: opacity 0.5s ease;
  `;
  
  // Create an inner container for the flipping content
  const tickerContent = document.createElement('div');
  tickerContent.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    transition: opacity 0.5s ease;
  `;
  ribbon.appendChild(tickerContent);
  document.body.insertBefore(ribbon, document.body.firstChild);

  // Ticker Logic
  let currentTick = 0;
  
  function updateTicker() {
    tickerContent.style.opacity = 0;
    
    setTimeout(() => {
      if (currentTick === 0) {
        // Flash Sale View
        tickerContent.innerHTML = `
          <span><span style="color:var(--accent-amber,#FFB000)">⚡</span> FLASH SALE ƯU ĐÃI PRO KẾT THÚC SAU:</span>
          <span id="lf-timer-display" style="background: rgba(0,0,0,0.8); color: #fff; padding: 3px 8px; border-radius: 4px; font-weight: bold;">00:00:00</span>
        `;
      } else {
        // Free Gift View
        tickerContent.innerHTML = `
          <span><span style="color:var(--accent-cyan,#00f0ff)">🎁</span> Tặng Miễn Phí: Starter Kit (3 Preset + PDF).</span>
          <a href="free-guide.html" style="color: var(--accent-cyan, #00f0ff); text-decoration: underline; margin-left: 10px;">Nhận Ngay &rarr;</a>
        `;
      }
      
      tickerContent.style.opacity = 1;
      currentTick = currentTick === 0 ? 1 : 0;
    }, 500); // Wait for fade out
  }

  // Initial call and rotation every 4 seconds
  updateTicker();
  setInterval(updateTicker, 4000);

  // Update timer every second
  setInterval(() => {
    const now = Date.now();
    const distance = parseInt(saleEndTime) - now;
    if (distance < 0) {
      document.getElementById('lf-timer-display').textContent = "00:00:00";
      return;
    }
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById('lf-timer-display').textContent = 
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);


  // --- 2. LUMENFORGE REWARDS (XP BADGE & POPUP) ---
  const currentXp = parseInt(localStorage.getItem('lumenforge_xp') || '0');
  
  // Inject XP Badge into Nav
  setTimeout(() => {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
      const xpBadge = document.createElement('div');
      xpBadge.style.cssText = `
        background: rgba(245, 166, 35, 0.1);
        border: 1px solid var(--accent-amber);
        color: var(--accent-amber);
        padding: 4px 12px;
        border-radius: 20px;
        font-family: var(--font-mono, monospace);
        font-size: 0.8rem;
        font-weight: bold;
        margin-left: 15px;
        display: flex;
        align-items: center;
        gap: 5px;
      `;
      xpBadge.innerHTML = `<span>⚡</span> ${currentXp} XP`;
      navMenu.appendChild(xpBadge);
    }
  }, 100);

  // Reward Check (500 XP = 20% Discount)
  if (currentXp >= 500 && !localStorage.getItem('lf_reward_claimed')) {
    setTimeout(() => {
      const modalHtml = `
        <div id="lf-reward-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 100000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(8px); opacity: 0; transition: opacity 0.4s;">
          <div style="background: var(--bg-card, #0a0a0c); width: 90%; max-width: 450px; border-radius: 16px; border: 1px solid var(--accent-amber); padding: 40px; text-align: center; box-shadow: 0 0 40px rgba(245,166,35,0.2);">
            <div style="font-size: 4rem; margin-bottom: 10px;">🏆</div>
            <h2 style="color: var(--accent-amber); margin-top: 0; font-family: var(--font-heading);">CHÚC MỪNG!</h2>
            <p style="color: #fff; font-size: 1rem; line-height: 1.5; margin-bottom: 25px;">Bạn đã cày đủ <strong>500 XP</strong> trên LumenForge. Đây là phần thưởng dành riêng cho sự chăm chỉ của bạn:</p>
            
            <div style="background: rgba(0,0,0,0.5); border: 2px dashed var(--accent-amber); padding: 15px; border-radius: 8px; margin-bottom: 25px;">
              <div style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 5px; text-transform: uppercase;">Mã giảm 20% toàn sàn</div>
              <div style="font-size: 2rem; font-family: var(--font-mono); font-weight: bold; color: var(--accent-cyan); letter-spacing: 2px;">LFVIP20</div>
            </div>
            
            <button class="btn-primary" onclick="document.getElementById('lf-reward-modal').remove(); localStorage.setItem('lf_reward_claimed', 'true');" style="width: 100%; padding: 14px; background: var(--accent-amber); color: #000; font-weight: bold; border-radius: 6px; border: none; cursor: pointer;">NHẬN THƯỞNG</button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      setTimeout(() => {
        const el = document.getElementById('lf-reward-modal');
        if (el) el.style.opacity = '1';
      }, 50);
    }, 2000);
  }

})();

/* ==========================================================================
   SENSORY UX (Sprint 28): Cinematic Page Transitions & Audio
   ========================================================================== */
(function initSensoryUX() {
  if (window.location.pathname.includes('admin.html')) return;

  // 1. Page Transitions (Fade In/Out)
  // Fade in on load
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('lf-page-loaded');
  });

  // Intercept internal links to fade out
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    const target = link.getAttribute('target');

    // Proceed normally if it's an anchor link, javascript, external, or target="_blank"
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || target === '_blank' || href.startsWith('http')) {
      return;
    }

    e.preventDefault();
    document.body.classList.remove('lf-page-loaded');
    
    // Fallback timer to force navigation if animation hangs
    setTimeout(() => {
      window.location.href = href;
    }, 400);
  });

  // 2. Synthesized Audio Feedback (Web Audio API)
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      // Create context on first user interaction to bypass browser autoplay blocks
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
         audioCtx = new AudioContext();
      }
    }
  }

  function playTick() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    // Very high pitch, very short duration
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime); // Low volume
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }

  function playClick() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle';
    // Thud sound
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Slightly louder than tick
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  // Attach audio to interactive elements
  // Use event delegation or attach directly
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .btn, .magnetic, .product-card')) {
      initAudio();
      playTick();
    }
  });

  document.addEventListener('mousedown', (e) => {
    if (e.target.closest('a, button, .btn, .magnetic, .product-card')) {
      initAudio();
      playClick();
    }
  });

})();
