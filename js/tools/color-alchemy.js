/* ==========================================================================
   LUMENFORGE — Color Alchemy Studio Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const tempSlider = document.getElementById('temp-slider');
  const tempVal = document.getElementById('temp-val');
  const tintSlider = document.getElementById('tint-slider');
  const tintVal = document.getElementById('tint-val');
  const castOverlay = document.getElementById('color-cast-overlay');
  
  const hudTemp = document.getElementById('hud-temp');
  const hudTint = document.getElementById('hud-tint');
  const hudWbType = document.getElementById('hud-wb-type');
  
  const colorOutput = document.getElementById('color-output');
  const presetCards = document.querySelectorAll('#wb-presets .radio-card');

  // WB Preset configurations
  const presets = {
    'custom': { temp: null, tint: null, name: 'Tự chỉnh' },
    'tungsten': { temp: 3200, tint: -2, name: 'Đèn Dây tóc' },
    'daylight': { temp: 5200, tint: 4, name: 'Ánh sáng Ban ngày' },
    'cloudy': { temp: 6000, tint: 8, name: 'Trời nhiều mây' },
    'shade': { temp: 8000, tint: 14, name: 'Bóng râm sâu' }
  };

  function updateColorStudio() {
    const temp = parseInt(tempSlider.value);
    const tint = parseInt(tintSlider.value);

    // Update slider label indicators
    tempVal.textContent = `${temp} K`;
    tintVal.textContent = tint > 0 ? `+${tint}` : tint;

    // Update HUD overlay
    hudTemp.textContent = `${temp} K`;
    hudTint.textContent = tint > 0 ? `+${tint}` : tint;

    // 1. Calculate combined color cast RGB
    // Midpoint is Temp=5500, Tint=0 (Neutral overlay)
    let r = 128;
    let g = 128;
    let b = 128;

    // Temp impact (Lightroom style: lower = cooler blue, higher = warmer amber)
    if (temp > 5500) {
      const shift = (temp - 5500) / 4500; // 0 to 1
      r += Math.round(shift * 100);
      b -= Math.round(shift * 70);
      g += Math.round(shift * 20); // slightly warm yellow-orange
    } else if (temp < 5500) {
      const shift = (5500 - temp) / 3500; // 0 to 1
      b += Math.round(shift * 110);
      r -= Math.round(shift * 70);
      g -= Math.round(shift * 30);
    }

    // Tint impact (negative = green, positive = magenta)
    if (tint > 0) {
      const shift = tint / 50; // 0 to 1
      r += Math.round(shift * 40);
      b += Math.round(shift * 50);
      g -= Math.round(shift * 70); // subtract green to make magenta
    } else if (tint < 0) {
      const shift = Math.abs(tint) / 50; // 0 to 1
      g += Math.round(shift * 80);
      r -= Math.round(shift * 40);
      b -= Math.round(shift * 40);
    }

    // Clamping RGB values to 0-255
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // Calculate dynamic opacity based on intensity of deviation from neutral
    const tempDeviation = Math.abs(temp - 5500) / 4500;
    const tintDeviation = Math.abs(tint) / 50;
    const opacity = Math.min(0.75, (tempDeviation * 0.45) + (tintDeviation * 0.45) + 0.05);

    // Apply background-color and opacity to overlay
    castOverlay.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    castOverlay.style.opacity = opacity.toFixed(2);

    // Render Educational Content
    renderColorAnalysis(temp, tint);
  }

  function renderColorAnalysis(temp, tint) {
    let wbVibe = '';
    let wbDesc = '';
    let tempClass = 'var(--text-dim)';
    
    // 1. Temperature Analysis
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

    // 2. Skintone Warnings based on Tint
    let skintoneWarning = '';
    if (tint < -15) {
      skintoneWarning = `
        <div class="warning-item warning-high" style="border-left-color: var(--accent-cyan); background: rgba(0, 212, 170, 0.08); color: var(--text-primary); padding: 10px 16px; border-radius: 4px; font-size: 0.85rem; margin-top:16px;">
          ⚠️ <strong>CẢNH BÁO SKIN TONE: Ám xanh lá cây quá mức!</strong><br>
          Sắc xanh lá quá đậm khiến màu da người trông tái nhợt, thiếu sức sống (giống như người bệnh). Khuyên tăng Tint về phía số dương (Magenta) để bù lại màu hồng hào tự nhiên cho làn da.
        </div>
      `;
    } else if (tint > 20) {
      skintoneWarning = `
        <div class="warning-item warning-high" style="border-left-color: var(--accent-film); background: rgba(232, 114, 92, 0.08); color: var(--text-primary); padding: 10px 16px; border-radius: 4px; font-size: 0.85rem; margin-top:16px;">
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
          <ul style="margin-top: 8px;">
            <li>${temp < 3500 ? '💡 Đèn sợi đốt hoặc ánh nến trong nhà tối.' : temp < 5000 ? '💡 Đèn huỳnh quang văn phòng.' : temp < 6000 ? '☀️ Ánh sáng mặt trời ban ngày đủ sáng.' : temp < 7500 ? '☁️ Nắng xiên hoặc bóng râm mây che nhẹ.' : '🌳 Bóng râm sâu dưới tán cây lớn.'}</li>
            <li><strong>Sắc độ Tint (${tint}):</strong> ${tint === 0 ? 'Trung tính hoàn mỹ.' : tint > 0 ? `Đang bù trừ thêm ${tint} sắc tím để trung hòa ánh sáng thiên xanh lá.` : `Đang thêm ${Math.abs(tint)} sắc xanh để trung hòa đèn bị ám sắc đỏ tím.`}</li>
          </ul>
        </div>

      </div>

      ${skintoneWarning}
    `;

    colorOutput.innerHTML = outputHTML;
  }

  // Setup preset cards logic
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
      
      if (presetKey !== 'custom') {
        hudWbType.textContent = config.name;
        // Lock/Set sliders
        tempSlider.value = config.temp;
        tintSlider.value = config.tint;
        updateColorStudio();
      } else {
        hudWbType.textContent = 'Thủ công';
      }
    });
  });

  // Sliders input events (switches preset back to Custom if manually adjusted)
  function handleManualSliderInput() {
    // Check custom preset card
    presetCards.forEach(c => c.classList.remove('selected'));
    const customCard = document.querySelector('#wb-presets .radio-card:first-child');
    customCard.classList.add('selected');
    customCard.querySelector('input').checked = true;
    hudWbType.textContent = 'Thủ công';

    updateColorStudio();
  }

  tempSlider.addEventListener('input', handleManualSliderInput);
  tintSlider.addEventListener('input', handleManualSliderInput);

  // Initial Run
  updateColorStudio();
});
