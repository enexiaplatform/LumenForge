// FOV & Lens Compression Simulator Logic

document.addEventListener('DOMContentLoaded', () => {
  const slider1 = document.getElementById('slider1');
  const slider2 = document.getElementById('slider2');
  const distSlider = document.getElementById('distance-slider');
  
  const lbl1 = document.getElementById('vp1-label');
  const lbl2 = document.getElementById('vp2-label');
  const distVal = document.getElementById('dist-val');
  
  const bg1 = document.getElementById('bg1');
  const sub1 = document.getElementById('sub1');
  const bg2 = document.getElementById('bg2');
  const sub2 = document.getElementById('sub2');
  
  const btnDolly = document.getElementById('btn-dolly');
  
  // Base constants
  const BASE_FOCAL = 50; // Standard perspective
  const BASE_DIST = 3;
  
  function updateViewport(focal, dist, bgEl, subEl, labelEl) {
    labelEl.textContent = `${focal}mm`;
    
    // Scale subject based on distance and focal length
    // Magnification is roughly proportional to focal length / distance
    // We normalize against BASE_FOCAL and BASE_DIST
    const mag = (focal / BASE_FOCAL) * (BASE_DIST / dist);
    
    // Subject size
    subEl.style.transform = `scale(${mag})`;
    
    // Background scaling (Compression)
    // Background is much further away, let's say at infinity.
    // So its magnification is directly proportional to focal length.
    const bgMag = (focal / BASE_FOCAL);
    
    // To simulate FOV, we scale the background image
    // Minimum scale is 1 (to fill viewport)
    const effectiveBgMag = Math.max(1, bgMag * 0.8);
    bgEl.style.transform = `translate(-50%, -50%) scale(${effectiveBgMag})`;
    
    // Dolly zoom specific logic to keep subject same size in frame
    // If the user wants to keep subject size constant, they must change distance with focal length.
    // However, our tool handles sliders independently.
    // The visual magic happens when Dolly Zoom is clicked.
  }
  
  function renderAll() {
    const f1 = parseFloat(slider1.value);
    const f2 = parseFloat(slider2.value);
    const d = parseFloat(distSlider.value);
    
    distVal.textContent = `${d.toFixed(1)}m`;
    
    updateViewport(f1, d, bg1, sub1, lbl1);
    updateViewport(f2, d, bg2, sub2, lbl2);
  }
  
  slider1.addEventListener('input', renderAll);
  slider2.addEventListener('input', renderAll);
  distSlider.addEventListener('input', renderAll);
  
  // Initial render
  renderAll();
  
  // Dolly Zoom Effect
  let isDolly = false;
  let dollyInterval;
  
  btnDolly.addEventListener('click', () => {
    if (isDolly) {
      clearInterval(dollyInterval);
      btnDolly.textContent = "🎬 KÍCH HOẠT DOLLY ZOOM (VERTIGO EFFECT)";
      isDolly = false;
      return;
    }
    
    isDolly = true;
    btnDolly.textContent = "⏹ DỪNG DOLLY ZOOM";
    
    // We will animate Viewport 1 from 14mm to 200mm
    // And simultaneously adjust distance to keep subject size constant.
    let currentFocal = 14;
    slider1.value = currentFocal;
    
    dollyInterval = setInterval(() => {
      currentFocal += 1;
      if (currentFocal > 200) {
        currentFocal = 14;
      }
      slider1.value = currentFocal;
      
      // To keep subject scale constant (mag = 1):
      // (focal / BASE_FOCAL) * (BASE_DIST / dist) = 1
      // dist = (focal / BASE_FOCAL) * BASE_DIST
      const newDist = (currentFocal / BASE_FOCAL) * BASE_DIST;
      distSlider.value = newDist;
      
      renderAll();
    }, 50); // 20fps
  });
});
