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
      analyzeHarmony(finalPalette);
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

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  }

  function analyzeHarmony(palette) {
    const harmonyBox = document.getElementById('harmony-result');
    const harmonyText = document.getElementById('harmony-text');
    
    // Convert hex to HSL
    const hslColors = palette.map(hex => {
      const {r, g, b} = hexToRgb(hex);
      return rgbToHsl(r, g, b);
    });

    // Filter out very dark (L < 15), very bright (L > 85), or very desaturated (S < 15) colors
    const validHues = hslColors
      .filter(c => c[2] > 15 && c[2] < 85 && c[1] > 15)
      .map(c => c[0]);

    if (validHues.length < 2) {
      harmonyBox.style.display = 'block';
      harmonyText.textContent = "Bức ảnh mang tính Đơn Sắc (Monochromatic) hoặc Vô Sắc (Achromatic) do chỉ có 1 dải màu nổi bật hoặc các màu quá nhạt/tối.";
      return;
    }

    // Find the max angular distance between any two dominant hues
    let maxDiff = 0;
    for(let i = 0; i < validHues.length; i++) {
      for(let j = i+1; j < validHues.length; j++) {
        let diff = Math.abs(validHues[i] - validHues[j]);
        if (diff > 180) diff = 360 - diff;
        if (diff > maxDiff) maxDiff = diff;
      }
    }

    let result = "";
    if (maxDiff >= 150 && maxDiff <= 180) {
      result = "Tương phản (Complementary): Khung hình sử dụng hai màu đối xứng trên vòng thuần sắc (ví dụ Teal & Orange), tạo sức hút thị giác và kịch tính rất mạnh.";
    } else if (maxDiff <= 45) {
      result = "Tương đồng (Analogous): Khung hình sử dụng các màu liền kề nhau trên vòng màu, tạo cảm giác hài hòa, êm dịu và tự nhiên.";
    } else if (maxDiff > 90 && maxDiff < 140) {
      result = "Tam giác (Triadic) hoặc Phân tách (Split-Complementary): Khung hình có sự phân bổ màu sắc phức tạp, rực rỡ nhưng vẫn giữ được sự cân bằng đa dạng.";
    } else {
      result = "Phức hợp (Complex/Tetradic): Khung hình phối hợp nhiều dải màu phong phú, thường thấy ở các cảnh quay náo nhiệt hoặc có ánh sáng hỗn hợp (Mixed Lighting).";
    }

    harmonyBox.style.display = 'block';
    harmonyText.textContent = result;
  }
});
