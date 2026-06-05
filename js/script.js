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

// ── 全ページ共通の追加チャーム（上部バー・ヘッダーCTA・フッター）──
var LINE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>';

function initSiteChrome() {
  // 上部情報バー
  if (!document.querySelector('.topbar')) {
    const bar = document.createElement('div');
    bar.className = 'topbar';
    bar.innerHTML = '<div class="topbar-inner">'
      + '<span class="hide-sp">会員制ラウンジ</span><span class="topbar-sep hide-sp">|</span>'
      + '<span>月〜土 20:00–0:00</span><span class="topbar-sep hide-sp">|</span>'
      + '<span class="hide-sp">山口県宇部市・中央町</span><span class="topbar-sep">|</span>'
      + '<a href="recruit.html" class="topbar-recruit">スタッフ募集中（未経験歓迎）</a>'
      + '</div>';
    document.body.insertBefore(bar, document.body.firstChild);
  }

  // ヘッダーCTA（スタッフ募集／LINE）
  const nav = document.querySelector('nav');
  if (nav && !nav.querySelector('.nav-cta')) {
    const cta = document.createElement('div');
    cta.className = 'nav-cta';
    cta.innerHTML = '<a href="recruit.html" class="nav-cta-recruit">スタッフ募集</a>'
      + '<a href="tel:0836-52-8997" class="nav-cta-line js-line-cta">' + LINE_ICON + 'LINE</a>';
    nav.appendChild(cta);
  }

  // 充実フッター
  const footer = document.querySelector('footer');
  if (footer && !footer.classList.contains('rich')) {
    footer.classList.add('rich');
    footer.innerHTML =
      '<div class="footer-main">'
      + '<div class="footer-brand"><div class="footer-logo">Cow girl.</div>'
      + '<p class="footer-blurb">山口県宇部市・中央町の会員制ラウンジ。白を基調にした、ナチュラルで上品な大人のくつろぎ空間。お酒が飲めなくても楽しめる、温かな夜を。</p></div>'
      + '<div class="footer-col"><div class="footer-col-h">Menu</div>'
      + '<a href="index.html#concept">コンセプト</a><a href="index.html#features">選ばれる理由</a><a href="recruit.html">採用情報</a><a href="blog.html">お知らせ</a><a href="index.html#info">アクセス</a></div>'
      + '<div class="footer-col"><div class="footer-col-h">Info</div>'
      + '<p>山口県宇部市中央町3丁目1-1 PLAZA19.III 2階</p><p>TEL 0836-52-8997</p><p>月〜土 20:00〜0:00／日祝休</p>'
      + '<a href="https://instagram.com/cow_girl.1201" target="_blank" rel="noopener">Instagram @cow_girl.1201</a></div>'
      + '</div>'
      + '<div class="footer-bottom"><a href="privacy.html">プライバシーポリシー</a>'
      + '<span>© 2026 Lounge Cow girl. — 運営：株式会社MORE</span>'
      + '<span>Ube, Yamaguchi, Japan</span></div>';
  }
}

// DOMはこの時点で解析済み（script は body 末尾）。cmsのLINE設定より先に差し込む。
initSiteChrome();

window.addEventListener('load', () => {
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
  initLineFloat();
  initMobileNav();
});
