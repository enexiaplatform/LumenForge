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
  const dofSharpFloat = document.getElementById('dof-sharp-float');

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
    dofSharp.textContent = ''; // empty text to avoid text overlap in narrow spaces

    // Position floating HUD label at center of sharp zone
    const sharpCenter = dFar === Infinity ? nearPct + 15 : nearPct + (sharpWidth / 2);
    dofSharpFloat.style.left = `${Math.max(8, Math.min(92, sharpCenter))}%`;
    dofSharpFloat.textContent = `VÙNG NÉT: ${totalDofText}`;

    dofBlurFront.style.width = `${Math.min(nearPct, 95)}%`;
    
    const backBlurStart = Math.min(farPct, 99);
    dofBlurBack.style.left = `${backBlurStart}%`;
    dofBlurBack.style.width = `${100 - backBlurStart}%`;

    // Render SVG Graphics
    renderDofGraphics(sensor, focal, aperture, distance, bgDistance, dNear, dFar);

    // 5. Build HTML output analyses
    renderDofOutput(totalDofCm, dNear, dFar, H, N, focal, distance, bgDistance, sensor);
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

  // === Dynamic SVG Render ===
  function renderDofGraphics(sensor, focal, aperture, distance, bgDistance, dNear, dFar) {
    const svg = document.getElementById('dof-optical-svg');
    if (!svg) return;

    // Clear SVG
    svg.innerHTML = '';

    // Calculate background blur standard deviation
    const blurPower = ((focal * focal) / aperture) * Math.abs(1 / (distance * 1000) - 1 / ((distance + bgDistance) * 1000));
    const blurStd = Math.min(10, blurPower * 3.5); // Clamp stdDev for rendering

    // Add filter defs
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <filter id="bg-blur-filter">
        <feGaussianBlur stdDeviation="${blurStd.toFixed(1)}" />
      </filter>
      <linearGradient id="ray-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(0, 212, 170, 0.45)" />
        <stop offset="50%" stop-color="rgba(0, 212, 170, 0.08)" />
        <stop offset="100%" stop-color="rgba(0, 212, 170, 0.35)" />
      </linearGradient>
    `;
    svg.appendChild(defs);

    // Map 0 to 10 meters distance onto X coordinates = 160 to 720
    function distToX(d) {
      return 160 + (d / 10) * 560;
    }

    const lensX = 160;
    const subX = distToX(distance);
    const bgX = distToX(distance + bgDistance);
    const nearX = distToX(dNear / 1000);
    const farX = dFar === Infinity ? 780 : distToX(dFar / 1000);

    const groundY = 190;

    // Draw Ground Grid Line
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ground.setAttribute('x1', '20');
    ground.setAttribute('y1', groundY.toString());
    ground.setAttribute('x2', '780');
    ground.setAttribute('y2', groundY.toString());
    ground.setAttribute('stroke', 'rgba(255, 255, 255, 0.12)');
    ground.setAttribute('stroke-width', '1');
    ground.setAttribute('stroke-dasharray', '4 4');
    svg.appendChild(ground);

    // Draw green glow Depth of Field range bar on ground
    const dofBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    dofBar.setAttribute('x', nearX.toString());
    dofBar.setAttribute('y', (groundY - 4).toString());
    dofBar.setAttribute('width', Math.max(2, farX - nearX).toString());
    dofBar.setAttribute('height', '8');
    dofBar.setAttribute('fill', 'rgba(0, 212, 170, 0.22)');
    dofBar.setAttribute('stroke', 'var(--accent-cyan)');
    dofBar.setAttribute('stroke-width', '1.5');
    dofBar.setAttribute('rx', '2');
    svg.appendChild(dofBar);

    // Camera sensor X position (within camera body)
    const sensorX = 75;

    // Ray lines from sensor, through lens aperture, converging on subject
    const apertureSize = Math.max(4, 45 / (aperture / 1.4)); // visual aperture diameter

    // Rays path
    const rayPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const slope = (apertureSize / 2) / (subX - lensX);
    const yEndTop = 120 + (800 - subX) * slope;
    const yEndBottom = 120 - (800 - subX) * slope;

    // Draw ray shape
    const points = [
      `M ${sensorX} 120`,
      `L ${lensX} ${120 - apertureSize / 2}`,
      `L ${subX} 120`,
      `L 800 ${yEndTop}`,
      `L 800 ${yEndBottom}`,
      `L ${subX} 120`,
      `L ${lensX} ${120 + apertureSize / 2}`,
      `Z`
    ].join(' ');
    rayPath.setAttribute('d', points);
    rayPath.setAttribute('fill', 'url(#ray-grad)');
    rayPath.setAttribute('stroke', 'rgba(0, 212, 170, 0.25)');
    rayPath.setAttribute('stroke-width', '1');
    svg.appendChild(rayPath);

    // Optical Center Axis
    const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axis.setAttribute('x1', '50');
    axis.setAttribute('y1', '120');
    axis.setAttribute('x2', '790');
    axis.setAttribute('y2', '120');
    axis.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
    axis.setAttribute('stroke-width', '1');
    axis.setAttribute('stroke-dasharray', '2 8');
    svg.appendChild(axis);

    // Camera Body (X = 50 to 120)
    const cameraGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    cameraGroup.innerHTML = `
      <rect x="50" y="80" width="70" height="80" rx="6" stroke="rgba(255,255,255,0.15)" fill="#12121A" stroke-width="2" />
      <path d="M 75 80 L 80 72 H 90 L 95 80" stroke="rgba(255,255,255,0.15)" stroke-width="2" fill="none" />
      <!-- Sensor plane -->
      <line x1="${sensorX}" y1="90" x2="${sensorX}" y2="150" stroke="var(--accent-film)" stroke-width="1.5" stroke-dasharray="2 2" />
      <text x="${sensorX}" y="165" fill="var(--accent-film)" font-size="8" font-family="var(--font-mono)" text-anchor="middle">CẢM BIẾN</text>
      <path d="M 120 90 V 150" stroke="rgba(255,255,255,0.3)" stroke-width="3" />
    `;
    svg.appendChild(cameraGroup);

    // Lens Barrel & Glass
    const lensThick = Math.max(6, 18 - (focal - 16) * 0.09);
    const lensGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    lensGroup.innerHTML = `
      <path d="M ${lensX} 75 Q ${lensX + lensThick} 120 ${lensX} 165 Q ${lensX - lensThick} 120 ${lensX} 75 Z" fill="rgba(74, 158, 255, 0.15)" stroke="var(--accent-blue)" stroke-width="1.5" />
      <path d="M ${lensX} 75 H 145 V 165 H ${lensX} Z" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" />
      <!-- Aperture blades (aperture size determines Y gap) -->
      <line x1="140" y1="75" x2="140" y2="${120 - apertureSize / 2}" stroke="var(--text-secondary)" stroke-width="3" />
      <line x1="140" y1="165" x2="140" y2="${120 + apertureSize / 2}" stroke="var(--text-secondary)" stroke-width="3" />
    `;
    svg.appendChild(lensGroup);

    // Dashed focus limits (vertical markers)
    const nearLimitLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    nearLimitLine.setAttribute('x1', nearX.toString());
    nearLimitLine.setAttribute('y1', groundY.toString());
    nearLimitLine.setAttribute('x2', nearX.toString());
    nearLimitLine.setAttribute('y2', '55');
    nearLimitLine.setAttribute('stroke', 'rgba(0, 212, 170, 0.35)');
    nearLimitLine.setAttribute('stroke-width', '1');
    nearLimitLine.setAttribute('stroke-dasharray', '3 3');
    svg.appendChild(nearLimitLine);

    if (dFar !== Infinity) {
      const farLimitLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      farLimitLine.setAttribute('x1', farX.toString());
      farLimitLine.setAttribute('y1', groundY.toString());
      farLimitLine.setAttribute('x2', farX.toString());
      farLimitLine.setAttribute('y2', '55');
      farLimitLine.setAttribute('stroke', 'rgba(0, 212, 170, 0.35)');
      farLimitLine.setAttribute('stroke-width', '1');
      farLimitLine.setAttribute('stroke-dasharray', '3 3');
      svg.appendChild(farLimitLine);
    }

    // Stylized Subject (Amber Silhouette)
    const subjectGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    subjectGroup.setAttribute('transform', `translate(${subX}, 100) scale(0.9)`);
    subjectGroup.innerHTML = `
      <circle cx="0" cy="15" r="10" fill="none" stroke="var(--accent-amber)" stroke-width="2" />
      <path d="M -12 35 H 12 M 0 25 V 55 L -8 90 M 0 55 L 8 90 M -12 35 L 0 28 L 12 35" fill="none" stroke="var(--accent-amber)" stroke-width="2" stroke-linejoin="round" />
      <circle cx="0" cy="15" r="4" fill="var(--accent-amber)" />
    `;
    svg.appendChild(subjectGroup);

    // Stylized Background (Tree with stdDev filter stdBlur)
    const bgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const clampedBgX = Math.min(bgX, 765);
    bgGroup.setAttribute('transform', `translate(${clampedBgX}, 90) scale(0.9)`);
    bgGroup.setAttribute('filter', 'url(#bg-blur-filter)');
    bgGroup.innerHTML = `
      <path d="M 0 100 V 70" stroke="#7A5C33" stroke-width="4" stroke-linecap="round" />
      <path d="M -25 70 L 0 30 L 25 70 Z" fill="none" stroke="var(--text-dim)" stroke-width="2" stroke-linejoin="round" />
      <path d="M -18 50 L 0 15 L 18 50 Z" fill="none" stroke="var(--text-dim)" stroke-width="2" stroke-linejoin="round" />
      <line x1="-12" y1="60" x2="12" y2="60" stroke="var(--text-dim)" stroke-dasharray="1 3" />
      <line x1="-8" y1="45" x2="8" y2="45" stroke="var(--text-dim)" stroke-dasharray="1 3" />
    `;
    svg.appendChild(bgGroup);

    // Labels & Text overlays
    const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Position text labels beautifully above elements
    labelGroup.innerHTML = `
      <text x="${subX}" y="85" fill="var(--accent-amber)" font-size="10" font-family="var(--font-mono)" text-anchor="middle" font-weight="600">CHỦ THỂ (${distance.toFixed(1)}m)</text>
      <text x="${clampedBgX}" y="70" fill="var(--text-dim)" font-size="10" font-family="var(--font-mono)" text-anchor="middle" font-weight="500">HẬU CẢNH (+${bgDistance.toFixed(1)}m)</text>
      <text x="${lensX}" y="55" fill="var(--accent-blue)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">${focal}mm</text>
    `;
    svg.appendChild(labelGroup);
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
