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

// ── スマホ用ハンバーガーメニュー（既存の <nav> から自動生成）──
function initMobileNav() {
  const nav = document.querySelector('nav');
  const links = nav && nav.querySelector('.nav-links');
  if (!nav || !links) return;

  // 三本線ボタン
  const btn = document.createElement('button');
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-label', 'メニューを開く');
  btn.innerHTML = '<span></span><span></span><span></span>';
  nav.appendChild(btn);

  // ドロップダウンメニュー（既存リンクを複製）
  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  const ul = document.createElement('ul');
  links.querySelectorAll('a').forEach(a => {
    const li = document.createElement('li');
    const na = document.createElement('a');
    na.href = a.getAttribute('href');
    na.textContent = a.textContent;
    na.addEventListener('click', () => document.body.classList.remove('nav-open'));
    li.appendChild(na);
    ul.appendChild(li);
  });
  menu.appendChild(ul);
  document.body.appendChild(menu);

  btn.addEventListener('click', () => document.body.classList.toggle('nav-open'));
}

window.addEventListener('load', () => {
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
  initLineFloat();
  initMobileNav();
});
