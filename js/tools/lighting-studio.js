/* ==========================================================================
   LUMENFORGE — Dynamic Lighting Studio Logic
   3-Point Portrait Lighting Simulator
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. STATE MANAGEMENT
  // ==========================================================================

  const lights = {
    key: { angle: 45, intensity: 85, kelvin: 4500, softness: 60 },
    fill: { angle: 315, intensity: 30, kelvin: 5500, softness: 80 },
    rim: { angle: 180, intensity: 50, kelvin: 5000, softness: 20 }
  };

  // ==========================================================================
  // 2. LIGHTING PRESETS
  // ==========================================================================

  const presets = {
    rembrandt: {
      name: 'Rembrandt',
      nameVi: 'Ánh sáng Rembrandt',
      key: { angle: 45, intensity: 85, kelvin: 4500, softness: 60 },
      fill: { angle: 315, intensity: 30, kelvin: 5500, softness: 80 },
      rim: { angle: 180, intensity: 50, kelvin: 5000, softness: 20 }
    },
    butterfly: {
      name: 'Butterfly',
      nameVi: 'Ánh sáng Bướm (Paramount)',
      key: { angle: 0, intensity: 90, kelvin: 5000, softness: 40 },
      fill: { angle: 180, intensity: 20, kelvin: 5500, softness: 90 },
      rim: { angle: 180, intensity: 40, kelvin: 5500, softness: 30 }
    },
    split: {
      name: 'Split',
      nameVi: 'Ánh sáng Chia đôi',
      key: { angle: 90, intensity: 80, kelvin: 4000, softness: 30 },
      fill: { angle: 270, intensity: 0, kelvin: 5500, softness: 90 },
      rim: { angle: 270, intensity: 45, kelvin: 5500, softness: 25 }
    },
    loop: {
      name: 'Loop',
      nameVi: 'Ánh sáng Loop (Vòng)',
      key: { angle: 35, intensity: 80, kelvin: 5000, softness: 50 },
      fill: { angle: 325, intensity: 35, kelvin: 5500, softness: 70 },
      rim: { angle: 200, intensity: 40, kelvin: 5000, softness: 30 }
    },
    rim: {
      name: 'Rim / Silhouette',
      nameVi: 'Ánh sáng Viền / Bóng đen',
      key: { angle: 0, intensity: 15, kelvin: 5500, softness: 90 },
      fill: { angle: 0, intensity: 10, kelvin: 5500, softness: 90 },
      rim: { angle: 180, intensity: 95, kelvin: 4000, softness: 15 }
    },
    broad: {
      name: 'Broad',
      nameVi: 'Ánh sáng Rộng',
      key: { angle: 315, intensity: 80, kelvin: 4500, softness: 50 },
      fill: { angle: 45, intensity: 25, kelvin: 5500, softness: 80 },
      rim: { angle: 180, intensity: 45, kelvin: 5000, softness: 25 }
    },
    short: {
      name: 'Short',
      nameVi: 'Ánh sáng Hẹp',
      key: { angle: 45, intensity: 80, kelvin: 4500, softness: 50 },
      fill: { angle: 315, intensity: 25, kelvin: 5500, softness: 80 },
      rim: { angle: 180, intensity: 45, kelvin: 5000, softness: 25 }
    }
  };

  // ==========================================================================
  // 3. DOM REFERENCES
  // ==========================================================================

  const sliderIds = ['angle', 'intensity', 'kelvin', 'softness'];
  const lightNames = ['key', 'fill', 'rim'];

  const sliders = {};
  const valLabels = {};

  lightNames.forEach(name => {
    sliders[name] = {};
    valLabels[name] = {};
    sliderIds.forEach(prop => {
      sliders[name][prop] = document.getElementById(`${name}-${prop}`);
      valLabels[name][prop] = document.getElementById(`${name}-${prop}-val`);
    });
  });

  const presetCards = document.querySelectorAll('#lighting-presets .radio-card');
  const outputEl = document.getElementById('lighting-output');

  // HUD elements
  const hudPattern = document.getElementById('hud-pattern');
  const hudKey = document.getElementById('hud-key');
  const hudFill = document.getElementById('hud-fill');
  const hudRim = document.getElementById('hud-rim');
  const hudRatio = document.getElementById('hud-ratio');

  // Ratio display
  const ratioKey = document.getElementById('ratio-key');
  const ratioFill = document.getElementById('ratio-fill');
  const ratioRim = document.getElementById('ratio-rim');

  // SVG elements
  const keyGradS0 = document.getElementById('key-grad-s0');
  const keyGradS1 = document.getElementById('key-grad-s1');
  const keyGradS2 = document.getElementById('key-grad-s2');
  const fillGradS0 = document.getElementById('fill-grad-s0');
  const fillGradS1 = document.getElementById('fill-grad-s1');
  const fillGradS2 = document.getElementById('fill-grad-s2');
  const rimGradS0 = document.getElementById('rim-grad-s0');
  const rimGradS1 = document.getElementById('rim-grad-s1');
  const rimGradS2 = document.getElementById('rim-grad-s2');

  const keyLightGrad = document.getElementById('key-light-grad');
  const fillLightGrad = document.getElementById('fill-light-grad');
  const rimLightGrad = document.getElementById('rim-light-grad');

  const keyLightRect = document.getElementById('key-light-rect');
  const fillLightRect = document.getElementById('fill-light-rect');

  const rimContour = document.getElementById('rim-contour');
  const rimContourInner = document.getElementById('rim-contour-inner');

  const shadowRect = document.getElementById('shadow-rect');
  const lightBlurStd = document.getElementById('light-blur-std');
  const rimGlowStd = document.getElementById('rim-glow-std');

  const specForehead = document.getElementById('spec-forehead');
  const specCheek = document.getElementById('spec-cheek');
  const specNose = document.getElementById('spec-nose');

  // Orbit diagram
  const orbitKeyDot = document.getElementById('orbit-key-dot');
  const orbitFillDot = document.getElementById('orbit-fill-dot');
  const orbitRimDot = document.getElementById('orbit-rim-dot');
  const orbitKeyLine = document.getElementById('orbit-key-line');
  const orbitFillLine = document.getElementById('orbit-fill-line');
  const orbitRimLine = document.getElementById('orbit-rim-line');
  const orbitKeyLabel = document.getElementById('orbit-key-label');
  const orbitFillLabel = document.getElementById('orbit-fill-label');
  const orbitRimLabel = document.getElementById('orbit-rim-label');

  // ==========================================================================
  // 4. KELVIN TO RGB CONVERSION
  // ==========================================================================

  function kelvinToRGB(kelvin) {
    // Attempt approximate blackbody -> RGB for photographic color temperature
    // Based on Tanner Helland's algorithm adapted for 2500K–9000K range
    const temp = kelvin / 100;
    let r, g, b;

    // Red channel
    if (temp <= 66) {
      r = 255;
    } else {
      r = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
      r = Math.max(0, Math.min(255, r));
    }

    // Green channel
    if (temp <= 66) {
      g = 99.4708025861 * Math.log(temp) - 161.1195681661;
    } else {
      g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    }
    g = Math.max(0, Math.min(255, g));

    // Blue channel
    if (temp >= 66) {
      b = 255;
    } else if (temp <= 19) {
      b = 0;
    } else {
      b = 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
      b = Math.max(0, Math.min(255, b));
    }

    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b)
    };
  }

  function rgbStr(rgb) {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  // ==========================================================================
  // 5. ANGLE HELPERS
  // ==========================================================================

  const FACE_CX = 320;
  const FACE_CY = 240;
  const ORBIT_CX = 60;
  const ORBIT_CY = 60;
  const ORBIT_R = 42;

  function angleToXY(angleDeg, cx, cy, radius) {
    // 0° = top, clockwise
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad)
    };
  }

  function angleToGradientCenter(angleDeg) {
    // Map angle to SVG gradient focal point (0–1 normalized)
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return {
      cx: 0.5 + 0.35 * Math.cos(rad),
      cy: 0.5 + 0.35 * Math.sin(rad)
    };
  }

  // ==========================================================================
  // 6. RIM CONTOUR GENERATION
  // ==========================================================================

  function generateRimContour(angleDeg) {
    // Generate a contour path on the side of the face opposite to the rim light direction
    // 0° = top (rim from above), 90° = right, 180° = behind, 270° = left
    const norm = ((angleDeg % 360) + 360) % 360;
    // Determine which side the rim hits
    // Rim at 180° (behind) -> highlight on both sides
    // Rim at 90° (right) -> highlight on right edge
    // Rim at 270° (left) -> highlight on left edge

    if (norm >= 135 && norm <= 225) {
      // Rim from behind — both edges
      return 'M 195 160 C 190 200, 190 260, 200 310 C 210 340, 230 370, 260 395 M 445 160 C 450 200, 450 260, 440 310 C 430 340, 410 370, 380 395';
    } else if (norm >= 45 && norm < 135) {
      // Rim from right
      return 'M 445 150 C 452 190, 455 230, 450 280 C 445 330, 425 370, 390 405 C 370 420, 350 430, 340 435';
    } else if (norm > 225 && norm <= 315) {
      // Rim from left
      return 'M 195 150 C 188 190, 185 230, 190 280 C 195 330, 215 370, 250 405 C 270 420, 290 430, 300 435';
    } else {
      // Rim from top/front — top edge highlight
      return 'M 240 120 C 270 100, 330 95, 370 100 C 400 108, 420 125, 430 145';
    }
  }

  // ==========================================================================
  // 7. SHADOW RENDERING
  // ==========================================================================

  function updateShadow() {
    const keyAngle = lights.key.angle;
    const keyIntensity = lights.key.intensity;

    // Shadow falls opposite to key light direction
    // Higher intensity = less shadow
    const shadowOpacity = Math.max(0.1, 0.7 - (keyIntensity / 100) * 0.45);
    shadowRect.setAttribute('opacity', shadowOpacity.toFixed(2));

    // Position shadow based on key angle
    // Use a gradient approach: shadow is a semi-transparent rect offset based on angle
    const rad = (keyAngle - 90) * (Math.PI / 180);
    const offsetX = -Math.cos(rad) * 80;
    const offsetY = -Math.sin(rad) * 60;

    shadowRect.setAttribute('x', (FACE_CX + offsetX - 320).toFixed(0));
    shadowRect.setAttribute('y', (FACE_CY + offsetY - 240).toFixed(0));
  }

  // ==========================================================================
  // 8. SVG MANIPULATION — UPDATE LIGHTING VISUALS
  // ==========================================================================

  let rafPending = false;

  function updateVisuals() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(_renderVisuals);
  }

  function _renderVisuals() {
    rafPending = false;

    // --- Key Light ---
    const keyRGB = kelvinToRGB(lights.key.kelvin);
    const keyColor = rgbStr(keyRGB);
    const keyOpacity = lights.key.intensity / 100;
    const keySoftness = 10 + (lights.key.softness / 100) * 30;
    const keyGC = angleToGradientCenter(lights.key.angle);

    keyLightGrad.setAttribute('cx', keyGC.cx.toFixed(3));
    keyLightGrad.setAttribute('cy', keyGC.cy.toFixed(3));
    keyLightGrad.setAttribute('fx', keyGC.cx.toFixed(3));
    keyLightGrad.setAttribute('fy', keyGC.cy.toFixed(3));
    keyGradS0.setAttribute('stop-color', keyColor);
    keyGradS0.setAttribute('stop-opacity', (0.6 * keyOpacity).toFixed(2));
    keyGradS1.setAttribute('stop-color', keyColor);
    keyGradS1.setAttribute('stop-opacity', (0.18 * keyOpacity).toFixed(2));
    keyGradS2.setAttribute('stop-color', keyColor);
    keyGradS2.setAttribute('stop-opacity', '0');
    keyLightRect.setAttribute('opacity', keyOpacity.toFixed(2));

    // --- Fill Light ---
    const fillRGB = kelvinToRGB(lights.fill.kelvin);
    const fillColor = rgbStr(fillRGB);
    const fillOpacity = lights.fill.intensity / 100;
    const fillGC = angleToGradientCenter(lights.fill.angle);

    fillLightGrad.setAttribute('cx', fillGC.cx.toFixed(3));
    fillLightGrad.setAttribute('cy', fillGC.cy.toFixed(3));
    fillLightGrad.setAttribute('fx', fillGC.cx.toFixed(3));
    fillLightGrad.setAttribute('fy', fillGC.cy.toFixed(3));
    fillGradS0.setAttribute('stop-color', fillColor);
    fillGradS0.setAttribute('stop-opacity', (0.4 * fillOpacity).toFixed(2));
    fillGradS1.setAttribute('stop-color', fillColor);
    fillGradS1.setAttribute('stop-opacity', (0.1 * fillOpacity).toFixed(2));
    fillGradS2.setAttribute('stop-color', fillColor);
    fillGradS2.setAttribute('stop-opacity', '0');
    fillLightRect.setAttribute('opacity', fillOpacity.toFixed(2));

    // --- Rim Light ---
    const rimRGB = kelvinToRGB(lights.rim.kelvin);
    const rimColor = rgbStr(rimRGB);
    const rimOpacity = lights.rim.intensity / 100;
    const rimSoft = 3 + (lights.rim.softness / 100) * 10;

    rimContour.setAttribute('d', generateRimContour(lights.rim.angle));
    rimContourInner.setAttribute('d', generateRimContour(lights.rim.angle));
    rimContour.setAttribute('stroke', rimColor);
    rimContourInner.setAttribute('stroke', rimColor);
    rimContour.setAttribute('stroke-opacity', (0.6 * rimOpacity).toFixed(2));
    rimContourInner.setAttribute('stroke-opacity', (0.35 * rimOpacity).toFixed(2));
    rimContour.setAttribute('stroke-width', (2 + lights.rim.softness / 25).toFixed(1));
    rimGlowStd.setAttribute('stdDeviation', rimSoft.toFixed(0));

    // Rim gradient for subtle fill on contour side
    const rimGC = angleToGradientCenter(lights.rim.angle);
    rimLightGrad.setAttribute('x1', rimGC.cx.toFixed(3));
    rimLightGrad.setAttribute('y1', rimGC.cy.toFixed(3));
    rimGradS0.setAttribute('stop-color', rimColor);
    rimGradS0.setAttribute('stop-opacity', (0.25 * rimOpacity).toFixed(2));
    rimGradS1.setAttribute('stop-color', rimColor);
    rimGradS1.setAttribute('stop-opacity', (0.06 * rimOpacity).toFixed(2));

    // --- Softness (blur) ---
    const avgSoftness = (lights.key.softness + lights.fill.softness) / 2;
    lightBlurStd.setAttribute('stdDeviation', (10 + avgSoftness * 0.25).toFixed(0));

    // --- Shadow ---
    updateShadow();

    // --- Specular highlights (shift based on key light angle) ---
    const specGC = angleToGradientCenter(lights.key.angle);
    const specBaseX = FACE_CX + (specGC.cx - 0.5) * 180;
    const specBaseY = FACE_CY + (specGC.cy - 0.5) * 120;
    specForehead.setAttribute('cx', (specBaseX - 20).toFixed(0));
    specForehead.setAttribute('cy', (specBaseY - 60).toFixed(0));
    specCheek.setAttribute('cx', (specBaseX).toFixed(0));
    specCheek.setAttribute('cy', (specBaseY + 20).toFixed(0));
    specNose.setAttribute('cx', (FACE_CX + (specGC.cx - 0.5) * 60).toFixed(0));
    specNose.setAttribute('cy', '250');
    document.getElementById('specular-layer').setAttribute('opacity', (0.3 + keyOpacity * 0.4).toFixed(2));

    // --- Orbit Diagram ---
    updateOrbit();

    // --- HUD ---
    updateHUD();

    // --- Ratios ---
    updateRatios();

    // --- Output ---
    renderOutput();
  }

  // ==========================================================================
  // 9. ORBIT DIAGRAM UPDATE
  // ==========================================================================

  function updateOrbit() {
    lightNames.forEach(name => {
      const pos = angleToXY(lights[name].angle, ORBIT_CX, ORBIT_CY, ORBIT_R);
      const dot = document.getElementById(`orbit-${name}-dot`);
      const line = document.getElementById(`orbit-${name}-line`);
      const label = document.getElementById(`orbit-${name}-label`);

      dot.setAttribute('cx', pos.x.toFixed(1));
      dot.setAttribute('cy', pos.y.toFixed(1));
      line.setAttribute('x2', pos.x.toFixed(1));
      line.setAttribute('y2', pos.y.toFixed(1));

      // Label offset (outside orbit)
      const labelPos = angleToXY(lights[name].angle, ORBIT_CX, ORBIT_CY, ORBIT_R + 14);
      label.setAttribute('x', labelPos.x.toFixed(1));
      label.setAttribute('y', labelPos.y.toFixed(1));

      // Size based on intensity
      const size = 3 + (lights[name].intensity / 100) * 4;
      dot.setAttribute('r', size.toFixed(1));
    });
  }

  // ==========================================================================
  // 10. HUD UPDATE
  // ==========================================================================

  function updateHUD() {
    const pattern = detectLightingPattern();
    hudPattern.textContent = pattern.name;
    hudKey.textContent = `${lights.key.angle}° • ${lights.key.intensity}% • ${lights.key.kelvin}K`;
    hudFill.textContent = `${lights.fill.angle}° • ${lights.fill.intensity}% • ${lights.fill.kelvin}K`;
    hudRim.textContent = `${lights.rim.angle}° • ${lights.rim.intensity}% • ${lights.rim.kelvin}K`;

    const ratio = getKeyFillRatio();
    hudRatio.textContent = ratio;
  }

  // ==========================================================================
  // 11. RATIO CALCULATIONS
  // ==========================================================================

  function getKeyFillRatio() {
    const ki = Math.max(lights.key.intensity, 1);
    const fi = Math.max(lights.fill.intensity, 1);
    const ratio = ki / fi;
    return ratio >= 10 ? `${Math.round(ratio)} : 1` : `${ratio.toFixed(1)} : 1`;
  }

  function updateRatios() {
    const ki = Math.max(lights.key.intensity, 1);
    const fi = Math.max(lights.fill.intensity, 1);
    const ri = Math.max(lights.rim.intensity, 1);
    const minI = Math.min(ki, fi, ri);

    ratioKey.textContent = (ki / minI).toFixed(1);
    ratioFill.textContent = (fi / minI).toFixed(1);
    ratioRim.textContent = (ri / minI).toFixed(1);
  }

  // ==========================================================================
  // 12. LIGHTING PATTERN DETECTION
  // ==========================================================================

  function detectLightingPattern() {
    const ka = lights.key.angle;
    const ki = lights.key.intensity;
    const fi = lights.fill.intensity;
    const ri = lights.rim.intensity;
    const ra = lights.rim.angle;

    // Rim / Silhouette: very low front light, very high rim
    if (ki <= 20 && fi <= 20 && ri >= 70) {
      return {
        name: 'Rim / Silhouette',
        nameVi: 'Ánh sáng Viền / Bóng đen',
        mood: 'Bí ẩn, kịch tính, nghệ thuật tối giản tối đa',
        moodEn: 'Mysterious, dramatic, maximally minimalist art',
        desc: 'Chủ thể gần như hoàn toàn chìm trong bóng tối, chỉ còn viền sáng mỏng manh phác họa đường nét. Kỹ thuật này tạo cảm giác huyền bí cực đoan, thường thấy trong poster phim kinh dị hoặc quảng cáo nước hoa cao cấp.',
        useCases: ['Poster phim nghệ thuật / kinh dị', 'Quảng cáo sản phẩm xa xỉ', 'Fine art photography', 'Music video / album cover'],
        mistakes: ['Mất chi tiết khuôn mặt hoàn toàn — cần reflector nhỏ nếu muốn giữ hint', 'Rim quá mạnh sẽ bị cháy trắng đường viền (blown highlight)'],
        gear: ['Đèn spot cứng 1 nguồn phía sau', 'Snoot hoặc grid để kiểm soát tràn sáng', 'Phông đen hoàn toàn (V-flat đen)']
      };
    }

    // Split: key at ~90° with very low/no fill
    if ((ka >= 75 && ka <= 105) && fi <= 10) {
      return {
        name: 'Split',
        nameVi: 'Ánh sáng Chia đôi',
        mood: 'Kịch tính mạnh mẽ, đối lập, bí ẩn nặng nề',
        moodEn: 'Dramatic, high contrast, deeply mysterious',
        desc: 'Chỉ đúng một nửa khuôn mặt được chiếu sáng — tạo sự phân chia hoàn hảo giữa ánh sáng và bóng tối. Đây là kỹ thuật tạo drama mạnh nhất, thể hiện sự đối lập nội tâm hoặc hai mặt của nhân vật.',
        useCases: ['Chân dung nghệ thuật đen trắng', 'Nhân vật phản diện trong phim', 'Tác phẩm fine art', 'Chân dung tâm trạng u uất'],
        mistakes: ['Nếu key không đúng 90° sẽ ra Loop thay vì Split', 'Fill quá mạnh sẽ phá hỏng hiệu ứng chia đôi'],
        gear: ['Đèn key cứng (bare bulb hoặc small modifier)', 'Không dùng fill hoặc fill rất yếu', 'Phông tối để giữ contrast']
      };
    }

    // Butterfly: key near 0° (top center)
    if (ka <= 15 || ka >= 350) {
      return {
        name: 'Butterfly (Paramount)',
        nameVi: 'Ánh sáng Bướm (Paramount)',
        mood: 'Glamour, sang trọng, thanh lịch Hollywood cổ điển',
        moodEn: 'Glamour, elegant, classic Hollywood sophistication',
        desc: 'Key light đặt trực diện phía trên tạo bóng hình bướm đặc trưng dưới mũi. Kỹ thuật Hollywood hoàng kim — làm nổi gò má, thu nhỏ khuôn mặt, tạo vẻ đẹp thanh thoát kinh điển.',
        useCases: ['Chân dung beauty / glamour', 'Ảnh thời trang cao cấp', 'Headshot diễn viên', 'Chân dung phụ nữ nổi bật gò má'],
        mistakes: ['Nếu key quá cao sẽ tạo bóng mắt sâu (raccoon eyes)', 'Không phù hợp mặt dài — bóng mũi kéo dài thêm'],
        gear: ['Đèn beauty dish hoặc softbox vuông lớn', 'Reflector trắng/bạc phía dưới cằm', 'Boom arm để đặt đèn cao trực diện']
      };
    }

    // Loop: key at 25–50° with moderate fill
    if (ka >= 25 && ka <= 50 && fi >= 20 && fi <= 50) {
      return {
        name: 'Loop',
        nameVi: 'Ánh sáng Loop (Vòng)',
        mood: 'Tự nhiên, dễ chịu, chuyên nghiệp ấm áp',
        moodEn: 'Natural, pleasant, warmly professional',
        desc: 'Key light đặt hơi chếch (30-45°) tạo bóng vòng nhỏ cạnh mũi — không chạm bóng má. Đây là kiểu sáng versatile nhất, phù hợp hầu hết khuôn mặt và mục đích sử dụng.',
        useCases: ['Headshot công ty / LinkedIn', 'Chân dung gia đình', 'Ảnh sự kiện chuyên nghiệp', 'Portrait editorial'],
        mistakes: ['Key quá cao hoặc quá xa sẽ trở thành Rembrandt', 'Fill quá mạnh sẽ làm phẳng gương mặt, mất chiều sâu'],
        gear: ['Softbox trung bình 60-90cm', 'Reflector hoặc đèn fill nhẹ', 'Bất kỳ modifier mềm nào cũng hoạt động tốt']
      };
    }

    // Rembrandt: key at ~40-60° creating triangle on shadow cheek
    if (ka >= 35 && ka <= 65 && fi < ki) {
      return {
        name: 'Rembrandt',
        nameVi: 'Ánh sáng Rembrandt',
        mood: 'Cổ điển, chiều sâu, nghệ thuật trường phái Hà Lan',
        moodEn: 'Classic, deep, Dutch master artistry',
        desc: 'Key light ở 45° cao tạo tam giác sáng đặc trưng trên má phía tối — dấu hiệu signature của kỹ thuật Rembrandt. Phong cách lấy cảm hứng từ danh họa Hà Lan, mang chiều sâu và tính cách mạnh mẽ cho chân dung.',
        useCases: ['Chân dung nghệ thuật cổ điển', 'Editorial magazine', 'Ảnh chân dung nam tính / cá tính', 'Fine art portrait'],
        mistakes: ['Tam giác sáng phải nhỏ gọn, chỉ bằng mắt hoặc nhỏ hơn', 'Fill quá mạnh sẽ xóa tam giác — giữ ratio ít nhất 3:1'],
        gear: ['Đèn key với modifier vừa (45-60cm softbox)', 'Fill rất nhẹ hoặc dùng reflector bạc', 'Đặt key cao hơn đầu mẫu ~45°']
      };
    }

    // Broad: key on same side as face turns to camera (315° = left side key)
    if (ka >= 290 && ka <= 340) {
      return {
        name: 'Broad',
        nameVi: 'Ánh sáng Rộng (Broad)',
        mood: 'Mở rộng, thoáng đãng, thân thiện gần gũi',
        moodEn: 'Expansive, open, warmly approachable',
        desc: 'Key light chiếu vào phía rộng của khuôn mặt (phía quay về camera). Kỹ thuật này làm mặt trông rộng hơn, tròn hơn — phù hợp gương mặt gầy nhưng cần tránh cho mặt tròn.',
        useCases: ['Chân dung người gầy muốn tạo khối đầy đặn', 'Ảnh thương mại thân thiện', 'Portrait trẻ em / gia đình', 'Corporate headshot nhẹ nhàng'],
        mistakes: ['Không phù hợp mặt tròn — sẽ càng tròn hơn', 'Thiếu chiều sâu nếu không có rim light tách nền'],
        gear: ['Softbox lớn hoặc umbrella', 'Fill nhẹ phía đối diện', 'Rim light tạo phân cách với phông']
      };
    }

    // Short: key on narrow side (opposite to camera-facing side)
    if (ka >= 40 && ka <= 70 && fi > 15) {
      return {
        name: 'Short',
        nameVi: 'Ánh sáng Hẹp (Short)',
        mood: 'Thu gọn, thanh thoát, tạo chiều sâu tinh tế',
        moodEn: 'Slimming, elegant, subtly dimensional',
        desc: 'Key light chiếu vào phía hẹp của khuôn mặt (phía quay ra xa camera). Kỹ thuật này thu nhỏ khuôn mặt, tạo đường nét thanh thoát và chiều sâu 3 chiều tự nhiên.',
        useCases: ['Chân dung người mặt tròn muốn thon gọn', 'Ảnh beauty / editorial cao cấp', 'Portrait chuyên nghiệp đa mục đích', 'Ảnh cưới thanh lịch'],
        mistakes: ['Key quá xa sẽ tạo bóng quá sâu — kiểm tra bóng mũi', 'Cần fill đủ để giữ chi tiết bên tối'],
        gear: ['Softbox vừa đặt bên "short" (xa camera)', 'Fill reflector hoặc đèn nhỏ bên "broad"', 'Rim/hair light tạo phân cách']
      };
    }

    // Default / Custom
    return {
      name: 'Custom Setup',
      nameVi: 'Thiết lập Tùy chỉnh',
      mood: 'Sáng tạo tự do, không theo khuôn mẫu cố định',
      moodEn: 'Free creative, no fixed pattern',
      desc: 'Bạn đang tạo setup ánh sáng riêng biệt không thuộc các pattern cổ điển. Đây có thể là một phong cách sáng tạo độc đáo hoặc đang trong quá trình thử nghiệm. Hãy chú ý tỷ lệ key-fill và kiểm tra bóng đổ.',
      useCases: ['Sáng tạo nghệ thuật tự do', 'Thử nghiệm phong cách mới', 'Lighting concept cá nhân', 'Mixed/creative editorial'],
      mistakes: ['Kiểm tra bóng đổ có đẹp không — bóng xấu = setup xấu', 'Đảm bảo mắt có catchlight rõ ràng'],
      gear: ['Tùy thuộc concept sáng tạo', 'Thử nhiều modifier khác nhau', 'Dùng gương/kính phản chiếu tạo hiệu ứng lạ']
    };
  }

  // ==========================================================================
  // 13. OUTPUT RENDERING
  // ==========================================================================

  function renderOutput() {
    const pattern = detectLightingPattern();
    const ratio = getKeyFillRatio();

    const ki = lights.key.intensity;
    const fi = lights.fill.intensity;
    const ri = lights.rim.intensity;

    // Contrast assessment
    let contrastLevel = '';
    const rawRatio = Math.max(ki, 1) / Math.max(fi, 1);
    if (rawRatio >= 8) contrastLevel = 'Cực cao (Extreme)';
    else if (rawRatio >= 4) contrastLevel = 'Cao (High)';
    else if (rawRatio >= 2) contrastLevel = 'Trung bình (Medium)';
    else contrastLevel = 'Thấp / phẳng (Low / Flat)';

    // Kelvin assessment for key
    let kelvinDesc = '';
    const kk = lights.key.kelvin;
    if (kk < 3500) kelvinDesc = '🕯️ Ấm vàng cam — nến / tungsten';
    else if (kk < 4500) kelvinDesc = '💡 Ấm nhẹ — halogen / golden hour';
    else if (kk < 5800) kelvinDesc = '☀️ Trung tính — ánh sáng ban ngày';
    else if (kk < 7000) kelvinDesc = '☁️ Mát nhẹ — bóng râm / mây';
    else kelvinDesc = '❄️ Lạnh — bóng râm sâu / blue hour';

    outputEl.innerHTML = `
      <div class="output-header" style="margin-bottom: var(--space-md); padding-bottom: var(--space-md);">
        <h3>Lighting Pattern: <span style="color: var(--accent-amber); font-family: var(--font-mono);">${pattern.name}</span></h3>
        <p style="font-size:0.82rem; color:var(--text-secondary); margin-top:4px;">
          ${pattern.nameVi} — <em>${pattern.mood}</em>
        </p>
      </div>

      <div class="output-grid">

        <div class="output-card">
          <h4>💡 Phân Tích Setup</h4>
          <p>${pattern.desc}</p>
          <ul style="margin-top: 12px;">
            <li><strong>Key-Fill Ratio:</strong> ${ratio} — ${contrastLevel}</li>
            <li><strong>Nhiệt độ Key:</strong> ${kelvinDesc}</li>
            <li><strong>Rim Intensity:</strong> ${ri}% — ${ri > 60 ? 'Viền sáng nổi bật' : ri > 30 ? 'Viền sáng vừa phải' : 'Viền rất nhẹ / không có'}</li>
          </ul>
        </div>

        <div class="output-card">
          <h4>🎯 Phù Hợp Sử Dụng</h4>
          <ul>
            ${pattern.useCases.map(u => `<li>${u}</li>`).join('')}
          </ul>
        </div>

        <div class="output-card">
          <h4>⚠️ Lỗi Thường Gặp</h4>
          <ul>
            ${pattern.mistakes.map(m => `<li>${m}</li>`).join('')}
          </ul>
        </div>

        <div class="output-card">
          <h4>🔧 Thiết Bị Khuyên Dùng</h4>
          <ul>
            ${pattern.gear.map(g => `<li>${g}</li>`).join('')}
          </ul>
        </div>

      </div>
    `;
  }

  // ==========================================================================
  // 14. SLIDER SYNCHRONIZATION
  // ==========================================================================

  function syncSlidersFromState() {
    lightNames.forEach(name => {
      sliders[name].angle.value = lights[name].angle;
      sliders[name].intensity.value = lights[name].intensity;
      sliders[name].kelvin.value = lights[name].kelvin;
      sliders[name].softness.value = lights[name].softness;

      valLabels[name].angle.textContent = `${lights[name].angle}°`;
      valLabels[name].intensity.textContent = `${lights[name].intensity}%`;
      valLabels[name].kelvin.textContent = `${lights[name].kelvin}K`;
      valLabels[name].softness.textContent = lights[name].softness;
    });
  }

  function readSlidersToState() {
    lightNames.forEach(name => {
      lights[name].angle = parseInt(sliders[name].angle.value);
      lights[name].intensity = parseInt(sliders[name].intensity.value);
      lights[name].kelvin = parseInt(sliders[name].kelvin.value);
      lights[name].softness = parseInt(sliders[name].softness.value);

      valLabels[name].angle.textContent = `${lights[name].angle}°`;
      valLabels[name].intensity.textContent = `${lights[name].intensity}%`;
      valLabels[name].kelvin.textContent = `${lights[name].kelvin}K`;
      valLabels[name].softness.textContent = lights[name].softness;
    });
  }

  // ==========================================================================
  // 15. EVENT BINDINGS
  // ==========================================================================

  // Slider input events
  lightNames.forEach(name => {
    sliderIds.forEach(prop => {
      sliders[name][prop].addEventListener('input', () => {
        readSlidersToState();
        // Switch to "custom" preset appearance
        switchToCustomPreset();
        updateVisuals();
      });
    });
  });

  function switchToCustomPreset() {
    presetCards.forEach(c => c.classList.remove('selected'));
    // No preset highlighted = custom
  }

  // Preset card click events
  presetCards.forEach(card => {
    const input = card.querySelector('input[type="radio"]');

    card.addEventListener('click', (e) => {
      if (e.target !== input) {
        input.checked = true;
      }

      presetCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const presetKey = input.value;
      const config = presets[presetKey];

      if (config) {
        lights.key = { ...config.key };
        lights.fill = { ...config.fill };
        lights.rim = { ...config.rim };

        syncSlidersFromState();
        updateVisuals();
      }
    });
  });

  // ==========================================================================
  // 16. INITIALIZATION
  // ==========================================================================

  syncSlidersFromState();
  updateVisuals();

});
