import os
import glob
from datetime import datetime

DOMAIN = "https://lumenforge.studio"

def generate_seo_architecture():
    print("Generating SEO Architecture...")
    
    # Generate robots.txt
    robots_content = f"""User-agent: *
Disallow: /scratch/
Disallow: /admin/
Disallow: /*?ref=

Sitemap: {DOMAIN}/sitemap.xml
"""
    with open('robots.txt', 'w', encoding='utf-8') as f:
        f.write(robots_content)
    print("Created robots.txt")

    # Generate sitemap.xml
    html_files = glob.glob('*.html')
    # Filter out 404
    html_files = [f for f in html_files if f != '404.html']
    
    today = datetime.now().strftime('%Y-%m-%d')
    
    sitemap_lines = []
    sitemap_lines.append('<?xml version="1.0" encoding="UTF-8"?>')
    sitemap_lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    for file in html_files:
        # Determine priority based on file importance
        priority = "0.8"
        if file == "index.html":
            priority = "1.0"
        elif file.startswith("store") or file.startswith("tool-lab"):
            priority = "0.9"
            
        url_entry = f"""  <url>
    <loc>{DOMAIN}/{file}</loc>
    <lastmod>{today}</lastmod>
    <priority>{priority}</priority>
  </url>"""
        sitemap_lines.append(url_entry)
        
    sitemap_lines.append('</urlset>')
    
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write('\n'.join(sitemap_lines))
        
    print(f"Created sitemap.xml with {len(html_files)} URLs")

if __name__ == '__main__':
    generate_seo_architecture()
