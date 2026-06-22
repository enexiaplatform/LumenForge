import os
import re

def update_navigation():
    root_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    print(f"Project root directory: {root_dir}")
    
    html_files_updated = 0
    html_files_checked = 0
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude directories
        if any(ignored in dirpath for ignored in ['node_modules', '.git', '.vercel', 'supabase']):
            continue
            
        for filename in filenames:
            if filename.endswith('.html'):
                file_path = os.path.join(dirpath, filename)
                html_files_checked += 1
                
                # Read file
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check if file has nav-menu container
                # We match the opening tag and group the whole block up to the next </div>
                nav_menu_match = re.search(r'(<div[^>]*class="nav-menu"[^>]*id="nav-menu"[^>]*>)(.*?)(</div>)', content, re.DOTALL)
                if not nav_menu_match:
                    continue
                
                start_tag = nav_menu_match.group(1)
                inner_content = nav_menu_match.group(2)
                end_tag = nav_menu_match.group(3)
                
                # Calculate relative path to gear-vault.html
                rel_dir = os.path.relpath(root_dir, os.path.dirname(file_path))
                if rel_dir == '.':
                    rel_link = 'gear-vault.html'
                else:
                    rel_link = os.path.join(rel_dir, 'gear-vault.html').replace('\\', '/')
                
                # Check if gear-vault.html is already in the navigation menu inner content
                if 'gear-vault.html' in inner_content:
                    continue
                
                # Find the location to insert the link
                # We want to insert it after the "light-codex.html" link (relative to the current path)
                codex_pattern = r'(<a[^>]*href="[^"]*light-codex\.html"[^>]*>.*?</a>)'
                codex_match = re.search(codex_pattern, inner_content)
                
                new_link = f'\n        <a href="{rel_link}" class="nav-link">Kho Thiết Bị</a>'
                
                if codex_match:
                    # Insert after light-codex.html inside the menu
                    matched_str = codex_match.group(1)
                    new_inner = inner_content.replace(matched_str, matched_str + new_link)
                else:
                    # Fallback: insert at the beginning of the inner content
                    new_inner = new_link + inner_content
                
                # Reconstruct full block
                old_block = nav_menu_match.group(0)
                new_block = start_tag + new_inner + end_tag
                
                updated_content = content.replace(old_block, new_block)
                
                # Write back if changed
                if updated_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(updated_content)
                    print(f"Updated: {os.path.relpath(file_path, root_dir)} -> Added relative link: {rel_link}")
                    html_files_updated += 1
                    
    print(f"\nNavigation integration complete: checked {html_files_checked} files, updated {html_files_updated} files.")

if __name__ == '__main__':
    update_navigation()
