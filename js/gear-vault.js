/* ==========================================================================
   LUMENFORGE — Gear Vault Database & Logic
   ========================================================================== */

const GEAR_DB = [
  // --- TIER: INDIE ($1000) ---
  {
    id: 'g-001',
    tier: 'indie',
    category: 'camera',
    title: 'Sony A6700',
    type: 'Hybrid Camera (APS-C)',
    specs: ['26MP BSI CMOS', '4K 120p', '10-bit 4:2:2', 'AI AutoFocus'],
    desc: 'Kẻ hủy diệt phân khúc APS-C. Auto-focus AI tốt nhất thế giới, quay 4K siêu nét, chống rung IBIS. Tuyệt hảo cho người chạy sự kiện một mình.',
    price: '~35.500.000đ',
    icon: '📷',
    link: '#'
  },
  {
    id: 'g-002',
    tier: 'indie',
    category: 'lens',
    title: 'Sigma 30mm f/1.4 DC DN',
    type: 'Prime Lens',
    specs: ['Ngàm E/X/EF-M', 'Khẩu f/1.4', 'Nặng 265g', 'Độ nét cao'],
    desc: 'Ống kính "phải có" cho cảm biến Crop. Tiêu cự tương đương 45mm trên Full-frame, hoàn hảo cho chân dung lẫn đường phố. Độ nét tuyệt đối ở f/1.4.',
    price: '~7.500.000đ',
    icon: '🔍',
    link: '#'
  },
  {
    id: 'g-003',
    tier: 'indie',
    category: 'light',
    title: 'Amaran 60x Bi-Color',
    type: 'LED Video Light',
    specs: ['65W Output', '2700K - 6500K', 'Pin V-Mount', 'App Sidus Link'],
    desc: 'Đèn Key-light quốc dân cho Youtuber và Indie Filmmaker. Đủ mạnh cho không gian phòng ngủ, hỗ trợ pin siêu di động.',
    price: '~5.000.000đ',
    icon: '💡',
    link: '#'
  },
  {
    id: 'g-004',
    tier: 'indie',
    category: 'camera',
    title: 'Canon EOS R50',
    type: 'Entry-level Camera (APS-C)',
    specs: ['24.2MP APS-C', '4K 30p Uncropped', 'Dual Pixel AF II', 'Gọn nhẹ'],
    desc: 'Ông vua của phân khúc nhập môn. Chụp đẹp ngay từ file JPEG nhờ Color Science trứ danh của Canon, hệ thống lấy nét Dual Pixel cực kỳ bám người.',
    price: '~17.500.000đ',
    icon: '📷',
    link: '#'
  },

  // --- TIER: PRO ($4000) ---
  {
    id: 'g-005',
    tier: 'pro',
    category: 'camera',
    title: 'Sony FX3 / A7S III',
    type: 'Cinema Camera (Full-frame)',
    specs: ['12MP Full-Frame', '4K 120p 10-bit', 'Base ISO 12800', 'Active Cooling'],
    desc: 'Quái vật thiếu sáng. Cảm biến 12MP thu ánh sáng đỉnh cao, quạt tản nhiệt quay không bao giờ quá nhiệt. Tiêu chuẩn của MV thương mại.',
    price: '~98.000.000đ',
    icon: '🎥',
    link: '#'
  },
  {
    id: 'g-006',
    tier: 'pro',
    category: 'camera',
    title: 'Canon EOS R5',
    type: 'Hybrid Pro (Full-frame)',
    specs: ['45MP Sensor', '8K RAW Video', 'IBIS 8-Stop', 'CFexpress Type B'],
    desc: 'Cỗ máy lai hoàn hảo nhất cho cả quay và chụp thương mại. Khả năng in ấn khổ lớn nhờ cảm biến 45MP và khả năng quay RAW 8K vô tiền khoáng hậu.',
    price: '~85.000.000đ',
    icon: '📸',
    link: '#'
  },
  {
    id: 'g-007',
    tier: 'pro',
    category: 'lens',
    title: 'Sony 24-70mm f/2.8 GM II',
    type: 'Zoom Lens',
    specs: ['Thấu kính XA', 'Nhẹ hơn 20%', 'Khẩu f/2.8', 'Focus nhanh'],
    desc: 'Ống kính đa dụng tối thượng. Nhẹ hơn phiên bản trước 20%, lấy nét cực nhanh, đủ cân mọi job từ Wedding đến Commercial.',
    price: '~58.000.000đ',
    icon: '🔭',
    link: '#'
  },
  {
    id: 'g-008',
    tier: 'pro',
    category: 'light',
    title: 'Aputure 300D Mark II',
    type: 'COB LED Light',
    specs: ['350W Output', 'Ngàm Bowens', 'CRI 96+', 'V-Mount Battery'],
    desc: 'Nguồn sáng chính tiêu chuẩn công nghiệp. Đủ mạnh để hắt qua rèm cửa giả lập ánh sáng mặt trời tự nhiên vào ban ngày.',
    price: '~24.000.000đ',
    icon: '☀️',
    link: '#'
  },

  // --- TIER: DREAM (No Limit) ---
  {
    id: 'g-009',
    tier: 'dream',
    category: 'camera',
    title: 'ARRI Alexa 35',
    type: 'Cinema Camera (Super 35)',
    specs: ['Sensor 4.6K', '17 Stop DR', 'REVEAL Color', 'Nặng 2.9kg'],
    desc: 'Huyền thoại Hollywood. 17-stop Dynamic Range, tái tạo màu da (Skin tone) không một máy ảnh nào trên thế giới có thể sánh kịp.',
    price: '~1.900.000.000đ',
    icon: '🎬',
    link: '#'
  },
  {
    id: 'g-010',
    tier: 'dream',
    category: 'lens',
    title: 'Cooke Panchro/i Classic FF',
    type: 'Cine Prime Set',
    specs: ['Phủ quang học vintage', 'Lấy nét cơ học', 'Full-Frame', 'i/ Technology'],
    desc: '"Cooke Look" trứ danh. Cho ra hình ảnh ấm áp, organic và vùng chuyển nét (Roll-off) mượt mà như bơ. Lựa chọn số 1 của các D.P.',
    price: '~1.400.000.000đ (Bộ 5 lens)',
    icon: '🔬',
    link: '#'
  },
  {
    id: 'g-011',
    tier: 'dream',
    category: 'light',
    title: 'ARRI SkyPanel S60-C',
    type: 'LED Soft Light',
    specs: ['RGBW Full Color', '2800K - 10000K', 'CRI 95+', 'DMX Control'],
    desc: 'Bảng đèn Soft-light bá chủ mọi phim trường. Chỉnh mọi không gian màu, giả lập gel màu chính xác đến từng bước sóng.',
    price: '~165.000.000đ',
    icon: '⚡',
    link: '#'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const gearGrid = document.getElementById('gear-grid');
  const tierTabs = document.querySelectorAll('.tier-tab');
  const categoryFilters = document.querySelectorAll('.cat-filter');
  
  let currentTier = 'indie';
  let currentCategory = 'all';

  function renderGear() {
    if (!gearGrid) return;
    
    // Filter
    const filtered = GEAR_DB.filter(gear => {
      const matchTier = gear.tier === currentTier;
      const matchCat = currentCategory === 'all' || gear.category === currentCategory;
      return matchTier && matchCat;
    });

    if (filtered.length === 0) {
      gearGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 40px;">Chưa có thiết bị nào trong danh mục này.</div>`;
      return;
    }

    gearGrid.innerHTML = filtered.map((gear, index) => {
      // Create specs HTML
      const specsHtml = gear.specs.map(spec => `<span class="gear-spec">${spec}</span>`).join('');
      
      // Determine accent color based on tier
      let accent = 'var(--accent-cyan)';
      if(gear.tier === 'pro') accent = 'var(--accent-amber)';
      if(gear.tier === 'dream') accent = 'var(--accent-pink)';

      return `
        <div class="gear-card animate-on-scroll" style="animation-delay: ${index * 0.1}s; --tier-accent: ${accent};">
          <div class="gear-card-inner">
            <div class="gear-header">
              <div class="gear-icon">${gear.icon}</div>
              <div class="gear-type-badge">${gear.type}</div>
            </div>
            
            <div class="gear-content">
              <h3 class="gear-title">${gear.title}</h3>
              <div class="gear-specs-container">
                ${specsHtml}
              </div>
              <p class="gear-desc">${gear.desc}</p>
            </div>
            
            <div class="gear-footer">
              <div class="gear-price">${gear.price}</div>
              <a href="${gear.link}" class="gear-action-btn">Khám phá →</a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Handle Tier switching
  tierTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tierTabs.forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentTier = e.currentTarget.getAttribute('data-tier');
      renderGear();
    });
  });

  // Handle Category filtering
  categoryFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
      categoryFilters.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentCategory = e.currentTarget.getAttribute('data-cat');
      renderGear();
    });
  });

  // Initial render
  renderGear();

  // Matchmaker functionality
  const matchmakerBtn = document.getElementById('matchmaker-btn');
  const matchmakerModal = document.getElementById('matchmaker-modal');
  const matchmakerClose = document.getElementById('matchmaker-close');
  
  if(matchmakerBtn && matchmakerModal) {
    matchmakerBtn.addEventListener('click', () => {
      matchmakerModal.classList.add('active');
    });
    matchmakerClose.addEventListener('click', () => {
      matchmakerModal.classList.remove('active');
    });
  }
});
