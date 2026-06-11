import glob
import re

files = glob.glob('*.html') + glob.glob('articles/*.html') + glob.glob('tools/*.html')
modified_count = 0

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # We want to replace <img ... > with <img loading="lazy" ... >
    # but ONLY if it doesn't already have loading="lazy"
    
    # Function to add lazy loading
    def add_lazy(match):
        img_tag = match.group(0)
        if 'loading=' not in img_tag:
            # insert loading="lazy" right after <img
            return img_tag.replace('<img', '<img loading="lazy"', 1)
        return img_tag
    
    new_content = re.sub(r'<img[^>]+>', add_lazy, content)
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        modified_count += 1

print(f"Added loading=\"lazy\" to images in {modified_count} files for SEO optimization.")
