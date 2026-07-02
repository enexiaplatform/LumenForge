import os

def append_sensory_ux():
    js_code = """
/* ==========================================================================
   SENSORY UX (Sprint 28): Cinematic Page Transitions & Audio
   ========================================================================== */
(function initSensoryUX() {
  if (window.location.pathname.includes('admin.html')) return;

  // 1. Page Transitions (Fade In/Out)
  // Fade in on load
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('lf-page-loaded');
  });

  // Intercept internal links to fade out
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    const target = link.getAttribute('target');

    // Proceed normally if it's an anchor link, javascript, external, or target="_blank"
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || target === '_blank' || href.startsWith('http')) {
      return;
    }

    e.preventDefault();
    document.body.classList.remove('lf-page-loaded');
    
    // Fallback timer to force navigation if animation hangs
    setTimeout(() => {
      window.location.href = href;
    }, 400);
  });

  // 2. Synthesized Audio Feedback (Web Audio API)
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      // Create context on first user interaction to bypass browser autoplay blocks
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
         audioCtx = new AudioContext();
      }
    }
  }

  function playTick() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    // Very high pitch, very short duration
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime); // Low volume
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }

  function playClick() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle';
    // Thud sound
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Slightly louder than tick
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  // Attach audio to interactive elements
  // Use event delegation or attach directly
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .btn, .magnetic, .product-card')) {
      initAudio();
      playTick();
    }
  });

  document.addEventListener('mousedown', (e) => {
    if (e.target.closest('a, button, .btn, .magnetic, .product-card')) {
      initAudio();
      playClick();
    }
  });

})();
"""
    filepath = r'e:\Antigravity project\LumenForge\js\common.js'
    with open(filepath, 'a', encoding='utf-8') as f:
        f.write(js_code)
        
    print("Successfully appended Sensory UX to common.js")

if __name__ == '__main__':
    append_sensory_ux()
