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
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1617005082633-e07e337de5cc?q=80&w=600&auto=format&fit=crop',
    link: '#'
  },
  {
    id: 'g-003',
    tier: 'indie',
    category: 'light',
    title: 'Godox SL60IID',
    type: 'LED Video Light',
    specs: ['70W Output', '5600K Daylight', 'Ngàm Bowens', 'App Control'],
    desc: 'Đèn Key-light quốc dân cho Youtuber và Indie Filmmaker. Bóng LED COB nâng cấp cho độ sáng cực mạnh, màu sắc trung thực với giá siêu rẻ.',
    price: '~2.500.000đ',
    image: 'https://images.unsplash.com/photo-1582214402652-1698e3ec8791?q=80&w=600&auto=format&fit=crop',
    link: 'https://s.shopee.vn/7Ab6jgoH1H'
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
    image: 'https://images.unsplash.com/photo-1502920514313-52581002a659?q=80&w=600&auto=format&fit=crop',
    link: 'https://s.shopee.vn/qh3BVYuxU'
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
    image: 'https://images.unsplash.com/photo-1589806312595-46c050fb9e0e?q=80&w=600&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1519638831568-d9897f54ed69?q=80&w=600&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?q=80&w=600&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1527011045970-16acfb8f78f8?q=80&w=600&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1580227318047-9759d57a9e62?q=80&w=600&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1620327663249-14a5b4c107be?q=80&w=600&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1555543411-825585b9b870?q=80&w=600&auto=format&fit=crop',
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
            <div class="gear-header" style="background-image: url('${gear.image}');">
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

  // ==========================================
  // MATCHMAKER QUIZ LOGIC
  // ==========================================
  const matchmakerBtn = document.getElementById('matchmaker-btn');
  const matchmakerModal = document.getElementById('matchmaker-modal');
  const matchmakerClose = document.getElementById('matchmaker-close');
  
  const qContainer = document.getElementById('quiz-container');
  const qResult = document.getElementById('quiz-result');
  const qQuestion = document.getElementById('quiz-question');
  const qOptions = document.getElementById('quiz-options');
  const qProgress = document.getElementById('quiz-progress');
  const btnRestart = document.getElementById('btn-restart-quiz');

  const resultTitle = document.getElementById('result-combo-name');
  const resultDesc = document.getElementById('result-combo-desc');
  const resultItems = document.getElementById('result-items-list');
  const resultLink = document.getElementById('result-affiliate-link');

  let currentStep = 0;
  let userAnswers = {}; // { budget, style, genre }

  const QUIZ_STEPS = [
    {
      id: 'budget',
      question: 'Ngân sách đầu tư thiết bị của bạn khoảng bao nhiêu?',
      options: [
        { label: 'Dưới 20 triệu (Khởi đầu)', value: 'low' },
        { label: '20 - 50 triệu (Nghiêm túc)', value: 'mid' },
        { label: 'Không quan trọng tiền bạc', value: 'high' }
      ]
    },
    {
      id: 'genre',
      question: 'Bạn chủ yếu chụp / quay thể loại gì?',
      options: [
        { label: 'Chụp Chân dung / Phong cảnh', value: 'photo' },
        { label: 'Quay Phim / Commercial Video', value: 'video' },
        { label: 'Nhiếp ảnh Đường phố (Street)', value: 'street' }
      ]
    },
    {
      id: 'style',
      question: 'Gu thiết kế máy ảnh mà bạn thích nhất?',
      options: [
        { label: 'Gọn nhẹ, Hiện đại (Tiện lợi)', value: 'modern' },
        { label: 'Hầm hố, Cầm đầm tay (Pro)', value: 'pro' },
        { label: 'Hoài cổ, Vintage (Nghệ thuật)', value: 'vintage' }
      ]
    }
  ];

  function startQuiz() {
    currentStep = 0;
    userAnswers = {};
    qContainer.style.display = 'flex';
    qResult.style.display = 'none';
    renderStep();
    matchmakerModal.classList.add('active');
  }

  function renderStep() {
    if (currentStep >= QUIZ_STEPS.length) {
      showResult();
      return;
    }

    // Fade out
    qContainer.style.opacity = '0';
    
    setTimeout(() => {
      const step = QUIZ_STEPS[currentStep];
      qProgress.style.width = \`\${((currentStep) / QUIZ_STEPS.length) * 100}%\`;
      qQuestion.textContent = step.question;
      
      qOptions.innerHTML = step.options.map((opt, idx) => \`
        <button class="quiz-btn" data-val="\${opt.value}" style="
          background: rgba(255,255,255,0.05); 
          border: 1px solid var(--border-color); 
          padding: 15px 20px; 
          border-radius: 8px; 
          color: #fff; 
          font-size: 1.1rem; 
          cursor: pointer; 
          transition: all 0.2s;
          text-align: left;
        " onmouseover="this.style.borderColor='var(--accent-cyan)'; this.style.background='rgba(0, 212, 255, 0.1)';" onmouseout="this.style.borderColor='var(--border-color)'; this.style.background='rgba(255,255,255,0.05)';">
          \${opt.label}
        </button>
      \`).join('');

      const btns = qOptions.querySelectorAll('.quiz-btn');
      btns.forEach(b => {
        b.addEventListener('click', (e) => {
          userAnswers[step.id] = e.target.getAttribute('data-val');
          currentStep++;
          renderStep();
        });
      });

      // Fade in
      qContainer.style.transition = 'opacity 0.3s ease';
      qContainer.style.opacity = '1';
    }, 300); // Wait for fade out
  }

  function showResult() {
    qContainer.style.opacity = '0';
    
    setTimeout(() => {
      qProgress.style.width = '100%';
      qContainer.style.display = 'none';
      
      qResult.style.opacity = '0';
      qResult.style.display = 'flex';
      qResult.style.transition = 'opacity 0.5s ease';

      // Simple Decision Tree Logic
    let comboName = "";
    let comboDesc = "";
    let items = [];
    let affLink = "https://s.shopee.vn/7Ab6jgoH1H"; // Default
    let accentColor = "var(--accent-amber)";

    // 1. Street + Vintage
    if (userAnswers.genre === 'street' || userAnswers.style === 'vintage') {
      comboName = "Fujifilm X-T30 II + XF 27mm f/2.8";
      comboDesc = "Combo hoàn hảo cho nhiếp ảnh đường phố. Giả lập màu Film trứ danh của Fujifilm giúp bạn có ảnh đẹp ngay lập tức mà không cần hậu kỳ.";
      items = ["Thân máy Fujifilm X-T30 II (Bạc)", "Ống kính Pancake XF 27mm f/2.8 WR", "Thẻ nhớ SanDisk Extreme Pro 64GB"];
      affLink = "https://s.shopee.vn/8pjKj2iYzJ"; // Dummy link
    } 
    // 2. Video + High/Mid Budget
    else if (userAnswers.genre === 'video' && (userAnswers.budget === 'mid' || userAnswers.budget === 'high')) {
      comboName = "Sony FX30 + Sigma 18-50mm f/2.8";
      comboDesc = "Lựa chọn số 1 cho các nhà làm phim tự do. Sony FX30 cung cấp chất lượng 10-bit 4:2:2 chuẩn điện ảnh trong một thân máy nhỏ gọn có quạt tản nhiệt.";
      items = ["Máy quay phim Sony FX30 Cinema Line", "Ống kính Sigma 18-50mm f/2.8 DC DN", "Đèn Godox SL60IID (Key Light)"];
      affLink = "https://s.shopee.vn/123456789"; 
      accentColor = "var(--accent-pink)";
    }
    // 3. Photo + Mid Budget
    else if (userAnswers.genre === 'photo' && userAnswers.budget === 'mid') {
      comboName = "Sony A7C + Tamron 28-200mm";
      comboDesc = "Cỗ máy Full-frame siêu gọn nhẹ. Phù hợp cho chụp chân dung, phong cảnh và du lịch nhờ hệ thống Autofocus bá đạo của Sony.";
      items = ["Máy ảnh Sony A7C Full-frame", "Ống kính Đa dụng Tamron 28-200mm f/2.8-5.6", "Tủ chống ẩm Andbon 30L"];
    }
    // 4. Default: Low budget or generic
    else {
      comboName = "Canon EOS R50 + RF-S 18-45mm + 50mm f/1.8";
      comboDesc = "Combo quốc dân vô địch tầm giá rẻ. Chụp chân dung xóa phông mù mịt với ống kính 50mm f/1.8, hệ thống lấy nét siêu nhanh.";
      items = ["Máy ảnh Canon EOS R50", "Ống kính chân dung RF 50mm f/1.8 STM", "Đèn Flash Godox TT685 II"];
      affLink = "https://s.shopee.vn/qh3BVYuxU";
      accentColor = "var(--accent-cyan)";
    }

    resultTitle.textContent = comboName;
    resultDesc.textContent = comboDesc;
    resultTitle.style.color = accentColor;
    
    resultItems.innerHTML = items.map(i => \`<li>\${i}</li>\`).join('');
    resultLink.href = affLink;

    // Fade in result
    setTimeout(() => {
      qResult.style.opacity = '1';
    }, 50);
  }

  if(matchmakerBtn && matchmakerModal) {
    matchmakerBtn.addEventListener('click', startQuiz);
    matchmakerClose.addEventListener('click', () => {
      matchmakerModal.classList.remove('active');
    });
    btnRestart.addEventListener('click', startQuiz);
  }
});
