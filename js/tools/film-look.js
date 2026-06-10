document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const uploadOverlay = document.getElementById('upload-overlay');
  const canvas = document.getElementById('img-canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const loader = document.getElementById('loader');
  
  const buttons = document.querySelectorAll('.film-btn');
  const btnDownload = document.getElementById('btn-download');

  let originalImage = null;
  let originalImageData = null;
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
        processImageSize(img);
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

    // Reset buttons
    buttons.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-film="original"]').classList.add('active');
  }

  // 2. Handle Filter Click
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!originalImageData) return;
      
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const film = btn.getAttribute('data-film');
      applyFilter(film);
    });
  });

  // 3. Filter Logic
  function applyFilter(film) {
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

          // Grain
          const noise = (Math.random() - 0.5) * 15;
          r += noise; g += noise; b += noise;
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

          // Grain
          const noise = (Math.random() - 0.5) * 20;
          r += noise; g += noise; b += noise;
        }
        else if (film === 'fuji') {
          // Green shadows
          if (lum < 100) {
            g += 15;
            r -= 5;
          }

          // Contrast & Saturation (simple approach)
          r = contrast(r, 1.15);
          g = contrast(g, 1.15);
          b = contrast(b, 1.15);

          // Grain
          const noise = (Math.random() - 0.5) * 10;
          r += noise; g += noise; b += noise;
        }
        else if (film === 'trix') {
          // Grayscale
          let gray = lum;
          
          // High contrast
          gray = contrast(gray, 1.4);

          // Heavy Grain
          const noise = (Math.random() - 0.5) * 40;
          gray += noise;

          r = gray; g = gray; b = gray;
        }

        data[i] = clamp(r);
        data[i+1] = clamp(g);
        data[i+2] = clamp(b);
      }

      ctx.putImageData(imgData, 0, 0);
      loader.style.display = 'none';
    }, 50);
  }

  // 4. Download
  btnDownload.addEventListener('click', () => {
    if (!originalImageData) return;
    const activeBtn = document.querySelector('.film-btn.active');
    const filmName = activeBtn ? activeBtn.getAttribute('data-film') : 'original';
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = \`LumenForge_\${filmName}.jpg\`;
    a.click();
  });
});
