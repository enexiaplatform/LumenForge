import os

# --- 1. Modify js/common.js (Timer & XP Rewards) ---
common_js_path = 'e:/Antigravity project/LumenForge/js/common.js'
sprint19_logic = '''
/* ==========================================================================
   LUMENFORGE COMMERCIAL SPRINT 19: RETENTION & URGENCY
   ========================================================================== */

(function initSprint19() {
  if (window.location.pathname.includes('admin.html')) return;

  // --- 1. EVERGREEN FLASH SALE TIMER ---
  const saleEndKey = 'lf_flash_sale_end';
  let saleEndTime = localStorage.getItem(saleEndKey);
  
  // If not set or already expired, set to 2 hours 45 mins from now
  if (!saleEndTime || parseInt(saleEndTime) < Date.now()) {
    saleEndTime = Date.now() + (2 * 60 * 60 * 1000) + (45 * 60 * 1000);
    localStorage.setItem(saleEndKey, saleEndTime);
  }

  // Create Timer UI Ribbon
  const ribbon = document.createElement('div');
  ribbon.style.cssText = `
    background: linear-gradient(90deg, #990000, #ff3333);
    color: #fff;
    text-align: center;
    padding: 8px 15px;
    font-weight: bold;
    font-size: 0.85rem;
    position: relative;
    z-index: 99998;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    font-family: var(--font-mono, monospace);
  `;
  
  ribbon.innerHTML = `
    <span>⚡ FLASH SALE ƯU ĐÃI NÂNG CẤP PRO KẾT THÚC SAU:</span>
    <span id="lf-timer-display" style="background: rgba(0,0,0,0.5); padding: 4px 10px; border-radius: 4px; font-size: 1rem;">00:00:00</span>
  `;
  
  document.body.insertBefore(ribbon, document.body.firstChild);

  // Update timer every second
  setInterval(() => {
    const now = Date.now();
    const distance = parseInt(saleEndTime) - now;
    if (distance < 0) {
      document.getElementById('lf-timer-display').textContent = "00:00:00";
      return;
    }
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById('lf-timer-display').textContent = 
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);


  // --- 2. LUMENFORGE REWARDS (XP BADGE & POPUP) ---
  const currentXp = parseInt(localStorage.getItem('lumenforge_xp') || '0');
  
  // Inject XP Badge into Nav
  setTimeout(() => {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
      const xpBadge = document.createElement('div');
      xpBadge.style.cssText = `
        background: rgba(245, 166, 35, 0.1);
        border: 1px solid var(--accent-amber);
        color: var(--accent-amber);
        padding: 4px 12px;
        border-radius: 20px;
        font-family: var(--font-mono, monospace);
        font-size: 0.8rem;
        font-weight: bold;
        margin-left: 15px;
        display: flex;
        align-items: center;
        gap: 5px;
      `;
      xpBadge.innerHTML = `<span>⚡</span> ${currentXp} XP`;
      navMenu.appendChild(xpBadge);
    }
  }, 100);

  // Reward Check (500 XP = 20% Discount)
  if (currentXp >= 500 && !localStorage.getItem('lf_reward_claimed')) {
    setTimeout(() => {
      const modalHtml = `
        <div id="lf-reward-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 100000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(8px); opacity: 0; transition: opacity 0.4s;">
          <div style="background: var(--bg-card, #0a0a0c); width: 90%; max-width: 450px; border-radius: 16px; border: 1px solid var(--accent-amber); padding: 40px; text-align: center; box-shadow: 0 0 40px rgba(245,166,35,0.2);">
            <div style="font-size: 4rem; margin-bottom: 10px;">🏆</div>
            <h2 style="color: var(--accent-amber); margin-top: 0; font-family: var(--font-heading);">CHÚC MỪNG!</h2>
            <p style="color: #fff; font-size: 1rem; line-height: 1.5; margin-bottom: 25px;">Bạn đã cày đủ <strong>500 XP</strong> trên LumenForge. Đây là phần thưởng dành riêng cho sự chăm chỉ của bạn:</p>
            
            <div style="background: rgba(0,0,0,0.5); border: 2px dashed var(--accent-amber); padding: 15px; border-radius: 8px; margin-bottom: 25px;">
              <div style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 5px; text-transform: uppercase;">Mã giảm 20% toàn sàn</div>
              <div style="font-size: 2rem; font-family: var(--font-mono); font-weight: bold; color: var(--accent-cyan); letter-spacing: 2px;">LFVIP20</div>
            </div>
            
            <button class="btn-primary" onclick="document.getElementById('lf-reward-modal').remove(); localStorage.setItem('lf_reward_claimed', 'true');" style="width: 100%; padding: 14px; background: var(--accent-amber); color: #000; font-weight: bold; border-radius: 6px; border: none; cursor: pointer;">NHẬN THƯỞNG</button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      setTimeout(() => {
        const el = document.getElementById('lf-reward-modal');
        if (el) el.style.opacity = '1';
      }, 50);
    }, 2000);
  }

})();
'''

with open(common_js_path, 'r', encoding='utf-8') as f:
    common_js_content = f.read()

if 'LUMENFORGE COMMERCIAL SPRINT 19' not in common_js_content:
    with open(common_js_path, 'a', encoding='utf-8') as f:
        f.write(sprint19_logic)
    print("Sprint 19 Timer & Rewards added to common.js")

# --- 2. Modify quiz.html (UI) ---
quiz_html_path = 'e:/Antigravity project/LumenForge/quiz.html'
with open(quiz_html_path, 'r', encoding='utf-8') as f:
    quiz_html_content = f.read()

recommendation_html = '''
      <!-- Personalized Recommendation (Sprint 19) -->
      <div id="quiz-recommendation" style="display: none; background: rgba(0,0,0,0.3); border: 1px solid var(--accent-amber); border-radius: 12px; padding: 25px; margin: 30px auto; max-width: 500px; text-align: left; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--accent-amber);"></div>
        <div style="font-size: 0.85rem; color: var(--accent-cyan); text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 10px; font-family: var(--font-mono);">⚡ Đề xuất Phù hợp nhất dành cho bạn</div>
        <h4 id="rec-title" style="color: #fff; font-size: 1.2rem; margin: 0 0 10px 0;">LumenForge Starter Bundle</h4>
        <p id="rec-desc" style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px;">
          Gói combo đầy đủ để nâng cấp nền tảng từ cơ bản lên chuyên nghiệp.
        </p>
        <button id="rec-btn" onclick="openCheckoutModal('bundle-starter', 249000)" class="btn-primary" style="width: 100%; padding: 12px; border-radius: 6px; font-weight: bold;">Khám phá Gói này ngay</button>
      </div>
'''
if 'id="quiz-recommendation"' not in quiz_html_content:
    target_quiz = '<div style="display: flex; gap: 15px; justify-content: center;">'
    quiz_html_content = quiz_html_content.replace(target_quiz, recommendation_html + '\n      ' + target_quiz)
    with open(quiz_html_path, 'w', encoding='utf-8') as f:
        f.write(quiz_html_content)
    print("Sprint 19 Recommendation UI added to quiz.html")


# --- 3. Modify js/quiz.js (Logic) ---
quiz_js_path = 'e:/Antigravity project/LumenForge/js/quiz.js'
with open(quiz_js_path, 'r', encoding='utf-8') as f:
    quiz_js_content = f.read()

# Add logic to showResults()
target_js = "// Calculate and display XP"
recommendation_js = '''
  // SPRINT 19: Show Personalized Recommendation
  const recEl = document.getElementById('quiz-recommendation');
  const recTitle = document.getElementById('rec-title');
  const recDesc = document.getElementById('rec-desc');
  const recBtn = document.getElementById('rec-btn');
  
  if (recEl) {
    recEl.style.display = 'block';
    if (score >= 9) {
      recTitle.textContent = "Gói LumenForge PRO (Lifetime)";
      recDesc.textContent = "Ở trình độ này, bạn đã sẵn sàng sử dụng các công cụ Workflow cao cấp nhất của chúng tôi để bứt phá giới hạn điện ảnh.";
      recBtn.setAttribute('onclick', "openCheckoutModal('pro-lifetime', 2490000)");
      recBtn.textContent = "Nâng cấp lên PRO";
    } else {
      recTitle.textContent = "Creator Starter Bundle";
      recDesc.textContent = "Dựa trên lỗ hổng kiến thức của bạn, gói Bundle này với Ebook Ánh Sáng và 15 Preset sẽ giúp bạn lấy lại nền tảng cực kỳ nhanh chóng.";
      recBtn.setAttribute('onclick', "openCheckoutModal('bundle-starter', 249000)");
      recBtn.textContent = "Nhận ngay với 50% Off";
    }
  }

  // Calculate and display XP'''

if 'SPRINT 19: Show Personalized Recommendation' not in quiz_js_content:
    quiz_js_content = quiz_js_content.replace(target_js, recommendation_js)
    with open(quiz_js_path, 'w', encoding='utf-8') as f:
        f.write(quiz_js_content)
    print("Sprint 19 Logic added to quiz.js")

print("Sprint 19 fully applied!")
