/* ==========================================================================
   LUMENFORGE — Director's Viewfinder Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('camera-stream');
  const startScreen = document.getElementById('start-screen');
  const btnStart = document.getElementById('btn-start');
  const btnFlip = document.getElementById('btn-flip');
  const arBox = document.getElementById('ar-box');
  const grid = document.getElementById('grid');
  const btnGrid = document.getElementById('btn-grid');
  const arBtns = document.querySelectorAll('.ar-btn');

  let currentFacingMode = 'environment'; // default to back camera
  let stream = null;
  let previousRatio = '16/9';

  // 1. Camera Initialization
  if (btnStart) {
    btnStart.addEventListener('click', async () => {
      await initCamera();
      if (startScreen) {
        startScreen.style.display = 'none';
      }
      updateAR('16/9');
    });
  }

  if (btnFlip) {
    btnFlip.addEventListener('click', async () => {
      currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
      await initCamera();
    });
  }

  async function initCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacingMode }
      });
      video.srcObject = stream;
    } catch (err) {
      alert('Không thể truy cập Camera. Vui lòng cấp quyền trong cài đặt trình duyệt.');
      console.error(err);
    }
  }

  // 2. Aspect Ratio Controller
  function updateAR(ratioStr) {
    if (!arBox) return;
    const [w, h] = ratioStr.split('/').map(Number);
    const ratio = w / h;
    const screenW = window.innerWidth;
    const targetH = screenW / ratio;
    arBox.style.height = targetH + 'px';
  }

  window.addEventListener('resize', () => {
    const activeBtn = document.querySelector('.ar-btn.active');
    if (activeBtn) {
      updateAR(activeBtn.getAttribute('data-ar'));
    }
  });

  arBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const ratio = btn.getAttribute('data-ar');
      const isPro = btn.getAttribute('data-pro') === 'true';

      // VIP PRO Aspect Ratio Gating
      if (isPro && typeof lfAuth !== 'undefined') {
        const ratioLabel = btn.textContent.replace(' 👑', '');
        const hasAccess = lfAuth.gateFeature(`Khung hình ${ratioLabel}`, () => {
          // Revert on cancel
          arBtns.forEach(b => b.classList.remove('active'));
          const fallbackBtn = document.querySelector(`.ar-btn[data-ar="${previousRatio}"]`);
          if (fallbackBtn) {
            fallbackBtn.classList.add('active');
            updateAR(previousRatio);
          } else {
            document.querySelector('.ar-btn[data-ar="16/9"]').classList.add('active');
            updateAR('16/9');
          }
        });
        if (!hasAccess) return;
      }

      arBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      previousRatio = ratio;
      updateAR(ratio);
    });
  });

  // 3. Grid Overlay Controller (👑 VIP PRO Gated)
  if (btnGrid) {
    btnGrid.addEventListener('click', () => {
      if (typeof lfAuth !== 'undefined' && !grid.classList.contains('active')) {
        const hasAccess = lfAuth.gateFeature('Lưới căn bố cục (Composition Grid)', () => {
          // Revert on cancel
          btnGrid.classList.remove('active');
          grid.classList.remove('active');
        });
        if (!hasAccess) return;
      }
      
      btnGrid.classList.toggle('active');
      grid.classList.toggle('active');
    });
  }
});
