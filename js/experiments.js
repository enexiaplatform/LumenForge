/* ==========================================================================
   LUMENFORGE — Visual Experiments Engine Logic
   ========================================================================== */

const experimentData = {
  'exp-001': {
    title: 'EXP 001: Sensor Vật Lý vs AI Điện Toán (Canon R50 vs iPhone)',
    desc: 'Mổ xẻ ranh giới giữa chiều sâu quang học thực thụ của máy ảnh ống kính rời và mô phỏng mờ nền nhân tạo bằng phần mềm AI trên điện thoại cao cấp.',
    beforeLabel: 'BÊN TRÁI: QUANG HỌC CANON R50 (f/1.8)',
    afterLabel: 'BÊN PHẢI: AI CHÂN DUNG IPHONE PRO MAX',
    beforeHTML: `
      <div class="sim-sky-sunset"></div>
      <div class="sim-canon-bokeh">
        <div class="bubble"></div><div class="bubble"></div>
        <div class="bubble"></div><div class="bubble"></div>
      </div>
      <svg class="sim-person-silhouette" viewBox="0 0 160 240">
        <circle cx="80" cy="45" r="25" fill="#0E0D14"/>
        <path d="M80 70 C80 70, 40 100, 45 240 L115 240 C120 100, 80 70, 80 70 Z" fill="#0E0D14"/>
      </svg>
    `,
    afterHTML: `
      <div class="sim-phone-blur"></div>
      <div class="sim-phone-halo"></div>
      <svg class="sim-person-silhouette" viewBox="0 0 160 240">
        <circle cx="80" cy="45" r="25" fill="#0A0B0E"/>
        <path d="M80 70 C80 70, 40 100, 45 240 L115 240 C120 100, 80 70, 80 70 Z" fill="#0A0B0E"/>
      </svg>
    `,
    technicalLog: [
      'Cảm biến APS-C của Canon R50 thu nhận ánh sáng trực tiếp, tạo ra DoF mỏng quang học tự nhiên.',
      'Sự chuyển tiếp giữa khoảng nét (mặt chủ thể) và khoảng mờ (bokeh nền) diễn ra tuyến tính êm ái.',
      'iPhone sử dụng bản đồ chiều sâu AI (Depth Map) để bôi nhòe bằng phần mềm, gây ra lỗi lem nhem viền tóc (fringe artifacts) ở vùng ranh giới giao thoa.',
      'Thuật toán HDR trên điện thoại kéo sáng vùng tối cưỡng bức khiến ảnh bị phẳng khối dẹt, mất độ nổi 3D đặc trưng của vật lý.'
    ],
    emotionalLog: [
      'Góc chụp Canon mang lại cảm xúc chân thực, cô đọng nhờ chủ thể được bao bọc bởi lớp ánh sáng viền tóc (rim light) mềm mịn quang học.',
      'Ảnh iPhone tạo cảm giác nhân tạo, sắc nét gai góc quá mức (oversharpened), thiếu đi hơi thở lãng mạn nhẹ nhàng của nhiếp ảnh nghệ thuật.'
    ]
  },
  'exp-002': {
    title: 'EXP 002: Sự Nén Tiêu Cự (35mm vs 85mm)',
    desc: 'Thử nghiệm chứng minh cách tiêu cự dài ép chặt không gian hậu cảnh sát gần lại chủ thể, tạo ra độ nén điện ảnh vượt trội.',
    beforeLabel: 'BÊN TRÁI: TIÊU CỰ GÓC RỘNG 35mm',
    afterLabel: 'BÊN PHẢI: PHỐI CẢNH NÉN TELE 85mm',
    beforeHTML: `
      <div class="sim-sky-sunset" style="background: linear-gradient(180deg, #101F30 0%, #3F72AF 100%);"></div>
      <!-- Far away small mountain -->
      <svg class="sim-bg-mountains" viewBox="0 0 800 450" preserveAspectRatio="none" style="height: 100px; bottom: 0;">
        <path d="M -100 450 L -100 380 Q 200 340 400 390 Q 600 300 900 370 L 900 450 Z" fill="#112D4E"/>
      </svg>
      <!-- Standard sized person -->
      <svg class="sim-person-silhouette" viewBox="0 0 160 240" style="width: 100px; height: 160px; bottom: 0;">
        <circle cx="80" cy="45" r="25" fill="#03071E"/>
        <path d="M80 70 C80 70, 40 100, 45 240 L115 240 C120 100, 80 70, 80 70 Z" fill="#03071E"/>
      </svg>
    `,
    afterHTML: `
      <div class="sim-sky-sunset" style="background: linear-gradient(180deg, #101F30 0%, #3F72AF 100%);"></div>
      <!-- Huge compressed mountain looming close -->
      <svg class="sim-bg-mountains" viewBox="0 0 800 450" preserveAspectRatio="none" style="height: 280px; bottom: 0;">
        <path d="M -100 450 L -100 200 Q 200 130 400 210 Q 600 80 900 180 L 900 450 Z" fill="#112D4E"/>
      </svg>
      <!-- Person kept at same framing size -->
      <svg class="sim-person-silhouette" viewBox="0 0 160 240" style="width: 100px; height: 160px; bottom: 0;">
        <circle cx="80" cy="45" r="25" fill="#03071E"/>
        <path d="M80 70 C80 70, 40 100, 45 240 L115 240 C120 100, 80 70, 80 70 Z" fill="#03071E"/>
      </svg>
    `,
    technicalLog: [
      'Ở tiêu cự 35mm, góc nhìn rộng khiến các vật thể ở xa trông bé lại và trôi xa hơn thực tế.',
      'Ở tiêu cự 85mm, góc đón sáng hẹp buộc người chụp phải lùi xa ra để giữ cùng kích thước chủ thể. Khoảng cách máy ảnh đến mẫu xa làm thu hẹp tỷ lệ khoảng cách mẫu-hậu cảnh.',
      'Hiệu ứng nén phối cảnh (Perspective Compression) kéo dãy núi ở xa phình to gấp 3 lần, ép sát ngay sau lưng mẫu.'
    ],
    emotionalLog: [
      'Ảnh 35mm tạo cảm giác thênh thang, phóng khoáng, chủ thể gắn kết và đối thoại trực tiếp với môi trường xung quanh.',
      'Ảnh 85mm mang tính điện ảnh cao, cô lập hoàn toàn nhân vật khỏi những chi tiết thừa, tạo vẻ tĩnh lặng, cao cấp và đầy nội tâm chuyên nghiệp.'
    ]
  },
  'exp-003': {
    title: 'EXP 003: Khẩu Độ & Hình Dạng Lá Khẩu (f/1.8 vs f/5.6)',
    desc: 'Quan sát sự biến đổi quang học của hình học bokeh ánh sáng khi khép khẩu khẩu độ thấu kính.',
    beforeLabel: 'KHẨU LỚN f/1.8 (TRÒN MỊN)',
    afterLabel: 'KHẨU NHỎ f/5.6 (ĐA GIÁC SẮC NÉT)',
    beforeHTML: `
      <div class="sim-aperture-18">
        <div class="bokeh-highlight-18"></div>
        <div class="bokeh-highlight-18"></div>
        <div class="bokeh-highlight-18"></div>
      </div>
    `,
    afterHTML: `
      <div class="sim-aperture-56">
        <div class="bokeh-highlight-56"></div>
        <div class="bokeh-highlight-56"></div>
        <div class="bokeh-highlight-56"></div>
      </div>
    `,
    technicalLog: [
      'Ở f/1.8, các lá khẩu thu gọn hoàn toàn vào trong, nhường chỗ cho lỗ mở thấu kính tròn trịa hoàn mỹ nhất, tạo đốm bokeh highlight hình tròn tan chảy.',
      'Khi khép khẩu xuống f/5.6, các lá khẩu cơ học nhô ra tạo thành hình lỗ mở đa giác góc cạnh.',
      'Đốm bokeh lúc này tái tạo chính xác số lượng lá khẩu của ống kính (ví dụ: hình lục giác đối với ống kính có 6 lá khẩu thẳng).'
    ],
    emotionalLog: [
      'Bokeh f/1.8 đem lại bầu không khí lãng mạn, ấm áp, lung linh ảo diệu của những giấc mơ nghệ thuật cổ điển.',
      'Bokeh khép khẩu f/5.6 có vẻ góc cạnh kỹ thuật, thô cứng hơn nhưng lại làm toàn bộ hậu cảnh rõ nét chi tiết hơn.'
    ]
  },
  'exp-004': {
    title: 'EXP 004: Khoa Học Quét Phim (Noritsu vs Frontier)',
    desc: 'So sánh chất màu ngả vàng ấm áp giữ chi tiết của máy scan Noritsu đối chọi với sắc xanh teal tươi mát tương phản mạnh của Fuji Frontier.',
    beforeLabel: 'BÊN TRÁI: SCAN NORITSU (KODAK ẤM & HẠT)',
    afterLabel: 'BÊN PHẢI: SCAN FRONTIER (FUJI TEAL & TƯƠNG PHẢN)',
    beforeHTML: `
      <div class="sim-scan-noritsu"></div>
      <div class="grain-overlay"></div>
      <!-- Simple trees silhouettes -->
      <svg viewBox="0 0 640 360" preserveAspectRatio="none" style="position:absolute; inset:0; width:100%; height:100%; z-index:2; opacity:0.8;">
        <path d="M 0 360 L 0 300 Q 150 270 320 310 Q 480 260 640 280 L 640 360 Z" fill="#1C1A27"/>
      </svg>
    `,
    afterHTML: `
      <div class="sim-scan-frontier"></div>
      <div class="grain-overlay"></div>
      <svg viewBox="0 0 640 360" preserveAspectRatio="none" style="position:absolute; inset:0; width:100%; height:100%; z-index:2; opacity:0.95;">
        <path d="M 0 360 L 0 300 Q 150 270 320 310 Q 480 260 640 280 L 640 360 Z" fill="#0A1C15"/>
      </svg>
    `,
    technicalLog: [
      'Noritsu scan giữ độ tương phản rất phẳng, mở rộng tối đa dải động sáng tối (dynamic range) giúp giữ chi tiết vùng tối rất tốt.',
      'Màu vàng đất và hạt grain phim được Noritsu giữ nguyên bản sắc bén kịch tính.',
      'Frontier tự động kéo tương phản (S-curve) rất gắt, dìm sâu vùng đen (deep blacks) tạo cảm giác ảnh no màu lập tức.',
      'Frontier ngả nhẹ tông màu tổng thể sang sắc xanh Teal đặc trưng nịnh mắt người châu Á.'
    ],
    emotionalLog: [
      'Noritsu mang lại cảm giác chân thực, phóng khoáng, đậm màu nắng bụi bặm retro đường phố.',
      'Frontier tái tạo bầu không khí mơ màng, hoài niệm rực rỡ và lãng mạn như các bộ phim tình cảm Nhật Bản.'
    ]
  },
  'exp-005': {
    title: 'EXP 005: Ánh Sáng Mềm vs Ánh Sáng Cứng (Soft Light vs Hard Light)',
    desc: 'So sánh trực quan sự khác biệt giữa nguồn sáng tản rộng (softbox/trời mây) tạo bóng mềm chuyển tiếp êm ái, và nguồn sáng trực tiếp nhỏ (nắng gắt/đèn trần) tạo bóng đổ sắc nét kịch tính trên cùng một khuôn mặt.',
    beforeLabel: 'BÊN TRÁI: ÁNH SÁNG MỀM (NGUỒN SÁNG TẢN)',
    afterLabel: 'BÊN PHẢI: ÁNH SÁNG CỨNG (NGUỒN SÁNG TRỰC TIẾP)',
    beforeHTML: `
      <div class="sim-soft-light-bg"></div>
      <!-- Soft shadow: very gradual, wide penumbra -->
      <div class="sim-soft-shadow"></div>
      <!-- Portrait silhouette with smooth gradient lighting -->
      <svg class="sim-portrait-soft" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="soft-face-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#E8D5C4" stop-opacity="1"/>
            <stop offset="40%" stop-color="#D4B8A0" stop-opacity="1"/>
            <stop offset="100%" stop-color="#B89A80" stop-opacity="1"/>
          </linearGradient>
          <linearGradient id="soft-shadow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(0,0,0,0)" stop-opacity="0"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0.15)" stop-opacity="1"/>
          </linearGradient>
        </defs>
        <!-- Head -->
        <ellipse cx="150" cy="130" rx="65" ry="80" fill="url(#soft-face-grad)"/>
        <!-- Subtle shadow on far side — very gentle gradient -->
        <ellipse cx="150" cy="130" rx="65" ry="80" fill="url(#soft-shadow-grad)" opacity="0.4"/>
        <!-- Neck -->
        <rect x="130" y="200" width="40" height="50" rx="10" fill="#C9A888"/>
        <!-- Shoulders -->
        <path d="M70 250 Q150 230 230 250 L240 400 L60 400 Z" fill="#1A1A26"/>
        <!-- Nose shadow — barely visible, very soft -->
        <ellipse cx="165" cy="155" rx="8" ry="5" fill="rgba(0,0,0,0.06)" filter="blur(4px)"/>
      </svg>
      <!-- Soft light glow indicator -->
      <div class="sim-soft-light-indicator"></div>
    `,
    afterHTML: `
      <div class="sim-hard-light-bg"></div>
      <!-- Hard shadow: sharp, defined edge -->
      <div class="sim-hard-shadow"></div>
      <!-- Portrait silhouette with dramatic split lighting -->
      <svg class="sim-portrait-hard" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="hard-face-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFE0C8" stop-opacity="1"/>
            <stop offset="48%" stop-color="#E8C8A8" stop-opacity="1"/>
            <stop offset="50%" stop-color="#3A2820" stop-opacity="1"/>
            <stop offset="100%" stop-color="#1A1210" stop-opacity="1"/>
          </linearGradient>
        </defs>
        <!-- Head with dramatic split -->
        <ellipse cx="150" cy="130" rx="65" ry="80" fill="url(#hard-face-grad)"/>
        <!-- Neck -->
        <rect x="130" y="200" width="40" height="50" rx="10" fill="#8A6A50"/>
        <!-- Shoulders -->
        <path d="M70 250 Q150 230 230 250 L240 400 L60 400 Z" fill="#0E0E18"/>
        <!-- Hard nose shadow — sharp, defined -->
        <polygon points="155,140 175,165 155,160" fill="rgba(0,0,0,0.6)"/>
        <!-- Under-chin hard shadow -->
        <ellipse cx="155" cy="195" rx="30" ry="8" fill="rgba(0,0,0,0.5)"/>
      </svg>
      <!-- Hard light point indicator -->
      <div class="sim-hard-light-indicator"></div>
    `,
    technicalLog: [
      'Kích thước biểu kiến (apparent size) của nguồn sáng so với chủ thể quyết định mức độ mềm/cứng của bóng đổ.',
      'Nguồn sáng LỚN và GẦN (softbox 120cm cách mẫu 1m) tạo ra vùng penumbra rộng — bóng đổ chuyển tiếp êm ái từ sáng sang tối.',
      'Nguồn sáng NHỎ và XA (mặt trời giữa trưa, hoặc đèn flash trần nhỏ) tạo ra penumbra cực hẹp — bóng đổ có viền sắc nét như dao cắt.',
      'Mặt trời dù cực lớn (đường kính 1.4 triệu km) nhưng cách xa 150 triệu km, nên kích thước biểu kiến chỉ bằng 0.5 độ — đó là lý do nắng giữa trưa tạo hard light.',
      'Bầu trời mây đục biến toàn bộ vòm trời thành một softbox khổng lồ 180 độ, tạo ra ánh sáng mềm nhất có thể trong tự nhiên.'
    ],
    emotionalLog: [
      'Ánh sáng mềm tạo cảm giác ấm áp, nhẹ nhàng, dễ tiếp cận. Lý tưởng cho chân dung beauty, sản phẩm mỹ phẩm, ảnh trẻ em và ảnh cưới.',
      'Ánh sáng cứng tạo cảm giác kịch tính, quyền lực, bí ẩn. Phù hợp với chân dung editorial, ảnh nghệ thuật noir, kiến trúc và nhiếp ảnh đường phố.',
      'Trong điện ảnh, đạo diễn Christopher Nolan thường dùng hard light cho cảnh căng thẳng, còn Terrence Malick ưa chuộng soft golden hour cho cảnh thiên nhiên thơ mộng.'
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.exp-tab-btn');
  const container = document.getElementById('comparison-container');
  const rangeInput = document.getElementById('comparison-range');
  const viewBefore = document.getElementById('view-before');
  const viewAfter = document.getElementById('view-after');
  const labelBefore = container.querySelector('.side-before .label-side');
  const labelAfter = container.querySelector('.side-after .label-side');
  const detailsContainer = document.getElementById('experiment-details');

  // Slider dragging binding
  rangeInput.addEventListener('input', (e) => {
    const val = e.target.value;
    container.style.setProperty('--slider-pos', `${val}%`);
  });

  // Switch Experiment Tab
  function selectExperiment(expId) {
    const data = experimentData[expId];
    if (!data) return;

    // Active button styling
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-exp') === expId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Fade out viewport, swap content, fade back in
    container.style.opacity = '0.3';
    container.style.transform = 'scale(0.99)';
    
    setTimeout(() => {
      // Swap content
      viewBefore.innerHTML = data.beforeHTML;
      viewAfter.innerHTML = data.afterHTML;
      
      // Update label texts
      labelBefore.textContent = data.beforeLabel;
      labelAfter.textContent = data.afterLabel;

      // Render Lab Notes
      detailsContainer.innerHTML = `
        <span class="gearmap-step-num">[ NHẬT KÝ THỬ NGHIỆM ]</span>
        <h2 style="font-size: 1.5rem; color: var(--text-primary); margin-top: 8px;">${data.title}</h2>
        <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
          ${data.desc}
        </p>
        
        <div class="exp-log-grid">
          <div class="exp-log-card">
            <h4>🔬 Phân Tích Kỹ Thuật (Technical Analysis)</h4>
            <ul>
              ${data.technicalLog.map(log => `<li>${log}</li>`).join('')}
            </ul>
          </div>
          
          <div class="exp-log-card">
            <h4>🎭 Tâm Lý Thị Giác (Emotional Impact)</h4>
            <ul>
              ${data.emotionalLog.map(log => `<li>${log}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;

      // Restore viewport opacity
      container.style.opacity = '1';
      container.style.transform = 'scale(1)';
    }, 250);
  }

  // Bind tab click events
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const expId = btn.getAttribute('data-exp');
      selectExperiment(expId);
    });
  });

  // Initial load: EXP 001
  selectExperiment('exp-001');
});
