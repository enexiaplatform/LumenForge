document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const uploadOverlay = document.getElementById('upload-overlay');
  
  const imgCanvas = document.getElementById('image-canvas');
  const ctxImg = imgCanvas.getContext('2d', { willReadFrequently: true });
  
  const overlayCanvas = document.getElementById('overlay-canvas');
  const ctxOverlay = overlayCanvas.getContext('2d');

  const swatches = [
    document.getElementById('c1'),
    document.getElementById('c2'),
    document.getElementById('c3'),
    document.getElementById('c4'),
    document.getElementById('c5')
  ];

  const toggles = {
    thirds: document.getElementById('toggle-thirds'),
    golden: document.getElementById('toggle-golden'),
    diagonal: document.getElementById('toggle-diagonal')
  };

  let currentImage = null;

  // 1. Handle File Upload
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        currentImage = img;
        uploadOverlay.classList.add('hidden');
        renderImage();
        extractPalette();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Handle Window Resize
  window.addEventListener('resize', () => {
    if (currentImage) {
      renderImage();
    }
  });

  // 2. Render Image
  function renderImage() {
    const container = imgCanvas.parentElement;
    const maxWidth = container.clientWidth;
    const maxHeight = container.clientHeight;

    // Calculate aspect ratio
    const ratio = Math.min(maxWidth / currentImage.width, maxHeight / currentImage.height);
    const newWidth = currentImage.width * ratio;
    const newHeight = currentImage.height * ratio;

    imgCanvas.width = newWidth;
    imgCanvas.height = newHeight;
    overlayCanvas.width = newWidth;
    overlayCanvas.height = newHeight;

    ctxImg.drawImage(currentImage, 0, 0, newWidth, newHeight);
    
    drawOverlays();
  }

  // 3. Extract Color Palette
  function extractPalette() {
    // Hide old swatches
    swatches.forEach(s => s.style.opacity = '0');

    // Create a tiny canvas to quickly sample colors and blur details
    const off = document.createElement('canvas');
    off.width = 64;
    off.height = 64;
    const octx = off.getContext('2d');
    octx.drawImage(currentImage, 0, 0, 64, 64);

    const imgData = octx.getImageData(0, 0, 64, 64).data;
    const colorCounts = {};

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i+1];
      const b = imgData[i+2];
      
      // Ignore near black/white
      if ((r < 20 && g < 20 && b < 20) || (r > 240 && g > 240 && b > 240)) continue;

      // Quantize to groups of 32 to cluster similar colors
      const qr = Math.round(r / 32) * 32;
      const qg = Math.round(g / 32) * 32;
      const qb = Math.round(b / 32) * 32;
      const hex = rgbToHex(qr, qg, qb);

      if (colorCounts[hex]) {
        colorCounts[hex]++;
      } else {
        colorCounts[hex] = 1;
      }
    }

    // Sort by frequency
    const sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);
    
    // Pick top 5 colors that are sufficiently different
    const finalPalette = [];
    for (let i = 0; i < sortedColors.length; i++) {
      if (finalPalette.length >= 5) break;
      const c = sortedColors[i];
      
      // Simple difference check
      let isDifferent = true;
      for (let existing of finalPalette) {
        if (colorDistance(c, existing) < 60) {
          isDifferent = false;
          break;
        }
      }
      
      if (isDifferent) {
        finalPalette.push(c);
      }
    }

    // Fallback if we didn't get 5 colors
    while(finalPalette.length < 5) {
      finalPalette.push('#333333');
    }

    // Animate swatches
    setTimeout(() => {
      finalPalette.forEach((color, i) => {
        swatches[i].style.background = color;
        swatches[i].querySelector('span').textContent = color.toUpperCase();
        swatches[i].style.opacity = '1';
      });
    }, 300);
  }

  // 4. Overlays
  Object.values(toggles).forEach(toggle => {
    toggle.addEventListener('change', drawOverlays);
  });

  function drawOverlays() {
    if (!currentImage) return;

    const w = overlayCanvas.width;
    const h = overlayCanvas.height;
    ctxOverlay.clearRect(0, 0, w, h);

    ctxOverlay.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctxOverlay.lineWidth = 1.5;

    // Rule of Thirds
    if (toggles.thirds.checked) {
      ctxOverlay.setLineDash([]);
      // Vertical
      ctxOverlay.beginPath();
      ctxOverlay.moveTo(w / 3, 0); ctxOverlay.lineTo(w / 3, h);
      ctxOverlay.moveTo(w * 2 / 3, 0); ctxOverlay.lineTo(w * 2 / 3, h);
      // Horizontal
      ctxOverlay.moveTo(0, h / 3); ctxOverlay.lineTo(w, h / 3);
      ctxOverlay.moveTo(0, h * 2 / 3); ctxOverlay.lineTo(w, h * 2 / 3);
      ctxOverlay.stroke();
    }

    // Golden Ratio (Phi Grid: 1 : 1.618 : 1 => 0.276 : 0.448 : 0.276 actually, 
    // but the intersection lines are at approx 0.382 and 0.618
    if (toggles.golden.checked) {
      ctxOverlay.setLineDash([5, 5]);
      ctxOverlay.strokeStyle = 'rgba(245, 166, 35, 0.8)'; // Amber
      
      const p1 = 0.382;
      const p2 = 0.618;

      ctxOverlay.beginPath();
      ctxOverlay.moveTo(w * p1, 0); ctxOverlay.lineTo(w * p1, h);
      ctxOverlay.moveTo(w * p2, 0); ctxOverlay.lineTo(w * p2, h);
      
      ctxOverlay.moveTo(0, h * p1); ctxOverlay.lineTo(w, h * p1);
      ctxOverlay.moveTo(0, h * p2); ctxOverlay.lineTo(w, h * p2);
      ctxOverlay.stroke();
      ctxOverlay.setLineDash([]);
      ctxOverlay.strokeStyle = 'rgba(255, 255, 255, 0.7)'; // Reset
    }

    // Diagonals
    if (toggles.diagonal.checked) {
      ctxOverlay.setLineDash([]);
      ctxOverlay.strokeStyle = 'rgba(0, 212, 255, 0.6)'; // Cyan
      
      ctxOverlay.beginPath();
      ctxOverlay.moveTo(0, 0); ctxOverlay.lineTo(w, h);
      ctxOverlay.moveTo(w, 0); ctxOverlay.lineTo(0, h);
      ctxOverlay.stroke();
      
      // Baroque diagonals (corners to opposite sides)
      ctxOverlay.setLineDash([2, 4]);
      ctxOverlay.beginPath();
      ctxOverlay.moveTo(w, 0); ctxOverlay.lineTo(w * 0.5, h);
      ctxOverlay.moveTo(0, h); ctxOverlay.lineTo(w * 0.5, 0);
      ctxOverlay.stroke();
      ctxOverlay.setLineDash([]);
    }
  }

  // --- Utils ---
  function rgbToHex(r, g, b) {
    const toHex = (c) => {
      const hex = Math.min(255, Math.max(0, c)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return {r, g, b};
  }

  function colorDistance(hex1, hex2) {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    // Simple Euclidean distance in RGB space
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2)
    );
  }
});
