document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('builder-canvas');
  const ctx = canvas.getContext('2d');
  const wrapper = document.getElementById('canvas-wrapper');

  // Resize canvas to match wrapper
  function resize() {
    const rect = wrapper.getBoundingClientRect();
    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    render();
  }

  window.addEventListener('resize', resize);

  // State
  let objects = [];
  let selectedId = null;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  // UI Elements
  const propPanel = document.getElementById('properties-panel');
  const noSelection = document.getElementById('no-selection');
  const propTitle = document.getElementById('prop-title');
  const propRotate = document.getElementById('prop-rotate');
  const propColor = document.getElementById('prop-color');
  const propColorGroup = document.getElementById('prop-color-group');
  const btnDelete = document.getElementById('btn-delete');

  // Add Item Buttons
  document.querySelectorAll('.tool-btn[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-add');
      addObject(type);
    });
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    if(confirm('Bạn có chắc muốn xóa toàn bộ sơ đồ?')) {
      objects = [];
      selectedId = null;
      updateUI();
      render();
    }
  });

  document.getElementById('btn-export').addEventListener('click', () => {
    // Tạm thời bỏ grid và selection outline để render sạch
    const currentSelected = selectedId;
    selectedId = null;
    render(false); // render without grid

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'LumenForge_Lighting_Diagram.png';
    a.click();

    // Phục hồi trạng thái
    selectedId = currentSelected;
    render();
  });

  function addObject(type) {
    const obj = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      type: type,
      x: canvas.width / (2 * (window.devicePixelRatio || 1)),
      y: canvas.height / (2 * (window.devicePixelRatio || 1)),
      rot: 0, // degrees
      color: '#ffffff'
    };

    if (type === 'softbox' || type === 'strobe') {
      obj.color = '#fffbe6'; // Warm white default
    } else if (type === 'reflector') {
      obj.color = '#c0c0c0'; // Silver
    } else if (type === 'background') {
      obj.color = '#333333';
      obj.y = 50; // default top
    } else if (type === 'vflat') {
      obj.color = '#111111'; // Black default
    } else if (type === 'diffuser') {
      obj.color = '#ffffff'; // Translucent white
    }

    objects.push(obj);
    selectedId = obj.id;
    updateUI();
    render();
  }

  // --- Interaction Logic ---
  
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function getObjectBounds(obj) {
    // Approximation for hit testing
    const size = 30; // base hit radius
    return {
      left: obj.x - size,
      right: obj.x + size,
      top: obj.y - size,
      bottom: obj.y + size
    };
  }

  function hitTest(x, y) {
    // Check backwards so top items are picked first
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      let hitRadius = 30;
      if (obj.type === 'background') hitRadius = 50;
      if (obj.type === 'camera') hitRadius = 40;

      const dx = x - obj.x;
      const dy = y - obj.y;
      if (Math.sqrt(dx*dx + dy*dy) < hitRadius) {
        return obj.id;
      }
    }
    return null;
  }

  function onPointerDown(e) {
    const pos = getMousePos(e);
    const hitId = hitTest(pos.x, pos.y);
    
    selectedId = hitId;
    updateUI();

    if (hitId) {
      isDragging = true;
      const obj = objects.find(o => o.id === hitId);
      dragOffset.x = pos.x - obj.x;
      dragOffset.y = pos.y - obj.y;
    }
    render();
  }

  function onPointerMove(e) {
    if (!isDragging || !selectedId) return;
    const pos = getMousePos(e);
    const obj = objects.find(o => o.id === selectedId);
    if (obj) {
      obj.x = pos.x - dragOffset.x;
      obj.y = pos.y - dragOffset.y;
      render();
    }
  }

  function onPointerUp() {
    isDragging = false;
  }

  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); onPointerDown(e); }, {passive: false});
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); onPointerMove(e); }, {passive: false});
  window.addEventListener('touchend', onPointerUp);

  // --- UI Update ---
  
  function updateUI() {
    if (!selectedId) {
      propPanel.classList.remove('active');
      noSelection.style.display = 'block';
      return;
    }

    const obj = objects.find(o => o.id === selectedId);
    if (!obj) return;

    propPanel.classList.add('active');
    noSelection.style.display = 'none';

    // Type names
    const names = {
      subject: 'Chủ thể',
      camera: 'Máy ảnh',
      softbox: 'Softbox',
      strobe: 'Đèn Strobe',
      reflector: 'Phản quang',
      background: 'Phông nền',
      vflat: 'V-Flat / Cờ đen',
      diffuser: 'Tản sáng (Diffuser)'
    };
    propTitle.textContent = 'Thuộc tính: ' + names[obj.type];

    propRotate.value = obj.rot;

    if (['softbox', 'strobe', 'background', 'reflector', 'vflat'].includes(obj.type)) {
      propColorGroup.style.display = 'block';
      propColor.value = obj.color;
    } else {
      propColorGroup.style.display = 'none';
    }
  }

  propRotate.addEventListener('input', (e) => {
    if (!selectedId) return;
    const obj = objects.find(o => o.id === selectedId);
    if (obj) {
      obj.rot = parseInt(e.target.value);
      render();
    }
  });

  propColor.addEventListener('input', (e) => {
    if (!selectedId) return;
    const obj = objects.find(o => o.id === selectedId);
    if (obj) {
      obj.color = e.target.value;
      render();
    }
  });

  btnDelete.addEventListener('click', () => {
    if (!selectedId) return;
    objects = objects.filter(o => o.id !== selectedId);
    selectedId = null;
    updateUI();
    render();
  });

  // --- Rendering ---
  
  function drawGrid(w, h) {
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    const step = 40;
    
    // Draw Center lines slightly brighter
    ctx.beginPath();
    ctx.moveTo(w/2, 0);
    ctx.lineTo(w/2, h);
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath();
    for (let x = w/2; x < w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let x = w/2; x > 0; x -= step) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let y = h/2; y < h; y += step) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    for (let y = h/2; y > 0; y -= step) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();
  }

  function render(showGrid = true) {
    const rect = wrapper.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Clear
    ctx.fillStyle = '#111113'; // Dark background
    ctx.fillRect(0, 0, w, h);

    if (showGrid) {
      drawGrid(w, h);
    }

    // Draw Distance Lines (if a light/obj is selected)
    if (selectedId && showGrid) {
      const selObj = objects.find(o => o.id === selectedId);
      if (selObj && ['softbox', 'strobe', 'reflector', 'vflat', 'diffuser', 'camera'].includes(selObj.type)) {
        const subject = objects.find(o => o.type === 'subject');
        if (subject) {
          ctx.beginPath();
          ctx.moveTo(selObj.x, selObj.y);
          ctx.lineTo(subject.x, subject.y);
          ctx.strokeStyle = 'rgba(0, 212, 170, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Draw text distance
          const dx = subject.x - selObj.x;
          const dy = subject.y - selObj.y;
          const distPx = Math.sqrt(dx*dx + dy*dy);
          // Scale: 100px = 1 meter
          const distM = (distPx / 100).toFixed(1);
          
          ctx.fillStyle = 'rgba(0, 212, 170, 0.9)';
          ctx.font = '12px monospace';
          ctx.fillText(distM + 'm', selObj.x + dx/2 + 10, selObj.y + dy/2);
        }
      }
    }

    // Draw objects
    objects.forEach(obj => {
      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.rotate(obj.rot * Math.PI / 180);

      // Draw light cones underneath
      if (obj.type === 'softbox' || obj.type === 'strobe') {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const spread = obj.type === 'softbox' ? 0.8 : 0.4;
        const dist = 300;
        ctx.lineTo(-dist * spread, dist);
        ctx.lineTo(dist * spread, dist);
        
        // Gradient cone
        const grd = ctx.createLinearGradient(0, 0, 0, dist);
        
        // Convert hex to rgb for rgba
        let r=255, g=255, b=255;
        if(obj.color.length === 7) {
            r = parseInt(obj.color.slice(1,3), 16);
            g = parseInt(obj.color.slice(3,5), 16);
            b = parseInt(obj.color.slice(5,7), 16);
        }
        
        grd.addColorStop(0, \`rgba(\${r},\${g},\${b}, 0.6)\`);
        grd.addColorStop(1, \`rgba(\${r},\${g},\${b}, 0)\`);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // Draw Object itself
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff';
      
      if (obj.type === 'subject') {
        // Head
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#d4af37'; // Amber
        ctx.fill();
        // Nose (shows direction)
        ctx.beginPath();
        ctx.moveTo(-5, 15);
        ctx.lineTo(0, 22);
        ctx.lineTo(5, 15);
        ctx.fillStyle = '#d4af37';
        ctx.fill();

      } else if (obj.type === 'camera') {
        // Body
        ctx.fillStyle = '#333';
        ctx.fillRect(-20, -10, 40, 20);
        ctx.strokeRect(-20, -10, 40, 20);
        // Lens
        ctx.fillStyle = '#111';
        ctx.fillRect(-10, 10, 20, 15);
        ctx.strokeRect(-10, 10, 20, 15);

      } else if (obj.type === 'softbox') {
        ctx.fillStyle = '#222';
        ctx.fillRect(-25, -10, 50, 15);
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-25, 5);
        ctx.lineTo(25, 5);
        ctx.stroke();

      } else if (obj.type === 'strobe') {
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Small reflector
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI, false);
        ctx.stroke();

      } else if (obj.type === 'reflector') {
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, 30, Math.PI*0.8, Math.PI*2.2, false);
        ctx.stroke();

      } else if (obj.type === 'background') {
        ctx.fillStyle = obj.color;
        ctx.fillRect(-100, -5, 200, 10);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.strokeRect(-100, -5, 200, 10);

      } else if (obj.type === 'vflat') {
        ctx.fillStyle = obj.color;
        ctx.fillRect(-30, -4, 60, 8);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.strokeRect(-30, -4, 60, 8);

      } else if (obj.type === 'diffuser') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(-40, 0);
        ctx.lineTo(40, 0);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Selection ring
      if (obj.id === selectedId && showGrid) {
        ctx.strokeStyle = '#00d4ff'; // Cyan accent
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    });
  }

  // Init
  setTimeout(() => {
    resize();
    
    // Parse URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const recipe = urlParams.get('recipe');
    
    // Assume middle of canvas for recipe positioning
    const cx = (wrapper.getBoundingClientRect().width * (window.devicePixelRatio || 1)) / 2 || 400;
    const cy = (wrapper.getBoundingClientRect().height * (window.devicePixelRatio || 1)) / 2 || 300;
    
    if (recipe === 'rembrandt') {
      objects = [
        { id: '1', type: 'subject', x: cx, y: cy, rot: 0, color: '#ffffff' },
        { id: '2', type: 'camera', x: cx, y: cy + 150, rot: 180, color: '#ffffff' },
        { id: '3', type: 'softbox', x: cx - 100, y: cy + 80, rot: -135, color: '#fffbe6' },
        { id: '4', type: 'reflector', x: cx + 120, y: cy + 50, rot: 135, color: '#c0c0c0' },
        { id: '5', type: 'background', x: cx, y: 50, rot: 0, color: '#333333' }
      ];
    } else if (recipe === 'split') {
      objects = [
        { id: '1', type: 'subject', x: cx, y: cy, rot: 0, color: '#ffffff' },
        { id: '2', type: 'camera', x: cx, y: cy + 150, rot: 180, color: '#ffffff' },
        { id: '3', type: 'softbox', x: cx - 150, y: cy, rot: -90, color: '#fffbe6' },
        { id: '4', type: 'vflat', x: cx + 100, y: cy, rot: 90, color: '#111111' },
        { id: '5', type: 'background', x: cx, y: 50, rot: 0, color: '#333333' }
      ];
    } else {
      // Default setup
      addObject('subject');
      addObject('camera');
      objects[1].y += 150; // move camera down
      objects[1].rot = 180; // point up
    }
    
    render();
  }, 100);

});
