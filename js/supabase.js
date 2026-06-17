/**
 * LUMENFORGE — Supabase Database Integration & Sync Engine
 * Handles seamless transition from localStorage to real cloud PostgreSQL database.
 */

class SupabaseIntegration {
    constructor() {
        this.client = null;
        this.isOnline = false;
        this.init();
    }

    async init() {
        const credentials = this.getCredentials();
        if (!credentials.url || !credentials.key) {
            console.log('%c[LUMENFORGE DB] Running in Local Storage Mode (Offline)', 'color: #f59e0b; font-weight: bold;');
            this.injectStatusIndicator(false);
            return;
        }

        try {
            // Load Supabase SDK from CDN if not already loaded
            if (typeof supabase === 'undefined') {
                await this.loadSDK();
            }

            // Create Supabase Client
            this.client = supabase.createClient(credentials.url, credentials.key);
            
            // Test connection
            const { data, error } = await this.client.from('profiles').select('id').limit(1);
            if (error && error.message.includes('Failed to fetch')) {
                throw new Error('Không thể kết nối mạng hoặc sai URL database');
            }

            this.isOnline = true;
            console.log('%c[LUMENFORGE DB] Connected to Supabase Cloud Database (Online)', 'color: #10b981; font-weight: bold;');
            
            // Sync session
            await this.syncSession();
            
            // Override Auth System methods
            this.overrideAuthSystem();
            
            this.injectStatusIndicator(true);
            
            // Dispatch event for other scripts to know Supabase is ready
            document.dispatchEvent(new CustomEvent('supabaseReady'));
        } catch (err) {
            console.error('[LUMENFORGE DB] Connection error:', err);
            this.injectStatusIndicator(false, err.message);
        }
    }

    getCredentials() {
        return {
            url: window.SUPABASE_URL || localStorage.getItem('lf_supabase_url') || '',
            key: window.SUPABASE_KEY || localStorage.getItem('lf_supabase_key') || ''
        };
    }

    setCredentials(url, key) {
        localStorage.setItem('lf_supabase_url', url.trim());
        localStorage.setItem('lf_supabase_key', key.trim());
    }

    clearCredentials() {
        localStorage.removeItem('lf_supabase_url');
        localStorage.removeItem('lf_supabase_key');
    }

    loadSDK() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Supabase SDK from CDN'));
            document.head.appendChild(script);
        });
    }

    async syncSession() {
        const { data: { session } } = await this.client.auth.getSession();
        
        if (session) {
            const user = session.user;
            
            // Fetch profile data
            const { data: profile } = await this.client
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
                
            if (profile) {
                // Update lfAuth in-memory object
                lfAuth.currentUser = {
                    id: user.id,
                    email: user.email,
                    name: profile.name,
                    avatar: profile.avatar || profile.name.charAt(0).toUpperCase(),
                    isCreator: profile.is_creator,
                    xp: profile.xp,
                    rank: profile.rank
                };
                localStorage.setItem('lf_user', JSON.stringify(lfAuth.currentUser));
                localStorage.setItem('lf_is_creator', profile.is_creator ? 'true' : 'false');
            }
        } else {
            // No session
            if (lfAuth.currentUser && lfAuth.currentUser.id) {
                // Clean stale mock session
                lfAuth.currentUser = null;
                localStorage.removeItem('lf_user');
                localStorage.removeItem('lf_is_creator');
            }
        }
    }

    overrideAuthSystem() {
        const self = this;

        // Sync local cache arrays from database
        lfAuth.syncFromDatabase = async function() {
            if (!self.isOnline || !this.currentUser) return;
            const uid = this.currentUser.id;

            try {
                // 1. Sync Bookmarks
                const { data: bookmarks } = await self.client
                    .from('bookmarks')
                    .select('*')
                    .eq('user_id', uid);
                
                if (bookmarks) {
                    this.bookmarks = bookmarks.map(b => ({
                        id: b.article_id,
                        data: { title: b.article_title, link: b.article_link },
                        timestamp: new Date(b.created_at).getTime()
                    }));
                    localStorage.setItem('lf_bookmarks', JSON.stringify(this.bookmarks));
                }

                // 2. Sync Purchases
                const { data: purchases } = await self.client
                    .from('purchases')
                    .select('*')
                    .eq('user_id', uid);

                if (purchases) {
                    this.purchases = purchases.map(p => ({
                        id: p.product_id,
                        data: { name: p.product_name, type: p.product_type, link: p.product_link, price: p.price },
                        timestamp: new Date(p.created_at).getTime()
                    }));
                    localStorage.setItem('lf_purchases', JSON.stringify(this.purchases));
                }

                // 3. Sync Read History
                const { data: readHist } = await self.client
                    .from('read_history')
                    .select('*')
                    .eq('user_id', uid);
                
                if (readHist) {
                    this.readHistory = readHist.map(h => ({
                        id: h.article_id,
                        data: { title: h.article_title, link: h.article_link },
                        timestamp: new Date(h.created_at).getTime()
                    }));
                    localStorage.setItem('lf_read_history', JSON.stringify(this.readHistory));
                }

                // 4. Sync local offline products to Supabase
                const localProds = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
                if (localProds.length > 0) {
                    console.log('[LUMENFORGE DB] Syncing offline products to Supabase...');
                    for (const prod of localProds) {
                        try {
                            prod.creator_id = uid;
                            await self.upsertProduct(prod);
                        } catch (prodErr) {
                            console.error('[LUMENFORGE DB] Failed to sync product:', prod.id, prodErr);
                        }
                    }
                    // Fetch all products from DB to refresh local cache
                    const allProds = await self.getAllProducts();
                    const mine = allProds.filter(p => p.creator_id === uid);
                    localStorage.setItem('lf_custom_products', JSON.stringify(mine));
                }

                // 5. Sync local offline sales to Supabase
                const localSales = JSON.parse(localStorage.getItem('lf_creator_sales') || '[]');
                const unsyncedSales = localSales.filter(s => s.id && s.id.startsWith('TX-') && !s.synced);
                if (unsyncedSales.length > 0) {
                    console.log('[LUMENFORGE DB] Syncing offline sales to Supabase...');
                    for (const sale of unsyncedSales) {
                        try {
                            await self.recordSale({
                                id: sale.id,
                                productId: sale.productId || sale.product_id,
                                productName: sale.productName || sale.product_name,
                                price: sale.price,
                                buyerName: sale.buyerName || sale.buyer_name,
                                buyerEmail: sale.buyerEmail || sale.buyer_email
                            });
                            sale.synced = true;
                        } catch (saleErr) {
                            console.error('[LUMENFORGE DB] Failed to sync sale:', sale.id, saleErr);
                        }
                    }
                    localStorage.setItem('lf_creator_sales', JSON.stringify(localSales));
                }
            } catch (err) {
                console.error('[LUMENFORGE DB] Sync error:', err);
            }
        };

        // Trigger initial sync
        if (lfAuth.isLoggedIn()) {
            lfAuth.syncFromDatabase();
        }

        // --- OVERRIDE: login ---
        lfAuth.login = async function(email, password) {
            try {
                // 1. Try to sign in
                let { data, error } = await self.client.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    // 2. If user doesn't exist, try to sign up (replicating MVP easy account creation)
                    if (error.message.includes('Invalid login credentials') || error.status === 400) {
                        const signUpResult = await self.client.auth.signUp({
                            email: email,
                            password: password,
                            options: {
                                data: {
                                    name: email.split('@')[0]
                                }
                            }
                        });

                        if (signUpResult.error) {
                            return { success: false, error: signUpResult.error.message };
                        }
                        
                        data = signUpResult.data;
                    } else {
                        return { success: false, error: error.message };
                    }
                }

                const user = data.user;
                if (!user) return { success: false, error: 'Không thể tạo tài khoản.' };

                // 3. Get profile (might wait 0.5s for trigger to write table)
                let profile = null;
                for (let i = 0; i < 5; i++) {
                    const { data: prof } = await self.client
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    if (prof) {
                        profile = prof;
                        break;
                    }
                    await new Promise(r => setTimeout(r, 300)); // wait and retry
                }

                if (!profile) {
                    // Backup manual profile creation if DB trigger fails
                    const { data: newProf } = await self.client
                        .from('profiles')
                        .upsert({
                            id: user.id,
                            name: email.split('@')[0],
                            email: email,
                            avatar: email.charAt(0).toUpperCase(),
                            xp: 0,
                            rank: 'Novice',
                            is_creator: false
                        })
                        .select()
                        .single();
                    profile = newProf;
                }

                // 4. Cache user session locally
                this.currentUser = {
                    id: user.id,
                    email: user.email,
                    name: profile.name,
                    avatar: profile.avatar || profile.name.charAt(0).toUpperCase(),
                    isCreator: profile.is_creator,
                    xp: profile.xp,
                    rank: profile.rank
                };
                localStorage.setItem('lf_user', JSON.stringify(this.currentUser));
                localStorage.setItem('lf_is_creator', profile.is_creator ? 'true' : 'false');

                // Sync data
                await this.syncFromDatabase();
                return { success: true };
            } catch (err) {
                console.error(err);
                return { success: false, error: err.message };
            }
        };

        // --- OVERRIDE: logout ---
        lfAuth.logout = async function() {
            await self.client.auth.signOut();
            this.currentUser = null;
            this.purchases = [];
            this.bookmarks = [];
            this.readHistory = [];
            
            localStorage.removeItem('lf_user');
            localStorage.removeItem('lf_purchases');
            localStorage.removeItem('lf_bookmarks');
            localStorage.removeItem('lf_read_history');
            localStorage.removeItem('lf_is_creator');
            localStorage.removeItem('lf_custom_products');
            localStorage.removeItem('lf_creator_sales');
            localStorage.removeItem('lf_audit_passed');
            localStorage.removeItem('lf_manifest_downloaded');
            localStorage.removeItem('lf_manifest_submitted');
            localStorage.removeItem('lf_visited_dashboard');
            
            window.location.reload();
        };

        // --- OVERRIDE: toggleBookmark ---
        lfAuth.toggleBookmark = async function(articleId, articleData) {
            if (!this.isLoggedIn()) return { error: 'not_logged_in' };
            const uid = this.currentUser.id;

            const existingIndex = this.bookmarks.findIndex(b => b.id === articleId);
            let isBookmarkedNow = false;

            try {
                if (existingIndex > -1) {
                    // Delete
                    await self.client
                        .from('bookmarks')
                        .delete()
                        .eq('user_id', uid)
                        .eq('article_id', articleId);
                    this.bookmarks.splice(existingIndex, 1);
                } else {
                    // Insert
                    await self.client
                        .from('bookmarks')
                        .insert({
                            user_id: uid,
                            article_id: articleId,
                            article_title: articleData.title,
                            article_link: articleData.link
                        });
                    this.bookmarks.push({ id: articleId, data: articleData, timestamp: Date.now() });
                    isBookmarkedNow = true;
                }
                localStorage.setItem('lf_bookmarks', JSON.stringify(this.bookmarks));
                return { success: true, isBookmarked: isBookmarkedNow };
            } catch (err) {
                console.error(err);
                return { error: err.message };
            }
        };

        // --- OVERRIDE: markAsRead ---
        lfAuth.markAsRead = async function(articleId, articleData) {
            if (!this.isLoggedIn()) return;
            const uid = this.currentUser.id;

            if (this.readHistory.some(h => h.id === articleId)) return;

            try {
                await self.client
                    .from('read_history')
                    .insert({
                        user_id: uid,
                        article_id: articleId,
                        article_title: articleData.title,
                        article_link: articleData.link
                    });
                
                this.readHistory.push({ id: articleId, data: articleData, timestamp: Date.now() });
                localStorage.setItem('lf_read_history', JSON.stringify(this.readHistory));

                // Add 10 XP
                this.currentUser.xp += 10;
                localStorage.setItem('lf_user', JSON.stringify(this.currentUser));
                
                // Update rank
                if (this.currentUser.xp >= 1000) this.currentUser.rank = 'Director of Photography';
                else if (this.currentUser.xp >= 300) this.currentUser.rank = 'Advanced Shooter';

                await self.client
                    .from('profiles')
                    .update({ xp: this.currentUser.xp, rank: this.currentUser.rank })
                    .eq('id', uid);

            } catch (err) {
                console.error(err);
            }
        };

        // --- OVERRIDE: addPurchase ---
        lfAuth.addPurchase = async function(productId, productData) {
            if (!this.isLoggedIn()) return { error: 'not_logged_in' };
            const uid = this.currentUser.id;

            if (this.purchases.some(p => p.id === productId)) return { success: true };

            try {
                await self.client
                    .from('purchases')
                    .insert({
                        user_id: uid,
                        product_id: productId,
                        product_name: productData.name || productData.title || productId,
                        product_type: productData.type || 'Tài liệu số',
                        product_link: productData.link || '#',
                        price: productData.price || 0
                    });

                this.purchases.push({ id: productId, data: productData, timestamp: Date.now() });
                localStorage.setItem('lf_purchases', JSON.stringify(this.purchases));

                // Add 50 XP
                this.currentUser.xp += 50;
                localStorage.setItem('lf_user', JSON.stringify(this.currentUser));

                // Update rank
                if (this.currentUser.xp >= 1000) this.currentUser.rank = 'Director of Photography';
                else if (this.currentUser.xp >= 300) this.currentUser.rank = 'Advanced Shooter';

                await self.client
                    .from('profiles')
                    .update({ xp: this.currentUser.xp, rank: this.currentUser.rank })
                    .eq('id', uid);

                return { success: true };
            } catch (err) {
                console.error(err);
                return { error: err.message };
            }
        };
    }

    // --- DB Creator products API ---
    async getApprovedProducts() {
        if (!this.isOnline) {
            return JSON.parse(localStorage.getItem('lf_custom_products') || '[]').filter(p => p.status === 'approved');
        }
        const { data } = await this.client
            .from('products')
            .select('*')
            .eq('status', 'approved');
        return data || [];
    }

    async getAllProducts() {
        if (!this.isOnline) {
            return JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
        }
        // Return approved products + products made by this logged in user
        const uid = lfAuth.currentUser?.id;
        if (!uid) {
            const { data } = await this.client.from('products').select('*').eq('status', 'approved');
            return data || [];
        }

        const { data } = await this.client
            .from('products')
            .select('*')
            .or(`status.eq.approved,creator_id.eq.${uid}`);
        return data || [];
    }

    async upsertProduct(product) {
        if (!this.isOnline) {
            let products = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
            products = products.filter(p => p.id !== product.id);
            products.push(product);
            localStorage.setItem('lf_custom_products', JSON.stringify(products));
            return product;
        }

        const uid = lfAuth.currentUser.id;
        const payload = {
            id: product.id,
            name: product.name,
            creator: product.creator,
            creator_email: product.creatorEmail,
            bank_name: product.bankName,
            bank_account: product.bankAccount,
            bank_owner: product.bankOwner,
            momo_number: product.momoNumber,
            type: product.type,
            price: product.price,
            original_price: product.originalPrice,
            description: product.desc,
            cover_url: product.coverUrl,
            file_link: product.fileLink,
            status: product.status || 'draft',
            creator_id: uid
        };

        // Also make sure profile is creator
        if (!lfAuth.currentUser.isCreator) {
            lfAuth.currentUser.isCreator = true;
            localStorage.setItem('lf_user', JSON.stringify(lfAuth.currentUser));
            localStorage.setItem('lf_is_creator', 'true');
            await this.client.from('profiles').update({ is_creator: true }).eq('id', uid);
        }

        const { data, error } = await this.client
            .from('products')
            .upsert(payload)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateProductStatus(productId, status) {
        if (!this.isOnline) {
            const products = JSON.parse(localStorage.getItem('lf_custom_products') || '[]');
            const idx = products.findIndex(p => p.id === productId);
            if (idx > -1) {
                products[idx].status = status;
                localStorage.setItem('lf_custom_products', JSON.stringify(products));
            }
            return;
        }

        const { error } = await this.client
            .from('products')
            .update({ status: status })
            .eq('id', productId);
        if (error) throw error;
    }

    async getMySales() {
        if (!this.isOnline) {
            return JSON.parse(localStorage.getItem('lf_creator_sales') || '[]');
        }
        const uid = lfAuth.currentUser?.id;
        if (!uid) return [];
        const { data } = await this.client
            .from('sales')
            .select('*')
            .eq('seller_id', uid);
        return data || [];
    }

    async recordSale(sale) {
        if (!this.isOnline) {
            const sales = JSON.parse(localStorage.getItem('lf_creator_sales') || '[]');
            sales.push(sale);
            localStorage.setItem('lf_creator_sales', JSON.stringify(sales));
            return;
        }

        // Get seller ID from product ID
        const { data: prod } = await this.client
            .from('products')
            .select('creator_id')
            .eq('id', sale.productId)
            .single();

        if (!prod) return;

        const { error } = await this.client
            .from('sales')
            .insert({
                id: sale.id,
                product_id: sale.productId,
                product_name: sale.productName,
                price: sale.price,
                buyer_name: sale.buyerName,
                buyer_email: sale.buyerEmail,
                seller_id: prod.creator_id,
                status: 'completed'
            });
        
        if (error) {
            if (error.code === '23505') {
                return; // Unique violation, sale already recorded
            }
            throw error;
        }
    }

    // --- Indicator & Connection Modal UI ---
    injectStatusIndicator(connected, errorMsg = '') {
        // Remove existing indicator
        const existing = document.getElementById('lf-db-indicator');
        if (existing) existing.remove();

        const badge = document.createElement('div');
        badge.id = 'lf-db-indicator';
        badge.style.position = 'fixed';
        badge.style.bottom = '15px';
        badge.style.left = '15px';
        badge.style.zIndex = '999999';
        badge.style.padding = '6px 12px';
        badge.style.borderRadius = '20px';
        badge.style.fontFamily = 'var(--font-mono, monospace)';
        badge.style.fontSize = '0.75rem';
        badge.style.fontWeight = 'bold';
        badge.style.cursor = 'pointer';
        badge.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.gap = '8px';
        badge.style.transition = 'all 0.3s';
        badge.style.border = '1px solid';

        if (connected) {
            badge.style.background = 'rgba(16, 185, 129, 0.1)';
            badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            badge.style.color = '#10b981';
            badge.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block; animation: pulse 2s infinite;"></span> Cloud DB: Supabase (Online)`;
        } else {
            badge.style.background = 'rgba(245, 158, 11, 0.1)';
            badge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
            badge.style.color = '#f59e0b';
            badge.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span> Local DB: Offline ${errorMsg ? '(Connection Error)' : '(Local Only)'}`;
            if (errorMsg) {
                badge.title = 'Click to view error: ' + errorMsg;
            }
        }

        badge.addEventListener('click', () => this.openConfigModal(errorMsg));
        document.body.appendChild(badge);

        // Inject keyframes for pulse animation if not exists
        if (!document.getElementById('lf-db-pulse-style')) {
            const style = document.createElement('style');
            style.id = 'lf-db-pulse-style';
            style.innerHTML = `
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    openConfigModal(errorMsg = '') {
        const credentials = this.getCredentials();
        const savedProvider = localStorage.getItem('lf_gateway_provider') || '';
        const savedUrl = localStorage.getItem('lf_gateway_url') || '';
        
        // Remove existing if any
        const existing = document.getElementById('lf-db-config-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'lf-db-config-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0,0,0,0.85)';
        modal.style.backdropFilter = 'blur(6px)';
        modal.style.zIndex = '9999999';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s ease';

        const errorHtml = errorMsg ? `
            <div style="background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 12px; border-radius: 4px; margin-bottom: 20px; font-size: 0.85rem; color: #f87171; line-height: 1.4;">
                <strong>⚠️ Lỗi kết nối:</strong> ${errorMsg}
            </div>
        ` : '';

        modal.innerHTML = `
            <div style="background: #111115; border: 1px solid #222228; width: 90%; max-width: 500px; border-radius: 16px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); position: relative; max-height: 90vh; overflow-y: auto; box-sizing: border-box;">
                <button id="lf-db-close" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #888; font-size: 1.5rem; cursor: pointer;">&times;</button>
                <h3 style="margin: 0 0 10px 0; font-size: 1.4rem; color: #fff; font-family: var(--font-heading, sans-serif);">Cấu hình Database & Gateway</h3>
                <p style="color: #888; font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px;">
                    Thiết lập kết nối Supabase Cloud Database để đồng bộ hóa và cấu hình cổng thanh toán tự động (PayOS/Stripe) cho Onboarding thương mại thực tế.
                </p>
                
                ${errorHtml}

                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #aaa; font-size: 0.8rem; font-family: monospace; text-transform: uppercase; margin-bottom: 5px;">Supabase Project URL</label>
                    <input type="text" id="lf-db-url" value="${credentials.url}" placeholder="https://xxxx.supabase.co" style="width:100%; padding: 12px; background: #000; border: 1px solid #333; border-radius: 6px; color: #fff; font-size: 0.9rem; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #aaa; font-size: 0.8rem; font-family: monospace; text-transform: uppercase; margin-bottom: 5px;">Supabase Anon Key</label>
                    <input type="password" id="lf-db-key" value="${credentials.key}" placeholder="eyJhbGciOi..." style="width:100%; padding: 12px; background: #000; border: 1px solid #333; border-radius: 6px; color: #fff; font-size: 0.9rem; box-sizing: border-box;">
                </div>

                <h3 style="margin: 25px 0 10px 0; font-size: 1.15rem; color: #fff; font-family: var(--font-heading, sans-serif); border-top: 1px solid #222228; padding-top: 15px;">Cổng Thanh Toán Tự Động (API Gateway)</h3>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #aaa; font-size: 0.8rem; font-family: monospace; text-transform: uppercase; margin-bottom: 5px;">Chọn Cổng Thanh Toán</label>
                    <select id="lf-gateway-provider" style="width:100%; padding: 12px; background: #000; border: 1px solid #333; border-radius: 6px; color: #fff; font-size: 0.9rem; box-sizing: border-box;">
                        <option value="" ${savedProvider === '' ? 'selected' : ''}>VietQR Thủ Công & Ví MoMo (Mặc định)</option>
                        <option value="payos" ${savedProvider === 'payos' ? 'selected' : ''}>PayOS (Cổng tự động quét VietQR)</option>
                        <option value="stripe" ${savedProvider === 'stripe' ? 'selected' : ''}>Stripe (Cổng tự động thẻ quốc tế)</option>
                    </select>
                </div>

                <div style="margin-bottom: 25px;">
                    <label style="display: block; color: #aaa; font-size: 0.8rem; font-family: monospace; text-transform: uppercase; margin-bottom: 5px;">Endpoint API Checkout</label>
                    <input type="text" id="lf-gateway-url" value="${savedUrl}" placeholder="Để trống nếu deploy Vercel (/api/create-payment-link)" style="width:100%; padding: 12px; background: #000; border: 1px solid #333; border-radius: 6px; color: #fff; font-size: 0.9rem; box-sizing: border-box;">
                </div>

                <div style="display: flex; gap: 15px; justify-content: flex-end;">
                    ${this.isOnline ? `
                        <button id="lf-db-disconnect" style="padding: 10px 20px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">Ngắt kết nối</button>
                    ` : ''}
                    <button id="lf-db-save" class="btn-primary" style="padding: 10px 25px; background: var(--accent-cyan, #00d4aa); color: #000; font-weight: bold; border-radius: 6px; cursor: pointer; border: none; font-size: 0.85rem;">Kết nối & Đồng bộ</button>
                </div>
                
                <div style="margin-top: 25px; border-top: 1px solid #222228; padding-top: 15px; font-size: 0.75rem; color: #666; line-height: 1.4;">
                    💡 Chưa có database? Copy file <code style="color: #aaa; background: #222; padding: 2px 4px; border-radius: 3px;">supabase_schema.sql</code> ở thư mục gốc và chạy trong trang SQL Editor của Supabase để khởi tạo bảng tự động.
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.style.opacity = '1', 50);

        // Bind events
        document.getElementById('lf-db-close').addEventListener('click', () => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        });

        document.getElementById('lf-db-save').addEventListener('click', () => {
            const url = document.getElementById('lf-db-url').value;
            const key = document.getElementById('lf-db-key').value;
            const provider = document.getElementById('lf-gateway-provider').value;
            const gatewayUrl = document.getElementById('lf-gateway-url').value;
            
            if (!url || !key) {
                alert('Vui lòng điền đầy đủ URL và Anon Key!');
                return;
            }
            
            localStorage.setItem('lf_gateway_provider', provider);
            localStorage.setItem('lf_gateway_url', gatewayUrl);
            this.setCredentials(url, key);
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.remove();
                window.location.reload();
            }, 300);
        });

        const dis = document.getElementById('lf-db-disconnect');
        if (dis) {
            dis.addEventListener('click', () => {
                if (confirm('Bạn có chắc chắn muốn ngắt kết nối và quay trở về chế độ Local Storage không?')) {
                    localStorage.removeItem('lf_gateway_provider');
                    localStorage.removeItem('lf_gateway_url');
                    this.clearCredentials();
                    modal.style.opacity = '0';
                    setTimeout(() => {
                        modal.remove();
                        window.location.reload();
                    }, 300);
                }
            });
        }
    }
}

// Instantiate and expose globally
window.lfSupabase = new SupabaseIntegration();
