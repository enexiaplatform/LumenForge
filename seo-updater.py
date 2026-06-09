import os
import glob
import re

# Dictionary mapping paths or filename patterns to specific SEO data
SEO_DATA = {
    'index.html': {
        'title': 'LumenForge | Khám phá nghệ thuật ánh sáng và nhiếp ảnh điện ảnh',
        'desc': 'LumenForge là nền tảng học thuật về nhiếp ảnh điện ảnh, cung cấp các công cụ mô phỏng ánh sáng, ống kính và công thức chụp ảnh chuyên nghiệp.',
        'keys': 'nhiếp ảnh, điện ảnh, ánh sáng, mô phỏng ánh sáng, color grading, lumenforge'
    },
    'about.html': {
        'title': 'Về LumenForge | Light Codex',
        'desc': 'Tìm hiểu về LumenForge và sứ mệnh chia sẻ kiến thức nhiếp ảnh điện ảnh, khoa học màu sắc và kỹ thuật chiếu sáng.',
        'keys': 'lumenforge, giới thiệu, tác giả, light codex, nhiếp ảnh gia'
    },
    'store.html': {
        'title': 'Cửa hàng LumenForge | Ebook & Preset Nhiếp ảnh',
        'desc': 'Khám phá các sản phẩm độc quyền từ LumenForge bao gồm Ebook The Light Codex, Cinematic Presets và các khóa học nhiếp ảnh cao cấp.',
        'keys': 'cửa hàng, ebook nhiếp ảnh, lightroom preset, khóa học nhiếp ảnh'
    },
    'gear-vault.html': {
        'title': 'Gear Vault | Thiết bị Nhiếp ảnh Khuyên dùng',
        'desc': 'Danh sách tổng hợp các thiết bị nhiếp ảnh, máy ảnh, ống kính và phụ kiện chiếu sáng tốt nhất được khuyên dùng bởi LumenForge.',
        'keys': 'thiết bị nhiếp ảnh, máy ảnh sony, ống kính sigma, đèn godox, review máy ảnh'
    },
    'tool-lab.html': {
        'title': 'Xưởng Công cụ (Tool Lab) | Mô phỏng Quang học & Ánh sáng',
        'desc': 'Hệ thống 19+ công cụ giả lập quang học, tính toán độ sâu trường ảnh, mô phỏng ánh sáng 3 điểm và color grading trực tuyến.',
        'keys': 'công cụ nhiếp ảnh, giả lập ống kính, máy tính dof, mô phỏng ánh sáng, color wheel'
    },
    'shot-recipes.html': {
        'title': 'Công thức Chụp ảnh (Shot Recipes) | Thư viện Setup',
        'desc': 'Khám phá thư viện công thức chụp ảnh chi tiết: thông số máy ảnh, sơ đồ ánh sáng và công thức chỉnh màu Lightroom.',
        'keys': 'công thức chụp ảnh, thông số máy ảnh, setup ánh sáng, lighting diagram'
    },
    'ebook-preview.html': {
        'title': 'Bản dùng thử: The Light Codex Ebook',
        'desc': 'Đọc thử chương 1 miễn phí của cuốn sách The Light Codex - Bí quyết làm chủ ánh sáng và màu sắc điện ảnh.',
        'keys': 'the light codex, ebook nhiếp ảnh, đọc thử, bí quyết ánh sáng'
    }
}

# Generic fallback
def get_seo_data(filepath):
    filename = os.path.basename(filepath)
    if filename in SEO_DATA:
        return SEO_DATA[filename]
    
    # Generate generic data based on filename
    clean_name = filename.replace('.html', '').replace('-', ' ').title()
    
    return {
        'title': f'{clean_name} | LumenForge',
        'desc': f'Khám phá chuyên sâu về {clean_name} tại LumenForge - Nền tảng kiến thức nhiếp ảnh và điện ảnh.',
        'keys': f'{clean_name.lower()}, nhiếp ảnh, điện ảnh, lumenforge, công cụ'
    }

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if meta description already exists
    has_desc = 'name="description"' in content
    has_keys = 'name="keywords"' in content
    
    if has_desc and has_keys:
        return

    data = get_seo_data(filepath)
    
    meta_tags = []
    if not has_desc:
        meta_tags.append(f'<meta name="description" content="{data["desc"]}">')
    if not has_keys:
        meta_tags.append(f'<meta name="keywords" content="{data["keys"]}">')
        
    meta_str = '\n  '.join(meta_tags) + '\n'
    
    # Insert right before </head> or after <title>
    if '<title>' in content:
        # replace title with customized title if it's generic
        # but for now just inject after title
        content = re.sub(r'(<title>.*?</title>)', r'\1\n  ' + meta_str.strip(), content, count=1, flags=re.IGNORECASE|re.DOTALL)
    elif '<head>' in content:
        content = re.sub(r'(<head>)', r'\1\n  ' + meta_str.strip(), content, count=1, flags=re.IGNORECASE)

    # Check viewport for mobile responsive
    if 'name="viewport"' not in content:
        vp = '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
        content = re.sub(r'(<head>)', r'\1\n  ' + vp, content, count=1, flags=re.IGNORECASE)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated SEO/Mobile tags for {filepath}")

if __name__ == "__main__":
    html_files = glob.glob('**/*.html', recursive=True)
    for f in html_files:
        process_file(f)
    print("Done processing all HTML files.")
