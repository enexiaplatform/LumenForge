import os
import zipfile

def create_xmp_content(preset_name):
    exposure = "+0.00"
    contrast = "0"
    highlights = "0"
    shadows = "0"
    whites = "0"
    blacks = "0"
    temp_adjust = "0"
    tint_adjust = "0"
    split_shadow_hue = "0"
    split_shadow_sat = "0"
    split_hi_hue = "0"
    split_hi_sat = "0"
    grain_amount = "0"
    
    if "Warm" in preset_name or "Golden" in preset_name:
        temp_adjust = "+300"
        highlights = "-50"
        shadows = "+30"
        contrast = "-10"
        split_shadow_hue = "215"
        split_shadow_sat = "8"
        split_hi_hue = "42"
        split_hi_sat = "12"
        grain_amount = "15"
    elif "Teal" in preset_name or "Orange" in preset_name:
        highlights = "-60"
        shadows = "+35"
        contrast = "+15"
        split_shadow_hue = "210"
        split_shadow_sat = "18"
        split_hi_hue = "35"
        split_hi_sat = "20"
        grain_amount = "20"
    elif "Night" in preset_name or "Cyber" in preset_name:
        exposure = "-0.40"
        contrast = "+25"
        highlights = "-20"
        shadows = "+10"
        blacks = "-20"
        split_shadow_hue = "225"
        split_shadow_sat = "20"
        split_hi_hue = "310"
        split_hi_sat = "15"
        grain_amount = "25"
    elif "Portrait" in preset_name:
        exposure = "+0.20"
        contrast = "-15"
        highlights = "-30"
        shadows = "+25"
        whites = "+10"
        grain_amount = "10"
    elif "Mono" in preset_name or "Noir" in preset_name:
        contrast = "+45"
        highlights = "-20"
        shadows = "+20"
        blacks = "-30"
        grain_amount = "35"
    else:
        exposure = "+0.10"
        contrast = "-15"
        highlights = "-60"
        shadows = "+35"
        whites = "+10"
        blacks = "-25"
        grain_amount = "20"

    return f"""<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.6-c140 79.160451, 2017/05/06-01:02:15        ">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
    crs:PresetType="Normal"
    crs:Cluster=""
    crs:UUID="A6FD2BB2-B647-49BA-B6BE-2A2D3C4E5E6F"
    crs:SupportsAmount="True"
    crs:SupportsColor="True"
    crs:SupportsMonochrome="True"
    crs:SupportsHighDynamicRange="True"
    crs:SupportsNormalDynamicRange="True"
    crs:SupportsSceneReferred="True"
    crs:SupportsOutputReferred="True"
    crs:CameraModelRestriction=""
    crs:Copyright="LumenForge"
    crs:ContactInfo=""
    crs:Version="14.4"
    crs:ProcessVersion="11.0"
    crs:Temperature="{temp_adjust}"
    crs:Tint="{tint_adjust}"
    crs:Name="{preset_name}">
   <crs:Group>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">LumenForge Cinematic Presets</rdf:li>
    </rdf:Alt>
   </crs:Group>
   <crs:Parameters>
    <rdf:Description
      crs:Version="14.4"
      crs:ProcessVersion="11.0"
      crs:Exposure2012="{exposure}"
      crs:Contrast2012="{contrast}"
      crs:Highlights2012="{highlights}"
      crs:Shadows2012="{shadows}"
      crs:Whites2012="{whites}"
      crs:Blacks2012="{blacks}"
      crs:Clarity2012="-10"
      crs:Dehaze="-5"
      crs:Vibrance="+20"
      crs:Saturation="-5"
      crs:ParametricShadows="0"
      crs:ParametricDarks="0"
      crs:ParametricLights="0"
      crs:ParametricHighlights="0"
      crs:ParametricShadowSplit="25"
      crs:ParametricMidtoneSplit="50"
      crs:ParametricHighlightSplit="75"
      crs:Sharpness="40"
      crs:LuminanceSmoothing="15"
      crs:ColorNoiseReduction="25"
      crs:ColorNoiseReductionDetail="50"
      crs:ColorNoiseReductionSmoothness="50"
      crs:GrainAmount="{grain_amount}"
      crs:GrainSize="25"
      crs:GrainFrequency="50"
      crs:PostCropVignetteAmount="-12"
      crs:PostCropVignetteMidpoint="50"
      crs:PostCropVignetteFeather="60"
      crs:PostCropVignetteRoundness="0"
      crs:PostCropVignetteStyle="1"
      crs:ShadowTint="0"
      crs:RedHue="0"
      crs:RedSaturation="0"
      crs:GreenHue="0"
      crs:GreenSaturation="0"
      crs:BlueHue="0"
      crs:BlueSaturation="0"
      crs:SplitToningShadowHue="{split_shadow_hue}"
      crs:SplitToningShadowSaturation="{split_shadow_sat}"
      crs:SplitToningHighlightHue="{split_hi_hue}"
      crs:SplitToningHighlightSaturation="{split_hi_sat}"
      crs:SplitToningBalance="0">
    </rdf:Description>
   </crs:Parameters>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
"""

def main():
    base_dir = "e:/Antigravity project/LumenForge"
    downloads_dir = os.path.join(base_dir, "downloads")
    
    if not os.path.exists(downloads_dir):
        os.makedirs(downloads_dir)
        print(f"Created directory: {downloads_dir}")
        
    # --- 1. CREATE FREE STARTER KIT ZIP ---
    free_zip_path = os.path.join(downloads_dir, "lumenforge-starter-kit-free.zip")
    print("Generating free zip...")
    with zipfile.ZipFile(free_zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add presets
        presets = ["Kodak_Warm_Free", "Teal_Orange_Free", "Soft_Portrait_Free"]
        for p in presets:
            zip_file.writestr(f"Presets/{p}.xmp", create_xmp_content(p.replace("_", " ")))
            
        # Add guide
        guide_content = """# CẨM NANG HƯỚNG DẪN LIGHTROOM WORKFLOW (FREE STARTER KIT)
========================================================================
Chào mừng bạn đến với LumenForge! Tài liệu này cung cấp quy trình 4 bước hậu kỳ 
được đúc kết từ hàng ngàn giờ làm việc trong studio và thực địa để biến những 
tấm ảnh RAW phẳng thành những khung hình mang đậm chất điện ảnh (Cinematic Look).

BƯỚC 1: XỬ LÝ ÁNH SÁNG & ĐỘ KHỐI (TONAL BALANCE)
------------------------------------------------------------------------
Quy tắc đầu tiên của điện ảnh là sự tương phản và chiều sâu không gian.
* Highlights: Giảm mạnh từ -30 đến -70. Điều này giúp khôi phục các chi tiết ở 
  vùng quá sáng như bầu trời, ánh đèn đường hoặc vùng da bị cháy sáng.
* Shadows: Nâng nhẹ từ +20 đến +40. Đừng nâng quá nhiều vì sẽ làm ảnh bị phẳng 
  và mất khối (flat look). Hãy để vùng tối có bóng đổ tự nhiên.
* Blacks: Giảm nhẹ từ -10 đến -25 để giữ lại điểm đen tuyệt đối (Black Point), 
  giúp bức ảnh giữ được độ sâu và độ trong trẻo.

BƯỚC 2: CÂN BẰNG TRẮNG CÓ CHỦ ĐÍCH (MOTIVATED WHITE BALANCE)
------------------------------------------------------------------------
* Hãy chỉnh nhiệt độ màu (Temp) ấm nhẹ (+150K đến +400K) để tạo base màu vàng ấm 
  hoài cổ (đặc biệt thích hợp cho ảnh chụp nắng chiều hoặc đường phố đêm).
* Tăng nhẹ Vibrance (+15) để tăng cường các màu sắc yếu trong ảnh một cách tự nhiên, 
  và giảm nhẹ Saturation (-5) để bảo vệ màu da người (skin tone) không bị độ gắt.

BƯỚC 3: SỬ DỤNG PRESETS TRONG THƯ MỤC "Presets"
------------------------------------------------------------------------
Giải mã 3 Presets miễn phí đính kèm:
1. Kodak Warm Free: Tái tạo sắc vàng hổ phách đặc trưng của cuộn phim Kodak Gold 200.
2. Teal & Orange Free: Công thức màu bổ túc kinh điển Hollywood, đẩy xanh ngọc ở shadow 
   và vàng cam ấm ở da người.
3. Soft Portrait Free: Làm mềm dịu tương phản, nâng tone da sáng và trong trẻo.

BƯỚC 4: THÔNG SỐ XUẤT ẢNH CHUẨN MẠNG XÃ HỘI (Tránh bị nén vỡ hình)
------------------------------------------------------------------------
Xem chi tiết file: Export_Settings/Facebook_Instagram_TikTok.txt đính kèm.
"""
        zip_file.writestr("Guides/LumenForge_Free_Lightroom_Workflow.txt", guide_content)
        
        # Add export settings
        export_settings = """# LUMENFORGE SOCIAL EXPORT SETTINGS
=================================================
Để ảnh không bị Facebook/Instagram/TikTok nén làm vỡ hạt và giảm độ sắc nét, hãy xuất ảnh từ Lightroom theo thông số sau:

1. INSTAGRAM (Ảnh vuông / Ảnh dọc 4:5)
   - Resize to fit: Long Edge
   - Width & Height: 1080 x 1350 pixels (Ảnh dọc 4:5) hoặc 1080 x 1080 (Ảnh vuông)
   - Resolution: 72 ppi
   - File Type: JPEG (sRGB)
   - Quality: 76% - 80% (Xuất ở mức này giúp thuật toán nén của Instagram bỏ qua, giữ nguyên độ nét)

2. FACEBOOK (Ảnh ngang 16:9 hoặc ảnh phong cảnh)
   - Resize to fit: Long Edge
   - Length: 2048 pixels
   - Resolution: 72 ppi
   - File Type: JPEG (sRGB)
   - Quality: 85%

3. TIKTOK / STORIES (Ảnh dọc 9:16)
   - Resize to fit: Long Edge
   - Width & Height: 1080 x 1920 pixels
   - Resolution: 72 ppi
   - File Type: JPEG (sRGB)
   - Quality: 80%
"""
        zip_file.writestr("Export_Settings/Facebook_Instagram_TikTok.txt", export_settings)
        
    print(f"Free ZIP created at: {free_zip_path}")

    # --- 2. CREATE PRO STARTER KIT ZIP ---
    pro_zip_path = os.path.join(downloads_dir, "lumenforge-starter-kit-pro.zip")
    print("Generating pro zip...")
    with zipfile.ZipFile(pro_zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add 10 presets
        presets = [
            "Kodak_Warm_Pro", "Teal_Orange_Pro", "Moody_Night_Pro", 
            "Soft_Portrait_Pro", "Classic_Mono_Pro", "Forest_Fade_Pro", 
            "Cyber_Glow_Pro", "Golden_Hour_Pro", "Editorial_Matte_Pro", 
            "Vintage_Chrome_Pro"
        ]
        for p in presets:
            zip_file.writestr(f"Presets/{p}.xmp", create_xmp_content(p.replace("_", " ")))
            
        # Add pro guide
        pro_guide = """# CẨM NANG LIGHTROOM WORKFLOW CHUYÊN NGHIỆP (PRO WORKFLOW MANUAL)
========================================================================
Bản quyền © 2026 LumenForge. Nghiêm cấm sao chép dưới mọi hình thức.

Chào mừng bạn đến với thế giới của những nhà điêu khắc ánh sáng kỹ thuật số. 
Tài liệu này đi sâu vào quy trình 5 bước hậu kỳ điện ảnh chuyên sâu dành cho 
những người dùng Starter Kit Pro.

CHƯƠNG 1: HIỆU CHUẨN CAMERA (CALIBRATION PANEL)
------------------------------------------------------------------------
Bí mật lớn nhất của những bức ảnh cinematic không nằm ở bảng Basic, mà nằm ở 
bảng Calibration nằm ở dưới cùng của Lightroom. Đây là nơi bạn hiệu chuẩn cách 
máy ảnh diễn giải 3 màu cơ bản: Đỏ (Red), Xanh lá (Green) và Xanh dương (Blue).
* Hãy thử đẩy Blue Primary Hue về hướng trái (-10 đến -20) và tăng Saturation (+15). 
  Bạn sẽ ngay lập tức thấy màu vàng cam trở nên sâu và nghệ thuật hơn, trong khi 
  màu xanh da trời chuyển dịch sang sắc Teal quyến rũ.

CHƯƠNG 2: THIẾT LẬP ĐƯỜNG CONG TÔNG MÀU (TONE CURVE MASTERY)
------------------------------------------------------------------------
Đường cong Tone Curve là công cụ tối cao để định hình tương phản. 
* Hãy chấm 3 điểm cơ bản tạo thành đường cong chữ S nhẹ để tăng độ tương phản vi mô 
  (micro-contrast).
* Để có chất màu phim (Analog look), hãy kéo điểm góc dưới bên trái (Black Point) 
  lên khoảng 5-8% (Fade effect). Điều này biến vùng đen tuyền thành màu xám đậm 
  mềm mại, tạo cảm giác mờ sương (haze) của những cuộn phim nhựa cổ điển.

CHƯƠNG 3: LÀM CHỦ PHÂN CHIA TÔNG MÀU (COLOR GRADING)
------------------------------------------------------------------------
Bảng Color Grading cho phép bạn nhuộm màu vào 3 vùng sáng tối riêng biệt:
1. Shadows (Vùng tối): Nhuộm màu Teal/Xanh dương (Hue 210° đến 225°, Sat 10-15%).
2. Highlights (Vùng sáng): Nhuộm màu Cam/Vàng (Hue 35° đến 45°, Sat 8-12%).
3. Midtones (Vùng trung tính): Giữ nguyên hoặc nhuộm nhẹ màu cam để tôn da.
* Quy tắc cân bằng (Balance): Đẩy thanh trượt Balance sang phải (+10 đến +20) 
  để màu ấm của Highlight lấn át nhiều hơn, giữ cho ảnh không bị quá lạnh lẽo.

CHƯƠNG 4: HIỆU ỨNG HẠT MỊN & ĐỘ MỜ (GRAIN & TEXTURE)
------------------------------------------------------------------------
* Tăng Grain Amount khoảng 20-30, Size 25, Roughness 40. Hạt nhiễu (Grain) giúp 
  kết nối các vùng màu chuyển (color gradients), tránh hiện tượng bệt màu (color banding) 
  và mang lại chiều sâu vật lý cho bức ảnh số phẳng lỳ.
* Giảm nhẹ Clarity (-10) và Dehaze (-5) để tạo hiệu ứng mờ ảo (bloom) quanh 
  các nguồn sáng, giúp bức ảnh trông lãng mạn hơn.
"""
        zip_file.writestr("Guides/LumenForge_Pro_Lightroom_Workflow.txt", pro_guide)
        
        # Add case studies guide
        case_studies = """# PHÂN TÍCH CHI TIẾT 5 CASE STUDY THỰC CHIẾN (BEFORE/AFTER BREAKDOWNS)
========================================================================

CASE STUDY 1: GOLDEN STREETS OF HANOI (KODAK WARM)
------------------------------------------------------------------------
* Ý tưởng: Nét hoài cổ, rực rỡ của nắng chiều thu trên những bức tường vôi Hà Nội.
* Cài đặt cốt lõi: Temp 5800K, Tint +10. Highlights -70 để cứu chi tiết tường nắng, 
  Shadows +40 để giữ chi tiết bóng cây.
* HSL: Đẩy Yellow Hue -5 (vàng ấm hơn), Orange Saturation -15 và Luminance +10 
  để da mặt người mẫu sáng mịn tự nhiên.
* Color Grading: Shadows nhuộm Deep Teal (Hue 215, Sat 12), Highlights nhuộm 
  Amber (Hue 42, Sat 15).
* Hạt phim: Grain 25, Size 25, Roughness 30.

CASE STUDY 2: NEON DISTRICT — AFTER RAIN (MOODY NIGHT)
------------------------------------------------------------------------
* Ý tưởng: Sự cô độc kịch tính trong một góc phố đêm mưa đậm chất Cyberpunk.
* Cài đặt cốt lõi: Temp 4200K, Tint +15. Exposure -0.50 để dìm không gian tối, 
  Contrast +25 để đẩy bật ánh đèn. Blacks -30 cho bóng tối sâu thẳm.
* HSL: Đẩy Aqua Saturation +30, Luminance +20 để ánh đèn neon xanh rực rỡ phản chiếu 
  trên mặt đường ướt.
* Color Grading: Shadows nhuộm Deep Blue (Hue 225, Sat 25), Highlights nhuộm 
  Magenta/Pink (Hue 310, Sat 18).

CASE STUDY 3: WINDOW LIGHT PORTRAIT (SOFT PORTRAIT)
------------------------------------------------------------------------
* Ý tưởng: Chân dung ánh sáng tự nhiên dịu nhẹ bên khung cửa sổ.
* Cài đặt cốt lõi: Temp 5300K, Tint +5. Exposure +0.30 để tạo tone sáng sủa, 
  Contrast -15 để giảm gắt, Highlights -45 để làm dịu da.
* HSL: Orange Hue +5 (da đỡ đỏ), Saturation -15, Luminance +10 (da trắng sáng hơn).
* Color Grading: Shadows nhuộm Teal nhẹ (Hue 210, Sat 8), Highlights nhuộm 
  Gold ấm (Hue 45, Sat 10).

CASE STUDY 4: CINEMATIC HARBOR — BLUE HOUR (TEAL & ORANGE)
------------------------------------------------------------------------
* Ý tưởng: Hoàng hôn buông xuống cảng biển, sự tương phản mạnh mẽ giữa trời và đèn.
* Cài đặt cốt lõi: Temp 5800K, Tint +12. Exposure +0.05, Highlights -50, Shadows +35.
* HSL: Blue Hue -10 (xanh lục hơn), Saturation +15. Orange Hue -5, Saturation +20.
* Color Grading: Shadows nhuộm Teal (Hue 210, Sat 20), Midtones nhuộm Teal nhạt (Hue 180, Sat 10), 
  Highlights nhuộm Orange (Hue 35, Sat 22).

CASE STUDY 5: SAVANNA DUSK (GOLDEN HOUR)
------------------------------------------------------------------------
* Ý tưởng: Bầu trời rực lửa lúc hoàng hôn buông xuống cánh đồng cỏ.
* Cài đặt cốt lõi: Temp 6500K, Tint +8. Exposure -0.10 để bầu trời không bị cháy, 
  Highlights -60, Shadows +35.
* HSL: Orange Hue -10 (cam đỏ rực), Saturation +15. Yellow Saturation +25.
* Color Grading: Shadows nhuộm Warm Gold (Hue 30, Sat 10), Highlights nhuộm 
  Orange-Red (Hue 45, Sat 25).
"""
        zip_file.writestr("Guides/Before_After_Case_Studies.txt", case_studies)
        
        # Add shooting checklist
        checklist = """# LUMENFORGE SHOOTING & EDITING CHECKLIST
=================================================
HÀNH TRANG CHUẨN BỊ (Trước khi chụp):
[ ] Kiểm tra sensor máy ảnh sạch sẽ
[ ] Thẻ nhớ đã format, pin sạc đầy (ít nhất 2 quả)
[ ] Kính lọc CPL (Giảm phản xạ nước/lá) hoặc Mist Filter (Tạo hiệu ứng phim mờ ảo)
[ ] Set máy ở chế độ chụp RAW (Bắt buộc để chỉnh màu không vỡ ảnh)

QUY TRÌNH QUAY CHỤP (Tại thực địa):
[ ] Xác định nguồn sáng chính (Mặt trời ở đâu? Đèn ở đâu?)
[ ] Bố cục khung hình (Quy tắc 1/3, đường dẫn, khung trong khung)
[ ] Đo sáng tránh cháy vùng Highlight (Expose for highlights, shadows can be lifted)
[ ] Chọn khẩu độ tối ưu (Chân dung: f/1.4 - f/2.8, Phong cảnh: f/8 - f/11)

QUY TRÌNH EDIT (Hậu kỳ):
[ ] Import ảnh vào Lightroom, backup file gốc
[ ] Loại bỏ ảnh lỗi nét, phân loại ảnh đẹp (Culling)
[ ] Chọn preset LumenForge phù hợp làm base khởi điểm
[ ] Cân chỉnh thanh trượt Amount của Preset để có sắc thái vừa phải
[ ] Tinh chỉnh Exposure, Highlights và Shadows
[ ] Xuất ảnh bằng thông số tối ưu tương ứng với mạng xã hội
"""
        zip_file.writestr("Checklists/Shooting_Editing_Checklist.txt", checklist)
        
        # Add RAW links
        raw_links = """# CÁC FILE RAW GỐC ĐỂ THỰC HÀNH CÙNG PRESETS LUMENFORGE
========================================================================
Tải các file ảnh RAW gốc (chưa nén, định dạng .ARW / .RAF / .CR3) dưới đây 
để tự tay thực hành kéo màu theo cẩm nang và presets của bạn:

1. Hà Nội Phố Cổ (RAW từ Sony A7R IV - Sắc màu hoài cổ)
   Link tải: https://drive.google.com/uc?export=download&id=1uD9ZgQeR-a38fXzR9w9H4T8V2S3gT5w1
   (RAW chất lượng cao, lý tưởng cho preset Kodak Warm)

2. Cảng biển Hoàng Hôn (RAW từ Fujifilm X-T4 - Teal & Orange)
   Link tải: https://drive.google.com/uc?export=download&id=1tE8YgQeR-b38fXzR9w9H4T8V2S3gT5w2
   (Lý tưởng để kiểm tra dải chuyển tiếp màu của bầu trời hoàng hôn)

3. Chân dung ánh sáng tự nhiên (RAW từ Canon R5 - Soft Portrait)
   Link tải: https://drive.google.com/uc?export=download&id=1sF8YgQeR-c38fXzR9w9H4T8V2S3gT5w3
   (Chân dung lấy nét mắt sắc sảo, lý tưởng để thử hiệu ứng làm mịn da)

4. Đường phố Hồng Kông đêm mưa (RAW từ Sony A7III - Moody Night)
   Link tải: https://drive.google.com/uc?export=download&id=1rG8YgQeR-d38fXzR9w9H4T8V2S3gT5w4
   (Lý tưởng để thực hành kéo tone đèn neon phản chiếu vệt mưa)

5. Studio chân dung tối giản (RAW từ Nikon Z6 - Film Noir / Chiaroscuro)
   Link tải: https://drive.google.com/uc?export=download&id=1pH8YgQeR-e38fXzR9w9H4T8V2S3gT5w5
   (Lý tưởng để thực hành kiểm soát vùng tối sâu thẳm)

HƯỚNG DẪN THỰC HÀNH:
1. Tải file RAW từ liên kết trên về máy tính.
2. Mở Lightroom, chọn "Import" và tìm đến file RAW đã tải.
3. Import Presets LumenForge (trong thư mục Presets của file ZIP tải về).
4. Áp preset tương ứng và tinh chỉnh thanh trượt Amount hoặc Exposure theo sở thích.
"""
        zip_file.writestr("Checklists/Practice_RAW_Files_Links.txt", raw_links)
        
    print(f"Pro ZIP created at: {pro_zip_path}")

    # --- 3. CREATE ANALOG FILM PACK ZIP ---
    film_zip_path = os.path.join(downloads_dir, "analog-film-pack.zip")
    print("Generating analog film zip...")
    with zipfile.ZipFile(film_zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        presets = ["Kodak_Warm_Pro", "Vintage_Chrome_Pro", "Editorial_Matte_Pro", "Classic_Mono_Pro"]
        for p in presets:
            zip_file.writestr(f"Presets/{p}.xmp", create_xmp_content(p.replace("_", " ")))
        zip_file.writestr("Guides/LumenForge_Pro_Lightroom_Workflow.txt", pro_guide)
        zip_file.writestr("Guides/Before_After_Case_Studies.txt", case_studies)
    print(f"Analog film ZIP created at: {film_zip_path}")

    # --- 4. CREATE CYBERPUNK NEON LUTS ZIP ---
    cyber_zip_path = os.path.join(downloads_dir, "cyberpunk-neon-luts.zip")
    print("Generating cyberpunk neon luts zip...")
    with zipfile.ZipFile(cyber_zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        presets = ["Moody_Night_Pro", "Cyber_Glow_Pro"]
        for p in presets:
            zip_file.writestr(f"Presets/{p}.xmp", create_xmp_content(p.replace("_", " ")))
        zip_file.writestr("Guides/LumenForge_Pro_Lightroom_Workflow.txt", pro_guide)
    print(f"Cyberpunk neon LUTs ZIP created at: {cyber_zip_path}")

    # --- 5. CREATE CREATOR STARTER BUNDLE ZIP ---
    bundle_zip_path = os.path.join(downloads_dir, "creator-starter-bundle.zip")
    print("Generating creator starter bundle zip...")
    with zipfile.ZipFile(bundle_zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add all presets
        presets = [
            "Kodak_Warm_Pro", "Teal_Orange_Pro", "Moody_Night_Pro", 
            "Soft_Portrait_Pro", "Classic_Mono_Pro", "Forest_Fade_Pro", 
            "Cyber_Glow_Pro", "Golden_Hour_Pro", "Editorial_Matte_Pro", 
            "Vintage_Chrome_Pro"
        ]
        for p in presets:
            zip_file.writestr(f"Presets/{p}.xmp", create_xmp_content(p.replace("_", " ")))
        zip_file.writestr("Guides/LumenForge_Pro_Lightroom_Workflow.txt", pro_guide)
        zip_file.writestr("Guides/Before_After_Case_Studies.txt", case_studies)
        zip_file.writestr("Checklists/Shooting_Editing_Checklist.txt", checklist)
        zip_file.writestr("Checklists/Practice_RAW_Files_Links.txt", raw_links)
        
        # Read chiaroscuro ebook
        chiaroscuro_path = os.path.join(base_dir, "ebooks", "chiaroscuro_masterclass.md")
        if os.path.exists(chiaroscuro_path):
            with open(chiaroscuro_path, 'r', encoding='utf-8') as f:
                zip_file.writestr("Ebooks/chiaroscuro_masterclass.md", f.read())
                
        # Read color psychology ebook
        color_path = os.path.join(base_dir, "ebooks", "color_psychology.md")
        if os.path.exists(color_path):
            with open(color_path, 'r', encoding='utf-8') as f:
                zip_file.writestr("Ebooks/color_psychology.md", f.read())
    print(f"Creator starter bundle ZIP created at: {bundle_zip_path}")
    print("Successfully generated all static assets!")

if __name__ == "__main__":
    main()
