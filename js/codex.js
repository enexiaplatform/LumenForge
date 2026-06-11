/* ==========================================================================
   LUMENFORGE — Light Codex Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.ARTICLES_DB) return;
  const articles = window.ARTICLES_DB;

  const curriculumView = document.getElementById('curriculum-view');
  const exploreView = document.getElementById('explore-view');
  const gridExplore = document.getElementById('grid-explore');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('codex-search');
  const btnBackCurriculum = document.getElementById('btn-back-curriculum');

  // SVG Patterns for Visual Upgrade based on Category
  const getPatternForCategory = (cat) => {
    switch(cat) {
      case 'optics':
        return `<svg class="card-bg-pattern" viewBox="0 0 100 100" preserveAspectRatio="none"><circle cx="50" cy="50" r="40" stroke="rgba(0,212,170,0.05)" stroke-width="2" fill="none"/><circle cx="50" cy="50" r="20" stroke="rgba(0,212,170,0.05)" stroke-width="2" fill="none"/></svg>`;
      case 'color':
        return `<svg class="card-bg-pattern" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,100 L100,0 M20,100 L100,20 M0,80 L80,0" stroke="rgba(74,158,255,0.05)" stroke-width="4" fill="none"/></svg>`;
      case 'psychology':
        return `<svg class="card-bg-pattern" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,10 90,90 10,90" stroke="rgba(139,92,246,0.05)" stroke-width="2" fill="none"/></svg>`;
      case 'lens':
      case 'cinema':
      case 'sensor':
      default:
        return `<svg class="card-bg-pattern" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="0" y1="50" x2="100" y2="50" stroke="rgba(245,166,35,0.05)" stroke-width="2"/><line x1="50" y1="0" x2="50" y2="100" stroke="rgba(245,166,35,0.05)" stroke-width="2"/></svg>`;
    }
  };

  const getTagClass = (cat) => {
    const map = {
      'optics': 'tag-optics',
      'lens': 'tag-lens',
      'digital-film': 'tag-film',
      'color': 'tag-color',
      'psychology': 'tag-psychology',
      'sensor': 'tag-sensor',
      'light': 'tag-light',
      'cinema': 'tag-cinema'
    };
    return map[cat] || 'tag-optics';
  };

  const renderCard = (article) => {
    const levelStr = article.level === 1 ? 'Sơ cấp' : article.level === 2 ? 'Trung cấp' : 'Cao cấp';
    const levelBadge = `<span class="codex-level-badge level-${article.level}">${levelStr}</span>`;
    return `
      <article class="codex-card animate-on-scroll">
        ${getPatternForCategory(article.category)}
        <div class="codex-card-tag ${getTagClass(article.category)}">
          ${article.id ? `<span class="codex-card-code">[${article.id}]</span> ` : ''}${article.tag}
        </div>
        ${levelBadge}
        <h3>${article.title}</h3>
        <p>${article.desc}</p>
        <div class="codex-card-footer">
          <span class="read-time">${article.readTime}</span>
          <a href="${article.link}" class="read-more-btn">Đọc bài viết →</a>
        </div>
      </article>
    `;
  };

  // --- 1. Render Curriculum View ---
  const renderCurriculum = () => {
    if (!curriculumView) return;
    const levels = [
      { num: 1, title: 'LEVEL 1: Nền tảng Quang học & Ánh sáng', desc: 'Bắt đầu từ số 0. Nắm vững nền tảng cơ học của máy ảnh và vật lý ánh sáng cơ bản.' },
      { num: 2, title: 'LEVEL 2: Khoa học Màu sắc & Cảm biến', desc: 'Kiểm soát ánh sáng nâng cao và hiểu ngôn ngữ của màu sắc.' },
      { num: 3, title: 'LEVEL 3: Tâm lý Thị giác & Điện ảnh', desc: 'Khai mở nhãn quan. Vượt qua kỹ thuật để chạm đến cảm xúc thị giác.' }
    ];

    let html = '';
    levels.forEach(lvl => {
      const lvlArticles = articles.filter(a => a.level === lvl.num);
      // Sort by ID to ensure sequence 101, 102, etc.
      lvlArticles.sort((a, b) => parseInt(a.id) - parseInt(b.id));

      html += `
        <div class="codex-path-section animate-on-scroll">
          <div class="path-header">
            <h2 class="path-title"><span style="color: var(--accent-amber);">#${lvl.num}</span> ${lvl.title}</h2>
            <p class="path-desc">${lvl.desc}</p>
          </div>
          <div class="codex-grid">
            ${lvlArticles.map(renderCard).join('')}
          </div>
        </div>
      `;
    });
    curriculumView.innerHTML = html;
  };

  renderCurriculum();

  // --- 2. Render "Explore/Search" Grid ---
  const renderExplore = (data) => {
    if (!gridExplore) return;
    if (data.length === 0) {
      gridExplore.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-dim);">Không tìm thấy bài viết phù hợp.</div>`;
    } else {
      gridExplore.innerHTML = data.map(renderCard).join('');
    }
  };

  // --- 3. View Management & Filtering Logic ---
  let currentCategory = 'all';
  let currentSearch = '';

  const showExploreView = () => {
    curriculumView.style.display = 'none';
    exploreView.style.display = 'block';
  };

  const showCurriculumView = () => {
    exploreView.style.display = 'none';
    curriculumView.style.display = 'block';
    if(searchInput) searchInput.value = '';
    currentSearch = '';
    currentCategory = 'all';
    filterBtns.forEach(b => {
      if(b.dataset.category === 'all') b.classList.add('active');
      else b.classList.remove('active');
    });
  };

  const filterArticles = () => {
    let filtered = articles;
    
    if (currentCategory !== 'all') {
      filtered = filtered.filter(a => a.category === currentCategory);
    }
    
    if (currentSearch.trim() !== '') {
      const q = currentSearch.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.desc.toLowerCase().includes(q) ||
        a.tag.toLowerCase().includes(q)
      );
    }

    renderExplore(filtered);
    showExploreView();
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.getAttribute('data-category');
      filterArticles();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      if (currentSearch.trim() === '' && currentCategory === 'all') {
        showCurriculumView();
      } else {
        filterArticles();
      }
    });
  }

  if (btnBackCurriculum) {
    btnBackCurriculum.addEventListener('click', showCurriculumView);
  }

});
