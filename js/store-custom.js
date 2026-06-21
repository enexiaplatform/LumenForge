/**
 * LUMENFORGE CUSTOM STORE RENDERING
 * Dynamically loads creator products from Supabase or localStorage fallback and renders them in store.html
 */

document.addEventListener('DOMContentLoaded', () => {
    let hasRendered = false;

    async function initStore() {
        if (hasRendered) return;
        
        let products = [];
        try {
            if (window.lfSupabase && window.lfSupabase.isOnline) {
                products = await window.lfSupabase.getAllProducts();
            } else {
                products = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
            }
        } catch (e) {
            console.error('[STORE] Failed to fetch products:', e);
            products = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
        }

        if (products.length === 0) return;
        
        // Mark as rendered to prevent double runs
        hasRendered = true;

        const ebooksGrid = document.getElementById('ebooks-grid');
        const presetsGrid = document.getElementById('presets-grid');

        if (!ebooksGrid || !presetsGrid) {
            console.error('Store grids not found. Make sure store.html is updated with IDs.');
            return;
        }

        // Clean out any custom cards (cards with 'creator-product' class) if we re-render
        document.querySelectorAll('.creator-product-card').forEach(el => el.remove());

        let hasEbooks = false;
        let hasPresets = false;

        products.forEach(prod => {
            const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price || prod.priceVnd);
            const originalPrice = prod.originalPrice || prod.originalPriceVnd;
            const formattedOriginal = originalPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice) : '';
            const priceHTML = formattedOriginal ? `<span>${formattedOriginal}</span> ${formattedPrice}` : formattedPrice;

            const tagMap = {
                'ebook': 'Creator Ebook (PDF)',
                'preset': 'Creator Presets & LUTs',
                'lut': 'Creator Video LUTs (.CUBE)'
            };
            const type = prod.type || 'preset';
            const tag = tagMap[type] || 'Creator Asset';

            const status = prod.status || 'draft';
            const isApproved = status === 'approved';
            
            // Only show to other users if approved AND the marketplace is explicitly enabled.
            // If unapproved or marketplace is disabled, only show to the creator who uploaded it as a test.
            const currentUserId = lfAuth.currentUser?.id;
            const creatorId = prod.creator_id;
            
            // If Supabase is online, check creator_id. If local storage is offline, check email/author.
            const isOnline = !!(window.lfSupabase && window.lfSupabase.isOnline);
            const isMyProduct = (isOnline && creatorId && currentUserId === creatorId) || 
                                (!isOnline && lfAuth.isLoggedIn() && prod.creatorEmail === lfAuth.currentUser.email);

            const adminConfig = window.LUMENFORGE_ADMIN_CONFIG || { allowCreatorMarketplace: false };
            const isAllowedToRender = isMyProduct || (isApproved && adminConfig.allowCreatorMarketplace);

            if (!isAllowedToRender) {
                // Skip rendering
                return;
            }

            const testModeHTML = !isApproved ? `<span style="position: absolute; bottom: 10px; left: 10px; background: rgba(245, 158, 11, 0.95); color: #000; padding: 3px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: bold; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.5px; border: 1px solid rgba(0,0,0,0.2);">TEST MODE</span>` : '';

            const productCard = document.createElement('div');
            productCard.className = 'product-card creator-product-card reveal active';
            productCard.style.borderColor = isApproved ? 'var(--accent-green, #10b981)' : 'var(--accent-cyan, #00d4aa)';
            productCard.innerHTML = `
                <div style="position: relative;">
                    <img loading="lazy" src="${prod.coverUrl || prod.cover_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop'}" alt="${prod.name}" class="product-img">
                    <span style="position: absolute; top: 10px; right: 10px; background: ${isApproved ? 'var(--accent-green, #10b981)' : 'var(--accent-cyan, #00d4aa)'}; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Creator</span>
                    ${testModeHTML}
                </div>
                <div class="product-info">
                    <span class="product-tag" style="color: ${isApproved ? 'var(--accent-green, #10b981)' : 'var(--accent-cyan, #00d4aa)'};">${tag}</span>
                    <h3 class="product-title">${prod.name}</h3>
                    <p class="product-desc">${prod.desc || prod.description}</p>
                    <div style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 15px; font-family: var(--font-mono);">Đăng bởi: ${prod.creator}</div>
                    <div class="product-footer">
                        <div class="product-price">${priceHTML}</div>
                        <a href="#" class="btn-buy" style="background: ${isApproved ? 'var(--accent-green, #10b981)' : 'var(--accent-cyan, #00d4aa)'}; color: #000;" onclick="openCheckoutModal('${prod.id}', ${prod.price || prod.priceVnd}); return false;">Mua Ngay</a>
                    </div>
                </div>
            `;

            if (type === 'ebook') {
                ebooksGrid.appendChild(productCard);
                hasEbooks = true;
            } else {
                presetsGrid.appendChild(productCard);
                hasPresets = true;
            }
        });

        const ebooksSection = document.getElementById('creator-ebooks-section');
        const presetsSection = document.getElementById('creator-presets-section');
        if (ebooksSection && hasEbooks) ebooksSection.style.display = 'block';
        if (presetsSection && hasPresets) presetsSection.style.display = 'block';
    }

    // Initialize store: try immediately if Supabase is already configured, otherwise wait or set timeout fallback
    if (window.lfSupabase && window.lfSupabase.isOnline) {
        initStore();
    } else {
        document.addEventListener('supabaseReady', initStore);
        setTimeout(initStore, 1200); // 1.2s timeout fallback
    }
});
