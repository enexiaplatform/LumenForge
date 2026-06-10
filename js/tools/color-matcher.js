document.addEventListener('DOMContentLoaded', () => {
  
  function setupUpload(inputId, btnId, canvasId, callback) {
    const fileInput = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          btn.style.display = 'none';
          
          let w = img.width;
          let h = img.height;
          const MAX = 600;
          if (w > MAX || h > MAX) {
            const ratio = Math.min(MAX / w, MAX / h);
            w = Math.floor(w * ratio);
            h = Math.floor(h * ratio);
          }

          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          
          if (callback) {
            callback(ctx.getImageData(0, 0, w, h));
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  setupUpload('ref-file', 'ref-upload-btn', 'ref-canvas', extractPalette);
  setupUpload('tar-file', 'tar-upload-btn', 'tar-canvas', null);

  function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
  }

  // A very basic color extraction (Random sampling + simple distance clustering)
  function extractPalette(imgData) {
    const data = imgData.data;
    const samples = [];
    
    // Sample pixels
    for(let i = 0; i < 1000; i++) {
      const idx = Math.floor(Math.random() * (data.length / 4)) * 4;
      samples.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
    }

    // Cluster into 5 colors
    let clusters = [];
    samples.forEach(c => {
      let added = false;
      for(let cl of clusters) {
        let dist = Math.abs(c.r - cl.r) + Math.abs(c.g - cl.g) + Math.abs(c.b - cl.b);
        if (dist < 60) {
          cl.r = Math.floor((cl.r + c.r) / 2);
          cl.g = Math.floor((cl.g + c.g) / 2);
          cl.b = Math.floor((cl.b + c.b) / 2);
          cl.count++;
          added = true;
          break;
        }
      }
      if(!added) {
        clusters.push({ r: c.r, g: c.g, b: c.b, count: 1 });
      }
    });

    clusters.sort((a,b) => b.count - a.count);
    const top5 = clusters.slice(0, 5);

    // Sort top 5 by luminance (dark to light)
    top5.sort((a,b) => {
      let lA = 0.299*a.r + 0.587*a.g + 0.114*a.b;
      let lB = 0.299*b.r + 0.587*b.g + 0.114*b.b;
      return lA - lB;
    });

    // Update UI Swatches
    for(let i=0; i<5; i++) {
      const el = document.getElementById(`c${i+1}`);
      if(top5[i]) {
        const hex = rgbToHex(top5[i].r, top5[i].g, top5[i].b);
        el.style.background = hex;
        el.textContent = hex;
        el.style.opacity = '1';
        let lum = 0.299*top5[i].r + 0.587*top5[i].g + 0.114*top5[i].b;
        el.style.color = lum > 128 ? '#000' : '#fff';
      }
    }

    generateAdvice(top5);
  }

  function generateAdvice(palette) {
    if(palette.length < 3) return;

    document.getElementById('advice-box').style.display = 'block';

    const shadow = palette[0]; // Darkest
    const mid = palette[Math.floor(palette.length / 2)];
    const high = palette[palette.length - 1]; // Lightest

    function setColor(id, c) {
      document.getElementById(id).style.background = `rgb(${c.r}, ${c.g}, ${c.b})`;
    }

    setColor('aw-shadow', shadow);
    setColor('aw-mid', mid);
    setColor('aw-high', high);

    function analyzeColor(c) {
      let r = c.r, g = c.g, b = c.b;
      if (b > r + 20 && b > g + 20) return "Ám Xanh dương (Blue/Teal)";
      if (r > g + 20 && r > b + 20) return "Ám Đỏ/Cam (Red/Orange/Warm)";
      if (g > r + 20 && g > b + 20) return "Ám Xanh lá (Green/Matrix)";
      if (r > 200 && g > 200 && b > 200) return "Trắng trung tính (Neutral)";
      if (r < 50 && g < 50 && b < 50) return "Đen sâu (Deep Black)";
      return "Trung tính (Neutral / Desaturated)";
    }

    document.getElementById('ad-shadow').textContent = analyzeColor(shadow);
    document.getElementById('ad-mid').textContent = analyzeColor(mid);
    document.getElementById('ad-high').textContent = analyzeColor(high);
  }

});
