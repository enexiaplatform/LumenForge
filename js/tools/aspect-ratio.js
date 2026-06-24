document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('crop-canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const fileUpload = document.getElementById('file-upload');
  const sliderPan = document.getElementById('slider-pan');
  const valPan = document.getElementById('val-pan');
  const btnDownload = document.getElementById('btn-download');
  const hudText = document.getElementById('hud-text');
  const ratioBtns = document.querySelectorAll('.ratio-btn');

  let originalImage = null;
  let currentRatio = 0; // 0 = Original
  let panOffset = 0;
  
  let previousRatio = 0;
  let previousPan = 0;
  const MAX_CANVAS_DIM = 1200; // Optimal editing/saving resolution

  // 1. Render Function (Core Engine)
  function render() {
    if (!originalImage) return;

    let w = originalImage.width;
    let h = originalImage.height;
    if (w > MAX_CANVAS_DIM || h > MAX_CANVAS_DIM) {
      const ratio = Math.min(MAX_CANVAS_DIM / w, MAX_CANVAS_DIM / h);
      w = Math.floor(w * ratio);
      h = Math.floor(h * ratio);
    }

    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    const imgRatio = w / h;

    if (currentRatio === 0) {
      // Draw full image, no crop
      ctx.drawImage(originalImage, 0, 0, w, h);
      if (sliderPan) {
        sliderPan.disabled = true;
        sliderPan.min = 0;
        sliderPan.max = 0;
        sliderPan.value = 0;
      }
      if (valPan) valPan.textContent = 'Không khả dụng';
      panOffset = 0;
    } else {
      if (currentRatio > imgRatio) {
        // Horizontal crop (bars on top & bottom)
        const newH = w / currentRatio;
        const barSize = (h - newH) / 2;

        // Set slider range dynamically
        if (sliderPan) {
          sliderPan.disabled = false;
          const maxLimit = Math.round(barSize);
          sliderPan.min = -maxLimit;
          sliderPan.max = maxLimit;
          // Constrain current panOffset to new range
          panOffset = Math.min(maxLimit, Math.max(-maxLimit, panOffset));
          sliderPan.value = panOffset;
          if (valPan) valPan.textContent = `${panOffset} px`;
        }

        // Draw image shifted vertically by panOffset
        ctx.drawImage(originalImage, 0, panOffset, w, h);

        // Draw top & bottom black bars
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, barSize);
        ctx.fillRect(0, h - barSize, w, barSize);
      } else {
        // Vertical crop (bars on left & right)
        const newW = h * currentRatio;
        const barSize = (w - newW) / 2;

        // Set slider range dynamically
        if (sliderPan) {
          sliderPan.disabled = false;
          const maxLimit = Math.round(barSize);
          sliderPan.min = -maxLimit;
          sliderPan.max = maxLimit;
          panOffset = Math.min(maxLimit, Math.max(-maxLimit, panOffset));
          sliderPan.value = panOffset;
          if (valPan) valPan.textContent = `${panOffset} px`;
        }

        // Draw image shifted horizontally by panOffset
        ctx.drawImage(originalImage, panOffset, 0, w, h);

        // Draw left & right black bars
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, barSize, h);
        ctx.fillRect(w - barSize, 0, barSize, h);
      }
    }
  }

  // 2. Image Loading Helper
  function loadSample(url, thumbId) {
    document.querySelectorAll('.sample-thumb').forEach(el => {
      el.style.borderColor = 'var(--border-color)';
    });
    const activeThumb = document.getElementById(thumbId);
    if (activeThumb) {
      activeThumb.style.borderColor = 'var(--accent-cyan)';
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      originalImage = img;
      panOffset = 0;
      previousPan = 0;
      render();
    };
    img.src = url;
  }

  // 3. File Upload Handler
  fileUpload.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          document.querySelectorAll('.sample-thumb').forEach(el => {
            el.style.borderColor = 'var(--border-color)';
          });
          originalImage = img;
          panOffset = 0;
          previousPan = 0;
          
          // Reset aspect ratio buttons to Original
          ratioBtns.forEach(b => b.classList.remove('active'));
          const originalBtn = document.querySelector('.ratio-btn[data-ratio="0"]');
          if (originalBtn) originalBtn.classList.add('active');
          currentRatio = 0;
          previousRatio = 0;
          if (hudText) hudText.innerText = "Ratio: Original";
          
          render();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  // 4. Aspect Ratio Selection & Gating
  ratioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!originalImage) return;

      const ratioVal = parseFloat(btn.getAttribute('data-ratio'));
      const isPro = btn.getAttribute('data-pro') === 'true';

      if (isPro && typeof lfAuth !== 'undefined') {
        const ratioName = btn.querySelector('.ratio-name').textContent.replace('👑 ', '');
        const featureName = `Tỉ lệ Khung hình ${ratioName} (${btn.querySelector('.ratio-val').textContent})`;
        const hasAccess = lfAuth.gateFeature(featureName, () => {
          // Fallback: Revert to previous active button
          ratioBtns.forEach(b => b.classList.remove('active'));
          const fallbackBtn = document.querySelector(`.ratio-btn[data-ratio="${previousRatio}"]`);
          if (fallbackBtn) {
            fallbackBtn.classList.add('active');
            currentRatio = previousRatio;
            if (hudText) hudText.innerText = "Ratio: " + fallbackBtn.querySelector('.ratio-val').innerText;
          } else {
            const originalBtn = document.querySelector('.ratio-btn[data-ratio="0"]');
            if (originalBtn) originalBtn.classList.add('active');
            currentRatio = 0;
            if (hudText) hudText.innerText = "Ratio: Gốc";
          }
          render();
        });
        if (!hasAccess) return;
      }

      ratioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      previousRatio = currentRatio;
      currentRatio = ratioVal;
      
      if (hudText) {
        hudText.innerText = "Ratio: " + btn.querySelector('.ratio-val').innerText;
      }
      
      render();
    });
  });

  // 5. Re-framing (Pan Offset) Gating & Real-time sliding
  if (sliderPan) {
    sliderPan.addEventListener('input', (e) => {
      if (!originalImage) return;
      panOffset = parseInt(e.target.value);
      if (valPan) valPan.textContent = `${panOffset} px`;
      render();
    });

    sliderPan.addEventListener('change', (e) => {
      if (!originalImage) return;
      const val = parseInt(e.target.value);
      if (val !== 0) {
        if (typeof lfAuth !== 'undefined') {
          const hasAccess = lfAuth.gateFeature('Cân chỉnh Khung hình (Re-framing / Pan)', () => {
            sliderPan.value = 0;
            panOffset = 0;
            if (valPan) valPan.textContent = '0 px';
            render();
          });
          if (!hasAccess) return;
        }
      }
      previousPan = panOffset;
      render();
    });
  }

  // 6. Download Cropped Image & Gating
  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      if (!originalImage) return;

      if (typeof lfAuth !== 'undefined') {
        const hasAccess = lfAuth.gateFeature('Tải ảnh đã cắt (Aspect Ratio Crop Download)', () => {});
        if (!hasAccess) return;
      }

      const activeBtn = document.querySelector('.ratio-btn.active');
      const ratioName = activeBtn ? activeBtn.querySelector('.ratio-val').textContent.replace(':', '_') : 'original';

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `LumenForge_Crop_${ratioName}.jpg`;
      a.click();
    });
  }

  // 7. Bind Sample Click Events
  const sample1 = document.getElementById('sample-1');
  const sample2 = document.getElementById('sample-2');
  const sample3 = document.getElementById('sample-3');

  if (sample1) {
    sample1.addEventListener('click', () => {
      loadSample('https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1200&auto=format&fit=crop', 'sample-1');
    });
  }
  if (sample2) {
    sample2.addEventListener('click', () => {
      loadSample('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop', 'sample-2');
    });
  }
  if (sample3) {
    sample3.addEventListener('click', () => {
      loadSample('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop', 'sample-3');
    });
  }

  // 8. Preload First Sample Instantly
  loadSample('https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1200&auto=format&fit=crop', 'sample-1');
});
