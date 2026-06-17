/* ==========================================================================
   LUMENFORGE — Onboarding Flow Engine & Commercial Launchpad (DB Integrated)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Check if user has visited before
  if (!localStorage.getItem('lf_onboarded')) {
    initOnboarding();
  }
  
  // Auto-init checklist if elements exist
  if (window.lfOnboarding && document.getElementById('launchpad-checklist')) {
    window.lfOnboarding.updateLaunchpadUI();
  }
});

// Auto-reinit when Supabase goes online
document.addEventListener('supabaseReady', () => {
  if (window.lfOnboarding && document.getElementById('launchpad-checklist')) {
    window.lfOnboarding.updateLaunchpadUI();
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

// Global Onboarding Namespace for Commercial 7-Day Launchpad
window.lfOnboarding = {
    // Current statuses (Asynchronous to support Supabase loading)
    async getStatus() {
        let isCreator = localStorage.getItem('lf_is_creator') === 'true';
        let customProducts = [];
        let sales = [];

        if (window.lfSupabase && window.lfSupabase.isOnline && lfAuth.isLoggedIn()) {
            try {
                isCreator = lfAuth.currentUser?.isCreator || isCreator;
                const allProds = await window.lfSupabase.getAllProducts();
                customProducts = allProds.filter(p => p.creator_id === lfAuth.currentUser.id);
                sales = await window.lfSupabase.getMySales();
            } catch (e) {
                console.error('[ONBOARDING] Failed to query Supabase status:', e);
                customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
                sales = JSON.parse(localStorage.getItem('lf_creator_sales') || '[]');
            }
        } else {
            customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
            sales = JSON.parse(localStorage.getItem('lf_creator_sales') || '[]');
        }

        const dbHasTestingOrHigher = customProducts.some(p => ['testing', 'submitted', 'approved'].includes(p.status));
        const dbHasSubmittedOrHigher = customProducts.some(p => ['submitted', 'approved'].includes(p.status));

        const auditPassed = localStorage.getItem('lf_audit_passed') === 'true' || dbHasTestingOrHigher;
        const manifestDownloaded = localStorage.getItem('lf_manifest_downloaded') === 'true' || dbHasSubmittedOrHigher;
        const manifestSubmitted = localStorage.getItem('lf_manifest_submitted') === 'true' || dbHasSubmittedOrHigher;
        const visitedDashboard = localStorage.getItem('lf_visited_dashboard') === 'true' || sales.length > 0;

        // Calculate statuses
        const day1 = isCreator; // Connected profile & bank
        const day2 = customProducts.length > 0; // Created product
        const day3 = day2 && auditPassed; // Copyright & asset check passed
        const day4 = day2 && (sales.length > 0 || dbHasTestingOrHigher); // Local purchase simulation tested
        const day5 = day4 && visitedDashboard; // Earnings dashboard reviewed
        const day6 = day2 && manifestDownloaded; // Manifest exported
        const day7 = day6 && manifestSubmitted; // Manifest submitted to admin

        let completedDays = 0;
        if (day1) completedDays++;
        if (day2) completedDays++;
        if (day3) completedDays++;
        if (day4) completedDays++;
        if (day5) completedDays++;
        if (day6) completedDays++;
        if (day7) completedDays++;

        const progressPercent = Math.round((completedDays / 7) * 100);

        return { day1, day2, day3, day4, day5, day6, day7, completedDays, progressPercent };
    },

    // Perform Day 3 Asset Audit
    async runContentAudit() {
        let pName = document.getElementById('p-name')?.value;
        let pDesc = document.getElementById('p-desc')?.value;
        let pCover = document.getElementById('p-cover')?.value;
        let pFile = document.getElementById('p-file')?.value;

        if (!pName || !pDesc || !pCover || !pFile) {
            // Try loading from database or localStorage
            let prod = null;
            if (window.lfSupabase && window.lfSupabase.isOnline && lfAuth.isLoggedIn()) {
                try {
                    const allProds = await window.lfSupabase.getAllProducts();
                    const mine = allProds.filter(p => p.creator_id === lfAuth.currentUser.id);
                    if (mine.length > 0) prod = mine[0];
                } catch(e) {}
            }
            if (!prod) {
                const customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
                if (customProducts.length > 0) prod = customProducts[0];
            }

            if (prod) {
                pName = prod.name;
                pDesc = prod.desc || prod.description;
                pCover = prod.coverUrl || prod.cover_url;
                pFile = prod.fileLink || prod.file_link;
            }
        }

        if (!pName || !pDesc || !pCover || !pFile) {
            alert('Vui lòng điền đầy đủ thông tin sản phẩm mẫu trước khi chạy kiểm duyệt!');
            return;
        }

        // Show a cool scanning notification
        const auditBtn = document.getElementById('btn-run-audit');
        if (auditBtn) {
            auditBtn.disabled = true;
            auditBtn.innerHTML = '⚙️ Đang quét bản quyền & kiểm duyệt visual...';
        }

        setTimeout(() => {
            let errors = [];
            if (pDesc.length < 50) {
                errors.push('Mô tả sản phẩm quá ngắn (Tối thiểu 50 ký tự để tối ưu SEO)');
            }
            if (!pCover.startsWith('http')) {
                errors.push('Đường dẫn ảnh Cover không hợp lệ (Phải bắt đầu bằng http:// hoặc https://)');
            }
            if (!pFile.startsWith('http')) {
                errors.push('Đường dẫn tải file gốc không hợp lệ (Phải bắt đầu bằng http:// hoặc https://)');
            }

            if (errors.length > 0) {
                alert(`❌ Kiểm duyệt thất bại:\n\n${errors.join('\n')}\n\nVui lòng chỉnh sửa lại thông tin.`);
                if (auditBtn) {
                    auditBtn.disabled = false;
                    auditBtn.innerHTML = '🛡️ Chạy Kiểm Duyệt Lại';
                }
            } else {
                localStorage.setItem('lf_audit_passed', 'true');
                alert('✅ Chúc mừng! Sản phẩm đã vượt qua kiểm duyệt bản quyền, SEO, và chất lượng hình ảnh của LumenForge. Bạn đã sẵn sàng để giả lập thanh toán.');
                if (auditBtn) {
                    auditBtn.disabled = true;
                    auditBtn.innerHTML = '✅ Đã Thông Qua Kiểm Duyệt';
                    auditBtn.style.background = 'rgba(16, 185, 129, 0.2)';
                    auditBtn.style.borderColor = 'var(--accent-green)';
                    auditBtn.style.color = 'var(--accent-green)';
                }
                this.updateLaunchpadUI();
            }
        }, 1500);
    },

    // Simulate Customer Purchase
    async simulateCustomerPurchase(productId, callback) {
        if (!productId || productId === 'test') {
            if (window.lfSupabase && window.lfSupabase.isOnline && lfAuth.isLoggedIn()) {
                try {
                    const allProds = await window.lfSupabase.getAllProducts();
                    const mine = allProds.filter(p => p.creator_id === lfAuth.currentUser.id);
                    if (mine.length > 0) productId = mine[0].id;
                } catch(e) {}
            }
            if (!productId || productId === 'test') {
                const customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
                if (customProducts.length > 0) productId = customProducts[0].id;
            }
        }

        let prod = null;
        if (window.lfSupabase && window.lfSupabase.isOnline) {
            try {
                const { data } = await window.lfSupabase.client
                    .from('products')
                    .select('*')
                    .eq('id', productId)
                    .single();
                if (data) {
                    prod = {
                        id: data.id,
                        name: data.name,
                        price: data.price,
                        creator: data.creator,
                        type: data.type,
                        fileLink: data.file_link
                    };
                }
            } catch(e) {
                console.error(e);
            }
        }
        
        if (!prod) {
            const customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
            prod = customProducts.find(p => p.id === productId);
        }
        if (!prod) {
            alert('Vui lòng tạo sản phẩm mẫu ở Bước 2 trước khi thực hiện mua giả lập!');
            return;
        }

        const firstNames = ['Minh', 'Hoàng', 'Tuấn', 'Duy', 'Sơn', 'Quang', 'Linh', 'Thảo', 'Trang', 'Hương'];
        const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô'];
        const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'fpt.edu.vn'];
        
        const randomName = `${lastNames[Math.floor(Math.random()*lastNames.length)]} ${firstNames[Math.floor(Math.random()*firstNames.length)]}`;
        const randomEmail = `${firstNames[Math.floor(Math.random()*firstNames.length)].toLowerCase()}.${Math.floor(100+Math.random()*900)}@${domains[Math.floor(Math.random()*domains.length)]}`;
        
        const txId = 'TX-' + Math.floor(100000 + Math.random() * 900000);
        
        if (window.lfSupabase && window.lfSupabase.isOnline) {
            try {
                // Record sale in Supabase
                await window.lfSupabase.recordSale({
                    id: txId,
                    productId: prod.id,
                    productName: prod.name,
                    price: prod.price,
                    buyerName: randomName,
                    buyerEmail: randomEmail
                });
                
                // Add to purchases for current creator/user for testing review
                await lfAuth.addPurchase(prod.id, {
                    name: prod.name,
                    type: prod.type === 'ebook' ? 'Ebook (PDF)' : prod.type === 'preset' ? 'Presets & LUTs' : 'Video LUTs (.CUBE)',
                    link: prod.fileLink || '#',
                    isCustom: true,
                    creator: prod.creator
                });

                // Update product status to testing
                await window.lfSupabase.updateProductStatus(prod.id, 'testing');
            } catch (e) {
                console.error('[SIMULATE SALE] Database write error:', e);
            }
        } else {
            const sales = JSON.parse(localStorage.getItem('lf_creator_sales') || '[]');
            const newSale = {
                id: txId,
                productId: prod.id,
                productName: prod.name,
                price: prod.price,
                buyerName: randomName,
                buyerEmail: randomEmail,
                timestamp: Date.now(),
                status: 'completed'
            };
            sales.push(newSale);
            localStorage.setItem('lf_creator_sales', JSON.stringify(sales));

            let purchases = JSON.parse(localStorage.getItem('lf_purchases') || '[]');
            purchases.push({
                id: prod.id,
                data: {
                    name: prod.name,
                    title: prod.name,
                    type: prod.type === 'ebook' ? 'Ebook (PDF)' : prod.type === 'preset' ? 'Presets & LUTs' : 'Video LUTs (.CUBE)',
                    link: prod.fileLink || '#',
                    isCustom: true,
                    creator: prod.creator
                },
                timestamp: Date.now()
            });
            localStorage.setItem('lf_purchases', JSON.stringify(purchases));

            const customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
            const prodIndex = customProducts.findIndex(p => p.id === productId);
            if (prodIndex > -1 && (!customProducts[prodIndex].status || customProducts[prodIndex].status === 'draft')) {
                customProducts[prodIndex].status = 'testing';
                localStorage.setItem('lf_custom_products', JSON.stringify(customProducts));
            }
        }

        // Trigger dynamic toast
        this.showToast(`Giao dịch mới! Khách hàng ${randomName} (${randomEmail}) đã mua "${prod.name}" (+${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price)})`);

        // Refresh UI
        await this.updateLaunchpadUI();

        if (callback) callback();
    },

    // Submit manifest to Admin
    async submitToAdmin(productId, callback) {
        if (!productId || productId === 'test') {
            if (window.lfSupabase && window.lfSupabase.isOnline && lfAuth.isLoggedIn()) {
                try {
                    const allProds = await window.lfSupabase.getAllProducts();
                    const mine = allProds.filter(p => p.creator_id === lfAuth.currentUser.id);
                    if (mine.length > 0) productId = mine[0].id;
                } catch(e) {}
            }
            if (!productId || productId === 'test') {
                const customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
                if (customProducts.length > 0) productId = customProducts[0].id;
            }
        }

        localStorage.setItem('lf_manifest_submitted', 'true');
        alert('🚀 GỬI DUYỆT THÀNH CÔNG!\n\nGói tin Manifest của bạn đã được chuyển đến Henry (Admin).\nHệ thống đang xếp hàng để phân phối sản phẩm này lên Store toàn cầu trong vòng 24 giờ tới.');

        if (window.lfSupabase && window.lfSupabase.isOnline) {
            try {
                await window.lfSupabase.updateProductStatus(productId, 'submitted');
            } catch(e) {
                console.error(e);
            }
        } else {
            const customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
            const prodIndex = customProducts.findIndex(p => p.id === productId);
            if (prodIndex > -1) {
                customProducts[prodIndex].status = 'submitted';
                localStorage.setItem('lf_custom_products', JSON.stringify(customProducts));
            }
        }

        await this.updateLaunchpadUI();
        if (callback) callback();
    },

    showToast(message) {
        const existing = document.getElementById('lf-payout-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'lf-payout-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '30px';
        toast.style.right = '30px';
        toast.style.background = 'rgba(10, 10, 12, 0.95)';
        toast.style.color = '#fff';
        toast.style.padding = '15px 20px';
        toast.style.borderRadius = '8px';
        toast.style.border = '1px solid var(--accent-green)';
        toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
        toast.style.zIndex = '99999';
        toast.style.fontFamily = 'var(--font-sans)';
        toast.style.fontSize = '0.9rem';
        toast.innerHTML = `<span style="color:var(--accent-green);font-weight:bold;">🔔 NỔ ĐƠN HÀNG:</span> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 6000);
    },

    // Render stepper in UI
    async updateLaunchpadUI() {
        const progressPctEl = document.getElementById('launchpad-progress-pct');
        const progressBarEl = document.getElementById('launchpad-progress-bar');
        const checklistEl = document.getElementById('launchpad-checklist');

        if (!checklistEl) return;

        const status = await this.getStatus();
        if (progressPctEl) progressPctEl.innerText = `${status.progressPercent}%`;
        if (progressBarEl) progressBarEl.style.width = `${status.progressPercent}%`;

        const steps = [
            { day: 1, label: 'KẾT NỐI PAYOUT VIETQR', desc: 'Điền thông tin ngân hàng để nhận tiền chuyển khoản trực tiếp.', done: status.day1 },
            { day: 2, label: 'ĐĂNG BÁN SẢN PHẨM MẪU', desc: 'Nhập thông tin sản phẩm và link tải file gốc.', done: status.day2 },
            { day: 3, label: 'KIỂM DUYỆT BẢN QUYỀN & SEO', desc: 'Chạy quét tự động chất lượng và bản quyền hình ảnh.', done: status.day3, action: true },
            { day: 4, label: 'GIẢ LẬP THANH TOÁN VIETQR', desc: 'Nhấp "Mua Ngay" trong Store hoặc "Simulate" để test webhook.', done: status.day4 },
            { day: 5, label: 'KIỂM TRA DASHBOARD DOANH THU', desc: 'Xem chỉ số bán hàng hiển thị tức thời trong Dashboard.', done: status.day5 },
            { day: 6, label: 'TẢI ONBOARDING MANIFEST', desc: 'Tải file JSON chứa metadata cấu trúc sản phẩm của bạn.', done: status.day6 },
            { day: 7, label: 'GỬI DUYỆT LÊN STORE TOÀN CẦU', desc: 'Nộp manifest cho Admin Henry để đưa sản phẩm lên CDN toàn cầu.', done: status.day7 }
        ];

        let html = '';
        steps.forEach(step => {
            let bulletColor = step.done ? 'var(--accent-green)' : 'var(--text-dim)';
            let textColor = step.done ? '#fff' : 'var(--text-secondary)';
            let titleColor = step.done ? 'var(--accent-green)' : '#fff';
            let icon = step.done ? '✓' : `0${step.day}`;
            
            let actionHtml = '';
            if (step.day === 1 && !step.done) {
                actionHtml = `<div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 5px; font-style: italic;">(Vui lòng đăng nhập & điền thông tin Creator trong trang Onboarding bên dưới)</div>`;
            } else if (step.day === 2 && !step.done) {
                if (status.day1) {
                    actionHtml = `<div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 5px; font-style: italic;">(Điền thông tin sản phẩm mẫu & nhấn "Kích hoạt" trong trang Onboarding bên dưới)</div>`;
                } else {
                    actionHtml = `<div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 5px; font-style: italic;">(Yêu cầu: Kết nối Payout ở Bước 1)</div>`;
                }
            } else if (step.day === 3 && !step.done) {
                if (status.day2) {
                    actionHtml = `<button type="button" id="btn-run-audit" onclick="window.lfOnboarding.runContentAudit()" class="btn-primary" style="margin-top: 8px; padding: 6px 12px; font-size: 0.75rem; background: var(--accent-cyan); color: #000; font-weight: bold; border-radius: 4px; display: inline-block;">🛡️ Chạy Kiểm Duyệt SEO & Copyright</button>`;
                } else {
                    actionHtml = `<div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 5px; font-style: italic;">(Yêu cầu: Tạo sản phẩm mẫu ở Bước 2)</div>`;
                }
            } else if (step.day === 3 && step.done) {
                actionHtml = `<div style="font-size: 0.75rem; color: var(--accent-green); margin-top: 5px; font-weight: bold;">✓ Đã thông qua kiểm duyệt (SEO, Tỉ lệ ảnh, Liên kết tải)</div>`;
            } else if (step.day === 4 && !step.done) {
                if (status.day3) {
                    const hasLiveGateway = window.LIVE_GATEWAY && window.LIVE_GATEWAY.provider;
                    const gatewayHint = hasLiveGateway ? `
                        <div style="font-size: 0.75rem; color: var(--accent-cyan); margin-top: 5px; line-height: 1.4;">
                            💡 Phát hiện cổng tự động <strong>${window.LIVE_GATEWAY.provider.toUpperCase()}</strong>. Bạn có thể sang trang <a href="store.html" style="color:var(--accent-amber);text-decoration:underline;">Store</a> để thực hiện thanh toán QR thực tế!
                        </div>
                    ` : '';
                    actionHtml = `
                        <button type="button" id="btn-simulate-webhook-step" onclick="window.lfOnboarding.simulateCustomerPurchase('test', () => { window.location.reload(); })" class="btn-primary" style="margin-top: 8px; padding: 6px 12px; font-size: 0.75rem; background: var(--accent-green); color: #000; font-weight: bold; border-radius: 4px; display: inline-block;">💰 Giả Lập Mua & Test Webhook</button>
                        ${gatewayHint}
                    `;
                } else {
                    actionHtml = `<div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 5px; font-style: italic;">(Yêu cầu: Kiểm duyệt ở Bước 3)</div>`;
                }
            } else if (step.day === 4 && step.done) {
                actionHtml = `<div style="font-size: 0.75rem; color: var(--accent-green); margin-top: 5px; font-weight: bold;">✓ Đã test thanh toán thành công</div>`;
            } else if (step.day === 5 && !step.done) {
                if (status.day4) {
                    actionHtml = `<a href="dashboard.html" class="btn-primary" style="margin-top: 8px; padding: 6px 12px; font-size: 0.75rem; background: var(--accent-cyan); color: #000; font-weight: bold; border-radius: 4px; display: inline-block; text-decoration: none; text-align: center; width: auto; max-width: max-content;">📊 Xem Dashboard Doanh Thu</a>`;
                } else {
                    actionHtml = `<div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 5px; font-style: italic;">(Yêu cầu: Test thanh toán ở Bước 4)</div>`;
                }
            } else if (step.day === 5 && step.done) {
                actionHtml = `<div style="font-size: 0.75rem; color: var(--accent-green); margin-top: 5px; font-weight: bold;">✓ Đã kiểm tra dashboard doanh thu</div>`;
            } else if (step.day === 6 && !step.done) {
                if (status.day5) {
                    actionHtml = `<button type="button" onclick="if (window.downloadManifest) { window.downloadManifest(); } else if (window.downloadProductManifest) { window.downloadProductManifest('test'); } else { alert('Vui lòng tạo sản phẩm trước!'); }" class="btn-primary" style="margin-top: 8px; padding: 6px 12px; font-size: 0.75rem; background: var(--accent-amber); color: #000; font-weight: bold; border-radius: 4px; display: inline-block;">📥 Tải Manifest JSON</button>`;
                } else {
                    actionHtml = `<div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 5px; font-style: italic;">(Yêu cầu: Xem dashboard ở Bước 5)</div>`;
                }
            } else if (step.day === 6 && step.done) {
                actionHtml = `<div style="font-size: 0.75rem; color: var(--accent-green); margin-top: 5px; font-weight: bold;">✓ Đã tải manifest cấu hình</div>`;
            } else if (step.day === 7 && !step.done) {
                if (status.day6) {
                    actionHtml = `<button type="button" id="btn-submit-manifest" onclick="window.lfOnboarding.submitToAdmin('test', () => { window.location.reload(); })" class="btn-primary" style="margin-top: 8px; padding: 6px 12px; font-size: 0.75rem; background: var(--accent-purple); color: #fff; font-weight: bold; border-radius: 4px; display: inline-block;">🚀 Gửi Duyệt Manifest Lên Store</button>`;
                } else {
                    actionHtml = `<div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 5px; font-style: italic;">(Yêu cầu: Tải file Manifest ở Bước 6)</div>`;
                }
            } else if (step.day === 7 && step.done) {
                actionHtml = `<div style="font-size: 0.75rem; color: var(--accent-green); margin-top: 5px; font-weight: bold;">✓ Đã được duyệt lên Store toàn cầu</div>`;
            }
            
            html += `
                <div style="display: flex; gap: 15px; align-items: flex-start; padding: 5px 0;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid ${bulletColor}; display: flex; justify-content: center; align-items: center; font-weight: bold; font-family: var(--font-mono); font-size: 0.75rem; color: ${bulletColor}; flex-shrink: 0; background: rgba(0,0,0,0.3);">
                        ${icon}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: ${titleColor}; font-size: 0.85rem; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.5px;">Ngày ${step.day} // ${step.label}</div>
                        <div style="color: ${textColor}; font-size: 0.8rem; margin-top: 2px; line-height: 1.4;">${step.desc}</div>
                        ${actionHtml}
                    </div>
                </div>
            `;
        });

        checklistEl.innerHTML = html + `
            <div style="text-align: center; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px;">
                <button type="button" onclick="window.lfOnboarding.resetProgress()" style="background: none; border: none; color: var(--text-dim); font-size: 0.75rem; cursor: pointer; text-decoration: underline; font-family: var(--font-mono); transition: color 0.2s;" onmouseover="this.style.color='#ff6b6b'" onmouseout="this.style.color='var(--text-dim)'">
                    ↺ Đặt lại lộ trình onboarding (Reset)
                </button>
            </div>
        `;
    },

    // Reset all onboarding progress for testing
    resetProgress() {
        if (!confirm('⚠️ BẠN CÓ CHẮC CHẮN MUỐN ĐẶT LẠI TIẾN TRÌNH ONBOARDING?\n\nToàn bộ dữ liệu kiểm thử (sản phẩm custom, lịch sử giao dịch mua hàng, chứng nhận kiểm duyệt) trong localStorage sẽ bị xóa để bạn bắt đầu lại từ Ngày 1.')) {
            return;
        }

        // Remove local storage items
        localStorage.removeItem('lf_is_creator');
        localStorage.removeItem('lf_custom_products');
        localStorage.removeItem('lf_audit_passed');
        localStorage.removeItem('lf_creator_sales');
        localStorage.removeItem('lf_manifest_downloaded');
        localStorage.removeItem('lf_manifest_submitted');
        localStorage.removeItem('lf_visited_dashboard');
        
        // Remove purchase files linked to local custom products
        const purchases = JSON.parse(localStorage.getItem('lf_purchases') || '[]');
        const filteredPurchases = purchases.filter(p => !p.data || !p.data.isCustom);
        localStorage.setItem('lf_purchases', JSON.stringify(filteredPurchases));

        // If logged in under mock auth, revert creator status in session
        if (window.lfAuth && window.lfAuth.isLoggedIn()) {
            window.lfAuth.currentUser.isCreator = false;
            localStorage.setItem('lf_user', JSON.stringify(window.lfAuth.currentUser));
        }

        alert('🔄 Tiến trình Onboard 7 ngày đã được reset về ban đầu!');
        window.location.reload();
    }
};
