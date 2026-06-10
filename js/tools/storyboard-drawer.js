document.addEventListener('DOMContentLoaded', () => {
  const btnAddFrame = document.getElementById('btn-add-frame');
  const framesGrid = document.getElementById('frames-grid');
  
  // Toolbar State
  let currentColor = '#000000';
  let isEraser = false;
  let strokeSize = 2;

  // Setup Toolbar
  const toolPen = document.getElementById('tool-pen');
  const toolEraser = document.getElementById('tool-eraser');
  const colorBtns = document.querySelectorAll('.color-btn');
  const sizeSlider = document.getElementById('stroke-size');

  toolPen.addEventListener('click', () => {
    isEraser = false;
    toolPen.classList.add('active');
    toolEraser.classList.remove('active');
  });

  toolEraser.addEventListener('click', () => {
    isEraser = true;
    toolEraser.classList.add('active');
    toolPen.classList.remove('active');
  });

  colorBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Set color
      currentColor = e.target.getAttribute('data-color');
      // Update UI
      colorBtns.forEach(b => {
        b.classList.remove('active');
        if(b.getAttribute('data-color') !== '#000000') b.style.borderColor = 'transparent';
      });
      e.target.classList.add('active');
      e.target.style.borderColor = '#fff';
      // Auto-switch to pen
      isEraser = false;
      toolPen.classList.add('active');
      toolEraser.classList.remove('active');
    });
  });

  sizeSlider.addEventListener('input', (e) => {
    strokeSize = parseInt(e.target.value);
  });

  let frameCount = 0;

  function createFrame() {
    frameCount++;
    const num = frameCount;

    const card = document.createElement('div');
    card.className = 'frame-card';

    card.innerHTML = `
      <div class="frame-header">
        <span>SCENE 1</span>
        <span>SHOT ${num}</span>
      </div>
      <div class="canvas-wrapper">
        <canvas width="800" height="450"></canvas>
      </div>
      <div class="frame-footer">
        <input type="text" class="frame-input" placeholder="Size (e.g. MCU, WIDE, CU)...">
        <input type="text" class="frame-input" placeholder="Action / Camera Move...">
        <input type="text" class="frame-input" placeholder="Dialogue / Audio...">
      </div>
    `;

    framesGrid.insertBefore(card, btnAddFrame);
    initCanvas(card.querySelector('canvas'));
  }

  function initCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Fill white background initially so exported PDFs look correct
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }

    function startDraw(e) {
      isDrawing = true;
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
    }

    function draw(e) {
      if (!isDrawing) return;
      const pos = getPos(e);

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = strokeSize;

      if (isEraser) {
        // Since background is white, erasing means drawing white
        // Because "destination-out" will make it transparent and show the black container underneath
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#ffffff';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
      }

      ctx.stroke();
      
      lastX = pos.x;
      lastY = pos.y;
    }

    function stopDraw() {
      isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDraw(e.touches[0]);
    }, {passive: false});
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      draw(e.touches[0]);
    }, {passive: false});
    
    canvas.addEventListener('touchend', stopDraw);
  }

  btnAddFrame.addEventListener('click', createFrame);

  // Init with 3 frames
  createFrame();
  createFrame();
  createFrame();

});
