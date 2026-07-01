/**
 * LUMENFORGE — Virtual Lighting Studio (2D Top-Down to 3D CSS Renderer)
 */

document.addEventListener('DOMContentLoaded', () => {
  const gridArea = document.getElementById('grid-area');
  const sphere = document.getElementById('subject-sphere');
  
  const nodeKey = document.getElementById('node-key');
  const nodeFill = document.getElementById('node-fill');
  const nodeBack = document.getElementById('node-back');

  const sliderKey = document.getElementById('slider-key');
  const sliderFill = document.getElementById('slider-fill');
  const sliderBack = document.getElementById('slider-back');

  // Check PRO status
  if (typeof lfAuth !== 'undefined' && lfAuth.isLoggedIn() && lfAuth.currentUser.isPro) {
    const lock = document.getElementById('pro-lock');
    if(lock) lock.classList.remove('active');
    
    // Enable color pickers
    document.querySelectorAll('input[type="color"]').forEach(el => el.disabled = false);
  } else {
    const lock = document.getElementById('pro-lock');
    if(lock) lock.classList.add('active');
  }

  // Setup Dragging
  let draggedNode = null;

  function onMouseDown(e, node) {
    draggedNode = node;
    document.body.style.userSelect = 'none';
  }

  function onMouseMove(e) {
    if (!draggedNode) return;

    const rect = gridArea.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Constrain within grid
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    // Convert to percentage
    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;

    draggedNode.style.left = `${xPct}%`;
    draggedNode.style.top = `${yPct}%`;

    renderLighting();
  }

  function onMouseUp() {
    draggedNode = null;
    document.body.style.userSelect = 'auto';
  }

  // Attach drag events
  [nodeKey, nodeFill, nodeBack].forEach(node => {
    node.addEventListener('mousedown', (e) => onMouseDown(e, node));
  });

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  // Attach slider events
  [sliderKey, sliderFill, sliderBack].forEach(slider => {
    slider.addEventListener('input', renderLighting);
  });

  // Calculate and Render CSS Shadows
  function renderLighting() {
    const rect = gridArea.getBoundingClientRect();
    if(rect.width === 0) return;

    // Subject is at 50%, 50%
    const getLightVector = (node) => {
      const left = parseFloat(node.style.left || 0);
      const top = parseFloat(node.style.top || 0);
      
      // Calculate delta from center (50, 50). Range is -50 to 50
      const dx = left - 50; 
      const dy = top - 50;
      
      return { dx, dy };
    };

    const vKey = getLightVector(nodeKey);
    const vFill = getLightVector(nodeFill);
    const vBack = getLightVector(nodeBack);

    const intKey = parseInt(sliderKey.value) / 100;
    const intFill = parseInt(sliderFill.value) / 100;
    const intBack = parseInt(sliderBack.value) / 100;

    // Build box-shadow string
    // box-shadow: inset offsetX offsetY blur spread color
    // If light is on the left (dx < 0), we want highlight on the left.
    // inset shadow with positive offsetX creates shadow on the left side.
    // Wait, inset shadow: offsetX positive means the shadow comes from the LEFT edge pushing RIGHT.
    // So if light is left (dx < 0), we want the highlight to come from the left.
    // Thus offsetX should be proportional to -dx. (dx is negative, -dx is positive, inset pushes from left).
    
    const mult = 2.5; // multiplier for shadow depth

    const shadowKey = `inset ${-vKey.dx * mult}px ${-vKey.dy * mult}px 60px -10px rgba(255,255,255,${intKey})`;
    const shadowFill = `inset ${-vFill.dx * mult}px ${-vFill.dy * mult}px 80px -20px rgba(200,200,200,${intFill})`;
    
    // Backlight is a rim light. We can simulate it using a standard box-shadow (outer glow)
    // plus a sharp inset rim.
    const rimKey = `inset ${-vBack.dx}px ${-vBack.dy}px 15px -5px rgba(150,150,255,${intBack})`;
    const glowBack = `0 0 50px rgba(150,150,255,${intBack * 0.5})`;

    // Core shadow (ambient occlusion) to give it a 3D spherical feel naturally
    const ambient = `inset 0 0 80px 20px rgba(0,0,0,1)`;

    sphere.style.boxShadow = `${shadowKey}, ${shadowFill}, ${rimKey}, ${ambient}, ${glowBack}`;
  }

  // Initial render (need slight delay for layout to settle)
  setTimeout(renderLighting, 100);
});
