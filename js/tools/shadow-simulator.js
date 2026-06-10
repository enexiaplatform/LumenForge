document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('shadow-canvas');
  const ctx = canvas.getContext('2d');
  const wrapper = document.getElementById('sim-wrapper');

  let width, height;
  let cx, cy;
  const sphereRadius = 100;

  // Light position (angle in degrees, distance from center)
  let lightAngle = 45; // Default Rembrandt
  let lightDist = 200;

  function resize() {
    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    cx = width / 2;
    cy = height / 2 + 20; // slightly lower
    render();
  }

  window.addEventListener('resize', resize);
  
  // Controls
  const buttons = document.querySelectorAll('.light-type');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      lightAngle = parseFloat(btn.getAttribute('data-angle'));
      render();
    });
  });

  // Interaction
  let isDragging = false;

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function handleInteraction(pos) {
    // Calculate angle from center
    const dx = pos.x - cx;
    const dy = pos.y - cy;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Normalize angle (0 is top, right is 90 for this specific mental model)
    // Actually, standard math: right is 0, bottom is 90.
    // Let's keep it standard math internally.
    lightAngle = angle;
    lightDist = Math.max(120, Math.min(Math.sqrt(dx*dx + dy*dy), Math.min(width, height)/2 - 20));
    
    // Deselect buttons if custom
    buttons.forEach(b => b.classList.remove('active'));
    render();
  }

  canvas.addEventListener('mousedown', (e) => { isDragging = true; handleInteraction(getMousePos(e)); });
  canvas.addEventListener('mousemove', (e) => { if(isDragging) handleInteraction(getMousePos(e)); });
  window.addEventListener('mouseup', () => isDragging = false);
  
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isDragging = true; handleInteraction(getMousePos(e)); }, {passive: false});
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if(isDragging) handleInteraction(getMousePos(e)); }, {passive: false});
  window.addEventListener('touchend', () => isDragging = false);

  function render() {
    // Clear
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);

    // Draw Floor Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
    ctx.stroke();

    // Calculate light source 2D pos
    const rad = lightAngle * Math.PI / 180;
    const lx = cx + Math.cos(rad) * lightDist;
    const ly = cy + Math.sin(rad) * lightDist;

    // Draw Line from light to center
    ctx.strokeStyle = 'rgba(245, 166, 35, 0.3)'; // Amber dashed
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Light Source Icon
    ctx.beginPath();
    ctx.arc(lx, ly, 15, 0, Math.PI*2);
    ctx.fillStyle = '#f5a623';
    ctx.fill();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#f5a623';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Drop Shadow on the "floor" (fake 3D)
    // Assume light comes from top-ish, so cast shadow to the opposite direction
    const shadowDist = sphereRadius * 1.5;
    const sx = cx - Math.cos(rad) * shadowDist;
    const sy = cy - Math.sin(rad) * shadowDist;
    
    ctx.beginPath();
    // Ellipse for cast shadow
    ctx.ellipse(sx, sy, sphereRadius, sphereRadius*0.4, rad, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.filter = 'blur(15px)';
    ctx.fill();
    ctx.filter = 'none';

    // Form Shadow (The Sphere)
    // To make a realistic 3D sphere, the gradient center should move based on lightAngle.
    // The gradient highlight is mapped to the surface of the sphere pointing to the light.
    const hx = cx + Math.cos(rad) * (sphereRadius * 0.6);
    const hy = cy + Math.sin(rad) * (sphereRadius * 0.6);

    const sphereGrad = ctx.createRadialGradient(hx, hy, sphereRadius * 0.1, cx, cy, sphereRadius);
    sphereGrad.addColorStop(0, '#ffffff'); // Specular highlight
    sphereGrad.addColorStop(0.2, '#d4af37'); // Base subject color
    sphereGrad.addColorStop(0.7, '#222222'); // Core shadow
    sphereGrad.addColorStop(1, '#050505'); // Reflected shadow edge (darkest)

    ctx.beginPath();
    ctx.arc(cx, cy, sphereRadius, 0, Math.PI*2);
    ctx.fillStyle = sphereGrad;
    ctx.fill();

    // Small Rim light logic (if light is behind the subject > 110 degrees)
    // Just a trick: draw a bright arc on the side of the light if it's far away
    if (Math.abs(Math.cos(rad)) < 0.2 && Math.sin(rad) < 0) {
      // It's rim lighting territory
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius, rad - 0.5, rad + 0.5);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.filter = 'blur(2px)';
      ctx.stroke();
      ctx.filter = 'none';
    }
  }

  // Init
  setTimeout(() => {
    resize();
    // Initialize angle based on selected button
    // 45 degrees in visual space. Standard math 45 is bottom-right.
    // We want top-left for Rembrandt usually. Let's set it to -135
    lightAngle = -135; 
    render();
  }, 100);

});
