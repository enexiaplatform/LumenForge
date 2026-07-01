import re

file_path = 'e:/Antigravity project/LumenForge/creator-starter-bundle.html'

json_ld = '''
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "Creator Starter Bundle",
    "image": [
      "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=1200&auto=format&fit=crop"
    ],
    "description": "Bộ công cụ tăng tốc tối đa quy trình làm phim và nhiếp ảnh điện ảnh, bao gồm ebook, LUTs và presets.",
    "brand": {
      "@type": "Brand",
      "name": "LumenForge"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://lumenforge.studio/creator-starter-bundle.html",
      "priceCurrency": "VND",
      "price": "249000",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "128"
    }
  }
  </script>
'''

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'application/ld+json' not in content and '</head>' in content:
    content = content.replace('</head>', json_ld + '</head>')
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Injected JSON-LD into creator-starter-bundle.html")
else:
    print("Already has JSON-LD or </head> not found.")

