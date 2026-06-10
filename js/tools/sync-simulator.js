document.addEventListener('DOMContentLoaded', () => {
  const audioClip = document.getElementById('audio-clip');
  const btnPlay = document.getElementById('btn-play');
  const stick = document.getElementById('clapper-stick');
  const statusDisplay = document.getElementById('sync-status');
  
  let isDragging = false;
  let startX = 0;
  let currentLeft = 50; // Initial out of sync state

  audioClip.style.left = currentLeft + 'px';

  function updateStatus() {
    // Playhead is at 250px. Spike is 150px inside clip.
    // Perfect sync: currentLeft + 150 = 250 => currentLeft = 100
    const offset = currentLeft - 100;
    
    if (offset === 0) {
      statusDisplay.textContent = 'Đồng bộ hoàn hảo! (SYNCED)';
      statusDisplay.style.color = '#00ff88';
    } else {
      statusDisplay.textContent = `Lệch: ${offset}px (${offset > 0 ? 'Âm thanh trễ' : 'Âm thanh sớm'})`;
      statusDisplay.style.color = 'var(--accent-red)';
    }
  }

  // Dragging logic
  audioClip.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - currentLeft;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let newLeft = e.clientX - startX;
    
    // Bounds checking
    if (newLeft < -100) newLeft = -100;
    if (newLeft > 300) newLeft = 300;
    
    currentLeft = newLeft;
    audioClip.style.left = currentLeft + 'px';
    updateStatus();
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch support
  audioClip.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX - currentLeft;
  }, {passive: true});

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    let newLeft = e.touches[0].clientX - startX;
    if (newLeft < -100) newLeft = -100;
    if (newLeft > 300) newLeft = 300;
    currentLeft = newLeft;
    audioClip.style.left = currentLeft + 'px';
    updateStatus();
  }, {passive: true});

  document.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Play animation and sound
  let audioCtx = null;

  function playClapSound() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    
    // Simple synthesized clap (white noise burst)
    const bufferSize = audioCtx.sampleRate * 0.1; // 100ms
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.02)); // Exponential decay
    }
    
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    
    source.connect(filter);
    filter.connect(audioCtx.destination);
    source.start();
  }

  btnPlay.addEventListener('click', () => {
    btnPlay.disabled = true;
    
    const offset = currentLeft - 100;
    
    // Visual hits at T = 300ms
    const visualHitTime = 300;
    
    // Audio hits at visualHitTime + (offset * some factor)
    // 1px = roughly 5ms 
    const audioHitTime = visualHitTime + (offset * 5);

    // Animation
    stick.style.transform = 'rotate(-30deg)';
    
    setTimeout(() => {
      stick.style.transform = 'rotate(0deg)';
      // If perfect sync, play immediately
      if (offset === 0) playClapSound();
    }, visualHitTime);

    // If out of sync, play audio based on offset
    if (offset !== 0) {
      if (audioHitTime > 0) {
        setTimeout(playClapSound, audioHitTime);
      } else {
        // Audio plays before visual even starts moving
        playClapSound();
      }
    }

    setTimeout(() => {
      stick.style.transform = 'rotate(-30deg)';
      btnPlay.disabled = false;
    }, 1000);

  });

  updateStatus();
});
