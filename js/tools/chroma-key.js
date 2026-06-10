document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const uploadOverlay = document.getElementById('upload-overlay');
  
  const fgCanvas = document.getElementById('fg-canvas');
  const fgCtx = fgCanvas.getContext('2d', { willReadFrequently: true });
  
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas.getContext('2d');

  const sliderTolerance = document.getElementById('slider-tolerance');
  const valTolerance = document.getElementById('val-tolerance');
  const sliderDespill = document.getElementById('slider-despill');
  const valDespill = document.getElementById('val-despill');
  
  const keyColorBox = document.getElementById('key-color-box');
  const btnChangeBg = document.getElementById('btn-change-bg');

  let originalImgData = null;
  let targetColor = { r: 0, g: 255, b: 0 }; // Default pure green
  const MAX_DIMENSION = 1200;

  // 1. Draw Default Background
  const bgs = [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop', // Space
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop', // Cyberpunk city
    'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1200&auto=format&fit=crop' // Neon studio
  ];
  let bgIndex = 0;

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
    img.src = bgs[bgIndex];
  }

  btnChangeBg.addEventListener('click', () => {
    bgIndex = (bgIndex + 1) % bgs.length;
    loadBackground();
  });

  // 2. Upload Foreground
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
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
        fgCtx.drawImage(img, 0, 0, w, h);
        originalImgData = fgCtx.getImageData(0, 0, w, h);
        
        loadBackground(); // sync bg size
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // 3. Pick Color
  fgCanvas.addEventListener('click', (e) => {
    if (!originalImgData) return;
    
    // Calculate actual canvas coordinates based on scaling
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
    
    // Adjust text color for readability
    const lum = 0.299*targetColor.r + 0.587*targetColor.g + 0.114*targetColor.b;
    keyColorBox.style.color = lum > 128 ? '#000' : '#fff';

    applyKey();
  });

  function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
  }

  // 4. Apply Chroma Key
  function applyKey() {
    if (!originalImgData) return;

    const tolerance = parseInt(sliderTolerance.value);
    const doDespill = parseInt(sliderDespill.value) === 1;

    const imgData = new ImageData(
      new Uint8ClampedArray(originalImgData.data),
      originalImgData.width,
      originalImgData.height
    );
    const data = imgData.data;

    const tr = targetColor.r;
    const tg = targetColor.g;
    const tb = targetColor.b;
    
    // Determine dominant channel of target color for despill
    const isGreenScreen = tg > tr && tg > tb;
    const isBlueScreen = tb > tr && tb > tg;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i+1];
      let b = data[i+2];

      // Euclidean distance in RGB space
      const distance = Math.sqrt((r - tr)**2 + (g - tg)**2 + (b - tb)**2);

      // Feathering (Soft edge) range
      const feather = 30; 

      if (distance < tolerance) {
        // Fully transparent
        data[i+3] = 0;
      } else if (distance < tolerance + feather) {
        // Partially transparent
        const alphaRatio = (distance - tolerance) / feather;
        data[i+3] = Math.floor(255 * alphaRatio);

        // Despill: Clamp the dominant color so the fringe doesn't glow
        if (doDespill) {
          if (isGreenScreen) {
            data[i+1] = Math.min(g, Math.max(r, b)); // Clamp Green
          } else if (isBlueScreen) {
            data[i+2] = Math.min(b, Math.max(r, g)); // Clamp Blue
          }
        }
      }
    }

    fgCtx.putImageData(imgData, 0, 0);
  }

  // Events
  sliderTolerance.addEventListener('input', (e) => {
    valTolerance.textContent = e.target.value;
    applyKey();
  });
  
  sliderDespill.addEventListener('input', (e) => {
    valDespill.textContent = e.target.value == "1" ? "Mạnh" : "Tắt";
    applyKey();
  });

});
