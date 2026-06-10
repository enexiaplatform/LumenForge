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
    let category = 'Tiêu chuẩn';
    let labelColor = 'var(--accent-amber)';
    if (eqFocal < 24) {
      category = 'Góc siêu rộng (Ultra-Wide)';
      labelColor = 'var(--accent-cyan)';
    } else if (eqFocal < 35) {
      category = 'Góc rộng (Wide Angle)';
      labelColor = 'var(--accent-cyan)';
    } else if (eqFocal >= 70 && eqFocal < 135) {
      category = 'Viễn kính (Telephoto)';
      labelColor = 'var(--accent-film)';
    } else if (eqFocal >= 135) {
      category = 'Siêu Tele (Super Tele)';
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

    // Base Focal Length is 50mm. Scale factor relative to 50mm.
    const scaleFactor = eqFocal / 50;

    // Background is far away (infinity), so it scales directly with focal length
    const bgScale = scaleFactor;
    
    // Subject scale depends on BOTH focal length and distance
    // If distance increases, subject looks smaller. If focal increases, subject looks bigger.
    const baseDistance = 3; // 3m is base distance for 1x scale
    const subjectScale = scaleFactor * (baseDistance / distance);
    
    const subjectHeight = 250 * subjectScale;
    const subjectWidth = 100 * subjectScale;

    // Clean canvas
    fovSvg.innerHTML = '';

    // Create defs
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Create Clip Path for Subject (Stylized human silhouette)
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clipPath.setAttribute('id', 'subjectClip');
    
    // Head and shoulders path (normalized 0 to 1)
    const sPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    sPath.setAttribute('d', 'M0.3,1 L0.3,0.7 C0.3,0.5 0.2,0.4 0,0.4 L0,0.3 C0.2,0.3 0.35,0.2 0.35,0 L0.65,0 C0.65,0.2 0.8,0.3 1,0.3 L1,0.4 C0.8,0.4 0.7,0.5 0.7,0.7 L0.7,1 Z');
    // Using objectBoundingBox so the path scales to the image
    clipPath.setAttribute('clipPathUnits', 'objectBoundingBox');
    clipPath.appendChild(sPath);
    defs.appendChild(clipPath);

    fovSvg.appendChild(defs);

    // 1. Draw Background Image
    // We scale the background from the center
    const bgW = w * bgScale;
    const bgH = h * bgScale;
    const bgX = (w - bgW) / 2;
    const bgY = (h - bgH) / 2;

    const bgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    bgImage.setAttribute('href', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop');
    bgImage.setAttribute('x', bgX.toString());
    bgImage.setAttribute('y', bgY.toString());
    bgImage.setAttribute('width', bgW.toString());
    bgImage.setAttribute('height', bgH.toString());
    // Blur background based on distance and focal length to simulate Depth of Field
    const blurAmount = Math.max(0, (eqFocal - 35) / 20 * (3 / distance));
    if (blurAmount > 0) {
      bgImage.setAttribute('filter', `blur(${blurAmount}px)`);
    }
    fovSvg.appendChild(bgImage);

    // 2. Draw Subject Image (Foreground)
    const subX = (w - subjectWidth) / 2;
    const subY = h - subjectHeight + (subjectHeight * 0.1); // Slightly below bottom

    if (subjectHeight > 10 && subjectHeight < h * 4) {
      const subImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      subImage.setAttribute('href', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop');
      subImage.setAttribute('x', subX.toString());
      subImage.setAttribute('y', subY.toString());
      subImage.setAttribute('width', subjectWidth.toString());
      subImage.setAttribute('height', subjectHeight.toString());
      subImage.setAttribute('clip-path', 'url(#subjectClip)');
      // Preserve aspect ratio slice
      subImage.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      fovSvg.appendChild(subImage);
    } else if (subjectHeight >= h * 4) {
      // Too close warning graphic indicator
      const warningText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      warningText.setAttribute('x', (w / 2).toString());
      warningText.setAttribute('y', (h / 2).toString());
      warningText.setAttribute('fill', 'var(--accent-film)');
      warningText.setAttribute('font-family', 'var(--font-mono)');
      warningText.setAttribute('font-weight', 'bold');
      warningText.setAttribute('font-size', '18');
      warningText.setAttribute('text-anchor', 'middle');
      warningText.textContent = '[ CHỦ THỂ QUÁ GẦN / OUT OF FOCUS ]';
      // Add text shadow
      warningText.setAttribute('style', 'text-shadow: 0 2px 10px rgba(0,0,0,0.8);');
      fovSvg.appendChild(warningText);
    }

    // 3. UI Viewfinder Overlay
    // Crosshair
    const crosshair = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    crosshair.setAttribute('d', `M ${w/2 - 20} ${h/2} L ${w/2 + 20} ${h/2} M ${w/2} ${h/2 - 20} L ${w/2} ${h/2 + 20}`);
    crosshair.setAttribute('stroke', 'rgba(255, 255, 255, 0.4)');
    crosshair.setAttribute('stroke-width', '1');
    fovSvg.appendChild(crosshair);
    
    // Focus brackets
    const bracketSize = 60;
    const brackets = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    brackets.setAttribute('d', `
      M ${w/2 - bracketSize} ${h/2 - bracketSize + 10} L ${w/2 - bracketSize} ${h/2 - bracketSize} L ${w/2 - bracketSize + 10} ${h/2 - bracketSize}
      M ${w/2 + bracketSize - 10} ${h/2 - bracketSize} L ${w/2 + bracketSize} ${h/2 - bracketSize} L ${w/2 + bracketSize} ${h/2 - bracketSize + 10}
      M ${w/2 - bracketSize} ${h/2 + bracketSize - 10} L ${w/2 - bracketSize} ${h/2 + bracketSize} L ${w/2 - bracketSize + 10} ${h/2 + bracketSize}
      M ${w/2 + bracketSize - 10} ${h/2 + bracketSize} L ${w/2 + bracketSize} ${h/2 + bracketSize} L ${w/2 + bracketSize} ${h/2 + bracketSize - 10}
    `);
    brackets.setAttribute('stroke', 'rgba(255, 255, 255, 0.6)');
    brackets.setAttribute('stroke-width', '2');
    brackets.setAttribute('fill', 'none');
    fovSvg.appendChild(brackets);

    // Border HUD lines
    const borderHud = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    borderHud.setAttribute('x', '20');
    borderHud.setAttribute('y', '20');
    borderHud.setAttribute('width', (w - 40).toString());
    borderHud.setAttribute('height', (h - 40).toString());
    borderHud.setAttribute('stroke', 'rgba(255, 255, 255, 0.15)');
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
