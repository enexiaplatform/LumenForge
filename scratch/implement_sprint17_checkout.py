import os

file_path = 'e:/Antigravity project/LumenForge/js/checkout.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Modify openCheckoutModal to set abandoned cart
target_open = "const product = await getProductMetadata(productId);"
replace_open = """const product = await getProductMetadata(productId);
  
  // SPRINT 17: Track abandoned cart intent when modal opens
  localStorage.setItem('lf_abandoned_cart', productId);
"""
if "lf_abandoned_cart" not in content.split("function openCheckoutModal")[1][:500]:
    content = content.replace(target_open, replace_open, 1)


# Modify submitCheckout to clear abandoned cart and include affiliate ref in webhook
target_submit = """  console.log({
    event: 'order.created',
    ref: refCode,
    productId: productId,
    priceVnd: priceVnd,
    customerEmail: email,
    timestamp: new Date().toISOString()
  });"""

replace_submit = """  // SPRINT 17: Clear abandoned cart upon successful intent
  localStorage.removeItem('lf_abandoned_cart');

  console.log({
    event: 'order.created',
    ref: refCode,
    productId: productId,
    priceVnd: priceVnd,
    customerEmail: email,
    affiliateRef: localStorage.getItem('lf_affiliate_ref') || null, // SPRINT 17: Affiliate tracking
    timestamp: new Date().toISOString()
  });"""

if "affiliateRef" not in content:
    content = content.replace(target_submit, replace_submit, 1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Sprint 17 Checkout Logic updated.")
