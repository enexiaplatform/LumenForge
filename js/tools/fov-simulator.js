/* ==========================================================================
   LUMENFORGE — Field of View Simulator Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const sensorSelect = document.getElementById('sensor-select');
  const focalSlider = document.getElementById('focal-slider');
  const focalValue = document.getElementById('focal-value');
  const distanceSlider = document.getElementById('distance-slider');
  const distanceValue = document.getElementById('distance-value');
  const fovSvg = document.getElementById('fov-svg');
  const fovOutput = document.getElementById('fov-output');

  // UI Value indicators
  const valAngle = document.getElementById('val-angle');
  const valEqFocal = document.getElementById('val-eq-focal');
  const valCategory = document.getElementById('val-category');

  function calculateFOV() {
    const sensorCrop = parseFloat(sensorSelect.value);
    const focalLength = parseFloat(focalSlider.value);
    const distance = parseFloat(distanceSlider.value);

    // Update slider label displays
    focalValue.textContent = `${focalLength}mm`;
    distanceValue.textContent = `${distance.toFixed(1)}m`;

    // 35mm full frame sensor width is 36mm
    const sensorWidth = 36 / sensorCrop;
    
    // Calculate Equivalent Focal Length
    const eqFocal = Math.round(focalLength * sensorCrop);
    valEqFocal.textContent = `${eqFocal}mm`;

    // Calculate Angle of View (Horizontal) in Degrees
    // AoV = 2 * arctan(sensorWidth / (2 * focalLength)) in radians
    const angleRad = 2 * Math.atan(sensorWidth / (2 * focalLength));
    const angleDeg = Math.round(angleRad * (180 / Math.PI));
    valAngle.textContent = `${angleDeg}°`;

    // Category Label & Color Scheme
    let category = 'Standard';
    let labelColor = 'var(--accent-amber)';
    if (eqFocal < 24) {
      category = 'Ultra-Wide';
      labelColor = 'var(--accent-cyan)';
    } else if (eqFocal < 35) {
      category = 'Wide Angle';
      labelColor = 'var(--accent-cyan)';
    } else if (eqFocal >= 70 && eqFocal < 135) {
      category = 'Telephoto';
      labelColor = 'var(--accent-film)';
    } else if (eqFocal >= 135) {
      category = 'Super Tele';
      labelColor = 'var(--accent-purple)';
    }
    valCategory.textContent = category;
    valCategory.style.color = labelColor;

    // Render SVG Visualization
    renderFovGraphics(eqFocal, distance);

    // Render Educational Analysis Output
    renderFovExplanation(eqFocal, distance, angleDeg, sensorCrop);
  }

  function renderFovGraphics(eqFocal, distance) {
    // Canvas dimensions: 800 x 450
    const w = 800;
    const h = 450;

    // Background compression factor (higher eqFocal = larger background = compressed perspective)
    // 50mm is base scale (1.0). Telephoto zooms in, Wide angle scales out.
    const baseFocal = 50;
    const scaleFactor = eqFocal / baseFocal;

    // Subject size is directly proportional to focal length, and inversely proportional to distance
    // Let's create a reasonable scale for rendering
    const baseDistance = 3; // 3m is base distance
    const subjectScale = scaleFactor * (baseDistance / distance);
    const subjectHeight = 220 * subjectScale;
    const subjectWidth = 70 * subjectScale;

    // Clean canvas
    fovSvg.innerHTML = '';

    // Create Background Sky
    const sky = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    sky.setAttribute('x', '0');
    sky.setAttribute('y', '0');
    sky.setAttribute('width', w.toString());
    sky.setAttribute('height', h.toString());
    sky.setAttribute('fill', 'url(#skyGradient)');
    fovSvg.appendChild(sky);

    // Setup Gradients
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0F0F1A" />
        <stop offset="60%" stop-color="#1A1C30" />
        <stop offset="100%" stop-color="#261E33" />
      </linearGradient>
      <linearGradient id="mountains" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2D2845" />
        <stop offset="100%" stop-color="#131222" />
      </linearGradient>
      <linearGradient id="subjectGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--accent-amber)" />
        <stop offset="100%" stop-color="var(--accent-film)" />
      </linearGradient>
    `;
    fovSvg.appendChild(defs);

    // Create Background Mountains (scale with eqFocal)
    const m1Scale = 40 * scaleFactor;
    const m2Scale = 70 * scaleFactor;
    const horizon = 320; // Horizon y-coordinate

    const mountainsPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const mPoints = [
      `M -100 ${horizon}`,
      `Q ${w * 0.25} ${horizon - m1Scale - 20} ${w * 0.5} ${horizon - m1Scale}`,
      `Q ${w * 0.75} ${horizon - m2Scale - 30} ${w + 100} ${horizon - m2Scale}`,
      `L ${w + 100} ${h}`,
      `L -100 ${h} Z`
    ].join(' ');
    mountainsPath.setAttribute('d', mPoints);
    mountainsPath.setAttribute('fill', 'url(#mountains)');
    fovSvg.appendChild(mountainsPath);

    // Create Ground
    const ground = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ground.setAttribute('x', '0');
    ground.setAttribute('y', horizon.toString());
    ground.setAttribute('width', w.toString());
    ground.setAttribute('height', (h - horizon).toString());
    ground.setAttribute('fill', '#0E0D14');
    fovSvg.appendChild(ground);

    // Create Sun/Light Source (at horizon)
    const sunScale = 120 * scaleFactor;
    if (sunScale > 5) {
      const sun = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      sun.setAttribute('cx', (w * 0.5).toString());
      sun.setAttribute('cy', horizon.toString());
      sun.setAttribute('r', sunScale.toString());
      sun.setAttribute('fill', 'rgba(245, 166, 35, 0.08)');
      sun.setAttribute('filter', 'blur(10px)');
      fovSvg.appendChild(sun);
    }

    // Create Subject (Silhouette standing)
    // Draw subject centered horizontally
    const subX = w / 2;
    const subY = horizon + 30; // Feet position on the ground

    // Only draw subject if size is reasonable (not zoomed in too close or far away)
    if (subjectHeight > 5 && subjectHeight < h * 3) {
      const gSubject = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      // Draw silhouette head
      const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      head.setAttribute('cx', subX.toString());
      head.setAttribute('cy', (subY - subjectHeight).toString());
      head.setAttribute('r', (subjectWidth * 0.35).toString());
      head.setAttribute('fill', 'url(#subjectGrad)');
      gSubject.appendChild(head);

      // Draw body (neck + shoulders + body)
      const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const neckY = subY - subjectHeight + (subjectWidth * 0.35);
      const bPoints = [
        `M ${subX - subjectWidth * 0.2} ${neckY}`,
        `C ${subX - subjectWidth * 0.5} ${neckY + subjectHeight * 0.15} ${subX - subjectWidth * 0.5} ${subY}`,
        `L ${subX - subjectWidth * 0.3} ${subY}`,
        `L ${subX - subjectWidth * 0.1} ${subY - subjectHeight * 0.4}`,
        `L ${subX + subjectWidth * 0.1} ${subY - subjectHeight * 0.4}`,
        `L ${subX + subjectWidth * 0.3} ${subY}`,
        `L ${subX + subjectWidth * 0.5} ${subY}`,
        `C ${subX + subjectWidth * 0.5} ${neckY + subjectHeight * 0.15} ${subX + subjectWidth * 0.2} ${neckY}`,
        `Z`
      ].join(' ');
      body.setAttribute('d', bPoints);
      body.setAttribute('fill', 'url(#subjectGrad)');
      gSubject.appendChild(body);

      fovSvg.appendChild(gSubject);
    } else if (subjectHeight >= h * 3) {
      // Too close warning graphic indicator
      const warningText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      warningText.setAttribute('x', (w / 2).toString());
      warningText.setAttribute('y', (h / 2).toString());
      warningText.setAttribute('fill', 'var(--accent-film)');
      warningText.setAttribute('font-family', 'var(--font-mono)');
      warningText.setAttribute('font-size', '14');
      warningText.setAttribute('text-anchor', 'middle');
      warningText.textContent = '[ SUBJECT TOO CLOSE / EXTREME CROP ]';
      fovSvg.appendChild(warningText);
    }

    // Border HUD lines
    const borderHud = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    borderHud.setAttribute('x', '20');
    borderHud.setAttribute('y', '20');
    borderHud.setAttribute('width', (w - 40).toString());
    borderHud.setAttribute('height', (h - 40).toString());
    borderHud.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
    borderHud.setAttribute('stroke-width', '1');
    borderHud.setAttribute('fill', 'none');
    fovSvg.appendChild(borderHud);
  }

  function renderFovExplanation(eqFocal, distance, angleDeg, crop) {
    let explanationHTML = `
      <div class="output-header" style="margin-bottom: var(--space-md); padding-bottom: var(--space-md);">
        <h3>Đánh giá quang học: Tiêu cự thực tế ${focalSlider.value}mm trên cảm biến crop ${crop}x</h3>
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.82rem; margin-top: 4px;">
          Góc nhìn tương đương ống kính <strong>${eqFocal}mm</strong> trên máy ảnh Full-Frame
        </p>
      </div>
      <div class="output-grid">
    `;

    // 1. Perspective explanation
    explanationHTML += `
      <div class="output-card">
        <h4>👁️ Tác động không gian & Góc nhìn</h4>
        <p>Với góc nhìn <strong>${angleDeg}°</strong>, khung hình này thuộc nhóm `;
    
    if (eqFocal < 24) {
      explanationHTML += `<strong>Siêu rộng (Ultra-Wide)</strong>. Không gian hậu cảnh sẽ bị đẩy ra xa cực đại, tạo độ sâu hút sâu hun hút. Tuy nhiên, rìa hình sẽ bị kéo giãn mạnh. Không nên đưa camera sát mặt người vì sẽ gây méo nghiêm trọng.`;
    } else if (eqFocal < 35) {
      explanationHTML += `<strong>Góc rộng (Wide Angle)</strong>. Rất lý tưởng để kể chuyện đời thường lấy trọn bối cảnh xung quanh chủ thể. Tạo cảm giác năng động và bao quát.`;
    } else if (eqFocal >= 35 && eqFocal < 70) {
      explanationHTML += `<strong>Tiêu chuẩn (Standard)</strong>. Phối cảnh nhìn tự nhiên, hài hòa giống hệt mắt người cảm nhận trực tiếp ngoài đời thực. Không bị bóp méo không gian, mang lại sự trung thực tuyệt đối.`;
    } else {
      explanationHTML += `<strong>Ống kính Tele (Telephoto)</strong>. Không gian bị nén lại. Hậu cảnh có cảm giác phình to và được kéo sát lại ngay sau lưng chủ thể, tạo chiều sâu điện ảnh độc đáo.`;
    }
    explanationHTML += `</p></div>`;

    // 2. Framing advice based on distance
    explanationHTML += `
      <div class="output-card">
        <h4>📏 Khung hình & Khoảng cách (${distance.toFixed(1)}m)</h4>
        <p>Đứng cách chủ thể <strong>${distance} mét</strong> với tiêu cự tương đương <strong>${eqFocal}mm</strong>: </p>
        <ul style="margin-top: 8px;">
    `;

    // Estimate framing
    const framingRatio = eqFocal / (distance * 10);
    if (framingRatio > 2.0) {
      explanationHTML += `
        <li>Khung hình: <strong>Cận cảnh đặc tả (Extreme Close-Up)</strong>. Chỉ lấy được một phần khuôn mặt hoặc mắt của chủ thể.</li>
        <li>Rủi ro: Rất dễ bị out nét khi chủ thể cử động nhẹ. Cần khép khẩu một chút.</li>
      `;
    } else if (framingRatio > 0.8) {
      explanationHTML += `
        <li>Khung hình: <strong>Chân dung đặc tả (Close-Up / Headshot)</strong>. Thích hợp chụp khuôn mặt, lấy thần thái biểu cảm.</li>
        <li>Khuyên dùng: Sigma 56mm hoặc RF 85mm f/1.8 chụp góc này cực kỳ xuất sắc.</li>
      `;
    } else if (framingRatio > 0.4) {
      explanationHTML += `
        <li>Khung hình: <strong>Bán thân trung cảnh (Medium Portrait / Waist-up)</strong>. Lấy từ thắt lưng trở lên. Tỷ lệ vàng của chân dung đời thường.</li>
        <li>Setup: Khoảng cách này xóa phông tốt nhất mà vẫn giữ được sự tương tác gần gũi.</li>
      `;
    } else {
      explanationHTML += `
        <li>Khung hình: <strong>Toàn cảnh chủ thể (Full Body / Environmental)</strong>. Chụp trọn vẹn người từ đầu đến chân và bối cảnh xung quanh.</li>
        <li>Gợi ý: Cần hậu cảnh đẹp và sắp xếp bố cục 1/3 hợp lý.</li>
      `;
    }
    explanationHTML += `</ul></div>`;

    // 3. Recommended applications
    explanationHTML += `
      <div class="output-card full-width">
        <h4>💡 Lời khuyên thực tiễn từ phòng Lab</h4>
        <p>
    `;
    if (eqFocal < 24) {
      explanationHTML += `Dành cho chụp phong cảnh thiên nhiên, kiến trúc đô thị đồ sộ hoặc các shot quay góc rộng kịch tính từ sát đất. Tránh dí sát vào mặt người nếu không muốn biến dạng chân dung.`;
    } else if (eqFocal < 35) {
      explanationHTML += `Lý tưởng cho chụp đường phố (Street photography), vlog gia đình. Trên Canon R50, tiêu cự lens kit góc rộng nhất 18mm (tương đương 29mm full-frame) rất phù hợp chụp nội thất quán cafe và đi du lịch lấy nhiều bối cảnh.`;
    } else if (eqFocal >= 35 && eqFocal < 70) {
      explanationHTML += `Tiêu cự vàng để học bố cục. Hãy gắn lens RF 35mm f/1.8 (tương đương 56mm trên Canon R50) và giữ cố định nó. Việc học cách sắp đặt khung hình ở góc tiêu chuẩn sẽ nâng cấp tư duy nhiếp ảnh của bạn rất nhanh.`;
    } else if (eqFocal >= 70 && eqFocal < 135) {
      explanationHTML += `Đây là dải chân dung chuyên nghiệp. Tiêu cự Sigma 56mm f/1.4 trên APS-C hay 85mm f/1.8 trên Full Frame sẽ giúp bạn có những shot hình xóa phông nghệ thuật, tôn vinh nét mặt thanh lịch, hoàn toàn không bị phình mặt do méo quang học.`;
    } else {
      explanationHTML += `Tiêu cự tele dài chuyên dùng để cô lập chủ thể khỏi đám đông hỗn loạn, chụp thể thao, chim thú hoặc đặc tả chi tiết kiến trúc xa xôi. Khuyên dùng tốc độ màn trập tối thiểu 1/250s trở lên để tránh hiện tượng nhòe do rung tay.`;
    }
    explanationHTML += `
        </p>
      </div>
    `;

    explanationHTML += `</div>`;
    fovOutput.innerHTML = explanationHTML;
  }

  // Event Listeners
  sensorSelect.addEventListener('change', calculateFOV);
  focalSlider.addEventListener('input', calculateFOV);
  distanceSlider.addEventListener('input', calculateFOV);

  // Initial Run
  calculateFOV();
});
