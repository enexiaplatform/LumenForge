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
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    elements.forEach(el => observer.observe(el));
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
     INIT
     -------------------------------------------------------- */
  function init() {
    setActiveNavLink();
    initScrollAnimations();
    initSmoothScroll();
    initNavScroll();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
