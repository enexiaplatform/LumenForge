document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const uploadOverlay = document.getElementById('upload-overlay');
  const canvas = document.getElementById('img-canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const loader = document.getElementById('loader');
  
  const buttons = document.querySelectorAll('.film-btn');
  const btnDownload = document.getElementById('btn-download');

  const sliderGrain = document.getElementById('slider-grain');
  const valGrain = document.getElementById('val-grain');

  let originalImage = null;
  let originalImageData = null;
  let previousFilm = 'original';
  const MAX_DIMENSION = 1200; // Limit processing size

  // 1. Handle Upload
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        uploadOverlay.classList.add('hidden');
        // Remove border highlight from samples when custom file is uploaded
        document.querySelectorAll('.sample-thumb').forEach(el => {
          el.style.borderColor = 'var(--border-color)';
        });
        processImageSize(img);
        
        // Reset buttons
        buttons.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-film="original"]').classList.add('active');
        previousFilm = 'original';
        
        applyFilter('original');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  function processImageSize(img) {
    let w = img.width;
    let h = img.height;

    // Resize if too big
    if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
      w = Math.floor(w * ratio);
      h = Math.floor(h * ratio);
    }

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    
    // Store original data
    originalImageData = ctx.getImageData(0, 0, w, h);
    originalImage = img;
  }

  // 2. Handle Filter Click
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!originalImageData) return;
      
      const film = btn.getAttribute('data-film');
      const isPro = btn.getAttribute('data-pro') === 'true';

      if (isPro && typeof lfAuth !== 'undefined') {
        const featureName = `Film Stock ${btn.querySelector('h4').textContent.replace('👑 ', '').replace(' (VIP PRO)', '')}`;
        const hasAccess = lfAuth.gateFeature(featureName, () => {
          // Fallback: revert to previous active button
          buttons.forEach(b => b.classList.remove('active'));
          const fallbackBtn = document.querySelector(`[data-film="${previousFilm}"]`);
          if (fallbackBtn) {
            fallbackBtn.classList.add('active');
            applyFilter(previousFilm);
          } else {
            document.querySelector('[data-film="original"]').classList.add('active');
            applyFilter('original');
          }
        });
        if (!hasAccess) return;
      }
      
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      previousFilm = film;
      
      applyFilter(film);
    });
  });

  // 3. Filter Logic
  function applyFilter(film) {
    if (!originalImageData) return;
    loader.style.display = 'block';
    
    // Use setTimeout to allow UI to update the loader before heavy processing
    setTimeout(() => {
      const imgData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
      );
      
      const data = imgData.data;
      const w = imgData.width;
      const h = imgData.height;

      // Helpers
      const clamp = (val) => Math.min(255, Math.max(0, val));
      const contrast = (c, factor) => clamp((c - 128) * factor + 128);

      const grainStrength = sliderGrain ? parseInt(sliderGrain.value) : 20;
      
      let grainMultiplier = 0;
      if (film === 'portra') grainMultiplier = 0.75;
      else if (film === 'cinestill') grainMultiplier = 1.0;
      else if (film === 'fuji') grainMultiplier = 0.5;
      else if (film === 'trix') grainMultiplier = 2.0;
      else if (film === 'kodak-gold') grainMultiplier = 1.1;
      else if (film === 'fuji-velvia') grainMultiplier = 0.5;
      else if (film === 'polaroid') grainMultiplier = 1.3;
      else if (film === 'ilford') grainMultiplier = 2.25;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i+1];
        let b = data[i+2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (film === 'portra') {
          // Warmth
          r += 15;
          b -= 10;
          
          // Contrast
          r = contrast(r, 1.1);
          g = contrast(g, 1.1);
          b = contrast(b, 1.1);
          
          // Fade blacks (lift shadows)
          if (lum < 50) {
            const lift = (50 - lum) * 0.4;
            r += lift; g += lift; b += lift;
          }
        } 
        else if (film === 'cinestill') {
          // Tungsten WB (cool down)
          r -= 10;
          b += 20;

          // Contrast
          r = contrast(r, 1.2);
          g = contrast(g, 1.2);
          b = contrast(b, 1.2);

          // Fake Halation (Red glow in highlights)
          if (lum > 200) {
            r = clamp(r + 40);
            g -= 10;
            b -= 10;
          }
        }
        else if (film === 'fuji') {
          // Green shadows
          if (lum < 100) {
            g += 15;
            r -= 5;
          }

          // Contrast & Saturation
          r = contrast(r, 1.15);
          g = contrast(g, 1.15);
          b = contrast(b, 1.15);
        }
        else if (film === 'trix') {
          // Grayscale
          let gray = lum;
          
          // High contrast
          gray = contrast(gray, 1.4);
          r = gray; g = gray; b = gray;
        }
        else if (film === 'kodak-gold') {
          // Warm golden tones
          r += 20;
          g += 10;
          b -= 15;

          // Minor saturation boost
          const satFactor = 1.2;
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray + (r - gray) * satFactor;
          g = gray + (g - gray) * satFactor;
          b = gray + (b - gray) * satFactor;

          // Contrast
          r = contrast(r, 1.15);
          g = contrast(g, 1.15);
          b = contrast(b, 1.15);
        }
        else if (film === 'fuji-velvia') {
          // High contrast and ultra-saturated colors, boosting Green and Blue
          g += 10;
          b += 5;

          // Ultra-saturated
          const satFactor = 1.4;
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray + (r - gray) * satFactor;
          g = gray + (g - gray) * satFactor;
          b = gray + (b - gray) * satFactor;

          // Contrast
          r = contrast(r, 1.25);
          g = contrast(g, 1.25);
          b = contrast(b, 1.25);
        }
        else if (film === 'polaroid') {
          // Faded contrast (lift shadows, compress highlights)
          r = r * 0.8 + 30;
          g = g * 0.8 + 30;
          b = b * 0.8 + 30;

          // Recalculate lum for color cast
          const tempLum = 0.299 * r + 0.587 * g + 0.114 * b;

          // Cyan shadows & Warm yellow highlights
          if (tempLum < 110) {
            g += 12;
            b += 18;
            r -= 8;
          } else if (tempLum > 150) {
            r += 15;
            g += 10;
            b -= 12;
          }

          // Saturation faded
          const satFactor = 0.8;
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray + (r - gray) * satFactor;
          g = gray + (g - gray) * satFactor;
          b = gray + (b - gray) * satFactor;
        }
        else if (film === 'ilford') {
          // Sleek, dramatic high-contrast grayscale
          let gray = lum;
          gray = contrast(gray, 1.3);
          r = gray; g = gray; b = gray;
        }

        // Apply Grain globally
        if (grainMultiplier > 0 && grainStrength > 0) {
          const noise = (Math.random() - 0.5) * (grainStrength * grainMultiplier);
          r += noise;
          g += noise;
          b += noise;
        }

        data[i] = clamp(r);
        data[i+1] = clamp(g);
        data[i+2] = clamp(b);
      }

      ctx.putImageData(imgData, 0, 0);
      loader.style.display = 'none';
    }, 50);
  }

  // 4. Load Sample Image Helper
  function loadSampleImage(url, thumbId) {
    document.querySelectorAll('.sample-thumb').forEach(el => {
      el.style.borderColor = 'var(--border-color)';
    });
    const activeThumb = document.getElementById(thumbId);
    if (activeThumb) {
      activeThumb.style.borderColor = 'var(--accent-cyan)';
    }

    loader.style.display = 'block';

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      uploadOverlay.classList.add('hidden');
      processImageSize(img);
      
      // Auto-apply currently active filter
      const activeBtn = document.querySelector('.film-btn.active');
      const film = activeBtn ? activeBtn.getAttribute('data-film') : 'original';
      applyFilter(film);
    };
    img.src = url;
  }

  // 5. Custom Grain Gating
  if (sliderGrain) {
    sliderGrain.addEventListener('input', (e) => {
      updateGrainText(e.target.value);
    });

    sliderGrain.addEventListener('change', (e) => {
      const val = parseInt(e.target.value);
      if (val !== 20) {
        if (typeof lfAuth !== 'undefined') {
          const hasAccess = lfAuth.gateFeature('Tùy chỉnh hạt Film (Custom Grain)', () => {
            sliderGrain.value = 20;
            updateGrainText(20);
            const activeBtn = document.querySelector('.film-btn.active');
            const film = activeBtn ? activeBtn.getAttribute('data-film') : 'original';
            applyFilter(film);
          });
          if (!hasAccess) return;
        }
      }
      const activeBtn = document.querySelector('.film-btn.active');
      const film = activeBtn ? activeBtn.getAttribute('data-film') : 'original';
      applyFilter(film);
    });
  }

  function updateGrainText(val) {
    if (valGrain) {
      if (parseInt(val) === 20) {
        valGrain.textContent = 'Mặc định';
      } else {
        valGrain.textContent = `${val}%`;
      }
    }
  }

  // Bind Sample Click Events
  const sample1 = document.getElementById('sample-1');
  const sample2 = document.getElementById('sample-2');
  const sample3 = document.getElementById('sample-3');

  if (sample1) {
    sample1.addEventListener('click', () => {
      loadSampleImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop', 'sample-1');
    });
  }
  if (sample2) {
    sample2.addEventListener('click', () => {
      loadSampleImage('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop', 'sample-2');
    });
  }
  if (sample3) {
    sample3.addEventListener('click', () => {
      loadSampleImage('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop', 'sample-3');
    });
  }

  // Preload first sample instantly so the user is wowed and can interact immediately
  loadSampleImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop', 'sample-1');

  // 6. Download
  btnDownload.addEventListener('click', () => {
    if (!originalImageData) return;
    const activeBtn = document.querySelector('.film-btn.active');
    const filmName = activeBtn ? activeBtn.getAttribute('data-film') : 'original';
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `LumenForge_${filmName}.jpg`;
    a.click();
  });
});
