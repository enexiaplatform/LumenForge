import os
import re

def check_seo_tags(directory):
    html_files = []
    for root, dirs, files in os.walk(directory):
        if any(ignored in root for ignored in ['node_modules', '.git', '.vercel', 'supabase']):
            continue
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
                
    issues = []
    
    for file_path in html_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        file_issues = []
        
        # Check title
        title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE | re.DOTALL)
        if not title_match or not title_match.group(1).strip():
            file_issues.append("Missing or empty <title>")
            
        # Check description
        desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', content, re.IGNORECASE)
        if not desc_match:
            # try alternative order
            desc_match = re.search(r'<meta[^>]*content=["\'](.*?)["\'][^>]*name=["\']description["\']', content, re.IGNORECASE)
        if not desc_match or not desc_match.group(1).strip():
            file_issues.append("Missing <meta name='description'>")
            
        # Check og:title
        og_title_match = re.search(r'<meta[^>]*property=["\']og:title["\']', content, re.IGNORECASE)
        if not og_title_match:
            file_issues.append("Missing <meta property='og:title'>")
            
        # Check og:image
        og_image_match = re.search(r'<meta[^>]*property=["\']og:image["\']', content, re.IGNORECASE)
        if not og_image_match:
            file_issues.append("Missing <meta property='og:image'>")
            
        if file_issues:
            issues.append((os.path.relpath(file_path, directory), file_issues))
            
    return issues

if __name__ == '__main__':
    directory = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    print(f"Auditing HTML files in: {directory}")
    issues = check_seo_tags(directory)
    if not issues:
        print("Success: All HTML files have basic SEO and OG tags!")
    else:
        print(f"Found {len(issues)} files with SEO issues:")
        for file, file_issues in issues:
            print(f"- {file}: {', '.join(file_issues)}")
