import os
from bs4 import BeautifulSoup
import glob

def check_seo_tags(directory):
    html_files = glob.glob(os.path.join(directory, '**/*.html'), recursive=True)
    
    issues = []
    
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Check basic SEO
            title = soup.title
            desc = soup.find('meta', attrs={'name': 'description'})
            
            # Check Open Graph
            og_title = soup.find('meta', property='og:title')
            og_image = soup.find('meta', property='og:image')
            
            file_issues = []
            if not title or not title.string.strip():
                file_issues.append("Missing <title>")
            if not desc or not desc.get('content', '').strip():
                file_issues.append("Missing <meta name='description'>")
            if not og_title:
                file_issues.append("Missing <meta property='og:title'>")
            if not og_image:
                file_issues.append("Missing <meta property='og:image'>")
                
            if file_issues:
                issues.append((os.path.relpath(file, directory), file_issues))
                
    return issues

if __name__ == "__main__":
    directory = "e:/Antigravity project/LumenForge"
    issues = check_seo_tags(directory)
    
    if not issues:
        print("All HTML files have basic SEO and OG tags!")
    else:
        print(f"Found {len(issues)} files with SEO issues.")
        for file, file_issues in issues[:10]: # Print top 10
            print(f"- {file}: {', '.join(file_issues)}")
