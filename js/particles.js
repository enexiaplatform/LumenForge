/* ============================================================
   LUMENFORGE — Particle System
   Lightweight canvas particles for the hero section
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null };
  let animFrameId;
  let isVisible = true;

  /* ---- Configuration ---- */
  const CONFIG = {
    particleCount: 70,        // 60-80 range
    minSize: 1,
    maxSize: 3,
    minSpeed: 0.15,
    maxSpeed: 0.6,
    minOpacity: 0.1,
    maxOpacity: 0.4,
    connectionDistance: 120,
    connectionOpacity: 0.05,
    parallaxStrength: 0.02,
    pulseSpeed: 0.008,
    colors: [
      { r: 245, g: 166, b: 35 },   // amber
      { r: 245, g: 166, b: 35 },   // amber (weighted)
      { r: 0, g: 212, b: 170 },    // cyan
      { r: 232, g: 228, b: 223 },  // white-ish (text-primary)
      { r: 139, g: 92, b: 246 },   // purple (rare)
    ]
  };

  /* ---- Particle class ---- */
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize);
      this.speedX = (Math.random() - 0.5) * 2 * CONFIG.maxSpeed;
      this.speedY = (Math.random() - 0.5) * 2 * CONFIG.maxSpeed;

      // Ensure minimum speed
      const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
      if (speed < CONFIG.minSpeed) {
        const scale = CONFIG.minSpeed / (speed || 0.01);
        this.speedX *= scale;
        this.speedY *= scale;
      }

      const colorChoice = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      this.r = colorChoice.r;
      this.g = colorChoice.g;
      this.b = colorChoice.b;

      this.baseOpacity = CONFIG.minOpacity + Math.random() * (CONFIG.maxOpacity - CONFIG.minOpacity);
      this.opacity = this.baseOpacity;
      this.pulseOffset = Math.random() * Math.PI * 2;
      this.pulseAmplitude = 0.05 + Math.random() * 0.15; // how much opacity pulses
      this.doPulse = Math.random() > 0.4; // ~60% of particles pulse
    }

    update(time) {
      // Movement
      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap around edges
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.y = height + 10;
      if (this.y > height + 10) this.y = -10;

      // Mouse parallax
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 300;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * CONFIG.parallaxStrength;
          this.x += dx * force;
          this.y += dy * force;
        }
      }

      // Opacity pulsing
      if (this.doPulse) {
        this.opacity = this.baseOpacity + Math.sin(time * CONFIG.pulseSpeed + this.pulseOffset) * this.pulseAmplitude;
        this.opacity = Math.max(0.05, Math.min(this.opacity, 0.5));
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.opacity})`;
      ctx.fill();
    }
  }

  /* ---- Initialize ---- */
  function init() {
    resize();
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(new Particle());
    }
  }

  /* ---- Resize handler ---- */
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = rect.width;
    height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---- Draw connections ---- */
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectionDistance) {
          const opacity = CONFIG.connectionOpacity * (1 - dist / CONFIG.connectionDistance);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(245, 166, 35, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ---- Animation loop ---- */
  let time = 0;

  function animate() {
    if (!isVisible) {
      animFrameId = requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, width, height);
    time++;

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(time);
      particles[i].draw();
    }

    // Draw connections
    drawConnections();

    animFrameId = requestAnimationFrame(animate);
  }

  /* ---- Mouse tracking ---- */
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }

  function onMouseLeave() {
    mouse.x = null;
    mouse.y = null;
  }

  /* ---- Touch tracking ---- */
  function onTouchMove(e) {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
    }
  }

  function onTouchEnd() {
    mouse.x = null;
    mouse.y = null;
  }

  /* ---- Visibility API ---- */
  function onVisibilityChange() {
    isVisible = !document.hidden;
  }

  /* ---- Event listeners ---- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      // Re-constrain particles within new bounds
      particles.forEach(p => {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height) p.y = Math.random() * height;
      });
    }, 200);
  });

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd);
  document.addEventListener('visibilitychange', onVisibilityChange);

  /* ---- Start ---- */
  init();
  animate();

})();
