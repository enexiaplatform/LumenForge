const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIRECTORIES_TO_SCAN = ['.', 'articles', 'tools', 'studio'];
const IGNORE_FILES = ['index.html', 'dashboard.html', 'store.html', 'free-guide.html', 'light-codex.html', 'before-after.html'];

// The new navigation and footer templates
const NAV_TEMPLATE = (depthPrefix) => `  <nav class="nav" id="main-nav">
    <div class="nav-container">
      <a href="${depthPrefix}index.html" class="nav-logo">LUMEN<span class="nav-logo-accent">FORGE</span></a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <div class="nav-menu" id="nav-menu">
        <a href="${depthPrefix}light-codex.html" class="nav-link">Học Ánh Sáng</a>
        <a href="${depthPrefix}before-after.html" class="nav-link">Before / After</a>
        <a href="${depthPrefix}free-guide.html" class="nav-link">Starter Kit</a>
        <div class="nav-link" style="position: relative; cursor: pointer;" onmouseenter="this.querySelector('.nav-dropdown').style.display='block'" onmouseleave="this.querySelector('.nav-dropdown').style.display='none'">
          Khám phá ▾
          <div class="nav-dropdown" style="display:none; position:absolute; top:100%; left:0; background:rgba(15,15,20,0.95); border:1px solid var(--border-color); border-radius:8px; padding:10px 0; min-width:200px; z-index:100; backdrop-filter:blur(20px);">
            <a href="${depthPrefix}tool-lab.html" style="display:block; padding:8px 20px; color:var(--text-secondary); text-decoration:none; font-size:0.9rem; transition: color 0.2s;">Xưởng Công cụ</a>
            <a href="${depthPrefix}shot-recipes.html" style="display:block; padding:8px 20px; color:var(--text-secondary); text-decoration:none; font-size:0.9rem;">Công thức Chụp</a>
            <a href="${depthPrefix}lighting-gallery.html" style="display:block; padding:8px 20px; color:var(--text-secondary); text-decoration:none; font-size:0.9rem;">Thư viện Ánh sáng</a>
            <a href="${depthPrefix}gear-vault.html" style="display:block; padding:8px 20px; color:var(--text-secondary); text-decoration:none; font-size:0.9rem;">Kho Thiết Bị</a>
            <a href="${depthPrefix}studio-planner.html" style="display:block; padding:8px 20px; color:var(--text-secondary); text-decoration:none; font-size:0.9rem;">Studio Planner</a>
            <a href="${depthPrefix}dashboard.html" style="display:block; padding:8px 20px; color:var(--text-secondary); text-decoration:none; font-size:0.9rem;">Dashboard</a>
          </div>
        </div>
        <a href="${depthPrefix}store.html" class="nav-link" style="color: #d4af37; border: 1px solid #d4af37; border-radius: 20px; padding: 5px 15px; margin-left: 10px;">STORE</a>
      </div>
    </div>
  </nav>`;

const FOOTER_TEMPLATE = (depthPrefix) => `  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="nav-logo">LUMEN<span class="nav-logo-accent">FORGE</span></span>
          <p class="footer-tagline">Từ ảnh bình thường đến cinematic — bằng ánh sáng, màu sắc và workflow.</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>Bắt đầu</h4>
            <a href="${depthPrefix}before-after.html">Before / After</a>
            <a href="${depthPrefix}free-guide.html">Starter Kit Miễn Phí</a>
            <a href="${depthPrefix}light-codex.html">Học Ánh Sáng</a>
            <a href="${depthPrefix}store.html">Store</a>
          </div>
          <div class="footer-col">
            <h4>Khám phá thêm</h4>
            <a href="${depthPrefix}tool-lab.html">Xưởng Công cụ</a>
            <a href="${depthPrefix}shot-recipes.html">Công thức Chụp</a>
            <a href="${depthPrefix}gear-vault.html">Kho Thiết Bị</a>
            <a href="${depthPrefix}glossary.html">Thuật ngữ</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025–2026 LumenForge. Cinematic photography, forged through light and color.</p>
      </div>
    </div>
  </footer>`;

function getDepthPrefix(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const depth = relativePath.split(path.sep).length - 1;
  return depth === 0 ? '' : '../'.repeat(depth);
}

function processFile(filePath) {
  const isRootFile = path.dirname(filePath) === ROOT_DIR;
  const fileName = path.basename(filePath);

  if (isRootFile && IGNORE_FILES.includes(fileName)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  const depthPrefix = getDepthPrefix(filePath);

  // Replace Nav
  const navRegex = /<nav class="nav" id="main-nav">[\s\S]*?<\/nav>/;
  if (navRegex.test(content)) {
    content = content.replace(navRegex, NAV_TEMPLATE(depthPrefix));
    hasChanges = true;
  }

  // Replace Footer
  const footerRegex = /<footer class="footer">[\s\S]*?<\/footer>/;
  if (footerRegex.test(content)) {
    content = content.replace(footerRegex, FOOTER_TEMPLATE(depthPrefix));
    hasChanges = true;
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${path.relative(ROOT_DIR, filePath)}`);
  }
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // we only scan 1 level deep based on DIRECTORIES_TO_SCAN, but let's be safe
    } else if (stat.isFile() && fullPath.endsWith('.html')) {
      processFile(fullPath);
    }
  }
}

let totalUpdated = 0;

DIRECTORIES_TO_SCAN.forEach(dir => {
  const fullDirPath = path.join(ROOT_DIR, dir);
  scanDirectory(fullDirPath);
});

console.log('UI Synchronization Complete.');
