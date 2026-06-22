import os
import re

def fix_seo_tags(directory):
    html_files = []
    for root, dirs, files in os.walk(directory):
        if any(ignored in root for ignored in ['node_modules', '.git', '.vercel', 'supabase']):
            continue
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
                
    fixed_count = 0
    
    for file_path in html_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        modified = False
        
        # 1. Parse Title
        title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE | re.DOTALL)
        if not title_match:
            continue
        title_text = title_match.group(1).strip()
        
        # 2. Check and fix meta description
        desc_match = re.search(r'<meta[^>]*name=["\']description["\']', content, re.IGNORECASE)
        if not desc_match:
            desc_tag = f'\n  <meta name="description" content="Trình mô phỏng và công cụ hỗ trợ nhiếp ảnh cinematic: {title_text}.">'
            # Insert right after </title>
            content = content.replace(title_match.group(0), title_match.group(0) + desc_tag)
            modified = True
            
        # 3. Check and fix og:title
        og_title_match = re.search(r'<meta[^>]*property=["\']og:title["\']', content, re.IGNORECASE)
        if not og_title_match:
            og_title_tag = f'\n  <meta property="og:title" content="{title_text}">'
            content = content.replace(title_match.group(0), title_match.group(0) + og_title_tag)
            modified = True
            
        # 4. Check and fix og:image
        og_image_match = re.search(r'<meta[^>]*property=["\']og:image["\']', content, re.IGNORECASE)
        if not og_image_match:
            og_image_tag = '\n  <meta property="og:image" content="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop">'
            content = content.replace(title_match.group(0), title_match.group(0) + og_image_tag)
            modified = True
            
        # 5. Check and fix og:description
        og_desc_match = re.search(r'<meta[^>]*property=["\']og:description["\']', content, re.IGNORECASE)
        if not og_desc_match:
            # Get description content
            desc_content_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', content, re.IGNORECASE)
            if not desc_content_match:
                desc_content_match = re.search(r'<meta[^>]*content=["\'](.*?)["\'][^>]*name=["\']description["\']', content, re.IGNORECASE)
            
            desc_val = desc_content_match.group(1) if desc_content_match else f"Mô phỏng và công cụ hỗ trợ nhiếp ảnh cinematic: {title_text}"
            og_desc_tag = f'\n  <meta property="og:description" content="{desc_val}">'
            content = content.replace(title_match.group(0), title_match.group(0) + og_desc_tag)
            modified = True
            
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed SEO tags for: {os.path.relpath(file_path, directory)}")
            fixed_count += 1
            
    print(f"\nSEO Fix complete. Fixed {fixed_count} files.")

if __name__ == '__main__':
    directory = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    fix_seo_tags(directory)
