import os
import glob
import re

def clean_nav_styles():
    html_files = glob.glob('*.html')
    modified_count = 0
    styles_removed = 0
    
    # Matches: style="color: var(--accent-cyan);"
    # inside <a class="nav-link"...>
    style_pattern = re.compile(r'(<a[^>]*class="nav-link"[^>]*?)\s*style\s*=\s*["\']color:\s*var\(--accent-cyan\);?["\']([^>]*>)', re.IGNORECASE)

    def replacer(match):
        nonlocal styles_removed
        styles_removed += 1
        return f"{match.group(1)}{match.group(2)}"

    for filepath in html_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = style_pattern.sub(replacer, content)

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            modified_count += 1
            print(f"Removed hardcoded nav style in {filepath}")

    print(f"\nNav Style Cleanup Complete!")
    print(f"Files Modified: {modified_count}")
    print(f"Styles Removed: {styles_removed}")

if __name__ == '__main__':
    clean_nav_styles()
