/* ============================================
   LUMENFORGE — The Exposure Reactor
   Interactive Exposure Triangle Playground
   ============================================ */

(function () {
  'use strict';

  // === Data Tables ===
  const ISO_STEPS = [100, 200, 400, 800, 1600, 3200, 6400, 12800];
  const SHUTTER_STEPS = ['1"', '1/2', '1/4', '1/8', '1/15', '1/30', '1/60', '1/125', '1/250', '1/500', '1/1000'];
  const APERTURE_STEPS = ['f/1.4', 'f/1.8', 'f/2.8', 'f/4', 'f/5.6', 'f/8', 'f/11', 'f/16'];

  // EV stops relative to each step (index 0 = brightest/most light)
  // ISO: higher index = more sensitive = more light = positive EV contribution
  // Shutter: lower index = slower = more light = positive EV contribution
  // Aperture: lower index = wider = more light = positive EV contribution

  // Base correct exposure: ISO 200 (idx 1) + 1/125 (idx 7) + f/4 (idx 3)
  // We define EV offset from this base. Each step = 1 stop.
  const BASE_ISO = 1;
  const BASE_SHUTTER = 6;
  const BASE_APERTURE = 3;

  // Noise levels per ISO index
  const NOISE_LEVELS = [
    { opacity: 0,    label: 'Nhiễu: Không',     cls: '' },        // ISO 100
    { opacity: 0.04, label: 'Nhiễu: Thấp',       cls: '' },        // ISO 200
    { opacity: 0.10, label: 'Nhiễu: Thấp',       cls: '' },        // ISO 400
    { opacity: 0.18, label: 'Nhiễu: Trung bình',  cls: 'warn' },    // ISO 800
    { opacity: 0.30, label: 'Nhiễu: Rõ rệt',   cls: 'warn' },    // ISO 1600
    { opacity: 0.45, label: 'Nhiễu: Cao',      cls: 'danger' },  // ISO 3200
    { opacity: 0.60, label: 'Nhiễu: Rất cao', cls: 'danger' },  // ISO 6400
    { opacity: 0.75, label: 'Nhiễu: Cực hạn',   cls: 'danger' },  // ISO 12800
  ];

  // Motion labels per shutter index
  const MOTION_LEVELS = [
    { blur: true,  label: 'Cử động: Nhòe mạnh',  motionLabel: '⚠ NHÒE CHUYỂN ĐỘNG MẠNH', cls: 'danger' },  // 1"
    { blur: true,  label: 'Cử động: Nhòe mạnh',  motionLabel: '⚠ NHÒE CHUYỂN ĐỘNG MẠNH', cls: 'danger' },  // 1/2
    { blur: true,  label: 'Cử động: Nguy cơ nhòe',   motionLabel: '⚠ NHÒE CHUYỂN ĐỘNG',       cls: 'danger' },  // 1/4
    { blur: true,  label: 'Cử động: Nguy cơ nhòe',   motionLabel: '⚠ NHÒE CHUYỂN ĐỘNG',       cls: 'warn' },    // 1/8
    { blur: true,  label: 'Cử động: Nhòe nhẹ', motionLabel: '△ NHÒE NHẸ',       cls: 'warn' },    // 1/15
    { blur: true,  label: 'Cử động: Nhòe nhẹ', motionLabel: '△ NHÒE NHẸ',       cls: 'warn' },    // 1/30
    { blur: false, label: 'Cử động: Sắc nét',       motionLabel: '',                     cls: '' },        // 1/60
    { blur: false, label: 'Cử động: Sắc nét',       motionLabel: '',                     cls: '' },        // 1/125
    { blur: false, label: 'Cử động: Đóng băng',      motionLabel: '',                     cls: '' },        // 1/250
    { blur: false, label: 'Cử động: Đóng băng',      motionLabel: '',                     cls: '' },        // 1/500
    { blur: false, label: 'Cử động: Đóng băng',      motionLabel: '',                     cls: '' },        // 1/1000
  ];

  // DOF labels per aperture index
  const DOF_LEVELS = [
    { label: 'DOF: Cực mỏng', cls: '' },      // f/1.4
    { label: 'DOF: Mỏng',      cls: '' },      // f/1.8
    { label: 'DOF: Mỏng',      cls: '' },      // f/2.8
    { label: 'DOF: Trung bình',       cls: '' },      // f/4
    { label: 'DOF: Trung bình - Sâu',  cls: '' },      // f/5.6
    { label: 'DOF: Sâu',         cls: '' },      // f/8
    { label: 'DOF: Rất sâu',    cls: 'warn' },  // f/11
    { label: 'DOF: Cực sâu (Nhiễu xạ)', cls: 'warn' }, // f/16
  ];

  // === DOM Elements ===
  const isoSlider = document.getElementById('iso-slider');
  const shutterSlider = document.getElementById('shutter-slider');
  const apertureSlider = document.getElementById('aperture-slider');

  const isoValue = document.getElementById('iso-value');
  const shutterValue = document.getElementById('shutter-value');
  const apertureValue = document.getElementById('aperture-value');

  const isoEffect = document.getElementById('iso-effect');
  const shutterEffect = document.getElementById('shutter-effect');
  const apertureEffect = document.getElementById('aperture-effect');

  const overlayBrightness = document.getElementById('overlay-brightness');
  const overlayNoise = document.getElementById('overlay-noise');
  const overlayMotion = document.getElementById('overlay-motion');
  const motionLabel = document.getElementById('motion-label');
  const overlayDof = document.getElementById('overlay-dof');
  const evDisplay = document.getElementById('ev-display');
  const evIndicator = document.getElementById('ev-indicator');
  const warningsContainer = document.getElementById('exposure-warnings');
  const exposureScene = document.getElementById('exposure-scene');

  // === Core Update Function ===
  function updateExposure() {
    const isoIdx = parseInt(isoSlider.value);
    const shutterIdx = parseInt(shutterSlider.value);
    const apertureIdx = parseInt(apertureSlider.value);

    // Update displayed values
    isoValue.textContent = ISO_STEPS[isoIdx];
    shutterValue.textContent = SHUTTER_STEPS[shutterIdx];
    apertureValue.textContent = APERTURE_STEPS[apertureIdx];

    // Calculate EV offset from correct exposure
    // More ISO = brighter = positive offset
    const isoOffset = isoIdx - BASE_ISO;
    // Slower shutter (lower index) = brighter = positive offset
    // So offset = BASE_SHUTTER - shutterIdx (going from fast to slow adds light)
    const shutterOffset = BASE_SHUTTER - shutterIdx;
    // Wider aperture (lower index) = brighter = positive offset
    // So offset = BASE_APERTURE - apertureIdx
    const apertureOffset = BASE_APERTURE - apertureIdx;

    const evOffset = isoOffset + shutterOffset + apertureOffset;

    // Clamp to display range
    const evClamped = Math.max(-3, Math.min(3, evOffset));

    // === Update Preview ===
    updateBrightness(evClamped);
    updateNoise(isoIdx);
    updateMotion(shutterIdx);
    updateDOF(apertureIdx);
    updateEVMeter(evClamped, evOffset);
    updateWarnings(isoIdx, shutterIdx, apertureIdx, evOffset);

    // Update effect labels
    const noise = NOISE_LEVELS[isoIdx];
    isoEffect.textContent = noise.label;
    isoEffect.className = 'slider-effect' + (noise.cls ? ' ' + noise.cls : '');

    const motion = MOTION_LEVELS[shutterIdx];
    shutterEffect.textContent = motion.label;
    shutterEffect.className = 'slider-effect' + (motion.cls ? ' ' + motion.cls : '');

    const dof = DOF_LEVELS[apertureIdx];
    apertureEffect.textContent = dof.label;
    apertureEffect.className = 'slider-effect' + (dof.cls ? ' ' + dof.cls : '');
  }

  // === Brightness Overlay ===
  function updateBrightness(ev) {
    if (ev < 0) {
      // Underexposed: dark overlay
      overlayBrightness.style.background = '#000';
      overlayBrightness.style.opacity = Math.abs(ev) * 0.22;
    } else if (ev > 0) {
      // Overexposed: white overlay
      overlayBrightness.style.background = '#fff';
      overlayBrightness.style.opacity = ev * 0.2;
    } else {
      overlayBrightness.style.opacity = 0;
    }
  }

  // === Noise Overlay ===
  function updateNoise(isoIdx) {
    overlayNoise.style.opacity = NOISE_LEVELS[isoIdx].opacity;
  }

  // === Motion Overlay ===
  function updateMotion(shutterIdx) {
    const motion = MOTION_LEVELS[shutterIdx];
    if (motion.blur) {
      overlayMotion.style.opacity = 1;
      motionLabel.textContent = motion.motionLabel;
    } else {
      overlayMotion.style.opacity = 0;
    }
  }

  // === DOF Overlay ===
  function updateDOF(apertureIdx) {
    // At wide apertures, background gets blurry
    // We apply a subtle blur hint at the top portion of the scene
    if (apertureIdx <= 1) {
      overlayDof.style.backdropFilter = 'blur(2px)';
      overlayDof.style.webkitBackdropFilter = 'blur(2px)';
      // Only blur upper portion (simulating background blur)
      overlayDof.style.clipPath = 'inset(0 0 55% 0)';
    } else if (apertureIdx <= 2) {
      overlayDof.style.backdropFilter = 'blur(1px)';
      overlayDof.style.webkitBackdropFilter = 'blur(1px)';
      overlayDof.style.clipPath = 'inset(0 0 60% 0)';
    } else {
      overlayDof.style.backdropFilter = 'none';
      overlayDof.style.webkitBackdropFilter = 'none';
      overlayDof.style.clipPath = 'none';
    }
  }

  // === EV Meter ===
  function updateEVMeter(evClamped, evOffset) {
    // Position: -3 = 0%, 0 = 50%, +3 = 100%
    const percent = ((evClamped + 3) / 6) * 100;
    evIndicator.style.left = percent + '%';

    // Glow color based on proximity to correct
    const absEv = Math.abs(evClamped);
    if (absEv <= 0.5) {
      evIndicator.style.boxShadow = '0 0 12px rgba(0, 212, 170, 0.6)';
    } else if (absEv <= 1.5) {
      evIndicator.style.boxShadow = '0 0 12px rgba(255, 170, 68, 0.6)';
    } else {
      evIndicator.style.boxShadow = '0 0 12px rgba(255, 68, 68, 0.6)';
    }

    // EV display badge
    const sign = evOffset > 0 ? '+' : '';
    evDisplay.textContent = 'EV ' + sign + evOffset;

    if (absEv === 0) {
      evDisplay.style.color = '#00D4AA';
      evDisplay.style.borderColor = 'rgba(0, 212, 170, 0.3)';
    } else if (absEv <= 1) {
      evDisplay.style.color = '#ffaa44';
      evDisplay.style.borderColor = 'rgba(255, 170, 68, 0.3)';
    } else {
      evDisplay.style.color = '#ff4444';
      evDisplay.style.borderColor = 'rgba(255, 68, 68, 0.3)';
    }
  }

  // === Warnings ===
  function updateWarnings(isoIdx, shutterIdx, apertureIdx, evOffset) {
    const warnings = [];

    // ISO warnings
    if (isoIdx >= 5) { // 3200+
      warnings.push({
        text: '⚠️ ISO cao — ảnh sẽ có nhiều noise, giảm chất lượng và dynamic range.',
        critical: isoIdx >= 6
      });
    }

    // Shutter warnings
    if (shutterIdx <= 4 && shutterIdx >= 3) { // 1/15 or 1/30
      warnings.push({
        text: '⚠️ Tốc độ chậm — cần tripod hoặc ổn định tay, dễ bị nhòe.',
        critical: false
      });
    } else if (shutterIdx <= 2) { // 1/4 or slower
      warnings.push({
        text: '⚠️ Rất chậm — BẮT BUỘC dùng tripod! Không thể cầm tay ở tốc độ này.',
        critical: true
      });
    }

    // Aperture warnings
    if (apertureIdx >= 6) { // f/11+
      warnings.push({
        text: '⚠️ Khẩu nhỏ — có thể bị nhiễu xạ (diffraction), ảnh mất nét vi mô.',
        critical: apertureIdx >= 7
      });
    }

    // EV warnings
    if (evOffset >= 2) {
      warnings.push({
        text: '⚠️ Quá sáng — ảnh sẽ bị cháy (blown highlights), mất chi tiết vùng sáng!',
        critical: evOffset >= 3
      });
    }

    if (evOffset <= -2) {
      warnings.push({
        text: '⚠️ Quá tối — mất chi tiết trong vùng tối, noise sẽ xuất hiện khi push exposure!',
        critical: evOffset <= -3
      });
    }

    // Render warnings
    warningsContainer.innerHTML = warnings.map(w =>
      `<div class="warning-item${w.critical ? ' critical' : ''}">${w.text}</div>`
    ).join('');
  }

  // === Scenario Configurations ===
  const SCENARIOS = {
    'sunny': { iso: 0, shutter: 7, aperture: 5, className: 'scenario-sunny' },         // ISO 100, 1/125s, f/8
    'studio': { iso: 1, shutter: 7, aperture: 2, className: 'scenario-studio' },        // ISO 200, 1/125s, f/2.8
    'cyberpunk': { iso: 4, shutter: 5, aperture: 1, className: 'scenario-cyberpunk' },   // ISO 1600, 1/30s, f/1.8 (PRO)
    'action': { iso: 3, shutter: 10, aperture: 2, className: 'scenario-action' },       // ISO 800, 1/1000s, f/2.8 (PRO)
    'chiaroscuro': { iso: 2, shutter: 6, aperture: 0, className: 'scenario-chiaroscuro' }, // ISO 400, 1/60s, f/1.4 (PRO)
    'astro': { iso: 6, shutter: 0, aperture: 2, className: 'scenario-astro' }           // ISO 6400, 1s, f/2.8 (PRO)
  };

  function selectScenario(key) {
    const config = SCENARIOS[key];
    if (!config) return;

    Object.keys(SCENARIOS).forEach(k => {
      const card = document.getElementById(`scen-${k}`);
      if (card) card.classList.remove('active');
    });
    const activeCard = document.getElementById(`scen-${key}`);
    if (activeCard) activeCard.classList.add('active');

    isoSlider.value = config.iso;
    shutterSlider.value = config.shutter;
    apertureSlider.value = config.aperture;

    if (exposureScene) {
      exposureScene.className = `exposure-scene ${config.className}`;
    }

    updateExposure();
  }

  function clearActiveScenario() {
    Object.keys(SCENARIOS).forEach(k => {
      const card = document.getElementById(`scen-${k}`);
      if (card) card.classList.remove('active');
    });
  }

  // === Event Listeners ===
  isoSlider.addEventListener('input', () => {
    clearActiveScenario();
    updateExposure();
  });
  shutterSlider.addEventListener('input', () => {
    clearActiveScenario();
    updateExposure();
  });
  apertureSlider.addEventListener('input', () => {
    clearActiveScenario();
    updateExposure();
  });

  // Bind Scenario Card Clicks
  const cardKeys = ['sunny', 'studio', 'cyberpunk', 'action', 'chiaroscuro', 'astro'];
  cardKeys.forEach(key => {
    const card = document.getElementById(`scen-${key}`);
    if (card) {
      card.addEventListener('click', () => {
        const isPro = card.getAttribute('data-pro') === 'true';
        if (isPro) {
          if (typeof lfAuth !== 'undefined') {
            const featureName = `Kịch bản ${card.querySelector('div:nth-child(2)').textContent}`;
            const hasAccess = lfAuth.gateFeature(featureName, () => {
              // Do nothing on cancel
            });
            if (!hasAccess) return;
          }
        }
        selectScenario(key);
      });
    }
  });

  // === Initial render ===
  selectScenario('sunny');

})();
