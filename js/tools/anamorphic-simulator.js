document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('viewport');
  const toggleBtn = document.getElementById('lens-toggle');
  const flareIntensity = document.getElementById('flare-intensity');
  const flareOverlay = document.getElementById('flare');
  const squeezeFactor = document.getElementById('squeeze-factor');
  const bokehOverlay = document.getElementById('bokeh');

  let isAnamorphic = false;

  toggleBtn.addEventListener('click', () => {
    isAnamorphic = !isAnamorphic;
    
    if (isAnamorphic) {
      viewport.classList.add('anamorphic');
      toggleBtn.classList.add('active');
      toggleBtn.textContent = 'Anamorphic (2.35:1)';
      // Auto set some flare and squeeze
      flareIntensity.value = 60;
      squeezeFactor.value = 2.0;
      updateVisuals();
    } else {
      viewport.classList.remove('anamorphic');
      toggleBtn.classList.remove('active');
      toggleBtn.textContent = 'Spherical (16:9)';
      flareIntensity.value = 0;
      squeezeFactor.value = 1.0;
      updateVisuals();
    }
  });

  flareIntensity.addEventListener('input', updateVisuals);
  squeezeFactor.addEventListener('input', updateVisuals);

  function updateVisuals() {
    // Flare logic
    const intensity = parseInt(flareIntensity.value) / 100;
    if (intensity > 0) {
      flareOverlay.style.background = `rgba(0, 150, 255, ${intensity})`;
      flareOverlay.style.boxShadow = `0 0 ${40 + intensity * 60}px ${10 + intensity * 20}px rgba(0, 150, 255, ${intensity})`;
    } else {
      flareOverlay.style.background = 'transparent';
      flareOverlay.style.boxShadow = 'none';
    }

    // Squeeze logic for bokeh
    const squeeze = parseFloat(squeezeFactor.value);
    if (squeeze > 1) {
      bokehOverlay.style.transform = `scaleY(${squeeze})`;
      bokehOverlay.style.opacity = (squeeze - 1) / 1; // max opacity at 2.0
    } else {
      bokehOverlay.style.transform = `scaleY(1)`;
      bokehOverlay.style.opacity = 0;
    }
  }
});
