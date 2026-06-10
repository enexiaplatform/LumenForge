document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const uploadOverlay = document.getElementById('upload-overlay');
  const canvas = document.getElementById('poster-canvas');
  const ctx = canvas.getContext('2d');

  const inpTitle = document.getElementById('inp-title');
  const inpSub = document.getElementById('inp-sub');
  const inpFont = document.getElementById('inp-font');
  const inpAlign = document.getElementById('inp-align');
  const chkLetterbox = document.getElementById('chk-letterbox');
  const chkGrain = document.getElementById('chk-grain');
  const btnDownload = document.getElementById('btn-download');

  let currentImg = null;

  // Render the poster
  function render() {
    if (!currentImg) return;

    // Set canvas size to match image
    const width = currentImg.width;
    const height = currentImg.height;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw original image
    ctx.drawImage(currentImg, 0, 0);

    // 2. Draw Letterbox
    if (chkLetterbox.checked) {
      // 2.35:1 aspect ratio target
      const targetHeight = width / 2.35;
      const barHeight = (height - targetHeight) / 2;
      
      if (barHeight > 0) {
        ctx.fillStyle = '#000000';
        // Top bar
        ctx.fillRect(0, 0, width, barHeight);
        // Bottom bar
        ctx.fillRect(0, height - barHeight, width, barHeight);
      }
    }

    // 3. Draw Grain
    if (chkGrain.checked) {
      // Instead of looping pixels (slow for big images), draw a semi-transparent noise pattern
      // or loop pixels for a true grain. Let's do a fast noise overlay
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      const imgData = tempCtx.createImageData(width, height);
      const data = imgData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255;
        data[i] = val;
        data[i+1] = val;
        data[i+2] = val;
        data[i+3] = 30; // 30/255 opacity
      }
      tempCtx.putImageData(imgData, 0, 0);
      
      ctx.globalCompositeOperation = 'overlay';
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    }

    // 4. Draw Typography
    const title = inpTitle.value.toUpperCase();
    const sub = inpSub.value;
    const font = inpFont.value;
    const align = inpAlign.value;

    // Determine Y position
    let textY = height / 2; // center default
    if (align === 'bottom') {
      textY = height * 0.85;
      if (chkLetterbox.checked) {
        const barHeight = (height - width / 2.35) / 2;
        if(barHeight > 0) textY = height - barHeight - 40;
      }
    } else if (align === 'top') {
      textY = height * 0.15;
      if (chkLetterbox.checked) {
        const barHeight = (height - width / 2.35) / 2;
        if(barHeight > 0) textY = barHeight + 80;
      }
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';

    // Shadow for readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;

    // Draw Title
    let fontSize = Math.floor(width * 0.08); // 8% of width
    
    // Adjust tracking (letter-spacing)
    let tracking = 0;
    if (font === 'Montserrat') tracking = 15;
    else if (font === 'Cinzel') tracking = 5;
    else if (font === 'Bebas Neue') { fontSize *= 1.5; tracking = 2; }
    
    // Canvas API doesn't support letter-spacing directly in standard 2D context cleanly everywhere,
    // but newer browsers support canvas.letterSpacing. We'll use it if available, else fallback.
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = tracking + 'px';
    }

    ctx.font = `bold ${fontSize}px "${font}", sans-serif`;
    ctx.fillText(title, width / 2, textY);

    // Draw Subtitle
    let subSize = Math.floor(width * 0.025);
    ctx.font = `300 ${subSize}px "Montserrat", sans-serif`;
    
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = '8px';
    }
    
    ctx.fillText(sub.toUpperCase(), width / 2, textY + fontSize * 0.6);

    // Reset shadow
    ctx.shadowColor = 'transparent';
  }

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        currentImg = img;
        uploadOverlay.style.display = 'none';
        
        // Wait for fonts to load before rendering
        document.fonts.ready.then(render);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Re-render on input change
  const inputs = [inpTitle, inpSub, inpFont, inpAlign, chkLetterbox, chkGrain];
  inputs.forEach(el => {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  btnDownload.addEventListener('click', () => {
    if (!currentImg) return;
    const link = document.createElement('a');
    link.download = 'LumenForge-Poster.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  });

});
