/* ==========================================================================
   LUMENFORGE — Visual Identity Engine Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // === QUESTIONS DATABASE ===
  const quizQuestions = [
    {
      id: 'q1',
      question: 'Bạn bị thu hút bởi kiểu ánh sáng nào nhất?',
      options: [
        {
          text: 'Ánh nắng chiều muộn xiên ấm áp',
          desc: 'Ánh sáng vàng mật ong tạo bóng đổ dài đầy thơ mộng.',
          vibe: 'linear-gradient(135deg, #F4A460, #CD853F)',
          scores: { vintage: 3, cinematic: 1 }
        },
        {
          text: 'Ánh sáng cửa sổ tản dịu nhẹ ban ngày',
          desc: 'Ánh sáng mềm mại, trong trẻo, tự nhiên và cân bằng màu.',
          vibe: 'linear-gradient(135deg, #E0F7FA, #B2DFDB)',
          scores: { minimalist: 3, vintage: 1 }
        },
        {
          text: 'Đèn đường neon lấp lánh bóng đêm',
          desc: 'Ánh sáng tương phản mạnh mẽ từ các nguồn sáng màu sắc đô thị.',
          vibe: 'linear-gradient(135deg, #191970, #FF6B4A)',
          scores: { dramatic: 3, cinematic: 1 }
        },
        {
          text: 'Ánh sáng kiểm soát chủ động (Studio/Softbox)',
          desc: 'Ánh sáng được định hình chính xác theo ý đồ chụp.',
          vibe: 'linear-gradient(135deg, #1A1A24, #5A5A6A)',
          scores: { minimalist: 2, dramatic: 2 }
        }
      ]
    },
    {
      id: 'q2',
      question: 'Màu sắc tổng thể bạn muốn truyền tải trong tác phẩm?',
      options: [
        {
          text: 'Ấm áp, ngả vàng đất hoài cổ',
          desc: 'Tone màu ấm của ký ức và những bức ảnh film cũ.',
          vibe: 'linear-gradient(135deg, #DAA520, #8B7355)',
          scores: { vintage: 3 }
        },
        {
          text: 'Nhẹ nhàng trong veo, ngả xanh rêu nhẹ',
          desc: 'Sắc thái mát mẻ phong cách Nhật Bản/Đài Loan thơ mộng.',
          vibe: 'linear-gradient(135deg, #8FBC8F, #E0F2F1)',
          scores: { vintage: 1, minimalist: 2 }
        },
        {
          text: 'Màu sắc đậm đà, tương phản sắc nét',
          desc: 'Sự đối lập sặc sỡ giữa các dải màu nóng lạnh kịch tính.',
          vibe: 'linear-gradient(135deg, #FF3D00, #00E5FF)',
          scores: { dramatic: 3 }
        },
        {
          text: 'Đen trắng đơn sắc hoặc tone xám tối giản',
          desc: 'Loại bỏ màu sắc để tập trung vào hình khối, ánh sáng.',
          vibe: 'linear-gradient(135deg, #000000, #E8E4DF)',
          scores: { minimalist: 3, cinematic: 1 }
        }
      ]
    },
    {
      id: 'q3',
      question: 'Cách bạn muốn đóng khung (Framing) khuôn hình?',
      options: [
        {
          text: 'Chân dung đặc tả, tập trung vào ánh mắt',
          desc: 'Chủ thể nổi bật với hậu cảnh xóa mờ mượt mà.',
          vibe: 'linear-gradient(135deg, #FFB6C1, #FFD54F)',
          scores: { vintage: 2, cinematic: 1 }
        },
        {
          text: 'Góc rộng lấy trọn bối cảnh không gian',
          desc: 'Chủ thể nhỏ bé hòa hợp kể chuyện cùng cảnh vật.',
          vibe: 'linear-gradient(135deg, #81C784, #4FC3F7)',
          scores: { minimalist: 2, vintage: 1 }
        },
        {
          text: 'Khoảnh khắc di động nhanh trên đường phố',
          desc: 'Bắt lấy chuyển động tự nhiên của con người đô thị.',
          vibe: 'linear-gradient(135deg, #FFD54F, #E0E0E0)',
          scores: { dramatic: 1, cinematic: 2 }
        },
        {
          text: 'Sắp đặt tĩnh vật tối giản, hình khối góc cạnh',
          desc: 'Cân bằng bố cục hình học chặt chẽ, tĩnh lặng.',
          vibe: 'linear-gradient(135deg, #263238, #ECEFF1)',
          scores: { minimalist: 3 }
        }
      ]
    },
    {
      id: 'q4',
      question: 'Kết cấu bề mặt hình ảnh bạn mong muốn?',
      options: [
        {
          text: 'Hạt nhiễu grain film thô mộc sống động',
          desc: 'Lớp texture thô mộc làm bức ảnh có độ nhám cổ điển.',
          vibe: 'linear-gradient(135deg, #8B8682, #CD853F)',
          scores: { vintage: 3 }
        },
        {
          text: 'Nét căng, mịn màng và sạch sẽ hoàn toàn',
          desc: 'Chất lượng ảnh kỹ thuật số trong trẻo, không một vệt nhiễu.',
          vibe: 'linear-gradient(135deg, #E0F7FA, #E8E4DF)',
          scores: { minimalist: 3 }
        },
        {
          text: 'Hơi nhòe mờ chuyển động (Motion blur) ngẫu hứng',
          desc: 'Tạo cảm giác rung động sống động của cuộc sống thực.',
          vibe: 'linear-gradient(135deg, #E8725C, #8B5CF6)',
          scores: { cinematic: 2, dramatic: 1 }
        },
        {
          text: 'Khối tương phản gai góc sắc sảo',
          desc: 'Nổi bật bề mặt chất liệu vật thể chân thực.',
          vibe: 'linear-gradient(135deg, #424242, #12121A)',
          scores: { minimalist: 1, dramatic: 2 }
        }
      ]
    },
    {
      id: 'q5',
      question: 'Cảm xúc chính bạn muốn khơi gợi nơi người xem?',
      options: [
        {
          text: 'Ấm áp, sự cô đơn dễ chịu, hoài niệm tuổi thơ',
          desc: 'Cảm giác bình yên mang màu sắc hoài niệm thời gian.',
          vibe: 'linear-gradient(135deg, #FFE082, #FF8A65)',
          scores: { vintage: 3 }
        },
        {
          text: 'Bình yên, nhẹ nhàng, trong sáng tinh tế',
          desc: 'Giúp bộ não thư giãn qua những mảng màu thanh tao dịu mắt.',
          vibe: 'linear-gradient(135deg, #C8E6C9, #B2DFDB)',
          scores: { minimalist: 2, vintage: 1 }
        },
        {
          text: 'Bí ẩn, sâu thẳm, điện ảnh đầy kịch tính',
          desc: 'Khiến người xem phải suy nghĩ về câu chuyện sau khung hình.',
          vibe: 'linear-gradient(135deg, #1A237E, #D84315)',
          scores: { cinematic: 3 }
        },
        {
          text: 'Quyền lực, sang trọng, chuẩn mực chuyên nghiệp',
          desc: 'Tôn vinh sự tự tin, tin cậy tuyệt đối của nhân vật.',
          vibe: 'linear-gradient(135deg, #212121, #FFD700)',
          scores: { minimalist: 2, dramatic: 1 }
        }
      ]
    }
  ];

  // === PROFILES DATABASE ===
  const styleProfiles = {
    'vintage': {
      name: 'Vintage Nostalgic Dreamer',
      vnName: 'Kẻ Mơ Mộng Hoài Cổ',
      tagline: 'Ảnh không chỉ để nhìn, ảnh để nhớ về ký ức.',
      palette: [
        { name: 'Warm Amber', hex: '#D4A574' },
        { name: 'Faded Mustard', hex: '#CDBA7D' },
        { name: 'Muted Olive', hex: '#7A8B6F' },
        { name: 'Paper White', hex: '#E6E2D8' }
      ],
      description: 'Bạn thuộc nhóm yêu thích những giá trị thời gian. Phong cách của bạn thiên về sự ấm áp, hoài niệm, nhẹ nhàng mộc mạc. Bạn coi trọng cảm xúc nguyên bản của tấm ảnh hơn là độ nét hoàn hảo kỹ thuật số.',
      lens: 'RF 50mm f/1.8 STM hoặc các dòng ống kính cổ quay tay (Manual Focus) qua ngàm chuyển.',
      cameraSetup: 'Aperture Priority (Av), Khẩu độ f/2.0, Cân bằng trắng Daylight (5500K) hoặc Cloudy (6000K). Hơi dư sáng (+0.3 EV) nhẹ.',
      lightroom: 'Highlights -15, Shadows +20, Blacks nâng nhẹ Tone Curve tạo lớp sương bạc mờ đục. Thêm grain trung bình (Amt: 25).',
      avoid: 'Ánh sáng flash nhân tạo gắt, độ nét quá cao nhân tạo (oversharpening), độ bão hòa màu quá rực rỡ.',
      proTip: 'Hãy thử tìm mua các ống kính cổ của Nhật như Helios 44-2 hoặc Super Takumar 50mm f/1.4 để có hiệu ứng quang sai và loe sáng ngược nắng (lens flare) cực kỳ thơ mộng.'
    },
    'cinematic': {
      name: 'Quiet Cinematic Realist',
      vnName: 'Người Kể Chuyện Điện Ảnh Lặng Lẽ',
      tagline: 'Mỗi khung hình là một phân cảnh của cuốn phim đời thực.',
      palette: [
        { name: 'Deep Cyan', hex: '#1C313A' },
        { name: 'Warm Orange', hex: '#D84315' },
        { name: 'Moody Shadow', hex: '#121217' },
        { name: 'Steel Gray', hex: '#78909C' }
      ],
      description: 'Bạn nhìn thế giới qua lăng kính điện ảnh. Bạn yêu thích bóng tối, chiều sâu phối cảnh, và những vệt sáng cô độc. Hình ảnh của bạn khơi gợi sự tò mò về một câu chuyện chưa kể.',
      lens: 'RF 35mm f/1.8 Macro IS STM hoặc RF 50mm f/1.8 (tận dụng cự ly nén trung bình tự nhiên).',
      cameraSetup: 'Manual Mode, Khẩu độ f/1.8 - f/2.2, EV đặt ở mức -0.3 hoặc -0.7 để bảo vệ chi tiết vùng tối và vệt sáng đơn độc.',
      lightroom: 'Tương phản cao (+15), hạ Highlights mạnh (-35) để giữ chi tiết đèn đường ban đêm, ám xanh lam nhẹ ở shadows và cam ấm ở highlights.',
      avoid: 'Bố cục quá lộn xộn không có đường dẫn thị giác, ánh sáng quá chan hòa phẳng lì không có bóng đổ.',
      proTip: 'Hãy săn tìm những "vệt sáng đơn độc" (như bóng nắng xiên qua cửa sổ trong phòng tối, đèn đường soi bóng mẫu đêm mưa) để làm bật chủ thể.'
    },
    'minimalist': {
      name: 'Modern Clean Minimalist',
      vnName: 'Người Tối Giản Hiện Đại Sắc Sảo',
      tagline: 'Sự tối giản là đỉnh cao của sự tinh tế.',
      palette: [
        { name: 'Pure White', hex: '#FAFAFA' },
        { name: 'Minimal Gray', hex: '#ECEFF1' },
        { name: 'Charcoal Black', hex: '#212121' },
        { name: 'Technical Blue', hex: '#4A9EFF' }
      ],
      description: 'Bạn yêu thích sự sạch sẽ, trật tự, bố cục hình học sắc sảo và độ sắc nét cao. Hình ảnh của bạn toát lên sự tinh tế, sang trọng nhờ loại bỏ tối đa các chi tiết thừa thãi.',
      lens: 'Sigma 56mm f/1.4 DC DN hoặc RF 24-70mm f/2.8L (chất lượng quang học hoàn mỹ nét từ rìa vào tâm).',
      cameraSetup: 'Khẩu độ f/2.8 đến f/5.6. Bật lưới chia 1/3 trên màn hình để căn bố cục vuông vắn, song song tuyệt đối với đường thẳng kiến trúc.',
      lightroom: 'Highlights -10, Shadows +10, tương phản vừa phải, giảm bớt bão hòa màu tổng thể (-10), tăng nhẹ độ nét (Texture: +8). Không thêm grain.',
      avoid: 'Ống kính chất lượng kém bị viền tím nhiều, hậu cảnh rác lộn xộn không dọn dẹp trước khi chụp.',
      proTip: 'Luôn luôn dọn dẹp hậu cảnh thật kỹ. Chỉ giữ lại những đường thẳng, mảng khối sạch sẽ. Bố cục đặt chủ thể vào chính giữa khung hình (Center composition) hoạt động cực tốt ở style này.'
    },
    'dramatic': {
      name: 'Dramatic Neon Explorer',
      vnName: 'Kẻ Khám Phá Bóng Đêm Kịch Tính',
      tagline: 'Bóng tối định hình ánh sáng.',
      palette: [
        { name: 'Neon Pink', hex: '#E91E63' },
        { name: 'Electric Cyan', hex: '#00E5FF' },
        { name: 'Midnight Black', hex: '#0A0A0E' },
        { name: 'Amber Glow', hex: '#FF8F00' }
      ],
      description: 'Bạn bị kích thích bởi sự kịch tính của màu sắc gắt, độ tương phản cực đại và bầu không khí đô thị lung linh bóng đêm. Bạn muốn hình ảnh của mình phải đập thẳng vào mắt người xem bằng năng lượng rực rỡ.',
      lens: 'Sigma 56mm f/1.4 hoặc RF 16mm f/2.8 (tạo góc kịch tính méo kéo giãn không gian).',
      cameraSetup: 'Shutter Priority (Tv) hoặc Manual, Khẩu mở lớn tối đa, tốc độ màn trập 1/80s - 1/125s chụp đêm đường phố.',
      lightroom: 'Tăng Contrast mạnh (+25), Shadows kéo sâu (-15), Highlights hạ nhẹ. Tẩy màu vàng thừa của đèn đường để làm nổi bật sắc hồng/xanh neon.',
      avoid: 'Ánh nắng tản nhạt nhòa ban ngày trời nhiều mây, màu sắc pastel quá dịu nhẹ.',
      proTip: 'Hãy mang theo một lăng kính thủy tinh nhỏ đặt trước rìa ống kính để phản chiếu các chùm đèn neon đô thị tạo hiệu ứng vệt sáng lóe đầy ảo diệu.'
    }
  };

  // === STATE TRACKER ===
  let currentStep = 0;
  let userScores = {
    vintage: 0,
    cinematic: 0,
    minimalist: 0,
    dramatic: 0
  };

  const quizContainer = document.getElementById('quiz-container');
  const quizProgressFill = document.getElementById('quiz-progress-fill');
  const quizOutput = document.getElementById('quiz-output');

  function renderQuestion() {
    const q = quizQuestions[currentStep];
    
    // Update progress bar
    const progressPct = ((currentStep) / quizQuestions.length) * 100;
    quizProgressFill.style.width = `${progressPct}%`;

    quizContainer.innerHTML = `
      <div class="gearmap-progress">
        <span class="gearmap-step-num">CÂU HỎI ${currentStep + 1} / ${quizQuestions.length}</span>
      </div>
      <h2 class="gearmap-question">${q.question}</h2>
      <div class="quiz-options-grid">
        ${q.options.map((opt, index) => `
          <label class="quiz-option-card">
            <input type="radio" name="quiz-opt" value="${index}">
            <div class="quiz-option-card-visual" style="background: ${opt.vibe}"></div>
            <span class="quiz-option-card-title">${opt.text}</span>
            <span class="quiz-option-card-desc">${opt.desc}</span>
          </label>
        `).join('')}
      </div>
      <button class="btn-generate" id="next-btn" style="margin-top: 32px;" disabled>Next Question</button>
    `;

    // Radio select handling
    const cards = quizContainer.querySelectorAll('.quiz-option-card');
    const nextBtn = document.getElementById('next-btn');

    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        card.querySelector('input').checked = true;
        nextBtn.removeAttribute('disabled');
      });
    });

    // Next button click
    nextBtn.addEventListener('click', () => {
      const selectedIndex = parseInt(quizContainer.querySelector('input[name="quiz-opt"]:checked').value);
      const chosenOpt = q.options[selectedIndex];

      // Add scores
      for (const [style, value] of Object.entries(chosenOpt.scores)) {
        userScores[style] = (userScores[style] || 0) + value;
      }

      currentStep++;
      if (currentStep < quizQuestions.length) {
        renderQuestion();
      } else {
        renderResults();
      }
    });
  }

  function renderResults() {
    // Fill progress to 100%
    quizProgressFill.style.width = '100%';
    quizContainer.style.display = 'none';

    // Calculate highest scoring profile
    let winnerStyle = 'vintage';
    let maxScore = -1;
    for (const [style, score] of Object.entries(userScores)) {
      if (score > maxScore) {
        maxScore = score;
        winnerStyle = style;
      }
    }

    const profile = styleProfiles[winnerStyle];

    quizOutput.innerHTML = `
      <div class="output-header" style="margin-bottom: var(--space-xl); padding-bottom: var(--space-xl);">
        <span class="gearmap-step-num">[ VISUAL PERSONALITY PROFILE ]</span>
        <h2 style="font-size: clamp(1.8rem, 4vw, 2.6rem); margin-top: 8px;">${profile.name}</h2>
        <p style="color: var(--accent-amber); font-family: var(--font-heading); font-size: 1.2rem; font-style: italic; margin-top: 4px;">
          "${profile.vnName}"
        </p>
        <p style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-dim); margin-top: 8px;">
          ${profile.tagline}
        </p>
      </div>

      <div class="film-color-palette" style="margin-bottom: 32px;">
        <h4 style="font-family:var(--font-mono); font-size:0.75rem; color:var(--accent-amber); margin-bottom:12px; text-transform:uppercase;">🎨 GỢI Ý COLOR PALETTE CỦA BẠN</h4>
        <div class="color-swatches" style="display:flex; gap:16px; flex-wrap:wrap;">
          ${profile.palette.map(color => `
            <div class="swatch" style="display:flex; flex-direction:column; align-items:center; gap:6px;">
              <div class="swatch-color" style="width:48px; height:48px; border-radius:8px; background:${color.hex}; border:1px solid var(--border)"></div>
              <span style="font-family:var(--font-mono); font-size:0.68rem; color:var(--text-secondary);">${color.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="output-grid">
        
        <div class="output-card">
          <h4>🎭 Tính Cách Đặc Trưng</h4>
          <p>${profile.description}</p>
        </div>

        <div class="output-card">
          <h4>📷 Thiết Bị Khuyên Dùng</h4>
          <p><strong>Lens khuyên dùng:</strong> ${profile.lens}</p>
          <p style="margin-top:6px;"><strong>Setup máy ảnh cơ bản:</strong> ${profile.cameraSetup}</p>
        </div>

        <div class="output-card">
          <h4>🎛️ Định Hướng Hậu Kỳ (Lightroom)</h4>
          <p>${profile.lightroom}</p>
        </div>

        <div class="output-card">
          <h4>⚠️ Điều Cần Tránh</h4>
          <p>${profile.avoid}</p>
        </div>

        <div class="output-card full-width pro-tip" style="background: var(--accent-amber-dim); border-color: rgba(245, 166, 35, 0.2);">
          <h4 style="color: var(--accent-amber);">💡 Pro Tip Từ Henry</h4>
          <p>${profile.proTip}</p>
        </div>

      </div>

      <div class="gearmap-actions" style="margin-top: 32px;">
        <button class="btn-generate" id="quiz-reset" style="margin-top:0; max-width:280px;">Làm Lại Trắc Nghiệm</button>
      </div>
    `;

    quizOutput.style.display = 'block';
    
    // Reset click
    document.getElementById('quiz-reset').addEventListener('click', () => {
      currentStep = 0;
      userScores = { vintage: 0, cinematic: 0, minimalist: 0, dramatic: 0 };
      quizOutput.style.display = 'none';
      quizContainer.style.display = 'block';
      renderQuestion();
    });

    // Scroll to top of output
    quizOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Initial load
  renderQuestion();
});
