/* ==========================================================================
   LUMENFORGE — 3-Point Lighting Simulator Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const grid = document.getElementById('studio-grid');
  const sphere = document.getElementById('preview-sphere');

  // Light State
  const lights = {
    key: { id: 'key', node: document.getElementById('light-key'), beam: document.getElementById('beam-key'), x: 80, y: 20, intensity: 100, on: true, color: '255, 230, 200' }, // Warm white
    fill: { id: 'fill', node: document.getElementById('light-fill'), beam: document.getElementById('beam-fill'), x: 20, y: 30, intensity: 30, on: true, color: '200, 220, 255' }, // Cool white
    rim: { id: 'rim', node: document.getElementById('light-rim'), beam: document.getElementById('beam-rim'), x: 10, y: 80, intensity: 80, on: true, color: '220, 200, 255' } // Purpleish rim
  };

  // UI Controls
  const controls = {
    key: { int: document.getElementById('int-key'), val: document.getElementById('val-key'), toggle: document.getElementById('toggle-key') },
    fill: { int: document.getElementById('int-fill'), val: document.getElementById('val-fill'), toggle: document.getElementById('toggle-fill') },
    rim: { int: document.getElementById('int-rim'), val: document.getElementById('val-rim'), toggle: document.getElementById('toggle-rim') }
  };

  // Presets
  const presets = {
    rembrandt: { key: {x: 80, y: 20, i: 100}, fill: {x: 20, y: 40, i: 20}, rim: {x: 15, y: 85, i: 60} },
    split: { key: {x: 95, y: 50, i: 100}, fill: {x: 5, y: 50, i: 0}, rim: {x: 50, y: 95, i: 80} },
    butterfly: { key: {x: 50, y: 10, i: 100}, fill: {x: 50, y: 40, i: 40}, rim: {x: 20, y: 90, i: 50} }
  };

  // Core Math
  function updateVisuals() {
    let backgroundStr = '';
    
    // Base Ambient (shadow color)
    backgroundStr += `radial-gradient(circle at 50% 50%, #222 0%, #0a0a0c 100%)`;

    // Process each light
    Object.values(lights).forEach(l => {
      // 1. Position Node
      l.node.style.left = `${l.x}%`;
      l.node.style.top = `${l.y}%`;

      // 2. Calculate Angle & Distance from Center (50, 50)
      const dx = l.x - 50;
      const dy = l.y - 50;
      const distance = Math.sqrt(dx*dx + dy*dy); // 0 to ~50
      let angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 to 180

      // 3. Update Beam
      if (l.on) {
        l.beam.style.display = 'block';
        l.beam.style.width = `${distance}%`;
        l.beam.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        l.beam.style.opacity = (l.intensity / 100) * 0.8;
      } else {
        l.beam.style.display = 'none';
      }

      // 4. Calculate Sphere Shading mapping
      // The sphere is facing "down" (camera is at bottom, y=100)
      // Angle 90deg is bottom (front of face). Angle -90deg is top (back of head).
      
      if (l.on && l.intensity > 0) {
        // Map grid position to sphere highlight position
        // If light is at 80, 20 -> highlight is at 80, 20
        const hx = l.x;
        const hy = l.y;
        
        // Spread is based on distance (closer = wider spread but harsher falloff)
        // Intensity determines opacity
        const opacity = l.intensity / 100;
        
        let spread = 60; 
        if (l.id === 'rim') {
          spread = 30; // Rim is sharper
          backgroundStr = `radial-gradient(circle at ${hx}% ${hy}%, rgba(${l.color}, ${opacity}) 0%, transparent ${spread}%), ` + backgroundStr;
        } else {
          backgroundStr = `radial-gradient(circle at ${hx}% ${hy}%, rgba(${l.color}, ${opacity}) 0%, transparent ${spread}%), ` + backgroundStr;
        }
      }
    });

    sphere.style.background = backgroundStr;
  }

  // Dragging Logic
  let activeLight = null;

  function onPointerDown(e, lightKey) {
    activeLight = lights[lightKey];
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!activeLight) return;
    
    const rect = grid.getBoundingClientRect();
    let clientX = e.clientX || (e.touches && e.touches[0].clientX);
    let clientY = e.clientY || (e.touches && e.touches[0].clientY);

    let px = clientX - rect.left;
    let py = clientY - rect.top;

    let pctX = (px / rect.width) * 100;
    let pctY = (py / rect.height) * 100;

    // Constrain to circle (radius 50%, center 50,50)
    const dx = pctX - 50;
    const dy = pctY - 50;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    if (distance > 50) {
      // Normalize to edge
      pctX = 50 + (dx / distance) * 50;
      pctY = 50 + (dy / distance) * 50;
    }

    activeLight.x = pctX;
    activeLight.y = pctY;
    
    updateVisuals();
  }

  function onPointerUp() {
    activeLight = null;
  }

  // Bind dragging
  Object.keys(lights).forEach(k => {
    lights[k].node.addEventListener('mousedown', (e) => onPointerDown(e, k));
    lights[k].node.addEventListener('touchstart', (e) => onPointerDown(e, k));
  });

  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('touchmove', onPointerMove, {passive: false});
  window.addEventListener('mouseup', onPointerUp);
  window.addEventListener('touchend', onPointerUp);

  // Bind UI Controls
  Object.keys(controls).forEach(k => {
    const ctrl = controls[k];
    
    // Intensity Slider
    ctrl.int.addEventListener('input', (e) => {
      lights[k].intensity = parseInt(e.target.value);
      ctrl.val.textContent = `${lights[k].intensity}%`;
      updateVisuals();
    });

    // Toggle Button
    ctrl.toggle.addEventListener('click', () => {
      lights[k].on = !lights[k].on;
      if (lights[k].on) {
        ctrl.toggle.classList.add('on');
        ctrl.toggle.textContent = 'BẬT';
      } else {
        ctrl.toggle.classList.remove('on');
        ctrl.toggle.textContent = 'TẮT';
      }
      updateVisuals();
    });
  });

  // Bind Presets
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = presets[btn.getAttribute('data-preset')];
      
      // Update data
      lights.key.x = p.key.x; lights.key.y = p.key.y; lights.key.intensity = p.key.i;
      lights.fill.x = p.fill.x; lights.fill.y = p.fill.y; lights.fill.intensity = p.fill.i;
      lights.rim.x = p.rim.x; lights.rim.y = p.rim.y; lights.rim.intensity = p.rim.i;

      // Ensure all are ON for presets
      Object.keys(lights).forEach(k => {
        lights[k].on = true;
        controls[k].toggle.classList.add('on');
        controls[k].toggle.textContent = 'BẬT';
        controls[k].int.value = lights[k].intensity;
        controls[k].val.textContent = `${lights[k].intensity}%`;
      });

      updateVisuals();
    });
  });

  // Init
  updateVisuals();
});
