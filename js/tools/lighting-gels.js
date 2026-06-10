document.addEventListener('DOMContentLoaded', () => {
  const gels = document.querySelectorAll('.gel');
  const viewer = document.getElementById('studio-viewer');

  let activeGel = null;
  let offsetX = 0;
  let offsetY = 0;

  // Track highest z-index so clicked gel comes to top
  let highestZ = 10;

  gels.forEach(gel => {
    
    // Start drag
    gel.addEventListener('mousedown', (e) => {
      activeGel = gel;
      highestZ++;
      gel.style.zIndex = highestZ;
      
      const rect = gel.getBoundingClientRect();
      const viewerRect = viewer.getBoundingClientRect();
      
      // Calculate offset inside the gel
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    });

    // Touch support start
    gel.addEventListener('touchstart', (e) => {
      activeGel = gel;
      highestZ++;
      gel.style.zIndex = highestZ;
      
      const rect = gel.getBoundingClientRect();
      offsetX = e.touches[0].clientX - rect.left;
      offsetY = e.touches[0].clientX - rect.top;
      e.preventDefault(); // prevent scrolling while dragging
    }, {passive: false});

  });

  // Dragging
  document.addEventListener('mousemove', (e) => {
    if (!activeGel) return;
    
    const viewerRect = viewer.getBoundingClientRect();
    
    // Calculate new position relative to the viewer
    let newX = e.clientX - viewerRect.left - offsetX;
    let newY = e.clientY - viewerRect.top - offsetY;

    // Optional bounds checking (can allow dragging outside slightly)
    
    activeGel.style.left = newX + 'px';
    activeGel.style.top = newY + 'px';
  });

  // Touch drag
  document.addEventListener('touchmove', (e) => {
    if (!activeGel) return;
    
    const viewerRect = viewer.getBoundingClientRect();
    let newX = e.touches[0].clientX - viewerRect.left - offsetX;
    let newY = e.touches[0].clientY - viewerRect.top - offsetY;
    
    activeGel.style.left = newX + 'px';
    activeGel.style.top = newY + 'px';
  }, {passive: false});

  // End drag
  document.addEventListener('mouseup', () => {
    activeGel = null;
  });

  document.addEventListener('touchend', () => {
    activeGel = null;
  });

});
