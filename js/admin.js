/**
 * LUMENFORGE — Admin Console JavaScript Engine
 * Handles management, approval queues, manual bank transfer confirmations,
 * configurations and metrics.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lfAuth === 'undefined') {
        console.error('Auth system not found');
        return;
    }

    if (!lfAuth.isLoggedIn()) {
        window.location.replace('index.html');
        return;
    }

    initAdminPanel();
});

document.addEventListener('supabaseReady', () => {
    initAdminPanel();
});

let isPanelInitialized = false;
async function initAdminPanel() {
    if (!lfAuth.isLoggedIn() || !lfAuth.isAdmin()) {
        window.location.replace('index.html');
        return;
    }

    if (isPanelInitialized) {
        await loadAdminData();
        return;
    }

    isPanelInitialized = true;
    initAdminConfigUI();
    await loadAdminData();
}

// -- 1. Platform Settings Configuration UI --
function initAdminConfigUI() {
    const chkMarketplace = document.getElementById('config-allow-marketplace');
    const chkDevMode = document.getElementById('config-dev-mode');

    const adminConfig = window.LUMENFORGE_ADMIN_CONFIG || { allowCreatorMarketplace: false, devModeAllowed: true };

    if (chkMarketplace) chkMarketplace.checked = adminConfig.allowCreatorMarketplace;
    if (chkDevMode) chkDevMode.checked = adminConfig.devModeAllowed;
}

window.toggleConfig = function(key, value) {
    if (key === 'allowCreatorMarketplace') {
        localStorage.setItem('lf_allow_creator_marketplace', value ? 'true' : 'false');
        if (window.LUMENFORGE_ADMIN_CONFIG) window.LUMENFORGE_ADMIN_CONFIG.allowCreatorMarketplace = value;
        alert(`🔔 Cập nhật Marketplace:\n\nTrạng thái Community Store đã được chuyển thành ${value ? 'MỞ' : 'ĐÓNG'}.`);
    } else if (key === 'devModeAllowed') {
        localStorage.setItem('lf_dev_mode_allowed', value ? 'true' : 'false');
        if (window.LUMENFORGE_ADMIN_CONFIG) window.LUMENFORGE_ADMIN_CONFIG.devModeAllowed = value;
        alert(`🛠️ Sandbox Config:\n\nDev Sandbox / Quick Payment Button đã được chuyển thành ${value ? 'BẬT' : 'TẮT'}.`);
    }
};

// -- 2. Main Data Loading & Syncing --
async function loadAdminData() {
    const isOnline = window.lfSupabase && window.lfSupabase.isOnline;

    let products = [];
    let pendingPayments = [];
    let creators = [];
    let sales = [];

    if (isOnline) {
        try {
            // 2.1 Fetch Online Data from Supabase
            const client = window.lfSupabase.client;

            // Fetch products
            const { data: dbProducts, error: errProds } = await client
                .from('products')
                .select('*');
            if (!errProds && dbProducts) products = dbProducts;

            // Fetch pending payments
            const { data: dbPending, error: errPending } = await client
                .from('pending_orders')
                .select('*')
                .eq('status', 'pending');
            if (!errPending && dbPending) pendingPayments = dbPending;

            // Fetch profiles (creators)
            const { data: dbProfiles, error: errProfiles } = await client
                .from('profiles')
                .select('*');
            if (!errProfiles && dbProfiles) {
                // Anyone with is_creator or whose email is in products is a creator
                creators = dbProfiles.filter(p => p.is_creator || products.some(pr => pr.creator_id === p.id));
            }

            // Fetch all sales logs
            const { data: dbSales, error: errSales } = await client
                .from('sales')
                .select('*');
            if (!errSales && dbSales) sales = dbSales;

        } catch (err) {
            console.error('[ADMIN] Error loading online data from Supabase:', err);
            alert('⚠️ Lỗi kết nối Supabase. Hệ thống tự động chuyển sang chế độ Mô Phỏng Offline (Local Mock).');
            loadOfflineMockData(products, pendingPayments, creators, sales);
        }
    } else {
        // 2.2 Load Offline Mock Data from LocalStorage
        loadOfflineMockData(products, pendingPayments, creators, sales);
    }

    // 3. Render Dashboard Elements
    renderMetrics(products, pendingPayments, creators, sales);
    renderPendingPayments(pendingPayments);
    renderSubmittedProducts(products);
    renderCreators(creators, products, sales);
}

function loadOfflineMockData(productsOut, pendingPaymentsOut, creatorsOut, salesOut) {
    // Products
    const customList = localStorage.getItem('lf_custom_products');
    const localProducts = customList ? JSON.parse(customList) : [];
    localProducts.forEach(p => productsOut.push(p));

    // For demonstration, if no local products exist, load a sample
    if (productsOut.length === 0) {
        productsOut.push({
            id: 'sample-preset-glow',
            name: 'Cyberpunk Neon Lightroom Presets',
            creator: 'Henry Tran',
            creatorEmail: 'henry@lumenforge.studio',
            bankName: 'MSB',
            bankAccount: '04201013810536',
            bankOwner: 'NGUYEN THE ANH',
            momoNumber: '0708450246',
            type: 'preset',
            price: 79000,
            originalPrice: 150000,
            desc: 'Gói màu neon cyberpunk ban đêm rực rỡ.',
            coverUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7',
            fileLink: '#',
            status: 'submitted',
            creator_id: 'mock-henry-id'
        });
    }

    // Pending payments from lf_purchases (status: 'pending')
    const purchasesList = localStorage.getItem('lf_purchases');
    const localPurchases = purchasesList ? JSON.parse(purchasesList) : [];
    
    // Check if there is any pending purchase in local storage
    localPurchases.forEach(p => {
        if (p.status === 'pending') {
            pendingPaymentsOut.push({
                order_code: Number(String(p.timestamp).slice(-9)),
                user_id: 'current-user-id',
                product_id: p.id,
                product_name: p.data?.name || p.id,
                product_type: p.data?.type || 'Tài liệu',
                product_link: p.data?.link || '#',
                price: p.data?.price || 0,
                status: 'pending',
                buyer_name: lfAuth.currentUser?.name || 'Guest User',
                buyer_email: lfAuth.currentUser?.email || 'guest@lumenforge.studio'
            });
        }
    });

    // Mock pending payment if queue is empty for visualization
    if (pendingPaymentsOut.length === 0) {
        pendingPaymentsOut.push({
            order_code: 102948201,
            user_id: 'mock-buyer-id',
            product_id: 'starter-kit-pro',
            product_name: 'LumenForge Starter Kit (Pro Edition)',
            product_type: 'Presets & Guides (ZIP)',
            product_link: 'downloads/lumenforge-starter-kit-pro.zip',
            price: 99000,
            status: 'pending',
            buyer_name: 'Khánh Linh',
            buyer_email: 'linhkhanh@gmail.com'
        });
    }

    // Creators list
    const currentIsCreator = localStorage.getItem('lf_is_creator') === 'true' || lfAuth.currentUser?.isCreator;
    
    creatorsOut.push({
        id: lfAuth.currentUser?.id || 'current-user-id',
        name: lfAuth.currentUser?.name || 'Cameron Webb',
        email: lfAuth.currentUser?.email || 'cameron@lumenforge.studio',
        avatar: lfAuth.currentUser?.avatar || 'C',
        is_creator: currentIsCreator,
        xp: Number(localStorage.getItem('lf_xp') || '280'),
        rank: localStorage.getItem('lf_quiz_title') || 'Advanced Shooter',
        bank_name: 'VPBank',
        bank_account: '1908200388910',
        bank_owner: lfAuth.currentUser?.name?.toUpperCase() || 'CAMERON WEBB',
        momo_number: '0988776655',
        type: 'local'
    });

    // Add extra cool mock creators for realistic design
    creatorsOut.push({
        id: 'mock-henry-id',
        name: 'Henry Tran',
        email: 'henry@lumenforge.studio',
        avatar: 'H',
        is_creator: true,
        xp: 1500,
        rank: 'Director of Photography',
        bank_name: 'MSB',
        bank_account: '04201013810536',
        bank_owner: 'NGUYEN THE ANH',
        momo_number: '0708450246',
        type: 'system'
    });

    // Sales logs
    const salesList = localStorage.getItem('lf_creator_sales');
    const localSales = salesList ? JSON.parse(salesList) : [];
    localSales.forEach(s => salesOut.push(s));
}

// -- 3. Render Metric Cards --
function renderMetrics(products, pendingPayments, creators, sales) {
    const pendingProductsCount = products.filter(p => p.status === 'submitted').length;
    const pendingPaymentsCount = pendingPayments.length;
    const creatorsCount = creators.filter(c => c.is_creator).length;

    // Calculate total platform revenue
    let totalRevenue = 0;
    // Sum from sales table
    sales.forEach(s => {
        totalRevenue += Number(s.price || 0);
    });
    // Sum from approved purchases of core products (simulated if no sales table row)
    if (sales.length === 0) {
        totalRevenue = 99000 * 3; // Mock sales
    }

    document.getElementById('metric-pending-products').innerText = pendingProductsCount;
    document.getElementById('metric-pending-payments').innerText = pendingPaymentsCount;
    document.getElementById('metric-creators').innerText = creatorsCount;
    document.getElementById('metric-revenue').innerText = totalRevenue.toLocaleString('vi-VN') + 'đ';

    document.getElementById('pending-pay-badge').innerText = `${pendingPaymentsCount} Đang chờ`;
    document.getElementById('pending-prod-badge').innerText = `${pendingProductsCount} Đang chờ`;
    document.getElementById('total-creators-badge').innerText = `${creatorsCount} Creators`;
}

// -- 4. Render Pending Payments Table --
function renderPendingPayments(payments) {
    const tbody = document.querySelector('#table-pending-payments tbody');
    if (!tbody) return;

    if (payments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; font-style: italic; color: var(--text-dim); padding: 25px 0;">
                    🎉 Không có giao dịch VietQR nào đang chờ phê duyệt.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = payments.map(p => `
        <tr>
            <td>
                <div style="font-weight: bold; color: #fff;">${p.buyer_name || 'Khách hàng'}</div>
                <div style="font-size: 0.75rem; color: var(--text-dim); font-family: monospace;">Ref: #${p.order_code}</div>
                <div style="font-size: 0.75rem; color: var(--accent-amber);">${p.buyer_email || 'n/a'}</div>
            </td>
            <td>
                <div style="font-weight: 500;">${p.product_name}</div>
                <span class="badge badge-purple" style="font-size: 0.65rem;">${p.product_type || 'Preset'}</span>
            </td>
            <td style="font-family: var(--font-mono); font-weight: bold; color: var(--accent-cyan);">
                ${Number(p.price).toLocaleString('vi-VN')}đ
            </td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="action-btn btn-approve" onclick="approvePayment('${p.product_id}', '${p.user_id}', '${p.order_code}')">
                        ✓ Duyệt bill
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// -- 5. Render Submitted Products Table --
function renderSubmittedProducts(products) {
    const tbody = document.querySelector('#table-submitted-products tbody');
    if (!tbody) return;

    // Filter to only those submitted or testing
    const pendingProducts = products.filter(p => ['submitted', 'testing', 'approved'].includes(p.status));

    if (pendingProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; font-style: italic; color: var(--text-dim); padding: 30px 0;">
                    📭 Không có sản phẩm nào đăng ký kiểm duyệt.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pendingProducts.map(p => {
        let statusBadge = '';
        let actionBtn = '';

        if (p.status === 'submitted') {
            statusBadge = `<span class="badge badge-amber">Đang chờ Henry duyệt</span>`;
            actionBtn = `
                <button class="action-btn btn-approve" onclick="approveProduct('${p.id}')">Duyệt CDN</button>
                <button class="action-btn btn-reject" onclick="rejectProduct('${p.id}')">Từ chối</button>
            `;
        } else if (p.status === 'approved') {
            statusBadge = `<span class="badge badge-green">LIVE CDN (Approved)</span>`;
            actionBtn = `<button class="action-btn btn-reject" onclick="rejectProduct('${p.id}')">Hạ bài (Lock)</button>`;
        } else {
            statusBadge = `<span class="badge badge-cyan">Đang test nội bộ</span>`;
            actionBtn = `<button class="action-btn btn-approve" onclick="approveProduct('${p.id}')">Duyệt CDN</button>`;
        }

        const coverSrc = p.coverUrl || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713';
        
        return `
            <tr>
                <td>
                    <img src="${coverSrc}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
                </td>
                <td>
                    <div style="font-weight: bold; color: #fff;">${p.name}</div>
                    <span style="font-size: 0.75rem; font-family: monospace; color: var(--text-dim);">${p.id}</span>
                </td>
                <td>
                    <div style="font-weight: 500;">${p.creator || 'Creator'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">${p.creatorEmail}</div>
                </td>
                <td style="font-family: var(--font-mono); font-weight: bold;">
                    ${Number(p.price).toLocaleString('vi-VN')}đ
                </td>
                <td>${statusBadge}</td>
                <td>
                    <button class="action-btn btn-view" onclick="viewManifestJSON('${p.id}')">
                        👁️ View Manifest
                    </button>
                </td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        ${actionBtn}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// -- 6. Render Onboarded Creators Table --
function renderCreators(creators, products, sales) {
    const tbody = document.querySelector('#table-creators tbody');
    if (!tbody) return;

    if (creators.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; font-style: italic; color: var(--text-dim); padding: 25px 0;">
                    Không tìm thấy Creator nào trên hệ thống.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = creators.map(c => {
        // Count products
        const count = products.filter(p => p.creator_id === c.id || p.creatorEmail === c.email).length;
        
        // Render bank info
        const bankInfo = c.bank_name ? `
            <div style="font-size: 0.8rem; background: rgba(0,0,0,0.15); padding: 5px 10px; border-radius: 4px;">
                🏦 ${c.bank_name} - ${c.bank_account}<br>
                👤 ${c.bank_owner}
            </div>
        ` : `<span style="font-style: italic; color: var(--text-dim); font-size: 0.8rem;">Chưa liên kết tài khoản ngân hàng</span>`;

        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="nav-avatar" style="width:30px; height:30px; font-size: 0.8rem; background: var(--accent-cyan); color: #000; font-weight: bold; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            ${c.avatar || c.name.charAt(0).toUpperCase()}
                        </div>
                        <span style="font-weight: bold; color: #fff;">${c.name}</span>
                    </div>
                </td>
                <td>${c.email}</td>
                <td>
                    <span style="color: var(--accent-amber); font-weight: 500; font-size: 0.85rem;">${c.rank}</span>
                    <div style="font-size: 0.72rem; color: var(--text-dim); font-family: monospace;">${c.xp} XP</div>
                </td>
                <td>${bankInfo}</td>
                <td style="font-family: var(--font-mono); font-weight: bold; text-align: center;">${count}</td>
                <td>
                    <span class="badge ${c.type === 'system' ? 'badge-purple' : 'badge-cyan'}">
                        ${c.type === 'system' ? 'System' : 'Creator Profile'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// -- 7. View Manifest JSON Modal --
window.viewManifestJSON = async function(productId) {
    const isOnline = window.lfSupabase && window.lfSupabase.isOnline;
    let product = null;

    if (isOnline) {
        try {
            const { data } = await window.lfSupabase.client
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();
            product = data;
        } catch(e) {}
    }

    if (!product) {
        const customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
        product = customProducts.find(p => p.id === productId);
    }

    if (!product) {
        alert('Không tìm thấy thông tin sản phẩm.');
        return;
    }

    const manifest = {
        manifest_version: "1.0.0",
        product_id: product.id,
        metadata: {
            name: product.name,
            type: product.type,
            price: Number(product.price),
            description: product.desc || product.description,
            cover_url: product.coverUrl,
            cdn_link: product.fileLink
        },
        distribution: {
            allow_store: true,
            allowed_gateways: ["vietqr", "payos", "stripe"],
            payout_recipient: {
                bank_name: product.bankName || "MSB",
                bank_account: product.bankAccount,
                bank_owner: product.bankOwner,
                momo_number: product.momoNumber
            }
        }
    };

    document.getElementById('manifest-modal-title').innerText = `Manifest: ${product.name}`;
    document.getElementById('manifest-json-code').innerText = JSON.stringify(manifest, null, 2);

    const modal = document.getElementById('manifest-modal');
    if (modal) modal.classList.add('active');
};

window.closeManifestModal = function() {
    const modal = document.getElementById('manifest-modal');
    if (modal) modal.classList.remove('active');
};

// -- 8. Approve Product Manifest --
window.approveProduct = async function(productId) {
    const isOnline = window.lfSupabase && window.lfSupabase.isOnline;

    if (confirm(`Bạn có chắc chắn muốn PHÊ DUYỆT sản phẩm này lên CDN toàn cầu của LumenForge?`)) {
        if (isOnline) {
            try {
                await window.lfSupabase.updateProductStatus(productId, 'approved');
                alert('🚀 DUYỆT MANIFEST THÀNH CÔNG!\n\nSản phẩm hiện đang được kích hoạt phân phối trên CDN và sẵn sàng bán trên Store.');
            } catch(e) {
                console.error(e);
                alert('Lỗi phê duyệt trực tuyến: ' + e.message);
            }
        } else {
            // Update offline
            const customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
            const idx = customProducts.findIndex(p => p.id === productId);
            if (idx > -1) {
                customProducts[idx].status = 'approved';
                localStorage.setItem('lf_custom_products', JSON.stringify(customProducts));
                alert('🚀 DUYỆT MANIFEST THÀNH CÔNG (MÔ PHỎNG)!\n\nSản phẩm đã được chuyển sang trạng thái APPROVED.');
            }
        }
        await loadAdminData();
    }
};

window.rejectProduct = async function(productId) {
    const isOnline = window.lfSupabase && window.lfSupabase.isOnline;

    if (confirm(`Bạn có chắc chắn muốn TỪ CHỐI hoặc HẠ sản phẩm này khỏi CDN?`)) {
        if (isOnline) {
            try {
                await window.lfSupabase.updateProductStatus(productId, 'testing');
                alert('🔒 HẠ SẢN PHẨM THÀNH CÔNG!\n\nSản phẩm đã bị đưa về trạng thái thử nghiệm cục bộ.');
            } catch(e) {
                console.error(e);
                alert('Lỗi: ' + e.message);
            }
        } else {
            const customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
            const idx = customProducts.findIndex(p => p.id === productId);
            if (idx > -1) {
                customProducts[idx].status = 'testing';
                localStorage.setItem('lf_custom_products', JSON.stringify(customProducts));
                alert('🔒 HẠ SẢN PHẨM THÀNH CÔNG (MÔ PHỎNG)!\n\nSản phẩm đã được đưa về trạng thái TESTING.');
            }
        }
        await loadAdminData();
    }
};

// -- 9. Approve Manual Bank Payment --
window.approvePayment = async function(productId, userId, orderCode) {
    const isOnline = window.lfSupabase && window.lfSupabase.isOnline;

    if (confirm(`Xác nhận đã nhận đủ số tiền giao dịch VietQR từ khách hàng?\nHành động này sẽ mở khóa file tải xuống ngay lập tức.`)) {
        if (isOnline) {
            try {
                const client = window.lfSupabase.client;

                // 1. Update pending order to completed
                await client
                    .from('pending_orders')
                    .update({ status: 'completed' })
                    .eq('order_code', orderCode);

                // Fetch pending order detail
                const { data: ord } = await client
                    .from('pending_orders')
                    .select('*')
                    .eq('order_code', orderCode)
                    .single();

                if (ord) {
                    // 2. Insert to purchases
                    await client
                        .from('purchases')
                        .insert({
                            user_id: userId,
                            product_id: productId,
                            product_name: ord.product_name,
                            product_type: ord.product_type,
                            product_link: ord.product_link,
                            price: ord.price
                        });

                    // 3. Record in sales
                    // Get seller_id from product
                    const { data: prod } = await client
                        .from('products')
                        .select('creator_id, creator')
                        .eq('id', productId)
                        .single();

                    const sellerId = prod ? prod.creator_id : userId; // Fallback
                    const sellerName = prod ? prod.creator : 'Creator';

                    // Fetch buyer profile name/email
                    const { data: profile } = await client
                        .from('profiles')
                        .select('name, email')
                        .eq('id', userId)
                        .single();

                    const buyerName = profile ? profile.name : 'Buyer';
                    const buyerEmail = profile ? profile.email : 'buyer@lumenforge.studio';

                    await client
                        .from('sales')
                        .insert({
                            id: `TX-${orderCode}`,
                            product_id: productId,
                            product_name: ord.product_name,
                            price: ord.price,
                            buyer_name: buyerName,
                            buyer_email: buyerEmail,
                            seller_id: sellerId,
                            status: 'completed'
                        });
                }
                
                alert('🎉 DUYỆT GIAO DỊCH THÀNH CÔNG!\n\nĐã mở khóa file download và ghi nhận doanh thu.');
            } catch(e) {
                console.error(e);
                alert('Lỗi phê duyệt thanh toán: ' + e.message);
            }
        } else {
            // Local offline mock approval
            const purchasesList = localStorage.getItem('lf_purchases');
            let purchases = purchasesList ? JSON.parse(purchasesList) : [];
            const idx = purchases.findIndex(p => p.id === productId);
            if (idx > -1) {
                purchases[idx].status = 'purchased';
                localStorage.setItem('lf_purchases', JSON.stringify(purchases));

                // Add simulated sale to local storage sales log
                const salesList = localStorage.getItem('lf_creator_sales');
                let sales = salesList ? JSON.parse(salesList) : [];
                sales.push({
                    id: `TX-${orderCode}`,
                    productId: productId,
                    productName: purchases[idx].data?.name || productId,
                    price: purchases[idx].data?.price || 99000,
                    buyerName: lfAuth.currentUser?.name || 'Cameron Webb',
                    buyerEmail: lfAuth.currentUser?.email || 'cameron@lumenforge.studio',
                    timestamp: Date.now()
                });
                localStorage.setItem('lf_creator_sales', JSON.stringify(sales));

                // Promote product status from draft to testing in local storage
                const customList = localStorage.getItem('lf_custom_products');
                let customProducts = customList ? JSON.parse(customList) : [];
                const prodIdx = customProducts.findIndex(p => p.id === productId);
                if (prodIdx > -1 && (!customProducts[prodIdx].status || customProducts[prodIdx].status === 'draft')) {
                    customProducts[prodIdx].status = 'testing';
                    localStorage.setItem('lf_custom_products', JSON.stringify(customProducts));
                }

                alert('🎉 DUYỆT GIAO DỊCH THÀNH CÔNG (MÔ PHỎNG)!\n\nĐã mở khóa file và ghi nhận doanh thu.');
            }
        }
        await loadAdminData();
    }
};
