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

    // --- DRAW STYLIZED 3D FACE ---
    
    // Calculate light vector
    const lightDx = Math.cos(rad);
    const lightDy = Math.sin(rad);

    // 1. Base Head shape
    // Gradient highlight mapped to light direction
    const hx = cx + lightDx * (sphereRadius * 0.6);
    const hy = cy + lightDy * (sphereRadius * 0.6);

    const headGrad = ctx.createRadialGradient(hx, hy, sphereRadius * 0.1, cx, cy, sphereRadius * 1.2);
    headGrad.addColorStop(0, '#f2d5c4'); // Specular/bright skin
    headGrad.addColorStop(0.3, '#d4a382'); // Base skin
    headGrad.addColorStop(0.7, '#6b432a'); // Core shadow
    headGrad.addColorStop(1, '#1a0e08'); // Edge

    ctx.beginPath();
    ctx.ellipse(cx, cy, sphereRadius * 0.85, sphereRadius, 0, 0, Math.PI * 2);
    ctx.fillStyle = headGrad;
    ctx.fill();

    // 2. Nose Cast Shadow (This is what creates Rembrandt/Butterfly)
    const noseLength = 35; // Height of the nose
    // Calculate offset based on light direction. The shadow goes opposite the light.
    const noseShadowX = cx - lightDx * noseLength;
    const noseShadowY = cy - lightDy * noseLength;

    ctx.beginPath();
    ctx.moveTo(cx, cy - 20); // Bridge of nose
    ctx.lineTo(noseShadowX, noseShadowY); // Shadow tip
    ctx.lineTo(cx, cy + 30); // Base of nose
    
    // Fill nose shadow
    ctx.fillStyle = 'rgba(40, 15, 5, 0.7)'; // Dark skin shadow
    ctx.filter = 'blur(4px)';
    ctx.fill();
    ctx.filter = 'none';

    // 3. The Nose itself (3D structure)
    // One side of the nose catches light, the other is in shadow
    const noseGrad = ctx.createLinearGradient(cx + lightDx*10, cy + lightDy*10, cx - lightDx*20, cy - lightDy*20);
    noseGrad.addColorStop(0, '#ffe5d4'); // Highlight on nose tip
    noseGrad.addColorStop(1, '#8a5a3a'); // Shadow side
    
    ctx.beginPath();
    ctx.moveTo(cx, cy - 25); // Bridge
    ctx.lineTo(cx - 15, cy + 25); // Left nostril base
    ctx.lineTo(cx + 15, cy + 25); // Right nostril base
    ctx.closePath();
    ctx.fillStyle = noseGrad;
    ctx.fill();

    // 4. Eye Sockets / Cheekbones shadows
    // Draw shadows where eyes would be, creating dramatic mood
    const eyeOffsetX = 35;
    const eyeOffsetY = -10;
    
    // Left eye socket
    ctx.beginPath();
    ctx.ellipse(cx - eyeOffsetX, cy + eyeOffsetY, 20, 10, 0.1, 0, Math.PI * 2);
    // If light is coming from right, left eye is deeply shadowed
    ctx.fillStyle = lightDx > 0 ? 'rgba(30, 10, 0, 0.6)' : 'rgba(30, 10, 0, 0.2)';
    ctx.filter = 'blur(6px)';
    ctx.fill();

    // Right eye socket
    ctx.beginPath();
    ctx.ellipse(cx + eyeOffsetX, cy + eyeOffsetY, 20, 10, -0.1, 0, Math.PI * 2);
    ctx.fillStyle = lightDx < 0 ? 'rgba(30, 10, 0, 0.6)' : 'rgba(30, 10, 0, 0.2)';
    ctx.fill();
    ctx.filter = 'none';

    // 5. Rim light effect
    // If light is behind the subject (top), draw rim light
    if (lightDy < -0.2) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, sphereRadius * 0.85, sphereRadius, 0, Math.PI, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 4;
      ctx.filter = 'blur(3px)';
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
