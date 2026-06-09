/* ==========================================================================
   LUMENFORGE — Color Matrix Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // State
  const state = {
    h: { hue: 40, sat: 0 },
    m: { hue: 0, sat: 0 },
    s: { hue: 210, sat: 0 }
  };

  // Elements mapping
  const elements = {
    h: {
      inpHue: document.getElementById('inp-h-hue'),
      inpSat: document.getElementById('inp-h-sat'),
      valHue: document.getElementById('val-h-hue'),
      valSat: document.getElementById('val-h-sat'),
      ind: document.getElementById('ind-highlights'),
      layer: document.getElementById('layer-highlights')
    },
    m: {
      inpHue: document.getElementById('inp-m-hue'),
      inpSat: document.getElementById('inp-m-sat'),
      valHue: document.getElementById('val-m-hue'),
      valSat: document.getElementById('val-m-sat'),
      ind: document.getElementById('ind-midtones'),
      layer: document.getElementById('layer-midtones')
    },
    s: {
      inpHue: document.getElementById('inp-s-hue'),
      inpSat: document.getElementById('inp-s-sat'),
      valHue: document.getElementById('val-s-hue'),
      valSat: document.getElementById('val-s-sat'),
      ind: document.getElementById('ind-shadows'),
      layer: document.getElementById('layer-shadows')
    }
  };

  // Core update function
  function updateColor(region) {
    const sRegion = state[region];
    const el = elements[region];

    // Read inputs
    sRegion.hue = parseInt(el.inpHue.value);
    sRegion.sat = parseInt(el.inpSat.value);

    // Update labels
    el.valHue.textContent = `${sRegion.hue}°`;
    el.valSat.textContent = `${sRegion.sat}%`;

    // Calculate HSL
    // For blending: 
    // Highlights -> screen -> use high lightness (e.g. 70%) to boost brightness
    // Midtones -> overlay -> use 50% lightness to balance
    // Shadows -> multiply -> use low lightness (e.g. 30%) to darken and tint
    
    let lightness = 50;
    if (region === 'h') lightness = 70;
    if (region === 's') lightness = 30;

    const hslString = `hsl(${sRegion.hue}, ${sRegion.sat}%, ${lightness}%)`;
    
    // Update indicator circle
    el.ind.style.backgroundColor = hslString;

    // Update layer background
    el.layer.style.backgroundColor = hslString;
    // Layer opacity scales with saturation to feel natural
    el.layer.style.opacity = (sRegion.sat / 100) * (region === 's' ? 0.8 : 0.6);

    // Update saturation slider background gradient to show hue
    el.inpSat.style.background = `linear-gradient(to right, hsl(${sRegion.hue}, 0%, ${lightness}%), hsl(${sRegion.hue}, 100%, ${lightness}%))`;
  }

  // Bind events
  ['h', 'm', 's'].forEach(region => {
    const el = elements[region];
    el.inpHue.addEventListener('input', () => updateColor(region));
    el.inpSat.addEventListener('input', () => updateColor(region));
    
    // Initial call
    updateColor(region);
  });

  // Presets logic
  window.applyPreset = function(preset) {
    switch (preset) {
      case 'tealOrange':
        elements.h.inpHue.value = 40;  elements.h.inpSat.value = 35; // Orange Highlights
        elements.m.inpHue.value = 30;  elements.m.inpSat.value = 10; // Warm Midtones
        elements.s.inpHue.value = 210; elements.s.inpSat.value = 60; // Teal Shadows
        break;
      case 'matrix':
        elements.h.inpHue.value = 120; elements.h.inpSat.value = 40; // Green Highlights
        elements.m.inpHue.value = 130; elements.m.inpSat.value = 30; // Green Midtones
        elements.s.inpHue.value = 150; elements.s.inpSat.value = 60; // Deep Cyan-Green Shadows
        break;
      case 'cyberpunk':
        elements.h.inpHue.value = 300; elements.h.inpSat.value = 50; // Magenta Highlights
        elements.m.inpHue.value = 280; elements.m.inpSat.value = 30; // Purple Midtones
        elements.s.inpHue.value = 190; elements.s.inpSat.value = 70; // Cyan Shadows
        break;
      case 'reset':
        elements.h.inpHue.value = 40;  elements.h.inpSat.value = 0;
        elements.m.inpHue.value = 0;   elements.m.inpSat.value = 0;
        elements.s.inpHue.value = 210; elements.s.inpSat.value = 0;
        break;
    }

    ['h', 'm', 's'].forEach(region => updateColor(region));
  };

});
