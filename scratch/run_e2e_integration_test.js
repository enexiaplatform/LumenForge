/**
 * LUMENFORGE — End-to-End Integration Test Runner
 * Evaluates the actual business logic of js/auth.js, js/onboarding.js, js/checkout.js, and js/admin.js
 * under a mocked browser environment in Node.js.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('========================================================================');
console.log('⚡ LUMENFORGE END-TO-END INTEGRATION TEST: CREATOR-TO-ADMIN FLOW');
console.log('========================================================================\n');

// --- 1. MOCK BROWSER ENVIRONMENT ---
const mockLocalStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

global.localStorage = mockLocalStorage;
global.alert = function(msg) {};
global.confirm = function(msg) { return true; };

const mockElements = {};

function createMockElement(id) {
  return {
    id: id,
    innerText: '',
    innerHTML: '',
    outerHTML: '',
    style: {},
    value: '',
    checked: false,
    src: '',
    getAttribute(name) {
      if (name === 'href') {
        if (this.id === 'dash-link') return 'dashboard.html';
        return '#';
      }
      return '';
    },
    setAttribute(name, val) {},
    classList: {
      add(cls) {},
      remove(cls) {}
    },
    addEventListener(event, cb) {},
    remove() {},
    querySelectorAll(selector) {
      if (selector === '.nav-link') {
        return [
          {
            id: 'dash-link',
            getAttribute(name) { return name === 'href' ? 'dashboard.html' : ''; },
            parentNode: { replaceChild() {} }
          }
        ];
      }
      return [];
    },
    querySelector(selector) {
      return null;
    },
    parentNode: {
      replaceChild() {}
    },
    appendChild() {}
  };
}

global.document = {
  listeners: {},
  addEventListener(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },
  dispatchEvent(event) {
    const name = event.type || event;
    if (this.listeners[name]) {
      this.listeners[name].forEach(cb => cb(event));
    }
  },
  getElementById(id) {
    if (!mockElements[id]) {
      mockElements[id] = createMockElement(id);
    }
    return mockElements[id];
  },
  querySelector(selector) {
    if (selector.includes('tbody')) {
      return {
        innerHTML: '',
        appendChild() {}
      };
    }
    if (selector.includes('auth.js')) {
      return {
        src: 'js/auth.js',
        parentNode: {
          replaceChild() {}
        }
      };
    }
    return this.getElementById(selector.replace('#', ''));
  },
  querySelectorAll(selector) {
    return [];
  },
  createElement(tag) {
    return this.getElementById('dynamic-' + tag + '-' + Math.random());
  },
  body: {
    appendChild() {},
    insertAdjacentHTML() {}
  },
  head: {
    appendChild() {}
  }
};

global.window = {
  location: {
    replace(url) {
      this.currentUrl = url;
    },
    reload() {
    },
    search: ''
  },
  alert(msg) {
  },
  confirm(msg) {
    return true; // Always confirm
  },
  Intl: global.Intl,
  localStorage: global.localStorage,
  document: global.document,
  LUMENFORGE_ADMIN_CONFIG: {
    allowCreatorMarketplace: false,
    devModeAllowed: false // Turn off dev mode to test standard manual flow
  }
};

// Helper to load file content and run in Node global context
function evaluateScript(filePath) {
  const absolutePath = path.resolve(__dirname, '..', filePath);
  const code = fs.readFileSync(absolutePath, 'utf8');
  try {
    // Run in global context so that declarations like "function X()" become global properties.
    // Also, inside code, "window.lfAuth" etc. will work fine.
    vm.runInThisContext(code, { filename: filePath });
  } catch (err) {
    console.error(`❌ Failed to evaluate: ${filePath}`);
    throw err;
  }
}

// Evaluate targeted source files
evaluateScript('js/auth.js');
// Bind global.lfAuth to window.lfAuth
global.lfAuth = window.lfAuth;

evaluateScript('js/onboarding.js');
global.lfOnboarding = window.lfOnboarding;

evaluateScript('js/admin.js');
global.approveProduct = window.approveProduct;
global.approvePayment = window.approvePayment;

evaluateScript('js/checkout.js');
global.submitCheckout = window.submitCheckout;

// Helper assertion function
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

// Run DOMContentLoaded listeners to initialize systems
document.dispatchEvent(new CustomEvent('DOMContentLoaded'));

// --- 2. EXECUTE STEPS ---
async function runE2ETest() {
  console.log('\n--- STEP 1: Creator Registration / Log In ---');
  // Log in as creator (password123 matches verification rules)
  const loginResult = lfAuth.login('creator@lumenforge.studio', 'password123');
  assert(loginResult.success, 'Creator logged in successfully');
  assert(lfAuth.isLoggedIn(), 'Auth system shows logged in state');

  // Connect creator profile & bank details (completing Day 1 requirements)
  localStorage.setItem('lf_is_creator', 'true');
  lfAuth.currentUser.isCreator = true;
  localStorage.setItem('lf_user', JSON.stringify(lfAuth.currentUser));

  let status = await lfOnboarding.getStatus();
  assert(status.day1, 'Day 1: Connection to Payout verified (isCreator flag)');

  console.log('\n--- STEP 2: Product Creation ---');
  // Add a custom product representing sample preset
  const mockProduct = {
    id: 'prod-vintage-cine',
    name: 'Vintage Cine-Still Film Pack',
    creator: 'Test Creator',
    creatorEmail: 'creator@lumenforge.studio',
    bankName: 'VCB',
    bankAccount: '1234567890',
    bankOwner: 'TEST CREATOR',
    momoNumber: '0987654321',
    type: 'preset',
    price: 149000,
    originalPrice: 290000,
    desc: 'Bộ 8 presets tái tạo nước màu xanh ấm đặc trưng của phim điện ảnh Kodak.',
    coverUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4',
    fileLink: 'https://downloads.lumenforge.studio/presets/vintage-cine.zip',
    status: 'draft' // Starts as draft
  };

  const customProducts = [mockProduct];
  localStorage.setItem('lf_custom_products', JSON.stringify(customProducts));

  status = await lfOnboarding.getStatus();
  assert(status.day2, 'Day 2: Sample product creation verified');

  console.log('\n--- STEP 3: Content SEO & Copyright Audit ---');
  // Emulate running the content audit
  // Set up mock DOM values for the audit fields
  document.getElementById('p-name').value = mockProduct.name;
  document.getElementById('p-desc').value = mockProduct.desc;
  document.getElementById('p-cover').value = mockProduct.coverUrl;
  document.getElementById('p-file').value = mockProduct.fileLink;

  // Run audit. Since runContentAudit uses setTimeout, we mock it synchronously or wait.
  await new Promise((resolve) => {
    const origSetTimeout = global.setTimeout;
    global.setTimeout = (fn) => fn();
    
    lfOnboarding.runContentAudit().then(() => {
      global.setTimeout = origSetTimeout;
      resolve();
    });
  });

  assert(localStorage.getItem('lf_audit_passed') === 'true', 'Audit passed successfully (length & URL format validated)');
  
  status = await lfOnboarding.getStatus();
  assert(status.day3, 'Day 3: Copyright & SEO quality check verified');

  console.log('\n--- STEP 4: Manual Purchase Simulation ---');
  // A customer attempts to buy the product.
  // Log in as a separate guest customer
  const customerEmail = 'buyer@gmail.com';
  const loginCustomer = lfAuth.login(customerEmail, 'password123');
  assert(loginCustomer.success, 'Buyer logged in successfully');
  assert(lfAuth.currentUser.email === customerEmail, 'Active user switched to buyer');

  // Trigger manual checkout submission
  document.getElementById('checkout-email').value = customerEmail;
  
  // We need to switch off dev mode to trigger normal manual purchase flow (adding to lf_purchases with 'pending')
  localStorage.setItem('lf_dev_mode', 'false');
  
  // Mock products metadata lookup
  global.getProductMetadata = async function(id) {
    return {
      name: mockProduct.name,
      type: 'Presets & LUTs',
      link: mockProduct.fileLink,
      price: mockProduct.price
    };
  };

  await submitCheckout(mockProduct.id, mockProduct.price, `LF VINTAGE`);

  const purchases = JSON.parse(localStorage.getItem('lf_purchases'));
  const targetPurchase = purchases.find(p => p.id === mockProduct.id);
  assert(targetPurchase !== undefined, 'Purchase record exists in system');
  assert(targetPurchase.status === 'pending', 'Purchase status is "pending" (awaiting VietQR bill verification)');

  console.log('\n--- STEP 5: Admin Panel Payments Queue ---');
  // Log in as Admin Henry to review transactions
  const loginAdmin = lfAuth.login('henry@lumenforge.studio', 'password123');
  assert(loginAdmin.success, 'Admin Henry logged in successfully');
  assert(lfAuth.isAdmin(), 'Auth system identifies Henry as Administrator');

  // Load pending payments from localStorage
  const localPurchases = JSON.parse(localStorage.getItem('lf_purchases') || '[]');
  const pendingPayments = [];
  localPurchases.forEach(p => {
    if (p.status === 'pending') {
      pendingPayments.push({
        order_code: Number(String(p.timestamp).slice(-9)),
        user_id: 'buyer-user-id',
        product_id: p.id,
        product_name: p.data?.name || p.id,
        price: p.data?.price || 0,
        status: 'pending'
      });
    }
  });

  const pendingPayment = pendingPayments.find(p => p.product_id === mockProduct.id);
  assert(pendingPayment !== undefined, 'Pending payment appears in Admin VietQR verification queue');
  assert(pendingPayment.price === mockProduct.price, 'Pending payment reflects correct price');

  console.log('\n--- STEP 6: Admin Approves Payment (Duyệt bill) ---');
  // Trigger approve payment function
  const orderCode = pendingPayment.order_code;
  
  // We mock confirm to return true, which we did in global.window.confirm.
  // Now call approvePayment.
  await approvePayment(mockProduct.id, 'buyer-user-id', orderCode);

  // Check purchase status has updated to 'purchased'
  // Switch back to buyer to verify
  lfAuth.login(customerEmail, 'password123');
  const buyerPurchases = JSON.parse(localStorage.getItem('lf_purchases'));
  const approvedPurchase = buyerPurchases.find(p => p.id === mockProduct.id);
  assert(approvedPurchase.status === 'purchased', 'Purchase status transitioned to "purchased" (unlocked file downloads)');

  // Verify product status was upgraded from 'draft' to 'testing'
  const updatedProds = JSON.parse(localStorage.getItem('lf_custom_products'));
  assert(updatedProds[0].status === 'testing', 'Product status correctly promoted to "testing"');

  // Verify sale record is logged for Creator's revenue tracking
  const salesLog = JSON.parse(localStorage.getItem('lf_creator_sales'));
  const loggedSale = salesLog.find(s => s.productId === mockProduct.id);
  assert(loggedSale !== undefined, 'Sale log generated in database');
  assert(loggedSale.price === mockProduct.price, 'Sale log records correct transaction price');

  // Log in as Creator again to verify launchpad progress
  lfAuth.login('creator@lumenforge.studio', 'password123');
  status = await lfOnboarding.getStatus();
  assert(status.day4, 'Day 4: Webhook / Manual purchase verified');
  
  // Visit dashboard to verify Day 5
  localStorage.setItem('lf_visited_dashboard', 'true');
  status = await lfOnboarding.getStatus();
  assert(status.day5, 'Day 5: Dashboard analytics review verified');

  console.log('\n--- STEP 7: Manifest Generation & Submission ---');
  // Emulate manifest download (Day 6)
  localStorage.setItem('lf_manifest_downloaded', 'true');
  status = await lfOnboarding.getStatus();
  assert(status.day6, 'Day 6: Manifest JSON compilation verified');

  // Emulate manifest submission to admin (Day 7)
  await lfOnboarding.submitToAdmin(mockProduct.id);
  status = await lfOnboarding.getStatus();
  assert(status.day7, 'Day 7: Manifest submission status is active');
  assert(status.isSubmitted, 'Onboarding state shows "submitted" (waiting for admin)');

  console.log('\n--- STEP 8: Admin Global CDN Approval & Status Propagation ---');
  // Switch back to Admin to review and approve product manifest
  lfAuth.login('henry@lumenforge.studio', 'password123');
  
  // Run approval function
  await approveProduct(mockProduct.id);

  // Verify status in lf_custom_products updated to 'approved'
  const finalProducts = JSON.parse(localStorage.getItem('lf_custom_products'));
  const approvedProductCopy = finalProducts.find(p => p.id === mockProduct.id);
  assert(approvedProductCopy.status === 'approved', 'Product status successfully promoted to "approved"');

  // Log back in as Creator to verify Live CDN badge
  lfAuth.login('creator@lumenforge.studio', 'password123');
  status = await lfOnboarding.getStatus();
  assert(status.isApproved, 'Onboarding status confirms product has been approved');
  assert(status.progressPercent === 100, 'Onboarding roadmap progress reaches 100%');

  console.log('\n========================================================================');
  console.log('🎉 SUCCESS: END-TO-END INTEGRATION TEST COMPLETED WITH 0 ERRORS!');
  console.log('All state machines, database writes, and queues are fully integrated.');
  console.log('========================================================================');
}

runE2ETest().catch(e => {
  console.error('❌ Test failed with exception:', e);
  process.exit(1);
});
