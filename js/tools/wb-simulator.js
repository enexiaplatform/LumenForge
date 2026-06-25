/* ==========================================================================
   LUMENFORGE — White Balance & Color Temperature Simulator Logic
   ========================================================================== */

(function() {
  'use strict';

  // === Presets Database ===
  const PRESETS = [
    { name: 'Nến / Lửa',        kelvin: 1800, tint: 0,   icon: '#ff6a00', desc: 'Ánh sáng nến truyền thống (1800-2000K). Tạo cảm giác ấm cúng, lãng mạn, thân mật.' },
    { name: 'Đèn sợi đốt',      kelvin: 2700, tint: 0,   icon: '#ffaa44', desc: 'Bóng đèn Tungsten truyền thống (2700K). Ánh sáng ấm vàng đặc trưng của không gian nội thất cổ điển.' },
    { name: 'Bình minh / Hoàng hôn', kelvin: 3200, tint: 5,  icon: '#ffc87c', desc: 'Golden Hour (3000-3500K). Thời điểm vàng của nhiếp ảnh chân dung và phong cảnh.' },
    { name: 'Đèn huỳnh quang',   kelvin: 4000, tint: 30,  icon: '#e8e4c4', desc: 'Đèn huỳnh quang thường có phổ phát xạ không liên tục, tạo sắc xanh lá. Cần bù Tint về phía hồng (+20 đến +40).' },
    { name: 'Flash / Strobe',    kelvin: 5500, tint: 0,   icon: '#ffffff', desc: 'Đèn Flash studio tiêu chuẩn (5500K). Gần trùng với ánh sáng ban ngày, là điểm tham chiếu trung tính.' },
    { name: 'Trưa nắng gắt',    kelvin: 5600, tint: -5,  icon: '#fff5e6', desc: 'Ánh sáng mặt trời trực tiếp lúc giữa trưa (5500-6000K). Sắc nét, tương phản cao, bóng đổ ngắn.' },
    { name: 'Trời mây phủ',     kelvin: 6500, tint: 5,   icon: '#cdd8ff', desc: 'Ánh sáng khuếch tán qua mây (6000-7000K). Mềm mại, đồng đều, hơi lạnh — lý tưởng cho chân dung ngoài trời.' },
    { name: 'Bóng râm',         kelvin: 8000, tint: 10,  icon: '#99b0ff', desc: 'Vùng bóng râm ban ngày (7500-9000K). Ánh sáng chỉ từ bầu trời xanh phản chiếu, tạo tông rất lạnh thiên xanh.' },
    { name: 'Cyberpunk Neon (PRO)', kelvin: 10000, tint: -40, isPro: true, icon: 'linear-gradient(to right, #ff0055, #00f0ff)', desc: 'Tông màu cyberpunk viễn tưởng. Màu sắc độc đáo bù xanh ngọc kết hợp hồng cánh sen.' },
    { name: 'Golden Hour Film (PRO)', kelvin: 3400, tint: -15, isPro: true, icon: 'linear-gradient(to right, #d4af37, #b38b22)', desc: 'Tông màu vàng hổ phách của phim điện ảnh Hollywood. Tạo chiều sâu và độ ấm sang trọng.' }
  ];

  // === Scene Info ===
  const SCENES = {
    portrait: { label: 'Chân dung Studio', svgId: 'scene-portrait' },
    landscape: { label: 'Phong cảnh Núi rừng', svgId: 'scene-landscape' },
    street: { label: 'Đường phố Đêm', svgId: 'scene-street' },
    food: { label: 'Ẩm thực & Nến', svgId: 'scene-food' }
  };

  // === Elements ===
  const kelvinSlider = document.getElementById('kelvin-slider');
  const tintSlider = document.getElementById('tint-slider');
  const kelvinDisplay = document.getElementById('kelvin-display');
  const kelvinDot = document.getElementById('kelvin-dot');
  const valKelvin = document.getElementById('val-kelvin');
  const valTint = document.getElementById('val-tint');
  const overlay = document.getElementById('wb-overlay');
  const tintOverlay = document.getElementById('wb-tint-overlay');
  const presetsGrid = document.getElementById('presets-grid');
  const spectrumMarker = document.getElementById('spectrum-marker');
  const sceneLabel = document.getElementById('scene-label');
  const sceneSwitcher = document.getElementById('scene-switcher');
  const infoContent = document.getElementById('wb-info');

  let currentScene = 'portrait';

  // === Kelvin to RGB Approximation ===
  function kelvinToRGB(kelvin) {
    const temp = kelvin / 100;
    let r, g, b;

    // Red Channel
    if (temp <= 66) {
      r = 255;
    } else {
      r = temp - 60;
      r = 329.698727446 * Math.pow(r, -0.1332047592);
      r = Math.max(0, Math.min(255, r));
    }

    // Green Channel
    if (temp <= 66) {
      g = 99.4708025861 * Math.log(temp) - 161.1195681661;
    } else {
      g = temp - 60;
      g = 288.1221695283 * Math.pow(g, -0.0755148492);
    }
    g = Math.max(0, Math.min(255, g));

    // Blue Channel
    if (temp >= 66) {
      b = 255;
    } else if (temp <= 19) {
      b = 0;
    } else {
      b = temp - 10;
      b = 138.5177312231 * Math.log(b) - 305.0447927307;
      b = Math.max(0, Math.min(255, b));
    }

    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  }

  // === Update Display ===
  function updateWB() {
    const kelvin = parseInt(kelvinSlider.value);
    const tint = parseInt(tintSlider.value);
    const rgb = kelvinToRGB(kelvin);

    // Update displays
    if (kelvinDisplay) kelvinDisplay.textContent = kelvin + 'K';
    if (valKelvin) valKelvin.textContent = kelvin;
    if (valTint) valTint.textContent = (tint > 0 ? '+' : '') + tint;

    // Kelvin dot color
    if (kelvinDot) {
      kelvinDot.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    // Overlay color
    if (overlay) {
      overlay.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
    }

    // Tint overlay
    if (tintOverlay) {
      if (tint > 0) {
        // Magenta/Pink
        tintOverlay.style.backgroundColor = `rgba(200, 50, 150, ${Math.abs(tint) / 200})`;
      } else if (tint < 0) {
        // Green
        tintOverlay.style.backgroundColor = `rgba(50, 200, 100, ${Math.abs(tint) / 200})`;
      } else {
        tintOverlay.style.backgroundColor = 'transparent';
      }
    }

    // Spectrum marker position
    if (spectrumMarker) {
      const minK = 1800, maxK = 12000;
      const pct = ((kelvin - minK) / (maxK - minK)) * 100;
      spectrumMarker.style.left = `calc(${pct}% - 1.5px)`;
    }

    // Update active preset button highlight
    document.querySelectorAll('.wb-preset-btn').forEach(btn => {
      const presetK = parseInt(btn.dataset.kelvin);
      const presetT = parseInt(btn.dataset.tint);
      btn.classList.toggle('active', presetK === kelvin && presetT === tint);
    });

    // Update scientific commentary
    updateInfo(kelvin, tint);
  }

  function updateInfo(kelvin, tint) {
    if (!infoContent) return;
    let info = '';
    
    if (kelvin < 2500) {
      info = `<p><strong>${kelvin}K — Vùng cực ấm:</strong> Đây là vùng nhiệt độ của nến, lửa trại và đèn natri cao áp. Bức xạ vật đen ở nhiệt độ này tập trung phần lớn năng lượng trong phổ hồng ngoại, chỉ một phần nhỏ rơi vào vùng khả kiến với ưu thế bước sóng đỏ-cam dài (620-700nm).</p>
      <p style="margin-top:10px;">Trong nhiếp ảnh chân dung, việc đặt WB ở mức thấp như vậy tạo hiệu ứng hoài cổ mạnh mẽ, nhưng sẽ làm mất hoàn toàn thông tin ở kênh xanh dương.</p>`;
    } else if (kelvin < 4000) {
      info = `<p><strong>${kelvin}K — Vùng ấm (Tungsten đến Golden Hour):</strong> Phổ bức xạ bắt đầu mở rộng sang vùng vàng-cam (580-620nm). Đây là vùng nhiệt độ của đèn sợi đốt truyền thống và ánh sáng hoàng hôn.</p>
      <p style="margin-top:10px;">Hầu hết các preset <strong>"Warm"</strong> của Lightroom/Camera Raw rơi vào khoảng 3000-3500K. Đây cũng là vùng mà mắt người cảm thấy thoải mái nhất do quá trình tiến hóa hàng triệu năm bên ánh lửa.</p>`;
    } else if (kelvin < 5500) {
      info = `<p><strong>${kelvin}K — Vùng trung tính ấm:</strong> Phổ phát xạ cân bằng dần giữa các bước sóng. Đèn huỳnh quang và đèn LED chất lượng cao thường nhắm mục tiêu vùng 4000-5000K.</p>
      <p style="margin-top:10px;">⚠️ Đèn huỳnh quang có <strong>phổ phát xạ không liên tục</strong> (line spectrum) do cơ chế kích thích hơi thủy ngân, khác biệt hoàn toàn với phổ liên tục của vật đen. Vì vậy CRI (Chỉ số hoàn màu) của đèn huỳnh quang thường thấp hơn.</p>`;
    } else if (kelvin < 7000) {
      info = `<p><strong>${kelvin}K — Vùng ánh sáng ban ngày:</strong> Điểm chuẩn D55 (5500K) và D65 (6500K) là hai tiêu chuẩn quốc tế CIE cho ánh sáng ban ngày. Flash studio thiết kế để phát ra ánh sáng ở 5500K ± 200K.</p>
      <p style="margin-top:10px;">Ở <strong>6500K</strong>, phổ ánh sáng gần tương đương với bức xạ mặt trời qua lớp khí quyển ở góc thiên đỉnh — đây là lý do D65 được chọn làm illuminant tiêu chuẩn cho hầu hết các hệ thống quản lý màu (sRGB, Adobe RGB).</p>`;
    } else {
      info = `<p><strong>${kelvin}K — Vùng lạnh (Bóng râm đến Trời xanh):</strong> Khi nguồn sáng duy nhất là ánh sáng khuếch tán từ bầu trời xanh (tán xạ Rayleigh ưu tiên bước sóng ngắn 400-500nm), nhiệt độ màu có thể lên tới 10000-12000K.</p>
      <p style="margin-top:10px;">Đặt WB ở vùng này khi chụp dưới ánh sáng ban ngày sẽ tạo hiệu ứng <strong>tông xanh điện ảnh lạnh</strong>, thường thấy trong các bộ phim thriller và khoa học viễn tưởng. Ngược lại, đặt WB thấp (3200K) khi chụp trong bóng râm sẽ nhấn mạnh sắc xanh tự nhiên.</p>`;
    }

    if (Math.abs(tint) > 20) {
      info += `<p style="margin-top:10px;"><strong>Tint ${tint > 0 ? '+' + tint : tint}:</strong> ${tint > 0 ? 'Bù hồng (Magenta) — Thường dùng để triệt tiêu ánh xanh lá từ đèn huỳnh quang hoặc tạo tông da ấm hồng cho chân dung.' : 'Bù xanh lá (Green) — Ít khi dùng trong thực tế trừ khi muốn tạo hiệu ứng đặc biệt hoặc bù cho ánh sáng LED chất lượng thấp thiếu phổ xanh lá.'}</p>`;
    }

    infoContent.innerHTML = info;
  }

  // === Render Presets ===
  function renderPresets() {
    if (!presetsGrid) return;
    presetsGrid.innerHTML = PRESETS.map((p, idx) => `
      <button class="wb-preset-btn ${p.isPro ? 'pro-locked-preset' : ''}" data-idx="${idx}" data-kelvin="${p.kelvin}" data-tint="${p.tint}" title="${p.desc}">
        <div class="wb-preset-icon" style="background: ${p.icon};"></div>
        <div class="wb-preset-info">
          <div class="wb-preset-name">${p.name}</div>
          <div class="wb-preset-kelvin">${p.kelvin}K</div>
        </div>
        ${p.isPro ? '<div class="wb-preset-pro-badge">👑</div>' : ''}
      </button>
    `).join('');

    presetsGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.wb-preset-btn');
      if (!btn) return;
      
      const idx = parseInt(btn.dataset.idx);
      const p = PRESETS[idx];
      if (p && p.isPro) {
        if (typeof lfAuth !== 'undefined') {
          const featureName = p.name.replace(' (PRO)', '');
          const hasAccess = lfAuth.gateFeature(featureName, () => {});
          if (!hasAccess) return; // Block preset selection if not PRO
        }
      }
      
      kelvinSlider.value = btn.dataset.kelvin;
      tintSlider.value = btn.dataset.tint;
      updateWB();
    });
  }

  // === Scene Switcher (👑 VIP PRO Gated for Street and Food) ===
  function switchScene(sceneKey) {
    const isPro = sceneKey === 'street' || sceneKey === 'food';
    
    if (isPro && typeof lfAuth !== 'undefined') {
      const sceneName = SCENES[sceneKey].label;
      const hasAccess = lfAuth.gateFeature(`Bối cảnh ${sceneName}`, () => {
        // Revert: Switch back to previous active scene button
        switchScene(currentScene);
      });
      if (!hasAccess) return;
    }

    currentScene = sceneKey;
    
    // Hide all SVG scenes
    Object.values(SCENES).forEach(s => {
      const el = document.getElementById(s.svgId);
      if (el) el.style.display = 'none';
    });
    
    // Show selected scene
    const selected = SCENES[sceneKey];
    const el = document.getElementById(selected.svgId);
    if (el) el.style.display = 'block';
    if (sceneLabel) sceneLabel.textContent = selected.label;

    // Update active button styling
    if (sceneSwitcher) {
      sceneSwitcher.querySelectorAll('.wb-scene-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.scene === sceneKey);
      });
    }
  }

  if (sceneSwitcher) {
    sceneSwitcher.addEventListener('click', (e) => {
      const btn = e.target.closest('.wb-scene-btn');
      if (!btn) return;
      switchScene(btn.dataset.scene);
    });
  }

  // === Event Listeners ===
  if (kelvinSlider) {
    kelvinSlider.addEventListener('input', updateWB);
    // Double-click to reset to neutral 5500K
    kelvinSlider.addEventListener('dblclick', () => {
      kelvinSlider.value = 5500;
      updateWB();
    });
  }

  if (tintSlider) {
    tintSlider.addEventListener('input', updateWB);
    // Double-click to reset to neutral 0
    tintSlider.addEventListener('dblclick', () => {
      tintSlider.value = 0;
      updateWB();
    });
  }

  // === Init ===
  renderPresets();
  updateWB();
})();
