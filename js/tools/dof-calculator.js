/* ==========================================================================
   LUMENFORGE — Depth of Field (DoF) Calculator Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Inputs
  const inpSensor = document.getElementById('inp-sensor');
  const inpFocal = document.getElementById('inp-focal');
  const inpAperture = document.getElementById('inp-aperture');
  const inpDistance = document.getElementById('inp-distance');

  // Value Displays
  const valFocal = document.getElementById('val-focal');
  const valAperture = document.getElementById('val-aperture');
  const valDistance = document.getElementById('val-distance');

  // Outputs
  const outNear = document.getElementById('out-near');
  const outFar = document.getElementById('out-far');
  const outTotal = document.getElementById('out-total');
  const outHyper = document.getElementById('out-hyper');

  // Visualizer elements
  const visZone = document.getElementById('vis-zone');
  const visSubject = document.getElementById('vis-subject');

  function calculateDoF() {
    // 1. Get raw values
    const coc = parseFloat(inpSensor.value); // Circle of Confusion in mm
    const f = parseFloat(inpFocal.value);    // Focal length in mm
    const N = parseFloat(inpAperture.value); // F-number
    const s_m = parseFloat(inpDistance.value); // Subject distance in meters
    const s = s_m * 1000; // Subject distance in mm

    // Update labels
    valFocal.textContent = `${f}mm`;
    valAperture.textContent = `f/${N.toFixed(1)}`;
    valDistance.textContent = `${s_m.toFixed(1)}m`;

    // 2. Mathematical formulas
    // Hyperfocal Distance: H = f^2 / (N * c) + f
    const H = (f * f) / (N * coc) + f;
    const H_m = H / 1000;

    let near = 0;
    let far = 0;

    if (s >= H) {
      // Focus is at or beyond hyperfocal distance
      near = (s * (H - f)) / (H + s - 2 * f);
      far = Infinity;
    } else {
      near = (s * (H - f)) / (H + s - 2 * f);
      far = (s * (H - f)) / (H - s);
    }

    // Convert to meters
    const near_m = near / 1000;
    const far_m = far / 1000;

    // 3. Update Text Output
    outHyper.innerHTML = `${H_m.toFixed(2)} <span class="stat-unit">m</span>`;
    
    // Safety check for macro distances (subject distance very close to focal length)
    if (near_m < 0) {
      outNear.innerHTML = `0.00 <span class="stat-unit">m</span>`;
    } else {
      outNear.innerHTML = `${near_m.toFixed(2)} <span class="stat-unit">m</span>`;
    }

    if (far === Infinity || far_m < 0) {
      outFar.innerHTML = `Vô cực <span class="stat-unit">(∞)</span>`;
      outTotal.innerHTML = `Vô cực <span class="stat-unit">(∞)</span>`;
    } else {
      outFar.innerHTML = `${far_m.toFixed(2)} <span class="stat-unit">m</span>`;
      const total = far_m - near_m;
      outTotal.innerHTML = `${total.toFixed(2)} <span class="stat-unit">m</span>`;
    }

    // 4. Update SVG Diagram
    // Map max distance to 50 meters for visualization scaling
    const maxScale = 50; 
    
    // Position subject (left is 0, right is 100%)
    let subjectPercent = (s_m / maxScale) * 100;
    if (subjectPercent > 95) subjectPercent = 95;
    visSubject.style.left = `${subjectPercent}%`;

    // Position DoF Zone
    let nearPercent = (near_m / maxScale) * 100;
    let farPercent = (far === Infinity || far_m < 0) ? 100 : (far_m / maxScale) * 100;
    
    if (farPercent > 100) farPercent = 100;
    
    let widthPercent = farPercent - nearPercent;
    if (widthPercent < 0.5) widthPercent = 0.5; // Minimum visible width

    visZone.style.left = `${nearPercent}%`;
    visZone.style.width = `${widthPercent}%`;
  }

  // Bind Events
  inpSensor.addEventListener('change', calculateDoF);
  inpFocal.addEventListener('input', calculateDoF);
  inpAperture.addEventListener('input', calculateDoF);
  inpDistance.addEventListener('input', calculateDoF);

  // Initial calculation
  calculateDoF();
});
