document.addEventListener('DOMContentLoaded', () => {
  // Fake loading stats from localStorage
  let articlesRead = localStorage.getItem('lumenforge_read') || 0;
  let lastScore = localStorage.getItem('lumenforge_lastScore') || null;
  
  // Update Progress
  const totalArticles = 46;
  const readCountEl = document.getElementById('read-count');
  if (readCountEl) readCountEl.textContent = articlesRead;
  const pct = Math.min(100, Math.round((articlesRead / totalArticles) * 100));
  setTimeout(() => {
    const pBar = document.getElementById('read-progress');
    if (pBar) pBar.style.width = pct + '%';
  }, 500);

  // Rank & XP Logic
  let currentXP = parseInt(localStorage.getItem('lumenforge_xp') || '0', 10);
  const xpEl = document.getElementById('user-xp');
  if (xpEl) xpEl.textContent = currentXP + ' XP';

  const rankEl = document.getElementById('user-rank');
  if (rankEl) {
    if (currentXP >= 1500) rankEl.textContent = 'Rank: Director of Photography';
    else if (currentXP >= 500) rankEl.textContent = 'Rank: Advanced Shooter';
    else rankEl.textContent = 'Rank: Novice';
  }

  // Avatar letter
  const avatarEl = document.getElementById('user-avatar');
  if(avatarEl) avatarEl.textContent = 'C';

  // Quiz Stats
  if (lastScore) {
    const qScore = document.getElementById('quiz-score');
    if (qScore) qScore.textContent = lastScore + ' / 10';
    let title = 'Tân binh';
    if (lastScore >= 9) title = 'Bậc thầy Ánh sáng';
    else if (lastScore >= 6) title = 'Thợ săn bóng tối';
    const qTitle = document.getElementById('quiz-title');
    if(qTitle) qTitle.textContent = title;
  }

  // Reset
  const btnReset = document.getElementById('btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if(confirm('Toàn bộ dữ liệu tiến độ sẽ bị xóa. Tiếp tục?')) {
        localStorage.clear();
        location.reload();
      }
    });
  }

  // Load Bookmarks
  const bookmarkList = document.getElementById('bookmark-list');
  if (bookmarkList) {
    const bookmarks = JSON.parse(localStorage.getItem('lumenforge_bookmarks') || '[]');
    if (bookmarks.length > 0) {
      bookmarkList.innerHTML = ''; // clear dummy
      bookmarks.forEach(b => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="shot-recipes.html" style="color: var(--accent-amber); text-decoration: none;">▶ ${b.title}</a>`;
        bookmarkList.appendChild(li);
      });
    } else {
      bookmarkList.innerHTML = '<li style="color: var(--text-dim); font-style: italic;">Bạn chưa lưu công thức nào.</li>';
    }
  }

  // --- THE DIRECTOR'S BINDER (Phase 49) ---
  const btnExportJson = document.getElementById('btn-export-json');
  const btnPrintBinder = document.getElementById('btn-print-binder');

  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      // Collect data (dummy for demonstration, real app would get from other pages via localStorage)
      const projectData = {
        projectName: "LumenForge Masterpiece",
        date: new Date().toISOString(),
        settings: {
          lens: localStorage.getItem('lf_lens') || "35mm f/1.4",
          colorPalette: ["#1a2b3c", "#f34b21", "#e3e3e3"],
          lightingRatio: "4:1"
        },
        progress: {
          articlesRead: articlesRead,
          quizScore: lastScore
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "LumenForge_Project.json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });
  }

  if (btnPrintBinder) {
    btnPrintBinder.addEventListener('click', () => {
      // In a real app, this would generate a PDF or open a printable page.
      // Here we just trigger window.print() after a tiny visual change.
      alert('Chuẩn bị xuất PDF Binder...');
      window.print();
    });
  }

});
