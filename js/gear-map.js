/* ==========================================================================
   LUMENFORGE — Gear Map Decision Engine Logic
   ========================================================================== */

const gearMapNodes = {
  // === START NODE ===
  'start': {
    question: 'Bạn đang sử dụng thiết bị gì?',
    options: [
      { text: 'Canon EOS R50 (APS-C)', next: 'r50-purpose' },
      { text: 'Máy ảnh DSLR/Mirrorless hãng khác', next: 'other-purpose' },
      { text: 'Chỉ chụp bằng Điện Thoại (Smartphone)', next: 'phone-purpose' },
      { text: 'Chưa có máy, đang tìm mua bộ máy ảnh đầu tiên', next: 'buy-first' }
    ]
  },

  // === CANON R50 BRANCH ===
  'r50-purpose': {
    question: 'Mục đích chụp ảnh chính của bạn là gì?',
    options: [
      { text: 'Chụp chân dung người yêu / Bạn bè xóa phông', next: 'r50-portrait-budget' },
      { text: 'Chụp đi du lịch, phong cảnh, gia đình đa dụng', next: 'r50-travel-budget' },
      { text: 'Chụp phố phường đời thường (Street photography)', next: 'r50-street-budget' },
      { text: 'Chụp sản phẩm nhỏ / Đồ ăn làm nội dung', next: 'r50-product-budget' }
    ]
  },
  'r50-portrait-budget': {
    question: 'Ngân sách tối đa của bạn cho ống kính mới?',
    options: [
      { text: 'Dưới 3 triệu VND', result: 'r50-port-low' },
      { text: 'Từ 3 đến 8 triệu VND', result: 'r50-port-mid' },
      { text: 'Trên 8 triệu VND', result: 'r50-port-high' }
    ]
  },
  'r50-travel-budget': {
    question: 'Bạn ưu tiên tính nhỏ gọn hay dải zoom xa?',
    options: [
      { text: 'Nhỏ gọn tối đa, bỏ túi dễ dàng', result: 'r50-trav-compact' },
      { text: 'Zoom xa đa dụng, một lens cho mọi cự ly', result: 'r50-trav-zoom' }
    ]
  },
  'r50-street-budget': {
    question: 'Phong cách chụp phố của bạn là gì?',
    options: [
      { text: 'Góc nhìn rộng rãi, kể chuyện toàn cảnh', result: 'r50-street-wide' },
      { text: 'Góc nhìn cận trung tự nhiên, khẩu độ lớn đêm', result: 'r50-street-standard' }
    ]
  },
  'r50-product-budget': {
    question: 'Món đồ bạn chụp có kích thước như thế nào?',
    options: [
      { text: 'Đồ ăn bàn tiệc, sản phẩm thời trang lớn', result: 'r50-prod-standard' },
      { text: 'Trang sức, mỹ phẩm nhỏ, hoa lá cận cảnh', result: 'r50-prod-macro' }
    ]
  },

  // === OTHER CAMERAS BRANCH ===
  'other-purpose': {
    question: 'Khung cảm biến máy ảnh hiện tại của bạn là gì?',
    options: [
      { text: 'Cảm biến Crop (APS-C / Micro Four Thirds)', next: 'other-apsc-port' },
      { text: 'Cảm biến lớn Full-Frame', next: 'other-ff-port' }
    ]
  },
  'other-apsc-port': {
    question: 'Bạn muốn ưu tiên chụp gì nhất?',
    options: [
      { text: 'Xóa phông chân dung tối đa', result: 'other-apsc-bokeh' },
      { text: 'Góc rộng du lịch / Phong cảnh', result: 'other-apsc-wide' }
    ]
  },
  'other-ff-port': {
    question: 'Bạn có ngân sách dư dả cho ống kính cao cấp không?',
    options: [
      { text: 'Cần chất lượng tối cao, không ngại chi phí', result: 'other-ff-premium' },
      { text: 'Cần hiệu năng trên giá thành (P/P) tốt nhất', result: 'other-ff-budget' }
    ]
  },

  // === PHONE BRANCH ===
  'phone-purpose': {
    question: 'Bạn muốn cải thiện điều gì nhất trên camera điện thoại?',
    options: [
      { text: 'Muốn xóa phông chân thật hơn, bớt giả tạo', result: 'phone-portrait-tip' },
      { text: 'Muốn chụp đêm đường phố ít nhiễu, có hồn', result: 'phone-night-tip' },
      { text: 'Muốn chụp góc cực rộng phong cảnh sâu hơn', result: 'phone-wide-tip' }
    ]
  },

  // === FIRST BUY BRANCH ===
  'buy-first': {
    question: 'Tổng ngân sách của bạn cho cả thân máy + ống kính?',
    options: [
      { text: 'Dưới 15 triệu VND', result: 'buy-low-budget' },
      { text: 'Từ 15 đến 25 triệu VND', result: 'buy-mid-budget' },
      { text: 'Trên 25 triệu VND', result: 'buy-high-budget' }
    ]
  }
};

// === RECOMMENDATIONS DATA ===
const gearRecommendations = {
  // Canon R50 Portrait Results
  'r50-port-low': {
    title: 'Canon RF 50mm f/1.8 STM',
    subtitle: 'Ống kính quốc dân bắt buộc phải sở hữu',
    price: '~2.8 - 3.2 triệu VND',
    whyBuy: 'Đạt cự ly tương đương ~80mm trên Canon R50. Đây là tiêu cự chân dung cổ điển vàng. Khẩu độ f/1.8 cho phép xóa phông rất tốt ban ngày và bắt sáng cực tốt ban đêm với mức giá không thể rẻ hơn.',
    mistakes: 'Lấy nét ở f/1.8 cự ly gần rất dễ out nét nhẹ. Hãy khép xuống f/2.2 để có độ nét tối ưu trên mắt mẫu.',
    recipeLink: 'shot-recipes.html',
    recipeName: 'Mature Studio Avatar (Recipe 001)'
  },
  'r50-port-mid': {
    title: 'Sigma 56mm f/1.4 DC DN Contemporary (Ngàm RF)',
    subtitle: 'Kẻ hủy diệt chân dung hệ máy Crop',
    price: '~7.5 - 8.2 triệu VND',
    whyBuy: 'Chiếc lens chân dung sắc nét và xóa phông đỉnh cao nhất hệ APS-C. Khẩu độ siêu lớn f/1.4 cho lượng ánh sáng gấp đôi f/1.8, bokeh tròn tan chảy và độ khối 3D tách biệt tuyệt mỹ.',
    mistakes: 'Lens không chống rung nên khi chụp tối cần giữ chắc tay hoặc giữ tốc độ màn trập trên 1/125s.',
    recipeLink: 'shot-recipes.html',
    recipeName: 'Girlfriend Portrait (Recipe 004)'
  },
  'r50-port-high': {
    title: 'Canon RF 85mm f/2 Macro IS STM',
    subtitle: 'Tiêu cự chân dung chuyên nghiệp & Chống rung',
    price: '~13.5 - 14.5 triệu VND',
    whyBuy: 'Góc nhìn tương đương 136mm full frame. Độ nén phối cảnh cực cao giúp cô lập mẫu hoàn toàn khỏi bối cảnh lộn xộn. Tích hợp chống rung quang học 5 stops và khả năng chụp Macro cận cảnh đa dụng.',
    mistakes: 'Tiêu cự dài yêu cầu bạn đứng cách mẫu khá xa (ít nhất 3.5m - 5m) nên không phù hợp chụp trong phòng chật hẹp.',
    recipeLink: 'shot-recipes.html',
    recipeName: 'Mature Studio Avatar (Recipe 001)'
  },

  // Canon R50 Travel Results
  'r50-trav-compact': {
    title: 'Canon RF 28mm f/2.8 STM (Pancake)',
    subtitle: 'Ống kính dẹt siêu nhẹ bỏ túi',
    price: '~6.8 - 7.5 triệu VND',
    whyBuy: 'Dẹt mỏng chỉ 2cm, biến Canon R50 thành một chiếc máy ảnh bỏ túi đúng nghĩa. Góc nhìn tương đương ~45mm cực kỳ linh hoạt cho chụp đường phố, cafe và phong cảnh nhẹ nhàng.',
    mistakes: 'Không có chống rung quang học và khẩu độ f/2.8 không quá lớn để xóa phông mịt mù.',
    recipeLink: 'shot-recipes.html',
    recipeName: 'Coffee Date Film Look (Recipe 002)'
  },
  'r50-trav-zoom': {
    title: 'Canon RF-S 18-150mm f/3.5-6.3 IS STM',
    subtitle: 'Một ống kính cân trọn mọi hành trình',
    price:  '~10.5 triệu VND (Hoặc mua kèm bộ Kit của R50)',
    whyBuy: 'Dải zoom cực rộng từ góc rộng 18mm chụp phong cảnh đến 150mm chụp cận cảnh chim muông, vật thể ở xa. Có chống rung quang học vững chắc.',
    mistakes: 'Khẩu độ khép sâu xuống f/6.3 ở tiêu cự dài khiến ảnh dễ bị nhiễu noise khi chụp trong bóng tối.',
    recipeLink: 'shot-recipes.html',
    recipeName: 'Minimalist Travel Look (Recipe 008)'
  },

  // Canon R50 Street Results
  'r50-street-wide': {
    title: 'Canon RF 16mm f/2.8 STM',
    subtitle: 'Ống kính góc siêu rộng giá mềm',
    price: '~6.5 triệu VND',
    whyBuy: 'Tương đương góc nhìn ~25mm full frame. Cực kỳ thích hợp cho các shot hình dạo phố lấy chiều sâu hút mắt, chụp kiến trúc đô thị lớn hoặc tự quay vlog góc rộng cầm tay thoải mái.',
    mistakes: 'Tránh đưa mặt chủ thể sát viền góc ảnh vì thuật toán sẽ kéo giãn gây biến dạng tỉ lệ đầu.',
    recipeLink: 'light-codex.html',
    recipeName: 'Optics 101: Tiêu cự định hình không gian'
  },
  'r50-street-standard': {
    title: 'Canon RF 35mm f/1.8 Macro IS STM',
    subtitle: 'Nhà kể chuyện đường phố đa năng',
    price: '~11.2 - 12.0 triệu VND',
    whyBuy: 'Tiêu cự vàng tương đương ~56mm. Khẩu lớn f/1.8 cùng chống rung IS giúp bạn dễ dàng săn ảnh đường phố buổi đêm. Tích hợp tính năng chụp cận cảnh Macro đầy nghệ thuật.',
    mistakes: 'Lấy nét hơi kêu rè rè nhẹ do motor Macro chuyển động hành trình dài.',
    recipeLink: 'shot-recipes.html',
    recipeName: 'Coffee Date Film Look (Recipe 002)'
  },

  // Canon R50 Product Results
  'r50-prod-standard': {
    title: 'Canon RF 50mm f/1.8 STM',
    subtitle: 'Sự thật cân bằng không méo hình',
    price: '~3.0 triệu VND',
    whyBuy: 'Cự ly tương đương ~80mm loại bỏ hoàn toàn độ méo hình. Chụp quần áo thời trang, phụ kiện hay các đĩa thức ăn trung tâm thẳng thắn, chính xác và sắc nét tốt tại f/4.0.',
    mistakes: 'Khoảng cách lấy nét tối thiểu là 30cm nên không chụp sát các hạt trang sức li ti được.',
    recipeLink: 'shot-recipes.html',
    recipeName: 'Minimalist Food Alchemy (Recipe 006)'
  },
  'r50-prod-macro': {
    title: 'Canon RF 35mm f/1.8 Macro IS STM',
    subtitle: 'Đặc tả chi tiết sản phẩm siêu nhỏ',
    price: '~11.5 triệu VND',
    whyBuy: 'Khoảng lấy nét siêu cận chỉ 17cm giúp bạn dí sát vào các chi tiết tinh xảo của trang sức, mỹ phẩm hay hoa lá để chụp những bức hình phóng đại đầy mê hoặc.',
    mistakes: 'Đứng quá sát sản phẩm dễ làm thân ống kính che mất nguồn sáng rọi vào vật thể.',
    recipeLink: 'shot-recipes.html',
    recipeName: 'Product Minimal Shot (Recipe 005)'
  },

  // Other Camera Results
  'other-apsc-bokeh': {
    title: 'Sigma 56mm f/1.4 DC DN Contemporary (Sony E / Fujifilm X ngàm)',
    subtitle: 'Huyền thoại chân dung hệ crop',
    price: '~7.8 triệu VND',
    whyBuy: 'Nếu bạn dùng Sony A6400 hay Fujifilm X-S20, chiếc lens này mang lại độ nét gai góc ngay tại f/1.4 và hiệu ứng bokeh tan chảy tuyệt vời nhất trong dải phân khúc giá tầm trung.',
    mistakes: 'Không có chống rung tích hợp trên lens.',
    recipeLink: 'shot-recipes.html',
    recipeName: 'Girlfriend Portrait (Recipe 004)'
  },
  'other-apsc-wide': {
    title: 'Tamron 11-20mm f/2.8 Di III-A RXD hoặc Sigma 10-18mm f/2.8',
    subtitle: 'Zoom góc rộng khẩu lớn cao cấp',
    price: '~15.5 - 17.0 triệu VND',
    whyBuy: 'Khẩu độ f/2.8 không đổi trên toàn dải zoom giúp bạn dễ dàng chụp phong cảnh rộng lớn lúc bình minh hay quay vlog trong nhà thiếu sáng cực tốt.',
    mistakes: 'Giá tương đối cao so với lens kit thông thường.',
    recipeLink: 'shot-recipes.html',
    recipeName: 'Minimalist Travel Look (Recipe 008)'
  },
  'other-ff-premium': {
    title: 'Lenses dòng G Master (Sony GM) hoặc dòng L (Canon L)',
    subtitle: 'Đỉnh cao chất lượng quang cụ',
    price: 'Trên 35 triệu VND',
    whyBuy: 'Ví dụ FE 50mm f/1.2 GM hay RF 85mm f/1.2L. Thiết kế quang học tối tân nhất thế giới loại bỏ hoàn toàn viền tím, sắc nét kinh ngạc từ tâm ra rìa và bokeh kem mịn xa xỉ.',
    mistakes: 'Kích thước rất nặng và cực kỳ đắt đỏ.',
    recipeLink: 'shot-recipes.html',
    recipeName: 'Studio Portrait of Power (Recipe 009)'
  },
  'other-ff-budget': {
    title: 'Lenses Samyang / Viltrox AF hoặc 85mm f/1.8 chính hãng',
    subtitle: 'Vua hiệu năng trên giá thành',
    price: '~7.0 - 12.0 triệu VND',
    whyBuy: 'Viltrox 85mm f/1.8 AF hay Sony FE 85mm f/1.8 mang lại 90% chất lượng xóa phông chân dung chuyên nghiệp của dòng cao cấp nhưng với mức giá chỉ bằng 1/3.',
    mistakes: 'Lớp phủ coating chống lóa (flare) ngược sáng hơi kém hơn lens cao cấp.',
    recipeLink: 'shot-recipes.html',
    recipeName: 'Mature Studio Avatar (Recipe 001)'
  },

  // Phone Tips
  'phone-portrait-tip': {
    title: 'Tối ưu hóa góc Portrait trên Điện thoại',
    subtitle: 'Quy tắc tiêu cự 2x hoặc 3x',
    price: 'Miễn phí (Tích hợp sẵn)',
    whyBuy: 'ĐỪNG CHỤP chân dung bằng camera mặc định 1x (24mm) vì đầu mẫu sẽ bị to và méo. Hãy luôn gạt sang tiêu cự zoom quang 2x hoặc 3x (~50-77mm) để khuôn mặt mẫu có tỷ lệ cân đối, sang trọng nhất. Lùi xa chủ thể khoảng 2m.',
    mistakes: 'Xóa phông giả lập của điện thoại hay bị lẹm tóc. Tránh chụp hậu cảnh có cành cây nhỏ rối rắm khiến AI nhận diện sai.',
    recipeLink: 'articles/canon-r50-vs-iphone.html',
    recipeName: 'Mổ xẻ: Tại sao máy ảnh chụp khác điện thoại?'
  },
  'phone-night-tip': {
    title: 'Hạ phơi sáng (EV) thủ công khi chụp đêm',
    subtitle: 'Bí thuật tạo màu sắc có chiều sâu tương phản',
    price: 'Miễn phí',
    whyBuy: 'Thuật toán chụp đêm của smartphone luôn cố gắng biến đêm thành ngày bằng cách tăng sáng quá đà làm ảnh bị bẹt phẳng. Hãy chạm tay vào màn hình, kéo thanh trượt biểu tượng mặt trời xuống mức -0.3 đến -1.0 EV. Bức ảnh đêm của bạn sẽ sâu thẳm, đen sâu đậm chất điện ảnh neon rực rỡ.',
    mistakes: 'Cầm máy không chắc tay trong 1-2 giây lúc thuật toán đang phơi sáng ghép hình.',
    recipeLink: 'shot-recipes.html',
    recipeName: 'Saigon Night Cinema Walk (Recipe 007)'
  },
  'phone-wide-tip': {
    title: 'Bố cục khung hình góc cực rộng 0.5x',
    subtitle: 'Tận dụng kéo giãn perspective',
    price: 'Miễn phí',
    whyBuy: 'Hãy đặt camera góc rộng sát mặt đất hướng chéo lên trời, hoặc dí cực sát vào một đóa hoa tiền cảnh. Bố cục này kéo giãn các đường viền xung quanh, tạo cảm giác hùng vĩ cho bức ảnh du lịch phong cảnh của bạn.',
    mistakes: 'Để người đứng gần rìa khung hình khiến chân tay họ bị kéo dài méo mó buồn cười.',
    recipeLink: 'light-codex.html',
    recipeName: 'Optics 101: Tiêu cự định hình không gian'
  },

  // Buy First Results
  'buy-low-budget': {
    title: 'Canon EOS R100 kèm Kit 18-45mm hoặc Máy ảnh cũ Fujifilm X-T20',
    subtitle: 'Bước chân đầu tiên vào nhiếp ảnh quang học',
    price: '~11.0 - 13.5 triệu VND',
    whyBuy: 'R100 là chiếc máy ảnh rẻ nhất của Canon ngàm RF hiện đại. Cho chất lượng file ảnh vượt xa mọi điện thoại thông minh cao cấp nhờ cảm biến lớn và khả năng thay ống kính linh hoạt về sau.',
    mistakes: 'Màn hình của R100 không xoay lật linh hoạt được và không có cảm ứng.',
    recipeLink: 'articles/canon-r50-vs-iphone.html',
    recipeName: 'Tại sao máy ảnh chụp khác điện thoại?'
  },
  'buy-mid-budget': {
    title: 'Canon EOS R50 kèm Kit RF-S 18-45mm',
    subtitle: 'Chiếc máy ảnh Creator tốt nhất phân khúc',
    price: '~16.5 - 18.0 triệu VND',
    whyBuy: 'Nhỏ gọn, lấy nét nhận diện mắt siêu nhanh (AI tracking từ dòng chuyên nghiệp), màn hình xoay lật cảm ứng lý tưởng cho vlog và chụp hình. Là sự lựa chọn hoàn hảo nhất cho Henry!',
    mistakes: 'Kính ngắm hơi nhỏ và thời lượng pin ở mức trung bình (khuyên mua thêm 1 viên pin dự phòng).',
    recipeLink: 'tools/lens-decoder.html',
    recipeName: 'Tool: Giải mã tính cách lens trên R50'
  },
  'buy-high-budget': {
    title: 'Sony A7 III cũ hoặc Canon EOS R6 cũ',
    subtitle: 'Nâng cấp thẳng lên Full-Frame chuyên nghiệp',
    price: 'Trên 26 triệu VND',
    whyBuy: 'Cảm biến Full Frame mang lại dải tương phản (Dynamic Range) vô song, khả năng thu sáng đêm vượt trội, và xóa phông quang học đỉnh cao chân thực nhất.',
    mistakes: 'Hệ thống ống kính Full-Frame đi kèm rất to, nặng và đắt đỏ.',
    recipeLink: 'shot-recipes.html',
    recipeName: 'Studio Portrait of Power (Recipe 009)'
  }
};

// === STEP STATE TRACKER ===
document.addEventListener('DOMContentLoaded', () => {
  const stepContainer = document.getElementById('gearmap-step');
  let history = []; // Array of previous node IDs for navigation

  function renderNode(nodeId) {
    const node = gearMapNodes[nodeId];
    if (!node) {
      // If it's not a node, it must be a result
      renderResult(nodeId);
      return;
    }

    let progressHtml = '';
    if (history.length > 0) {
      progressHtml = `<button class="gearmap-back-btn" id="gearmap-back">← Quay lại câu hỏi trước</button>`;
    }

    stepContainer.innerHTML = `
      <div class="gearmap-progress">
        ${progressHtml}
        <span class="gearmap-step-num">BƯỚC ${history.length + 1}</span>
      </div>
      <h2 class="gearmap-question">${node.question}</h2>
      <div class="gearmap-options">
        ${node.options.map((opt, index) => `
          <button class="gearmap-option-btn" data-index="${index}">
            ${opt.text}
          </button>
        `).join('')}
      </div>
    `;

    // Add event listeners to options
    const optionBtns = stepContainer.querySelectorAll('.gearmap-option-btn');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        const option = node.options[index];
        
        history.push(nodeId); // Push current to history
        
        if (option.result) {
          renderResult(option.result);
        } else {
          renderNode(option.next);
        }
      });
    });

    // Back button event listener
    const backBtn = document.getElementById('gearmap-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        const prevNodeId = history.pop();
        renderNode(prevNodeId);
      });
    }
  }

  function renderResult(resultId) {
    const rec = gearRecommendations[resultId];
    if (!rec) return;

    let affiliateHtml = '';
    if (rec.price.includes('triệu')) {
      affiliateHtml = `
      <div class="gearmap-affiliate-box" style="margin-top: 15px; padding: 15px; background: rgba(245, 166, 35, 0.05); border: 1px solid rgba(245, 166, 35, 0.3); border-radius: 8px; text-align: center;">
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 10px;">Để hỗ trợ LumenForge duy trì máy chủ, bạn có thể tham khảo giá mua thiết bị chính hãng tại đây:</p>
        <a href="#" onclick="alert('Affiliate Link to Shopee/Lazada/Amazon'); return false;" class="btn-primary" style="display: inline-block; padding: 8px 24px; font-size: 0.9rem; margin-right: 10px;">🛒 Check giá Shopee Mall</a>
        <a href="#" onclick="alert('Affiliate Link to B&H Photo'); return false;" class="btn-secondary" style="display: inline-block; padding: 8px 24px; font-size: 0.9rem;">📦 Check giá B&H Photo</a>
      </div>`;
    }

    stepContainer.innerHTML = `
      <div class="gearmap-result-header gear-fade-in">
        <span class="gearmap-step-num">BẢN ĐỒ QUYẾT ĐỊNH — KẾT QUẢ GỢI Ý</span>
        <h2>${rec.title}</h2>
        <p class="gearmap-result-subtitle">${rec.subtitle}</p>
        <div class="gearmap-price-tag">Giá tham khảo: ${rec.price}</div>
        ${affiliateHtml}
      </div>
      
      <div class="gearmap-result-grid gear-fade-in" style="animation-delay: 0.1s;">
        <div class="result-card">
          <h4>🎯 Vì sao đây là lựa chọn tối ưu cho bạn?</h4>
          <p>${rec.whyBuy}</p>
        </div>
        
        <div class="result-card">
          <h4>⚠️ Lỗi cần tránh / Điểm yếu</h4>
          <p>${rec.mistakes}</p>
        </div>

        <div class="result-card full-width">
          <h4>🎬 Công thức hình ảnh ứng dụng liên quan</h4>
          <p>Thiết bị này hoạt động cực kỳ hoàn hảo với công thức của chúng tôi:</p>
          <a href="${rec.recipeLink}" class="result-recipe-link" style="display:inline-block; margin-top:8px; color:var(--accent-amber); font-weight:600; text-decoration:none;">
            ${rec.recipeName} →
          </a>
        </div>
      </div>

      <div class="gearmap-actions gear-fade-in" style="animation-delay: 0.2s;">
        <button class="btn-primary" id="gearmap-reset" style="margin-top:0; max-width:280px;">Bắt đầu lại sơ đồ</button>
      </div>
    `;

    // Reset button listener
    document.getElementById('gearmap-reset').addEventListener('click', () => {
      history = [];
      renderNode('start');
    });
  }

  // Initial load
  renderNode('start');
});
