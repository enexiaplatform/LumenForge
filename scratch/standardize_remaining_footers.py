import os
import re

base_dir = r"E:\Antigravity project\LumenForge"

premium_footer = """  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="nav-logo">LUMEN<span class="nav-logo-accent">FORGE</span></span>
          <p class="footer-tagline">Từ ảnh bình thường đến cinematic — bằng ánh sáng, màu sắc và workflow.</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>Ebooks</h4>
            <a href="ebook-chiaroscuro.html">Bậc Thầy Chiaroscuro</a>
            <a href="ebook-lighting-setups.html">Lighting Setups Bible</a>
            <a href="ebook-color-psychology.html">Tâm Lý Học Màu Sắc</a>
            <a href="store.html">Xem tất cả</a>
          </div>
          <div class="footer-col">
            <h4>Khám phá</h4>
            <a href="light-codex.html">Học Ánh Sáng</a>
            <a href="gear-vault.html">Kho Thiết Bị</a>
            <a href="blog.html">Blog</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025–2026 LumenForge. Cinematic photography, forged through light and color.</p>
      </div>
    </div>
  </footer>"""

footer_pattern = re.compile(
    r'<footer class="footer"[\s\S]*?>[\s\S]*?</footer>', re.IGNORECASE
)

def standardize_footer(filename):
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        print(f"  [-] File not found: {filename}")
        return False
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if footer_pattern.search(content):
        # Avoid replacing if it already has the premium links
        if "ebook-chiaroscuro.html" in footer_pattern.search(content).group(0):
            print(f"  [-] {filename} already has standardized premium footer.")
            return False
            
        content = footer_pattern.sub(premium_footer, content)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  [+] Standardized footer on {filename}")
        return True
    else:
        print(f"  [-] No footer found in {filename}")
        return False

def main():
    print("==================================================")
    print("STARTING REMAINING ROOT FOOTERS STANDARDIZATION")
    print("==================================================")
    
    target_files = [
        "color-alchemist.html",
        "creator-starter-bundle.html",
        "cyberpunk-neon-nights.html",
        "lighting-gallery.html"
    ]
    
    updated_count = 0
    for filename in target_files:
        if standardize_footer(filename):
            updated_count += 1
            
    print("==================================================")
    print(f"COMPLETED! Standardized {updated_count} / {len(target_files)} remaining files.")
    print("==================================================")

if __name__ == "__main__":
    main()
