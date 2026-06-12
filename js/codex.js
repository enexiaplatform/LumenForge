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
    
    // Check if read
    let isRead = false;
    if (window.lfAuth && window.lfAuth.isLoggedIn()) {
      isRead = window.lfAuth.readHistory.some(h => h.id === article.link.split('/').pop());
    }
    const readBadge = isRead ? `<div style="position: absolute; top: 20px; right: 20px; background: rgba(0, 212, 170, 0.2); color: var(--accent-cyan); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; border: 1px solid var(--accent-cyan); z-index: 2;">✓ Đã đọc</div>` : '';

    return `
      <article class="codex-card animate-on-scroll" style="position: relative; ${isRead ? 'border-color: rgba(0,212,170,0.3); opacity: 0.8;' : ''}">
        ${readBadge}
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

  const getIconForCategory = (cat) => {
    switch(cat) {
      case 'optics':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="14.31" y1="8" x2="20.05" y2="17.94"/><line x1="9.69" y1="8" x2="21.17" y2="8"/><line x1="7.38" y1="12" x2="13.12" y2="2.06"/><line x1="9.69" y1="16" x2="3.95" y2="6.06"/><line x1="14.31" y1="16" x2="2.83" y2="16"/><line x1="16.62" y1="12" x2="10.88" y2="21.94"/></svg>`;
      case 'color':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
      case 'psychology':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
      case 'cinema':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`;
      case 'sensor':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`;
      case 'lens':
      default:
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>`;
    }
  };

  // --- 1. Render Curriculum View ---
  const renderCurriculum = () => {
    if (!curriculumView) return;
    
    const foundationArticles = articles.filter(a => a.level === 1);
    const intermediateArticles = articles.filter(a => a.level === 2);
    const advancedArticles = articles.filter(a => a.level === 3);

    document.getElementById('grid-track-foundation').innerHTML = foundationArticles.map(renderCard).join('');
    document.getElementById('grid-track-intermediate').innerHTML = intermediateArticles.map(renderCard).join('');
    document.getElementById('grid-track-advanced').innerHTML = advancedArticles.map(renderCard).join('');

    // Calculate progress
    if (window.lfAuth && window.lfAuth.isLoggedIn()) {
      const historyIds = window.lfAuth.readHistory.map(h => h.id);
      
      const calcProgress = (trackArticles) => {
        if(trackArticles.length === 0) return 0;
        const readCount = trackArticles.filter(a => historyIds.includes(a.link.split('/').pop())).length;
        return Math.round((readCount / trackArticles.length) * 100);
      };

      const pF = calcProgress(foundationArticles);
      const pI = calcProgress(intermediateArticles);
      const pA = calcProgress(advancedArticles);

      document.getElementById('progress-text-foundation').textContent = `${pF}%`;
      document.getElementById('progress-bar-foundation').style.width = `${pF}%`;
      
      document.getElementById('progress-text-intermediate').textContent = `${pI}%`;
      document.getElementById('progress-bar-intermediate').style.width = `${pI}%`;

      document.getElementById('progress-text-advanced').textContent = `${pA}%`;
      document.getElementById('progress-bar-advanced').style.width = `${pA}%`;
    }
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
    if (curriculumView) curriculumView.style.display = 'none';
    if (exploreView) exploreView.style.display = 'block';
    
    const btnC = document.getElementById('btn-view-curriculum');
    const btnE = document.getElementById('btn-view-explore');
    if(btnC && btnE) {
      btnC.className = 'btn-secondary';
      btnC.style.background = 'rgba(255,255,255,0.05)';
      btnC.style.border = '1px solid var(--border-color)';
      btnC.style.color = 'var(--text-dim)';
      
      btnE.className = 'btn-primary';
      btnE.style.background = '';
      btnE.style.border = '';
      btnE.style.color = '';
    }
  };

  const showCurriculumView = () => {
    if (exploreView) exploreView.style.display = 'none';
    if (curriculumView) curriculumView.style.display = 'block';
    
    const btnC = document.getElementById('btn-view-curriculum');
    const btnE = document.getElementById('btn-view-explore');
    if(btnC && btnE) {
      btnE.className = 'btn-secondary';
      btnE.style.background = 'rgba(255,255,255,0.05)';
      btnE.style.border = '1px solid var(--border-color)';
      btnE.style.color = 'var(--text-dim)';
      
      btnC.className = 'btn-primary';
      btnC.style.background = '';
      btnC.style.border = '';
      btnC.style.color = '';
    }
  };

  const btnViewCurriculum = document.getElementById('btn-view-curriculum');
  const btnViewExplore = document.getElementById('btn-view-explore');
  if (btnViewCurriculum) btnViewCurriculum.addEventListener('click', showCurriculumView);
  if (btnViewExplore) btnViewExplore.addEventListener('click', showExploreView);

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
      filterArticles();
    });
  }

  // Default render
  filterArticles();
});
