/* ==========================================================================
   LUMENFORGE — Mastery Quiz Logic
   ========================================================================== */

const quizData = [
  {
    question: "Bạn đang chụp ngược sáng lúc 12h trưa. Bầu trời quá sáng nhưng nếu khép khẩu (f/16) thì chủ thể không mờ phông. Nếu mở khẩu (f/1.8), ảnh cháy sáng hoàn toàn vì tốc độ màn trập tối đa chỉ đạt 1/8000s. Giải pháp cơ học tốt nhất là gì?",
    options: [
      { text: "Tăng ISO lên để bù trừ", correct: false },
      { text: "Sử dụng Filter ND (Neutral Density)", correct: true },
      { text: "Bật chế độ High-Speed Sync (HSS)", correct: false },
      { text: "Đổi sang Lens góc rộng", correct: false }
    ],
    explanation: "Filter ND hoạt động như kính râm cho ống kính. Nó cản bớt ánh sáng đi vào cảm biến, cho phép bạn giữ nguyên khẩu độ f/1.8 mà không bị cháy sáng, thay vì phải thay đổi tốc độ màn trập."
  },
  {
    question: "Bạn đặt một đèn Key Light cách chủ thể 1 mét. Bức ảnh hoàn hảo. Sau đó bạn lùi đèn ra xa thành 2 mét. Theo Định luật Bình phương Nghịch đảo (Inverse Square Law), bạn đã mất đi bao nhiêu lượng ánh sáng?",
    options: [
      { text: "Mất đi 50% (1 stop)", correct: false },
      { text: "Mất đi 75% (2 stops)", correct: true },
      { text: "Mất đi 25% (0.5 stop)", correct: false },
      { text: "Không đổi nếu tăng ISO gấp đôi", correct: false }
    ],
    explanation: "I = 1/d². Khoảng cách tăng gấp đôi (2x), cường độ ánh sáng giảm đi 2² = 4 lần. Mất đi 4 lần tương đương với việc còn lại 25% ánh sáng (mất 75%)."
  },
  {
    question: "Màu da người (Skin tones) bất kể sắc tộc nào cũng nằm ở dải màu nào trên Color Wheel?",
    options: [
      { text: "Dải màu Vàng/Cam (Yellow/Orange)", correct: true },
      { text: "Dải màu Đỏ/Hồng (Red/Magenta)", correct: false },
      { text: "Dải màu Xanh lá (Green)", correct: false },
      { text: "Tùy thuộc vào sắc tộc", correct: false }
    ],
    explanation: "Sinh học cơ thể người khiến máu chảy dưới da tạo ra một phổ phản xạ ánh sáng luôn rơi vào dải Yellow/Orange (Hue 15-25 độ). Đây là lý do màu Teal (đối lập màu Cam) rất được Hollywood ưa chuộng để làm nổi bật diễn viên."
  },
  {
    question: "Trong đánh sáng Rembrandt, dấu hiệu nhận biết rõ ràng nhất trên khuôn mặt chủ thể là gì?",
    options: [
      { text: "Bóng đổ dưới mũi hình con bướm", correct: false },
      { text: "Một nửa khuôn mặt tối hoàn toàn", correct: false },
      { text: "Một tam giác ánh sáng ở má bên tối", correct: true },
      { text: "Viền sáng chạy dọc theo tóc", correct: false }
    ],
    explanation: "Tam giác Rembrandt (Rembrandt Triangle) xuất hiện dưới mắt của phần mặt khuất sáng, được tạo ra khi đèn Key Light đặt góc khoảng 45 độ ngang và 45 độ cao."
  },
  {
    question: "Tại sao ở khẩu độ cực nhỏ (như f/22), bức ảnh thực tế lại kém sắc nét hơn so với f/8?",
    options: [
      { text: "Do lỗi lấy nét (Focus shift)", correct: false },
      { text: "Do hiện tượng Nhiễu xạ ánh sáng (Diffraction)", correct: true },
      { text: "Do ống kính bị quang sai (Chromatic Aberration)", correct: false },
      { text: "Do cảm biến không nhận đủ photon", correct: false }
    ],
    explanation: "Khi lỗ khẩu quá nhỏ, sóng ánh sáng bị bẻ cong (Nhiễu xạ) khi đi qua rìa lá khẩu, tạo ra các vòng Airy chồng chéo lên nhau trên cảm biến, làm giảm độ sắc nét (sharpness)."
  }
];

// State
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let startTime;

// DOM
const screenIntro = document.getElementById('screen-intro');
const screenQuestion = document.getElementById('screen-question');
const screenResult = document.getElementById('screen-result');

const btnStart = document.getElementById('btn-start');
const btnNext = document.getElementById('btn-next');

const questionText = document.getElementById('question-text');
const optionsGrid = document.getElementById('options-grid');
const progressText = document.getElementById('progress-text');
const timerDisplay = document.getElementById('timer-display');

const feedbackBox = document.getElementById('feedback-box');
const feedbackText = document.getElementById('feedback-text');
const feedbackTitle = document.getElementById('feedback-title');

// Logic
btnStart.addEventListener('click', startQuiz);
btnNext.addEventListener('click', nextQuestion);

function startQuiz() {
  screenIntro.classList.remove('active');
  screenQuestion.classList.add('active');
  currentQuestionIndex = 0;
  score = 0;
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
  loadQuestion();
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  timerDisplay.innerText = `${m}:${s}`;
}

function loadQuestion() {
  const q = quizData[currentQuestionIndex];
  progressText.innerText = `Câu ${currentQuestionIndex + 1}/${quizData.length}`;
  questionText.innerText = q.question;
  
  optionsGrid.innerHTML = '';
  feedbackBox.classList.remove('active');
  btnNext.style.display = 'none';

  q.options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = opt.text;
    btn.onclick = () => handleAnswer(btn, opt.correct, q.explanation);
    optionsGrid.appendChild(btn);
  });
}

function handleAnswer(selectedBtn, isCorrect, explanation) {
  // Disable all buttons
  const allBtns = optionsGrid.querySelectorAll('.option-btn');
  allBtns.forEach(b => {
    b.onclick = null;
    b.style.cursor = 'default';
  });

  if (isCorrect) {
    selectedBtn.classList.add('correct');
    feedbackTitle.innerText = "CHÍNH XÁC!";
    feedbackTitle.style.color = "#2ecc71";
    score++;
  } else {
    selectedBtn.classList.add('wrong');
    feedbackTitle.innerText = "SAI RỒI!";
    feedbackTitle.style.color = "#e74c3c";
    
    // Highlight correct one
    const q = quizData[currentQuestionIndex];
    allBtns.forEach((b, idx) => {
      if (q.options[idx].correct) b.classList.add('correct');
    });
  }

  feedbackText.innerText = explanation;
  feedbackBox.classList.add('active');
  btnNext.style.display = 'inline-block';
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= quizData.length) {
    endQuiz();
  } else {
    loadQuestion();
  }
}

function endQuiz() {
  clearInterval(timerInterval);
  screenQuestion.classList.remove('active');
  screenResult.classList.add('active');

  document.getElementById('final-score').innerText = `Score: ${score}/${quizData.length}`;
  
  const titleEl = document.getElementById('archetype-title');
  const descEl = document.getElementById('archetype-desc');
  
  const ratio = score / quizData.length;
  
  if (ratio === 1) {
    titleEl.innerText = "THE LUMEN MASTER";
    descEl.innerText = "Điểm tuyệt đối. Bạn hoàn toàn làm chủ vật lý ánh sáng, thấu hiểu hình khối và màu sắc như một đạo diễn hình ảnh (DoP) thực thụ ở đẳng cấp Hollywood.";
  } else if (ratio >= 0.8) {
    titleEl.innerText = "THE ARCHITECT";
    descEl.innerText = "Rất xuất sắc. Bạn hiểu rõ cách ánh sáng tương tác với vật thể. Bạn không chỉ chụp ảnh, bạn thiết kế nó bằng sự tính toán logic.";
  } else if (ratio >= 0.5) {
    titleEl.innerText = "THE EXPLORER";
    descEl.innerText = "Bạn có kiến thức nền tảng tốt nhưng đôi khi còn dựa dẫm vào bản năng thay vì lý thuyết. Hãy đọc thêm Light Codex để mài giũa giác quan.";
  } else {
    titleEl.innerText = "THE NOVICE";
    descEl.innerText = "Khởi đầu nan. Bạn vẫn đang đấu tranh với tam giác phơi sáng. Hãy bắt đầu từ chương 1 của The Light Codex để nắm bắt cốt lõi.";
  }
}
