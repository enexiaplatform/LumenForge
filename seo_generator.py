import os
import glob
import re
from datetime import datetime

BASE_URL = "https://lumenforge.com"

# 1. Generate Sitemap
def generate_sitemap():
    html_files = glob.glob('*.html') + glob.glob('articles/*.html') + glob.glob('tools/*.html')
    
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for f in html_files:
        # normalize path
        url_path = f.replace('\\', '/')
        priority = "0.8"
        if url_path == "index.html":
            priority = "1.0"
        elif url_path.startswith("articles/"):
            priority = "0.9"
            
        url = f"{BASE_URL}/{url_path}"
        
        xml += '  <url>\n'
        xml += f'    <loc>{url}</loc>\n'
        xml += f'    <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>\n'
        xml += f'    <priority>{priority}</priority>\n'
        xml += '  </url>\n'
    
    xml += '</urlset>\n'
    
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(xml)
    print(f"Generated sitemap.xml with {len(html_files)} URLs.")

# 2. Generate robots.txt
def generate_robots():
    txt = "User-agent: *\nAllow: /\n\nSitemap: https://lumenforge.com/sitemap.xml\n"
    with open('robots.txt', 'w', encoding='utf-8') as f:
        f.write(txt)
    print("Generated robots.txt.")

# 3. Inject SEO Schema and Canonical into all HTML
def inject_seo_tags():
    files = glob.glob('*.html') + glob.glob('articles/*.html') + glob.glob('tools/*.html')
    
    for f in files:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            
        url_path = f.replace('\\', '/')
        canonical_url = f"{BASE_URL}/{url_path}"
        
        # Check if already has canonical
        if '<link rel="canonical"' not in content:
            # Insert before </head>
            canonical_tag = f'\n  <link rel="canonical" href="{canonical_url}">\n'
            
            # Determine Schema Type
            schema_type = "WebPage"
            if url_path.startswith("articles/"):
                schema_type = "Article"
            elif url_path.startswith("tools/"):
                schema_type = "SoftwareApplication"
                
            # Basic JSON-LD
            title_match = re.search(r'<title>(.*?)</title>', content)
            title = title_match.group(1) if title_match else "LumenForge"
            desc_match = re.search(r'<meta name="description" content="(.*?)">', content)
            desc = desc_match.group(1) if desc_match else "Nền tảng học thuật nhiếp ảnh điện ảnh LumenForge."
            
            schema = f'''
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "{schema_type}",
    "name": "{title}",
    "headline": "{title}",
    "description": "{desc}",
    "url": "{canonical_url}",
    "author": {{
      "@type": "Organization",
      "name": "LumenForge"
    }}
  }}
  </script>
'''
            new_head_content = canonical_tag + schema + "</head>"
            content = content.replace("</head>", new_head_content)
            
            with open(f, 'w', encoding='utf-8') as file:
                file.write(content)
                
    print("Injected Canonical and Schema into HTML files.")

if __name__ == "__main__":
    generate_sitemap()
    generate_robots()
    inject_seo_tags()
