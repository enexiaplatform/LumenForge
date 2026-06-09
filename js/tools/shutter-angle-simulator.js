const angleSlider = document.getElementById('angle-slider');
const fpsSlider = document.getElementById('fps-slider');
const angleVal = document.getElementById('angle-val');
const fpsVal = document.getElementById('fps-val');
const speedVal = document.getElementById('speed-val');

const disc = document.getElementById('disc');
const movingObject = document.getElementById('object');

function updateSimulation() {
  const angle = parseInt(angleSlider.value);
  const fps = parseInt(fpsSlider.value);

  // Update UI text
  angleVal.innerText = `${angle}°`;
  fpsVal.innerText = `${fps} fps`;

  // Math: Equivalent Shutter Speed
  // Speed = 1 / (fps * (360 / angle))
  const denominator = fps * (360 / angle);
  speedVal.innerText = `1/${Math.round(denominator)}s`;

  // Update CSS Variables for visuals
  // 1. Disc Opening
  disc.style.setProperty('--angle', `${angle}deg`);
  
  // 2. Disc Spin Speed
  // At 24fps, it does 24 full rotations per second.
  // CSS animation duration = 1s / 24 = 0.0416s
  const spinDuration = 1 / fps;
  disc.style.setProperty('--speed', `${spinDuration}s`);

  // 3. Motion Blur Amount
  // Larger angle = longer exposure time = more blur.
  // Standard 180 deg at 24fps = 1/48s exposure -> Let's map this to a base blur of 6px.
  // Exposure time (in seconds) = 1 / denominator
  const exposureTime = 1 / denominator;
  // Let's create an arbitrary multiplier for visual effect
  // 1/48s (~0.02s) * 300 = 6px blur.
  const blurAmount = exposureTime * 300;
  movingObject.style.setProperty('--blur-amount', `${blurAmount}px`);
}

function setPreset(targetAngle) {
  angleSlider.value = targetAngle;
  updateSimulation();
}

// Event Listeners
angleSlider.addEventListener('input', updateSimulation);
fpsSlider.addEventListener('input', updateSimulation);

// Init
updateSimulation();
