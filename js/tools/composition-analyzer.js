/* ==========================================================================
   LUMENFORGE — Composition Analyzer Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Sample Images (3:2 ratio ideally)
  const images = [
    { url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop', label: 'Photography' },
    { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop', label: 'Portrait' },
    { url: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1200&auto=format&fit=crop', label: 'Landscape' },
    { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop', label: 'Architecture' },
    { url: 'https://images.unsplash.com/photo-1516641396056-0ce60a85d49f?q=80&w=1200&auto=format&fit=crop', label: 'Street' }
  ];

  const DOM = {
    mainImg: document.getElementById('main-img'),
    svg: document.getElementById('grid-svg'),
    imgSelector: document.getElementById('img-selector'),
    gridBtns: document.querySelectorAll('.grid-btn'),
    spiralControls: document.getElementById('spiral-controls'),
    flipBtns: document.querySelectorAll('.flip-btn'),
    inpOpacity: document.getElementById('inp-opacity'),
    valOpacity: document.getElementById('val-opacity'),
    colorDots: document.querySelectorAll('.color-dot')
  };

  // State
  let currentGrid = 'thirds';
  let spiralFlip = 'tl'; // tl, tr, bl, br
  let currentOpacity = 0.8;
  let currentColor = 'rgba(255,255,255,1)';

  // SVG Paths for 1200x800 viewBox (3:2 ratio)
  const grids = {
    none: ``,
    thirds: `
      <!-- Vertical -->
      <line x1="400" y1="0" x2="400" y2="800" />
      <line x1="800" y1="0" x2="800" y2="800" />
      <!-- Horizontal -->
      <line x1="0" y1="266.6" x2="1200" y2="266.6" />
      <line x1="0" y1="533.3" x2="1200" y2="533.3" />
      <!-- Intersection Dots -->
      <circle cx="400" cy="266.6" r="6" fill="currentColor" stroke="none" />
      <circle cx="800" cy="266.6" r="6" fill="currentColor" stroke="none" />
      <circle cx="400" cy="533.3" r="6" fill="currentColor" stroke="none" />
      <circle cx="800" cy="533.3" r="6" fill="currentColor" stroke="none" />
    `,
    phi: `
      <!-- Phi Ratio 1:1.618:1 -> Approx 27.5% : 45% : 27.5% -->
      <!-- Vertical -->
      <line x1="330" y1="0" x2="330" y2="800" />
      <line x1="870" y1="0" x2="870" y2="800" />
      <!-- Horizontal -->
      <line x1="0" y1="220" x2="1200" y2="220" />
      <line x1="0" y1="580" x2="1200" y2="580" />
      <!-- Intersection Dots -->
      <circle cx="330" cy="220" r="6" fill="currentColor" stroke="none" />
      <circle cx="870" cy="220" r="6" fill="currentColor" stroke="none" />
      <circle cx="330" cy="580" r="6" fill="currentColor" stroke="none" />
      <circle cx="870" cy="580" r="6" fill="currentColor" stroke="none" />
    `,
    spiral: `
      <!-- Golden Spiral approximated for 1200x800 -->
      <!-- Main Square -->
      <rect x="400" y="0" width="800" height="800" />
      <!-- Next Squares -->
      <rect x="0" y="0" width="400" height="400" />
      <rect x="0" y="400" width="247.2" height="247.2" />
      <rect x="247.2" y="400" width="152.8" height="152.8" />
      <rect x="247.2" y="552.8" width="94.4" height="94.4" />
      <!-- Spiral Path -->
      <path d="M 1200 800 A 800 800 0 0 0 400 0 A 400 400 0 0 0 0 400 A 247.2 247.2 0 0 0 247.2 647.2 A 152.8 152.8 0 0 0 400 494.4 A 94.4 94.4 0 0 0 305.6 400" />
    `,
    dynamic: `
      <!-- Diagonals -->
      <line x1="0" y1="0" x2="1200" y2="800" />
      <line x1="1200" y1="0" x2="0" y2="800" />
      <!-- Reciprocals (Perpendicular from corners to main diagonal) -->
      <!-- Main diagonal is y = (2/3)x -->
      <!-- Perpendicular is y = (-3/2)x + 800 -->
      <line x1="0" y1="800" x2="369.2" y2="246.1" />
      <line x1="1200" y1="800" x2="830.8" y2="246.1" />
      <line x1="0" y1="0" x2="369.2" y2="553.9" />
      <line x1="1200" y1="0" x2="830.8" y2="553.9" />
    `
  };

  // Initialize Gallery
  function initGallery() {
    images.forEach((img, idx) => {
      const imgEl = document.createElement('img');
      imgEl.src = img.url;
      imgEl.className = 'img-thumb' + (idx === 0 ? ' active' : '');
      imgEl.addEventListener('click', () => {
        // Remove active class
        document.querySelectorAll('.img-thumb').forEach(el => el.classList.remove('active'));
        imgEl.classList.add('active');
        
        // Set main image
        DOM.mainImg.style.opacity = 0;
        setTimeout(() => {
          DOM.mainImg.src = img.url;
          DOM.mainImg.style.opacity = 1;
        }, 300);
      });
      DOM.imgSelector.appendChild(imgEl);
    });
  }

  // Update SVG
  function renderGrid() {
    DOM.svg.innerHTML = grids[currentGrid];
    
    // Apply styling
    DOM.svg.style.stroke = currentColor.replace('1)', `${currentOpacity})`);
    DOM.svg.style.color = currentColor.replace('1)', `${currentOpacity})`); // for fill="currentColor"

    // Handle Spiral flip logic using viewBox or transform
    DOM.svg.className = 'grid-overlay'; // reset
    if (currentGrid === 'spiral') {
      DOM.svg.classList.add(`flip-${spiralFlip}`);
      DOM.spiralControls.classList.add('active');
    } else {
      DOM.spiralControls.classList.remove('active');
    }
  }

  // Bind Grid Buttons
  DOM.gridBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.gridBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGrid = btn.getAttribute('data-grid');
      renderGrid();
    });
  });

  // Bind Flip Buttons
  DOM.flipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.flipBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      spiralFlip = btn.getAttribute('data-flip');
      renderGrid();
    });
  });

  // Bind Opacity
  DOM.inpOpacity.addEventListener('input', (e) => {
    currentOpacity = parseInt(e.target.value) / 100;
    DOM.valOpacity.textContent = `${e.target.value}%`;
    renderGrid();
  });

  // Bind Colors
  DOM.colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      DOM.colorDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      currentColor = dot.getAttribute('data-color');
      renderGrid();
    });
  });

  // Init
  initGallery();
  renderGrid();
});
