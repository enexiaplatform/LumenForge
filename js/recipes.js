/* ==========================================================================
   LUMENFORGE — Shot Recipes Data & Rendering
   ========================================================================== */

const shotRecipes = [
  {
    id: 'rec-001',
    num: 'RECIPE 001',
    title: 'Mature Studio Avatar',
    desc: 'Chân dung chân thành, tự tin phục vụ cho profile cá nhân hoặc LinkedIn chuyên nghiệp.',
    colorAccent: '#F5A623', // Amber
    camera: 'Canon R50 hoặc máy ảnh APS-C tương đương',
    lens: 'RF 50mm f/1.8 STM hoặc Sigma 56mm f/1.4',
    light: 'Softbox lớn đặt chéo 45 độ bên trái chủ thể, hơi chếch cao hơn đầu. Tấm hắt sáng (reflector) nhẹ đặt phía đối diện để bù nhẹ vùng tối bên má.',
    background: 'Phông nền vải hoặc giấy trơn màu xám đậm, nâu đất hoặc xanh navy tối.',
    outfit: 'Sơ mi tối màu, polo lịch thiệp hoặc khoác thêm Blazer nhẹ bên ngoài.',
    pose: 'Đứng xoay vai lệch 10-15 độ so với máy ảnh. Mắt nhìn trực diện vào ống kính, cằm hơi đưa nhẹ về phía trước để làm rõ đường xương quai hàm.',
    mood: 'Mature, Trustworthy, Intelligent, Professional',
    settings: {
      aperture: 'f/2.2 đến f/2.8 (để toàn bộ khuôn mặt từ mắt đến tai đều nét căng)',
      shutter: '1/160s (tránh rung tay khi chụp trong nhà)',
      iso: '100 - 400 (giữ chất lượng file ảnh sạch nhất)',
      wb: 'Khuôn mặt ấm áp: Kéo WB thủ công khoảng 5200K - 5400K'
    },
    editing: {
      exposure: 'Cân bằng sáng vừa phải, highlights hạ nhẹ -15',
      contrast: 'Tăng nhẹ +5 để khối cơ mặt rõ nét',
      shadows: 'Bù nhẹ +10 để không bị mất chi tiết tóc tối màu',
      whites: '-5, blacks: -5 (tạo chiều sâu khối)',
      texture: '+10 (nhấn chi tiết vải áo và da mặt nam tính)',
      clarity: '-5 (làm mịn nhẹ tự nhiên vùng da mặt)',
      splitTone: 'Highlight: hơi ấm cam vàng (+5), Shadow: xanh lam lạnh rất nhẹ (+2)'
    },
    proTip: 'Đừng cười quá rộng. Hãy cười mỉm nhẹ hoặc giữ khuôn mặt thư giãn, biểu cảm tự tin qua ánh mắt. Tập trung lấy nét chính xác vào con ngươi mắt gần ống kính nhất.'
  },
  {
    id: 'rec-002',
    num: 'RECIPE 002',
    title: 'Coffee Date Film Look',
    desc: 'Bắt trọn khoảnh khắc đời thường lãng mạn của buổi hẹn hò dưới góc nhìn ấm áp, hoài niệm.',
    colorAccent: '#E8725C', // Film Red
    camera: 'Bất kỳ máy ảnh kỹ thuật số nào hoặc điện thoại Pro',
    lens: '35mm hoặc 50mm (khẩu lớn f/1.8 hoặc f/2.0)',
    light: 'Ánh sáng tự nhiên xiên từ cửa sổ quán cafe chiếu vào bên hông chủ thể.',
    background: 'Bối cảnh quán cafe ấm cúng, có kệ sách gỗ hoặc đèn vàng nhạt phía sau.',
    outfit: 'Áo cardigan len tơi màu kem, be, hoặc pastel nhẹ nhàng cổ điển.',
    pose: 'Chủ thể ngồi đối diện qua bàn cafe, tay ôm nhẹ cốc nước ấm, mắt không nhìn thẳng vào máy mà hơi cúi xuống nhìn ly nước hoặc nhìn ra cửa sổ cười nhẹ.',
    mood: 'Thân mật, Đời thường, Thơ mộng, Hơi hoài niệm',
    settings: {
      aperture: 'Mở khẩu tối đa f/1.8 hoặc f/2.0 (tạo hiệu ứng xóa phông dịu mắt)',
      shutter: '1/125s (đủ nhanh để không bị nhòe khi chủ thể cử động nhẹ)',
      iso: 'Auto ISO (giới hạn tối đa 1600)',
      wb: 'Ấm áp hoài cổ: 5600K hoặc chọn preset Cloudy'
    },
    editing: {
      exposure: 'Hơi sáng nhẹ (+0.3 EV) tạo vẻ thanh thoát',
      contrast: 'Giảm -10 (tạo chuyển vùng sáng tối dịu nhẹ)',
      shadows: 'Nâng mạnh +25 (mở rộng chi tiết vùng tối)',
      blacks: 'Nâng nhẹ +15 và kéo góc trái của Tone Curve lên một chút để tạo lớp sương bạc đặc trưng của film',
      vibrance: '+10, saturation: -8 (màu da tự nhiên, màu tổng thể hơi nhạt)',
      grain: 'Thêm grain trung bình (Amt: 25, Size: 35, Roughness: 50)'
    },
    proTip: 'Dùng một ly nước có đá hoặc bình hoa nhỏ đặt sát mép ống kính làm tiền cảnh (foreground) bị nhòa mờ, tạo chiều sâu thị giác cực kỳ nghệ thuật.'
  },
  {
    id: 'rec-003',
    num: 'RECIPE 003',
    title: 'Saigon Rainy Street',
    desc: 'Vẻ đẹp cô đơn, đậm chất điện ảnh đường phố của Sài Gòn những chiều mưa ngập tràn neon.',
    colorAccent: '#00D4AA', // Cyan
    camera: 'Máy ảnh hỗ trợ khử nhiễu ISO tốt',
    lens: '35mm f/1.8 hoặc 50mm f/1.8 (lens một tiêu cự khẩu lớn)',
    light: 'Ánh sáng tổng hợp từ đèn neon cửa hàng, đèn xe máy chiếu rọi và phản xạ trên bề mặt đường ướt.',
    background: 'Mặt đường lấp loáng nước mưa, biển hiệu neon xanh đỏ lấp lánh vùng phông nền.',
    outfit: 'Áo khoác dài màu đen hoặc áo mưa tối giản, mang theo ô (dù) trong suốt.',
    pose: 'Đi bộ tự nhiên dưới mưa, ô che nghiêng nhẹ che nửa mặt, hoặc đứng trú mưa dưới mái hiên nhìn ra dòng người xa lạ.',
    mood: 'Cô đơn, Trưởng thành, Điện ảnh, Cinematic',
    settings: {
      aperture: 'Mở khẩu tối đa f/1.8 hoặc f/2.0 để gom trọn bokeh tròn rực rỡ từ đèn xe',
      shutter: '1/80s - 1/125s (đủ để lấy được vệt mưa rơi nhẹ mà không quá nhòe)',
      iso: '800 - 1600 (chấp nhận grain nhiễu tự nhiên)',
      wb: 'Daylight hoặc lạnh nhẹ (4800K) để tôn sắc xanh neon'
    },
    editing: {
      exposure: 'Hơi thiếu sáng nhẹ (-0.3 EV)',
      contrast: 'Tăng +15 (nhấn mạnh sự sắc sảo của phản chiếu ánh sáng)',
      highlights: 'Hạ -25 (giữ chi tiết bóng neon sáng)',
      shadows: 'Kéo sâu xuống -10',
      splitTone: 'Highlight: ám sắc vàng cam ấm; Shadow: ám xanh lục-lam (Teal and Orange)',
      clarity: '-10 (tạo hiệu ứng sương mù, hơi nước khuếch tán)'
    },
    proTip: 'Đứng bên kia đường chụp qua lớp kính ướt của quán cafe hướng ra mặt đường để lấy những giọt nước mưa làm hiệu ứng lọc hình ảnh siêu thực.'
  },
  {
    id: 'rec-004',
    num: 'RECIPE 004',
    title: 'Girlfriend Portrait',
    desc: 'Tông màu nhẹ nhàng kiểu Nhật Bản tôn vinh làn da sáng bóng và nét dịu dàng tự nhiên.',
    colorAccent: '#FFB6C1', // Pinkish
    camera: 'Canon hoặc Fujifilm (nổi tiếng với skintone đẹp)',
    lens: '50mm f/1.8 hoặc Sigma 56mm f/1.4 hoặc 85mm f/1.8',
    light: 'Ánh sáng tản dịu ngoài trời vào ngày trời nhiều mây (overcast), hoặc chụp trong bóng râm dưới tán cây lớn.',
    background: 'Hậu cảnh cỏ cây xanh nhẹ hoặc tường nhà sơn trắng tối giản.',
    outfit: 'Váy linen trắng, mũ cói, phong cách nhẹ nhàng mộc mạc.',
    pose: 'Mẫu quay mặt nhìn thẳng cười tươi tự nhiên, tóc bay nhẹ trước gió, góc chụp ngang tầm mắt mẫu.',
    mood: 'Dịu dàng, Trong sáng, Tươi mát, Nhật Bản',
    settings: {
      aperture: 'f/2.0 hoặc f/2.2 (vùng nét phủ đều mắt và mũi mẫu)',
      shutter: '1/200s - 1/400s (chụp ngoài trời sáng)',
      iso: '100 (ảnh mịn nhất)',
      wb: 'Auto WB'
    },
    editing: {
      exposure: 'Tăng sáng mạnh (+0.7 EV)',
      contrast: 'Giảm mạnh -20 (ảnh cực kỳ mềm mại)',
      highlights: '-10, shadows: +15',
      whites: '+10, blacks: +10 (làm sáng bừng tấm hình nhưng hơi phẳng khối)',
      saturation: '-10, vibrance: +15',
      hslGreen: 'Hue: thiên vàng (+15), Saturation: giảm mạnh (-30), Luminance: tăng (+20) để lá cây có màu xanh úa rêu nhẹ nhàng kiểu Nhật.'
    },
    proTip: 'Tránh chụp trực tiếp dưới ánh nắng trưa gắt vì sẽ tạo bóng đổ xấu xí trên hốc mắt mẫu. Thời điểm vàng là 4h30 - 5h30 chiều.'
  },
  {
    id: 'rec-005',
    num: 'RECIPE 005',
    title: 'Product Minimal Shot',
    desc: 'Chụp sản phẩm nhỏ tối giản chuyên nghiệp, tạo cảm giác cao cấp qua góc đổ bóng rõ ràng.',
    colorAccent: '#8B5CF6', // Purple
    camera: 'Bất kỳ máy ảnh nào có thể điều khiển manual',
    lens: 'RF 35mm Macro hoặc RF 50mm f/1.8 (lens có cự ly lấy nét gần tốt)',
    light: 'Một nguồn sáng gắt (hard light - ví dụ đèn LED studio không lắp dù) đặt sát một bên hông để tạo bóng đổ dài, sắc nét trên mặt bàn.',
    background: 'Mặt phẳng xi măng xám, thớt đá hoặc bìa giấy màu pastel trung tính.',
    outfit: 'N/A (Chỉ tập trung vào sản phẩm)',
    pose: 'Đặt sản phẩm lệch 1/3 khung hình, bóng đổ kéo dài xiên sang góc đối diện tạo sự cân bằng bố cục.',
    mood: 'Minimalist, Premium, Sharp, Technical',
    settings: {
      aperture: 'f/5.6 đến f/8.0 (khép khẩu sâu để toàn bộ sản phẩm đều nét sắc sảo từng góc cạnh)',
      shutter: '1/125s (nếu cầm tay) hoặc chậm hơn trên chân máy Tripod',
      iso: '100 (đảm bảo không một hạt noise làm hỏng texture sản phẩm)',
      wb: 'Căn chuẩn theo màu thực tế của sản phẩm (sử dụng tấm thẻ xám để đo nếu có)'
    },
    editing: {
      contrast: 'Tăng +15 để làm rõ khối sản phẩm',
      highlights: '-10, shadows: -15 (nhấn mạnh bóng đổ đen)',
      sharpening: 'Tăng mạnh (+40, radius 1.0)',
      clarity: '+12 (tôn vinh chất liệu gốm, gỗ hoặc kính của sản phẩm)'
    },
    proTip: 'Đặt sản phẩm trên một tấm kính đen hoặc mica gương phản chiếu nhẹ để nhân đôi chiều sâu không gian.'
  },
  {
    id: 'rec-006',
    num: 'RECIPE 006',
    title: 'Minimalist Food Alchemy',
    desc: 'Lột tả sức hấp dẫn nguyên bản của món ăn qua góc nhìn thẳng từ trên xuống (flat lay) đậm chất tạp chí.',
    colorAccent: '#DAA520', // Goldenrod
    camera: 'Camera có màn hình lật xoay linh hoạt (như Canon R50) để dễ căn góc từ trên cao',
    lens: '35mm hoặc 24mm (tiêu cự hơi rộng một chút để lấy trọn bàn ăn)',
    light: 'Ánh sáng cửa sổ tản dịu rộng từ phía sau (backlight) hoặc bên hông (sidelight) của đĩa thức ăn.',
    background: 'Bàn gỗ thô mộc, mặt bàn giả đá tối màu hoặc khăn trải bàn linen nhăn tự nhiên.',
    outfit: 'N/A',
    pose: 'Bố cục flat lay góc vuông 90 độ thẳng đứng từ trên xuống. Sắp xếp đĩa ăn chính ở trung tâm, xung quanh là các nguyên liệu phụ (vài lá bạc hà rơi tự do, muỗng nĩa gỗ đặt nghiêng).',
    mood: 'Tự nhiên, Thơm ngon, Tinh tế, Tạp chí',
    settings: {
      aperture: 'f/4.0 hoặc f/5.6 (đảm bảo đĩa ăn nét từ viền vào trong mà không quá nhòe mất tiền cảnh bàn ăn)',
      shutter: '1/100s',
      iso: '200 - 400',
      wb: 'Hơi thiên warm (5400K) để thức ăn trông bắt mắt hơn'
    },
    editing: {
      exposure: 'Tăng sáng nhẹ (+0.2 EV)',
      contrast: 'Tăng +10',
      saturation: 'Tăng nhẹ vùng màu thức ăn (+5 cho đỏ/vàng/cam) để kích thích thị giác',
      clarity: '+5 (làm rõ cấu trúc thớ thịt hoặc bề mặt nước sốt)'
    },
    proTip: 'Quét một lớp dầu ăn mỏng lên bề mặt rau củ hoặc thịt ngay trước khi bấm máy để tạo các vệt highlight bóng loáng hấp dẫn dưới ánh sáng.'
  },
  {
    id: 'rec-007',
    num: 'RECIPE 007',
    title: 'Saigon Night Cinema Walk',
    desc: 'Chân dung đêm đường phố với lớp màu xanh ngọc pha đỏ đô kinh điển, lấy cảm hứng từ phim Vương Gia Vệ.',
    colorAccent: '#191970', // Midnight Blue
    camera: 'Bất kỳ máy ảnh kỹ thuật số nào',
    lens: '35mm f/1.8 hoặc 50mm f/1.8',
    light: 'Ánh sáng hắt từ biển quảng cáo đèn LED màu sắc của các tiệm tạp hóa nhỏ bên đường hoặc quầy đồ nướng.',
    background: 'Xe cộ Saigon qua lại nhòe ánh đèn đuôi màu đỏ, các ngõ hẻm sâu tối bí ẩn.',
    outfit: 'Áo sơ mi hoa văn vintage hơi phanh cổ, kính râm đen mắt nhỏ.',
    pose: 'Chủ thể tựa lưng vào cột đèn đường hoặc ngồi trên xe máy cũ, mắt nhìn lơ đãng đi nơi khác, điếu thuốc cháy dở trên tay (tùy chọn).',
    mood: 'Bí ẩn, Lãng mạn, Hoài cổ, Hong Kong vibe',
    settings: {
      aperture: 'Mở khẩu tối đa f/1.8 để tận dụng trọn vẹn ánh sáng yếu',
      shutter: '1/80s (chấp nhận rung nhẹ một chút để tạo cảm giác nhòe chuyển động điện ảnh)',
      iso: '1600 - 3200',
      wb: 'Để WB lạnh khoảng 4000K để bắt màu xanh biển của đêm tối'
    },
    editing: {
      contrast: 'Tăng cao +20',
      shadows: 'Kéo sâu -15',
      whites: '+10, blacks: -10 (tăng độ gắt tương phản)',
      splitTone: 'Highlight: ám xanh ngọc (Cyan) hoặc vàng chanh; Shadow: ám đỏ tía (Magenta) hoặc tím',
      grain: 'Thêm grain rất đậm (Amt: 40, Size: 45, Roughness: 60) để giả lập phim ISO cao.'
    },
    proTip: 'Hãy dùng một miếng kính lọc sương mù (Black Mist filter) lắp trước lens để làm các điểm sáng đêm tỏa ra dịu nhẹ như sương, cực kỳ ma mị.'
  },
  {
    id: 'rec-008',
    num: 'RECIPE 008',
    title: 'Minimalist Travel Look',
    desc: 'Lưu giữ chuyến đi du lịch qua những góc chụp tối giản, chú trọng vào đường nét kiến trúc và sự yên bình.',
    colorAccent: '#8FBC8F', // Muted Green
    camera: 'Thiết bị nhỏ gọn, dễ mang vác',
    lens: 'RF 16mm f/2.8 hoặc lens Kit zoom linh hoạt',
    light: 'Ánh sáng gắt trực tiếp của nắng chiều vàng lúc 4h - 5h (Golden Hour).',
    background: 'Bức tường nhà thờ cổ, đồi cát mênh mông hoặc góc phố vắng không bóng người.',
    outfit: 'Trang phục tối giản, màu trơn (đen, trắng, nâu nhạt), dáng suông rộng.',
    pose: 'Chủ thể là một điểm nhỏ trong bố cục rộng lớn (quy tắc 1/3), quay lưng đi về phía đường chân trời.',
    mood: 'Tự do, Tối giản, Yên tĩnh, Rộng mở',
    settings: {
      aperture: 'f/8.0 (khép khẩu để lấy nét vô cực rõ ràng toàn cảnh)',
      shutter: '1/320s (ngoài trời nắng)',
      iso: '100',
      wb: 'Auto WB hoặc Warm (5600K)'
    },
    editing: {
      exposure: 'Hơi sáng nhẹ (+0.1 EV)',
      contrast: 'Tăng nhẹ +5',
      highlights: '-20, shadows: +10',
      saturation: '-15, vibrance: +10 (màu sắc dịu, sang trọng)',
      hslYellow: 'Tăng nhẹ độ sáng màu vàng cát để làm nổi bật nắng chiều.'
    },
    proTip: 'Hãy tìm các đường dẫn tự nhiên trong kiến trúc (con đường, mép tường, hàng cây) để dẫn mắt người xem thẳng tới chủ thể nhỏ bé của bạn.'
  },
  {
    id: 'rec-009',
    num: 'RECIPE 009',
    title: 'Studio Portrait of Power',
    desc: 'Chân dung đen trắng tương phản cực cao, làm nổi bật đường nét sắc sảo và thần thái quyền lực.',
    colorAccent: '#333333', // Dark charcoal
    camera: 'Bất kỳ máy ảnh chuyên dụng nào',
    lens: 'RF 85mm f/1.2L hoặc 85mm f/1.8',
    light: 'Một nguồn sáng rất mạnh đặt vuông góc 90 độ một bên mặt chủ thể (Split Lighting). Bên còn lại hoàn toàn chìm trong bóng tối huyền bí.',
    background: 'Phông nền vải nhung đen hoàn toàn hấp thụ ánh sáng.',
    outfit: 'Áo cổ lọ đen ôm sát cơ thể, vest đen hoặc da.',
    pose: 'Ánh mắt sắc sảo nhìn chằm chằm vào máy ảnh, đầu hơi cúi nhẹ tạo vẻ suy tư đầy uy lực.',
    mood: 'Quyền lực, Kịch tính, Bí ẩn, Nghệ thuật',
    settings: {
      aperture: 'f/4.0 (giữ độ nét cực sắc nét từ mũi đến khóe mắt)',
      shutter: '1/160s',
      iso: '100',
      wb: 'Auto'
    },
    editing: {
      blackAndWhite: 'Bật chế độ Grayscale (Đen trắng)',
      contrast: 'Tăng mạnh (+45)',
      highlights: '+20, shadows: -30 (đẩy ranh giới sáng tối cực đại)',
      whites: '+15, blacks: -20',
      clarity: '+25 (nhấn mạnh nếp nhăn biểu cảm, khối cơ mặt)',
      vignetting: '-15 (làm tối nhẹ 4 góc ảnh)'
    },
    proTip: 'Dùng một chai xịt phun sương nước nhẹ lên tóc hoặc mặt mẫu để tạo các hạt nước li ti lấp lánh phản chiếu nguồn sáng gắt.'
  },
  {
    id: 'rec-010',
    num: 'RECIPE 010',
    title: 'Old Film Memory',
    desc: 'Giả lập hoàn hảo chất màu hoài niệm ấm áp của thước phim Kodak Gold thập niên trước.',
    colorAccent: '#CD853F', // Peru
    camera: 'Mọi thiết bị kỹ thuật số',
    lens: 'RF 50mm f/1.8 hoặc bất kỳ lens vintage xoáy tay cũ nào',
    light: 'Ánh sáng rực rỡ cuối ngày chiếu xiên lấp lánh qua tán lá xanh tạo các đốm nắng tròn.',
    background: 'Bãi cỏ lau vàng úa, sân nhà cũ ngập nắng.',
    outfit: 'Quần jeans bạc màu, áo thun retro đơn giản.',
    pose: 'Chủ thể cười tươi chạy nhảy tự nhiên hoặc ngồi dựa vào bậc cửa gỗ che mắt tránh nắng.',
    mood: 'Ấm áp, Tuổi thơ, Hoài niệm, Ký ức',
    settings: {
      aperture: 'Mở lớn f/2.0 hoặc f/2.2',
      shutter: '1/250s',
      iso: '100 - 200',
      wb: 'Rất ấm: Kéo WB lên 5800K - 6200K'
    },
    editing: {
      exposure: 'Tăng nhẹ (+0.3 EV)',
      contrast: 'Giảm nhẹ -5',
      highlights: '-15, shadows: +20',
      blacks: 'Nâng góc trái Tone Curve lên rất cao (tạo độ mờ đục sương mù cho màu đen)',
      hslYellowRed: 'Tăng bão hòa sắc cam/đỏ da mặt ấm, ngả vàng đất nhẹ',
      grain: 'Thêm grain hạt lớn và thô (Amt: 30, Size: 50, Roughness: 55)'
    },
    proTip: 'Hãy thử tìm một chiếc lens xoáy MF cổ (ví dụ Helios 44-2 58mm f/2) qua ngàm chuyển để chụp. Hiệu ứng bokeh xoáy tự nhiên sẽ làm bức ảnh film trông chân thực 100%.'
  }
];

// === Rendering Logic ===
document.addEventListener('DOMContentLoaded', () => {
  const recipesGrid = document.getElementById('recipes-grid');
  const modal = document.getElementById('recipe-modal');
  const modalContent = document.getElementById('modal-content');
  const modalClose = document.getElementById('modal-close');
  const modalOverlay = document.getElementById('modal-overlay');

  if (!recipesGrid) return;

  // Render cards
  shotRecipes.forEach((recipe, index) => {
    const card = document.createElement('div');
    card.className = 'recipe-card animate-on-scroll';
    card.style.setProperty('--recipe-accent', recipe.colorAccent);
    // Add visual delay
    card.style.animationDelay = `${index * 0.05}s`;
    
    card.innerHTML = `
      <div class="recipe-card-header">
        <span class="recipe-card-num">${recipe.num}</span>
        <span class="recipe-card-pill" style="border-color: ${recipe.colorAccent}; color: ${recipe.colorAccent}">ACTIVE</span>
      </div>
      <h3 class="recipe-card-title">${recipe.title}</h3>
      <p class="recipe-card-desc">${recipe.desc}</p>
      <div class="recipe-card-meta">
        <div class="meta-item"><span>📷 Lens</span><strong>${recipe.lens.split('hoặc')[0].trim()}</strong></div>
        <div class="meta-item"><span>💡 Light</span><strong>${recipe.light.substring(0, 32)}...</strong></div>
      </div>
      <button class="recipe-view-btn" data-id="${recipe.id}">Open Formula →</button>
      <div class="recipe-card-stripe" style="background: ${recipe.colorAccent}"></div>
    `;

    recipesGrid.appendChild(card);
  });

  // Modal Open Handler
  function openRecipeModal(recipeId) {
    const recipe = shotRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    modalContent.innerHTML = `
      <div class="recipe-detail-header" style="border-left: 4px solid ${recipe.colorAccent}">
        <span class="recipe-detail-num">${recipe.num}</span>
        <h2>${recipe.title}</h2>
        <p class="recipe-detail-summary">${recipe.desc}</p>
      </div>

      <div class="recipe-detail-grid">
        
        <!-- Left Column: Specs -->
        <div class="recipe-detail-column">
          <div class="recipe-section-card">
            <h4>📦 Thiết Bị & Bối Cảnh</h4>
            <ul class="recipe-spec-list">
              <li><strong>Camera:</strong> ${recipe.camera}</li>
              <li><strong>Ống kính khuyên dùng:</strong> ${recipe.lens}</li>
              <li><strong>Bối cảnh & Trang phục:</strong> ${recipe.background} (Mặc: ${recipe.outfit})</li>
            </ul>
          </div>

          <div class="recipe-section-card">
            <h4>💡 Sắp Đặt Ánh Sáng</h4>
            <p style="font-size: 0.9rem; line-height: 1.7; color: var(--text-secondary);">${recipe.light}</p>
          </div>

          <div class="recipe-section-card">
            <h4>🕺 Dáng Đứng & Cảm Xúc</h4>
            <p style="font-size: 0.9rem; line-height: 1.7; color: var(--text-secondary);"><strong>Mood:</strong> ${recipe.mood}</p>
            <p style="font-size: 0.9rem; line-height: 1.7; color: var(--text-secondary); margin-top: 8px;"><strong>Tạo dáng:</strong> ${recipe.pose}</p>
          </div>
        </div>

        <!-- Right Column: Setup Camera & Color -->
        <div class="recipe-detail-column">
          <div class="recipe-section-card">
            <h4>⚙️ Thông Số Máy Ảnh (Camera Setup)</h4>
            <ul class="recipe-spec-list">
              <li><strong>Khẩu độ (Aperture):</strong> ${recipe.settings.aperture}</li>
              <li><strong>Tốc độ (Shutter):</strong> ${recipe.settings.shutter}</li>
              <li><strong>Độ nhạy sáng (ISO):</strong> ${recipe.settings.iso}</li>
              <li><strong>Cân bằng trắng (WB):</strong> ${recipe.settings.wb}</li>
            </ul>
          </div>

          <div class="recipe-section-card">
            <h4>🎨 Chỉ Hướng Chỉnh Màu (Lightroom Formula)</h4>
            <ul class="recipe-spec-list">
              ${Object.entries(recipe.editing).map(([key, val]) => `
                <li><span style="text-transform: capitalize; color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.72rem;">${key}:</span> ${val}</li>
              `).join('')}
            </ul>
          </div>

          <div class="recipe-section-card pro-tip-card" style="background: rgba(245, 166, 35, 0.08); border-color: rgba(245, 166, 35, 0.2);">
            <h4 style="color: var(--accent-amber);">💡 Henry's Pro Tip</h4>
            <p style="font-size: 0.9rem; line-height: 1.7; color: var(--text-secondary);">${recipe.proTip}</p>
          </div>
        </div>

      </div>
    `;

    // Show modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock scroll
  }

  // Modal Close Handler
  function closeRecipeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scroll
  }

  // Click events
  recipesGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('recipe-view-btn')) {
      const recipeId = e.target.getAttribute('data-id');
      openRecipeModal(recipeId);
    }
  });

  modalClose.addEventListener('click', closeRecipeModal);
  modalOverlay.addEventListener('click', closeRecipeModal);

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeRecipeModal();
    }
  });
});
