/* ==========================================================================
   LUMENFORGE — Studio Planner Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Load State from LocalStorage
  let projectState = JSON.parse(localStorage.getItem('lf_studio_planner_state')) || {
    step: 1,
    name: 'LumenForge Session 01',
    mood: 'cinematic',
    location: '',
    camera: 'fullframe',
    lens: '50',
    lights: {
      key: false,
      fill: false,
      rim: false
    }
  };

  // Bind DOM Elements
  const stepItems = document.querySelectorAll('.step-item');
  const stepPanels = document.querySelectorAll('.step-panel');
  const inpName = document.getElementById('inp-project-name');
  const inpMood = document.getElementById('inp-mood');
  const inpLocation = document.getElementById('inp-location');
  const inpCamera = document.getElementById('inp-camera');
  const inpLens = document.getElementById('inp-lens');
  const shotSheetRender = document.getElementById('shot-sheet-render');

  // Sync initial DOM with State
  inpName.value = projectState.name;
  inpMood.value = projectState.mood;
  inpLocation.value = projectState.location;
  inpCamera.value = projectState.camera;
  inpLens.value = projectState.lens;
  
  if (projectState.lights.key) {
    document.getElementById('btn-toggle-key').classList.add('active');
    document.getElementById('light-key').classList.add('visible');
  }
  if (projectState.lights.fill) {
    document.getElementById('btn-toggle-fill').classList.add('active');
    document.getElementById('light-fill').classList.add('visible');
  }
  if (projectState.lights.rim) {
    document.getElementById('btn-toggle-rim').classList.add('active');
    document.getElementById('light-rim').classList.add('visible');
  }

  // Go to step saved
  window.goToStep = function(stepNum) {
    saveStateFromInputs();
    projectState.step = stepNum;
    localStorage.setItem('lf_studio_planner_state', JSON.stringify(projectState));

    // Update UI Sidebar
    stepItems.forEach(item => {
      const s = parseInt(item.getAttribute('data-step'));
      item.classList.remove('active', 'completed');
      if (s === stepNum) {
        item.classList.add('active');
      } else if (s < stepNum) {
        item.classList.add('completed');
      }
    });

    // Update UI Panels
    stepPanels.forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(`panel-${stepNum}`).classList.add('active');
  };

  // Toggle Lights
  window.toggleLight = function(lightType) {
    const btn = document.getElementById(`btn-toggle-${lightType}`);
    const entity = document.getElementById(`light-${lightType}`);
    
    projectState.lights[lightType] = !projectState.lights[lightType];
    
    if (projectState.lights[lightType]) {
      btn.classList.add('active');
      entity.classList.add('visible');
    } else {
      btn.classList.remove('active');
      entity.classList.remove('visible');
    }
    localStorage.setItem('lf_studio_planner_state', JSON.stringify(projectState));
  };

  function saveStateFromInputs() {
    projectState.name = inpName.value || 'Untitled Project';
    projectState.mood = inpMood.value;
    projectState.location = inpLocation.value || 'Studio Standard';
    projectState.camera = inpCamera.value;
    projectState.lens = inpLens.value;
    localStorage.setItem('lf_studio_planner_state', JSON.stringify(projectState));
  }

  window.generateShotSheet = function() {
    saveStateFromInputs();

    // Map logic
    const moodMap = {
      'cinematic': 'Cinematic (Tương phản cao, Teal & Orange)',
      'moody': 'Moody & Low-key (Tối tăm, Bí ẩn, Bóng đổ sắc nét)',
      'highkey': 'High-Key Beauty (Sáng sủa, Mềm mại, Pastel)',
      'film': 'Vintage Film (Hoài cổ, Hạt grain, Contrast thấp)'
    };

    const cameraMap = {
      'fullframe': 'Full-Frame 35mm (Hệ số crop: 1.0x)',
      'apsc': 'APS-C Crop (Hệ số crop: ~1.5x)',
      'm43': 'Micro Four Thirds (Hệ số crop: 2.0x)',
      'medium': 'Medium Format (Hệ số crop: ~0.79x)'
    };

    const lensMap = {
      '24': '24mm (Góc siêu rộng - Distortion mạnh)',
      '35': '35mm (Đời thường - Góc nhìn môi trường)',
      '50': '50mm (Tiêu chuẩn - Mắt người)',
      '85': '85mm (Tele ngắn - Chân dung tiêu chuẩn)',
      '135': '135mm (Tele - Xóa phông mạnh, Nén không gian)'
    };

    let activeLights = [];
    if (projectState.lights.key) activeLights.push('Key Light (Chính)');
    if (projectState.lights.fill) activeLights.push('Fill Light (Bù tối)');
    if (projectState.lights.rim) activeLights.push('Rim Light (Đánh ven)');
    if (activeLights.length === 0) activeLights.push('Natural Light (Ánh sáng tự nhiên)');

    const dateStr = new Date().toLocaleDateString('vi-VN');

    shotSheetRender.innerHTML = `
      <div class="shot-sheet-header">
        <div>
          <h1 class="shot-sheet-title">${projectState.name}</h1>
          <div style="font-family: var(--font-body); color: #444; margin-top: 8px;">Địa điểm: ${projectState.location}</div>
        </div>
        <div class="shot-sheet-meta">
          <div>LumenForge Studio Planner</div>
          <div>Ngày xuất: ${dateStr}</div>
        </div>
      </div>

      <div class="sheet-grid">
        <div class="sheet-section">
          <h4>CONCEPT & MOOD</h4>
          <ul class="sheet-list">
            <li><span class="label">Style Thẩm Mỹ</span> <span class="val">${moodMap[projectState.mood]}</span></li>
            <li><span class="label">Color Palette</span> <span class="val">${projectState.mood === 'cinematic' ? 'Teal & Orange' : projectState.mood === 'film' ? 'Muted / Warm' : 'Standard'}</span></li>
          </ul>
        </div>

        <div class="sheet-section">
          <h4>THIẾT BỊ (GEAR)</h4>
          <ul class="sheet-list">
            <li><span class="label">Hệ Sensor</span> <span class="val">${cameraMap[projectState.camera]}</span></li>
            <li><span class="label">Tiêu cự Lens</span> <span class="val">${lensMap[projectState.lens]}</span></li>
          </ul>
        </div>

        <div class="sheet-section" style="grid-column: 1 / -1;">
          <h4>ÁNH SÁNG (LIGHTING BLUEPRINT)</h4>
          <ul class="sheet-list">
            <li><span class="label">Các nguồn sáng sử dụng</span> <span class="val">${activeLights.join(' • ')}</span></li>
          </ul>
          
          <div style="margin-top: 20px; padding: 20px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px;">
            <p style="margin:0; font-family: var(--font-body); font-size: 0.95rem; color: #333;">
              <strong>Ghi chú Setup Đèn:</strong> 
              ${projectState.lights.key ? 'Key Light đặt nghiêng 45 độ. ' : ''}
              ${projectState.lights.fill ? 'Fill Light đặt đối diện Key. ' : ''}
              ${projectState.lights.rim ? 'Rim Light đánh từ phía sau chủ thể.' : ''}
              ${!projectState.lights.key && !projectState.lights.fill && !projectState.lights.rim ? 'Sử dụng hoàn toàn ánh sáng tự nhiên, tận dụng hắt sáng nếu cần.' : ''}
            </p>
          </div>
        </div>
        
        <div class="sheet-section" style="grid-column: 1 / -1;">
          <h4>THÔNG SỐ CAMERA DỰ KIẾN</h4>
          <ul class="sheet-list">
            <li><span class="label">Chế độ chụp</span> <span class="val">M (Manual) hoặc A (Aperture Priority)</span></li>
            <li><span class="label">Đo sáng (Metering)</span> <span class="val">${projectState.mood === 'moody' ? 'Spot Metering (Đo sáng điểm)' : 'Matrix/Evaluative'}</span></li>
            <li><span class="label">White Balance</span> <span class="val">${projectState.mood === 'cinematic' ? 'Tùy chỉnh (vd: 3500K)' : 'Auto / Daylight'}</span></li>
          </ul>
        </div>
      </div>
    `;

    goToStep(4);
  };

  // Initial jump
  goToStep(projectState.step);

});
