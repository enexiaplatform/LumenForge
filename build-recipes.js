const fs = require('fs');
const path = require('path');

// 1. Create a temp module
const originalCode = fs.readFileSync('js/recipes.js', 'utf8');
// remove DOM stuff at the bottom of recipes.js
const arrayEnd = originalCode.lastIndexOf('];') + 2;
const safeCode = originalCode.substring(0, arrayEnd) + '\nmodule.exports = shotRecipes;\n';

fs.writeFileSync('temp_recipes.js', safeCode);

// 2. Load the data
const recipes = require('./temp_recipes.js');

// 3. HTML Template function
function generateHTML(recipe) {
  // Extract slug from title
  const slug = recipe.title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${recipe.title} — LumenForge Shot Recipe</title>
  <meta name="keywords" content="${recipe.title}, công thức chụp ảnh, lighting setup, lumenforge">
  <meta name="description" content="${recipe.desc}">
  <meta name="theme-color" content="#0A0A0C">
  <meta name="color-scheme" content="dark">
  <link rel="stylesheet" href="../css/design-system.css">
  <style>
    .recipe-header {
      background: linear-gradient(135deg, rgba(10,10,12,0.9), rgba(10,10,12,0.9)), url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2000&auto=format&fit=crop') center/cover;
      padding: var(--space-3xl) 0 var(--space-2xl) 0;
      text-align: center;
      border-bottom: 1px solid var(--border-color);
    }
    
    .recipe-num {
      font-family: var(--font-mono);
      color: ${recipe.colorAccent};
      letter-spacing: 2px;
      display: block;
      margin-bottom: var(--space-md);
    }
    
    .recipe-header h1 {
      font-size: 3rem;
      color: var(--text-primary);
      margin-bottom: var(--space-md);
    }
    
    .recipe-desc {
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .recipe-body {
      padding: var(--space-2xl) 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-xl);
      margin-bottom: var(--space-2xl);
    }

    .info-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
    }
    
    .info-card h3 {
      font-family: var(--font-mono);
      font-size: 0.9rem;
      color: ${recipe.colorAccent};
      margin-bottom: var(--space-md);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .info-card p {
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 10px;
    }
    .info-card strong {
      color: var(--text-primary);
    }

    .diagram-placeholder {
      background: rgba(255,255,255,0.02);
      border: 1px dashed var(--border-color);
      border-radius: var(--radius-lg);
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-dim);
      font-family: var(--font-mono);
      margin: var(--space-2xl) 0;
    }

    .protip-box {
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%);
      border-left: 4px solid var(--accent-amber);
      padding: var(--space-lg);
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
      margin-top: var(--space-2xl);
    }

    .protip-box h4 {
      color: var(--accent-amber);
      margin-bottom: 10px;
    }
  </style>
</head>
<body>

  <!-- Navigation -->
  <nav class="nav" id="main-nav">
    <div class="nav-container">
      <a href="../index.html" class="nav-logo">LUMEN<span class="nav-logo-accent">FORGE</span></a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <div class="nav-menu" id="nav-menu">
        <a href="../index.html" class="nav-link">Bắt đầu</a>
        <a href="../before-after.html" class="nav-link">Before / After</a>
        <a href="../light-codex.html" class="nav-link">Học Ánh Sáng</a>
        <a href="../gear-vault.html" class="nav-link">Kho Thiết Bị</a>
        <a href="../tool-lab.html" class="nav-link">Công cụ</a>
        <a href="../store.html" class="nav-link">Cửa hàng</a>
        <a href="../dashboard.html" class="nav-link">Dashboard</a>
      </div>
    </div>
  </nav>

  <header class="recipe-header">
    <div class="container">
      <div style="margin-bottom: 20px;">
        <a href="../shot-recipes.html" style="color: var(--text-dim); text-decoration: none;">&larr; Quay lại Thư viện</a>
      </div>
      <span class="recipe-num">${recipe.num}</span>
      <h1>${recipe.title}</h1>
      <p class="recipe-desc">${recipe.desc}</p>
    </div>
  </header>

  <section class="recipe-body">
    <div class="container" style="max-width: 900px;">
      
      <div class="info-grid">
        <div class="info-card">
          <h3>Trang bị & Thiết lập</h3>
          <p><strong>Máy ảnh:</strong> ${recipe.camera}</p>
          <p><strong>Ống kính:</strong> ${recipe.lens}</p>
          <p><strong>Phông nền:</strong> ${recipe.background}</p>
          <p><strong>Trang phục:</strong> ${recipe.outfit}</p>
        </div>
        
        <div class="info-card">
          <h3>Ánh sáng & Pose</h3>
          <p><strong>Đánh sáng:</strong> ${recipe.light}</p>
          <p><strong>Tạo dáng:</strong> ${recipe.pose}</p>
          <p><strong>Mood:</strong> ${recipe.mood}</p>
        </div>
      </div>

      <div class="diagram-placeholder">
        [ Lighting Diagram Placeholder: Mở Tool Phòng Đánh Sáng 3 Điểm để mô phỏng ]
      </div>

      <div class="info-grid">
        <div class="info-card">
          <h3>Thông số Máy ảnh (Camera Settings)</h3>
          ${recipe.settings.aperture ? `<p><strong>Khẩu độ (Aperture):</strong> ${recipe.settings.aperture}</p>` : ''}
          ${recipe.settings.shutter ? `<p><strong>Tốc độ (Shutter):</strong> ${recipe.settings.shutter}</p>` : ''}
          ${recipe.settings.iso ? `<p><strong>ISO:</strong> ${recipe.settings.iso}</p>` : ''}
          ${recipe.settings.wb ? `<p><strong>Cân bằng trắng (WB):</strong> ${recipe.settings.wb}</p>` : ''}
        </div>

        <div class="info-card">
          <h3>Chỉnh màu Hậu kỳ (Color Grading)</h3>
          ${recipe.editing.exposure ? `<p><strong>Exposure:</strong> ${recipe.editing.exposure}</p>` : ''}
          ${recipe.editing.contrast ? `<p><strong>Contrast:</strong> ${recipe.editing.contrast}</p>` : ''}
          ${recipe.editing.highlights ? `<p><strong>Highlights:</strong> ${recipe.editing.highlights}</p>` : ''}
          ${recipe.editing.shadows ? `<p><strong>Shadows:</strong> ${recipe.editing.shadows}</p>` : ''}
          ${recipe.editing.whites ? `<p><strong>Whites:</strong> ${recipe.editing.whites}</p>` : ''}
          ${recipe.editing.blacks ? `<p><strong>Blacks:</strong> ${recipe.editing.blacks}</p>` : ''}
          ${recipe.editing.texture ? `<p><strong>Texture:</strong> ${recipe.editing.texture}</p>` : ''}
          ${recipe.editing.clarity ? `<p><strong>Clarity:</strong> ${recipe.editing.clarity}</p>` : ''}
          ${recipe.editing.vibrance ? `<p><strong>Vibrance/Sat:</strong> ${recipe.editing.vibrance}</p>` : ''}
          ${recipe.editing.splitTone ? `<p><strong>Split Toning:</strong> ${recipe.editing.splitTone}</p>` : ''}
          ${recipe.editing.grain ? `<p><strong>Grain:</strong> ${recipe.editing.grain}</p>` : ''}
        </div>
      </div>

      ${recipe.proTip ? `
      <div class="protip-box">
        <h4>⚡ Lời khuyên Thực chiến (Pro Tip)</h4>
        <p style="color: var(--text-secondary); line-height: 1.6;">${recipe.proTip}</p>
      </div>` : ''}

    </div>
  </section>

  <footer class="footer" style="margin-top: 100px;">
    <div class="container" style="text-align: center; color: var(--text-dim);">
      &copy; 2026 LumenForge Shot Recipes.
    </div>
  </footer>

</body>
</html>`;
}

// 4. Write files
recipes.forEach(recipe => {
  const slug = recipe.title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
  const html = generateHTML(recipe);
  fs.writeFileSync(`recipes/${slug}.html`, html);
  console.log(`Created recipes/${slug}.html`);
});

// Cleanup temp file
fs.unlinkSync('temp_recipes.js');
console.log('All recipes generated successfully!');
