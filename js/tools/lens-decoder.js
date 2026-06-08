/* ==========================================================================
   LUMENFORGE — Lens Personality Decoder Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // === Camera-Lens Database ===
  const cameraLenses = {
    'canon-r50': [
      { id: 'rf-s-18-45', name: 'RF-S 18-45mm f/4.5-6.3 IS STM (Kit)' },
      { id: 'rf-s-18-150', name: 'RF-S 18-150mm f/3.5-6.3 IS STM' },
      { id: 'rf-50-18', name: 'RF 50mm f/1.8 STM (Nifty Fifty)' },
      { id: 'rf-35-18', name: 'RF 35mm f/1.8 Macro IS STM' },
      { id: 'rf-16-28', name: 'RF 16mm f/2.8 STM' },
      { id: 'sigma-56-14', name: 'Sigma 56mm f/1.4 DC DN Contemporary' }
    ],
    'canon-r6ii': [
      { id: 'rf-24-70-28', name: 'RF 24-70mm f/2.8L IS USM (Pro Zoom)' },
      { id: 'rf-50-12', name: 'RF 50mm f/1.2L USM (Ultimate Prime)' },
      { id: 'rf-85-12', name: 'RF 85mm f/1.2L USM (Portrait Icon)' },
      { id: 'rf-50-18', name: 'RF 50mm f/1.8 STM (Budget Standard)' },
      { id: 'rf-35-18', name: 'RF 35mm f/1.8 Macro IS STM' },
      { id: 'rf-135-18', name: 'RF 135mm f/1.8L IS USM' }
    ],
    'sony-a6400': [
      { id: 'sony-16-50', name: 'E 16-50mm f/3.5-5.6 OSS (Kit)' },
      { id: 'sigma-16-14', name: 'Sigma 16mm f/1.4 DC DN Contemporary' },
      { id: 'sigma-30-14', name: 'Sigma 30mm f/1.4 DC DN Contemporary' },
      { id: 'sigma-56-14', name: 'Sigma 56mm f/1.4 DC DN Contemporary' },
      { id: 'sony-35-18', name: 'E 35mm f/1.8 OSS' },
      { id: 'sony-50-18-apsc', name: 'E 50mm f/1.8 OSS' }
    ],
    'sony-a7iv': [
      { id: 'fe-24-70-28', name: 'FE 24-70mm f/2.8 GM II (Pro Zoom)' },
      { id: 'fe-50-12', name: 'FE 50mm f/1.2 GM (Ultimate Prime)' },
      { id: 'fe-35-14', name: 'FE 35mm f/1.4 GM (Storyteller)' },
      { id: 'fe-85-14', name: 'FE 85mm f/1.4 GM (Dreamy Portrait)' },
      { id: 'fe-85-18', name: 'FE 85mm f/1.8 (Compact Portrait)' },
      { id: 'fe-135-18', name: 'FE 135mm f/1.8 GM' }
    ],
    'fuji-xs20': [
      { id: 'xf-18-55', name: 'XF 18-55mm f/2.8-4 R LM OIS (Premium Kit)' },
      { id: 'xf-35-14', name: 'XF 35mm f/1.4 R (The Classic Soul)' },
      { id: 'xf-56-12', name: 'XF 56mm f/1.2 R WR (Bokeh Master)' },
      { id: 'xf-18-120', name: 'XF 18-120mm f/4 LM PZ WR' },
      { id: 'xf-27-28', name: 'XF 27mm f/2.8 R WR (Pancake)' }
    ],
    'iphone-15pro': [
      { id: 'iphone-ultra', name: 'Camera Góc Siêu Rộng (0.5x - tương đương 13mm)' },
      { id: 'iphone-main', name: 'Camera Chính (1x - tương đương 24mm)' },
      { id: 'iphone-tele', name: 'Camera Telephoto (3x - tương đương 77mm)' }
    ],
    'samsung-s24': [
      { id: 'samsung-ultra', name: 'Camera Góc Siêu Rộng (0.6x - tương đương 13mm)' },
      { id: 'samsung-main', name: 'Camera Chính (1x - tương đương 24mm)' },
      { id: 'samsung-tele-3x', name: 'Camera Telephoto (3x - tương đương 67mm)' },
      { id: 'samsung-tele-5x', name: 'Camera Telephoto (5x - tương đương 111mm)' }
    ]
  };

  // === Cơ sở dữ liệu Hệ số Crop ===
  const cameraSpecs = {
    'canon-r50': { name: 'Canon EOS R50', crop: 1.6, type: 'APS-C' },
    'canon-r6ii': { name: 'Canon EOS R6 II', crop: 1.0, type: 'Full-frame' },
    'sony-a6400': { name: 'Sony A6400', crop: 1.5, type: 'APS-C' },
    'sony-a7iv': { name: 'Sony A7 IV', crop: 1.0, type: 'Full-frame' },
    'fuji-xs20': { name: 'Fujifilm X-S20', crop: 1.5, type: 'APS-C' },
    'iphone-15pro': { name: 'iPhone 15 Pro', crop: 'phone', type: 'Smartphone' },
    'samsung-s24': { name: 'Samsung S24 Ultra', crop: 'phone', type: 'Smartphone' }
  };

  // === Detailed Lens Personalities Database ===
  const lensPersonalities = {
    // Standard Nifty Fifty (50mm f/1.8)
    'rf-50-18': {
      name: 'RF 50mm f/1.8 STM',
      focalLength: 50,
      maxAperture: 'f/1.8',
      personality: 'Người Quan Sát Cổ Điển (The Classic Observer)',
      traits: ['Gần gũi', 'Trung thực', 'Tập trung', 'Không phô trương'],
      visualMood: 'Mang lại góc nhìn có tỷ lệ rất giống mắt người, không tạo độ méo hình (distortion) lớn. Xóa phông mềm mượt ở cự ly gần nhưng vẫn giữ được bối cảnh chân thực.',
      bestFor: [
        'Chân dung bán thân cận cảnh đầy cảm xúc',
        'Kể chuyện đời thường ở cự ly trung bình',
        'Chụp các chi tiết đắt giá trong du lịch'
      ],
      avoid: [
        'Không chụp trong không gian cực hẹp (vì tiêu cự sẽ bị hẹp trên APS-C)',
        'Tránh chụp phong cảnh góc rộng lấy toàn cảnh hoành tráng'
      ],
      commonMistakes: [
        'Đứng quá gần chủ thể trên body APS-C làm góc nhìn bị quá chật, gây ngợp.',
        'Mở khẩu tối đa f/1.8 khi chụp nhóm đông người làm người ở rìa bị mờ nét.'
      ],
      proTips: {
        'portrait': 'Đứng cách chủ thể từ 1.5m - 2m, để khẩu f/2.2 để có độ nét tối đa trên mắt mà vẫn xóa phông rất dịu dàng.',
        'street': 'Để khẩu f/2.8, dùng chế độ ưu tiên khẩu độ (Av) để phản ứng nhanh với ánh sáng thay đổi liên tục.',
        'default': 'Lens này đạt độ nét tối đa (sweet spot) từ f/2.8 đến f/4. Hãy thử khép khẩu một chút để cảm nhận sự sắc nét vượt trội.'
      }
    },
    // Sigma 56mm f/1.4 (for APS-C)
    'sigma-56-14': {
      name: 'Sigma 56mm f/1.4 DC DN Contemporary',
      focalLength: 56,
      maxAperture: 'f/1.4',
      personality: 'Bậc Thầy Bokeh (The Bokeh Alchemist)',
      traits: ['Mơ mộng', 'Sắc nét kinh ngạc', 'Tách biệt chủ thể tốt', 'Cao cấp'],
      visualMood: 'Một chiếc lens có khả năng xóa phông ấn tượng và độ sắc bén đáng kinh ngạc ngay tại f/1.4. Hậu cảnh biến thành các hạt bokeh tròn trịa, làm nổi bật chủ thể một cách ma mị.',
      bestFor: [
        'Chân dung xóa phông nghệ thuật ngoài trời',
        'Chụp ảnh đêm với hiệu ứng ánh sáng lung linh phía sau',
        'Chụp ảnh sản phẩm nhỏ cận cảnh tôn vinh chi tiết'
      ],
      avoid: [
        'Chụp kiến trúc hoặc phong cảnh đòi hỏi góc nhìn rộng bao quát',
        'Quay vlog tự cầm tay chụp mặt (vì góc nhìn quá cận)'
      ],
      commonMistakes: [
        'Chụp f/1.4 ở khoảng cách quá gần làm DoF cực mỏng, dễ bị lấy nét vào mũi thay vì mắt chủ thể.',
        'Chụp ban ngày nắng gắt tại f/1.4 mà không tăng tốc độ màn trập lên cao, dẫn đến cháy sáng.'
      ],
      proTips: {
        'portrait': 'Đặt khoảng cách chụp khoảng 2m. Để f/1.4 hoặc f/1.6, căn góc sao cho hậu cảnh có những đốm sáng (đèn đường, nắng qua kẽ lá) để tạo bokeh lung linh.',
        'avatar': 'Chụp bán thân từ ngực trở lên, hướng mắt chủ thể hơi lệch nhẹ. Khẩu f/1.8 để đảm bảo cả khuôn mặt đều rõ nét hoàn hảo.',
        'default': 'Độ nén tiêu cự ~85mm (tương đương full frame) rất tôn đường nét khuôn mặt, giúp chủ thể trông thon gọn và sang trọng hơn.'
      }
    },
    // RF 35mm f/1.8 Macro
    'rf-35-18': {
      name: 'RF 35mm f/1.8 Macro IS STM',
      focalLength: 35,
      maxAperture: 'f/1.8',
      personality: 'Nhà Kể Chuyện Đa Tài (The Versatile Storyteller)',
      traits: ['Năng động', 'Chân thực', 'Điện ảnh', 'Gần gũi'],
      visualMood: 'Mang lại góc nhìn tự nhiên, phóng khoáng nhưng vẫn tập trung. Khả năng chụp cận cảnh (macro) tuyệt vời tạo ra các bức ảnh chi tiết đầy chất thơ.',
      bestFor: [
        'Chân dung lấy góc rộng kèm bối cảnh (environmental portrait)',
        'Đời thường, ẩm thực tại quán cafe ấm cúng',
        'Quay video du lịch cầm tay nhờ chống rung ổn định'
      ],
      avoid: [
        'Chụp chân dung đặc tả khuôn mặt quá gần (dễ làm méo nhẹ các nét như mũi)'
      ],
      commonMistakes: [
        'Đứng quá xa chủ thể khi chụp chân dung xóa phông (tiêu cự 35mm đứng xa sẽ không xóa phông mạnh được).',
        'Không tận dụng tính năng Macro của ống kính để bắt các chi tiết nhỏ tinh tế.'
      ],
      proTips: {
        'travel': 'Để f/2.8 để lấy nét sâu hơn, tiến lại gần chủ thể hoặc vật thể độc đáo để tạo chiều sâu tiền cảnh.',
        'food': 'Góc chụp chéo 45 độ, mở khẩu f/2.2, tiến sát món ăn để xóa phông nhẹ nhàng phần hậu cảnh của bàn ăn.',
        'default': 'Hãy chụp sát vào chủ thể! Khoảng cách lấy nét tối thiểu rất ngắn giúp bạn khai thác những góc nhìn cận cảnh độc lạ.'
      }
    },
    // RF-S 18-45mm (Kit)
    'rf-s-18-45': {
      name: 'RF-S 18-45mm f/4.5-6.3 IS STM',
      focalLength: 18, // dynamic range
      maxAperture: 'f/4.5-6.3',
      personality: 'Người Bạn Đồng Hành Thực Tế (The Pragmatic Starter)',
      traits: ['Đa dụng', 'Nhẹ nhàng', 'Dễ tiếp cận', 'Thực tế'],
      visualMood: 'Cho chất ảnh sạch sẽ, trung thực trong điều kiện đủ sáng. Góc nhìn linh hoạt từ rộng đến cận trung, cực kỳ thích hợp cho người mới bắt đầu tìm hiểu về tiêu cự.',
      bestFor: [
        'Chụp phong cảnh du lịch ban ngày',
        'Quay video vlog hàng ngày, góc rộng cầm tay',
        'Học cách căn bố cục cơ bản'
      ],
      avoid: [
        'Chụp trong nhà thiếu sáng trầm trọng mà không có flash',
        'Mong muốn xóa phông mịt mù như các dòng lens prime khẩu lớn'
      ],
      commonMistakes: [
        'Chụp tối hoặc trong nhà để tiêu cự dài (khẩu bị khép sâu xuống f/6.3) làm ảnh bị nhiễu (noise) do ISO tăng quá cao.',
        'Mong đợi hiệu ứng lung linh trong đêm tối.'
      ],
      proTips: {
        'travel': 'Sử dụng tiêu cự 18mm ban ngày, khép khẩu f/8 để mọi chi tiết từ tiền cảnh đến hậu cảnh đều sắc nét tối đa.',
        'portrait': 'Kéo tiêu cự ra tối đa 45mm, mở khẩu lớn nhất có thể (f/6.3), đặt chủ thể cách xa hậu cảnh ít nhất 3-4m để tạo cảm giác tách nền nhẹ.',
        'default': 'Hãy tìm kiếm những bối cảnh có ánh sáng tốt. Ban ngày ngoài trời là sân chơi tuyệt vời nhất của chiếc kit lens này.'
      }
    },
    // RF-S 18-150mm
    'rf-s-18-150': {
      name: 'RF-S 18-150mm f/3.5-6.3 IS STM',
      focalLength: 18,
      maxAperture: 'f/3.5-6.3',
      personality: 'Kẻ Lữ Hành Không Giới Hạn (The Endless Explorer)',
      traits: ['Linh hoạt tối đa', 'Mạnh mẽ', 'Tiện lợi', 'Nhạy bén'],
      visualMood: 'Cho phép bạn bắt trọn khoảnh khắc từ góc siêu rộng đến siêu cận (tele) chỉ bằng một vòng xoay zoom. Khả năng nén hậu cảnh ở tiêu cự 150mm tạo ra chất điện ảnh bất ngờ.',
      bestFor: [
        'Du lịch khám phá không muốn thay lens liên tục',
        'Bắn tỉa đời thường đường phố từ khoảng cách xa',
        'Chụp phong cảnh kết hợp các chi tiết kiến trúc xa xôi'
      ],
      avoid: [
        'Chụp chân dung xóa phông trong điều kiện thiếu sáng',
        'Chụp chuyển động quá nhanh trong nhà tối'
      ],
      commonMistakes: [
        'Quên mất hiệu ứng nén tiêu cự ở 150mm làm mặt bị phẳng nếu chụp góc không chuẩn.',
        'Để tốc độ màn trập quá chậm khi zoom ra 150mm gây rung nhòe hình.'
      ],
      proTips: {
        'travel': 'Tận dụng dải tiêu cự rộng: chụp phong cảnh góc 18mm, thấy chi tiết đẹp ở xa xoay ngay lên 100-150mm để đặc tả.',
        'street': 'Đứng từ xa ở tiêu cự 85mm, chụp đời thường tự nhiên mà không làm chủ thể e ngại trước ống kính.',
        'default': 'Quy tắc tốc độ màn trập tối thiểu khi zoom ở 150mm là 1/250s để tránh hiện tượng rung tay làm mờ ảnh.'
      }
    },
    // RF 16mm f/2.8
    'rf-16-28': {
      name: 'RF 16mm f/2.8 STM',
      focalLength: 16,
      maxAperture: 'f/2.8',
      personality: 'Kẻ Phóng Đại Không Gian (The Space Expander)',
      traits: ['Kịch tính', 'Rộng mở', 'Đột phá', 'Trực diện'],
      visualMood: 'Tạo ra hiệu ứng tiêu cự cực kỳ rộng, kéo giãn các đường chéo và mở rộng không gian một cách kịch tính. Thích hợp cho những góc chụp độc đáo, mang tính điện ảnh cao.',
      bestFor: [
        'Chụp kiến trúc nội thất phóng khoáng',
        'Vlog tự quay góc cực rộng lấy trọn cảnh vật xung quanh',
        'Phong cảnh thiên nhiên hùng vĩ'
      ],
      avoid: [
        'Chụp chân dung cự ly gần (làm mặt bị méo nghiêm trọng, mũi to tai nhỏ)'
      ],
      commonMistakes: [
        'Đặt mặt chủ thể ở sát rìa khung hình làm méo mó biến dạng nghiêm trọng.',
        'Đứng quá xa chủ thể nhỏ làm họ bị lọt thỏm và mất hút vào bối cảnh.'
      ],
      proTips: {
        'street': 'Hãy cúi thấp máy xuống sát mặt đất hoặc đưa máy lên cực cao để tạo góc nhìn độc đáo, kéo dài các đường dẫn thị giác.',
        'travel': 'Đứng sát vào một chi tiết tiền cảnh thú vị (ví dụ hoa, tảng đá) để làm nổi bật chiều sâu của ảnh phong cảnh.',
        'default': 'Hãy luôn giữ camera song song với mặt đất nếu không muốn các đường thẳng của kiến trúc bị đổ xiêu vẹo.'
      }
    },
    // RF 24-70mm f/2.8
    'rf-24-70-28': {
      name: 'RF 24-70mm f/2.8L IS USM',
      focalLength: 24,
      maxAperture: 'f/2.8',
      personality: 'Chiến Binh Đa Năng Chuyên Nghiệp (The Pro Workhorse)',
      traits: ['Tin cậy', 'Chuẩn mực', 'Chính xác', 'Quyền lực'],
      visualMood: 'Chất lượng quang học đỉnh cao trên toàn dải zoom. Màu sắc tươi tắn, độ nét gai góc đặc trưng của dòng lens L cao cấp. Xóa phông mượt mà ở tiêu cự 70mm.',
      bestFor: [
        'Sự kiện chuyên nghiệp, phóng sự cưới',
        'Chân dung thương mại thời trang ngoài trời',
        'Phong cảnh thương mại chất lượng cao'
      ],
      avoid: [
        'Chụp các thể loại nghệ thuật cần sự nhỏ gọn, ẩn mình (lens rất to và nặng)'
      ],
      commonMistakes: [
        'Ỷ lại vào dải zoom mà lười di chuyển tìm góc máy độc đáo.',
        'Chụp chân dung cận mặt ở tiêu cự 24mm làm méo tỉ lệ khuôn mặt.'
      ],
      proTips: {
        'portrait': 'Zoom lên tiêu cự 70mm, mở f/2.8, đứng cách 2.5m để có tỷ lệ cơ thể đẹp nhất và phông nền được nén mượt mà.',
        'product': 'Để tiêu cự khoảng 50-70mm, khép khẩu f/4 đến f/5.6 dưới ánh sáng studio để đạt độ nét cực đại từ rìa này sang rìa kia.',
        'default': 'Đây là ống kính đa dụng tối cao. Hãy dùng tiêu cự 35mm cho ảnh đời thường có chiều sâu bối cảnh nghệ thuật.'
      }
    },
    // RF 85mm f/1.2 (or FE 85mm f/1.4)
    'rf-85-12': {
      name: 'RF 85mm f/1.2L USM',
      focalLength: 85,
      maxAperture: 'f/1.2',
      personality: 'Nghệ Sĩ Chân Dung Mộng Mơ (The Portrait Alchemist)',
      traits: ['Nổi bật', 'Quyến rũ', 'Kỳ ảo', 'Siêu thực'],
      visualMood: 'Tạo nên một thế giới siêu thực nơi chủ thể được cắt lớp và tách biệt hoàn toàn khỏi hậu cảnh bị xóa nhòa như một bức tranh sơn dầu. Bokeh tròn như bong bóng xà phòng.',
      bestFor: [
        'Chân dung nghệ thuật cao cấp',
        'Ảnh cưới nghệ thuật, thời trang Lookbook',
        'Chụp chân dung trong điều kiện thiếu sáng lung linh'
      ],
      avoid: [
        'Chụp đường phố cần sự nhanh nhẹn, nhỏ gọn',
        'Chụp kiến trúc hoặc phong cảnh góc rộng'
      ],
      commonMistakes: [
        'Chụp khẩu f/1.2 cận mặt quá mức làm một bên mắt nét còn bên kia bị mờ.',
        'Đứng quá gần trong phòng hẹp (tiêu cự 85mm đòi hỏi không gian rất rộng).'
      ],
      proTips: {
        'portrait': 'Đứng cách chủ thể 3-4m ngoài trời. Mở f/1.2, bật tính năng nhận diện mắt để máy bắt trọn độ nét hoàn hảo của ánh mắt.',
        'avatar': 'Chụp góc 3/4 khuôn mặt dưới ánh sáng dịu nhẹ (softbox hoặc cửa sổ), mở khẩu f/1.6 để tăng nhẹ vùng nét phủ hết khuôn mặt.',
        'default': 'Lens này có độ nén không gian tuyệt đẹp. Hãy tận dụng khoảng cách xa để tạo cảm giác riêng tư, tự nhiên cho mẫu.'
      }
    },
    // Sony E 35mm f/1.8 OSS / Fujifilm XF 35mm f/1.4 R
    'xf-35-14': {
      name: 'Fujifilm XF 35mm f/1.4 R',
      focalLength: 35,
      maxAperture: 'f/1.4',
      personality: 'Thi Sĩ Hoài Cổ (The Vintage Poet)',
      traits: ['Nghệ thuật', 'Hoài niệm', 'Ấm áp', 'Độc bản'],
      visualMood: 'Nổi tiếng với chất ảnh "có hồn" rất đặc trưng của Fuji. Độ tương phản nhẹ nhàng, chuyển vùng sáng tối êm ái tạo nên mood hoài cổ sâu lắng, tựa như những thước phim xưa.',
      bestFor: [
        'Chân dung đời thường đậm chất thơ cổ điển',
        'Ảnh cafe, chi tiết tĩnh vật nhỏ tĩnh lặng',
        'Chụp dạo phố buổi chiều hoàng hôn ấm áp'
      ],
      avoid: [
        'Quay video cần lấy nét tracking siêu nhanh không tiếng động (motor lấy nét thế hệ cũ hơi ồn)'
      ],
      commonMistakes: [
        'Để khẩu f/1.4 chụp phong cảnh xa làm ảnh bị soft nhẹ ở rìa.',
        'Lạm dụng f/1.4 trong nhà làm mất đi các chi tiết bối cảnh thú vị.'
      ],
      proTips: {
        'portrait': 'Đặt khẩu f/1.4 chụp chân dung trong quán cafe dưới ánh đèn vàng ấm. Khử nhiễu nhẹ để giữ chất grain tự nhiên.',
        'street': 'Chụp ở khẩu f/2.0 hoặc f/2.8 để tận dụng độ nét rìa cực tốt, bắt khoảnh khắc người đi qua vệt nắng chiều.',
        'default': 'Chiếc lens này không hoàn hảo về mặt kỹ thuật số, nhưng chính những "khuyết điểm quang học" nhẹ lại tạo nên cái hồn nghệ thuật độc bản.'
      }
    },
    // Smartphone Cameras (Universal representations)
    'iphone-main': {
      name: 'Camera Chính Smartphone (1x - tương đương 24mm)',
      focalLength: 24,
      maxAperture: 'f/1.8',
      personality: 'Người Ghi Chép Thời Đại (The Instant Chronicler)',
      traits: ['Tốc độ', 'Thực tế', 'Mọi lúc mọi nơi', 'Siêu chi tiết'],
      visualMood: 'Mang lại độ nét toàn dải cực cao nhờ thuật toán HDR thông minh. Màu sắc nịnh mắt, tương phản cao, giữ chi tiết cực tốt từ tiền cảnh đến hậu cảnh nhưng thiếu đi chiều sâu quang học thực sự.',
      bestFor: [
        'Chụp nhanh khoảnh khắc đời thường',
        'Phong cảnh du lịch ban ngày đủ sáng',
        'Tạo nội dung mạng xã hội tức thì'
      ],
      avoid: [
        'Chân dung xóa phông nghệ thuật (nếu dùng chế độ chân dung AI, viền tóc dễ bị lẹm lem nhem)',
        'Chụp ngược sáng cực gắt mà không muốn ảnh bị bẹt phẳng chi tiết'
      ],
      commonMistakes: [
        'Lạm dụng zoom số (digital zoom) làm vỡ hạt và giảm nghiêm trọng chất lượng ảnh.',
        'Đưa camera quá gần mặt chủ thể làm méo phình mũi và biến dạng tỉ lệ đầu.'
      ],
      proTips: {
        'street': 'Bật lưới bố cục (Grid), dùng góc chụp thẳng đứng để tối ưu hóa thuật toán căn thẳng đường chân trời của điện thoại.',
        'travel': 'Hạ EV xuống khoảng -0.3 đến -0.7 để giữ lại chi tiết vùng trời (highlights), tránh để máy tự động đẩy sáng quá đà gây bẹt ảnh.',
        'default': 'Hãy lau sạch camera trước khi chụp! Bụi bẩn hoặc vân tay bám trên kính điện thoại là nguyên nhân hàng đầu gây ra các vệt mờ lóe sáng xấu xí.'
      }
    }
  };

  // Fallback database for generic lenses not explicitly detailed above
  const genericLensPersonalities = {
    'ultrawide': {
      personality: 'Kẻ Phóng Đại Góc Nhìn (The Wide Challenger)',
      traits: ['Hùng vĩ', 'Drama', 'Bao quát', 'Mạnh mẽ'],
      visualMood: 'Tạo góc nhìn cực rộng làm sâu sắc thêm bối cảnh, kéo dài các đường chéo nghệ thuật.',
      bestFor: ['Phong cảnh rộng lớn', 'Kiến trúc nội thất', 'Quay vlog lấy bối cảnh'],
      avoid: ['Chân dung cận mặt'],
      commonMistakes: ['Để chủ thể ở rìa hình làm méo tỉ lệ'],
      proTips: { 'default': 'Đặt máy sát mặt đất để tạo đường dẫn perspective ấn tượng.' }
    },
    'standard': {
      personality: 'Nhà Báo Đời Thường (The Documentarian)',
      traits: ['Chân thực', 'Gần gũi', 'Tự nhiên', 'Cân bằng'],
      visualMood: 'Góc nhìn trung thực tái hiện đúng những gì mắt người cảm nhận được.',
      bestFor: ['Ảnh đời thường street life', 'Chân dung environmental', 'Ẩm thực cafe'],
      avoid: ['Các góc chụp đặc tả siêu tele từ khoảng cách quá xa'],
      commonMistakes: ['Bố cục bị loãng do không tiến sát chủ thể'],
      proTips: { 'default': 'Để khẩu f/2 đến f/2.8 để có sự cân bằng hoàn hảo giữa nét chủ thể và mờ nhẹ bối cảnh.' }
    },
    'telephoto': {
      personality: 'Kẻ Cô Lập Nghệ Thuật (The Cinematic Isolator)',
      traits: ['Nén không gian', 'Tập trung cao độ', 'Riêng tư', 'Sang trọng'],
      visualMood: 'Nén chặt khoảng cách giữa chủ thể và hậu cảnh, tạo hiệu ứng xóa phông quang học cao cấp.',
      bestFor: ['Chân dung cận cảnh bán thân', 'Bắn tỉa đời thường từ xa', 'Sự kiện sân khấu'],
      avoid: ['Chụp trong phòng nhỏ chật hẹp'],
      commonMistakes: ['Để tốc độ màn trập quá chậm làm ảnh dễ rung nhòe'],
      proTips: { 'default': 'Mở khẩu lớn nhất của lens, đứng xa chủ thể và chọn hậu cảnh có chiều sâu để phông nền tan chảy.' }
    }
  };

  // === UI Elements ===
  const cameraSelect = document.getElementById('camera-select');
  const lensSelect = document.getElementById('lens-select');
  const purposeCards = document.querySelectorAll('#purpose-cards .radio-card');
  const styleCards = document.querySelectorAll('#style-cards .radio-card');
  const decodeBtn = document.getElementById('decode-btn');
  const decoderOutput = document.getElementById('decoder-output');

  // === Set active styles on radio cards when selected ===
  function setupRadioCards(cards) {
    cards.forEach(card => {
      const input = card.querySelector('input[type="radio"]');
      
      card.addEventListener('click', (e) => {
        // Prevent trigger twice if clicked directly on input
        if (e.target !== input) {
          input.checked = true;
        }
        
        // Remove class from siblings
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
  }

  setupRadioCards(purposeCards);
  setupRadioCards(styleCards);

  // === Dynamic Lens Dropdown Populator ===
  function updateLensDropdown() {
    const selectedCamera = cameraSelect.value;
    const lenses = cameraLenses[selectedCamera] || [];
    
    lensSelect.innerHTML = '';
    
    lenses.forEach(lens => {
      const option = document.createElement('option');
      option.value = lens.id;
      option.textContent = lens.name;
      lensSelect.appendChild(option);
    });
  }

  // Initial update
  updateLensDropdown();
  
  // Update on camera change
  cameraSelect.addEventListener('change', updateLensDropdown);

  // === Decode Action ===
  decodeBtn.addEventListener('click', () => {
    const cameraVal = cameraSelect.value;
    const lensVal = lensSelect.value;
    
    // Get checked radio values
    const selectedPurposeEl = document.querySelector('input[name="purpose"]:checked');
    const selectedStyleEl = document.querySelector('input[name="style"]:checked');
    
    if (!selectedPurposeEl || !selectedStyleEl) {
      alert('Vui lòng chọn đầy đủ MỤC ĐÍCH CHỤP và PHONG CÁCH MONG MUỐN.');
      return;
    }
    
    const purposeVal = selectedPurposeEl.value;
    const styleVal = selectedStyleEl.value;
    
    const cameraInfo = cameraSpecs[cameraVal];
    let lensInfo = lensPersonalities[lensVal];
    
    // If we don't have detailed lens data, classify it based on standard criteria
    if (!lensInfo) {
      // Determine focal type
      let type = 'standard';
      if (lensVal.includes('ultra') || lensVal.includes('16')) type = 'ultrawide';
      if (lensVal.includes('tele') || lensVal.includes('85') || lensVal.includes('135') || lensVal.includes('56')) type = 'telephoto';
      
      const generic = genericLensPersonalities[type];
      
      // Build a semi-custom object
      const displayName = lensSelect.options[lensSelect.selectedIndex].text.split('(')[0].trim();
      lensInfo = {
        name: displayName,
        focalLength: type === 'ultrawide' ? 16 : (type === 'telephoto' ? 85 : 35),
        maxAperture: lensVal.includes('14') ? 'f/1.4' : (lensVal.includes('28') ? 'f/2.8' : 'f/1.8'),
        personality: generic.personality,
        traits: generic.traits,
        visualMood: generic.visualMood,
        bestFor: generic.bestFor,
        avoid: generic.avoid,
        commonMistakes: ['Lựa chọn khẩu độ hoặc khoảng cách chưa tương xứng.'],
        proTips: generic.proTips
      };
    }
    
    // Calculate equivalent focal length
    let eqFocalText = '';
    if (cameraInfo.crop === 'phone') {
      eqFocalText = `Smartphone Sensor — Thuật toán AI xử lý hình ảnh`;
    } else {
      const eqFocal = Math.round(lensInfo.focalLength * cameraInfo.crop);
      eqFocalText = `Tương đương ~${eqFocal}mm trên cảm biến Full-frame (Hệ số nhân crop: ${cameraInfo.crop}x)`;
    }

    // Purpose and style mappings
    const purposeNames = {
      'portrait': 'Chân dung',
      'travel': 'Du lịch',
      'food': 'Đồ ăn',
      'product': 'Sản phẩm',
      'street': 'Đường phố',
      'avatar': 'Ảnh đại diện'
    };
    const styleNames = {
      'cinematic': 'Điện ảnh',
      'clean': 'Trong trẻo',
      'film': 'Màu phim',
      'luxury': 'Sang trọng',
      'vintage': 'Cổ điển',
      'japanese': 'Nhật Bản',
      'moody': 'Trầm tối'
    };

    // Get specific pro tip based on selected purpose
    const proTipText = lensInfo.proTips[purposeVal] || lensInfo.proTips['default'] || 'Hãy luôn làm chủ ánh sáng và di chuyển nhiều hơn để tìm góc máy lý thú.';

    // Generate output HTML
    decoderOutput.innerHTML = `
      <div class="output-header">
        <h2 class="output-lens-name">${lensInfo.name}</h2>
        <p class="output-personality">"${lensInfo.personality}"</p>
        <div class="output-eq-focal">${eqFocalText}</div>
      </div>
      <div class="output-grid">
        <div class="output-card">
          <h4>🎭 Tính cách thị giác</h4>
          <p>${lensInfo.visualMood}</p>
        </div>
        <div class="output-card">
          <h4>✅ Phù hợp nhất cho</h4>
          <ul>
            ${lensInfo.bestFor.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="output-card">
          <h4>⚙️ Setup gợi ý (${purposeNames[purposeVal] || purposeVal})</h4>
          <p><strong>Khẩu độ lý tưởng:</strong> ${lensInfo.maxAperture === 'f/1.4' || lensInfo.maxAperture === 'f/1.8' ? 'Mở lớn f/1.8 - f/2.5' : 'Mở tối đa của lens'} để xóa phông, hoặc khép f/5.6 - f/8 để nét sâu phong cảnh.</p>
          <p><strong>Khoảng cách chụp:</strong> ${purposeVal === 'portrait' || purposeVal === 'avatar' ? '1.5m - 2.5m (Đảm bảo tỷ lệ mặt cân đối)' : 'Tùy biến linh hoạt theo bối cảnh'}.</p>
          <p><strong>Phong cách ứng dụng:</strong> Phù hợp hoàn hảo với mood màu <strong>${styleNames[styleVal] || styleVal}</strong> nhờ kết cấu hình ảnh trong trẻo.</p>
        </div>
        <div class="output-card">
          <h4>⚠️ Lỗi thường gặp</h4>
          <ul>
            ${lensInfo.commonMistakes.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="output-card">
          <h4>🎨 Cá tính Thị giác (${styleNames[styleVal] || styleVal})</h4>
          <p>Sự kết hợp giữa ống kính này và phong cách <strong>${styleNames[styleVal] || styleVal}</strong> mang lại nét đặc trưng: ${getStyleDescription(styleVal, lensInfo.name)}</p>
        </div>
        <div class="output-card pro-tip">
          <h4>💡 Pro Tip của Henry</h4>
          <p>${proTipText}</p>
        </div>
      </div>
    `;
    
    // Show and scroll to output
    decoderOutput.style.display = 'block';
    decoderOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Descriptions helper for dynamic visual personality mapping
  function getStyleDescription(style, lensName) {
    const styles = {
      'cinematic': 'Độ nén không gian điện ảnh với các mảng sáng tối có chiều sâu sâu sắc. Phù hợp chụp chiều tối muộn.',
      'clean': 'Hình ảnh trong trẻo, sắc nét tinh khiết, tối giản chi tiết thừa. Rất thích hợp làm hình ảnh cá nhân thương hiệu.',
      'film': 'Tái tạo lớp grain mịn màng, vùng shadow hơi bạc nhẹ (lifted blacks) mang cảm giác hoài cổ của những thước phim xưa.',
      'luxury': 'Độ tương phản cao, chuyển màu mượt mà đầy sang trọng, tôn vinh những nét bóng bẩy cao cấp của vật liệu hoặc trang phục.',
      'vintage': 'Cảm giác mềm mại, ấm áp tựa như ảnh chụp thập niên 90. Thích hợp chụp đời thường hoặc các quán cafe lâu đời.',
      'japanese': 'Màu sắc nhẹ nhàng hơi thiên hướng xanh lá/lam nhạt, sáng sủa, tạo cảm giác yên bình, tinh tế và thơ mộng.',
      'moody': 'Thiên hướng thiếu sáng nhẹ (low key), nhấn mạnh vào bóng tối và vệt sáng đơn độc tạo cảm giác bí ẩn, cô đơn đầy nội tâm.'
    };
    return styles[style] || 'Mang lại cảm xúc đặc trưng cho từng khuôn hình chụp.';
  }
});
