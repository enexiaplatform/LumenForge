import sys
import os

target_path = r'E:\Antigravity project\LumenForge\blog.html'
print(f"Writing to: {target_path}")

content = open(target_path, 'w', encoding='utf-8')

html = '''<!DOCTYPE html>
<html lang="vi">
<head>
  <link rel="icon" type="image/svg+xml" href="images/favicon.svg">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Knowledge Vault — LumenForge</title>
  <meta name="title" content="The Knowledge Vault — LumenForge">
  <meta name="description" content="Thư viện kiến thức nhiếp ảnh điện ảnh sâu nhất tiếng Việt — 49 bài phân tích kỹ thuật về ánh sáng, màu sắc, ống kính, bố cục và hậu kỳ.">
  <meta name="keywords" content="LumenForge, nhiếp ảnh, cinematic, ánh sáng, màu sắc, blog, kiến thức, kỹ thuật chụp ảnh">
  <meta name="author" content="LumenForge">

  <meta property="og:type" content="website">
  <meta property="og:url" content="https://lumenforge.studio/blog.html">
  <meta property="og:title" content="The Knowledge Vault — LumenForge">
  <meta property="og:description" content="Thư viện kiến thức nhiếp ảnh điện ảnh sâu nhất tiếng Việt — 49 bài phân tích kỹ thuật.">
  <meta property="og:image" content="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop">

  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://lumenforge.studio/blog.html">
  <meta property="twitter:title" content="The Knowledge Vault — LumenForge">
  <meta property="twitter:description" content="49 bài phân tích kỹ thuật nhiếp ảnh điện ảnh sâu nhất tiếng Việt.">

  <meta name="theme-color" content="#0A0A0C">
  <meta name="color-scheme" content="dark">

  <link rel="stylesheet" href="css/design-system.css">
  <link rel="stylesheet" href="css/home.css">
  <link rel="canonical" href="https://lumenforge.studio/blog.html">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "The Knowledge Vault — LumenForge",
    "description": "Thư viện kiến thức nhiếp ảnh điện ảnh sâu nhất tiếng Việt.",
    "url": "https://lumenforge.studio/blog.html"
  }
  </script>
  <style>
    /* blog hub scoped */
    .blog-hero{position:relative;min-height:52vh;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden;padding:120px 24px 80px;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(0,212,255,.10) 0%,transparent 70%),radial-gradient(ellipse 60% 40% at 80% 80%,rgba(245,166,35,.07) 0%,transparent 60%),#0A0A0C}
    .blog-hero::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(0,212,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.04) 1px,transparent 1px);background-size:60px 60px;animation:gridDrift 20s linear infinite;pointer-events:none}
    @keyframes gridDrift{0%{transform:translateY(0)}100%{transform:translateY(60px)}}
    .blog-hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border:1px solid rgba(0,212,255,.3);border-radius:100px;font-size:.75rem;letter-spacing:.15em;text-transform:uppercase;color:#00D4FF;background:rgba(0,212,255,.06);margin-bottom:24px;animation:fadeInDown .7s ease both}
    .blog-hero-badge::before{content:"";display:block;width:6px;height:6px;border-radius:50%;background:#00D4FF;animation:pulse 2s ease-in-out infinite}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
    @keyframes fadeInDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
    .blog-hero-title{font-size:clamp(2.4rem,6vw,4.5rem);font-weight:800;line-height:1.08;letter-spacing:-.03em;color:#fff;margin:0 0 20px;animation:fadeInUp .7s .1s ease both}
    .blog-hero-title .accent-cyan{background:linear-gradient(135deg,#00D4FF 0%,#00FFCC 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .blog-hero-subtitle{font-size:clamp(1rem,2vw,1.2rem);color:rgba(255,255,255,.55);max-width:640px;margin:0 auto 40px;line-height:1.6;animation:fadeInUp .7s .2s ease both}
    @keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    .search-wrapper{position:relative;max-width:540px;width:100%;margin:0 auto;animation:fadeInUp .7s .3s ease both}
    .search-icon{position:absolute;left:18px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.35);pointer-events:none;font-size:1.1rem}
    .search-input{width:100%;padding:16px 20px 16px 50px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:14px;color:#fff;font-size:1rem;outline:none;transition:border-color .25s,background .25s,box-shadow .25s;backdrop-filter:blur(12px);box-sizing:border-box}
    .search-input::placeholder{color:rgba(255,255,255,.3)}
    .search-input:focus{border-color:rgba(0,212,255,.5);background:rgba(0,212,255,.04);box-shadow:0 0 0 3px rgba(0,212,255,.12),0 8px 32px rgba(0,0,0,.4)}
    .search-count{margin-top:10px;font-size:.82rem;color:rgba(255,255,255,.35);min-height:20px}
    .filter-section{padding:48px 0 20px}
    .filter-tabs{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:0 24px}
    .filter-btn{padding:9px 20px;border-radius:100px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:rgba(255,255,255,.55);font-size:.85rem;font-weight:500;cursor:pointer;transition:all .22s ease;letter-spacing:.02em;white-space:nowrap}
    .filter-btn:hover{border-color:rgba(0,212,255,.4);color:rgba(255,255,255,.85);background:rgba(0,212,255,.06)}
    .filter-btn.active{background:rgba(0,212,255,.14);border-color:rgba(0,212,255,.55);color:#00D4FF;box-shadow:0 0 16px rgba(0,212,255,.18)}
    .articles-section{padding:40px 0 80px}
    .articles-container{max-width:1320px;margin:0 auto;padding:0 24px}
    .articles-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:22px}
    .article-card{position:relative;background:rgba(255,255,255,.033);border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s ease,border-color .28s ease;text-decoration:none;display:flex;flex-direction:column;backdrop-filter:blur(8px);cursor:pointer}
    .article-card:hover{transform:translateY(-4px);box-shadow:0 20px 48px rgba(0,0,0,.5);border-color:rgba(255,255,255,.14)}
    .article-card-bar{height:3px;width:100%;flex-shrink:0}
    .cat-anh-sang .article-card-bar{background:linear-gradient(90deg,#00D4FF,#00FFCC)}
    .cat-mau-sac .article-card-bar{background:linear-gradient(90deg,#F5A623,#FF6B6B)}
    .cat-ong-kinh .article-card-bar{background:linear-gradient(90deg,#A855F7,#EC4899)}
    .cat-bo-cuc .article-card-bar{background:linear-gradient(90deg,#A855F7,#6366F1)}
    .cat-hau-ky .article-card-bar{background:linear-gradient(90deg,#22C55E,#10B981)}
    .cat-cong-thuc .article-card-bar{background:linear-gradient(90deg,#F5A623,#FACC15)}
    .article-card-body{padding:22px 22px 20px;display:flex;flex-direction:column;flex:1}
    .article-card-meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
    .cat-badge{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:4px 10px;border-radius:100px}
    .cat-anh-sang .cat-badge{background:rgba(0,212,255,.12);color:#00D4FF}
    .cat-mau-sac .cat-badge{background:rgba(245,166,35,.12);color:#F5A623}
    .cat-ong-kinh .cat-badge{background:rgba(168,85,247,.12);color:#A855F7}
    .cat-bo-cuc .cat-badge{background:rgba(168,85,247,.12);color:#A855F7}
    .cat-hau-ky .cat-badge{background:rgba(34,197,94,.12);color:#22C55E}
    .cat-cong-thuc .cat-badge{background:rgba(245,166,35,.12);color:#F5A623}
    .read-time{font-size:.75rem;color:rgba(255,255,255,.35);display:flex;align-items:center;gap:5px}
    .article-card-title{font-size:1.02rem;font-weight:700;color:rgba(255,255,255,.92);line-height:1.4;margin:0 0 10px;transition:color .2s}
    .article-card:hover .article-card-title{color:#fff}
    .article-card-desc{font-size:.82rem;color:rgba(255,255,255,.4);line-height:1.6;margin:0 0 18px;flex:1}
    .article-card-link{display:inline-flex;align-items:center;gap:6px;font-size:.8rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;text-decoration:none;transition:gap .22s,opacity .22s;opacity:.6}
    .cat-anh-sang .article-card-link{color:#00D4FF}
    .cat-mau-sac .article-card-link{color:#F5A623}
    .cat-ong-kinh .article-card-link{color:#A855F7}
    .cat-bo-cuc .article-card-link{color:#A855F7}
    .cat-hau-ky .article-card-link{color:#22C55E}
    .cat-cong-thuc .article-card-link{color:#F5A623}
    .article-card:hover .article-card-link{gap:10px;opacity:1}
    .article-card.hidden{display:none}
    .no-results{text-align:center;padding:60px 24px;color:rgba(255,255,255,.35);font-size:1rem;display:none;grid-column:1/-1}
    .no-results.visible{display:block}
    .stats-bar{max-width:1320px;margin:0 auto 0;padding:40px 24px 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:20px}
    .stat-item{text-align:center;padding:24px 16px;border-radius:14px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);transition:border-color .25s}
    .stat-item:hover{border-color:rgba(0,212,255,.2)}
    .stat-number{font-size:2.2rem;font-weight:800;letter-spacing:-.04em;background:linear-gradient(135deg,#00D4FF 0%,#00FFCC 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:block}
    .stat-label{font-size:.78rem;color:rgba(255,255,255,.4);margin-top:4px;text-transform:uppercase;letter-spacing:.06em}
    .featured-section{padding:0 0 80px}
    .featured-header{max-width:1320px;margin:0 auto;padding:0 24px 32px}
    .featured-label{display:inline-flex;align-items:center;gap:8px;font-size:.72rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#F5A623;margin-bottom:12px}
    .featured-label::before{content:"";display:block;width:24px;height:2px;background:#F5A623}
    .featured-title{font-size:clamp(1.6rem,3vw,2.2rem);font-weight:800;color:#fff;margin:0;letter-spacing:-.02em}
    .featured-grid{max-width:1320px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:24px}
    .featured-card{position:relative;border-radius:20px;overflow:hidden;min-height:280px;display:flex;flex-direction:column;justify-content:flex-end;text-decoration:none;transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s ease}
    .featured-card:hover{transform:translateY(-6px);box-shadow:0 28px 64px rgba(0,0,0,.7)}
    .featured-card-bg{position:absolute;inset:0;background-size:cover;background-position:center;transition:transform .5s ease}
    .featured-card:hover .featured-card-bg{transform:scale(1.04)}
    .featured-card-overlay{position:absolute;inset:0}
    .featured-card-content{position:relative;z-index:2;padding:28px}
    .featured-card-cat{font-size:.7rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px}
    .featured-card-title{font-size:1.22rem;font-weight:800;color:#fff;line-height:1.3;margin:0 0 14px}
    .featured-card-meta{display:flex;align-items:center;gap:12px;font-size:.78rem;color:rgba(255,255,255,.55)}
    .featured-card-cta{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:100px;font-size:.78rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:none;cursor:pointer;transition:opacity .2s,gap .22s}
    .featured-card:hover .featured-card-cta{gap:10px}
    .fc-light .featured-card-bg{background:linear-gradient(135deg,#0a1628,#1a2840),url(https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop) center/cover no-repeat;background-blend-mode:overlay}
    .fc-light .featured-card-overlay{background:linear-gradient(0deg,rgba(0,0,0,.82),rgba(0,0,0,.2))}
    .fc-light .featured-card-cat{color:#00D4FF}
    .fc-light .featured-card-cta{background:rgba(0,212,255,.18);color:#00D4FF}
    .fc-comp .featured-card-bg{background:linear-gradient(135deg,#180a28,#2a1840),url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop) center/cover no-repeat;background-blend-mode:overlay}
    .fc-comp .featured-card-overlay{background:linear-gradient(0deg,rgba(0,0,0,.82),rgba(0,0,0,.2))}
    .fc-comp .featured-card-cat{color:#A855F7}
    .fc-comp .featured-card-cta{background:rgba(168,85,247,.18);color:#A855F7}
    .fc-color .featured-card-bg{background:linear-gradient(135deg,#1c0d00,#2c1a00),url(https://images.unsplash.com/photo-1514565131-fce0801e6176?q=80&w=800&auto=format&fit=crop) center/cover no-repeat;background-blend-mode:overlay}
    .fc-color .featured-card-overlay{background:linear-gradient(0deg,rgba(0,0,0,.82),rgba(0,0,0,.2))}
    .fc-color .featured-card-cat{color:#F5A623}
    .fc-color .featured-card-cta{background:rgba(245,166,35,.18);color:#F5A623}
    @media(max-width:768px){.blog-hero{min-height:40vh;padding:100px 16px 60px}.featured-grid{grid-template-columns:1fr}.articles-grid{grid-template-columns:1fr}.featured-card{min-height:240px}}
  </style>
</head>
<body>

  <!-- NAV -->
  <nav class="nav" id="main-nav">
    <div class="nav-container">
      <a href="index.html" class="nav-logo">LUMEN<span class="nav-logo-accent">FORGE</span></a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>
      <div class="nav-menu" id="nav-menu">
        <a href="index.html" class="nav-link">Bắt đầu</a>
        <a href="before-after.html" class="nav-link">Before / After</a>
        <a href="light-codex.html" class="nav-link">Học Ánh Sáng</a>
        <a href="gear-vault.html" class="nav-link">Kho Thiết Bị</a>
        <a href="tool-lab.html" class="nav-link">Công cụ</a>
        <a href="store.html" class="nav-link">Cửa hàng</a>
        <a href="dashboard.html" class="nav-link">Dashboard</a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <section class="blog-hero">
    <div>
      <div class="blog-hero-badge">Knowledge Vault · 49 Bài Phân Tích</div>
      <h1 class="blog-hero-title">The <span class="accent-cyan">Knowledge</span> Vault</h1>
      <p class="blog-hero-subtitle">Thư viện kiến thức nhiếp ảnh điện ảnh sâu nhất tiếng Việt — 49 bài phân tích kỹ thuật về ánh sáng, màu sắc, ống kính và hơn thế nữa.</p>
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input type="search" id="blog-search" class="search-input" placeholder="Tìm kiếm bài viết… (VD: chiaroscuro, bokeh, color grading)" autocomplete="off" spellcheck="false">
        <p class="search-count" id="search-count">Hiển thị tất cả 49 bài viết · Nhấn <kbd style="border:1px solid rgba(255,255,255,.2);padding:1px 5px;border-radius:4px;font-size:.7rem">/</kbd> để tìm kiếm</p>
      </div>
    </div>
  </section>

  <!-- STATS -->
  <div class="stats-bar">
    <div class="stat-item"><span class="stat-number">49</span><span class="stat-label">Bài Phân Tích</span></div>
    <div class="stat-item"><span class="stat-number">6</span><span class="stat-label">Chuyên Mục</span></div>
    <div class="stat-item"><span class="stat-number">~7h</span><span class="stat-label">Thời Lượng Đọc</span></div>
    <div class="stat-item"><span class="stat-number">100%</span><span class="stat-label">Tiếng Việt</span></div>
  </div>

  <!-- FILTER TABS -->
  <section class="filter-section">
    <div class="filter-tabs" id="filter-tabs">
      <button class="filter-btn active" data-filter="all">Tất cả</button>
      <button class="filter-btn" data-filter="anh-sang">⚡ Ánh Sáng</button>
      <button class="filter-btn" data-filter="mau-sac">🎨 Màu Sắc</button>
      <button class="filter-btn" data-filter="ong-kinh">🔭 Ống Kính &amp; Thiết Bị</button>
      <button class="filter-btn" data-filter="bo-cuc">📐 Bố Cục</button>
      <button class="filter-btn" data-filter="hau-ky">🎞️ Hậu Kỳ</button>
      <button class="filter-btn" data-filter="cong-thuc">📸 Công Thức Chụp</button>
    </div>
  </section>

  <!-- ARTICLES GRID -->
  <section class="articles-section">
    <div class="articles-container">
      <div class="articles-grid" id="articles-grid">
'''

content.write(html)

# helper
def card(cls, href, cat_key, cat_label, time, title, desc):
    return f'''
        <a class="article-card {cls}" href="{href}" data-category="{cat_key}" data-title="{title}">
          <div class="article-card-bar"></div>
          <div class="article-card-body">
            <div class="article-card-meta">
              <span class="cat-badge">{cat_label}</span>
              <span class="read-time">⏱ {time}</span>
            </div>
            <h2 class="article-card-title">{title}</h2>
            <p class="article-card-desc">{desc}</p>
            <span class="article-card-link">Đọc ngay →</span>
          </div>
        </a>
'''

articles = [
  # Anh Sang
  ('cat-anh-sang','articles/chiaroscuro-lighting.html','anh-sang','Ánh Sáng','8 phút','Chiaroscuro: Nghệ Thuật Điêu Khắc Bóng Tối','Phân tích kỹ thuật ánh sáng – bóng tối kinh điển từ hội họa Renaissance đến nhiếp ảnh điện ảnh hiện đại.'),
  ('cat-anh-sang','articles/three-point-lighting.html','anh-sang','Ánh Sáng','7 phút','Three-Point Lighting: Bộ Ba Ánh Sáng Kinh Điển','Cấu trúc chiếu sáng ba điểm mà mọi nhiếp ảnh gia chuyên nghiệp cần nắm vững — từ studio đến hiện trường.'),
  ('cat-anh-sang','articles/hard-vs-soft-light.html','anh-sang','Ánh Sáng','12 phút','Hard vs Soft Light: Khoa Học Của Bóng Tối','Hiểu bản chất vật lý của nguồn sáng cứng và mềm — và cách chọn đúng loại để tạo cảm xúc trong ảnh.'),
  ('cat-anh-sang','articles/inverse-square-law.html','anh-sang','Ánh Sáng','6 phút','Inverse Square Law: Định Luật Vàng Của Ánh Sáng','Định luật nghịch đảo bình phương và ứng dụng thực tế để kiểm soát độ rơi sáng, gradient và background separation.'),
  ('cat-anh-sang','articles/motivated-lighting.html','anh-sang','Ánh Sáng','7 phút','Motivated Lighting: Ánh Sáng Có Lý Do','Kỹ thuật thiết kế nguồn sáng “có nguồn gốc” để tạo ra hình ảnh tự nhiên, thuyết phục và điện ảnh cao.'),
  ('cat-anh-sang','articles/fine-art-portrait-lighting.html','anh-sang','Ánh Sáng','9 phút','Fine Art Portrait Lighting','Xây dựng ánh sáng chân dung nghệ thuật — từ Rembrandt, loop đến butterfly lighting với phân tích shadow map chi tiết.'),
  ('cat-anh-sang','articles/flash-physics-hss.html','anh-sang','Ánh Sáng','10 phút','Flash & HSS: Vật Lý Của Ánh Sáng Nhân Tạo','Từ sync speed, HSS đến guide number — phân tích vật lý đèn flash giúp bạn kiểm soát mọi tình huống ánh sáng.'),
  ('cat-anh-sang','articles/cinematic-lighting-keys.html','anh-sang','Ánh Sáng','8 phút','Cinematic Lighting Keys','Các “chìa khóa” ánh sáng điện ảnh — key ratio, fill ratio, contrast ratio và cách đo đạc chính xác bằng light meter.'),
  ('cat-anh-sang','articles/psychology-of-low-key.html','anh-sang','Ánh Sáng','9 phút','Tâm Lý Học Của Low-Key','Bóng tối không chỉ là thiếu sáng — phân tích tâm lý học màu sắc và ánh sáng trong nhiếp ảnh low-key và noir.'),
  ('cat-anh-sang','articles/nd-filter-video.html','anh-sang','Ánh Sáng','8 phút','ND Filter: Khoa Học Kiểm Soát Ánh Sáng','Giải thích ND stop, variable ND, optical density và ứng dụng trong video để duy trì shutter angle 180°.'),
  ('cat-anh-sang','articles/polarization-physics.html','anh-sang','Ánh Sáng','7 phút','Polarization: Vật Lý Kính Phân Cực','Vật lý phân cực ánh sáng, CPL filter và ứng dụng trong nhiếp ảnh phong cảnh, kiến trúc và chụp qua kính.'),
  # Mau Sac
  ('cat-mau-sac','articles/color-harmony-theory.html','mau-sac','Màu Sắc','8 phút','Color Harmony Theory: Lý Thuyết Hòa Âm Màu Sắc','Complementary, analogous, triadic, split-complementary — nền tảng lý thuyết màu sắc để xây dựng palette điện ảnh.'),
  ('cat-mau-sac','articles/color-spaces.html','mau-sac','Màu Sắc','9 phút','Color Spaces: Không Gian Màu Sắc','sRGB, Adobe RGB, DCI-P3, Rec.709, Rec.2020 — giải thích gamut màu và lý do chọn đúng color space cho từng output.'),
  ('cat-mau-sac','articles/color-space-bitdepth.html','mau-sac','Màu Sắc','7 phút','Color Space & Bit Depth Explained','8-bit, 10-bit, 12-bit — hiểu sâu về bit depth và tại sao nó quyết định chất lượng grading và tonal range của ảnh.'),
  ('cat-mau-sac','articles/hsl-vs-color-grading.html','mau-sac','Màu Sắc','6 phút','HSL vs Color Grading','Điểm khác biệt cốt lõi giữa HSL adjustment và color grading thực sự — và khi nào nên dùng từng phương pháp.'),
  ('cat-mau-sac','articles/tone-curve-mastery.html','mau-sac','Màu Sắc','6 phút','Tone Curve Mastery','Làm chủ đường cong tonal từ cơ bản đến nâng cao — S-curve, lifted blacks, colour channel curves và creative grading.'),
  ('cat-mau-sac','articles/cinema-color-grading.html','mau-sac','Màu Sắc','10 phút','Cinema Color Grading','Workflow grading điện ảnh chuyên nghiệp — từ primary correction, secondary grading đến LUT và look development.'),
  ('cat-mau-sac','articles/noritsu-vs-frontier.html','mau-sac','Màu Sắc','9 phút','Noritsu vs Frontier: Cuộc Chiến Màu Film','So sánh chi tiết hai máy scan film huyền thoại — và cách mô phỏng màu sắc của chúng trong Lightroom và DaVinci Resolve.'),
  ('cat-mau-sac','articles/canon-vs-sony-color-science.html','mau-sac','Màu Sắc','7 phút','Canon vs Sony Color Science','Phân tích khoa học màu sắc của hai hãng máy ảnh lớn nhất — tại sao JPG Canon có màu da đẹp hơn và cách bù đắp.'),
  ('cat-mau-sac','articles/white-balance-science.html','mau-sac','Màu Sắc','8 phút','White Balance: Khoa Học Nhiệt Độ Màu','Kelvin, tint, illuminant — khoa học đứng sau white balance và cách sử dụng sáng tạo nhiệt độ màu cho tone film.'),
  ('cat-mau-sac','articles/log-profile-science.html','mau-sac','Màu Sắc','7 phút','Log Profile: Khoa Học Đường Cong Tonal','S-Log, C-Log, Log3, FLAT — hiểu sâu về logarithmic profile và vì sao chúng cần thiết cho grading chuyên nghiệp.'),
  ('cat-mau-sac','articles/nature-of-grain.html','mau-sac','Màu Sắc','8 phút','The Nature of Grain: Nghệ Thuật Của Hạt Phim','Phân tích hạt film bạc halide và luminance noise kỹ thuật số — cách thêm grain đúng cách để tạo aesthetic film vintage.'),
  # Ong Kinh
  ('cat-ong-kinh','articles/focal-length-explained.html','ong-kinh','Ống Kính','7 phút','Focal Length Explained','Tiêu cự, góc nhìn và crop factor — giải thích toàn diện từ vật lý quang học đến ứng dụng thực tế khi chọn ống kính.'),
  ('cat-ong-kinh','articles/focal-length-distortion.html','ong-kinh','Ống Kính','6 phút','Focal Length & Distortion','Distortion không chỉ là barrel hay pincushion — phân tích biến dạng phối cảnh và ứng dụng sáng tạo trong chân dung.'),
  ('cat-ong-kinh','articles/why-50mm-is-the-peoples-lens.html','ong-kinh','Ống Kính','9 phút','Tại Sao 50mm Là Ống Kính Của Nhân Dân','Lịch sử, vật lý và triết học của tiêu cự 50mm — tại sao nó gần với mắt người và được nhiếp ảnh gia huyền thoại yêu thích.'),
  ('cat-ong-kinh','articles/bokeh-demystified.html','ong-kinh','Ống Kính','10 phút','Bokeh Demystified: Khoa Học Của Xóa Phông','Vòng tròn tán xạ, cánh khẩu độ và rendering bokeh — khoa học quang học giải thích tại sao một số ống kính cho bokeh đẹp hơn.'),
  ('cat-ong-kinh','articles/depth-of-field-science.html','ong-kinh','Ống Kính','8 phút','Depth of Field: Khoa Học Của Chiều Sâu','Vùng nét, hyperfocal distance, DOF preview — phân tích đầy đủ độ sâu trường ảnh để kiểm soát tuyệt đối mọi tình huống.'),
  ('cat-ong-kinh','articles/optical-aberrations.html','ong-kinh','Ống Kính','8 phút','Optical Aberrations: Các Lỗi Quang Học','Chromatic aberration, coma, astigmatism, vignetting — hiểu và tận dụng các “lỗi” quang học cho phong cách nghệ thuật.'),
  ('cat-ong-kinh','articles/anamorphic-lenses.html','ong-kinh','Ống Kính','7 phút','Anamorphic Lenses: Ống Kính Điện Ảnh','Khoa học ống kính anamorphic, lens flare ngang, oval bokeh và tỷ lệ 2.39:1 đặc trưng của điện ảnh cinemascope.'),
  ('cat-ong-kinh','articles/ccd-vs-cmos.html','ong-kinh','Ống Kính','11 phút','CCD vs CMOS: Cuộc Chiến Cảm Biến','Lịch sử và kỹ thuật của hai loại cảm biến — readout noise, dynamic range, rolling shutter và tại sao CMOS thống trị ngày nay.'),
  ('cat-ong-kinh','articles/human-eye-vs-sensor.html','ong-kinh','Ống Kính','7 phút','Mắt Người vs Cảm Biến Máy Ảnh','So sánh khả năng thích nghi, dynamic range, độ phân giải và phản ứng màu sắc giữa mắt người và cảm biến kỹ thuật số hiện đại.'),
  ('cat-ong-kinh','articles/canon-r50-vs-iphone.html','ong-kinh','Ống Kính','10 phút','Canon R50 vs iPhone: Cuộc Chiến Thế Kỷ','Phân tích chuyên sâu computational photography của iPhone đối đầu với mirrorless entry-level — khi nào thì máy ảnh thực sự vượt trội?'),
  ('cat-ong-kinh','articles/gear-map.html','ong-kinh','Ống Kính','5 phút','Gear Map: Bản Đồ Thiết Bị','Tổng quan hệ sinh thái thiết bị nhiếp ảnh và video — bản đồ toàn cảnh từ máy ảnh, ống kính đến phụ kiện chiếu sáng.'),
  # Bo Cuc
  ('cat-bo-cuc','articles/golden-ratio-composition.html','bo-cuc','Bố Cục','11 phút','Golden Ratio: Tỷ Lệ Vàng Trong Bố Cục','Phi (φ = 1.618) trong thiên nhiên, nghệ thuật và nhiếp ảnh — cách áp dụng Fibonacci spiral và golden rectangle vào bố cục.'),
  ('cat-bo-cuc','articles/gestalt-composition.html','bo-cuc','Bố Cục','7 phút','Gestalt Composition Theory','Lý thuyết Gestalt trong thiết kế bố cục — proximity, similarity, closure, continuity và figure-ground relationship trong nhiếp ảnh.'),
  ('cat-bo-cuc','articles/gestalt-psychology-photography.html','bo-cuc','Bố Cục','7 phút','Gestalt Psychology trong Nhiếp Ảnh','Ứng dụng thực tế của tâm lý học Gestalt — cách não người nhận diện mẫu hình và xây dựng câu chuyện từ hình ảnh tĩnh.'),
  ('cat-bo-cuc','articles/visual-flow.html','bo-cuc','Bố Cục','9 phút','Visual Flow: Dòng Chảy Thị Giác','Leading lines, diagonal tension, S-curves và Z-pattern — thiết kế đường dẫn mắt để kể câu chuyện qua bố cục ảnh.'),
  ('cat-bo-cuc','articles/decisive-moment-street.html','bo-cuc','Bố Cục','8 phút','The Decisive Moment: Khoảnh Khắc Quyết Định','Triết học nhiếp ảnh đường phố của Cartier-Bresson — cách nhận diện và bắt lấy khoảnh khắc hội tụ hoàn hảo.'),
  ('cat-bo-cuc','articles/storyboarding-art.html','bo-cuc','Bố Cục','8 phút','Storyboarding: Nghệ Thuật Kể Chuyện Bằng Khung Hình','Kỹ thuật storyboard từ điện ảnh ứng dụng vào nhiếp ảnh — lên kế hoạch visual narrative trước khi bấm máy.'),
  ('cat-bo-cuc','articles/cinematic-camera-movement.html','bo-cuc','Bố Cục','7 phút','Cinematic Camera Movement','Pan, tilt, dolly, crane, handheld — ngôn ngữ chuyển động máy ảnh trong điện ảnh và cách ứng dụng vào video photography.'),
  ('cat-bo-cuc','articles/double-exposure-technique.html','bo-cuc','Bố Cục','7 phút','Double Exposure Technique','Kỹ thuật phơi sáng kép — từ trong máy ảnh đến post-processing trong Photoshop để tạo hiệu ứng siêu thực và nghệ thuật.'),
  ('cat-bo-cuc','articles/frame-rate-psychology.html','bo-cuc','Bố Cục','8 phút','Frame Rate Psychology','24fps, 30fps, 60fps — tâm lý học và cảm nhận thẩm mỹ của từng frame rate và tại sao 24fps tạo cảm giác “điện ảnh” nhất.'),
  # Hau Ky
  ('cat-hau-ky','articles/shutter-speed-mastery.html','hau-ky','Hậu Kỳ','9 phút','Shutter Speed Mastery','Làm chủ tốc độ màn trập — motion blur sáng tạo, freeze action, long exposure và reciprocity failure trong phim analog.'),
  ('cat-hau-ky','articles/shutter-angle-rule.html','hau-ky','Hậu Kỳ','6 phút','Shutter Angle Rule','Quy tắc 180° shutter angle trong quay phim — tại sao motion blur tự nhiên là yếu tố quyết định cho cảm giác điện ảnh.'),
  ('cat-hau-ky','articles/iso-noise-science.html','hau-ky','Hậu Kỳ','7 phút','ISO & Noise Science','Khoa học đằng sau ISO — shot noise, read noise, ISO invariance và khi nào thì noise reduction phá hủy chi tiết ảnh.'),
  ('cat-hau-ky','articles/histogram-ettr.html','hau-ky','Hậu Kỳ','6 phút','Histogram & ETTR','Đọc histogram như chuyên gia — ETTR (Expose To The Right), channel clipping và cách maximize dynamic range cho post-processing.'),
  ('cat-hau-ky','articles/metering-science.html','hau-ky','Hậu Kỳ','9 phút','Metering Science','Evaluative, center-weighted, spot — khoa học đo sáng và cách chọn đúng chế độ cho mỗi tình huống chụp khó.'),
  # Cong Thuc
  ('cat-cong-thuc','articles/recipe-cinematic-portrait.html','cong-thuc','Công Thức','5 phút','Công Thức Chụp: Cinematic Portrait','Setup hoàn chỉnh cho chân dung điện ảnh — từ thiết lập ánh sáng, thông số máy, đến tone màu và hậu kỳ trong 5 phút.'),
  ('cat-cong-thuc','articles/recipe-cyberpunk-neon.html','cong-thuc','Công Thức','5 phút','Công Thức Chụp: Cyberpunk Neon','Tạo aesthetic cyberpunk với đèn neon, màu tím-xanh và rain effects — công thức đầy đủ từ location scouting đến grading.'),
  ('cat-cong-thuc','articles/recipe-product-commercial.html','cong-thuc','Công Thức','55 phút','Công Thức Chụp: Product Commercial','Workflow chụp sản phẩm thương mại chuyên nghiệp — diffusion setup, focus stacking, và retouching để đạt chuẩn client.'),
]

for a in articles:
    content.write(card(*a))

rest = '''
        <p class="no-results" id="no-results">Không tìm thấy bài viết phù hợp. Hãy thử từ khóa khác.</p>
      </div>
    </div>
  </section>

  <!-- FEATURED -->
  <section class="featured-section">
    <div class="featured-header">
      <p class="featured-label">Bài Viết Nổi Bật</p>
      <h2 class="featured-title">Bước Vào Những Bài Hay Nhất</h2>
    </div>
    <div class="featured-grid">

      <a class="featured-card fc-light" href="articles/hard-vs-soft-light.html">
        <div class="featured-card-bg"></div>
        <div class="featured-card-overlay"></div>
        <div class="featured-card-content">
          <p class="featured-card-cat">⚡ Ánh Sáng</p>
          <h3 class="featured-card-title">Hard vs Soft Light: Khoa Học Của Bóng Tối</h3>
          <div class="featured-card-meta">
            <span>⏱ 12 phút đọc</span>
            <span class="featured-card-cta">Đọc ngay →</span>
          </div>
        </div>
      </a>

      <a class="featured-card fc-comp" href="articles/golden-ratio-composition.html">
        <div class="featured-card-bg"></div>
        <div class="featured-card-overlay"></div>
        <div class="featured-card-content">
          <p class="featured-card-cat">📐 Bố Cục</p>
          <h3 class="featured-card-title">Golden Ratio: Tỷ Lệ Vàng Trong Bố Cục</h3>
          <div class="featured-card-meta">
            <span>⏱ 11 phút đọc</span>
            <span class="featured-card-cta">Đọc ngay →</span>
          </div>
        </div>
      </a>

      <a class="featured-card fc-color" href="articles/cinema-color-grading.html">
        <div class="featured-card-bg"></div>
        <div class="featured-card-overlay"></div>
        <div class="featured-card-content">
          <p class="featured-card-cat">🎨 Màu Sắc</p>
          <h3 class="featured-card-title">Cinema Color Grading</h3>
          <div class="featured-card-meta">
            <span>⏱ 10 phút đọc</span>
            <span class="featured-card-cta">Đọc ngay →</span>
          </div>
        </div>
      </a>

    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="nav-logo">LUMEN<span class="nav-logo-accent">FORGE</span></span>
          <p class="footer-tagline">Từ ảnh bình thường đến cinematic — bằng ánh sáng, màu sắc và workflow.</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>Bắt đầu</h4>
            <a href="before-after.html">Before / After</a>
            <a href="free-guide.html">Starter Kit Miễn Phí</a>
            <a href="light-codex.html">Học Ánh Sáng</a>
            <a href="store.html">Cửa hàng</a>
          </div>
          <div class="footer-col">
            <h4>Khám phá thêm</h4>
            <a href="tool-lab.html">Xưởng Công cụ</a>
            <a href="shot-recipes.html">Công thức Chụp</a>
            <a href="gear-vault.html">Kho Thiết Bị</a>
            <a href="glossary.html">Thuật ngữ</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025–2026 LumenForge. Cinematic photography, forged through light and color.</p>
      </div>
    </div>
  </footer>

  <script src="js/common.js"></script>
  <script>
    (function(){
      'use strict';
      var searchInput = document.getElementById('blog-search');
      var searchCount = document.getElementById('search-count');
      var filterTabs  = document.getElementById('filter-tabs');
      var grid        = document.getElementById('articles-grid');
      var noResults   = document.getElementById('no-results');
      var allCards    = Array.from(grid.querySelectorAll('.article-card'));
      var currentFilter = 'all';
      var currentQuery  = '';

      function norm(s){
        return (s||'').toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
          .replace(/\u0111/gi,'d').replace(/[^a-z0-9 ]/g,' ').trim();
      }

      function apply(){
        var q = norm(currentQuery);
        var visible = 0;
        allCards.forEach(function(card){
          var cat   = card.dataset.category || '';
          var title = norm(card.dataset.title || '');
          var desc  = norm((card.querySelector('.article-card-desc')||{}).textContent || '');
          var okCat = currentFilter === 'all' || cat === currentFilter;
          var okQ   = !q || title.indexOf(q) > -1 || desc.indexOf(q) > -1;
          if(okCat && okQ){ card.classList.remove('hidden'); visible++; }
          else { card.classList.add('hidden'); }
        });
        if(!q && currentFilter === 'all'){
          searchCount.textContent = 'Hiển thị tất cả 49 bài viết · Nhấn / để tìm kiếm';
        } else {
          searchCount.textContent = 'Tìm thấy ' + visible + ' bài viết';
        }
        noResults.classList.toggle('visible', visible === 0);
      }

      searchInput.addEventListener('input', function(){ currentQuery = this.value; apply(); });

      filterTabs.addEventListener('click', function(e){
        var btn = e.target.closest('.filter-btn');
        if(!btn) return;
        filterTabs.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        apply();
      });

      if('IntersectionObserver' in window){
        var io = new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if(entry.isIntersecting){
              entry.target.style.opacity='1';
              entry.target.style.transform='translateY(0)';
              io.unobserve(entry.target);
            }
          });
        },{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
        allCards.forEach(function(card,i){
          card.style.opacity='0';
          card.style.transform='translateY(28px)';
          card.style.transition='opacity .5s '+i*0.022+'s ease,transform .5s '+i*0.022+'s ease';
          io.observe(card);
        });
      }

      document.addEventListener('keydown',function(e){
        if(e.key==='/' && document.activeElement !== searchInput){ e.preventDefault(); searchInput.focus(); searchInput.select(); }
        if(e.key==='Escape' && document.activeElement===searchInput){ searchInput.blur(); }
      });
    })();
  </script>
</body>
</html>'''

content.write(rest)
content.close()
print('DONE')
