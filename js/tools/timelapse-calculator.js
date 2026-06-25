/* ==========================================================================
   LUMENFORGE — Timelapse Calculator & Shutter Angle Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const intervalInput = document.getElementById('input-interval');
  const lengthInput = document.getElementById('input-clip-length');
  const fpsInput = document.getElementById('input-fps');
  const selectPreset = document.getElementById('select-preset-interval');
  
  const resPhotos = document.getElementById('res-photos');
  const resRealtime = document.getElementById('res-realtime');

  let previousPreset = 'manual';

  function calculate() {
    const interval = parseFloat(intervalInput.value) || 0;
    const length = parseFloat(lengthInput.value) || 0;
    const fps = parseInt(fpsInput.value) || 30;

    // Total frames needed
    const frames = length * fps;
    
    // Total real time in seconds
    const realTimeSeconds = frames * interval;
    
    // Format time into human readable string
    let timeString = '';
    if (realTimeSeconds < 60) {
      timeString = `${Math.round(realTimeSeconds)} Giây`;
    } else if (realTimeSeconds < 3600) {
      const minutes = (realTimeSeconds / 60).toFixed(1);
      timeString = `${minutes} Phút`;
    } else {
      const hours = (realTimeSeconds / 3600).toFixed(1);
      timeString = `${hours} Giờ`;
    }

    resPhotos.textContent = Math.round(frames);
    resRealtime.textContent = timeString;
  }

  // Handle Preset Changes (👑 VIP PRO Gated)
  if (selectPreset) {
    selectPreset.addEventListener('change', () => {
      const selectedOption = selectPreset.options[selectPreset.selectedIndex];
      const isPro = selectedOption.getAttribute('data-pro') === 'true';

      if (isPro && typeof lfAuth !== 'undefined') {
        const featureName = `Preset Timelapse ${selectedOption.text.replace(' 👑 PRO', '')}`;
        const hasAccess = lfAuth.gateFeature(featureName, () => {
          // Revert on cancel
          selectPreset.value = previousPreset;
          calculate();
        });
        if (!hasAccess) return;
      }

      previousPreset = selectPreset.value;
      
      // Set interval based on selection
      if (selectPreset.value === 'clouds-fast') {
        intervalInput.value = 2;
      } else if (selectPreset.value === 'clouds-slow') {
        intervalInput.value = 5;
      } else if (selectPreset.value === 'crowd') {
        intervalInput.value = 1;
      } else if (selectPreset.value === 'traffic') {
        intervalInput.value = 3;
      } else if (selectPreset.value === 'sunset') {
        intervalInput.value = 8;
      } else if (selectPreset.value === 'stars') {
        intervalInput.value = 20;
      } else if (selectPreset.value === 'construction') {
        intervalInput.value = 60;
      }

      calculate();
    });
  }

  // Listen to manual changes (resets preset to manual if customized)
  function handleManualChange() {
    if (selectPreset) {
      selectPreset.value = 'manual';
      previousPreset = 'manual';
    }
    calculate();
  }

  intervalInput.addEventListener('input', handleManualChange);
  lengthInput.addEventListener('input', handleManualChange);
  fpsInput.addEventListener('change', calculate);

  // Initial Calculation
  calculate();
});
