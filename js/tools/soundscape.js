document.addEventListener('DOMContentLoaded', () => {
  const btnMaster = document.getElementById('btn-master');
  const channels = document.querySelectorAll('.channel');
  const presetBtns = document.querySelectorAll('.btn-preset');

  let audioCtx = null;
  let isPlaying = false;
  
  // Audio Nodes
  const sources = {
    rain: { gainNode: null, type: 'pinkNoise', filter: 'lowpass', freq: 1000 },
    city: { gainNode: null, type: 'brownNoise', filter: 'bandpass', freq: 400 },
    rumble: { gainNode: null, type: 'sineRumble', filter: 'lowpass', freq: 80 },
    wind: { gainNode: null, type: 'whiteNoise', filter: 'bandpassLFO', freq: 800 }
  };

  function initAudio() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // Create a 2-second noise buffer
    const bufferSize = audioCtx.sampleRate * 2;
    const whiteNoiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const pinkNoiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const brownNoiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);

    const whiteData = whiteNoiseBuffer.getChannelData(0);
    const pinkData = pinkNoiseBuffer.getChannelData(0);
    const brownData = brownNoiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0;

    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      whiteData[i] = white;

      // Pink noise approx
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pinkData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      pinkData[i] *= 0.11; // compensate gain
      b6 = white * 0.115926;

      // Brown noise approx
      let brown = (lastOut + (0.02 * white)) / 1.02;
      brownData[i] = brown * 3.5;
      lastOut = brown;
    }

    const buffers = {
      whiteNoise: whiteNoiseBuffer,
      pinkNoise: pinkNoiseBuffer,
      brownNoise: brownNoiseBuffer
    };

    // Setup each channel
    Object.keys(sources).forEach(key => {
      const config = sources[key];
      config.gainNode = audioCtx.createGain();
      config.gainNode.gain.value = 0;
      config.gainNode.connect(audioCtx.destination);

      if (config.type.includes('Noise')) {
        const source = audioCtx.createBufferSource();
        source.buffer = buffers[config.type];
        source.loop = true;

        const filter = audioCtx.createBiquadFilter();
        if (config.filter === 'bandpassLFO') {
          filter.type = 'bandpass';
          filter.Q.value = 1.5;
          // LFO for wind
          const lfo = audioCtx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 0.2; // very slow sweep
          const lfoGain = audioCtx.createGain();
          lfoGain.gain.value = 600;
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          filter.frequency.value = 800;
          lfo.start();
        } else {
          filter.type = config.filter;
          filter.frequency.value = config.freq;
        }

        source.connect(filter);
        filter.connect(config.gainNode);
        source.start();
      } else if (config.type === 'sineRumble') {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 50;

        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 2; // Fast pulse
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 10;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.connect(config.gainNode);
        osc.start();
        lfo.start();
      }
    });
  }

  function toggleMaster() {
    if (!audioCtx) initAudio();

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlaying = !isPlaying;
    if (isPlaying) {
      btnMaster.classList.add('playing');
      btnMaster.innerHTML = '⏸ Tạm dừng';
      
      // Mute all nodes first, then let the sliders dictate
      Object.keys(sources).forEach(key => {
        const slider = document.querySelector(`.channel[data-sound="${key}"] .fader`);
        sources[key].gainNode.gain.setTargetAtTime((slider.value / 100) * 0.5, audioCtx.currentTime, 0.1);
      });
      requestAnimationFrame(updateVuMeters);
    } else {
      btnMaster.classList.remove('playing');
      btnMaster.innerHTML = '▶ Khởi động';
      Object.keys(sources).forEach(key => {
        sources[key].gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
      });
    }
  }

  btnMaster.addEventListener('click', toggleMaster);

  channels.forEach(ch => {
    const key = ch.getAttribute('data-sound');
    const fader = ch.querySelector('.fader');

    fader.addEventListener('input', (e) => {
      if (!isPlaying || !audioCtx) return;
      const val = e.target.value / 100;
      // Max volume cap to prevent clipping
      sources[key].gainNode.gain.setTargetAtTime(val * 0.5, audioCtx.currentTime, 0.05);
    });
  });

  // Simple VU meter animation (faked based on slider value and random jitter)
  function updateVuMeters() {
    if (!isPlaying) {
      channels.forEach(ch => ch.querySelector('.vu-level').style.width = '0%');
      return;
    }
    channels.forEach(ch => {
      const fader = ch.querySelector('.fader');
      const val = parseInt(fader.value);
      const level = ch.querySelector('.vu-level');
      if (val === 0) {
        level.style.width = '0%';
      } else {
        const jitter = (Math.random() * 10 - 5);
        level.style.width = Math.max(0, Math.min(100, val + jitter)) + '%';
      }
    });
    requestAnimationFrame(updateVuMeters);
  }

  // Presets
  const presetData = {
    'blade-runner': { rain: 80, city: 40, rumble: 90, wind: 20 },
    'interstellar': { rain: 0, city: 0, rumble: 60, wind: 80 },
    'noir': { rain: 90, city: 30, rumble: 10, wind: 10 }
  };

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const p = presetData[btn.getAttribute('data-preset')];
      
      Object.keys(p).forEach(key => {
        const slider = document.querySelector(`.channel[data-sound="${key}"] .fader`);
        slider.value = p[key];
        if (isPlaying && audioCtx) {
          sources[key].gainNode.gain.setTargetAtTime((p[key] / 100) * 0.5, audioCtx.currentTime, 0.5);
        }
      });
    });
  });

  // Stop audio if user switches tabs to avoid annoyance
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isPlaying) {
      toggleMaster();
    }
  });

});
