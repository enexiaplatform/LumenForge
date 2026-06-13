/**
 * LUMENFORGE CUSTOM STORE RENDERING
 * Dynamically loads creator products from localStorage and renders them in store.html
 */

document.addEventListener('DOMContentLoaded', () => {
    const customProducts = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
    
    if (customProducts.length === 0) return;

    const ebooksGrid = document.getElementById('ebooks-grid');
    const presetsGrid = document.getElementById('presets-grid');

    if (!ebooksGrid || !presetsGrid) {
        console.error('Store grids not found. Make sure store.html is updated with IDs.');
        return;
    }

    customProducts.forEach(prod => {
        const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price);
        const formattedOriginal = prod.originalPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.originalPrice) : '';
        const priceHTML = formattedOriginal ? `<span>${formattedOriginal}</span> ${formattedPrice}` : formattedPrice;

        const tagMap = {
            'ebook': 'Creator Ebook (PDF)',
            'preset': 'Creator Lightroom Presets',
            'lut': 'Creator Video LUTs (.CUBE)'
        };
        const tag = tagMap[prod.type] || 'Creator Asset';

        const status = prod.status || 'draft';
        const isApproved = status === 'approved';
        const testModeHTML = !isApproved ? `<span style="position: absolute; bottom: 10px; left: 10px; background: rgba(245, 158, 11, 0.9); color: #000; padding: 3px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: bold; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.5px; border: 1px solid rgba(0,0,0,0.2);">TEST MODE</span>` : '';

        const productCard = document.createElement('div');
        productCard.className = 'product-card reveal active'; // Force active since scroll observer might run already
        productCard.style.borderColor = isApproved ? 'var(--accent-green)' : 'var(--accent-cyan)';
        productCard.innerHTML = `
            <div style="position: relative;">
                <img loading="lazy" src="${prod.coverUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop'}" alt="${prod.name}" class="product-img">
                <span style="position: absolute; top: 10px; right: 10px; background: ${isApproved ? 'var(--accent-green)' : 'var(--accent-cyan)'}; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Creator</span>
                ${testModeHTML}
            </div>
            <div class="product-info">
                <span class="product-tag" style="color: ${isApproved ? 'var(--accent-green)' : 'var(--accent-cyan)'};">${tag}</span>
                <h3 class="product-title">${prod.name}</h3>
                <p class="product-desc">${prod.desc}</p>
                <div style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 15px; font-family: var(--font-mono);">Đăng bởi: ${prod.creator}</div>
                <div class="product-footer">
                    <div class="product-price">${priceHTML}</div>
                    <a href="#" class="btn-buy" style="background: ${isApproved ? 'var(--accent-green)' : 'var(--accent-cyan)'}; color: #000;" onclick="openCheckoutModal('${prod.id}', ${prod.price}); return false;">Mua Ngay</a>
                </div>
            </div>
        `;

        if (prod.type === 'ebook') {
            ebooksGrid.appendChild(productCard);
        } else {
            presetsGrid.appendChild(productCard);
        }
    });
});
