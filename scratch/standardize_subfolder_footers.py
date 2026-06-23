import os
import re

# Root directory path
base_dir = r"E:\Antigravity project\LumenForge"

# Standard premium footer for subfolder pages (e.g. articles/, tools/)
subfolder_footer = """  <!-- Footer -->
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
            <a href="../ebook-chiaroscuro.html">Bậc Thầy Chiaroscuro</a>
            <a href="../ebook-lighting-setups.html">Lighting Setups Bible</a>
            <a href="../ebook-color-psychology.html">Tâm Lý Học Màu Sắc</a>
            <a href="../store.html">Xem tất cả</a>
          </div>
          <div class="footer-col">
            <h4>Khám phá</h4>
            <a href="../light-codex.html">Học Ánh Sáng</a>
            <a href="../gear-vault.html">Kho Thiết Bị</a>
            <a href="../blog.html">Blog</a>
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

def process_file(filepath):
    if not os.path.exists(filepath):
        return False
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # If it already contains the premium links, skip
    if "ebook-chiaroscuro.html" in content and "ebook-lighting-setups.html" in content:
        # Check if the path uses relative ../ for subfolders
        if "../ebook-chiaroscuro.html" in content:
            print(f"  [-] {os.path.basename(filepath)} already has standardized premium subfolder footer.")
            return False

    # Try to replace existing footer
    if footer_pattern.search(content):
        new_content = footer_pattern.sub(subfolder_footer, content)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"  [+] Replaced existing footer in: {os.path.basename(filepath)}")
        return True
    else:
        # Inject right before </body>
        body_close = re.compile(r'</body>', re.IGNORECASE)
        if body_close.search(content):
            new_content = body_close.sub(f"\n{subfolder_footer}\n</body>", content)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"  [+] Injected new footer in: {os.path.basename(filepath)}")
            return True
        else:
            print(f"  [!] WARNING: No footer or </body> found in: {os.path.basename(filepath)}")
            return False

def main():
    print("==================================================")
    print("STARTING SUBFOLDER FOOTER STANDARDIZATION")
    print("==================================================")
    
    subfolders = ["articles", "tools"]
    total_processed = 0
    total_updated = 0
    
    for sub in subfolders:
        folder_path = os.path.join(base_dir, sub)
        if not os.path.exists(folder_path):
            print(f"Directory not found: {folder_path}")
            continue
            
        print(f"\nProcessing directory: {sub}")
        files = [f for f in os.listdir(folder_path) if f.endswith(".html")]
        print(f"Found {len(files)} HTML files.")
        
        for filename in files:
            filepath = os.path.join(folder_path, filename)
            total_processed += 1
            if process_file(filepath):
                total_updated += 1
                
    print("\n==================================================")
    print(f"COMPLETED! Processed {total_processed} files, updated {total_updated} files.")
    print("==================================================")

if __name__ == "__main__":
    main()
