// Cinematic Lighting Studio JS

document.addEventListener('DOMContentLoaded', () => {
  const layerKey = document.getElementById('layer-key');
  const layerFill = document.getElementById('layer-fill');
  const layerRim = document.getElementById('layer-rim');
  
  const tglKey = document.getElementById('tgl-key');
  const tglFill = document.getElementById('tgl-fill');
  const tglRim = document.getElementById('tgl-rim');
  
  const posKey = document.getElementById('pos-key');
  const intKey = document.getElementById('int-key');
  const posFill = document.getElementById('pos-fill');
  const intFill = document.getElementById('int-fill');
  const intRim = document.getElementById('int-rim');
  const colRim = document.getElementById('col-rim');
  
  const presetBtns = document.querySelectorAll('.preset-btn');
  
  function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }
  
  function updateLights() {
    // Key Light
    if (tglKey.checked) {
      const x = posKey.value; // 0 to 100
      const a = (intKey.value / 100) * 0.9;
      layerKey.style.background = `radial-gradient(circle at ${x}% 30%, rgba(255, 230, 200, ${a}) 0%, rgba(255, 230, 200, 0) 60%)`;
      layerKey.style.opacity = 1;
    } else {
      layerKey.style.opacity = 0;
    }
    
    // Fill Light
    if (tglFill.checked) {
      const x = posFill.value;
      const a = (intFill.value / 100) * 0.5;
      layerFill.style.background = `radial-gradient(circle at ${x}% 50%, rgba(200, 230, 255, ${a}) 0%, rgba(200, 230, 255, 0) 70%)`;
      layerFill.style.opacity = 1;
    } else {
      layerFill.style.opacity = 0;
    }
    
    // Rim Light
    if (tglRim.checked) {
      const a = (intRim.value / 100);
      const c = hexToRgb(colRim.value);
      layerRim.style.background = `linear-gradient(105deg, rgba(${c.r}, ${c.g}, ${c.b}, 0) 70%, rgba(${c.r}, ${c.g}, ${c.b}, ${a}) 95%)`;
      layerRim.style.opacity = 1;
    } else {
      layerRim.style.opacity = 0;
    }
  }
  
  function setPreset(name) {
    presetBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-preset="${name}"]`).classList.add('active');
    
    tglKey.checked = true;
    tglFill.checked = true;
    tglRim.checked = true;
    
    if (name === 'rembrandt') {
      posKey.value = 70; intKey.value = 80;
      posFill.value = 20; intFill.value = 30;
      intRim.value = 90; colRim.value = '#E664FF';
    } else if (name === 'split') {
      posKey.value = 90; intKey.value = 90;
      tglFill.checked = false;
      intRim.value = 60; colRim.value = '#00D4AA';
    } else if (name === 'butterfly') {
      posKey.value = 50; intKey.value = 85;
      posFill.value = 50; intFill.value = 40;
      intRim.value = 100; colRim.value = '#FFFFFF';
    } else if (name === 'silhouette') {
      tglKey.checked = false;
      tglFill.checked = false;
      intRim.value = 100; colRim.value = '#F5A623';
    }
    
    updateLights();
  }
  
  [posKey, intKey, posFill, intFill, intRim, colRim, tglKey, tglFill, tglRim].forEach(el => {
    el.addEventListener('input', updateLights);
    el.addEventListener('change', updateLights);
  });
  
  presetBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      setPreset(e.target.getAttribute('data-preset'));
    });
  });
  
  // Initial
  updateLights();
});
