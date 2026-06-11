/* ==========================================================================
   LUMENFORGE — Flashcards Logic (Spaced Repetition System)
   ========================================================================== */

const flashcardData = [
  // OPTICS
  { id: 'f1', deck: 'optics', tag: 'Quang học', q: 'Định nghĩa Focal Length (Tiêu cự) là gì?', a: 'Khoảng cách từ tâm quang học của ống kính đến cảm biến.', exp: 'Tính bằng mm. Nó quyết định Field of View (Góc nhìn) rộng hay hẹp.' },
  { id: 'f2', deck: 'optics', tag: 'Quang học', q: 'Hiện tượng Compression Distortion (Nén phối cảnh) xảy ra khi nào?', a: 'Khi sử dụng ống kính Telephoto và đứng ở khoảng cách RẤT XA chủ thể.', exp: 'Sự thật: Khoảng cách vật lý tạo ra nén phối cảnh, không phải bản thân ống kính. Telephoto chỉ phóng to phần bị nén đó.' },
  { id: 'f3', deck: 'optics', tag: 'Quang học', q: 'Độ sâu trường ảnh (DoF) bị ảnh hưởng bởi 3 yếu tố nào?', a: '1. Khẩu độ (Aperture), 2. Tiêu cự (Focal Length), 3. Khoảng cách lấy nét (Focus Distance).', exp: 'Càng mở khẩu, tiêu cự càng dài, và đứng càng gần chủ thể thì DoF càng mỏng (xóa phông mù mịt).' },
  { id: 'f4', deck: 'optics', tag: 'Quang học', q: 'Lens Breathing là gì?', a: 'Hiện tượng thay đổi nhẹ về góc nhìn (Field of View) khi xoay vòng lấy nét.', exp: 'Thường gây khó chịu trong quay phim vì khung hình bị phóng to/thu nhỏ ngoài ý muốn.' },

  // SENSOR
  { id: 'f5', deck: 'sensor', tag: 'Cảm biến', q: 'Bản chất vật lý của ISO là gì?', a: 'Khuyếch đại tín hiệu dòng điện (Signal Amplification) sau khi photon đập vào cảm biến.', exp: 'Tăng ISO không làm cảm biến thu nhiều ánh sáng hơn. Nó chỉ nhân lượng ánh sáng đang có lên, đồng thời nhân luôn cả Nhiễu (Noise).' },
  { id: 'f6', deck: 'sensor', tag: 'Cảm biến', q: 'ETTR (Expose To The Right) là chiến thuật gì?', a: 'Cố tình chụp sáng hơn bình thường (nhưng không cháy sáng) để tối đa hóa lượng ánh sáng thu được (Signal).', exp: 'Nhằm tăng cường Tỷ lệ Tín hiệu/Nhiễu (SNR), giúp file RAW cực kỳ sạch khi kéo tối lại ở hậu kỳ.' },
  { id: 'f7', deck: 'sensor', tag: 'Cảm biến', q: 'Dual Gain ISO hoạt động như thế nào?', a: 'Cảm biến có 2 mạch đọc tín hiệu. Một mạch ưu tiên DR (Base ISO 100) và một mạch ưu tiên khử Read Noise (Base ISO thứ 2, vd: 800).', exp: 'Đó là lý do ISO 800 trên một số máy có thể trong trẻo và sạch nhiễu hơn ISO 640.' },
  { id: 'f8', deck: 'sensor', tag: 'Cảm biến', q: 'Signal-to-Noise Ratio (SNR) là gì?', a: 'Tỷ lệ giữa Tín hiệu thực tế (Ánh sáng) và Tạp âm (Nhiễu).', exp: 'SNR càng cao, hình ảnh càng trong trẻo. SNR thấp, hình ảnh sẽ bị nhiễu hạt nghiêm trọng.' },

  // LIGHT
  { id: 'f9', deck: 'light', tag: 'Ánh sáng', q: 'Định luật Bình phương Nghịch đảo (Inverse Square Law) phát biểu gì?', a: 'Cường độ ánh sáng tỷ lệ nghịch với bình phương khoảng cách (I = 1/d²).', exp: 'Nếu lùi đèn ra xa gấp đôi (2x), lượng ánh sáng sẽ giảm đi 4 lần (mất 2 stops).' },
  { id: 'f10', deck: 'light', tag: 'Ánh sáng', q: 'High-Speed Sync (HSS) hoạt động như thế nào?', a: 'Đèn Flash đánh ra một chuỗi chớp nháy vi mô ở tốc độ cực cao, thay vì 1 chớp duy nhất.', exp: 'Cho phép bạn đánh flash ở tốc độ màn trập 1/4000s hoặc nhanh hơn, không bị dải đen, nhưng làm yếu đi cường độ của Flash rất nhiều.' },
  { id: 'f11', deck: 'light', tag: 'Ánh sáng', q: 'Chiaroscuro trong đánh sáng là gì?', a: 'Nghệ thuật sử dụng độ tương phản gắt giữa vùng sáng và vùng tối tuyệt đối.', exp: 'Bắt nguồn từ hội họa Phục Hưng. Giúp tạo hình khối nổi bật 3D và không khí kịch tính.' },
  { id: 'f12', deck: 'light', tag: 'Ánh sáng', q: 'Ánh sáng Falloff là gì?', a: 'Sự suy giảm ánh sáng diễn ra cực nhanh khi chủ thể ở gần nguồn sáng, và chậm lại khi ở xa.', exp: 'Đó là lý do tại sao chụp ở rìa một cửa sổ, người đứng gần sáng bừng nhưng người đứng sau một chút lại tối sầm.' }
];

// State
let currentDeck = 'all';
let cardsQueue = [];
let currentCard = null;

// DOM
const cardElement = document.getElementById('card-element');
const cardFrontTag = document.getElementById('card-front-tag');
const cardQuestion = document.getElementById('card-question');
const cardBackTag = document.getElementById('card-back-tag');
const cardAnswer = document.getElementById('card-answer');
const cardExplanation = document.getElementById('card-explanation');
const controls = document.getElementById('controls');
const progressBar = document.getElementById('progress-bar');
const deckSelector = document.getElementById('deck-selector');
const container = document.getElementById('card-container');
const deckCompleted = document.getElementById('deck-completed');
const progressContainer = document.getElementById('progress-container');

// Init
function initFlashcards() {
  // Bind deck buttons
  document.querySelectorAll('.deck-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.deck-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentDeck = e.target.dataset.deck;
      resetDeck();
    });
  });

  resetDeck();
}

function resetDeck() {
  container.style.display = 'block';
  deckCompleted.style.display = 'none';
  progressContainer.style.display = 'block';
  
  if (currentDeck === 'all') {
    cardsQueue = [...flashcardData];
  } else {
    cardsQueue = flashcardData.filter(c => c.deck === currentDeck);
  }

  // Shuffle array
  cardsQueue.sort(() => Math.random() - 0.5);
  updateProgressBar();
  loadNextCard();
}

function loadNextCard() {
  if (cardsQueue.length === 0) {
    showCompleted();
    return;
  }

  currentCard = cardsQueue[0]; // peek
  
  // Reset UI
  cardElement.classList.remove('is-flipped');
  controls.classList.remove('visible');
  
  // Set text
  cardFrontTag.innerText = currentCard.tag;
  cardQuestion.innerText = currentCard.q;
  cardAnswer.innerText = currentCard.a;
  cardExplanation.innerText = currentCard.exp;
}

function flipCard() {
  if (!cardElement.classList.contains('is-flipped')) {
    cardElement.classList.add('is-flipped');
    controls.classList.add('visible');
  }
}

function answerCard(confidence) {
  // Simple SRS queue logic
  const card = cardsQueue.shift(); // remove from front

  if (confidence === 'hard') {
    // Put back randomly in the first half of the queue to repeat soon
    const insertIndex = Math.max(1, Math.floor(Math.random() * (cardsQueue.length / 2)));
    cardsQueue.splice(insertIndex, 0, card);
  } else if (confidence === 'good') {
    // Put at the very end
    cardsQueue.push(card);
  } else {
    // Easy -> Do not put back in queue. Add XP!
    let xp = parseInt(localStorage.getItem('lumenforge_xp') || '0', 10);
    localStorage.setItem('lumenforge_xp', xp + 10);
  }

  updateProgressBar();
  
  // Flip back and load next immediately (could add animation delay)
  cardElement.classList.remove('is-flipped');
  controls.classList.remove('visible');
  
  setTimeout(() => {
    loadNextCard();
  }, 300);
}

function updateProgressBar() {
  const initialTotal = currentDeck === 'all' ? flashcardData.length : flashcardData.filter(c => c.deck === currentDeck).length;
  const completed = initialTotal - cardsQueue.length;
  const pct = Math.max(0, Math.min(100, (completed / initialTotal) * 100));
  progressBar.style.width = pct + '%';
}

function showCompleted() {
  container.style.display = 'none';
  controls.classList.remove('visible');
  progressContainer.style.display = 'none';
  deckCompleted.style.display = 'block';
}

// Start
document.addEventListener('DOMContentLoaded', initFlashcards);
