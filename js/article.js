/**
 * LUMENFORGE ARTICLE LOGIC
 * Handles Read Tracking and Bookmarking
 */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lfAuth === 'undefined') return;

    const articleTitleEl = document.querySelector('h1');
    if (!articleTitleEl) return;

    const articleTitle = articleTitleEl.innerText;
    // Simple id generation from URL
    const articlePath = window.location.pathname;
    const articleId = articlePath.split('/').pop().replace('.html', '');
    const articleData = { id: articleId, title: articleTitle, link: 'articles/' + articleId + '.html' };

    // --- 1. Float Bookmark Button ---
    const isBookmarked = lfAuth.isBookmarked(articleId);
    const bookmarkBtnHTML = `
        <button id="btn-bookmark" style="position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px; border-radius: 50%; background: var(--bg-card); border: 2px solid ${isBookmarked ? 'var(--accent-amber)' : 'var(--border-color)'}; color: ${isBookmarked ? 'var(--accent-amber)' : 'var(--text-secondary)'}; font-size: 1.5rem; cursor: pointer; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: all 0.3s ease;">
            ★
        </button>
    `;
    document.body.insertAdjacentHTML('beforeend', bookmarkBtnHTML);

    const btnBookmark = document.getElementById('btn-bookmark');
    btnBookmark.addEventListener('click', () => {
        if (!lfAuth.isLoggedIn()) {
            openAuthModal();
            return;
        }
        
        const res = lfAuth.toggleBookmark(articleId, articleData);
        if (res.success) {
            btnBookmark.style.borderColor = res.isBookmarked ? 'var(--accent-amber)' : 'var(--border-color)';
            btnBookmark.style.color = res.isBookmarked ? 'var(--accent-amber)' : 'var(--text-secondary)';
        }
    });

    // --- 2. Read Tracking ---
    let readTracked = false;
    window.addEventListener('scroll', () => {
        if (readTracked) return;
        
        // Check if user scrolled near bottom
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
            readTracked = true;
            if (lfAuth.isLoggedIn()) {
                lfAuth.markAsRead(articleId, articleData);
                console.log('Marked as read:', articleId);
            }
        }
    });
});
