/**
 * LUMENFORGE MOCK AUTHENTICATION SYSTEM
 * Operates purely on localStorage for MVP demonstration
 */

const AuthConfig = {
    MOCK_USERS: {
        'user@example.com': {
            password: 'password123',
            name: 'Photographer',
            avatar: 'P'
        }
    }
};

class AuthSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('lf_user')) || null;
        this.purchases = JSON.parse(localStorage.getItem('lf_purchases')) || [];
        this.bookmarks = JSON.parse(localStorage.getItem('lf_bookmarks')) || [];
        this.readHistory = JSON.parse(localStorage.getItem('lf_read_history')) || [];
    }

    // -- Authentication --
    login(email, password) {
        // Mock validation
        if (AuthConfig.MOCK_USERS[email] && AuthConfig.MOCK_USERS[email].password === password) {
            const name = AuthConfig.MOCK_USERS[email].name;
            const isAdmin = email.toLowerCase() === 'admin@lumenforge.studio' || email.toLowerCase() === 'henry@lumenforge.studio';
            this.currentUser = { 
                email, 
                name, 
                avatar: AuthConfig.MOCK_USERS[email].avatar,
                isCreator: isAdmin || name.toLowerCase().includes('creator'),
                isAdmin: isAdmin
            };
            localStorage.setItem('lf_user', JSON.stringify(this.currentUser));
            if (isAdmin) {
                localStorage.setItem('lf_user_is_admin', 'true');
            }
            return { success: true };
        }
        
        // For demonstration, allow ANY email/password to create an account if it doesn't exist
        const name = email.split('@')[0];
        const isAdmin = email.toLowerCase() === 'admin@lumenforge.studio' || email.toLowerCase() === 'henry@lumenforge.studio';
        this.currentUser = { 
            email, 
            name: name.charAt(0).toUpperCase() + name.slice(1), 
            avatar: email.charAt(0).toUpperCase(),
            isCreator: isAdmin || email.toLowerCase().includes('creator'),
            isAdmin: isAdmin
        };
        localStorage.setItem('lf_user', JSON.stringify(this.currentUser));
        if (isAdmin) {
            localStorage.setItem('lf_user_is_admin', 'true');
        }
        return { success: true };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('lf_user');
        localStorage.removeItem('lf_user_is_admin');
        window.location.reload();
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isAdmin() {
        if (!this.isLoggedIn()) return false;
        const email = this.currentUser.email.toLowerCase();
        return email === 'admin@lumenforge.studio' || 
               email === 'henry@lumenforge.studio' || 
               this.currentUser.isAdmin === true || 
               localStorage.getItem('lf_user_is_admin') === 'true';
    }

    // -- Bookmarks --
    toggleBookmark(articleId, articleData) {
        if (!this.isLoggedIn()) return { error: 'not_logged_in' };
        
        const index = this.bookmarks.findIndex(b => b.id === articleId);
        let isBookmarked = false;
        
        if (index > -1) {
            this.bookmarks.splice(index, 1);
        } else {
            this.bookmarks.push({ id: articleId, data: articleData, timestamp: Date.now() });
            isBookmarked = true;
        }
        
        localStorage.setItem('lf_bookmarks', JSON.stringify(this.bookmarks));
        return { success: true, isBookmarked };
    }

    isBookmarked(articleId) {
        return this.bookmarks.some(b => b.id === articleId);
    }

    // -- Reading History --
    markAsRead(articleId, articleData) {
        if (!this.isLoggedIn()) return;
        
        if (!this.readHistory.some(h => h.id === articleId)) {
            this.readHistory.push({ id: articleId, data: articleData, timestamp: Date.now() });
            localStorage.setItem('lf_read_history', JSON.stringify(this.readHistory));
        }
    }

    getReadCount() {
        return this.readHistory.length;
    }

    // -- Purchases --
    addPurchase(productId, productData, status = 'purchased') {
        if (!this.isLoggedIn()) return { error: 'not_logged_in' };
        
        const existingIndex = this.purchases.findIndex(p => p.id === productId);
        if (existingIndex > -1) {
            this.purchases[existingIndex].status = status;
            this.purchases[existingIndex].data = { ...this.purchases[existingIndex].data, ...productData };
            this.purchases[existingIndex].timestamp = Date.now();
        } else {
            this.purchases.push({ id: productId, data: productData, status: status, timestamp: Date.now() });
        }
        localStorage.setItem('lf_purchases', JSON.stringify(this.purchases));
        return { success: true };
    }

    updatePurchaseStatus(productId, status) {
        if (!this.isLoggedIn()) return { error: 'not_logged_in' };
        const purchase = this.purchases.find(p => p.id === productId);
        if (purchase) {
            purchase.status = status;
            localStorage.setItem('lf_purchases', JSON.stringify(this.purchases));
            return { success: true };
        }
        return { error: 'not_found' };
    }

    getPurchase(productId) {
        return this.purchases.find(p => p.id === productId) || null;
    }

    hasPurchased(productId) {
        const purchase = this.purchases.find(p => p.id === productId);
        return purchase && (purchase.status === 'purchased' || purchase.status === 'free');
    }

    isPro() {
        return this.hasPurchased('pro-monthly') || this.hasPurchased('pro-annual') || this.hasPurchased('pro-lifetime');
    }
}

const lfAuth = new AuthSystem();
window.lfAuth = lfAuth;


// -- UI Integration --
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Auth Modal into body
    const modalHTML = `
    <div id="auth-modal" class="auth-modal">
        <div class="auth-modal-content">
            <button class="auth-modal-close" onclick="closeAuthModal()">&times;</button>
            <h2 id="auth-title">Đăng nhập vào LumenForge</h2>
            <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 0.9rem;">
                Nhập bất kỳ email/mật khẩu nào để trải nghiệm (Hệ thống giả lập)
            </p>
            <input type="email" id="auth-email" placeholder="Email" class="auth-input">
            <input type="password" id="auth-password" placeholder="Mật khẩu" class="auth-input">
            <button class="btn-primary" style="width: 100%; margin-top: 10px;" onclick="handleLogin()">Tiếp tục</button>
            <div id="auth-error" style="color: #ff3b30; margin-top: 10px; font-size: 0.85rem; display: none;"></div>
        </div>
    </div>
    <style>
        .auth-modal {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 10000; align-items: center; justify-content: center;
        }
        .auth-modal.active { display: flex; }
        .auth-modal-content {
            background: var(--bg-card); padding: 30px; border-radius: 12px; width: 90%; max-width: 400px;
            border: 1px solid var(--border-color); position: relative;
        }
        .auth-modal-close {
            position: absolute; top: 15px; right: 15px; background: none; border: none;
            color: var(--text-secondary); font-size: 1.5rem; cursor: pointer;
        }
        .auth-input {
            width: 100%; padding: 12px; margin-bottom: 15px; border-radius: 6px;
            background: rgba(255,255,255,0.05); border: 1px solid var(--border-color);
            color: #fff; font-family: inherit;
        }
        .auth-input:focus { outline: none; border-color: var(--accent-cyan); }
        
        .nav-user-profile {
            display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 5px 10px; border-radius: 20px;
            background: rgba(255,255,255,0.05); border: 1px solid var(--border-color);
        }
        .nav-avatar {
            width: 24px; height: 24px; border-radius: 50%; background: var(--accent-cyan);
            color: #000; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 0.8rem;
        }
    </style>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 2. Update Navigation
    updateNavigation();
});

function openAuthModal() {
    document.getElementById('auth-modal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

async function handleLogin() {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-password').value;
    
    if (!email || !pass) {
        const err = document.getElementById('auth-error');
        err.innerText = "Vui lòng điền đủ thông tin";
        err.style.display = "block";
        return;
    }
    
    const submitBtn = document.querySelector('#auth-modal .btn-primary');
    const originalText = submitBtn ? submitBtn.innerText : "Tiếp tục";
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Đang xử lý...";
    }
    
    try {
        const result = await lfAuth.login(email, pass);
        if (result && result.success === false) {
            const err = document.getElementById('auth-error');
            err.innerText = result.error || "Lỗi đăng nhập";
            err.style.display = "block";
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
            return;
        }
        closeAuthModal();
        window.location.reload(); // Reload to update UI across the app
    } catch (e) {
        const err = document.getElementById('auth-error');
        err.innerText = e.message || "Lỗi kết nối";
        err.style.display = "block";
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    }
}

function handleLogout() {
    lfAuth.logout();
}

function updateNavigation() {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return;

    // Find the dashboard link if it exists
    const dashLink = Array.from(navMenu.querySelectorAll('.nav-link')).find(l => {
        const href = l.getAttribute('href');
        return href && href.includes('dashboard.html');
    });
    
    if (lfAuth.isLoggedIn()) {
        let adminLink = '';
        if (lfAuth.isAdmin && lfAuth.isAdmin()) {
            adminLink = `<a href="admin.html" class="nav-link admin-nav-link" style="color: var(--accent-amber); font-weight: bold; border: 1px solid var(--accent-amber); border-radius: 4px; padding: 4px 8px; font-size: 0.8rem; margin-right: 15px; display: inline-flex; align-items: center; gap: 4px;">👑 ADMIN</a>`;
        }
        if (dashLink) {
            const dest = dashLink.getAttribute('href') || 'dashboard.html';
            dashLink.outerHTML = `
                ${adminLink}
                <div class="nav-user-profile" onclick="window.location.href='${dest}'" title="Vào Dashboard">
                    <div class="nav-avatar">${lfAuth.currentUser.avatar}</div>
                    <span style="font-size: 0.9rem; color: #fff;">${lfAuth.currentUser.name}</span>
                </div>
            `;
        }
    } else {
        if (dashLink) {
            dashLink.outerHTML = `
                <a href="#" class="nav-link" onclick="event.preventDefault(); openAuthModal();" style="border-bottom: 2px solid var(--accent-cyan);">Đăng nhập</a>
            `;
        }
    }
}

// Load Supabase modules dynamically
(function() {
    const authScript = document.querySelector('script[src*="auth.js"]');
    if (authScript) {
        const basePath = authScript.src.replace('auth.js', '');
        
        // 1. Load supabase-config.js
        const configScript = document.createElement('script');
        configScript.src = basePath + 'supabase-config.js';
        
        // 2. Once config is loaded, load supabase.js
        configScript.onload = () => {
            const dbScript = document.createElement('script');
            dbScript.src = basePath + 'supabase.js';
            document.head.appendChild(dbScript);
        };
        
        document.head.appendChild(configScript);
    }
})();

// -- Global PRO Gating UI & Logic --
AuthSystem.prototype.gateFeature = function(featureName, fallbackCallback) {
    if (this.isLoggedIn() && this.isPro()) {
        return true;
    }
    this.showProGatingModal(featureName, fallbackCallback);
    return false;
};

AuthSystem.prototype.showProGatingModal = function(featureName, fallbackCallback) {
    // Remove existing modal if any
    const existing = document.getElementById('lf-pro-gate-modal');
    if (existing) {
        existing.remove();
    }
    
    // Adjust paths based on folder level
    const isToolFolder = window.location.pathname.includes('/tools/') || window.location.pathname.includes('/recipes/') || window.location.pathname.includes('/articles/');
    const relativePrefix = isToolFolder ? '../' : '';
    
    const proHubLink = `${relativePrefix}pro-hub.html`;
    
    const modalHTML = `
    <div id="lf-pro-gate-modal" class="pro-gate-modal">
        <div class="pro-gate-content">
            <button class="pro-gate-close" id="pro-gate-close-btn">&times;</button>
            <div class="pro-gate-icon">👑</div>
            <h2>Mở khóa Tính năng PRO</h2>
            <h3>${featureName}</h3>
            <p>Tùy chọn chuyên sâu này dành riêng cho hội viên <strong>LumenForge PRO</strong>.</p>
            
            <div class="pro-gate-benefits">
                <div class="benefit-item">
                    <span style="color: var(--accent-gold); font-weight: bold; margin-right: 5px;">⚡</span>
                    Mở khóa 100% công cụ & tính năng giả lập cao cấp.
                </div>
                <div class="benefit-item">
                    <span style="color: var(--accent-gold); font-weight: bold; margin-right: 5px;">📖</span>
                    Đọc toàn bộ tủ sách Masterclass & tải presets không che.
                </div>
                <div class="benefit-item">
                    <span style="color: var(--accent-gold); font-weight: bold; margin-right: 5px;">💬</span>
                    Nhận đánh giá Portfolio & cố vấn trực tiếp hàng tuần.
                </div>
            </div>
            
            <div class="pro-gate-actions">
                <a href="${proHubLink}" class="btn-pro-action">Đăng ký Hội Viên PRO</a>
                ${!this.isLoggedIn() ? `
                    <button class="btn-pro-sec" id="pro-gate-login-btn">Đăng nhập tài khoản</button>
                ` : `
                    <button class="btn-pro-sec" id="pro-gate-cancel-btn">Đóng lại</button>
                `}
            </div>
        </div>
    </div>
    <style>
        .pro-gate-modal {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(5, 5, 7, 0.85); z-index: 20000;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(20px);
            animation: fadeInProGate 0.3s ease;
        }
        .pro-gate-content {
            background: rgba(15, 15, 20, 0.95);
            border: 1px solid var(--accent-gold);
            box-shadow: 0 25px 60px rgba(212, 175, 55, 0.15);
            padding: 40px; border-radius: 16px;
            width: 90%; max-width: 460px; text-align: center;
            position: relative;
            animation: slideUpProGate 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pro-gate-close {
            position: absolute; top: 15px; right: 15px; background: none; border: none;
            color: var(--text-secondary); font-size: 1.5rem; cursor: pointer;
            transition: color 0.2s;
        }
        .pro-gate-close:hover { color: #fff; }
        .pro-gate-icon {
            font-size: 3rem; margin-bottom: 15px;
            filter: drop-shadow(0 0 10px rgba(212,175,55,0.4));
            animation: pulseProIcon 2s infinite;
        }
        .pro-gate-content h2 {
            font-family: var(--font-heading); color: #fff; font-size: 1.6rem; margin-bottom: 5px;
            margin-top: 0;
        }
        .pro-gate-content h3 {
            font-family: var(--font-mono); color: var(--accent-gold); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;
            margin-top: 0;
        }
        .pro-gate-content p {
            color: var(--text-secondary); font-size: 0.92rem; line-height: 1.5; margin-bottom: 25px;
            margin-top: 0;
        }
        .pro-gate-benefits {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: left;
        }
        .benefit-item {
            font-size: 0.85rem; color: #ddd; margin-bottom: 12px; line-height: 1.4;
            display: flex; align-items: flex-start;
        }
        .benefit-item:last-child { margin-bottom: 0; }
        .pro-gate-actions {
            display: flex; flex-direction: column; gap: 12px;
        }
        .btn-pro-action {
            display: block; width: 100%; text-align: center; padding: 14px;
            background: linear-gradient(135deg, var(--accent-gold) 0%, #b38b22 100%);
            color: #000 !important; font-weight: bold; text-decoration: none; border-radius: 8px;
            box-shadow: 0 8px 20px var(--accent-gold-glow);
            transition: all 0.3s; font-size: 0.95rem; border: none; cursor: pointer;
            font-family: var(--font-body);
        }
        .btn-pro-action:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(212, 175, 55, 0.35);
        }
        .btn-pro-sec {
            display: block; width: 100%; text-align: center; padding: 12px;
            background: transparent; border: 1px solid rgba(255,255,255,0.15);
            color: var(--text-secondary); border-radius: 8px; font-size: 0.9rem;
            cursor: pointer; transition: all 0.2s;
            font-family: var(--font-body);
        }
        .btn-pro-sec:hover {
            color: #fff; background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.3);
        }
        
        @keyframes fadeInProGate {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUpProGate {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulseProIcon {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
    </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const closeModal = () => {
        document.getElementById('lf-pro-gate-modal').remove();
        if (fallbackCallback) fallbackCallback();
    };
    
    // Event listeners
    document.getElementById('pro-gate-close-btn').addEventListener('click', closeModal);
    
    const cancelBtn = document.getElementById('pro-gate-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    const loginBtn = document.getElementById('pro-gate-login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            document.getElementById('lf-pro-gate-modal').remove();
            openAuthModal();
        });
    }
    
    // Close on backdrop click
    document.getElementById('lf-pro-gate-modal').addEventListener('click', (e) => {
        if (e.target.id === 'lf-pro-gate-modal') {
            closeModal();
        }
    });
};

