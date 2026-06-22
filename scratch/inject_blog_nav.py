import os
import re

def inject_blog_link():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    print(f"Project root: {root_dir}")

    files_updated = 0
    files_checked = 0
    files_skipped = []

    # Collect all HTML files
    html_files = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip node_modules, .git, etc.
        dirnames[:] = [d for d in dirnames if d not in ['node_modules', '.git', '.vercel', 'scratch']]
        for filename in filenames:
            if filename.endswith('.html'):
                html_files.append(os.path.join(dirpath, filename))

    for filepath in html_files:
        files_checked += 1
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # Skip if already has blog link in nav-menu
        nav_menu_match = re.search(r'<div class="nav-menu"[^>]*>(.*?)</div>', content, re.DOTALL)
        if not nav_menu_match:
            files_skipped.append(os.path.relpath(filepath, root_dir) + ' (no nav-menu)')
            continue

        nav_menu_content = nav_menu_match.group(0)
        if 'blog.html' in nav_menu_content:
            files_skipped.append(os.path.relpath(filepath, root_dir) + ' (already has blog)')
            continue

        # Determine relative prefix based on file depth
        rel_path = os.path.relpath(filepath, root_dir)
        depth = len(rel_path.replace('\\', '/').split('/')) - 1
        prefix = '../' * depth if depth > 0 else ''

        # Build the blog link
        blog_link = f'<a href="{prefix}blog.html" class="nav-link">Blog</a>'

        # Insert blog link after the "Học Ánh Sáng" link (light-codex) 
        # Strategy: insert after the light-codex link line
        new_content = re.sub(
            r'(<a href="[^"]*light-codex\.html"[^>]*>[^<]*</a>)',
            r'\1\n        ' + blog_link,
            content,
            count=1
        )

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            files_updated += 1
            print(f"  [OK] Updated: {rel_path}")
        else:
            files_skipped.append(os.path.relpath(filepath, root_dir) + ' (pattern not matched)')

    print(f"\n{'='*60}")
    print(f"Files checked : {files_checked}")
    print(f"Files updated : {files_updated}")
    print(f"Files skipped : {len(files_skipped)}")
    if files_skipped:
        print("\nSkipped:")
        for s in files_skipped[:20]:
            print(f"  - {s}")

if __name__ == '__main__':
    inject_blog_link()
