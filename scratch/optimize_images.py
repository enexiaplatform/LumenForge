import os
import glob
import re

html_files = glob.glob('e:/Antigravity project/LumenForge/*.html') + glob.glob('e:/Antigravity project/LumenForge/tools/*.html')

count = 0
for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find <img ...> tags that do not have loading="lazy"
    # Find all img tags
    img_tags = re.findall(r'<img[^>]*>', content)
    
    modified = False
    for tag in img_tags:
        if 'loading="lazy"' not in tag and 'loading=' not in tag:
            # Add loading="lazy" decoding="async" before the closing >
            new_tag = tag[:-1] + ' loading="lazy" decoding="async">'
            content = content.replace(tag, new_tag)
            modified = True
            count += 1

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Optimized images in {os.path.basename(file_path)}")

print(f"Total {count} images optimized with lazy loading.")
