/**
 * LUMENFORGE DASHBOARD LOGIC
 * Interacts with js/auth.js (AuthSystem)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Make sure auth is loaded
    if (typeof lfAuth === 'undefined') {
        console.error('Auth system not found');
        return;
    }

    if (!lfAuth.isLoggedIn()) {
        // Force open modal if not logged in, wait a bit for DOM to be fully parsed
        setTimeout(() => {
            openAuthModal();
        }, 500);
        
        // Return but we can still bind some static listeners
    } else {
        initDashboard();
    }
});

function initDashboard() {
    const user = lfAuth.currentUser;
    
    // 1. Render User Info
    const avatarEl = document.getElementById('user-avatar');
    if (avatarEl) avatarEl.innerText = user.avatar;
    
    const nameEl = document.querySelector('.user-info h2');
    if (nameEl) nameEl.innerText = user.name;
    
    const xpEl = document.getElementById('user-xp');
    const readCount = lfAuth.getReadCount();
    // 10 XP per read article, 50 XP per purchase
    const totalXp = readCount * 10 + lfAuth.purchases.length * 50;
    if (xpEl) xpEl.innerText = totalXp + ' XP';

    const rankEl = document.getElementById('user-rank');
    if (rankEl) {
        if (totalXp >= 1000) rankEl.textContent = 'Rank: Director of Photography';
        else if (totalXp >= 300) rankEl.textContent = 'Rank: Advanced Shooter';
        else rankEl.textContent = 'Rank: Novice';
    }

    // 2. Render Progress
    const progressEl = document.getElementById('read-progress');
    const countEl = document.getElementById('read-count');
    const totalArticles = 49;
    
    if (countEl) countEl.innerText = readCount;
    if (progressEl) {
        const pct = Math.min(100, Math.round((readCount / totalArticles) * 100));
        // Add slight delay for animation
        setTimeout(() => {
            progressEl.style.width = pct + '%';
        }, 100);
    }

    // 3. Render Bookmarks
    const bookmarkList = document.getElementById('bookmark-list');
    if (bookmarkList) {
        if (lfAuth.bookmarks.length === 0) {
            bookmarkList.innerHTML = '<li style="color: var(--text-dim); font-style: italic;">Bạn chưa lưu bài viết nào.</li>';
        } else {
            bookmarkList.innerHTML = '';
            lfAuth.bookmarks.forEach(b => {
                const li = document.createElement('li');
                li.style.marginBottom = "10px";
                li.innerHTML = `<a href="${b.data.link}" style="color: var(--accent-amber); text-decoration: none;">▶ ${b.data.title}</a>`;
                bookmarkList.appendChild(li);
            });
        }
    }

    // 4. Handle Reset
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
        // Remove old listeners by replacing the node (since old script might have bound it)
        const newResetBtn = resetBtn.cloneNode(true);
        resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
        
        newResetBtn.addEventListener('click', () => {
            if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử học tập, bookmark và đăng xuất không?")) {
                localStorage.removeItem('lf_bookmarks');
                localStorage.removeItem('lf_read_history');
                localStorage.removeItem('lf_purchases');
                lfAuth.logout();
            }
        });
    }

    // 5. Purchases & Binder
    const binderBtn = document.getElementById('btn-print-binder');
    if (binderBtn) {
        if (lfAuth.hasPurchased('ebook-chiaroscuro')) {
            binderBtn.innerText = "Tải Ebook Chiaroscuro (PDF)";
            binderBtn.onclick = () => alert("Mô phỏng tải xuống Ebook...");
        } else {
            binderBtn.innerText = "Khóa (Chưa nâng cấp Pro)";
            binderBtn.style.opacity = '0.5';
            binderBtn.onclick = () => window.location.href = 'store.html';
        }
    }
}
