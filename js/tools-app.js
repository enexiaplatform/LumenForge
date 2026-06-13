document.addEventListener('DOMContentLoaded', () => {
  const appGrid = document.getElementById('app-grid');
  const searchInput = document.getElementById('search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const noResults = document.getElementById('no-results');
  
  if (!appGrid || !window.TOOLS_DB) return;

  let currentFilter = 'all';
  let currentSearch = '';

  // Render Function
  function renderTools() {
    appGrid.innerHTML = '';
    
    const filteredTools = window.TOOLS_DB.filter(tool => {
      // Filter by category
      const matchCategory = currentFilter === 'all' || tool.category === currentFilter;
      
      // Filter by search
      const query = currentSearch.toLowerCase();
      const matchSearch = tool.title.toLowerCase().includes(query) || 
                          tool.desc.toLowerCase().includes(query) ||
                          tool.id.toLowerCase().includes(query);
                          
      return matchCategory && matchSearch;
    });

    if (filteredTools.length === 0) {
      noResults.style.display = 'block';
    } else {
      noResults.style.display = 'none';
      
      filteredTools.forEach(tool => {
        // Determine badge style
        let badgeStyle = `background: var(--accent-${tool.accent}); color: #000;`;
        let badgeText = "Hoạt động";
        if(tool.category === 'ai') {
          badgeText = "AI / Pro";
        }
        
        // Use unsplash images based on category as default placeholders
        let imgUrl = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop";
        if(tool.category === 'light') imgUrl = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600&auto=format&fit=crop";
        if(tool.category === 'color') imgUrl = "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=600&auto=format&fit=crop";
        if(tool.category === 'ai') imgUrl = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop";

        
        const top5 = ['shoot-planner', 'lens-decoder', 'exposure-reactor', 'film-look', 'gear-matchmaker'];
        const isTop = top5.includes(tool.id);
        
        let extraHTML = '';
        if (isTop) {
            extraHTML = `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: bold; margin-bottom: 5px;">MỤC ĐÍCH:</div>
                <div style="font-size: 0.85rem; color: #ccc; margin-bottom: 15px;">Giải quyết nhanh vấn đề của bạn trong tích tắc.</div>
                <div style="display: flex; gap: 10px;">
                    <span style="display: inline-block; background: var(--accent-cyan); color: #000; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">Dùng thử ngay</span>
                    <a href="../store.html" style="display: inline-block; background: rgba(255,255,255,0.1); color: #fff; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; text-decoration: none;">Đến Store</a>
                </div>
              </div>
            `;
        }

        const cardHTML = `
          <a href="${tool.link}" class="tool-gallery-card ${isTop ? 'featured-tool' : ''}" style="border-color: ${isTop ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'}; transition: border-color 0.3s;" onmouseover="this.style.borderColor='var(--accent-${tool.accent})'" onmouseout="this.style.borderColor='${isTop ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'}'">
            <div class="tool-gallery-img" style="background-image: url('${imgUrl}');">
              <div class="tool-status-badge" style="${badgeStyle}">${badgeText}</div>
              ${isTop ? '<div style="position: absolute; top: 10px; left: 10px; background: var(--accent-amber); color: #000; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">⭐ Core Tool</div>' : ''}
            </div>
            <div class="tool-gallery-content">
              <h3 style="font-size: 1.1rem;">${tool.title}</h3>
              <p style="font-size: 0.85rem;">${tool.desc}</p>
              ${extraHTML}
            </div>
          </a>
        `;

        appGrid.innerHTML += cardHTML;
      });
    }
  }

  // Event Listeners
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    renderTools();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active class
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentFilter = btn.getAttribute('data-filter');
      renderTools();
    });
  });

  // Initial Render
  renderTools();
});
