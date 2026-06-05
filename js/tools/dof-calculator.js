/* ==========================================================================
   LUMENFORGE — Depth of Field & Bokeh Explainer Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const sensorSelect = document.getElementById('dof-sensor');
  const focalSelect = document.getElementById('dof-focal');
  const apertureSlider = document.getElementById('dof-aperture');
  const apertureVal = document.getElementById('aperture-val');
  const distanceSlider = document.getElementById('dof-distance');
  const distanceVal = document.getElementById('distance-val');
  const bgDistanceSlider = document.getElementById('dof-bg-distance');
  const bgDistanceVal = document.getElementById('bg-distance-val');

  // Visualization Elements
  const dofSharp = document.getElementById('dof-sharp');
  const dofBlurFront = document.getElementById('dof-blur-front');
  const dofBlurBack = document.getElementById('dof-blur-back');
  const dofMarker = document.getElementById('dof-marker');
  const dofLabel = document.getElementById('dof-label');
  const dofOutput = document.getElementById('dof-output');

  // Standard Aperture Values (mapped to slider index 0-7)
  const apertures = [1.4, 1.8, 2.8, 4.0, 5.6, 8.0, 11.0, 16.0];

  // Circle of Confusion (CoC) in mm
  const cocValues = {
    'fullframe': 0.030,
    'apsc': 0.019,
    'smartphone': 0.005
  };

  function updateDoF() {
    const sensor = sensorSelect.value;
    const focal = parseFloat(focalSelect.value); // in mm
    const aperture = apertures[parseInt(apertureSlider.value)];
    const distance = parseFloat(distanceSlider.value); // in meters
    const bgDistance = parseFloat(bgDistanceSlider.value); // in meters

    // Update labels
    apertureVal.textContent = `f/${aperture}`;
    distanceVal.textContent = `${distance.toFixed(1)}m`;
    bgDistanceVal.textContent = `${bgDistance.toFixed(1)}m`;
    dofLabel.textContent = `CHỦ THỂ (${distance.toFixed(1)}m)`;

    // Convert inputs for formula (all in millimeters)
    const f = focal;
    const N = aperture;
    const s = distance * 1000; // subject distance in mm
    const CoC = cocValues[sensor];

    // 1. Calculate Hyperfocal Distance (H) in mm
    const H = (f * f) / (N * CoC);

    // 2. Calculate Near Limit (D_near) in mm
    const dNear = (s * (H - f)) / (H + s - 2 * f);

    // 3. Calculate Far Limit (D_far) in mm
    let dFar = 0;
    if (s >= (H - f)) {
      dFar = Infinity; // Infinite focus depth
    } else {
      dFar = (s * (H - f)) / (H - s);
    }

    // 4. Calculate total DoF in meters
    let totalDofText = '';
    let totalDofCm = 0;
    
    if (dFar === Infinity) {
      totalDofText = 'Vô cực (Infinite)';
    } else {
      const dofMm = dFar - dNear;
      totalDofCm = dofMm / 10; // in cm
      if (totalDofCm < 100) {
        totalDofText = `${totalDofCm.toFixed(1)} cm`;
      } else {
        totalDofText = `${(totalDofCm / 100).toFixed(2)} m`;
      }
    }

    // Update Visualization Map (percentages based on 10m scale)
    const scaleMax = 10000; // 10 meters scale
    const subjectPct = (s / scaleMax) * 100;
    const nearPct = (dNear / scaleMax) * 100;
    
    let farPct = 100;
    if (dFar !== Infinity) {
      farPct = (dFar / scaleMax) * 100;
    }

    // Apply visualization constraints
    dofMarker.style.left = `${Math.min(subjectPct, 95)}%`;
    
    const sharpWidth = farPct - nearPct;
    dofSharp.style.left = `${Math.min(nearPct, 95)}%`;
    dofSharp.style.width = `${Math.max(sharpWidth, 1.5)}%`;
    dofSharp.textContent = totalDofText;

    dofBlurFront.style.width = `${Math.min(nearPct, 95)}%`;
    
    const backBlurStart = Math.min(farPct, 99);
    dofBlurBack.style.left = `${backBlurStart}%`;
    dofBlurBack.style.width = `${100 - backBlurStart}%`;

    // 5. Build HTML output analyses
    renderDofOutput(totalDofCm, dNear, dFar, H, N, f, distance, bgDistance, sensor);
  }

  function renderDofOutput(totalDofCm, dNear, dFar, H, N, f, distance, bgDistance, sensor) {
    const nearLimitM = (dNear / 1000).toFixed(2);
    const farLimitM = dFar === Infinity ? 'Vô cực' : (dFar / 1000).toFixed(2);
    const hyperM = (H / 1000).toFixed(1);

    // Evaluate Bokeh Quality (xóa phông mạnh/yếu)
    let bokehRating = '';
    let bokehClass = '';
    let bokehDesc = '';

    // Simple heuristic to evaluate background blur
    // Blur disk size is proportional to (f^2 / N) * (1/subjectDistance - 1/backgroundDistance)
    const blurPower = ((f * f) / N) * (Math.abs(1 / (distance * 1000) - 1 / ((distance + bgDistance) * 1000)));

    if (blurPower > 4.0) {
      bokehRating = 'Xóa phông mịt mù (Creamy Bokeh)';
      bokehClass = 'var(--accent-cyan)';
      bokehDesc = 'Hậu cảnh sẽ hoàn toàn tan chảy, các nguồn sáng nhỏ phía sau sẽ tạo ra những hạt bong bóng bokeh to, tròn, mịn màng. Chủ thể nổi bật tách biệt 3D hoàn mỹ.';
    } else if (blurPower > 1.5) {
      bokehRating = 'Xóa phông vừa phải (Smooth Blur)';
      bokehClass = 'var(--accent-amber)';
      bokehDesc = 'Hậu cảnh mờ mềm mại đủ để phân biệt chủ thể, nhưng người xem vẫn có thể nhận biết lờ mờ cấu trúc bối cảnh phía sau. Phù hợp cho chụp chân dung kể chuyện đời thường.';
    } else {
      bokehRating = 'Hậu cảnh rõ nét (Deep focus)';
      bokehClass = 'var(--text-dim)';
      bokehDesc = 'Phông nền rất rõ ràng, chỉ mờ rất nhẹ. Thích hợp chụp phong cảnh, chụp nhóm đông người hoặc kiến trúc nơi bạn muốn mọi thứ đều sắc nét.';
    }

    let warningHTML = '';
    // Safety check warnings
    if (dFar !== Infinity && totalDofCm < 4.0) {
      warningHTML = `
        <div class="exposure-warnings" style="margin-top: 16px; margin-bottom: 0;">
          <div class="warning-item warning-high" style="border-left-color: var(--accent-film); background: rgba(232, 114, 92, 0.08); color: var(--text-primary); padding: 10px 16px; border-radius: 4px; font-size: 0.85rem;">
            ⚠️ <strong>CẢNH BÁO: Khoảng nét cực mỏng (${totalDofCm.toFixed(1)} cm)!</strong><br>
            Ở khoảng nét này, nếu bạn lấy nét vào mắt thì cánh mũi hoặc tai của mẫu chắc chắn sẽ bị nhòe mờ. Chỉ cần mẫu nghiêng đầu hoặc bạn rung tay nhẹ là ảnh sẽ bị out nét ngay lập tức. Khuyên khép khẩu lên f/2.2 - f/2.8 hoặc lùi ra xa một chút.
          </div>
        </div>
      `;
    }

    let outputHTML = `
      <div class="output-header" style="margin-bottom: var(--space-md); padding-bottom: var(--space-md);">
        <h3>Độ Dày Khoảng Nét: <span style="color: var(--accent-cyan); font-family: var(--font-mono);">${dFar === Infinity ? 'Vô cực' : totalDofCm.toFixed(1) + ' cm'}</span></h3>
        <p style="font-size:0.82rem; color:var(--text-secondary); margin-top:4px;">
          Khoảng nét rõ từ <strong>${nearLimitM}m</strong> đến <strong>${farLimitM}m</strong> tính từ ống kính
        </p>
      </div>

      <div class="output-grid">
        
        <!-- Bokeh rating -->
        <div class="output-card">
          <h4>🎨 Chất Lượng Bokeh</h4>
          <p style="color: ${bokehClass}; font-weight: 600; font-family: var(--font-heading); font-size: 1.05rem; margin-bottom: 6px;">
            ${bokehRating}
          </p>
          <p>${bokehDesc}</p>
        </div>

        <!-- Hyperfocal explanation -->
        <div class="output-card">
          <h4>🔭 Khoảng Cực Viễn (Hyperfocal)</h4>
          <p>Khoảng cực viễn của thiết lập này là <strong>${hyperM} mét</strong>.</p>
          <p style="margin-top: 6px; font-size: 0.82rem; color: var(--text-dim);">
            Nếu bạn lấy nét thủ công vào đúng điểm cách máy ảnh ${hyperM}m, toàn bộ cảnh vật từ ${(H/2000).toFixed(2)}m đến vô tận phía sau sẽ đều rõ nét hoàn hảo. Đây là bí thuật của chụp ảnh phong cảnh và đường phố!
          </p>
        </div>

      </div>

      ${warningHTML}
    `;

    dofOutput.innerHTML = outputHTML;
  }

  // Event Listeners
  sensorSelect.addEventListener('change', updateDoF);
  focalSelect.addEventListener('change', updateDoF);
  apertureSlider.addEventListener('input', updateDoF);
  distanceSlider.addEventListener('input', updateDoF);
  bgDistanceSlider.addEventListener('input', updateDoF);

  // Initial update
  updateDoF();
});
