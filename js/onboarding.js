/* ==========================================================================
   LUMENFORGE — Onboarding Flow Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Check if user has visited before
  if (!localStorage.getItem('lf_onboarded')) {
    initOnboarding();
  }
});

function initOnboarding() {
  const overlayHtml = `
    <div id="lf-onboarding-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(10,10,12,0.95); z-index: 9999; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.5s ease;">
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 40px; max-width: 600px; text-align: center; position: relative;">
        <h2 style="font-size: 2rem; margin-bottom: 15px;">Chào mừng đến với <span style="color: var(--accent-amber);">LumenForge</span></h2>
        <p style="color: var(--text-secondary); margin-bottom: 30px; line-height: 1.6; font-size: 1.1rem;">LumenForge không phải là một trang web đọc tin tức nhiếp ảnh thông thường. Đây là một <strong>Hệ sinh thái học thuật tương tác</strong> được thiết kế để định hình lại hoàn toàn tư duy của bạn về ánh sáng và màu sắc.</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 40px; text-align: left;">
          <div style="padding: 15px; background: rgba(255,255,255,0.03); border-radius: 8px; border-top: 2px solid var(--accent-amber);">
            <h4 style="margin-bottom: 5px; font-size: 1rem;">1. Light Codex</h4>
            <p style="font-size: 0.85rem; color: var(--text-dim); line-height: 1.4;">Học thuyết và quy luật vật lý nhiếp ảnh.</p>
          </div>
          <div style="padding: 15px; background: rgba(255,255,255,0.03); border-radius: 8px; border-top: 2px solid var(--accent-cyan);">
            <h4 style="margin-bottom: 5px; font-size: 1rem;">2. Xưởng Công cụ</h4>
            <p style="font-size: 0.85rem; color: var(--text-dim); line-height: 1.4;">Thực hành ngay với các mô phỏng vật lý.</p>
          </div>
          <div style="padding: 15px; background: rgba(255,255,255,0.03); border-radius: 8px; border-top: 2px solid var(--accent-purple);">
            <h4 style="margin-bottom: 5px; font-size: 1rem;">3. Cửa hàng Pro</h4>
            <p style="font-size: 0.85rem; color: var(--text-dim); line-height: 1.4;">Mở khóa công thức màu và Presets độc quyền.</p>
          </div>
        </div>

        <button id="btn-start-journey" class="btn-primary" style="font-size: 1.1rem; padding: 12px 40px;">Bắt đầu Hành trình</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', overlayHtml);
  
  const overlay = document.getElementById('lf-onboarding-overlay');
  
  // Fade in
  setTimeout(() => {
    overlay.style.opacity = '1';
  }, 100);

  // Bind close event
  document.getElementById('btn-start-journey').addEventListener('click', () => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      localStorage.setItem('lf_onboarded', 'true');
    }, 500);
  });
}
