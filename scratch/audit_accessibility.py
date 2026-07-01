import os
import glob
import re

def audit_accessibility():
    html_files = glob.glob('*.html')
    modified_count = 0
    img_fixed_count = 0
    
    # Regex to find <img ...>
    img_pattern = re.compile(r'<img\s+[^>]*>')
    # Regex to check if alt attribute exists
    alt_pattern = re.compile(r'alt\s*=\s*(["\'])(.*?)\1', re.IGNORECASE)

    for filepath in html_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = content
        
        # Find all images
        def replace_img(match):
            nonlocal img_fixed_count
            img_tag = match.group(0)
            
            # Check if alt exists
            alt_match = alt_pattern.search(img_tag)
            
            if not alt_match:
                # Add alt attribute before the closing >
                new_img = img_tag[:-1] + ' alt="LumenForge Cinematic Asset">'
                img_fixed_count += 1
                return new_img
            elif alt_match.group(2).strip() == '':
                # Alt exists but is empty, replace it
                new_img = img_tag.replace(alt_match.group(0), 'alt="LumenForge Cinematic Asset"')
                img_fixed_count += 1
                return new_img
            else:
                return img_tag

        new_content = img_pattern.sub(replace_img, content)

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            modified_count += 1
            print(f"Fixed A11y in {filepath}")

    print(f"\nAccessibility Audit Complete!")
    print(f"Files Modified: {modified_count}")
    print(f"Images Fixed (Missing/Empty Alt): {img_fixed_count}")

if __name__ == '__main__':
    audit_accessibility()
