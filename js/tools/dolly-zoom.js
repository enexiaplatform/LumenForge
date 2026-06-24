document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('zoom-slider');
  const sliderBlur = document.getElementById('slider-blur');
  const valBlur = document.getElementById('val-blur');
  const btnAnimate = document.getElementById('btn-animate');
  
  const scene = document.getElementById('scene');
  const bgLayer = document.getElementById('bg-layer');
  const fgLayer = document.getElementById('fg-layer');
  const lensDisplay = document.getElementById('lens-display');
  const descDisplay = document.getElementById('desc-display');

  const fileBg = document.getElementById('file-bg');
  const fileFg = document.getElementById('file-fg');

  const presetVertigo = document.getElementById('preset-vertigo');
  const presetJaws = document.getElementById('preset-jaws');
  const presetGoodfellas = document.getElementById('preset-goodfellas');

  // 1. State Variables
  let isAnimating = false;
  let animationTime = 0;
  let animationFrameId = null;
  let apertureValue = 50; // Default corresponds to f/2.8 (slider value 50)
  let previousBlur = 50;

  // 2. Preset Metadata
  const PRESETS = {
    vertigo: {
      bg: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
      fg: 'https://plus.unsplash.com/premium_photo-1669882255850-25e24cb91cd4?q=80&w=500&auto=format&fit=crop'
    },
    jaws: {
      bg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
      fg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500&auto=format&fit=crop'
    },
    goodfellas: {
      bg: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
      fg: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500&auto=format&fit=crop'
    }
  };

  // 3. Update Scene Render Engine
  function updateScene() {
    if (!slider) return;
    const val = parseInt(slider.value);
    
    // Perspective Math (0 -> 200px, 100 -> 6000px)
    const minP = 200;
    const maxP = 6000;
    const perspective = minP + (maxP - minP) * Math.pow(val / 100, 2); // quadratic curve for smoother wide control
    
    if (scene) {
      scene.style.perspective = perspective + 'px';
    }

    // Focal Length mapping (0 -> 14mm, 100 -> 200mm)
    const minF = 14;
    const maxF = 200;
    const focal = minF + (maxF - minF) * Math.pow(val / 100, 1.5);
    
    if (lensDisplay) {
      lensDisplay.textContent = Math.round(focal) + 'mm';
    }

    // Optics Depth of Field Blur Simulation
    // Longer focal length increases blur; max blur scales with apertureValue slider
    const baseBlurFactor = Math.pow(val / 100, 1.5); // Telephoto lenses blur much faster
    const maxBlurPx = (apertureValue / 100) * 25; // Up to 25px blur at max aperture
    const blurPx = baseBlurFactor * maxBlurPx;
    
    if (bgLayer) {
      bgLayer.style.filter = `blur(${blurPx.toFixed(1)}px)`;
    }

    // Description text updates based on focal length range
    if (descDisplay) {
      if (focal < 24) {
        descDisplay.textContent = "Góc siêu rộng (Super Wide-Angle). Gây bóp méo dãn cách phối cảnh mạnh (Extension Distortion). Hậu cảnh bị đẩy lùi ra xa tít tắp, tạo cảm giác không gian mênh mông, cô đơn hoặc vĩ đại. Đối tượng tiền cảnh nổi bật sắc nét.";
      } else if (focal < 70) {
        descDisplay.textContent = "Tiêu cự tiêu chuẩn (Standard / Normal). Không gian có độ sâu chân thực vừa phải. Hậu cảnh và tiền cảnh được phân chia cân bằng, tái hiện góc nhìn tự nhiên nhất của mắt người.";
      } else if (focal < 135) {
        descDisplay.textContent = "Ống kính Telephoto trung bình. Bắt đầu xuất hiện hiện tượng Nén Không Gian (Perspective Compression) kết hợp xóa phông dịu nhẹ. Hậu cảnh bị kéo xập lại gần chủ thể hơn, tôn dáng chân dung.";
      } else {
        descDisplay.textContent = "Ống kính siêu Telephoto (Super Tele). Nén không gian cực kỳ mạnh mẽ. Bối cảnh phía sau phình to khổng lồ và áp sát ngay sau lưng nhân vật. Độ mờ xóa phông đạt cực đại, xóa nhòa mọi khoảng cách vật lý.";
      }
    }
  }

  // 4. Preset Loader
  function loadPreset(presetId, buttonEl) {
    const data = PRESETS[presetId];
    if (!data) return;

    // Highlight active preset button
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    if (buttonEl) {
      buttonEl.classList.add('active');
    }

    // Apply images
    if (bgLayer) bgLayer.style.backgroundImage = `url('${data.bg}')`;
    if (fgLayer) fgLayer.style.backgroundImage = `url('${data.fg}')`;
    
    updateScene();
  }

  // Bind Preset Buttons
  if (presetVertigo) {
    presetVertigo.addEventListener('click', () => loadPreset('vertigo', presetVertigo));
  }
  if (presetJaws) {
    presetJaws.addEventListener('click', () => loadPreset('jaws', presetJaws));
  }
  if (presetGoodfellas) {
    presetGoodfellas.addEventListener('click', () => loadPreset('goodfellas', presetGoodfellas));
  }

  // 5. Custom Scene Uploaders (Gated for PRO)
  function handleCustomUpload(inputEl, targetLayer, labelName) {
    inputEl.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (typeof lfAuth !== 'undefined') {
        const hasAccess = lfAuth.gateFeature(`Tải lên ${labelName} riêng (Custom Composer)`, () => {
          inputEl.value = ''; // Reset
        });
        if (!hasAccess) return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        // Clear active preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        if (targetLayer) {
          targetLayer.style.backgroundImage = `url('${event.target.result}')`;
        }
        updateScene();
      };
      reader.readAsDataURL(file);
    });
  }

  if (fileBg) handleCustomUpload(fileBg, bgLayer, 'Bối cảnh');
  if (fileFg) handleCustomUpload(fileFg, fgLayer, 'Chủ thể');

  // 6. Aperture DoF Blur Slider (Gated for PRO)
  function getFStop(val) {
    if (val === 0) return 'f/16 (Không xóa phông)';
    if (val <= 10) return 'f/11';
    if (val <= 20) return 'f/8.0';
    if (val <= 30) return 'f/5.6';
    if (val <= 40) return 'f/4.0';
    if (val <= 50) return 'f/2.8 (Mặc định)';
    if (val <= 60) return 'f/2.0';
    if (val <= 70) return 'f/1.8';
    if (val <= 80) return 'f/1.4';
    if (val <= 90) return 'f/1.2';
    return 'f/0.95 (Cực đại)';
  }

  if (sliderBlur) {
    sliderBlur.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (valBlur) {
        valBlur.textContent = getFStop(val);
      }
      apertureValue = val;
      updateScene();
    });

    sliderBlur.addEventListener('change', (e) => {
      const val = parseInt(e.target.value);
      if (val !== 50) {
        if (typeof lfAuth !== 'undefined') {
          const hasAccess = lfAuth.gateFeature('Tùy chỉnh khẩu độ xóa phông (DoF Blur)', () => {
            sliderBlur.value = 50;
            apertureValue = 50;
            if (valBlur) valBlur.textContent = getFStop(50);
            updateScene();
          });
          if (!hasAccess) return;
        }
      }
      previousBlur = val;
      updateScene();
    });
  }

  // 7. Auto-Play Vertigo Animation Loop (Gated for PRO)
  function animateLoop() {
    if (!isAnimating) return;

    animationTime += 0.025;
    // Map sine wave [-1, 1] to [5, 95] slider value range
    const wave = Math.sin(animationTime);
    const sliderVal = Math.round(50 + 45 * wave);
    
    if (slider) {
      slider.value = sliderVal;
    }
    updateScene();
    
    animationFrameId = requestAnimationFrame(animateLoop);
  }

  function startAnimation() {
    isAnimating = true;
    if (btnAnimate) {
      btnAnimate.innerHTML = '⏸ <span>Pause</span> <span style="color: var(--accent-gold); font-size: 0.75rem;">👑 PRO</span>';
      btnAnimate.style.background = 'rgba(245, 166, 35, 0.1)';
      btnAnimate.style.borderColor = 'var(--accent-amber)';
    }
    animationTime = 0;
    animateLoop();
  }

  function stopAnimation() {
    isAnimating = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    if (btnAnimate) {
      btnAnimate.innerHTML = '▶ <span>Auto-Play</span> <span style="color: var(--accent-gold); font-size: 0.75rem;">👑 PRO</span>';
      btnAnimate.style.background = 'rgba(255,255,255,0.05)';
      btnAnimate.style.borderColor = 'var(--border-color)';
    }
  }

  if (btnAnimate) {
    btnAnimate.addEventListener('click', () => {
      if (isAnimating) {
        stopAnimation();
      } else {
        if (typeof lfAuth !== 'undefined') {
          const hasAccess = lfAuth.gateFeature('Hoạt ảnh tự động Vertigo (Auto-Play)', () => {
            stopAnimation();
          });
          if (!hasAccess) return;
        }
        startAnimation();
      }
    });
  }

  // 8. Zoom Slider Interaction
  if (slider) {
    slider.addEventListener('input', () => {
      // If user manually drags slider while animating, pause the animation
      if (isAnimating) {
        stopAnimation();
      }
      updateScene();
    });
  }

  // 9. Preload Vertigo Alley on startup
  loadPreset('vertigo', presetVertigo);
});
