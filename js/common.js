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
