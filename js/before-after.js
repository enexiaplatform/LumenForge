/* ============================================================
   LUMENFORGE — Before / After Showcase
   Interactive Slider + Case Study Renderer
   ============================================================ */

(function () {
  'use strict';

  // ────────────────────────────────────────────
  // 1. CASE STUDY DATA
  // ────────────────────────────────────────────

  const caseStudies = [
    {
      id: 'kodak-warm',
      title: 'Golden Streets of Hanoi',
      mood: 'Kodak Warm',
      beforeImg: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&h=563&fit=crop&auto=format&q=75&sat=-50&con=-15',
      afterImg: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&h=563&fit=crop&auto=format&q=82',
      steps: [
        'Giảm <strong>Highlights −70</strong>, tăng <strong>Shadows +40</strong> để cân bằng tonal range và khôi phục chi tiết vùng sáng.',
        'Thêm <strong>Split Toning</strong>: Highlight → Amber (#D4A056), Shadow → Deep Teal nhẹ để tạo cảm giác Kodak Gold 200.',
        'Tăng <strong>Grain +25</strong>, giảm <strong>Clarity −10</strong> để mô phỏng texture phim analog và skin tone mềm hơn.'
      ],
      lrSettings: {
        temp: 5800, tempMin: 2000, tempMax: 10000,
        tint: 10, tintMin: -50, tintMax: 50,
        exposure: 0.15,
        contrast: -15,
        highlights: -70,
        shadows: 40,
        whites: 10,
        blacks: -25,
        texture: -10,
        clarity: -10,
        dehaze: -5,
        vibrance: 20,
        hsl: [
          { color: 'Orange', hue: '+5', sat: '-15', lum: '+10' },
          { color: 'Yellow', hue: '-5', sat: '+10', lum: '+5' }
        ],
        colorGrading: {
          shadows: { hue: 215, sat: 12 },
          midtones: { hue: 0, sat: 0 },
          highlights: { hue: 42, sat: 15 }
        }
      }
    },
    {
      id: 'moody-night',
      title: 'Neon District — After Rain',
      mood: 'Moody Night',
      beforeImg: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=900&h=563&fit=crop&auto=format&q=75&sat=-40&con=-10',
      afterImg: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=900&h=563&fit=crop&auto=format&q=82',
      steps: [
        'Hạ <strong>Exposure −0.5 EV</strong>, đẩy <strong>Blacks −30</strong> để tạo deep shadow và tăng contrast tổng thể cho mood tối.',
        'Dùng <strong>HSL</strong>: đẩy Aqua Luminance +30, giảm Orange Saturation −20 để neon xanh phát sáng nổi bật trên nền tối.',
        'Áp dụng <strong>Radial Filter</strong> với Exposure +0.3 vào vùng đèn neon, tạo hiệu ứng glow lan tỏa tự nhiên.'
      ],
      lrSettings: {
        temp: 4200, tempMin: 2000, tempMax: 10000,
        tint: 15, tintMin: -50, tintMax: 50,
        exposure: -0.50,
        contrast: 25,
        highlights: -30,
        shadows: 15,
        whites: 10,
        blacks: -30,
        texture: 15,
        clarity: 10,
        dehaze: 10,
        vibrance: 15,
        hsl: [
          { color: 'Aqua', hue: '+10', sat: '+30', lum: '+20' },
          { color: 'Blue', hue: '0', sat: '+25', lum: '-10' },
          { color: 'Orange', hue: '0', sat: '-20', lum: '0' }
        ],
        colorGrading: {
          shadows: { hue: 225, sat: 25 },
          midtones: { hue: 0, sat: 0 },
          highlights: { hue: 310, sat: 18 }
        }
      }
    },
    {
      id: 'soft-portrait',
      title: 'Window Light Portrait',
      mood: 'Soft Portrait',
      beforeImg: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=563&fit=crop&auto=format&q=75&sat=-45&con=-20',
      afterImg: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=563&fit=crop&auto=format&q=82',
      steps: [
        'Tăng <strong>Exposure +0.3</strong>, <strong>Whites +20</strong> để da sáng hơn. Giảm <strong>Contrast −15</strong> cho tông mềm mại, dreamy.',
        'Điều chỉnh <strong>HSL Orange</strong>: Hue +5, Saturation −15, Luminance +10 để skin tone ấm và đều màu hơn.',
        'Thêm <strong>Vignette −20</strong> nhẹ và <strong>Dehaze −8</strong> để tạo soft haze quanh viền, giữ focus vào mắt subject.'
      ],
      lrSettings: {
        temp: 5300, tempMin: 2000, tempMax: 10000,
        tint: 5, tintMin: -50, tintMax: 50,
        exposure: 0.30,
        contrast: -15,
        highlights: -45,
        shadows: 30,
        whites: 20,
        blacks: -15,
        texture: -15,
        clarity: -10,
        dehaze: -8,
        vibrance: 10,
        hsl: [
          { color: 'Orange', hue: '+5', sat: '-15', lum: '+10' },
          { color: 'Red', hue: '0', sat: '+5', lum: '+5' }
        ],
        colorGrading: {
          shadows: { hue: 210, sat: 8 },
          midtones: { hue: 35, sat: 5 },
          highlights: { hue: 45, sat: 10 }
        }
      }
    },
    {
      id: 'teal-orange',
      title: 'Cinematic Harbor — Blue Hour',
      mood: 'Teal & Orange',
      beforeImg: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=563&fit=crop&auto=format&q=75&sat=-35&con=-10',
      afterImg: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=563&fit=crop&auto=format&q=82',
      steps: [
        'Đẩy <strong>White Balance</strong> về 5800K, Tint +12 để tạo base ấm. Tăng <strong>Vibrance +25</strong> cho màu bão hòa nhưng tự nhiên.',
        'Trong <strong>Color Grading</strong>: Midtones → Teal (#1A8B7A), Highlights → Orange (#D4823A) — công thức kinh điển Hollywood.',
        'Dùng <strong>Tone Curve</strong>: nâng Shadows lên, tạo faded look. Thêm S-curve nhẹ ở midtones để tăng micro-contrast.'
      ],
      lrSettings: {
        temp: 5800, tempMin: 2000, tempMax: 10000,
        tint: 12, tintMin: -50, tintMax: 50,
        exposure: 0.05,
        contrast: 10,
        highlights: -50,
        shadows: 35,
        whites: 15,
        blacks: -20,
        texture: 0,
        clarity: -5,
        dehaze: 5,
        vibrance: 25,
        hsl: [
          { color: 'Blue', hue: '-10', sat: '+15', lum: '0' },
          { color: 'Orange', hue: '-5', sat: '+20', lum: '0' },
          { color: 'Yellow', hue: '-10', sat: '0', lum: '0' }
        ],
        colorGrading: {
          shadows: { hue: 210, sat: 20 },
          midtones: { hue: 180, sat: 10 },
          highlights: { hue: 35, sat: 22 }
        }
      }
    },
    {
      id: 'film-noir',
      title: 'Shadow Play — Urban Geometry',
      mood: 'Film Noir',
      beforeImg: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=900&h=563&fit=crop&auto=format&q=75&sat=-30&con=-10',
      afterImg: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=900&h=563&fit=crop&auto=format&q=82',
      steps: [
        'Chuyển <strong>B&W Mix</strong>: giảm Red −20, tăng Yellow +15, Green −30. Đẩy <strong>Contrast +40</strong> cho high-contrast mono.',
        'Dùng <strong>Tone Curve</strong>: kéo Blacks lên 15% (lifted blacks kiểu film), tạo S-curve mạnh để shadow sâu hơn.',
        'Thêm <strong>Grain +35</strong> (Size 30, Roughness 60) mô phỏng Tri-X 400 push-processed. <strong>Clarity +20</strong> cho texture.'
      ],
      lrSettings: {
        temp: 5000, tempMin: 2000, tempMax: 10000,
        tint: 0, tintMin: -50, tintMax: 50,
        exposure: 0.10,
        contrast: 40,
        highlights: -20,
        shadows: 25,
        whites: 30,
        blacks: -40,
        texture: 0,
        clarity: 20,
        dehaze: 12,
        vibrance: 0,
        hsl: [
          { color: 'B&W Red', hue: '0', sat: '0', lum: '-20' },
          { color: 'B&W Yellow', hue: '0', sat: '0', lum: '+15' },
          { color: 'B&W Green', hue: '0', sat: '0', lum: '-30' }
        ],
        colorGrading: {
          shadows: { hue: 210, sat: 5 },
          midtones: { hue: 0, sat: 0 },
          highlights: { hue: 45, sat: 8 }
        }
      }
    },
    {
      id: 'golden-hour',
      title: 'Savanna Dusk — Magic Hour',
      mood: 'Golden Hour',
      beforeImg: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&h=563&fit=crop&auto=format&q=75&sat=-40&con=-15',
      afterImg: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&h=563&fit=crop&auto=format&q=82',
      steps: [
        'Đẩy <strong>Temp lên 6500K</strong>, Tint +8. Tăng <strong>Shadows +35</strong> để mở chi tiết vùng tối, giữ warm tone nhất quán.',
        'Trong <strong>HSL</strong>: Orange Hue −10, Saturation +15. Yellow Luminance +20. Tạo golden light lan tỏa khắp frame.',
        'Áp dụng <strong>Graduated Filter</strong> từ trên xuống: giảm Highlights −30, Temp +500K để bầu trời thêm dramatic và ấm.'
      ],
      lrSettings: {
        temp: 6500, tempMin: 2000, tempMax: 10000,
        tint: 8, tintMin: -50, tintMax: 50,
        exposure: -0.10,
        contrast: 5,
        highlights: -60,
        shadows: 35,
        whites: 20,
        blacks: -15,
        texture: 0,
        clarity: -5,
        dehaze: -5,
        vibrance: 20,
        hsl: [
          { color: 'Orange', hue: '-10', sat: '+15', lum: '0' },
          { color: 'Yellow', hue: '0', sat: '+25', lum: '+15' }
        ],
        colorGrading: {
          shadows: { hue: 30, sat: 10 },
          midtones: { hue: 40, sat: 15 },
          highlights: { hue: 45, sat: 25 }
        }
      }
    }
  ];

  // ────────────────────────────────────────────
  // 2. SVG ICONS
  // ────────────────────────────────────────────

  const ICONS = {
    arrows: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>`,
    steps: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 20V10M18 20V4M6 20v-4"/>
    </svg>`,
    arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>`
  };

  // ────────────────────────────────────────────
  // 2B. LIGHTROOM PARAMETERS HELPERS
  // ────────────────────────────────────────────

  function renderSliderRow(label, value, min, max, unit = "") {
    let isCenter = (min < 0 && max > 0);
    let pct = 0;
    let fillLeft = 0;
    let fillWidth = 0;
    let thumbPct = ((value - min) / (max - min)) * 100;

    if (isCenter) {
      let range = max - min;
      let zeroPct = (-min / range) * 100;
      let valPct = ((value - min) / range) * 100;
      fillLeft = Math.min(zeroPct, valPct);
      fillWidth = Math.abs(valPct - zeroPct);
    } else {
      fillLeft = 0;
      fillWidth = thumbPct;
    }

    let displayVal = value > 0 && isCenter ? `+${value}` : `${value}`;

    return `
      <div class="lr-slider-row">
        <span class="lr-slider-label">${label}</span>
        <div class="lr-slider-bar-wrapper">
          <div class="lr-slider-fill" style="left: ${fillLeft}%; width: ${fillWidth}%;"></div>
          <div class="lr-slider-thumb" style="left: ${thumbPct}%;"></div>
        </div>
        <span class="lr-slider-val">${displayVal}${unit}</span>
      </div>
    `;
  }

  function renderParamsHTML(cs) {
    const s = cs.lrSettings;
    if (!s) return '';
    
    const basicSliders = [
      renderSliderRow('Temp', s.temp, s.tempMin, s.tempMax, 'K'),
      renderSliderRow('Tint', s.tint, s.tintMin, s.tintMax),
      renderSliderRow('Exposure', s.exposure, -3.0, 3.0),
      renderSliderRow('Contrast', s.contrast, -100, 100),
      renderSliderRow('Highlights', s.highlights, -100, 100),
      renderSliderRow('Shadows', s.shadows, -100, 100),
      renderSliderRow('Whites', s.whites, -100, 100),
      renderSliderRow('Blacks', s.blacks, -100, 100),
      renderSliderRow('Texture', s.texture, -100, 100),
      renderSliderRow('Clarity', s.clarity, -100, 100),
      renderSliderRow('Dehaze', s.dehaze, -100, 100),
      renderSliderRow('Vibrance', s.vibrance, -100, 100)
    ].join('');

    const hslRows = s.hsl.map(h => `
      <div style="display: flex; justify-content: space-between; font-size: 0.72rem; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.02);">
        <span style="color: var(--accent-cyan); font-weight: 500;">${h.color}</span>
        <span style="font-family: var(--font-mono); color: #ccc;">H: ${h.hue} | S: ${h.sat} | L: ${h.lum}</span>
      </div>
    `).join('');

    const renderWheel = (title, grading) => {
      const radius = 22; // Half of diameter minus thumb boundary
      const rad = (grading.hue - 90) * Math.PI / 180;
      const r = (grading.sat / 100) * radius;
      const x = 25 + r * Math.cos(rad);
      const y = 25 + r * Math.sin(rad);
      
      return `
        <div class="lr-wheel-card">
          <div class="lr-wheel-title">${title}</div>
          <div class="lr-wheel-circle">
            <div class="lr-wheel-dot" style="left: ${x}px; top: ${y}px;"></div>
          </div>
          <div class="lr-wheel-val">${grading.hue}° / ${grading.sat}%</div>
        </div>
      `;
    };

    const shadowWheel = renderWheel('Shadows', s.colorGrading.shadows);
    const midtoneWheel = renderWheel('Midtones', s.colorGrading.midtones);
    const highlightWheel = renderWheel('Highlights', s.colorGrading.highlights);

    return `
      <button class="ba-params-toggle" data-target="${cs.id}">
        Xem Thông Số Lightroom Chi Tiết
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="ba-params-content" id="params-${cs.id}">
        <div class="lr-panel">
          <div class="lr-section-title">Tone & Detail</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${basicSliders}
          </div>
          
          <div class="lr-grid-2">
            <div>
              <div class="lr-section-title">Color HSL Adjustments</div>
              <div style="background: rgba(0,0,0,0.15); padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.02); display: flex; flex-direction: column; gap: 4px;">
                ${hslRows}
              </div>
            </div>
            <div>
              <div class="lr-section-title">Color Grading Wheels</div>
              <div class="lr-color-grading-wheels">
                ${shadowWheel}
                ${midtoneWheel}
                ${highlightWheel}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function initParamToggles() {
    const toggles = document.querySelectorAll('.ba-params-toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const targetId = toggle.getAttribute('data-target');
        const content = document.getElementById(`params-${targetId}`);
        if (content) {
          const isOpen = content.classList.contains('open');
          if (isOpen) {
            content.classList.remove('open');
            toggle.classList.remove('active');
          } else {
            content.classList.add('open');
            toggle.classList.add('active');
          }
        }
      });
    });
  }

  // ────────────────────────────────────────────
  // 3. RENDER CARDS
  // ────────────────────────────────────────────

  function renderCards() {
    const grid = document.getElementById('ba-grid');
    if (!grid) return;

    grid.innerHTML = caseStudies.map((cs, idx) => `
      <article class="ba-card" data-index="${idx}">
        <div class="ba-card-header">
          <h3 class="ba-card-title">${cs.title}</h3>
          <span class="ba-mood-tag">${cs.mood}</span>
        </div>
        <div class="ba-slider-wrapper" data-id="${cs.id}">
          <img class="ba-img-before" src="${cs.beforeImg}" alt="${cs.title} — Before" loading="lazy" draggable="false">
          <img class="ba-img-after" src="${cs.afterImg}" alt="${cs.title} — After" loading="lazy" draggable="false">
          <span class="ba-label ba-label-before">RAW</span>
          <span class="ba-label ba-label-after">EDIT</span>
          <div class="ba-slider-divider"></div>
          <div class="ba-slider-handle">
            <div class="ba-handle-diamond">
              <div class="ba-handle-arrows">${ICONS.arrows}</div>
            </div>
          </div>
        </div>
        <div class="ba-edit-steps">
          <div class="ba-steps-header">
            <span class="ba-steps-icon">${ICONS.steps}</span>
            <span class="ba-steps-title">Key Edits</span>
          </div>
          ${cs.steps.map((step, i) => `
            <div class="ba-step">
              <span class="ba-step-number">${i + 1}</span>
              <p class="ba-step-text">${step}</p>
            </div>
          `).join('')}
          ${renderParamsHTML(cs)}
        </div>
      </article>
    `).join('');

    // Initialize all sliders after rendering
    initSliders();
    initParamToggles();
    initScrollReveal();
  }

  // ────────────────────────────────────────────
  // 4. INTERACTIVE SLIDER LOGIC
  // ────────────────────────────────────────────

  function initSliders() {
    const sliders = document.querySelectorAll('.ba-slider-wrapper');

    sliders.forEach(slider => {
      let isDragging = false;
      let animationFrame = null;

      function getPosition(e) {
        const rect = slider.getBoundingClientRect();
        let clientX;

        if (e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
        } else {
          clientX = e.clientX;
        }

        const x = clientX - rect.left;
        return Math.max(0, Math.min(x / rect.width, 1));
      }

      function updateSlider(position) {
        const pct = position * 100;
        const beforeImg = slider.querySelector('.ba-img-before');
        const divider = slider.querySelector('.ba-slider-divider');
        const handle = slider.querySelector('.ba-slider-handle');

        if (beforeImg) {
          beforeImg.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        }
        if (divider) {
          divider.style.left = pct + '%';
        }
        if (handle) {
          handle.style.left = pct + '%';
        }
      }

      function onMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }

        animationFrame = requestAnimationFrame(() => {
          const pos = getPosition(e);
          updateSlider(pos);
        });
      }

      function onStart(e) {
        isDragging = true;
        slider.classList.add('dragging');
        const pos = getPosition(e);
        updateSlider(pos);
      }

      function onEnd() {
        isDragging = false;
        slider.classList.remove('dragging');
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      }

      // Mouse events
      slider.addEventListener('mousedown', onStart);
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);

      // Touch events
      slider.addEventListener('touchstart', onStart, { passive: false });
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);

      // Keyboard accessibility — allow arrow keys when focused
      slider.setAttribute('tabindex', '0');
      slider.setAttribute('role', 'slider');
      slider.setAttribute('aria-label', 'Before and after comparison slider');
      slider.setAttribute('aria-valuemin', '0');
      slider.setAttribute('aria-valuemax', '100');
      slider.setAttribute('aria-valuenow', '50');

      slider.addEventListener('keydown', (e) => {
        const divider = slider.querySelector('.ba-slider-divider');
        if (!divider) return;

        const currentLeft = parseFloat(divider.style.left) || 50;
        let newPos = currentLeft;

        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          newPos = Math.max(0, currentLeft - 2);
          e.preventDefault();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          newPos = Math.min(100, currentLeft + 2);
          e.preventDefault();
        }

        if (newPos !== currentLeft) {
          updateSlider(newPos / 100);
          slider.setAttribute('aria-valuenow', Math.round(newPos));
        }
      });

      // Initialize at 50%
      updateSlider(0.5);
    });
  }

  // ────────────────────────────────────────────
  // 5. SCROLL REVEAL ANIMATION
  // ────────────────────────────────────────────

  function initScrollReveal() {
    const cards = document.querySelectorAll('.ba-card');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      cards.forEach(card => observer.observe(card));
    } else {
      // Fallback: reveal all immediately
      cards.forEach(card => card.classList.add('revealed'));
    }

    // Also observe the CTA section
    const cta = document.querySelector('.ba-cta-box');
    if (cta) {
      cta.style.opacity = '0';
      cta.style.transform = 'translateY(30px)';
      cta.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

      const ctaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            ctaObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      ctaObserver.observe(cta);
    }
  }

  // ────────────────────────────────────────────
  // 6. HERO COUNTER ANIMATION
  // ────────────────────────────────────────────

  function animateCounters() {
    const counters = document.querySelectorAll('.ba-stat-value[data-target]');

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const duration = 1500;
      const startTime = performance.now();

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        counter.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          counter.textContent = target;
        }
      }

      requestAnimationFrame(tick);
    });
  }

  // ────────────────────────────────────────────
  // 7. INITIALIZATION
  // ────────────────────────────────────────────

  function init() {
    renderCards();
    animateCounters();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
