import os
import re
from urllib.parse import urlparse

base_dir = r"E:\Antigravity project\LumenForge"

def audit_links():
    print("==================================================")
    print("STARTING DEEP HTML LINK AUDIT")
    print("==================================================")
    
    html_files = []
    for root, dirs, files in os.walk(base_dir):
        if any(ignored in root for ignored in ['node_modules', '.git', '.vercel', 'supabase']):
            continue
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
                
    print(f"Found {len(html_files)} HTML files to audit.")
    
    errors_found = 0
    localhost_patterns = re.compile(r'localhost|127\.0\.0\.1', re.IGNORECASE)
    
    for filepath in html_files:
        rel_file = os.path.relpath(filepath, base_dir)
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        # 1. Audit localhost
        matches = localhost_patterns.findall(content)
        if matches:
            print(f"[!] {rel_file}: Found {len(matches)} hardcoded local server references.")
            errors_found += len(matches)
            
        # 2. Audit local href/src paths
        # Find href="..." and src="..."
        links = re.findall(r'(?:href|src)=["\']([^"\']+)["\']', content)
        
        file_dir = os.path.dirname(filepath)
        
        for link in links:
            # Skip external links, hashes, mailto, tel, javascript and templates
            if (link.startswith('http://') or 
                link.startswith('https://') or 
                link.startswith('#') or 
                link.startswith('mailto:') or 
                link.startswith('tel:') or 
                link.startswith('javascript:') or 
                '{{' in link or 
                '%' in link):
                continue
                
            # Parse path (ignore query params like ?v=1 or hash fragment)
            parsed = urlparse(link)
            clean_path = parsed.path
            
            if not clean_path:
                continue
                
            # Resolve relative path
            target_path = os.path.abspath(os.path.join(file_dir, clean_path))
            
            # Verify existence
            if not os.path.exists(target_path):
                # Check if it is a root-relative path (starts with /)
                if link.startswith('/'):
                    # Convert to absolute path under base_dir
                    root_target_path = os.path.abspath(os.path.join(base_dir, clean_path.lstrip('/')))
                    if os.path.exists(root_target_path):
                        continue
                print(f"[!] {rel_file}: Broken reference -> '{link}' (Resolved to: {os.path.relpath(target_path, base_dir)})")
                errors_found += 1
                
    print("==================================================")
    if errors_found == 0:
        print("[+] SUCCESS: No broken references or hardcoded localhost links found!")
    else:
        print(f"[!] FAILED: Found {errors_found} errors/warnings.")
    print("==================================================")

if __name__ == '__main__':
    audit_links()
