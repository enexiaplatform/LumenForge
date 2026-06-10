/* ==========================================================================
   LUMENFORGE — Light Codex Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.ARTICLES_DB) return;
  const articles = window.ARTICLES_DB;

  const gridStart = document.getElementById('grid-start');
  const gridExplore = document.getElementById('grid-explore');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('codex-search');

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
    return `
      <article class="codex-card animate-on-scroll">
        ${getPatternForCategory(article.category)}
        <div class="codex-card-tag ${getTagClass(article.category)}">${article.tag}</div>
        <span class="codex-card-date">${article.date}</span>
        <h3>${article.title}</h3>
        <p>${article.desc}</p>
        <div class="codex-card-footer">
          <span class="read-time">${article.readTime}</span>
          <a href="${article.link}" class="read-more-btn">Đọc bài viết →</a>
        </div>
      </article>
    `;
  };

  // --- 1. Render "Start Here" ---
  // Pick 3 specific foundational articles
  const startLinks = [
    'articles/focal-length-explained.html',
    'articles/metering-science.html',
    'articles/color-harmony-theory.html'
  ];
  const startArticles = startLinks.map(link => articles.find(a => a.link === link)).filter(Boolean);
  
  if (gridStart) {
    gridStart.innerHTML = startArticles.map(renderCard).join('');
  }

  // --- 2. Render "Explore" Grid ---
  const renderExplore = (data) => {
    if (gridExplore) {
      if (data.length === 0) {
        gridExplore.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-dim);">Không tìm thấy bài viết phù hợp.</div>`;
      } else {
        gridExplore.innerHTML = data.map(renderCard).join('');
      }
    }
  };

  renderExplore(articles); // initial load

  // --- 3. Filtering Logic ---
  let currentCategory = 'all';
  let currentSearch = '';

  const filterArticles = () => {
    let filtered = articles;
    
    // Category filter
    if (currentCategory !== 'all') {
      filtered = filtered.filter(a => a.category === currentCategory);
    }
    
    // Search filter
    if (currentSearch.trim() !== '') {
      const q = currentSearch.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.desc.toLowerCase().includes(q) ||
        a.tag.toLowerCase().includes(q)
      );
    }

    renderExplore(filtered);
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
      filterArticles();
      
      // Auto-scroll to explore section if user is searching
      if (currentSearch.length > 0) {
        document.getElementById('section-explore').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

});
