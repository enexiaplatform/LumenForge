document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('render-canvas');
  
  // State
  let lift = { x: 0, y: 0, exp: 0 };
  let gamma = { x: 0, y: 0, exp: 0 };
  let gain = { x: 0, y: 0, exp: 0 };

  function initWheel(wheelId, handleId, stateObj, onChange) {
    const wheel = document.getElementById(wheelId);
    const handle = document.getElementById(handleId);
    let isDragging = false;
    const radius = 75; // half of 150px

    function updateHandle(e) {
      const rect = wheel.getBoundingClientRect();
      let x = e.clientX - rect.left - radius;
      let y = e.clientY - rect.top - radius;
      
      const dist = Math.sqrt(x*x + y*y);
      if (dist > radius) {
        x = x * (radius / dist);
        y = y * (radius / dist);
      }
      
      handle.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      
      stateObj.x = x / radius; // -1 to 1
      stateObj.y = -y / radius; // -1 to 1 (invert y)
      onChange();
    }

    wheel.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateHandle(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) updateHandle(e);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  function applyFilters() {
    // A VERY simplified CSS simulation of 3-way color correction.
    // In a real app we'd use Canvas/WebGL. Here we map vectors to hue/sepia/brightness.
    
    // Average vectors to find a dominant hue
    let avgX = lift.x + gamma.x + gain.x;
    let avgY = lift.y + gamma.y + gain.y;
    
    let hueAngle = Math.atan2(avgX, avgY) * (180 / Math.PI);
    if (hueAngle < 0) hueAngle += 360;
    
    let magnitude = Math.min(1, Math.sqrt(avgX*avgX + avgY*avgY) / 3);
    
    // Base exposure
    let totalExp = (lift.exp + gamma.exp + gain.exp) / 300; // -1 to 1
    
    let brightness = 1 + totalExp;
    let contrast = 1 + (gamma.exp / 200); // Gamma controls contrast slightly
    let sepia = magnitude * 0.8;
    
    canvas.style.filter = `brightness(${brightness}) contrast(${contrast}) sepia(${sepia}) hue-rotate(${hueAngle}deg)`;
  }

  // Setup Wheels
  initWheel('wheel-lift', 'handle-lift', lift, applyFilters);
  initWheel('wheel-gamma', 'handle-gamma', gamma, applyFilters);
  initWheel('wheel-gain', 'handle-gain', gain, applyFilters);

  // Setup Sliders
  document.getElementById('exp-lift').addEventListener('input', (e) => { lift.exp = parseInt(e.target.value); applyFilters(); });
  document.getElementById('exp-gamma').addEventListener('input', (e) => { gamma.exp = parseInt(e.target.value); applyFilters(); });
  document.getElementById('exp-gain').addEventListener('input', (e) => { gain.exp = parseInt(e.target.value); applyFilters(); });

  // Buttons
  document.getElementById('btn-reset').addEventListener('click', () => {
    lift = { x: 0, y: 0, exp: 0 };
    gamma = { x: 0, y: 0, exp: 0 };
    gain = { x: 0, y: 0, exp: 0 };
    
    document.querySelectorAll('.color-picker-handle').forEach(h => h.style.transform = 'translate(-50%, -50%)');
    document.querySelectorAll('input[type=range]').forEach(i => i.value = 0);
    
    applyFilters();
  });

  document.getElementById('btn-teal-orange').addEventListener('click', () => {
    // Push Lift towards Teal (-x, -y approx)
    lift.x = -0.5; lift.y = -0.5;
    document.getElementById('handle-lift').style.transform = `translate(calc(-50% + -37.5px), calc(-50% + 37.5px))`;
    
    // Push Gain towards Orange (+x, +y approx)
    gain.x = 0.5; gain.y = 0.5;
    document.getElementById('handle-gain').style.transform = `translate(calc(-50% + 37.5px), calc(-50% + -37.5px))`;
    
    applyFilters();
  });
});
