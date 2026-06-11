import glob
import re

# 1. Inject Affiliate Ads into Articles
article_files = glob.glob('articles/*.html')
injected_articles = 0

affiliate_html = """
                    <div class="article-ad-box" style="margin: 40px 0; padding: 25px; border-left: 4px solid var(--accent-amber); background: rgba(255,255,255,0.02); display: flex; align-items: center; gap: 20px; border-radius: 0 8px 8px 0;">
                        <img src="https://images.unsplash.com/photo-1620288627223-53302f4e8c74?q=80&w=200&auto=format&fit=crop" alt="LumenForge Store" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;">
                        <div>
                            <h4 style="margin: 0 0 10px 0; font-size: 1.1rem; color: var(--text-primary);">Nâng cấp kỹ năng với Tài liệu Độc quyền</h4>
                            <p style="margin: 0 0 15px 0; font-size: 0.9rem; color: var(--text-secondary);">Bạn thích bài viết này? Hãy khám phá kho tàng Ebook phân tích chuyên sâu và Preset màu điện ảnh đẳng cấp tại LumenForge Pro Store.</p>
                            <a href="../store.html" class="btn-primary" style="display: inline-block; padding: 6px 16px; font-size: 0.85rem;">Khám phá ngay</a>
                        </div>
                    </div>
"""

for f in article_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Skip if already has an ad box
    if 'article-ad-box' in content:
        continue

    # Try to find the 3rd or 4th paragraph to inject after
    paragraphs = [m.start() for m in re.finditer(r'</p>', content)]
    if len(paragraphs) >= 3:
        insert_pos = paragraphs[2] + 4 # After the 3rd </p>
        content = content[:insert_pos] + affiliate_html + content[insert_pos:]
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        injected_articles += 1

# 2. Inject Preset Upsell into Tools
tool_files = glob.glob('tools/*.html')
injected_tools = 0

preset_html = """
        <div style="margin-top: 30px; padding: 15px; border-radius: 8px; border: 1px dashed var(--accent-amber); text-align: center; background: rgba(245, 166, 35, 0.05);">
          <h4 style="color: var(--accent-amber); font-size: 0.95rem; margin-bottom: 8px;">Tối ưu hóa Quy trình làm việc?</h4>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">Sở hữu ngay trọn bộ <strong>Cinematic Film Emulation Pack</strong> gồm 15 Presets & LUTs (.cube) dùng vĩnh viễn trên Lightroom, Premiere.</p>
          <a href="../store.html" class="btn-primary" style="display: block; width: 100%; text-align: center; padding: 10px; font-size: 0.85rem; background: var(--accent-amber); color: #000; text-decoration: none; font-weight: bold; border-radius: 4px;">Khám phá Preset Shop</a>
        </div>
"""

for f in tool_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    if 'Khám phá Preset Shop' in content:
        continue

    # Usually inject before the closing div of the panel, or right before </main>
    # In tools, we usually have a <div class="panel">. Let's find the end of it, or just insert before </div>\n    </div>\n  </main>
    # A safe bet is to insert it before </main> or </div>... let's just use regex to find </main> and insert before the </div> right above it.
    
    # We can inject it right before `</main>` inside the last div.
    match = re.search(r'</div>\s*</main>', content)
    if match:
        insert_pos = match.start()
        content = content[:insert_pos] + preset_html + content[insert_pos:]
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        injected_tools += 1

print(f"Injected Ads into {injected_articles} articles.")
print(f"Injected Ads into {injected_tools} tools.")
