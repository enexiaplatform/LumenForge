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

        const cardHTML = `
          <a href="${tool.link}" class="tool-gallery-card" style="border-color: rgba(255,255,255,0.1); transition: border-color 0.3s;" onmouseover="this.style.borderColor='var(--accent-${tool.accent})'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'">
            <div class="tool-gallery-img" style="background-image: url('${imgUrl}');">
              <div class="tool-status-badge" style="${badgeStyle}">${badgeText}</div>
            </div>
            <div class="tool-gallery-content">
              <h3 style="font-size: 1.1rem;">${tool.title}</h3>
              <p style="font-size: 0.85rem;">${tool.desc}</p>
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
