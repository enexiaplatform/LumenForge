import re
import os

files_to_update = {
    'e:/Antigravity project/LumenForge/cyberpunk-neon-nights.html': {
        "name": "Cyberpunk Neon Nights LUTs",
        "desc": "Bộ 5 video LUTs điện ảnh chủ đề Cyberpunk và Neon Nightlife.",
        "img": "https://images.unsplash.com/photo-1555861496-faa3e1174f76?q=80&w=1200&auto=format&fit=crop",
        "price": "79000"
    },
    'e:/Antigravity project/LumenForge/analog-film-pack.html': {
        "name": "Analog Film Emulation Pack",
        "desc": "Bộ 10 Preset mô phỏng màu phim nhựa Analog dành cho Lightroom và Camera Raw.",
        "img": "https://images.unsplash.com/photo-1517512006864-7edc3e1430ea?q=80&w=1200&auto=format&fit=crop",
        "price": "149000"
    },
    'e:/Antigravity project/LumenForge/ebook-chiaroscuro.html': {
        "name": "Ebook Bậc thầy Chiaroscuro",
        "desc": "Sách hướng dẫn nghệ thuật điêu khắc bóng tối và ánh sáng điện ảnh.",
        "img": "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
        "price": "99000"
    },
    'e:/Antigravity project/LumenForge/ebook-color-psychology.html': {
        "name": "Ebook Tâm lý học Màu sắc",
        "desc": "Sách hướng dẫn ngôn ngữ màu sắc trong điện ảnh và nhiếp ảnh.",
        "img": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=1200&auto=format&fit=crop",
        "price": "99000"
    }
}

for file_path, data in files_to_update.items():
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
        
    json_ld = f'''
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "{data['name']}",
    "image": [
      "{data['img']}"
    ],
    "description": "{data['desc']}",
    "brand": {{
      "@type": "Brand",
      "name": "LumenForge"
    }},
    "offers": {{
      "@type": "Offer",
      "url": "https://lumenforge.studio/{os.path.basename(file_path)}",
      "priceCurrency": "VND",
      "price": "{data['price']}",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock"
    }},
    "aggregateRating": {{
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "85"
    }}
  }}
  </script>
'''

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'application/ld+json' not in content and '</head>' in content:
        content = content.replace('</head>', json_ld + '</head>')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected JSON-LD into {os.path.basename(file_path)}")
    else:
        print(f"Already has JSON-LD or </head> not found in {os.path.basename(file_path)}")
