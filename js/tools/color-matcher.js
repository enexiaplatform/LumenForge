document.addEventListener('DOMContentLoaded', () => {
  const refFile = document.getElementById('ref-file');
  const refCanvas = document.getElementById('ref-canvas');
  const refCtx = refCanvas.getContext('2d', { willReadFrequently: true });
  const refUploadBtn = document.getElementById('ref-upload-btn');

  const tarFile = document.getElementById('tar-file');
  const tarCanvas = document.getElementById('tar-canvas');
  const tarCtx = tarCanvas.getContext('2d', { willReadFrequently: true });
  const tarUploadBtn = document.getElementById('tar-upload-btn');

  const sliderIntensity = document.getElementById('slider-intensity');
  const valIntensity = document.getElementById('val-intensity');

  const btnMatch = document.getElementById('btn-match');
  const btnDownload = document.getElementById('btn-download');
  const btnResetTarget = document.getElementById('btn-reset-target');

  let refImageData = null;
  let tarOriginalImageData = null;
  let tarGradedImageData = null;

  // 1. Image Canvas Setup Helper
  function displayImageOnCanvas(img, canvas, ctx, btnEl) {
    if (btnEl) btnEl.style.display = 'none';
    
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
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
  }

  // 2. File Upload Handlers
  refFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Clear sample active borders
        document.querySelectorAll('.sample-thumb[id^="ref-sample"]').forEach(el => {
          el.style.borderColor = 'var(--border-color)';
        });
        refImageData = displayImageOnCanvas(img, refCanvas, refCtx, refUploadBtn);
        extractPalette(refImageData);
        applyMatching();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  tarFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Clear sample active borders
        document.querySelectorAll('.sample-thumb[id^="tar-sample"]').forEach(el => {
          el.style.borderColor = 'var(--border-color)';
        });
        tarOriginalImageData = displayImageOnCanvas(img, tarCanvas, tarCtx, tarUploadBtn);
        tarGradedImageData = null;
        applyMatching();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  if (btnResetTarget) {
    btnResetTarget.addEventListener('click', () => {
      tarFile.click();
    });
  }

  // 3. Sample Click Handlers
  function loadReferenceSample(url, thumbId) {
    document.querySelectorAll('.sample-thumb[id^="ref-sample"]').forEach(el => {
      el.style.borderColor = 'var(--border-color)';
    });
    const activeThumb = document.getElementById(thumbId);
    if (activeThumb) {
      activeThumb.style.borderColor = 'var(--accent-cyan)';
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      refImageData = displayImageOnCanvas(img, refCanvas, refCtx, refUploadBtn);
      extractPalette(refImageData);
      applyMatching();
    };
    img.src = url;
  }

  function loadTargetSample(url, thumbId) {
    document.querySelectorAll('.sample-thumb[id^="tar-sample"]').forEach(el => {
      el.style.borderColor = 'var(--border-color)';
    });
    const activeThumb = document.getElementById(thumbId);
    if (activeThumb) {
      activeThumb.style.borderColor = 'var(--accent-cyan)';
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      tarOriginalImageData = displayImageOnCanvas(img, tarCanvas, tarCtx, tarUploadBtn);
      tarGradedImageData = null;
      applyMatching();
    };
    img.src = url;
  }

  // 4. Color Statistics Calculation (Subsampled for Speed)
  function getStats(imgData) {
    const data = imgData.data;
    let sumR = 0, sumG = 0, sumB = 0;
    let count = 0;
    const step = 4; // Subsample step for fast math
    for (let i = 0; i < data.length; i += 4 * step) {
      sumR += data[i];
      sumG += data[i+1];
      sumB += data[i+2];
      count++;
    }
    const meanR = sumR / count;
    const meanG = sumG / count;
    const meanB = sumB / count;

    let sqSumR = 0, sqSumG = 0, sqSumB = 0;
    for (let i = 0; i < data.length; i += 4 * step) {
      sqSumR += Math.pow(data[i] - meanR, 2);
      sqSumG += Math.pow(data[i+1] - meanG, 2);
      sqSumB += Math.pow(data[i+2] - meanB, 2);
    }
    const stdR = Math.sqrt(sqSumR / count) || 1;
    const stdG = Math.sqrt(sqSumG / count) || 1;
    const stdB = Math.sqrt(sqSumB / count) || 1;

    return { meanR, meanG, meanB, stdR, stdG, stdB };
  }

  // 5. Mean-Variance Color Transfer
  function transferColors(refData, tarData) {
    const refStats = getStats(refData);
    const tarStats = getStats(tarData);

    const outData = new ImageData(
      new Uint8ClampedArray(tarData.data),
      tarData.width,
      tarData.height
    );
    const data = outData.data;

    const scaleR = refStats.stdR / tarStats.stdR;
    const scaleG = refStats.stdG / tarStats.stdG;
    const scaleB = refStats.stdB / tarStats.stdB;

    const clamp = (val) => Math.min(255, Math.max(0, val));

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i+1];
      let b = data[i+2];

      r = (r - tarStats.meanR) * scaleR + refStats.meanR;
      g = (g - tarStats.meanG) * scaleG + refStats.meanG;
      b = (b - tarStats.meanB) * scaleB + refStats.meanB;

      data[i] = clamp(r);
      data[i+1] = clamp(g);
      data[i+2] = clamp(b);
    }

    return outData;
  }

  // 6. Blending Original and Graded Data
  function blendImages(originalData, gradedData, intensity) {
    const outData = new ImageData(
      new Uint8ClampedArray(originalData.data),
      originalData.width,
      originalData.height
    );
    const data = outData.data;
    const orig = originalData.data;
    const graded = gradedData.data;
    const w = intensity / 100;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.round(orig[i] * (1 - w) + graded[i] * w);
      data[i+1] = Math.round(orig[i+1] * (1 - w) + graded[i+1] * w);
      data[i+2] = Math.round(orig[i+2] * (1 - w) + graded[i+2] * w);
    }

    return outData;
  }

  // 7. Apply Matching Wrapper
  function applyMatching() {
    if (!refImageData || !tarOriginalImageData) return;

    if (!tarGradedImageData) {
      tarGradedImageData = transferColors(refImageData, tarOriginalImageData);
    }
    
    const intensity = sliderIntensity ? parseInt(sliderIntensity.value) : 100;
    const blendedData = blendImages(tarOriginalImageData, tarGradedImageData, intensity);

    tarCtx.putImageData(blendedData, 0, 0);
  }

  // 8. Color Palette Extraction
  function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
  }

  function extractPalette(imgData) {
    const data = imgData.data;
    const samples = [];
    
    for (let i = 0; i < 1000; i++) {
      const idx = Math.floor(Math.random() * (data.length / 4)) * 4;
      samples.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
    }

    let clusters = [];
    samples.forEach(c => {
      let added = false;
      for (let cl of clusters) {
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
      if (!added) {
        clusters.push({ r: c.r, g: c.g, b: c.b, count: 1 });
      }
    });

    clusters.sort((a,b) => b.count - a.count);
    const top5 = clusters.slice(0, 5);

    top5.sort((a,b) => {
      let lA = 0.299*a.r + 0.587*a.g + 0.114*a.b;
      let lB = 0.299*b.r + 0.587*b.g + 0.114*b.b;
      return lA - lB;
    });

    for (let i = 0; i < 5; i++) {
      const el = document.getElementById(`c${i+1}`);
      if (el) {
        if (top5[i]) {
          const hex = rgbToHex(top5[i].r, top5[i].g, top5[i].b);
          el.style.background = hex;
          el.textContent = hex;
          el.style.opacity = '1';
          let lum = 0.299*top5[i].r + 0.587*top5[i].g + 0.114*top5[i].b;
          el.style.color = lum > 128 ? '#000' : '#fff';
        } else {
          el.style.opacity = '0';
        }
      }
    }

    generateAdvice(top5);
  }

  function generateAdvice(palette) {
    if (palette.length < 3) return;

    document.getElementById('advice-box').style.display = 'block';

    const shadow = palette[0];
    const mid = palette[Math.floor(palette.length / 2)];
    const high = palette[palette.length - 1];

    function setColor(id, c) {
      const el = document.getElementById(id);
      if (el) el.style.background = `rgb(${c.r}, ${c.g}, ${c.b})`;
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

    const adShadow = document.getElementById('ad-shadow');
    const adMid = document.getElementById('ad-mid');
    const adHigh = document.getElementById('ad-high');

    if (adShadow) adShadow.textContent = analyzeColor(shadow);
    if (adMid) adMid.textContent = analyzeColor(mid);
    if (adHigh) adHigh.textContent = analyzeColor(high);
  }

  // 9. Match Intensity Gating
  if (sliderIntensity) {
    sliderIntensity.addEventListener('input', (e) => {
      if (valIntensity) {
        valIntensity.textContent = `${e.target.value}%`;
      }
    });

    sliderIntensity.addEventListener('change', (e) => {
      const val = parseInt(e.target.value);
      if (val !== 100) {
        if (typeof lfAuth !== 'undefined') {
          const hasAccess = lfAuth.gateFeature('Tùy chỉnh cường độ Phối màu (Match Intensity)', () => {
            sliderIntensity.value = 100;
            if (valIntensity) {
              valIntensity.textContent = '100%';
            }
            applyMatching();
          });
          if (!hasAccess) return;
        }
      }
      applyMatching();
    });
  }

  // 10. Download Gating
  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      if (!tarOriginalImageData) return;
      
      if (typeof lfAuth !== 'undefined') {
        const hasAccess = lfAuth.gateFeature('Tải ảnh đã phối màu (Graded Image Download)', () => {});
        if (!hasAccess) return;
      }

      const dataUrl = tarCanvas.toDataURL('image/jpeg', 0.9);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'LumenForge_Graded.jpg';
      a.click();
    });
  }

  if (btnMatch) {
    btnMatch.addEventListener('click', () => {
      applyMatching();
    });
  }

  // 11. Bind Sample Click Events
  const refSample1 = document.getElementById('ref-sample-1');
  const refSample2 = document.getElementById('ref-sample-2');
  const refSample3 = document.getElementById('ref-sample-3');

  if (refSample1) {
    refSample1.addEventListener('click', () => {
      loadReferenceSample('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop', 'ref-sample-1');
    });
  }
  if (refSample2) {
    refSample2.addEventListener('click', () => {
      loadReferenceSample('https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=600&auto=format&fit=crop', 'ref-sample-2');
    });
  }
  if (refSample3) {
    refSample3.addEventListener('click', () => {
      loadReferenceSample('https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=600&auto=format&fit=crop', 'ref-sample-3');
    });
  }

  const tarSample1 = document.getElementById('tar-sample-1');
  const tarSample2 = document.getElementById('tar-sample-2');
  const tarSample3 = document.getElementById('tar-sample-3');

  if (tarSample1) {
    tarSample1.addEventListener('click', () => {
      loadTargetSample('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', 'tar-sample-1');
    });
  }
  if (tarSample2) {
    tarSample2.addEventListener('click', () => {
      loadTargetSample('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop', 'tar-sample-2');
    });
  }
  if (tarSample3) {
    tarSample3.addEventListener('click', () => {
      loadTargetSample('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop', 'tar-sample-3');
    });
  }

  // 12. Preload First Samples Instantly
  loadReferenceSample('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop', 'ref-sample-1');
  loadTargetSample('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', 'tar-sample-1');
});
