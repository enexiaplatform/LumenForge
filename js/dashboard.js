/**
 * LUMENFORGE DASHBOARD LOGIC
 * Interacts with js/auth.js (AuthSystem) & js/supabase.js
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
    } else {
        initDashboard();
    }
});

// Auto-reinit when Supabase goes online
document.addEventListener('supabaseReady', () => {
    if (lfAuth.isLoggedIn()) {
        initDashboard();
    }
});

async function initDashboard() {
    const user = lfAuth.currentUser;
    if (!user) return;
    
    // Complete Day 5 when opening the dashboard with transactions
    let salesCount = 0;
    try {
        if (window.lfSupabase && window.lfSupabase.isOnline) {
            const mySales = await window.lfSupabase.getMySales();
            salesCount = mySales.length;
        } else {
            const sales = JSON.parse(localStorage.getItem('lf_creator_sales') || '[]');
            salesCount = sales.length;
        }
    } catch(e) {
        console.error(e);
    }

    if (salesCount > 0) {
        localStorage.setItem('lf_visited_dashboard', 'true');
    }
    
    // 1. Render User Info
    const avatarEl = document.getElementById('user-avatar');
    if (avatarEl) avatarEl.innerText = user.avatar || 'U';
    
    const nameEl = document.querySelector('.user-info h2');
    if (nameEl) nameEl.innerText = user.name;
    
    // 2. XP & Rank Calculation (Including Quiz XP)
    const xpEl = document.getElementById('user-xp');
    const readCount = lfAuth.getReadCount();
    const quizScoreStr = localStorage.getItem('lf_quiz_score') || '';
    let quizXP = 0;
    if (quizScoreStr) {
        const correct = parseInt(quizScoreStr.split('/')[0], 10) || 0;
        quizXP = correct * 20; // 20 XP per correct answer
    }
    
    // Calculate total XP: 10 XP per read article, 50 XP per standard purchase, and quizXP
    // If Supabase is online, use user's saved XP in the database, otherwise calculate dynamically
    const totalXp = (window.lfSupabase && window.lfSupabase.isOnline) 
        ? (user.xp || 0) 
        : (readCount * 10 + lfAuth.purchases.length * 50 + quizXP);

    if (xpEl) xpEl.innerText = totalXp + ' XP';

    const rankEl = document.getElementById('user-rank');
    if (rankEl) {
        if (window.lfSupabase && window.lfSupabase.isOnline) {
            rankEl.textContent = `Rank: ${user.rank || 'Novice'}`;
        } else {
            if (totalXp >= 1000) rankEl.textContent = 'Rank: Director of Photography';
            else if (totalXp >= 300) rankEl.textContent = 'Rank: Advanced Shooter';
            else rankEl.textContent = 'Rank: Novice';
        }
    }

    // 3. Render Progress
    const progressEl = document.getElementById('read-progress');
    const countEl = document.getElementById('read-count');
    const totalArticles = 49;
    
    if (countEl) countEl.innerText = readCount;
    if (progressEl) {
        const pct = Math.min(100, Math.round((readCount / totalArticles) * 100));
        setTimeout(() => {
            progressEl.style.width = pct + '%';
        }, 100);
    }

    // 4. Render Mastery Quiz Stats
    const quizScoreEl = document.getElementById('quiz-score');
    const quizTitleEl = document.getElementById('quiz-title');
    if (quizScoreEl && quizTitleEl) {
        const score = localStorage.getItem('lf_quiz_score');
        const title = localStorage.getItem('lf_quiz_title');
        
        if (score) {
            quizScoreEl.innerText = score;
            quizTitleEl.innerText = title || 'N/A';
        } else {
            quizScoreEl.innerText = 'Chưa có dữ liệu';
            quizTitleEl.innerText = 'N/A';
        }
    }

    // 5. Render Bookmarks
    const bookmarkList = document.getElementById('bookmark-list');
    if (bookmarkList) {
        if (lfAuth.bookmarks.length === 0) {
            bookmarkList.innerHTML = `
              <div style="text-align: center; padding: 30px 10px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px;">
                <div style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;">🔖</div>
                <div style="color: var(--text-secondary); margin-bottom: 15px; font-size: 0.9rem;">Thư viện trống. Hãy lưu lại các bài viết hữu ích để đọc lại sau.</div>
                <a href="light-codex.html" class="btn-secondary" style="padding: 8px 16px; font-size: 0.85rem;">Khám phá Light Codex</a>
              </div>
            `;
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
    
    // Render Recently Read
    const recentList = document.getElementById('recent-list');
    if (recentList) {
        if (lfAuth.readHistory && lfAuth.readHistory.length > 0) {
            recentList.innerHTML = '';
            // Show last 3
            const recent = [...lfAuth.readHistory].reverse().slice(0, 3);
            recent.forEach(h => {
                const li = document.createElement('li');
                li.style.marginBottom = "10px";
                li.innerHTML = `<a href="articles/${h.id}.html" style="color: var(--accent-cyan); text-decoration: none;">▶ Bài viết #${h.id}</a> <span style="font-size:0.8rem; color:var(--text-dim);">(${new Date(h.timestamp).toLocaleDateString()})</span>`;
                recentList.appendChild(li);
            });
        }
    }
    
    // 6. Purchases / Inventory Rendering
    const inventoryList = document.getElementById('inventory-list');
    if (inventoryList) {
        if (lfAuth.purchases.length === 0) {
            inventoryList.innerHTML = `
              <div style="text-align: center; padding: 40px 10px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px;">
                <div style="font-size: 2.5rem; margin-bottom: 10px; opacity: 0.5;">📦</div>
                <div style="color: var(--text-secondary); margin-bottom: 15px; font-size: 0.95rem;">Bạn chưa sở hữu tài liệu hay preset nào.</div>
                <a href="store.html" class="btn-primary" style="padding: 10px 20px; font-size: 0.9rem;">Ghé thăm Store</a>
              </div>
            `;
        } else {
            inventoryList.innerHTML = '';
            lfAuth.purchases.forEach(p => {
                const li = document.createElement('li');
                li.style.marginBottom = "15px";
                li.style.padding = "15px";
                li.style.background = "rgba(255,255,255,0.03)";
                li.style.borderRadius = "8px";
                li.style.border = "1px solid var(--border-color)";
                li.style.borderLeft = "4px solid var(--accent-amber)";
                
                const date = new Date(p.timestamp).toLocaleDateString('vi-VN');
                const pName = p.data.name || p.data.title || p.id;
                const pType = p.data.type || 'Tài liệu số';
                const pLink = p.data.link || '#';

                li.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <div style="font-weight: bold; font-size: 1.1rem; color: #fff;">${pName}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 5px;">Loại: ${pType} • Mở khóa ngày: ${date}</div>
                        </div>
                        <a href="${pLink}" class="btn-primary" style="padding: 6px 16px; font-size: 0.85rem; text-decoration: none;" target="_blank">
                            ${pType.includes('Ebook') ? 'Đọc Ngay' : 'Tải xuống File'}
                        </a>
                    </div>
                `;
                inventoryList.appendChild(li);
            });
        }
    }

    // 7. Render Creator Hub / Program Section (Asynchronous)
    await renderCreatorHub();

    // 8. Handle Reset
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
        const newResetBtn = resetBtn.cloneNode(true);
        resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
        
        newResetBtn.addEventListener('click', () => {
            if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử học tập, các sản phẩm đã đăng bán, bookmark và đăng xuất không?")) {
                localStorage.removeItem('lf_bookmarks');
                localStorage.removeItem('lf_read_history');
                localStorage.removeItem('lf_purchases');
                localStorage.removeItem('lf_custom_products');
                localStorage.removeItem('lf_is_creator');
                localStorage.removeItem('lf_quiz_score');
                localStorage.removeItem('lf_quiz_title');
                localStorage.removeItem('lf_xp');
                localStorage.removeItem('lumenforge_read_articles');
                localStorage.removeItem('lumenforge_xp');
                localStorage.removeItem('lumenforge_read');
                lfAuth.logout();
            }
        });
    }

    // Binder (legacy)
    const binderBtn = document.getElementById('btn-print-binder');
    if (binderBtn) {
        if (lfAuth.hasPurchased('ebook-chiaroscuro')) {
            binderBtn.innerText = "Tải Ebook Chiaroscuro (PDF)";
            binderBtn.onclick = () => alert("Đang mở bản tải xuống Ebook...");
        } else {
            binderBtn.innerText = "Khóa (Chưa nâng cấp Pro)";
            binderBtn.style.opacity = '0.6';
        }
    }
}

async function renderCreatorHub() {
    const container = document.getElementById('creator-hub-container');
    if (!container) return;

    const isCreator = localStorage.getItem('lf_is_creator') === 'true' || lfAuth.currentUser?.isCreator;
    
    let customProducts = [];
    let creatorSales = [];

    try {
        if (window.lfSupabase && window.lfSupabase.isOnline) {
            const uid = lfAuth.currentUser?.id;
            const allProducts = await window.lfSupabase.getAllProducts();
            // Filter products owned by this creator
            customProducts = allProducts.filter(p => p.creator_id === uid);
            creatorSales = await window.lfSupabase.getMySales();
        } else {
            customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
            const sales = JSON.parse(localStorage.getItem('lf_creator_sales') || '[]');
            creatorSales = sales.filter(s => customProducts.some(cp => cp.id === s.productId));
        }
    } catch (e) {
        console.error('[DASHBOARD] Failed loading creator hub data:', e);
        customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
    }

    if (isCreator) {
        const totalSales = creatorSales.length;
        const totalRevenue = creatorSales.reduce((sum, s) => sum + Number(s.price), 0);
        const creatorRevenue = totalRevenue * 0.7; // 70% revshare
        const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue);
        const formattedCreator = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(creatorRevenue);

        container.innerHTML = `
            <div class="dash-card" style="border-color: var(--accent-cyan); background: rgba(0, 212, 170, 0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                    <h3 style="margin: 0; color: var(--accent-cyan);">👨‍💻 Creator Studio & Store Hub</h3>
                    <a href="creator-onboarding.html" class="btn-primary" style="padding: 6px 15px; font-size: 0.85rem; background: var(--accent-cyan); color: #000; text-decoration: none;">Đăng bán sản phẩm mới</a>
                </div>

                <!-- 7-Day Commercial Onboarding Launchpad -->
                <div style="background: rgba(245, 166, 35, 0.02); border: 1px solid rgba(245, 166, 35, 0.15); padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <h4 style="margin: 0 0 10px 0; color: var(--accent-amber); font-family: var(--font-mono); font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center;">
                        <span>🚀 LỘ TRÌNH THƯƠNG MẠI (7 NGÀY)</span>
                        <span id="launchpad-progress-pct" style="font-family: var(--font-mono); font-size: 0.8rem; color: #fff;">0%</span>
                    </h4>
                    <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; margin-bottom: 15px;">
                        <div id="launchpad-progress-bar" style="width: 0%; height: 100%; background: var(--accent-amber); transition: width 0.5s ease;"></div>
                    </div>
                    <div id="launchpad-checklist" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 15px;">
                        <!-- Checklist items rendered by JS -->
                    </div>
                </div>

                <!-- Stats Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
                        <div style="font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; font-family: var(--font-mono); margin-bottom: 5px;">Sản phẩm đang bán</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: #fff; font-family: var(--font-mono);">${customProducts.length}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
                        <div style="font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; font-family: var(--font-mono); margin-bottom: 5px;">Số lượt mua thử nghiệm</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--accent-amber); font-family: var(--font-mono);">${totalSales}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); text-align: center; display: flex; flex-direction: column; justify-content: center;">
                        <div style="font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; font-family: var(--font-mono); margin-bottom: 5px;">Thu nhập của bạn (70%)</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent-cyan); font-family: var(--font-mono); margin-bottom: 5px;">${formattedCreator}</div>
                        <div style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 10px;">Tổng thu: ${formattedTotal}</div>
                        <button onclick="requestPayout()" class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 4px; border: none; font-weight: bold; cursor: pointer; width: 100%;">Yêu cầu rút tiền</button>
                    </div>
                </div>

                <h4 style="color: #fff; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px; font-family: var(--font-mono); margin-bottom: 15px; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">Danh sách sản phẩm của bạn</h4>
                
                <div style="overflow-x: auto; margin-bottom: 30px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; min-width: 600px;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-dim);">
                                <th style="padding: 10px 5px;">Tên sản phẩm</th>
                                <th style="padding: 10px 5px;">Phân loại</th>
                                <th style="padding: 10px 5px;">Đơn giá</th>
                                <th style="padding: 10px 5px;">Trạng thái</th>
                                <th style="padding: 10px 5px; text-align: right;">Kiểm thử & Deploy</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${customProducts.length === 0 ? `
                                <tr>
                                    <td colspan="5" style="text-align: center; padding: 20px; color: var(--text-dim); font-style: italic;">
                                        Chưa có sản phẩm nào. <a href="creator-onboarding.html" style="color: var(--accent-cyan);">Đăng bán sản phẩm đầu tiên</a> để bắt đầu.
                                    </td>
                                </tr>
                            ` : customProducts.map(prod => {
                                const priceStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price || prod.priceVnd);
                                const status = prod.status || 'draft';
                                const type = prod.type || 'preset';
                                
                                let statusBadge = '';
                                let actionButtons = '';
                                
                                if (status === 'draft') {
                                    statusBadge = `<span style="background: rgba(245, 158, 11, 0.15); color: #F59E0B; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; border: 1px solid rgba(245, 158, 11, 0.3);">Nháp Cục Bộ</span>`;
                                    actionButtons = `
                                        <button onclick="downloadProductManifest('${prod.id}')" class="btn-primary" style="padding: 4px 8px; font-size: 0.75rem; background: var(--accent-amber); color: #000; font-weight: bold; border-radius: 4px; margin-right: 5px;">Tải Manifest</button>
                                        <a href="creator-onboarding.html?edit=${prod.id}" class="btn-secondary" style="padding: 4px 8px; font-size: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px; text-decoration: none; display: inline-block;">Sửa</a>
                                    `;
                                } else if (status === 'testing') {
                                    statusBadge = `<span style="background: rgba(6, 182, 212, 0.15); color: #06B6D4; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; border: 1px solid rgba(6, 182, 212, 0.3);">Đang Thử Nghiệm</span>`;
                                    actionButtons = `
                                        <button onclick="simulatePurchase('${prod.id}')" class="btn-primary" style="padding: 4px 8px; font-size: 0.75rem; background: var(--accent-cyan); color: #000; font-weight: bold; border-radius: 4px; margin-right: 5px;">Test Mua</button>
                                        <button onclick="submitProduct('${prod.id}')" class="btn-primary" style="padding: 4px 8px; font-size: 0.75rem; background: var(--accent-purple, #8b5cf6); color: #fff; font-weight: bold; border-radius: 4px;">Gửi Duyệt</button>
                                    `;
                                } else if (status === 'submitted') {
                                    statusBadge = `<span style="background: rgba(139, 92, 246, 0.15); color: #8B5CF6; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; border: 1px solid rgba(139, 92, 246, 0.3); animation: pulse 2s infinite;">Chờ Deploy</span>`;
                                    actionButtons = `
                                        <button onclick="approveProduct('${prod.id}')" class="btn-primary" style="padding: 4px 8px; font-size: 0.75rem; background: var(--accent-green, #10b981); color: #000; font-weight: bold; border-radius: 4px; margin-right: 5px;">Duyệt & Live</button>
                                        <button onclick="downloadProductManifest('${prod.id}')" class="btn-secondary" style="padding: 4px 8px; font-size: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px;">Manifest</button>
                                    `;
                                } else if (status === 'approved') {
                                    statusBadge = `<span style="background: rgba(16, 185, 129, 0.15); color: #10B981; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; border: 1px solid rgba(16, 185, 129, 0.3);">Live CDN</span>`;
                                    actionButtons = `
                                        <span style="font-size: 0.8rem; color: var(--accent-green, #10b981); font-weight: bold; padding: 4px 8px;">✓ Sẵn sàng Kinh doanh</span>
                                    `;
                                }

                                return `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-secondary);">
                                        <td style="padding: 12px 5px; font-weight: bold; color: #fff;">${prod.name}</td>
                                        <td style="padding: 12px 5px; text-transform: capitalize;">${type === 'ebook' ? 'Ebook' : type === 'preset' ? 'Presets' : 'LUTs'}</td>
                                        <td style="padding: 12px 5px; font-family: var(--font-mono);">${priceStr}</td>
                                        <td style="padding: 12px 5px;">${statusBadge}</td>
                                        <td style="padding: 12px 5px; text-align: right;">${actionButtons}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <h4 style="color: #fff; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px; font-family: var(--font-mono); margin-bottom: 10px; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">Lịch sử Giao dịch mua hàng (Giả lập)</h4>
                ${salesTableHtml(creatorSales)}
            </div>
        `;

        // Trigger checklist update
        setTimeout(() => {
            if (window.lfOnboarding) {
                window.lfOnboarding.updateLaunchpadUI();
            }
        }, 50);
    } else {
        // Render Creator program teaser
        container.innerHTML = `
            <div class="dash-card" style="border: 1px dashed var(--border-color); text-align: center; padding: 40px 20px;">
                <div style="font-size: 2.5rem; margin-bottom: 15px;">✨</div>
                <h3 style="margin: 0 0 10px 0; color: #fff;">Tham gia LumenForge Creator Program</h3>
                <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 20px; font-size: 0.95rem; line-height: 1.5;">
                    Bạn là Nhiếp ảnh gia, Colorist hay Nhà làm phim? Hãy chia sẻ các tài liệu nghiên cứu, công thức màu (LUTs) hoặc Presets Lightroom của bạn để tạo doanh thu thụ động ngay hôm nay.
                </p>
                <a href="creator-onboarding.html" class="btn-primary" style="display: inline-block; padding: 10px 25px; text-decoration: none; font-size: 0.9rem; font-weight: bold; border-radius: 6px;">Bắt đầu Onboarding</a>
            </div>
        `;
    }
}

// Simulated Sales Table Template
function salesTableHtml(creatorSales) {
    if (creatorSales.length === 0) {
        return `<div style="text-align: center; padding: 25px; color: var(--text-dim); font-style: italic;">Chưa có giao dịch mua hàng thử nghiệm nào. Hãy nhấp "Test Mua" trong bảng sản phẩm phía trên.</div>`;
    }
    
    return `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
                <thead>
                    <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-dim);">
                        <th style="padding: 8px 5px;">Mã GD</th>
                        <th style="padding: 8px 5px;">Sản phẩm</th>
                        <th style="padding: 8px 5px;">Khách hàng</th>
                        <th style="padding: 8px 5px;">Thời gian</th>
                        <th style="padding: 8px 5px; text-align: right;">Doanh thu nhận về</th>
                    </tr>
                </thead>
                <tbody>
                    ${creatorSales.slice().reverse().map(s => {
                        const priceVal = s.price || s.priceVnd;
                        const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceVal);
                        
                        // Parse timestamp
                        let dateStr = 'Unknown';
                        if (s.created_at) {
                            dateStr = new Date(s.created_at).toLocaleString('vi-VN');
                        } else if (s.timestamp) {
                            dateStr = new Date(s.timestamp).toLocaleString('vi-VN');
                        }
                        
                        const buyerName = s.buyer_name || s.buyerName || 'Khách';
                        const buyerEmail = s.buyer_email || s.buyerEmail || '';
                        
                        return `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.03); color: var(--text-secondary);">
                                <td style="padding: 10px 5px; font-family: var(--font-mono); color: var(--accent-cyan); font-weight: bold;">${s.id}</td>
                                <td style="padding: 10px 5px; color: #fff;">${s.product_name || s.productName}</td>
                                <td style="padding: 10px 5px; font-family: var(--font-mono);">${buyerEmail}</td>
                                <td style="padding: 10px 5px; font-size: 0.8rem;">${dateStr}</td>
                                <td style="padding: 10px 5px; text-align: right; color: var(--accent-green, #10b981); font-weight: bold; font-family: var(--font-mono);">+${formattedPrice}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Global window actions for Creator Dashboard testing buttons
window.simulatePurchase = function(productId) {
    if (window.lfOnboarding) {
        window.lfOnboarding.simulateCustomerPurchase(productId, () => {
            initDashboard();
        });
    }
};

window.requestPayout = function() {
    alert('Yêu cầu rút tiền đã được gửi tới hệ thống!\n\nSố tiền sẽ được chuyển qua VietQR / MoMo của bạn (đã đăng ký trong Onboarding) vào ngày mùng 5 tháng tới.');
};

window.submitProduct = function(productId) {
    if (window.lfOnboarding) {
        window.lfOnboarding.submitToAdmin(productId, () => {
            initDashboard();
        });
    }
};

window.approveProduct = async function(productId) {
    if (window.lfSupabase && window.lfSupabase.isOnline) {
        try {
            await window.lfSupabase.updateProductStatus(productId, 'approved');
        } catch(e) {
            console.error(e);
        }
    } else {
        const customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
        const prodIndex = customProducts.findIndex(p => p.id === productId);
        if (prodIndex > -1) {
            customProducts[prodIndex].status = 'approved';
            localStorage.setItem('lf_custom_products', JSON.stringify(customProducts));
        }
    }
    
    // Complete Day 7
    localStorage.setItem('lf_manifest_submitted', 'true');
    
    alert('🎉 CHÚC MỪNG!\n\nSản phẩm đã được Admin Henry phê duyệt và chính thức Live trên Store LumenForge toàn cầu!');
    
    initDashboard();
};

window.downloadProductManifest = async function(productId) {
    let prod = null;
    if (window.lfSupabase && window.lfSupabase.isOnline) {
        try {
            const { data } = await window.lfSupabase.client
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();
            if (data) {
                // Map DB schema back to standard manifest format
                prod = {
                    id: data.id,
                    name: data.name,
                    creator: data.creator,
                    creatorEmail: data.creator_email,
                    bankName: data.bank_name,
                    bankAccount: data.bank_account,
                    bankOwner: data.bank_owner,
                    momoNumber: data.momo_number,
                    type: data.type,
                    price: data.price,
                    originalPrice: data.original_price,
                    desc: data.description,
                    coverUrl: data.cover_url,
                    fileLink: data.file_link,
                    status: data.status
                };
            }
        } catch (e) {
            console.error('[MANIFEST DOWNLOAD] Database error:', e);
        }
    }
    
    if (!prod) {
        const customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
        prod = customProducts.find(p => p.id === productId);
    }

    if (!prod) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prod, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lumenforge-product-${prod.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    localStorage.setItem('lf_manifest_downloaded', 'true');
    
    // Complete Day 6
    alert('✅ Manifest tải xuống thành công!\n\nBạn có thể gửi file cấu trúc này cho Henry (Admin) qua Telegram hoặc Email để deploy.');
    initDashboard();
};
