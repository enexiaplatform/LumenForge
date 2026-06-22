import os
import re

def update_favicon():
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
                
                # Check if favicon link is already in the file
                if 'images/favicon.svg' in content:
                    continue
                
                # Calculate relative path to images/favicon.svg
                rel_dir = os.path.relpath(root_dir, os.path.dirname(file_path))
                if rel_dir == '.':
                    rel_link = 'images/favicon.svg'
                else:
                    rel_link = os.path.join(rel_dir, 'images/favicon.svg').replace('\\', '/')
                
                # We want to insert the favicon link right after <head> (or <head class="...">)
                head_match = re.search(r'(<head[^>]*>)', content, re.IGNORECASE)
                if not head_match:
                    continue
                
                head_tag = head_match.group(1)
                favicon_tag = f'\n  <link rel="icon" type="image/svg+xml" href="{rel_link}">'
                
                # Perform insertion
                updated_content = content.replace(head_tag, head_tag + favicon_tag)
                
                # Write back if changed
                if updated_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(updated_content)
                    print(f"Favicon added to: {os.path.relpath(file_path, root_dir)}")
                    html_files_updated += 1
                    
    print(f"\nFavicon integration complete: checked {html_files_checked} files, updated {html_files_updated} files.")

if __name__ == '__main__':
    update_favicon()
