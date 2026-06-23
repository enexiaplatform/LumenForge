import os
import re

base_dir = r"E:\Antigravity project\LumenForge"

def cleanup_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Regex to find duplicate footer comments (handling CRLF/LF and various indentations)
    pattern = re.compile(r'<!--\s*Footer\s*-->\s*\r?\n\s*<!--\s*Footer\s*-->', re.IGNORECASE)
    
    if pattern.search(content):
        # Replace with a single standardized comment
        new_content = pattern.sub('  <!-- Footer -->', content)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"  [+] Cleaned up duplicate footer comment in: {os.path.relpath(filepath, base_dir)}")
        return True
    return False

def main():
    print("==================================================")
    print("STARTING DUPLICATE FOOTER COMMENTS CLEANUP")
    print("==================================================")
    
    total_cleaned = 0
    for root, dirs, files in os.walk(base_dir):
        if any(ignored in root for ignored in ['node_modules', '.git', '.vercel', 'supabase']):
            continue
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                if cleanup_file(filepath):
                    total_cleaned += 1
                    
    print("==================================================")
    print(f"COMPLETED! Cleaned up {total_cleaned} files.")
    print("==================================================")

if __name__ == "__main__":
    main()
