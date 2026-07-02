import os
import glob
import re

def fix_dead_links():
    html_files = glob.glob('*.html')
    modified_count = 0
    links_fixed = 0
    
    # Matches href="#", href="#!", href="" (ignores whitespace)
    # Using a replacer function to handle it
    dead_pattern = re.compile(r'href\s*=\s*(["\'])(#|#!|)\1', re.IGNORECASE)

    def replacer(match):
        nonlocal links_fixed
        links_fixed += 1
        quote = match.group(1)
        return f'href={quote}javascript:void(0){quote}'

    for filepath in html_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = dead_pattern.sub(replacer, content)

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            modified_count += 1
            print(f"Fixed dead links in {filepath}")

    print(f"\nDead Link Fix Complete!")
    print(f"Files Modified: {modified_count}")
    print(f"Links Fixed: {links_fixed}")

if __name__ == '__main__':
    fix_dead_links()
