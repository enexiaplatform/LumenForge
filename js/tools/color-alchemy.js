/* ==========================================================================
   LUMENFORGE — Color Alchemy Studio Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const btnUploadTrigger = document.getElementById('btn-upload-trigger');
  const canvas = document.getElementById('img-canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const loader = document.getElementById('loader');
  
  const tempSlider = document.getElementById('temp-slider');
  const tempVal = document.getElementById('temp-val');
  const tintSlider = document.getElementById('tint-slider');
  const tintVal = document.getElementById('tint-val');
  
  const hudTemp = document.getElementById('hud-temp');
  const hudTint = document.getElementById('hud-tint');
  const hudWbType = document.getElementById('hud-wb-type');
  
  const colorOutput = document.getElementById('color-output');
  const presetCards = document.querySelectorAll('#wb-presets .radio-card');
  const btnDownload = document.getElementById('btn-download');
  
  const vectorscopeToggle = document.getElementById('vectorscope-toggle');
  const vectorscopePanel = document.getElementById('vectorscope-panel');
  const vectorscopeCanvas = document.getElementById('vectorscope-canvas');
  
  let originalImage = null;
  let originalImageData = null;
  let processedImageData = null;
  let previousPreset = 'custom';
  let isProcessing = false;
  let renderPending = false;
  
  const MAX_DIMENSION = 1000; // Limit processing size for performance

  // WB Preset configurations
  const presets = {
    'custom': { temp: null, tint: null, name: 'Tự chỉnh' },
    'tungsten': { temp: 3200, tint: -2, name: 'Đèn huỳnh/sợi' },
    'daylight': { temp: 5200, tint: 4, name: 'Ánh ngày' },
    'cloudy': { temp: 6000, tint: 8, name: 'Trời mây' },
    'shade': { temp: 8000, tint: 14, name: 'Bóng râm' },
    // VIP PRO Presets
    'cyberpunk': { temp: 2800, tint: -20, name: 'Cyberpunk Night' },
    'vintage-warm': { temp: 6800, tint: 12, name: 'Warm Vintage' },
    'matrix': { temp: 4500, tint: -30, name: 'Matrix Green' }
  };

  // 1. Handle Custom Image Upload (👑 PRO Gated)
  if (btnUploadTrigger) {
    btnUploadTrigger.addEventListener('click', (e) => {
      if (typeof lfAuth !== 'undefined') {
        const hasAccess = lfAuth.gateFeature('Tải ảnh cá nhân (Custom Image Upload)', () => {
          // Do nothing on cancel
        });
        if (!hasAccess) {
          e.preventDefault();
          return;
        }
      }
      fileInput.click();
    });
  }

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Clear active thumb highlight
        document.querySelectorAll('.sample-thumb').forEach(el => el.classList.remove('active'));
        
        processImageSize(img);
        
        // Reset sliders & presets to neutral
        resetToNeutral();
        
        queueRender();
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
    
    // Store original image and data
    originalImageData = ctx.getImageData(0, 0, w, h);
    originalImage = img;
    processedImageData = ctx.createImageData(w, h);
  }

  function resetToNeutral() {
    tempSlider.value = 5500;
    tintSlider.value = 0;
    presetCards.forEach(c => c.classList.remove('selected'));
    const customCard = document.querySelector('#wb-presets .radio-card[title*="Manual"]');
    if (customCard) {
      customCard.classList.add('selected');
      customCard.querySelector('input').checked = true;
    }
    previousPreset = 'custom';
    hudWbType.textContent = 'Thủ công';
  }

  // 2. Handle Presets Clicking (with PRO Gating)
  presetCards.forEach(card => {
    const input = card.querySelector('input[type="radio"]');
    
    card.addEventListener('click', (e) => {
      if (e.target !== input) {
        input.checked = true;
      }
      
      const presetKey = input.value;
      const config = presets[presetKey];
      const isPro = card.getAttribute('data-pro') === 'true';

      // PRO Gating Check
      if (isPro && typeof lfAuth !== 'undefined') {
        const featureName = `Preset WB ${config.name}`;
        const hasAccess = lfAuth.gateFeature(featureName, () => {
          // Revert: select previously active card
          presetCards.forEach(c => c.classList.remove('selected'));
          const prevCard = document.querySelector(`#wb-presets input[value="${previousPreset}"]`).parentNode;
          if (prevCard) {
            prevCard.classList.add('selected');
            prevCard.querySelector('input').checked = true;
          }
          // Restore slider values
          const oldConfig = presets[previousPreset];
          if (previousPreset !== 'custom') {
            tempSlider.value = oldConfig.temp;
            tintSlider.value = oldConfig.tint;
          }
          queueRender();
        });
        
        if (!hasAccess) return;
      }

      presetCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      previousPreset = presetKey;

      if (presetKey !== 'custom') {
        hudWbType.textContent = config.name;
        tempSlider.value = config.temp;
        tintSlider.value = config.tint;
        queueRender();
      } else {
        hudWbType.textContent = 'Thủ công';
      }
    });
  });

  // 3. Slider Interaction & Animation Frame Loop
  function handleSliderInput() {
    // Switch preset selection back to Custom/Manual if manually adjusted
    presetCards.forEach(c => c.classList.remove('selected'));
    const customCard = document.querySelector('#wb-presets .radio-card:first-child');
    if (customCard) {
      customCard.classList.add('selected');
      customCard.querySelector('input').checked = true;
    }
    previousPreset = 'custom';
    hudWbType.textContent = 'Thủ công';

    queueRender();
  }

  tempSlider.addEventListener('input', handleSliderInput);
  tintSlider.addEventListener('input', handleSliderInput);

  function queueRender() {
    if (renderPending) return;
    renderPending = true;
    requestAnimationFrame(() => {
      applyColorAlchemy();
      renderPending = false;
    });
  }

  // 4. White Balance & Tint Pixel Mathematics Engine
  function applyColorAlchemy() {
    if (!originalImageData) return;
    
    const temp = parseInt(tempSlider.value);
    const tint = parseInt(tintSlider.value);

    // Update labels and HUD
    tempVal.textContent = `${temp} K`;
    tintVal.textContent = tint > 0 ? `+${tint}` : tint;
    hudTemp.textContent = `${temp} K`;
    hudTint.textContent = tint > 0 ? `+${tint}` : tint;

    if (isProcessing) return;
    isProcessing = true;

    // Calculate color multipliers
    // Neutral temperature is 5500 K
    let rMult = 1.0;
    let gMult = 1.0;
    let bMult = 1.0;

    // Temperature mapping (Kelvin shift: amber vs cool blue)
    if (temp > 5500) {
      const t = (temp - 5500) / 4500; // 0 to 1
      rMult += t * 0.28;
      gMult += t * 0.12;
      bMult -= t * 0.32;
    } else if (temp < 5500) {
      const t = (5500 - temp) / 3500; // 0 to 1
      rMult -= t * 0.25;
      gMult -= t * 0.08;
      bMult += t * 0.36;
    }

    // Tint mapping (green vs magenta shift)
    // Positive tint adds Red and Blue, subtracts Green.
    // Negative tint adds Green, subtracts Red and Blue.
    const tintFactor = tint / 50; // -1 to 1
    if (tintFactor > 0) {
      rMult += tintFactor * 0.12;
      gMult -= tintFactor * 0.18;
      bMult += tintFactor * 0.15;
    } else if (tintFactor < 0) {
      const absT = Math.abs(tintFactor);
      rMult -= absT * 0.12;
      gMult += absT * 0.22;
      bMult -= absT * 0.12;
    }

    // Process pixels
    const src = originalImageData.data;
    const dst = processedImageData.data;
    const len = src.length;

    for (let i = 0; i < len; i += 4) {
      // Scale and clamp channels
      dst[i]   = Math.min(255, Math.max(0, src[i] * rMult));     // Red
      dst[i+1] = Math.min(255, Math.max(0, src[i+1] * gMult));   // Green
      dst[i+2] = Math.min(255, Math.max(0, src[i+2] * bMult));   // Blue
      dst[i+3] = src[i+3];                                       // Alpha
    }

    ctx.putImageData(processedImageData, 0, 0);
    isProcessing = false;

    // Draw vectorscope if active
    if (vectorscopeToggle && vectorscopeToggle.checked) {
      drawVectorscope(processedImageData);
    }

    // Render Educational Analysis
    renderColorAnalysis(temp, tint);
  }

  // 5. Skin Tone Vectorscope Radar Renderer (👑 PRO)
  vectorscopeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      if (typeof lfAuth !== 'undefined') {
        const hasAccess = lfAuth.gateFeature('Kính hiển vi sắc độ da (Skin Vectorscope)', () => {
          e.target.checked = false;
          vectorscopePanel.classList.remove('active');
        });
        if (!hasAccess) return;
      }
      vectorscopePanel.classList.add('active');
      if (processedImageData) {
        drawVectorscope(processedImageData);
      }
    } else {
      vectorscopePanel.classList.remove('active');
    }
  });

  function drawVectorscope(imageData) {
    if (!vectorscopeCanvas) return;
    const vCtx = vectorscopeCanvas.getContext('2d');
    const width = vectorscopeCanvas.width;
    const height = vectorscopeCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 8;

    // Clean background
    vCtx.fillStyle = '#09080C';
    vCtx.fillRect(0, 0, width, height);

    // Draw circular reference graticule
    vCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    vCtx.lineWidth = 1;
    vCtx.beginPath();
    vCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    vCtx.stroke();

    vCtx.beginPath();
    vCtx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    vCtx.stroke();

    // Draw horizontal & vertical axes
    vCtx.beginPath();
    vCtx.moveTo(centerX - radius, centerY);
    vCtx.lineTo(centerX + radius, centerY);
    vCtx.moveTo(centerX, centerY - radius);
    vCtx.lineTo(centerX, centerY + radius);
    vCtx.stroke();

    // Draw color target labels and box grids
    // Angles matching standard chrominance vectorscopes
    const angles = {
      'R': 104 * Math.PI / 180,   // Red
      'Mg': 61 * Math.PI / 180,   // Magenta
      'B': 347 * Math.PI / 180,   // Blue
      'Cy': 284 * Math.PI / 180,  // Cyan
      'G': 241 * Math.PI / 180,   // Green
      'Yl': 167 * Math.PI / 180   // Yellow
    };

    vCtx.font = '8px monospace';
    vCtx.textAlign = 'center';
    vCtx.textBaseline = 'middle';

    for (let label in angles) {
      const angle = angles[label];
      const lx = centerX + Math.cos(angle) * radius * 0.8;
      const ly = centerY - Math.sin(angle) * radius * 0.8; // subtract because y increases downwards
      
      vCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      vCtx.fillText(label, lx, ly);
      
      vCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      vCtx.strokeRect(lx - 4, ly - 4, 8, 8);
    }

    // Draw Golden Skin Tone Indicator Line (123 degrees)
    const skinAngle = 123 * Math.PI / 180;
    const sx = centerX + Math.cos(skinAngle) * radius;
    const sy = centerY - Math.sin(skinAngle) * radius;
    vCtx.strokeStyle = 'rgba(212, 175, 55, 0.65)'; // Gold
    vCtx.lineWidth = 1.5;
    vCtx.setLineDash([3, 3]);
    vCtx.beginPath();
    vCtx.moveTo(centerX, centerY);
    vCtx.lineTo(sx, sy);
    vCtx.stroke();
    vCtx.setLineDash([]); // Reset line dash

    // Draw "SKIN" label
    vCtx.fillStyle = 'rgba(212, 175, 55, 0.8)';
    const slx = centerX + Math.cos(skinAngle) * radius * 0.6;
    const sly = centerY - Math.sin(skinAngle) * radius * 0.6;
    vCtx.fillText('SKIN', slx - 10, sly - 5);

    // Plot image chrominance pixels
    const data = imageData.data;
    vCtx.fillStyle = 'rgba(0, 240, 255, 0.3)'; // Neon Cyan glow dots
    
    // Downsample heavily for high performance (every 40th pixel)
    const step = 40;
    for (let i = 0; i < data.length; i += 4 * step) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];

      // Convert RGB to YUV Color Space
      // U represents Blue-Yellow difference
      // V represents Red-Cyan difference
      const u = -0.168736 * r - 0.331264 * g + 0.5 * b;
      const v = 0.5 * r - 0.418688 * g - 0.081312 * b;

      // Scale to vectorscope radius (max U/V is 128)
      const px = centerX + (u / 128) * radius;
      const py = centerY - (v / 128) * radius;

      // Draw dot
      vCtx.fillRect(px, py, 1.5, 1.5);
    }
  }

  // 6. Real-time Educational Commentary Generator
  function renderColorAnalysis(temp, tint) {
    let wbVibe = '';
    let wbDesc = '';
    let tempClass = 'var(--text-dim)';
    
    if (temp < 3000) {
      wbVibe = 'Lạnh băng giá (Ice Cool)';
      tempClass = 'var(--accent-cyan)';
      wbDesc = 'Nhiệt độ màu cực thấp tạo cảm giác lạnh lẽo, cô độc, u uất sâu thẳm. Thường thấy trong các thước phim trinh thám hoặc cảnh đêm mùa đông cô quạnh.';
    } else if (temp < 4500) {
      wbVibe = 'Mát mẻ dịu mắt (Muted Cool)';
      tempClass = 'var(--accent-blue)';
      wbDesc = 'Tone màu lam nhẹ mang vẻ hiện đại, trong trẻo. Rất phù hợp chụp ảnh phong cách tối giản thành thị (Urban minimalist) hoặc chân dung tâm trạng tĩnh lặng.';
    } else if (temp <= 5800) {
      wbVibe = 'Cân bằng tự nhiên (Daylight Neutral)';
      tempClass = 'var(--accent-cyan)';
      wbDesc = 'Độ ấm gần như trung tính tuyệt đối của ánh sáng mặt trời lúc giữa trưa ban ngày. Tái tạo màu da và phong cảnh trung thực nhất, không bị ám sắc sai lệch.';
    } else if (temp < 7500) {
      wbVibe = 'Nắng ấm ngọt ngào (Warm Golden)';
      tempClass = 'var(--accent-amber)';
      wbDesc = 'Màu vàng nắng mật ong tràn ngập năng lượng ấm áp, rực rỡ. Gợi nhớ ký ức tuổi thơ, những chiều hoàng hôn muộn thanh bình và thơ mộng.';
    } else {
      wbVibe = 'Rực sắc đỏ ấm (Amber Flame)';
      tempClass = 'var(--accent-film)';
      wbDesc = 'Độ ấm nóng cực hạn tạo cảm giác ngột ngạt kịch tính, tựa như hơi nóng sa mạc hoặc ánh lửa bập bùng. Cần kiểm soát kỹ để tránh ảnh bị úa vàng quá mức.';
    }

    let skintoneWarning = '';
    if (tint < -15) {
      skintoneWarning = `
        <div class="warning-item warning-high" style="border-left: 3px solid var(--accent-cyan); background: rgba(0, 212, 170, 0.08); color: var(--text-primary); padding: 10px 16px; border-radius: 4px; font-size: 0.85rem; margin-top:16px;">
          ⚠️ <strong>CẢNH BÁO SKIN TONE: Ám xanh lá cây quá mức!</strong><br>
          Sắc xanh lá quá đậm khiến màu da người trông tái nhợt, thiếu sức sống (giống như người bệnh). Khuyên tăng Tint về phía số dương (Magenta) để bù lại màu hồng hào tự nhiên cho làn da.
        </div>
      `;
    } else if (tint > 20) {
      skintoneWarning = `
        <div class="warning-item warning-high" style="border-left: 3px solid var(--accent-film); background: rgba(232, 114, 92, 0.08); color: var(--text-primary); padding: 10px 16px; border-radius: 4px; font-size: 0.85rem; margin-top:16px;">
          ⚠️ <strong>CẢNH BÁO SKIN TONE: Ám sắc tím hồng cánh sen!</strong><br>
          Sắc tím (Magenta) quá gắt sẽ biến da mặt mẫu trở nên hồng đỏ rực rỡ thiếu tự nhiên như vừa uống rượu. Hãy giảm bớt Tint về phía màu xanh để trung hòa màu da về sắc cam hồng đào.
        </div>
      `;
    }

    let outputHTML = `
      <div class="output-header" style="margin-bottom: var(--space-md); padding-bottom: var(--space-md);">
        <h3>Định Vị Nhiệt Màu: <span style="color: ${tempClass}; font-family: var(--font-mono);">${temp} K</span></h3>
        <p style="font-size:0.82rem; color:var(--text-secondary); margin-top:4px;">
          Đặc tính ánh sáng: <strong>${wbVibe}</strong>
        </p>
      </div>

      <div class="output-grid">
        
        <div class="output-card">
          <h4>🎨 Ý Nghĩa Thẩm Mỹ</h4>
          <p>${wbDesc}</p>
        </div>

        <div class="output-card">
          <h4>🧪 Chỉ dẫn Cân Bằng Trắng (WB)</h4>
          <p><strong>Nhiệt độ Kelvin ${temp}K</strong> mô phỏng nguồn sáng:</p>
          <ul style="margin-top: 8px; list-style-type: disc; padding-left: 16px;">
            <li>${temp < 3500 ? '💡 Đèn sợi đốt hoặc ánh nến trong nhà tối.' : temp < 5000 ? '💡 Đèn huỳnh quang văn phòng.' : temp < 6000 ? '☀️ Ánh sáng mặt trời ban ngày đủ sáng.' : temp < 7500 ? '☁️ Nắng xiên hoặc bóng râm mây che nhẹ.' : '🌳 Bóng râm sâu dưới tán cây lớn.'}</li>
            <li><strong>Sắc độ Tint (${tint}):</strong> ${tint === 0 ? 'Trung tính hoàn mỹ.' : tint > 0 ? `Đang bù trừ thêm ${tint} sắc tím để trung hòa ánh sáng thiên xanh lá.` : `Đang thêm ${Math.abs(tint)} sắc xanh để trung hòa đèn bị ám sắc đỏ tím.`}</li>
          </ul>
        </div>

      </div>

      ${skintoneWarning}
    `;

    colorOutput.innerHTML = outputHTML;
  }

  // 7. Dynamic Sample Images Loader (Zero Empty States)
  function loadSampleImage(url, elementId) {
    if (loader) loader.style.display = 'block';
    
    // Update active thumb styling
    document.querySelectorAll('.sample-thumb').forEach(el => el.classList.remove('active'));
    const targetThumb = document.getElementById(elementId);
    if (targetThumb) {
      targetThumb.classList.add('active');
    }

    const img = new Image();
    img.crossOrigin = 'anonymous'; // Support external URL assets
    img.onload = () => {
      const uploadOverlay = document.getElementById('upload-overlay');
      if (uploadOverlay) {
        uploadOverlay.classList.add('hidden');
      }
      if (loader) loader.style.display = 'none';
      
      processImageSize(img);
      queueRender();
    };
    img.onerror = () => {
      if (loader) loader.style.display = 'none';
      console.error(`Failed to load sample image: ${url}`);
    };
    img.src = url;
  }

  // Bind Sample Clicks
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
      loadSampleImage('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop', 'sample-2');
    });
  }
  if (sample3) {
    sample3.addEventListener('click', () => {
      loadSampleImage('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop', 'sample-3');
    });
  }

  // Preload first sample (Studio Portrait) instantly so the user can interact immediately
  loadSampleImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop', 'sample-1');

  // 8. High-Resolution Download Export (👑 PRO Gated)
  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      if (!originalImageData) return;
      
      if (typeof lfAuth !== 'undefined') {
        const hasAccess = lfAuth.gateFeature('Tải ảnh chất lượng cao (High-Res Download)', () => {
          // Do nothing on cancel
        });
        if (!hasAccess) return;
      }
      
      // Perform export
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `LumenForge_Alchemy_${hudTemp.textContent.replace(' ', '')}_T${hudTint.textContent}.jpg`;
      a.click();
    });
  }
});
