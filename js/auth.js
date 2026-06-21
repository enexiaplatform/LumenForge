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

