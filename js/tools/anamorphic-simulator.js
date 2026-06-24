document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('viewport');
  const toggleBtn = document.getElementById('lens-toggle');
  const flareIntensity = document.getElementById('flare-intensity');
  const flareOverlay = document.getElementById('flare');
  const squeezeFactor = document.getElementById('squeeze-factor');
  const bokehOverlay = document.getElementById('bokeh');
  const flareColorSelect = document.getElementById('flare-color');

  // Color mappings for different lens models
  const flareColors = {
    blue: '0, 150, 255',
    gold: '242, 168, 99',
    magenta: '255, 0, 150',
    green: '50, 255, 150'
  };

  let isAnamorphic = false;
  let previousColor = 'blue';

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

  // Intercept PRO flare color selection
  if (flareColorSelect) {
    flareColorSelect.addEventListener('focus', () => {
      previousColor = flareColorSelect.value;
    });

    flareColorSelect.addEventListener('change', () => {
      const selectedOption = flareColorSelect.options[flareColorSelect.selectedIndex];
      if (selectedOption && selectedOption.getAttribute('data-pro') === 'true') {
        if (typeof lfAuth !== 'undefined') {
          const featureName = selectedOption.text.replace(' - (VIP PRO) 👑', '');
          const hasAccess = lfAuth.gateFeature(featureName, () => {
            // Fallback: revert select to previous value
            flareColorSelect.value = previousColor;
            updateVisuals();
          });

          if (hasAccess) {
            previousColor = flareColorSelect.value;
            // Auto activate anamorphic mode if they unlock a PRO lens look
            if (!isAnamorphic) {
              isAnamorphic = true;
              viewport.classList.add('anamorphic');
              toggleBtn.classList.add('active');
              toggleBtn.textContent = 'Anamorphic (2.35:1)';
              if (parseInt(flareIntensity.value) === 0) {
                flareIntensity.value = 60;
              }
              if (parseFloat(squeezeFactor.value) === 1.0) {
                squeezeFactor.value = 2.0;
              }
            }
          }
        } else {
          flareColorSelect.value = previousColor;
        }
      } else {
        previousColor = flareColorSelect.value;
      }
      updateVisuals();
    });
  }

  function updateVisuals() {
    // Flare logic
    const intensity = parseInt(flareIntensity.value) / 100;
    const colorKey = flareColorSelect ? flareColorSelect.value : 'blue';
    const colorRgb = flareColors[colorKey] || '0, 150, 255';

    if (intensity > 0) {
      flareOverlay.style.background = `rgba(${colorRgb}, ${intensity})`;
      flareOverlay.style.boxShadow = `0 0 ${40 + intensity * 60}px ${10 + intensity * 20}px rgba(${colorRgb}, ${intensity})`;
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
