// ============================================================
//  公開ページのUI挙動
//  （コンテンツの読み込みは js/cms.js が担当します）
// ============================================================

// ── スクロールで要素をふわっと表示 ──
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });

// ── LINE追従ボタン：少しスクロールしたら表示 ──
function initLineFloat() {
  const btn = document.getElementById('line-float');
  if (!btn) return;
  let shown = false;
  window.addEventListener('scroll', () => {
    const threshold = window.innerHeight * 0.4;
    if (window.scrollY > threshold && !shown) {
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
      btn.style.pointerEvents = 'auto';
      shown = true;
    } else if (window.scrollY <= threshold && shown) {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(16px)';
      btn.style.pointerEvents = 'none';
      shown = false;
    }
  }, { passive: true });
}

window.addEventListener('load', () => {
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
  initLineFloat();
});
