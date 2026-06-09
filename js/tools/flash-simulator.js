/* ==========================================================================
   LUMENFORGE — Flash Sync & Ambient Simulator Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Data Arrays
  const shutterSpeeds = [
    { label: '1/2s', ev: -1 },
    { label: '1/4s', ev: 0 },
    { label: '1/8s', ev: 1 },
    { label: '1/15s', ev: 2 },
    { label: '1/30s', ev: 3 },
    { label: '1/60s', ev: 4 },
    { label: '1/125s', ev: 5 },
    { label: '1/250s', ev: 6 }, // X-Sync limit usually
    { label: '1/500s', ev: 7 },
    { label: '1/1000s', ev: 8 },
    { label: '1/2000s', ev: 9 },
    { label: '1/4000s', ev: 10 },
    { label: '1/8000s', ev: 11 }
  ];

  const apertures = [
    { label: 'f/1.4', ev: -2 },
    { label: 'f/2.0', ev: -1 },
    { label: 'f/2.8', ev: 0 },
    { label: 'f/4.0', ev: 1 },
    { label: 'f/5.6', ev: 2 },
    { label: 'f/8.0', ev: 3 },
    { label: 'f/11', ev: 4 },
    { label: 'f/16', ev: 5 },
    { label: 'f/22', ev: 6 }
  ];

  // DOM Elements
  const inpShutter = document.getElementById('inp-shutter');
  const valShutter = document.getElementById('val-shutter');
  const inpAperture = document.getElementById('inp-aperture');
  const valAperture = document.getElementById('val-aperture');
  const inpFlash = document.getElementById('inp-flash');
  const valFlash = document.getElementById('val-flash');
  const btnHss = document.getElementById('btn-hss');

  const simAmbient = document.getElementById('sim-ambient');
  const simSubject = document.getElementById('sim-subject');
  const simBand = document.getElementById('sim-band');
  const eduMsg = document.getElementById('edu-msg');

  const valAmbientEv = document.getElementById('val-ambient-ev');
  const barAmbientEv = document.getElementById('bar-ambient-ev');
  const valSubjectEv = document.getElementById('val-subject-ev');
  const barSubjectEv = document.getElementById('bar-subject-ev');

  let hssEnabled = false;

  // Initialize input max values
  inpShutter.max = shutterSpeeds.length - 1;
  inpAperture.max = apertures.length - 1;

  // Baseline conditions (Assuming sunny day baseline requires 1/250s, f/8 for perfect exposure)
  // Ambient Baseline EV = 9 (Shutter 6 + Aperture 3)
  const ambientBaseline = 9;

  function calculateExposure() {
    // Get current values
    const shIdx = parseInt(inpShutter.value);
    const apIdx = parseInt(inpAperture.value);
    const flashPower = parseInt(inpFlash.value); // 0 to 100

    const shutter = shutterSpeeds[shIdx];
    const aperture = apertures[apIdx];

    // Update labels
    valShutter.textContent = shutter.label;
    valAperture.textContent = aperture.label;
    valFlash.textContent = flashPower === 0 ? 'Tắt' : `${flashPower}%`;

    // 1. AMBIENT EXPOSURE
    // Ambient is affected by BOTH Shutter and Aperture
    const currentAmbientEv = shutter.ev + aperture.ev;
    const ambientDiff = ambientBaseline - currentAmbientEv; // > 0 means overexposed, < 0 means underexposed
    
    // Simulate ambient brightness (Opacity of black overlay)
    // 0 diff = perfect (opacity 0)
    // < 0 (underexposed) -> opacity goes up to 1
    // > 0 (overexposed) -> filter brightness goes up
    let ambientOpacity = 0;
    let ambientFilter = 'brightness(1)';
    
    if (ambientDiff < 0) {
      ambientOpacity = Math.min(Math.abs(ambientDiff) * 0.25, 0.95);
    } else if (ambientDiff > 0) {
      ambientFilter = `brightness(${1 + ambientDiff * 0.5})`;
    }
    
    simAmbient.style.opacity = ambientOpacity;
    document.getElementById('sim-bg').style.filter = ambientFilter;

    updateMeter(valAmbientEv, barAmbientEv, ambientDiff);

    // 2. FLASH EXPOSURE (SUBJECT)
    // Flash is affected by Aperture and Flash Power ONLY. Shutter has NO EFFECT!
    // UNLESS HSS is enabled, which reduces flash power significantly as shutter speed increases.
    
    let effectiveFlashPower = flashPower;
    let isXSyncExceeded = false;
    
    // Shutter index 7 is 1/250s. Higher index means faster shutter.
    if (shIdx > 7) {
      if (!hssEnabled && flashPower > 0) {
        isXSyncExceeded = true;
      } else if (hssEnabled && flashPower > 0) {
        // HSS Penalty: Lose power for every stop above 1/250s
        const stopsAbove = shIdx - 7;
        effectiveFlashPower = flashPower / Math.pow(1.5, stopsAbove); 
      }
    }

    // Baseline flash requirement (Assume 50% power at f/8 gives perfect exposure if ambient is pitch black)
    // Flash EV contribution maps 0-100 to EV scale. Let's say 50% power = +3 EV.
    let flashEvContribution = 0;
    if (effectiveFlashPower > 0) {
      flashEvContribution = (effectiveFlashPower / 50) * 3; // 100% = +6 EV
    }

    // Total Subject Exposure = Ambient + Flash (Subject is affected by both)
    // If flash is very bright, it overpowers ambient.
    let subjectDiff = ambientDiff;
    
    if (flashPower > 0) {
       // Subject EV = (Ambient Base - Aperture EV) + Flash EV
       // This is a simplification: Flash EV is reduced by aperture
       const flashEffectiveEv = flashEvContribution - aperture.ev;
       
       // Blend ambient and flash
       subjectDiff = Math.max(ambientDiff, flashEffectiveEv - 3); // -3 is an arbitrary baseline offset
    }

    // Apply subject visual
    let subjectFilter = `brightness(${1 + subjectDiff * 0.3})`;
    simSubject.style.filter = subjectFilter;
    
    updateMeter(valSubjectEv, barSubjectEv, subjectDiff);

    // 3. X-SYNC BAND
    if (isXSyncExceeded) {
      // Calculate band height (e.g. 1/500 is half screen, 1/1000 is 3/4 screen)
      const bandPercent = Math.min((shIdx - 7) * 20, 85);
      simBand.style.height = `${bandPercent}%`;
      eduMsg.innerHTML = `<span style="color:var(--accent-red); font-weight:bold;">CẢNH BÁO:</span> Tốc độ vượt quá 1/250s. Rèm màn trập đã chạy cắt ngang khung hình khi đèn chớp. Hãy bật HSS hoặc giảm tốc độ màn trập!`;
    } else {
      simBand.style.height = `0`;
      
      // Update Educational Message based on state
      if (ambientDiff < -2 && flashPower > 50) {
        eduMsg.innerHTML = `<span style="color:var(--accent-green); font-weight:bold;">ĐẸP!</span> Bạn đã dùng Flash để áp đảo mặt trời. Phông nền tối đi nhưng chủ thể vẫn sáng rực.`;
      } else if (hssEnabled && shIdx > 7) {
        eduMsg.innerHTML = `<span style="color:var(--accent-purple); font-weight:bold;">HSS Đang hoạt động:</span> Bạn đang chụp ở tốc độ cao. Chú ý công suất đèn đã bị suy giảm đáng kể.`;
      } else {
        eduMsg.innerHTML = `Hãy tăng Tốc độ màn trập (Shutter Speed) lên để làm tối bầu trời phông nền. Sau đó dùng Flash để cứu sáng chủ thể.`;
      }
    }
  }

  function updateMeter(valEl, barEl, diff) {
    let sign = diff > 0 ? '+' : '';
    valEl.textContent = `${sign}${diff.toFixed(1)} EV`;
    
    barEl.className = 'meter-ev-fill'; // Reset
    if (Math.abs(diff) < 0.3) {
      barEl.classList.add('perfect');
      valEl.style.color = 'var(--accent-green)';
    } else if (diff < 0) {
      barEl.classList.add('under');
      barEl.style.width = `${Math.min(Math.abs(diff) * 20, 50)}%`;
      valEl.style.color = 'var(--accent-cyan)';
    } else {
      barEl.classList.add('over');
      barEl.style.width = `${Math.min(diff * 20, 50)}%`;
      valEl.style.color = 'var(--accent-amber)';
    }
  }

  // Event Listeners
  inpShutter.addEventListener('input', calculateExposure);
  inpAperture.addEventListener('input', calculateExposure);
  inpFlash.addEventListener('input', calculateExposure);

  btnHss.addEventListener('click', () => {
    hssEnabled = !hssEnabled;
    if (hssEnabled) {
      btnHss.classList.add('active');
    } else {
      btnHss.classList.remove('active');
    }
    calculateExposure();
  });

  // Initial Calculation
  calculateExposure();
});
