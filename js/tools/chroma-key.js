document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const uploadOverlay = document.getElementById('upload-overlay');
  
  const fgCanvas = document.getElementById('fg-canvas');
  const fgCtx = fgCanvas.getContext('2d', { willReadFrequently: true });
  
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas.getContext('2d');

  const sliderTolerance = document.getElementById('slider-tolerance');
  const valTolerance = document.getElementById('val-tolerance');
  
  const inpBg = document.getElementById('inp-bg');
  const sliderChoke = document.getElementById('slider-choke');
  const valChoke = document.getElementById('val-choke');
  const inpDespillAlgo = document.getElementById('inp-despill-algo');
  
  const keyColorBox = document.getElementById('key-color-box');

  let originalImgData = null;
  let targetColor = { r: 245, g: 195, b: 110 }; // Default key color matching Sample 1 background
  const MAX_DIMENSION = 1200;

  // Track previous values for PRO gating revert
  let previousBg = inpBg.value;
  let previousDespillAlgo = inpDespillAlgo.value;

  // 1. Draw Background
  function loadBackground() {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      bgCanvas.width = fgCanvas.width || 800;
      bgCanvas.height = fgCanvas.height || 600;
      // Fill to cover
      const hRatio = bgCanvas.width / img.width;
      const vRatio = bgCanvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (bgCanvas.width - img.width * ratio) / 2;
      const centerShift_y = (bgCanvas.height - img.height * ratio) / 2;
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      bgCtx.drawImage(img, 0, 0, img.width, img.height,
                        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    };
    img.src = inpBg.value;
  }

  // Intercept VIP PRO Background Selection
  inpBg.addEventListener('focus', () => {
    previousBg = inpBg.value;
  });

  inpBg.addEventListener('change', () => {
    const selectedOption = inpBg.options[inpBg.selectedIndex];
    if (selectedOption && selectedOption.getAttribute('data-pro') === 'true') {
      if (typeof lfAuth !== 'undefined') {
        const featureName = `Ảnh nền ${selectedOption.text.replace('👑 ', '').replace(' (VIP PRO)', '')}`;
        const hasAccess = lfAuth.gateFeature(featureName, () => {
          inpBg.value = previousBg;
          loadBackground();
        });

        if (hasAccess) {
          previousBg = inpBg.value;
        }
      }
    } else {
      previousBg = inpBg.value;
    }
    loadBackground();
  });

  // 2. Upload Foreground File
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        uploadOverlay.style.display = 'none';
        
        // Remove border highlight from samples when custom file is uploaded
        document.querySelectorAll('.sample-thumb').forEach(el => {
          el.style.borderColor = 'var(--border-color)';
        });

        let w = img.width;
        let h = img.height;
        if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
          w = Math.floor(w * ratio);
          h = Math.floor(h * ratio);
        }

        fgCanvas.width = w;
        fgCanvas.height = h;
        fgCtx.drawImage(img, 0, 0, w, h);
        originalImgData = fgCtx.getImageData(0, 0, w, h);
        
        loadBackground(); // sync bg size
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // 3. Load Sample Image Helper
  function loadSampleImage(url, thumbId) {
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
      uploadOverlay.style.display = 'none';
      
      let w = img.width;
      let h = img.height;
      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
        w = Math.floor(w * ratio);
        h = Math.floor(h * ratio);
      }

      fgCanvas.width = w;
      fgCanvas.height = h;
      fgCtx.clearRect(0, 0, w, h);
      fgCtx.drawImage(img, 0, 0, w, h);
      originalImgData = fgCtx.getImageData(0, 0, w, h);
      
      // Auto pick key color from background pixel (10, 10)
      const cornerIndex = (10 * w + 10) * 4;
      targetColor.r = originalImgData.data[cornerIndex];
      targetColor.g = originalImgData.data[cornerIndex + 1];
      targetColor.b = originalImgData.data[cornerIndex + 2];

      const hex = rgbToHex(targetColor.r, targetColor.g, targetColor.b);
      keyColorBox.style.background = hex;
      keyColorBox.textContent = hex.toUpperCase();
      const lum = 0.299*targetColor.r + 0.587*targetColor.g + 0.114*targetColor.b;
      keyColorBox.style.color = lum > 128 ? '#000' : '#fff';

      loadBackground(); // sync bg size
      applyKey();
    };
    img.src = url;
  }

  // 4. Pick Color on Canvas Click
  fgCanvas.addEventListener('click', (e) => {
    if (!originalImgData) return;
    
    const rect = fgCanvas.getBoundingClientRect();
    const scaleX = fgCanvas.width / rect.width;
    const scaleY = fgCanvas.height / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const index = (y * fgCanvas.width + x) * 4;
    targetColor.r = originalImgData.data[index];
    targetColor.g = originalImgData.data[index + 1];
    targetColor.b = originalImgData.data[index + 2];

    const hex = rgbToHex(targetColor.r, targetColor.g, targetColor.b);
    keyColorBox.style.background = hex;
    keyColorBox.textContent = hex.toUpperCase();
    
    const lum = 0.299*targetColor.r + 0.587*targetColor.g + 0.114*targetColor.b;
    keyColorBox.style.color = lum > 128 ? '#000' : '#fff';

    applyKey();
  });

  function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
  }

  // 5. Apply Chroma Key VFX Algorithm
  function applyKey() {
    if (!originalImgData) return;

    const tolerance = parseInt(sliderTolerance.value);
    const choke = parseInt(sliderChoke.value);
    const despillAlgo = inpDespillAlgo.value;

    const imgData = new ImageData(
      new Uint8ClampedArray(originalImgData.data),
      originalImgData.width,
      originalImgData.height
    );
    const data = imgData.data;

    const tr = targetColor.r;
    const tg = targetColor.g;
    const tb = targetColor.b;
    
    const isGreenScreen = tg > tr && tg > tb;
    const isBlueScreen = tb > tr && tb > tg;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i+1];
      let b = data[i+2];

      // Euclidean distance
      const distance = Math.sqrt((r - tr)**2 + (g - tg)**2 + (b - tb)**2);
      const feather = 30; 

      if (distance < tolerance) {
        data[i+3] = 0;
      } else if (distance < tolerance + feather) {
        const alphaRatio = (distance - tolerance) / feather;
        data[i+3] = Math.floor(255 * alphaRatio);

        // Advanced Despill Algorithms
        if (despillAlgo === 'clamp') {
          if (isGreenScreen) {
            data[i+1] = Math.min(g, Math.max(r, b));
          } else if (isBlueScreen) {
            data[i+2] = Math.min(b, Math.max(r, g));
          }
        } else if (despillAlgo === 'average') {
          if (isGreenScreen) {
            data[i+1] = Math.min(g, (r + b) / 2);
          } else if (isBlueScreen) {
            data[i+2] = Math.min(b, (r + g) / 2);
          }
        } else if (despillAlgo === 'luminance') {
          if (isGreenScreen) {
            data[i+1] = Math.min(g, 0.299 * r + 0.114 * b);
          } else if (isBlueScreen) {
            data[i+2] = Math.min(b, 0.299 * r + 0.587 * g);
          }
        }
      }
    }

    // Apply Edge Erosion / Choke Morphological filter
    if (choke > 0) {
      const tempAlpha = new Uint8Array(data.length / 4);
      for (let i = 3; i < data.length; i += 4) {
        tempAlpha[i / 4] = data[i];
      }
      const width = imgData.width;
      const height = imgData.height;
      for (let y = choke; y < height - choke; y++) {
        for (let x = choke; x < width - choke; x++) {
          const idx = (y * width + x) * 4;
          if (data[idx + 3] > 0) {
            const aLeft = tempAlpha[y * width + (x - choke)];
            const aRight = tempAlpha[y * width + (x + choke)];
            const aUp = tempAlpha[(y - choke) * width + x];
            const aDown = tempAlpha[(y + choke) * width + x];
            if (aLeft === 0 || aRight === 0 || aUp === 0 || aDown === 0) {
              data[idx + 3] = 0; // Set edge pixel transparent
            }
          }
        }
      }
    }

    fgCtx.putImageData(imgData, 0, 0);
  }

  // Intercept VIP PRO Edge Choke
  sliderChoke.addEventListener('input', (e) => {
    valChoke.textContent = `${e.target.value} px`;
  });

  sliderChoke.addEventListener('change', (e) => {
    const val = parseInt(e.target.value);
    if (val > 0) {
      if (typeof lfAuth !== 'undefined') {
        const hasAccess = lfAuth.gateFeature('Tính năng Choke Viền (Edge Choke)', () => {
          sliderChoke.value = 0;
          valChoke.textContent = '0 px';
          applyKey();
        });
        if (!hasAccess) return;
      }
    }
    applyKey();
  });

  // Intercept VIP PRO Despill Algorithm Selection
  inpDespillAlgo.addEventListener('focus', () => {
    previousDespillAlgo = inpDespillAlgo.value;
  });

  inpDespillAlgo.addEventListener('change', () => {
    const selectedOption = inpDespillAlgo.options[inpDespillAlgo.selectedIndex];
    if (selectedOption && selectedOption.getAttribute('data-pro') === 'true') {
      if (typeof lfAuth !== 'undefined') {
        const featureName = `Thuật toán ${selectedOption.text.replace('👑 ', '').replace(' (VIP PRO)', '')}`;
        const hasAccess = lfAuth.gateFeature(featureName, () => {
          inpDespillAlgo.value = previousDespillAlgo;
          applyKey();
        });
        if (hasAccess) {
          previousDespillAlgo = inpDespillAlgo.value;
        }
      }
    } else {
      previousDespillAlgo = inpDespillAlgo.value;
    }
    applyKey();
  });

  // Tolerance Adjustment
  sliderTolerance.addEventListener('input', (e) => {
    valTolerance.textContent = e.target.value;
    applyKey();
  });

  // Bind Sample Click Events
  const sample1 = document.getElementById('sample-1');
  const sample2 = document.getElementById('sample-2');
  const sample3 = document.getElementById('sample-3');

  if (sample1) {
    sample1.addEventListener('click', () => {
      loadSampleImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', 'sample-1');
    });
  }
  if (sample2) {
    sample2.addEventListener('click', () => {
      loadSampleImage('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop', 'sample-2');
    });
  }
  if (sample3) {
    sample3.addEventListener('click', () => {
      loadSampleImage('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop', 'sample-3');
    });
  }

  // Preload first sample instantly so the user is wowed and can interact immediately
  loadSampleImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', 'sample-1');
});
