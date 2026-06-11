import os
import re
import glob

# Universal Nav HTML
NAV_TEMPLATE = """  <!-- Navigation -->
  <nav class="nav" id="main-nav">
    <div class="nav-container">
      <a href="{prefix}index.html" class="nav-logo">LUMEN<span class="nav-logo-accent">FORGE</span></a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <div class="nav-menu" id="nav-menu">
        <a href="{prefix}index.html" class="nav-link">Trang chủ</a>
        <a href="{prefix}light-codex.html" class="nav-link">Light Codex</a>
        <a href="{prefix}tool-lab.html" class="nav-link">Xưởng Công cụ</a>
        <a href="{prefix}shot-recipes.html" class="nav-link">Công thức</a>
        <a href="{prefix}lighting-gallery.html" class="nav-link">Thư viện</a>
        <a href="{prefix}gear-vault.html" class="nav-link">Thiết Bị</a>
        <a href="{prefix}dashboard.html" class="nav-link">Dashboard</a>
        <a href="{prefix}store.html" class="nav-link" style="color: #d4af37; border: 1px solid #d4af37; border-radius: 20px; padding: 5px 15px; margin-left: 10px;">STORE</a>
      </div>
    </div>
  </nav>"""

def replace_nav(file_path, is_subfolder):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find the <nav class="nav" id="main-nav"> ... </nav> block
    pattern = re.compile(r'<!--\s*Navigation\s*-->\s*<nav class="nav" id="main-nav">.*?</nav>', re.DOTALL)
    
    if not pattern.search(content):
        pattern = re.compile(r'<nav class="nav" id="main-nav">.*?</nav>', re.DOTALL)
        
    prefix = '../' if is_subfolder else ''
    replacement = NAV_TEMPLATE.replace('{prefix}', prefix)
    
    new_content = pattern.sub(replacement, content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

count = 0
for f in glob.glob('*.html'):
    if replace_nav(f, False): count += 1
for f in glob.glob('articles/*.html'):
    if replace_nav(f, True): count += 1
for f in glob.glob('tools/*.html'):
    if replace_nav(f, True): count += 1

print(f"Updated nav in {count} files")
