/* ==========================================================================
   LUMENFORGE — Posing Guide Library
   ========================================================================== */

const POSE_DATABASE = [
  {
    id: 'power-stance',
    title: 'The Power Stance',
    category: 'power',
    svg: `<svg viewBox="0 0 100 200"><circle cx="50" cy="30" r="15"/><line x1="50" y1="45" x2="50" y2="100"/><line x1="50" y1="60" x2="20" y2="90"/><line x1="50" y1="60" x2="80" y2="90"/><line x1="50" y1="100" x2="30" y2="180"/><line x1="50" y1="100" x2="70" y2="180"/></svg>`,
    desc: 'Hai chân dang rộng bằng vai, trọng tâm chia đều. Đây là tư thế chữ A vững chãi. Mở rộng diện tích bề ngang giúp chủ thể trông to lớn và uy quyền hơn (chiếm không gian). Thường dùng cho các bức ảnh CEO, Doanh nhân nam.'
  },
  {
    id: 's-curve',
    title: 'Đường cong S-Curve',
    category: 'feminine',
    svg: `<svg viewBox="0 0 100 200"><circle cx="45" cy="30" r="15"/><path d="M 45 45 Q 65 70 45 100 Q 25 130 55 180" /><line x1="45" y1="60" x2="25" y2="80"/><line x1="25" y1="80" x2="35" y2="100"/><line x1="45" y1="60" x2="65" y2="80"/><line x1="65" y1="80" x2="50" y2="100"/></svg>`,
    desc: 'Dồn toàn bộ trọng tâm vào một chân (chân trụ), chân còn lại thả lỏng, hông đẩy sang một bên. Việc này bẻ gãy trục thẳng đứng của cơ thể, tạo ra đường cong chữ S kinh điển, làm nổi bật đường nét nữ tính và sự uyển chuyển.'
  },
  {
    id: 'hands-in-pocket',
    title: 'Bỏ tay túi quần (Để hở ngón cái)',
    category: 'casual',
    svg: `<svg viewBox="0 0 100 200"><circle cx="50" cy="30" r="15"/><line x1="50" y1="45" x2="50" y2="110"/><path d="M 50 60 Q 30 70 40 100"/><path d="M 50 60 Q 70 70 60 100"/><line x1="50" y1="110" x2="40" y2="180"/><line x1="50" y1="110" x2="60" y2="180"/></svg>`,
    desc: 'Một tư thế cực kỳ tự nhiên khi không biết "để tay ở đâu". Tuy nhiên, nguyên tắc vàng là không bao giờ nhét toàn bộ bàn tay vào túi (trông như bị cụt tay). Hãy để hở ngón cái ra ngoài, tạo điểm nhấn hướng ánh mắt về phía hông.'
  },
  {
    id: 'leaning-wall',
    title: 'Tựa lưng vào tường',
    category: 'casual',
    svg: `<svg viewBox="0 0 100 200"><circle cx="40" cy="30" r="15"/><line x1="40" y1="45" x2="30" y2="100"/><line x1="40" y1="60" x2="60" y2="90"/><line x1="40" y1="60" x2="20" y2="90"/><line x1="30" y1="100" x2="50" y2="180"/><line x1="30" y1="100" x2="20" y2="180"/><line x1="80" y1="10" x2="80" y2="190" stroke-dasharray="5,5"/></svg>`,
    desc: 'Tựa một bên vai hoặc lưng vào tường giúp chủ thể có điểm tựa vật lý, tự động giảm bớt sự gượng gạo. Chân chéo nhau hoặc vắt một chân lên tường tạo hình tam giác, làm ảnh có chiều sâu hơn.'
  },
  {
    id: 'triangle-arms',
    title: 'Tam giác tay (Arm Triangles)',
    category: 'feminine',
    svg: `<svg viewBox="0 0 100 200"><circle cx="50" cy="30" r="15"/><line x1="50" y1="45" x2="50" y2="110"/><line x1="50" y1="60" x2="20" y2="70"/><line x1="20" y1="70" x2="40" y2="90"/><line x1="50" y1="60" x2="80" y2="50"/><line x1="80" y1="50" x2="55" y2="30"/><line x1="50" y1="110" x2="40" y2="180"/><line x1="50" y1="110" x2="60" y2="180"/></svg>`,
    desc: 'Sử dụng khuỷu tay để tạo ra những vùng Không gian âm (Negative Space) xung quanh eo và đầu. Mắt người luôn bị thu hút bởi các dạng hình học (tam giác), giúp bức ảnh bớt nặng nề và tôn vòng eo.'
  },
  {
    id: 'jawline-portrait',
    title: 'Kéo căng đường viền hàm',
    category: 'portrait',
    svg: `<svg viewBox="0 0 100 200"><ellipse cx="50" cy="40" rx="20" ry="25"/><path d="M 50 65 L 50 90"/><path d="M 30 90 L 70 90"/><path d="M 40 60 Q 50 75 60 60"/></svg>`,
    desc: 'Để tránh nọng cằm (double chin) trong ảnh chân dung cận, hãy yêu cầu người mẫu đẩy mặt về phía trước (hướng về ống kính) một chút, sau đó hạ cằm xuống nhẹ. Việc này kéo căng phần da cổ, làm sắc nét xương quai hàm (Jawline).'
  },
  {
    id: 'arms-crossed',
    title: 'Khoanh tay vươn vai',
    category: 'power',
    svg: `<svg viewBox="0 0 100 200"><circle cx="50" cy="30" r="15"/><line x1="50" y1="45" x2="50" y2="110"/><path d="M 50 60 L 30 80 L 60 75"/><path d="M 50 60 L 70 80 L 40 75"/><line x1="50" y1="110" x2="40" y2="180"/><line x1="50" y1="110" x2="60" y2="180"/></svg>`,
    desc: 'Tư thế đóng cửa (Closed body language), tạo cảm giác phòng thủ nhưng cũng thể hiện sự tự tin và chuyên nghiệp. Mẹo: Đừng khoanh tay quá chặt. Hãy khoanh lỏng, đẩy ngực ra và đảm bảo nhìn thấy bàn tay để tránh cảm giác bị cắt cụt chi.'
  },
  {
    id: 'walking-away',
    title: 'Bước đi ngoái nhìn',
    category: 'casual',
    svg: `<svg viewBox="0 0 100 200"><circle cx="40" cy="30" r="15"/><line x1="40" y1="45" x2="50" y2="110"/><line x1="40" y1="60" x2="20" y2="80"/><line x1="40" y1="60" x2="70" y2="80"/><line x1="50" y1="110" x2="30" y2="160"/><line x1="30" y1="160" x2="10" y2="180"/><line x1="50" y1="110" x2="60" y2="180"/></svg>`,
    desc: 'Chủ thể giả vờ bước đi ra xa ống kính và quay đầu nhìn lại. Tư thế này đưa vào sự chuyển động (Motion), kết hợp với góc chụp từ phía sau hoặc ngang lưng tạo ra cảm giác kể chuyện (Storytelling) cực kỳ lãng mạn và tự nhiên.'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('pose-grid');
  const filters = document.querySelectorAll('.filter-btn');
  const modal = document.getElementById('pose-modal');
  const btnClose = document.getElementById('modal-close');

  const modTitle = document.getElementById('modal-title');
  const modSvg = document.getElementById('modal-svg');
  const modDesc = document.getElementById('modal-desc');

  // Render function
  function renderGrid(filterCat) {
    grid.innerHTML = '';
    
    const filteredData = filterCat === 'all' 
      ? POSE_DATABASE 
      : POSE_DATABASE.filter(p => p.category === filterCat);

    filteredData.forEach(pose => {
      const card = document.createElement('div');
      card.className = 'pose-card';
      card.innerHTML = `
        <div class="pose-svg-container">
          ${pose.svg}
        </div>
        <div class="pose-info">
          <div class="pose-tag">${getCatLabel(pose.category)}</div>
          <div class="pose-title">${pose.title}</div>
        </div>
      `;
      
      card.addEventListener('click', () => {
        openModal(pose);
      });

      grid.appendChild(card);
    });
  }

  function getCatLabel(cat) {
    const map = {
      'power': 'Quyền lực',
      'feminine': 'Nữ tính',
      'casual': 'Tự nhiên',
      'portrait': 'Chân dung'
    };
    return map[cat] || cat;
  }

  // Initial render
  renderGrid('all');

  // Filter events
  filters.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filters.forEach(f => f.classList.remove('active'));
      e.target.classList.add('active');
      renderGrid(e.target.dataset.filter);
    });
  });

  // Modal events
  function openModal(pose) {
    modTitle.textContent = pose.title;
    modSvg.innerHTML = pose.svg;
    modDesc.textContent = pose.desc;
    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
  }

  btnClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if(e.target === modal) closeModal();
  });
});
