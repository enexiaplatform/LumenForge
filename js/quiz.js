/**
 * LUMENFORGE — Mastery Quiz Logic
 * Scientific & Aesthetic Light Intelligence Test
 */

const QUESTIONS = [
  {
    id: 1,
    category: 'QUANG HỌC (OPTICS)',
    question: 'Theo Định luật Bình phương Nghịch đảo (Inverse Square Law), nếu khoảng cách từ nguồn sáng đến chủ thể tăng gấp 3 lần, cường độ ánh sáng chiếu tới chủ thể sẽ giảm đi bao nhiêu lần?',
    options: [
      { text: 'Giảm 3 lần', isCorrect: false },
      { text: 'Giảm 6 lần', isCorrect: false },
      { text: 'Giảm 9 lần', isCorrect: true },
      { text: 'Giảm 12 lần', isCorrect: false }
    ]
  },
  {
    id: 2,
    category: 'TÍNH CÁCH ỐNG KÍNH',
    question: 'Hiện tượng Bokeh hình bầu dục (Oval Bokeh) và vệt lóa ngang màu xanh dương đặc trưng là đặc tính quang học của loại thấu kính nào?',
    options: [
      { text: 'Thấu kính mắt cá (Fisheye Lens)', isCorrect: false },
      { text: 'Thấu kính biến hình (Anamorphic Lens)', isCorrect: true },
      { text: 'Thấu kính tiêu cự dài (Telephoto Lens)', isCorrect: false },
      { text: 'Thấu kính hiển vi (Macro Lens)', isCorrect: false }
    ]
  },
  {
    id: 3,
    category: 'VẬT LÝ ÁNH SÁNG & CHỤP ẢNH',
    question: 'Khi chụp chân dung ngược sáng mạnh dưới nắng gắt, để làm sáng khuôn mặt chủ thể mà không làm cháy (overexpose) bầu trời nền phía sau, kỹ thuật nào sau đây là tối ưu?',
    options: [
      { text: 'Nâng ISO của máy ảnh lên cực cao', isCorrect: false },
      { text: 'Mở rộng khẩu độ ống kính tối đa (f/1.2)', isCorrect: false },
      { text: 'Sử dụng đèn Flash hỗ trợ tính năng HSS (High Speed Sync)', isCorrect: true },
      { text: 'Giảm tốc độ màn trập xuống 1/10 giây', isCorrect: false }
    ]
  },
  {
    id: 4,
    category: 'ĐIỆN ẢNH (CINEMA LIGHTING)',
    question: 'Trong thiết kế ánh sáng điện ảnh, thuật ngữ "Motivated Lighting" (Ánh sáng có động cơ) được hiểu là gì?',
    options: [
      { text: 'Sử dụng đèn có công suất cực mạnh để tạo kịch tính cho cảnh phim', isCorrect: false },
      { text: 'Thiết kế nguồn sáng nhân tạo mô phỏng hướng, cường độ và màu sắc của một nguồn sáng thực tế trong bối cảnh (ví dụ: cửa sổ, đèn bàn, ngọn nến)', isCorrect: true },
      { text: 'Sử dụng các giá treo đèn tự động di chuyển theo bước đi của nhân vật', isCorrect: false },
      { text: 'Thiết lập ánh sáng chỉ tập trung rọi vào nhân vật chính và để tối toàn bộ hậu cảnh', isCorrect: false }
    ]
  },
  {
    id: 5,
    category: 'LÝ THUYẾT MÀU SẮC',
    question: 'Tông màu "Teal & Orange" kinh điển trong phim Hollywood dựa trên nguyên lý phối màu tương phản nào trên bánh xe màu sắc (Color Wheel)?',
    options: [
      { text: 'Phối màu tương đồng (Analogous)', isCorrect: false },
      { text: 'Phối màu bổ túc trực tiếp (Complementary)', isCorrect: true },
      { text: 'Phối màu tam giác đều (Triadic)', isCorrect: false },
      { text: 'Phối màu đơn sắc (Monochromatic)', isCorrect: false }
    ]
  },
  {
    id: 6,
    category: 'CẢM BIẾN & XỬ LÝ HÌNH ẢNH',
    question: 'Tại sao khi quay phim bằng hệ màu Log Profile (như S-Log, C-Log, D-Log) hình ảnh gốc luôn trông nhạt nhẽo, đục và thiếu tương phản?',
    options: [
      { text: 'Do cảm biến của máy quay bị quá nhiệt trong quá trình xử lý', isCorrect: false },
      { text: 'Để nén dữ liệu phân bố độ sáng theo đường cong logarit, giúp tối đa hóa dải động (Dynamic Range) ghi nhận được từ vùng tối đến vùng sáng', isCorrect: true },
      { text: 'Để giảm thiểu điện năng tiêu thụ cho chip xử lý hình ảnh', isCorrect: false },
      { text: 'Để làm mịn da nhân vật và tăng độ sắc nét tự nhiên ở rìa thấu kính', isCorrect: false }
    ]
  },
  {
    id: 7,
    category: 'KỸ THUẬT ĐIỆN ẢNH',
    question: 'Quy tắc "Shutter Angle 180 độ" khuyên người quay phim thiết lập tốc độ màn trập (Shutter Speed) như thế nào?',
    options: [
      { text: 'Tốc độ màn trập bằng đúng tốc độ khung hình (1 / Frame Rate)', isCorrect: false },
      { text: 'Tốc độ màn trập gấp đôi tốc độ khung hình (1 / (2 * Frame Rate))', isCorrect: true },
      { text: 'Tốc độ màn trập bằng một nửa tốc độ khung hình (1 / (0.5 * Frame Rate))', isCorrect: false },
      { text: 'Tốc độ màn trập cố định ở mức 1/180 giây bất kể tốc độ khung hình', isCorrect: false }
    ]
  },
  {
    id: 8,
    category: 'THIẾT KẾ ÁNH SÁNG',
    question: 'Kỹ thuật "Negative Fill" (Lấp đầy âm) trong studio nhằm mục đích gì?',
    options: [
      { text: 'Sử dụng các tấm phản sáng để bù thêm ánh sáng vào vùng tối của chủ thể', isCorrect: false },
      { text: 'Sử dụng các tấm hấp thụ ánh sáng màu đen (như cờ đen, vải nhung) để triệt tiêu ánh sáng phản xạ lạc, làm sâu bóng tối và tăng độ nổi khối', isCorrect: true },
      { text: 'Đo sáng vào điểm sáng nhất của bối cảnh để tránh bị cháy chi tiết', isCorrect: false },
      { text: 'Đặt thêm một nguồn sáng yếu ở phía sau để tách chủ thể khỏi nền', isCorrect: false }
    ]
  },
  {
    id: 9,
    category: 'VẬT LÝ CẢM BIẾN (SENSORS)',
    question: 'Cảm biến CMOS thường gặp lỗi "Jello effect" (méo hình dạng khi chuyển động nhanh hoặc lia máy) do cơ chế đọc dữ liệu nào khác biệt so với cảm biến CCD?',
    options: [
      { text: 'CMOS đọc dữ liệu bằng cách quét tuần tự từng dòng pixel (Rolling Shutter), trong khi CCD phơi sáng và đọc toàn bộ cảm biến cùng lúc (Global Shutter)', isCorrect: true },
      { text: 'CMOS nhạy sáng kém hơn cảm biến CCD rất nhiều lần ở vùng tối', isCorrect: false },
      { text: 'CMOS tiêu tốn nhiều năng lượng và tỏa nhiệt cao hơn CCD', isCorrect: false },
      { text: 'Cảm biến CMOS chỉ thu nhận tín hiệu đen trắng và phải tái tạo màu giả lập', isCorrect: false }
    ]
  },
  {
    id: 10,
    category: 'PHỐI CẢNH & THẤU KÍNH',
    question: 'Bản chất việc thay đổi tiêu cự ống kính (Zoom) thực tế KHÔNG tự bóp méo hình dạng khuôn mặt. Yếu tố cốt lõi gây ra hiện tượng bóp méo phối cảnh (perspective distortion) là gì?',
    options: [
      { text: 'Lớp phủ hóa học (Coating) trên các thấu kính', isCorrect: false },
      { text: 'Khoảng cách vật lý thực tế từ máy ảnh đến chủ thể', isCorrect: true },
      { text: 'Độ lớn khẩu độ vật lý được thiết lập trên ống kính', isCorrect: false },
      { text: 'Kích thước vật lý của cảm biến ảnh (Full Frame hay Crop)', isCorrect: false }
    ]
  }
];

let currentQuestionIndex = 0;
let score = 0;
let selectedOptionIndex = null;

function startQuiz() {
  document.getElementById('quiz-welcome').style.display = 'none';
  document.getElementById('quiz-active').style.display = 'block';
  currentQuestionIndex = 0;
  score = 0;
  loadQuestion();
}

function loadQuestion() {
  selectedOptionIndex = null;
  document.getElementById('btn-next-question').disabled = true;
  
  const qData = QUESTIONS[currentQuestionIndex];
  
  // Update progress
  document.getElementById('q-step-text').textContent = `Câu hỏi ${currentQuestionIndex + 1} / ${QUESTIONS.length}`;
  document.getElementById('q-category-text').textContent = `[${qData.category}]`;
  
  const progressPct = ((currentQuestionIndex) / QUESTIONS.length) * 100;
  document.getElementById('quiz-progress-bar').style.width = `${progressPct}%`;
  
  // Set question title
  document.getElementById('question-title-text').textContent = qData.question;
  
  // Render options
  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';
  
  const letters = ['A', 'B', 'C', 'D'];
  qData.options.forEach((opt, idx) => {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.innerHTML = `
      <div class="option-letter">${letters[idx]}</div>
      <div style="flex: 1;">${opt.text}</div>
    `;
    card.addEventListener('click', () => selectOption(idx, card));
    optionsContainer.appendChild(card);
  });
}

function selectOption(index, cardElement) {
  // Clear previous selections
  document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
  
  // Mark selected
  cardElement.classList.add('selected');
  selectedOptionIndex = index;
  
  // Enable next button
  document.getElementById('btn-next-question').disabled = false;
}

function nextQuestion() {
  if (selectedOptionIndex === null) return;
  
  // Check answer
  const qData = QUESTIONS[currentQuestionIndex];
  if (qData.options[selectedOptionIndex].isCorrect) {
    score++;
  }
  
  currentQuestionIndex++;
  
  if (currentQuestionIndex < QUESTIONS.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  document.getElementById('quiz-active').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'block';
  
  // Update score display
  document.getElementById('res-score').textContent = `${score} / ${QUESTIONS.length}`;
  
  // Calculate Rank
  let rankStr = 'Novice';
  let badgeClass = 'badge-novice';
  let desc = '';
  
  if (score >= 9) {
    rankStr = 'Director of Photography';
    badgeClass = 'badge-dop';
    desc = 'Xuất sắc! Bạn đã chứng minh sự hiểu biết sâu sắc và toàn diện về cơ học ánh sáng cũng như nghệ thuật tạo hình điện ảnh. Rất xứng đáng danh hiệu Director of Photography!';
  } else if (score >= 5) {
    rankStr = 'Advanced Shooter';
    badgeClass = 'badge-advanced';
    desc = 'Rất tốt! Bạn nắm vững các nguyên lý quan học và ánh sáng cơ bản. Hãy nghiên cứu thêm ở mục Light Codex để bứt phá lên hàng chuyên nghiệp nhé.';
  } else {
    rankStr = 'Novice';
    badgeClass = 'badge-novice';
    desc = 'Hành trình vạn dặm bắt đầu từ bước chân đầu tiên. Hãy dành thêm thời gian đọc các bài viết cơ bản trong Light Codex để củng cố nền tảng kiến thức.';
  }
  
  const badgeEl = document.getElementById('res-badge');
  badgeEl.textContent = `Rank: ${rankStr}`;
  badgeEl.className = `result-badge ${badgeClass}`;
  
  document.getElementById('res-desc').textContent = desc;
  
  // Calculate and display XP
  const xpGained = score * 20;
  document.getElementById('res-xp').textContent = `+${xpGained} XP`;
  
  // Save results to localStorage
  localStorage.setItem('lf_quiz_score', `${score}/${QUESTIONS.length}`);
  localStorage.setItem('lf_quiz_title', rankStr);
}

function restartQuiz() {
  document.getElementById('quiz-results').style.display = 'none';
  startQuiz();
}
