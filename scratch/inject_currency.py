import re

file_path = 'e:/Antigravity project/LumenForge/pro-hub.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Currency Toggle Switch
toggle_html = '''
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 30px; gap: 15px;">
          <span style="font-family: var(--font-mono); font-size: 0.9rem; color: var(--text-dim);" id="lbl-vnd" class="active-currency">VND</span>
          <label style="position: relative; display: inline-block; width: 60px; height: 30px;">
            <input type="checkbox" id="currency-toggle" style="opacity: 0; width: 0; height: 0;">
            <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 34px; border: 1px solid var(--border-color);">
              <span id="toggle-slider" style="position: absolute; content: ''; height: 22px; width: 22px; left: 4px; bottom: 3px; background-color: var(--accent-gold); transition: .4s; border-radius: 50%;"></span>
            </span>
          </label>
          <span style="font-family: var(--font-mono); font-size: 0.9rem; color: var(--text-dim);" id="lbl-usd">USD</span>
        </div>
'''

if 'id="currency-toggle"' not in content:
    content = content.replace('<div class="pricing-grid-pro">', toggle_html + '        <div class="pricing-grid-pro">')

# 2. Replace hardcoded prices with dynamic attributes
price_monthly_old = '<div class="plan-price">149.000đ<span>/ tháng</span></div>'
price_monthly_new = '<div class="plan-price" data-vnd="149.000đ" data-usd="$5.99">149.000đ<span data-vnd-suffix="/ tháng" data-usd-suffix="/ mo">/ tháng</span></div>'

price_yearly_old = '<div class="plan-price">990.000đ<span>/ năm</span></div>'
price_yearly_new = '<div class="plan-price" data-vnd="990.000đ" data-usd="$39.00">990.000đ<span data-vnd-suffix="/ năm" data-usd-suffix="/ yr">/ năm</span></div>'

price_lifetime_old = '<div class="plan-price">1.990.000đ<span>/ trọn đời</span></div>'
price_lifetime_new = '<div class="plan-price" data-vnd="1.990.000đ" data-usd="$79.00">1.990.000đ<span data-vnd-suffix="/ trọn đời" data-usd-suffix="/ life">/ trọn đời</span></div>'

content = content.replace(price_monthly_old, price_monthly_new)
content = content.replace(price_yearly_old, price_yearly_new)
content = content.replace(price_lifetime_old, price_lifetime_new)

# 3. Add JS for toggle
js_logic = '''
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('currency-toggle');
    if(!toggle) return;
    
    const slider = document.getElementById('toggle-slider');
    const lblVnd = document.getElementById('lbl-vnd');
    const lblUsd = document.getElementById('lbl-usd');
    const priceElements = document.querySelectorAll('.plan-price');

    toggle.addEventListener('change', function() {
      const isUsd = this.checked;
      
      if(isUsd) {
        slider.style.transform = 'translateX(30px)';
        lblUsd.style.color = 'var(--accent-gold)';
        lblVnd.style.color = 'var(--text-dim)';
      } else {
        slider.style.transform = 'translateX(0)';
        lblVnd.style.color = 'var(--accent-gold)';
        lblUsd.style.color = 'var(--text-dim)';
      }

      priceElements.forEach(el => {
        const span = el.querySelector('span');
        if (isUsd) {
          el.childNodes[0].nodeValue = el.getAttribute('data-usd');
          if(span) span.textContent = span.getAttribute('data-usd-suffix');
        } else {
          el.childNodes[0].nodeValue = el.getAttribute('data-vnd');
          if(span) span.textContent = span.getAttribute('data-vnd-suffix');
        }
      });
    });
  });
</script>
</body>
'''

if 'currency-toggle' not in content.split('</body>')[0] and 'slider.style.transform' not in content:
    content = content.replace('</body>', js_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected currency toggle into pro-hub.html")
