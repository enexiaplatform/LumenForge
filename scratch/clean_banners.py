import os
import glob
import re

def clean_banners():
    html_files = glob.glob('*.html')
    modified_count = 0
    
    # Regex to match the Promo Banner chunk
    # Allowing for whitespace variations
    banner_pattern = re.compile(
        r'<!-- ============================================================\s*'
        r'PROMO BANNER — Starter Kit\s*'
        r'============================================================ -->\s*'
        r'<div style="background: var\(--accent-cyan\);[^>]*>.*?</div>\s*',
        re.DOTALL
    )

    for filepath in html_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = banner_pattern.sub('', content)

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            modified_count += 1
            print(f"Removed hardcoded banner from {filepath}")

    print(f"\nBanner Cleanup Complete!")
    print(f"Files Modified: {modified_count}")

if __name__ == '__main__':
    clean_banners()
