/* ============================================
   LUMENFORGE — Film Look Generator
   Mood-based film look recipe generator
   ============================================ */

(function () {
  'use strict';

  // ====================================================
  // MOOD DATABASE — 8 moods, each with rich film data
  // Written as a film photographer who has shot Kodak,
  // Fuji, and Cinestill in the field.
  // ====================================================

  const MOODS = {

    'japan-afternoon': {
      title: 'Nhật Bản buổi chiều',
      emotion: 'Bình yên, nhẹ nhàng, nên thơ — cảm giác lạc giữa một buổi chiều Kyoto',
      lens: '35mm hoặc 50mm f/1.8. Ống kính vintage (Helios 44-2, Canon FD 50mm) sẽ cho flare và bokeh xoáy rất hợp mood.',
      light: 'Golden hour — ánh nắng chiều xiên qua tán lá, tạo bóng dài và ánh sáng ấm lan tỏa. Tìm những khoảng nắng lọt qua kẽ lá (komorebi). Backlight nhẹ cho subject tạo halo quanh tóc.',
      time: 'Chiều muộn 15:30–17:00, khi nắng vàng óng nhưng chưa quá đỏ. Hoặc sáng sớm 7:00–8:30 cho ánh sáng mềm tương tự.',
      colorPalette: {
        highlight: { name: 'Warm Cream', hex: '#F5E6C8' },
        midtone: { name: 'Soft Sage', hex: '#A8B89C' },
        shadow: { name: 'Muted Lavender', hex: '#8B7E9B' },
        accent: { name: 'Peach Gold', hex: '#E8B87A' }
      },
      contrast: 'Low — giữ ảnh mềm, tránh contrast cao sẽ phá vỡ cảm giác dreamy',
      grain: 'Rất nhẹ, kiểu film Fuji C200 — grain mịn, hầu như không nhận ra ở kích thước web. Amount 15–20 trong Lightroom, Size 20.',
      whiteBalance: 'Hơi warm — 5800K đến 6200K. Tint hơi shift về magenta (+5 đến +8) để skin tone hồng hào.',
      texture: 'Giảm Clarity (-15 đến -25) để tạo cảm giác mềm kiểu film. Texture giữ nguyên hoặc giảm nhẹ (-5). Thêm chút Dehaze (-5) để tạo haze nhẹ.',
      composition: 'Để nhiều negative space — bầu trời, tường trống, lối đi. Subject nhỏ trong khung hình, đặt ở 1/3. Bắt những chi tiết nhỏ: chiếc xe đạp, cửa sổ gỗ cũ, chén trà. Chụp ngang cho cảm giác điện ảnh.',
      editing: {
        highlights: '-30',
        shadows: '+25',
        whites: '-15',
        blacks: '+10',
        saturation: '-20',
        vibrance: '+10',
        clarity: '-20',
        splitTone: 'Highlight: Peach (#E8B87A), Shadow: Lavender (#8B7E9B)'
      },
      filmStock: 'Fuji C200 hoặc Kodak ColorPlus 200 — cả hai cho tông ấm nhẹ với da tự nhiên. Fuji Pro 400H (ngưng sản xuất) là lựa chọn cổ điển nhất cho mood này.',
      avoid: 'Contrast cao, màu bão hòa, bóng đổ sắc nét. Tránh chụp giữa trưa (harsh shadow). Không dùng flash. Tránh crop quá chật — cần không gian thở.',
      proTip: 'Chụp qua rèm cửa mỏng hoặc qua tấm kính cũ sẽ tạo hiệu ứng softness tự nhiên. Nếu chụp digital, thử đặt một miếng kính lọc UV cũ (có trầy) trước ống kính.'
    },

    'saigon-rain': {
      title: 'Sài Gòn mưa',
      emotion: 'Cô đơn, trưởng thành, điện ảnh — mùi đất ướt và tiếng mưa trên mái tôn',
      lens: '35mm hoặc 50mm — đủ rộng để bắt bối cảnh phố nhưng đủ chặt để isolate subject. 28mm nếu muốn chụp wide street scene.',
      light: 'Ánh sáng khuếch tán qua mây mưa — đều, mềm, không có harsh shadow. Đèn đường và biển hiệu phản chiếu trên mặt đường ướt tạo highlight tự nhiên. Tìm ánh sáng từ cửa hàng chiếu ra vỉa hè.',
      time: 'Chiều muộn hoặc tối sớm (17:00–19:30), khi đèn đường vừa bật và trời còn chút ánh sáng xanh. Hoặc ban ngày khi mưa nặng, trời âm u — tạo mood trầm nhất.',
      colorPalette: {
        highlight: { name: 'Warm Amber', hex: '#D4A574' },
        midtone: { name: 'Muted Olive', hex: '#7A8B6F' },
        shadow: { name: 'Deep Teal', hex: '#2A4A4A' },
        accent: { name: 'Neon Reflection', hex: '#FF6B4A' }
      },
      contrast: 'Low-Medium — đủ để tách subject khỏi nền nhưng giữ vùng tối còn chi tiết',
      grain: 'Nhẹ đến trung bình, kiểu film 400 ISO — thấy được khi zoom nhưng không lấn át. Amount 25–30, Size 25 trong Lightroom.',
      whiteBalance: 'Daylight (5500K) hoặc hơi warm (5800K). Tránh quá lạnh — mưa Sài Gòn ấm, không phải mưa Bắc Âu.',
      texture: 'Giảm clarity nhẹ (-10 đến -15), thêm grain. Dehaze +5 đến +10 nếu mưa làm ảnh quá flat.',
      composition: 'Foreground có yếu tố ướt — mặt đường phản chiếu, giọt nước trên kính, xe đang chạy tạo vệt nước. Subject lệch 1/3, sử dụng leading lines từ vỉa hè hoặc mái hiên.',
      editing: {
        highlights: '-20',
        shadows: '+15',
        whites: '-10',
        blacks: '+5',
        saturation: '-15',
        vibrance: '+5',
        clarity: '-15',
        splitTone: 'Highlight: Warm Orange (#D4A574), Shadow: Teal Green (#2A4A4A)'
      },
      filmStock: 'Kodak Portra 400 hoặc Fuji Pro 400H — cả hai xử lý tông da và ánh sáng thấp tuyệt vời. Cinestill 800T nếu chụp ban đêm cho halation đèn đường đặc trưng.',
      avoid: 'Flash trực tiếp (phá hủy ánh sáng ambient), màu quá bão hòa (unnatural), contrast quá cao (mất detail trong shadow). Tránh white balance quá cool — mất cảm giác Việt Nam.',
      proTip: 'Chụp qua cửa kính có giọt nước sẽ tạo hiệu ứng bokeh rất đẹp — foreground giọt nước sẽ biến thành những đốm sáng khi mở khẩu lớn. Mang theo túi ni-lông bọc máy.'
    },

    'old-cafe': {
      title: 'Quán cà phê cũ',
      emotion: 'Ấm, hoài niệm, gần gũi — mùi cà phê phin, quạt trần quay chậm, và tiếng nhạc Trịnh',
      lens: '50mm f/1.8 hoặc 35mm — chụp trong không gian nhỏ cần ống vừa phải. 85mm nếu chụp chân dung tại bàn. Ống vintage cho character thêm phong phú.',
      light: 'Ánh sáng tự nhiên từ cửa sổ — window light một bên tạo Rembrandt lighting tự nhiên. Bóng đèn tungsten ấm treo trên trần. Tránh mix ánh sáng — chọn một nguồn chính.',
      time: 'Sáng 8:00–10:00 khi nắng xiên qua cửa sổ đẹp nhất. Hoặc chiều 14:00–16:00 khi ánh sáng dịu hơn. Tránh giữa trưa — nắng thẳng không tạo mood.',
      colorPalette: {
        highlight: { name: 'Butter Gold', hex: '#E8C87A' },
        midtone: { name: 'Coffee Brown', hex: '#8B6F47' },
        shadow: { name: 'Dark Walnut', hex: '#3A2A1A' },
        accent: { name: 'Copper Highlight', hex: '#D4956A' }
      },
      contrast: 'Medium — giữ chi tiết trong shadow nhưng để highlight ấm tự nhiên',
      grain: 'Trung bình, kiểu film Kodak Gold 200 — grain ấm, hạt tròn, tạo texture nostalgic. Amount 30–35, Size 30.',
      whiteBalance: 'Warm — 5200K đến 5600K. Tint +3 đến +5 về magenta. Nếu có bóng đèn tungsten, giữ nguyên white balance daylight để giữ tông cam ấm tự nhiên.',
      texture: 'Clarity -5 đến -10 (vừa đủ mềm, không mush). Texture +10 để giữ chi tiết vật liệu gỗ, gạch. Grain medium.',
      composition: 'Chụp chi tiết: ly cà phê bốc khói, tay cầm tách, ánh sáng trên mặt gỗ. Environmental portrait — subject ngồi bên cửa sổ, nhìn ra ngoài. Dùng foreground blur (cây nến, ly nước) để tạo depth.',
      editing: {
        highlights: '-15',
        shadows: '+20',
        whites: '-5',
        blacks: '+10',
        saturation: '-10',
        vibrance: '+8',
        clarity: '-8',
        splitTone: 'Highlight: Butter Gold (#E8C87A), Shadow: Dark Brown (#3A2A1A)'
      },
      filmStock: 'Kodak Gold 200 hoặc Kodak Portra 160 — Gold cho tông ấm đậm hơn, Portra cho da mịn hơn. Kodak Ektar 100 nếu muốn màu vivid hơn.',
      avoid: 'Flash on-camera (phá hủy ambient light hoàn toàn), ảnh quá sharp/clinical (dùng lens vintage nếu có), crop quá chật — để thấy không gian quán.',
      proTip: 'Để ý hơi nước từ tách cà phê nóng — chụp backlit sẽ thấy khói bốc lên rất đẹp. Dùng khẩu f/2–f/2.8 để giữ subject nét nhưng background mềm, vẫn đọc được bối cảnh.'
    },

    'girlfriend-portrait': {
      title: 'Chân dung người yêu',
      emotion: 'Dịu dàng, mềm mại, tình cảm — ánh nhìn thân mật, nụ cười tự nhiên',
      lens: '85mm f/1.8 là lựa chọn tốt nhất — focal length flattering cho chân dung, bokeh mềm. 50mm f/1.4 nếu chụp gần hơn, environmental. 105mm f/2.8 cho close-up.',
      light: 'Open shade — bóng râm có ánh sáng phản xạ từ mặt đất hoặc tường sáng. Golden hour backlight tạo halo quanh tóc. Window light mềm trong nhà. Overcast sky là softbox tự nhiên hoàn hảo.',
      time: 'Golden hour (giờ vàng) — 30 phút trước sunset hoặc sau sunrise. Overcast cả ngày đều đẹp. Tránh nắng giữa trưa trừ khi có shade.',
      colorPalette: {
        highlight: { name: 'Blush Pink', hex: '#F5C4B8' },
        midtone: { name: 'Soft Lilac', hex: '#C8A8D4' },
        shadow: { name: 'Muted Mauve', hex: '#7A5A6A' },
        accent: { name: 'Honey Glow', hex: '#E8C878' }
      },
      contrast: 'Low — ảnh phải mềm, da phải sáng và mịn, không có bóng đổ sắc',
      grain: 'Rất nhẹ hoặc không có — kiểu film Portra 160. Nếu thêm thì Amount 10–15 max, Size 15. Grain nặng sẽ phá texture da.',
      whiteBalance: 'Hơi warm — 5600K đến 6000K. Tint +5 đến +10 về magenta cho da hồng hào tự nhiên. Tránh tint xanh/vàng trên da.',
      texture: 'Clarity -20 đến -30 cho da mềm kiểu film. Texture -10. Có thể dùng Dehaze -5 để thêm haze dreamy nhẹ. Softening skin bằng brush cục bộ.',
      composition: 'Mắt ở 1/3 trên. Để nhiều headroom nếu subject nhìn lên. Negative space phía subject nhìn về. Chụp ở f/1.8–f/2.8 để xóa phông nhưng giữ cả hai mắt nét.',
      editing: {
        highlights: '-25',
        shadows: '+20',
        whites: '+5',
        blacks: '+15',
        saturation: '-12',
        vibrance: '+5',
        clarity: '-25',
        splitTone: 'Highlight: Blush Pink (#F5C4B8), Shadow: Soft Mauve (#7A5A6A)'
      },
      filmStock: 'Kodak Portra 160 — king of portrait film. Da tự nhiên, tông ấm nhẹ, latitude rộng. Fuji Pro 400H cho tông cool hơn, xanh hơn. Kodak Portra 400 nếu ánh sáng yếu.',
      avoid: 'On-camera flash (tạo flat lighting, mắt đỏ). Ảnh quá sharp (dùng negative clarity). Tông xanh/lạnh trên da. Background quá rối — giữ clean. Saturation quá cao trên vùng da.',
      proTip: 'Nói chuyện, kể joke, cho nghe nhạc — biểu cảm tự nhiên nhất khi subject quên mình đang bị chụp. Chụp giữa lúc cười, lúc quay đi, lúc nhìn sang — đó mới là ảnh thật.'
    },

    'street-night': {
      title: 'Street Night',
      emotion: 'Bí ẩn, năng lượng, đô thị — neon phản chiếu trên vũng nước, bóng người qua lại',
      lens: '35mm f/1.4 hoặc 28mm f/2 — cần mở khẩu lớn cho ánh sáng yếu. 50mm f/1.4 cho street portrait đêm. Lens nhanh (fast aperture) là bắt buộc.',
      light: 'Nguồn sáng nhân tạo: neon signs, biển hiệu LED, đèn đường sodium, ánh sáng từ cửa hàng. Tìm contrast giữa vùng sáng neon và bóng tối. Mặt đường ướt phản chiếu tất cả.',
      time: 'Tối 19:00–23:00. Blue hour (18:30–19:15) là lý tưởng nhất — trời còn chút xanh cobalt, đèn đã bật. Khuya hơn cho mood tối, bí ẩn hơn.',
      colorPalette: {
        highlight: { name: 'Electric Cyan', hex: '#00E5FF' },
        midtone: { name: 'Deep Navy', hex: '#0A1628' },
        shadow: { name: 'Black Void', hex: '#050510' },
        accent: { name: 'Hot Neon', hex: '#FF3366' }
      },
      contrast: 'High — embrace the darkness. Để shadow chìm sâu, highlight neon pop mạnh',
      grain: 'Trung bình đến nặng — kiểu film pushed Tri-X 400 ở ISO 1600, hoặc Cinestill 800T. Amount 35–45, Size 25–30.',
      whiteBalance: 'Cool — 3800K đến 4200K cho tông xanh đêm. Hoặc để Auto và điều chỉnh theo nguồn sáng dominant. Mỗi nguồn neon sẽ cho white balance khác nhau — chấp nhận mixed lighting.',
      texture: 'Clarity +10 đến +15 cho sharpness đô thị. Texture +15. Dehaze +5 đến +10 cho depth ban đêm. Tránh over-process — giữ tự nhiên.',
      composition: 'Leading lines từ vỉa hè, lane xe. Silhouette người đi bộ trước neon. Phản chiếu trong vũng nước, kính xe. Chụp dọc (portrait orientation) cho cảm giác claustrophobic đô thị.',
      editing: {
        highlights: '-10',
        shadows: '-20',
        whites: '+15',
        blacks: '-25',
        saturation: '+10',
        vibrance: '+15',
        clarity: '+12',
        splitTone: 'Highlight: Electric Cyan (#00E5FF), Shadow: Deep Blue (#0A1628)'
      },
      filmStock: 'Cinestill 800T — film huyền thoại cho đêm, cho halation đỏ quanh nguồn sáng. Kodak Portra 800 pushed 1 stop. Ilford HP5 pushed to 1600 cho B&W street night.',
      avoid: 'Flash trực tiếp — phá hủy atmosphere. Long exposure không kiểm soát (blur hết mọi thứ). Ảnh quá sáng — đêm phải tối. Tránh HDR — unnatural cho street.',
      proTip: 'Sau mưa là lúc tốt nhất — mặt đường ướt biến thành tấm gương phản chiếu neon, nhân đôi ánh sáng và màu sắc. ISO 800–1600 chấp nhận noise — nó thêm character cho ảnh đêm.'
    },

    'luxury-studio': {
      title: 'Luxury Studio',
      emotion: 'Sang trọng, tối giản, quyền lực — editorial fashion, product photography cao cấp',
      lens: '85mm f/1.4 hoặc 70–200mm f/2.8 cho portrait. 100mm Macro cho product. Prime lens cho sharpness tối đa. Tránh lens rẻ — optical quality quan trọng trong studio.',
      light: 'Studio strobe hoặc continuous light. One-light setup: key light 45° trên-bên, reflector bên đối diện. Clamshell lighting cho beauty. Strip softbox cho dramatic rim light.',
      time: 'Studio — không phụ thuộc thời gian. Nhưng chụp lúc mình tỉnh táo và tập trung nhất.',
      colorPalette: {
        highlight: { name: 'Clean White', hex: '#F0ECE8' },
        midtone: { name: 'Silver Steel', hex: '#8A8A98' },
        shadow: { name: 'Charcoal Black', hex: '#1A1A22' },
        accent: { name: 'Gold Accent', hex: '#C4A35A' }
      },
      contrast: 'Medium-High — sạch, sắc nét, tách subject rõ ràng khỏi background',
      grain: 'Không có hoặc cực nhẹ — studio cần ảnh sạch, sharp. ISO base (100–200). Nếu muốn film look, Amount 8–10 max.',
      whiteBalance: 'Chính xác — dùng grey card. Thường 5500K cho daylight-balanced strobe. Tint neutral (0). Skin tone phải chuẩn.',
      texture: 'Clarity 0 đến +5 cho portrait, +10 đến +15 cho product. Texture +10. Sharpening cẩn thận ở output. Frequency separation cho skin retouching nếu cần.',
      composition: 'Tối giản — less is more. Negative space nhiều. Subject centered hoặc strong off-center. Background clean: seamless paper, or solid color. Symmetry tạo cảm giác power.',
      editing: {
        highlights: '-10',
        shadows: '+5',
        whites: '+10',
        blacks: '-15',
        saturation: '-5',
        vibrance: '+3',
        clarity: '+5',
        splitTone: 'Highlight: Clean White (#F0ECE8), Shadow: Blue-Black (#1A1A22)'
      },
      filmStock: 'Kodak Portra 160 hoặc Fuji Pro 160NS (ngưng sản xuất). Trong digital, tham khảo Phase One IQ4 color science hoặc Capture One color grading. Medium format film cho ultimate quality.',
      avoid: 'Grain nặng, desaturation quá mức, filter Instagram rẻ tiền. Ảnh mờ/soft — studio phải sharp. Mixed lighting không kiểm soát. Background rối. Over-retouching da (plastic look).',
      proTip: 'Đầu tư vào ánh sáng trước khi đầu tư vào body máy. Một cây đèn tốt + modifier đúng sẽ tạo ra ảnh đẹp hơn body đắt tiền với ánh sáng dở. Học hỏi từ editorial của Vogue, Harper\'s Bazaar.'
    },

    'kodak-memory': {
      title: 'Kodak Memory',
      emotion: 'Ấm áp, vàng, ký ức tuổi thơ — album ảnh gia đình cũ, ngày hè bất tận',
      lens: '50mm f/1.8 (nifty fifty) — quen thuộc, gần gũi, giống mắt người nhìn. 28mm cho wide family scenes. Lens vintage (Pentax 50mm f/1.7, Minolta 50mm f/1.4) cho character hoàn hảo.',
      light: 'Nắng tự nhiên — overcast mềm hoặc golden hour ấm. Open shade cho ánh sáng đều. Dappled light (nắng lốm đốm qua tán lá) cực đẹp. Tránh ánh sáng nhân tạo.',
      time: 'Chiều muộn (15:00–17:30) cho ánh sáng vàng đặc trưng. Sáng sớm cho ánh sáng mềm. Cả ngày nếu trời có mây mỏng (ánh sáng khuếch tán ấm).',
      colorPalette: {
        highlight: { name: 'Sunlit Yellow', hex: '#F4D68A' },
        midtone: { name: 'Golden Ochre', hex: '#C4944A' },
        shadow: { name: 'Warm Umber', hex: '#5A3A2A' },
        accent: { name: 'Faded Red', hex: '#C87A6A' }
      },
      contrast: 'Low-Medium — mềm, faded nhẹ ở vùng đen. Blacks không bao giờ chạm absolute black',
      grain: 'Trung bình — kiểu Kodak Gold 200 hoặc Kodak Ultramax 400. Grain ấm, hạt tròn, visible nhưng pleasant. Amount 30–40, Size 30.',
      whiteBalance: 'Warm — 6000K đến 6500K. Đẩy ấm hơn thực tế. Tint +3 về magenta. Mục tiêu: mọi thứ nhuộm vàng nhẹ.',
      texture: 'Clarity -10 đến -15 (nostalgic softness). Texture -5. Dehaze -10 cho haze vintage. Fade blacks +15 đến +20 (lift black point).',
      composition: 'Candid — bắt khoảnh khắc tự nhiên, không pose. Chụp từ xa, chụp từ phía sau, chụp chi tiết tay, chân, đồ vật cũ. Framing thoáng, không crop chặt. Để ảnh kể câu chuyện.',
      editing: {
        highlights: '-15',
        shadows: '+25',
        whites: '-10',
        blacks: '+20',
        saturation: '-8',
        vibrance: '+12',
        clarity: '-12',
        splitTone: 'Highlight: Sunlit Yellow (#F4D68A), Shadow: Warm Umber (#5A3A2A)'
      },
      filmStock: 'Kodak Gold 200 — THE film stock cho mood này. Tông vàng ấm đặc trưng, da đẹp, giá rẻ. Kodak Ultramax 400 cho ánh sáng yếu hơn. Kodak Portra 400 cho premium version.',
      avoid: 'White balance lạnh (xanh), contrast cao, ảnh quá sharp/clinical. Tông xám/desaturated. Black point quá sâu (phải lift blacks). Filter quá nặng tay — subtlety is key.',
      proTip: 'Lift black point (kéo Blacks lên +15–20) là trick quan trọng nhất để tạo film fade. Kết hợp với giảm Highlights và tăng Shadows để tạo compressed dynamic range đặc trưng của film analog.'
    },

    'fuji-green': {
      title: 'Fuji Green',
      emotion: 'Tươi mát, xanh, tự nhiên — buổi sáng trong vườn, cỏ ướt sương, không khí trong lành',
      lens: '35mm hoặc 50mm cho landscape nhỏ và environmental portrait. 24mm cho wide nature. 90mm Macro cho chi tiết lá, hoa, côn trùng. Ống kính Fuji XF (nếu dùng Fujifilm) có rendering xanh rất đẹp.',
      light: 'Overcast — bầu trời mây tạo softbox tự nhiên, giữ chi tiết trong highlight và shadow. Ánh sáng sáng sớm trong vườn. Backlight qua lá cây cho hiệu ứng translucent xanh. Tránh nắng gắt.',
      time: 'Sáng sớm 6:00–9:00 khi còn sương, ánh sáng mềm và cool. Hoặc sau mưa khi mọi thứ ướt và bóng, màu xanh đậm nhất. Chiều muộn nếu trời có mây.',
      colorPalette: {
        highlight: { name: 'Morning Dew', hex: '#D4E8D0' },
        midtone: { name: 'Forest Green', hex: '#4A8B5C' },
        shadow: { name: 'Deep Moss', hex: '#2A4A30' },
        accent: { name: 'Wildflower', hex: '#E8A8B8' }
      },
      contrast: 'Low-Medium — giữ mọi thứ mềm và tự nhiên. Xanh lá cần tonal separation tinh tế',
      grain: 'Nhẹ — kiểu Fuji Superia 200 hoặc Fuji C200. Grain mịn, cool-toned. Amount 15–20, Size 20.',
      whiteBalance: 'Neutral to slightly cool — 5200K đến 5500K. Tint -3 đến -5 về green (hỗ trợ tông xanh). Không quá lạnh — vẫn cần tự nhiên.',
      texture: 'Clarity +5 để giữ chi tiết lá. Texture +10 đến +15 cho texture thực vật. Dehaze +5 nếu sương mù. Giữ sharpness medium.',
      composition: 'Lấp đầy frame bằng màu xanh. Tìm pattern trong lá, cành cây. Negative space với bầu trời overcast. Dùng depth: foreground lá mờ, subject giữa, background xanh đậm. Leading path qua vườn.',
      editing: {
        highlights: '-20',
        shadows: '+15',
        whites: '-5',
        blacks: '+5',
        saturation: '-5',
        vibrance: '+15',
        clarity: '+5',
        splitTone: 'Highlight: Morning Dew (#D4E8D0), Shadow: Deep Moss (#2A4A30)'
      },
      filmStock: 'Fuji Superia 200 hoặc Fuji C200 — base xanh nhẹ đặc trưng của Fuji. Fuji Velvia 50 (slide film) cho xanh bão hòa cực đẹp nhưng latitude hẹp. Fuji Pro 400H cho portrait trong nature.',
      avoid: 'Tông quá warm/vàng (phá hủy xanh tự nhiên). Saturation quá cao (xanh neon không tự nhiên). HDR — thiên nhiên cần subtlety. Chụp giữa trưa nắng — shadow cứng phá mood.',
      proTip: 'Trong Lightroom HSL panel: shift Green Hue về -10 (thêm emerald), tăng Green Luminance +15 (sáng hơn), giảm Yellow Saturation -10 (bớt vàng). Đây là core recipe cho Fuji green look trên digital.'
    }

  };

  // === DOM Elements ===
  const moodGrid = document.getElementById('mood-grid');
  const generateBtn = document.getElementById('generate-btn');
  const filmOutput = document.getElementById('film-output');

  // === Enable button when mood selected ===
  moodGrid.addEventListener('change', () => {
    generateBtn.disabled = false;
    generateBtn.style.opacity = '1';
  });

  // === Generate Film Look ===
  generateBtn.addEventListener('click', () => {
    const selected = document.querySelector('input[name="mood"]:checked');
    if (!selected) return;

    const mood = MOODS[selected.value];
    if (!mood) return;

    renderOutput(mood);
  });

  // === Render Output ===
  function renderOutput(mood) {
    const palette = mood.colorPalette;
    const editing = mood.editing;

    const html = `
      <div class="film-output-header">
        <h2>${mood.title}</h2>
        <p class="film-emotion">Cảm xúc: ${mood.emotion}</p>
      </div>

      <div class="film-color-palette">
        <h4>🎨 Color Palette</h4>
        <div class="color-swatches">
          ${renderSwatch(palette.highlight)}
          ${renderSwatch(palette.midtone)}
          ${renderSwatch(palette.shadow)}
          ${renderSwatch(palette.accent)}
        </div>
      </div>

      <div class="film-output-grid">
        <div class="output-card">
          <h4>📷 Lens & Camera</h4>
          <p>${mood.lens}</p>
        </div>

        <div class="output-card">
          <h4>💡 Ánh sáng</h4>
          <p>${mood.light}</p>
        </div>

        <div class="output-card">
          <h4>⏰ Thời điểm</h4>
          <p>${mood.time}</p>
        </div>

        <div class="output-card">
          <h4>🎬 Composition</h4>
          <p>${mood.composition}</p>
        </div>

        <div class="output-card">
          <h4>🎛️ Lightroom Settings</h4>
          <ul class="lr-settings-list">
            <li><span class="setting-label">Highlights</span><span class="setting-value">${editing.highlights}</span></li>
            <li><span class="setting-label">Shadows</span><span class="setting-value">${editing.shadows}</span></li>
            <li><span class="setting-label">Whites</span><span class="setting-value">${editing.whites}</span></li>
            <li><span class="setting-label">Blacks</span><span class="setting-value">${editing.blacks}</span></li>
            <li><span class="setting-label">Saturation</span><span class="setting-value">${editing.saturation}</span></li>
            <li><span class="setting-label">Vibrance</span><span class="setting-value">${editing.vibrance}</span></li>
            <li><span class="setting-label">Clarity</span><span class="setting-value">${editing.clarity}</span></li>
            <li><span class="setting-label">Split Tone</span><span class="setting-value" style="font-size:0.7rem;text-align:right;max-width:55%">${editing.splitTone}</span></li>
          </ul>
        </div>

        <div class="output-card">
          <h4>🎞️ Film Stock tham khảo</h4>
          <p>${mood.filmStock}</p>
        </div>

        <div class="output-card">
          <h4>✨ Texture & Grain</h4>
          <p><strong>Contrast:</strong> ${mood.contrast}</p>
          <p style="margin-top:8px"><strong>Grain:</strong> ${mood.grain}</p>
          <p style="margin-top:8px"><strong>Texture:</strong> ${mood.texture}</p>
        </div>

        <div class="output-card avoid-card">
          <h4>⚠️ Nên tránh</h4>
          <p>${mood.avoid}</p>
        </div>

        <div class="output-card full-width pro-tip">
          <h4>💡 Pro Tip</h4>
          <p>${mood.proTip}</p>
        </div>
      </div>
    `;

    filmOutput.innerHTML = html;
    filmOutput.style.display = 'block';

    // Scroll to output smoothly
    filmOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // === Render Swatch Helper ===
  function renderSwatch(color) {
    return `
      <div class="swatch">
        <div class="swatch-color" style="background: ${color.hex}" title="${color.name}: ${color.hex}"></div>
        <span class="swatch-name">${color.name}</span>
        <span class="swatch-hex">${color.hex}</span>
      </div>
    `;
  }

})();
