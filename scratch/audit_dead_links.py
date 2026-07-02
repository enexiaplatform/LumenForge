import os
import glob
import re

def audit_dead_links():
    html_files = glob.glob('*.html')
    dead_links_found = 0
    files_with_issues = 0
    
    # Match href="#" or href="" or href="#!"
    dead_pattern = re.compile(r'href\s*=\s*(["\'])(#|#!|)\1', re.IGNORECASE)

    for filepath in html_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        matches = dead_pattern.findall(content)
        if matches:
            print(f"[{filepath}]: Found {len(matches)} dead/empty links.")
            dead_links_found += len(matches)
            files_with_issues += 1

    print(f"\nDead Link Audit Complete!")
    print(f"Files with Dead Links: {files_with_issues}")
    print(f"Total Dead Links Found: {dead_links_found}")

if __name__ == '__main__':
    audit_dead_links()
