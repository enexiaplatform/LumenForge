/**
 * LUMENFORGE — Lumen AI Cinematic Frame Analyzer
 * This tool simulates an AI analysis of iconic cinematic frames and acts as a sales funnel.
 */

document.addEventListener('DOMContentLoaded', () => {
  const uploadArea = document.getElementById('upload-area');
  const sampleGrid = document.getElementById('sample-grid');
  const scannerContainer = document.getElementById('scanner-container');
  const previewImage = document.getElementById('preview-image');
  const scanLine = document.getElementById('scan-line');
  const scanOverlay = document.getElementById('scan-overlay');
  
  const reportPanel = document.getElementById('report-panel');
  const reportStatus = document.getElementById('report-status');
  const colorPalette = document.getElementById('color-palette');
  const techDetails = document.getElementById('tech-details');
  const productCard = document.getElementById('product-card');

  const SAMPLE_DB = {
    'cyberpunk': {
      src: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=1200&auto=format&fit=crop', // Neon street
      palette: ['#00F0FF', '#FF0055', '#120524', '#081D3A', '#FFFFFF'],
      tech: 'High-Contrast Neon / Low Key. Ánh sáng thực tế từ bảng hiệu neon kết hợp với phản xạ đường ướt (Wet street reflections). Nhiệt độ màu hỗn hợp (Mixed Color Temp).',
      product: {
        title: 'Cyberpunk Neon Nightlife LUTs',
        desc: 'Sở hữu ngay bảng màu neon rực rỡ chuẩn phong cách Cyberpunk 2077 và Blade Runner 2049. Tối ưu cho quay đêm.',
        price: '79.000đ',
        priceVal: 79000,
        id: 'preset-cyberpunk'
      }
    },
    'dune': {
      src: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=1200&auto=format&fit=crop', // Desert sand
      palette: ['#D99D5B', '#A65C32', '#592D1D', '#F2D7B6', '#26120C'],
      tech: 'Monochromatic Amber / High Key. Ánh sáng tự nhiên (Natural Light) gắt tạo bóng đổ cứng (Hard shadows). Bảo toàn chi tiết vùng sáng cực tốt.',
      product: {
        title: 'Analog Film Emulation Pack',
        desc: 'Gói màu Film độc quyền tạo ra chất màu Cổ điển, bụi bặm và gai góc chuẩn điện ảnh Hollywood.',
        price: '99.000đ',
        priceVal: 99000,
        id: 'preset-analog'
      }
    },
    'chiaroscuro': {
      src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop', // Moody portrait
      palette: ['#E6D3B3', '#8C6C54', '#402921', '#1A110F', '#0D0908'],
      tech: 'Rembrandt Lighting / High Contrast Ratio. Ánh sáng ven (Rim Light) mạnh mẽ kết hợp với vùng tối sâu thẳm (Deep Shadows).',
      product: {
        title: 'Bậc Thầy Chiaroscuro (Ebook)',
        desc: 'Khám phá bí mật nghệ thuật điều khiển bóng tối trong điện ảnh và nhiếp ảnh. Từ Caravaggio đến Gordon Willis.',
        price: '149.000đ',
        priceVal: 149000,
        id: 'ebook-chiaroscuro'
      }
    }
  };

  // Bind clicks to samples
  document.querySelectorAll('.sample-img').forEach(img => {
    img.addEventListener('click', (e) => {
      const type = e.target.dataset.type;
      startAnalysis(type);
    });
  });

  // Mock Upload
  if(uploadArea) {
    uploadArea.addEventListener('click', () => {
      // Pick a random sample to simulate analyzing a user image
      const keys = Object.keys(SAMPLE_DB);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      startAnalysis(randomKey);
    });
  }

  function startAnalysis(type) {
    const data = SAMPLE_DB[type];
    if(!data) return;

    // Reset UI
    reportPanel.style.display = 'block';
    reportStatus.innerHTML = '<span class="loading-dots">Initializing Lumen AI Engine</span>';
    reportStatus.style.color = 'var(--accent-cyan)';
    colorPalette.innerHTML = '';
    techDetails.innerHTML = '';
    productCard.style.display = 'none';
    
    uploadArea.style.display = 'none';
    sampleGrid.style.display = 'none';
    
    scannerContainer.style.display = 'block';
    previewImage.src = data.src;
    
    // Start CSS Animations
    scanLine.style.animation = 'scan 2s linear infinite';
    scanOverlay.style.animation = 'pulse 2s infinite';

    // Simulate Processing Time
    setTimeout(() => {
      reportStatus.innerHTML = '<span class="loading-dots">Extracting Color Palette</span>';
    }, 1000);

    setTimeout(() => {
      reportStatus.innerHTML = '<span class="loading-dots">Analyzing Lighting Topography</span>';
    }, 2000);

    setTimeout(() => {
      finishAnalysis(data);
    }, 3500);
  }

  function finishAnalysis(data) {
    // Stop animations
    scanLine.style.animation = 'none';
    scanOverlay.style.animation = 'none';
    scanLine.style.display = 'none';
    scanOverlay.style.display = 'none';

    reportStatus.innerHTML = '✅ TỔNG HỢP PHÂN TÍCH HOÀN TẤT';
    reportStatus.style.color = '#00ff88';

    // Render Palette
    colorPalette.innerHTML = data.palette.map(hex => 
      `<div class="color-swatch" style="background: ${hex};" title="${hex}">
         <span class="color-hex">${hex}</span>
       </div>`
    ).join('');

    // Render Tech
    techDetails.innerHTML = `<p>${data.tech}</p>`;

    // Render Product (The Sales Funnel)
    productCard.style.display = 'block';
    productCard.innerHTML = `
      <div class="product-upsell">
        <div class="product-badge">🔥 BÍ QUYẾT TÁI TẠO</div>
        <h4>${data.product.title}</h4>
        <p>${data.product.desc}</p>
        <div class="price-row">
          <span class="price-tag">${data.product.price}</span>
          <button class="btn-primary" onclick="openCheckoutModal('${data.product.id}', ${data.product.priceVal})">
            MUA NGAY
          </button>
        </div>
      </div>
    `;
  }
});
