// ============================================================
//  microCMS 連携
//  接続先を変えたいときは、下の serviceDomain と apiKey の
//  2か所だけ書き換えればOKです。
//  ※ この apiKey は「読み取り専用」です。公開されても他人が
//    内容を書き換えることはできません（編集は管理画面ログインが必須）。
// ============================================================
const MICROCMS = {
  serviceDomain: 'cowgirl',                              // https://cowgirl.microcms.io
  apiKey: '9umlwM64OfO72FMIjmn90bqqqaga34B3umt4',
};

const CMS_BASE = 'https://' + MICROCMS.serviceDomain + '.microcms.io/api/v1';

async function cmsGet(endpoint, query) {
  const url = CMS_BASE + '/' + endpoint + (query || '');
  const res = await fetch(url, { headers: { 'X-MICROCMS-API-KEY': MICROCMS.apiKey } });
  if (!res.ok) throw new Error('microCMS ' + endpoint + ' ' + res.status);
  return res.json();
}

// ── helpers ──
function nl2br(s) { return (s || '').replace(/\n/g, '<br>'); }
function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function setText(id, val) {
  const el = document.getElementById(id);
  if (el && val != null && val !== '') el.textContent = val;
}
function setHTML(id, val) {
  const el = document.getElementById(id);
  if (el && val != null && val !== '') el.innerHTML = nl2br(val);
}
function fmtDate(s) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return '';
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '.' + p(d.getMonth() + 1) + '.' + p(d.getDate());
}
function firstCategory(p) {
  return Array.isArray(p.category) && p.category.length ? p.category[0] : '';
}

// ── 店舗情報 ──
async function loadStore() {
  try {
    const d = await cmsGet('store');
    setText('site-info-name', d.name);
    setHTML('site-info-address', d.address);
    setText('site-info-hours', d.hours);
    setText('site-info-access', d.holiday);   // 定休日
    setText('site-info-dress', d.dress);
    setHTML('site-info-price', d.price);
    if (d.tel) {
      document.querySelectorAll('a[href^="tel:"]').forEach(a => a.setAttribute('href', 'tel:' + d.tel));
      const t = document.getElementById('site-info-tel-link');
      if (t) t.textContent = d.tel;
      document.querySelectorAll('.reservation-tel, .recruit-cta-tel').forEach(a => a.textContent = d.tel);
    }
    if (d.gmap) { const f = document.getElementById('site-gmap'); if (f) f.src = d.gmap; }
    if (d.instagram) document.querySelectorAll('a[href*="instagram.com"]').forEach(a => a.href = d.instagram);
    if (d.lineUrl) { const l = document.getElementById('line-float-link'); if (l) l.href = d.lineUrl; }
  } catch (e) { console.warn('store load failed', e); }
}

// ── コンセプト ──
async function loadConcept() {
  try {
    const d = await cmsGet('concept');
    setHTML('site-hero-sub', d.heroSub);
    setText('site-concept-title', d.title);   // ※ 見出しは1行テキストとして反映（斜体強調は無くなります）
    setText('site-concept-body', d.body);
    if (d.image && d.image.url) {
      const box = document.getElementById('site-concept-visual');
      if (box) {
        box.classList.add('has-image');
        const inner = box.querySelector('.concept-visual-inner');
        if (inner) inner.style.display = 'none';
        let img = document.getElementById('site-concept-image');
        if (!img) {
          img = document.createElement('img');
          img.id = 'site-concept-image';
          img.alt = 'Lounge Cow girl. 店内';
          box.insertBefore(img, box.firstChild);
        }
        img.src = d.image.url + '?fit=crop&w=900&h=1200';
      }
    }
  } catch (e) { console.warn('concept load failed', e); }
}

// ── お知らせバナー ──
async function loadNotice() {
  try {
    const d = await cmsGet('notice');
    const banner = document.getElementById('site-notice-banner');
    if (!banner) return;
    if (d && d.isActive && d.text) {
      const txt = document.getElementById('site-notice-text');
      if (txt) txt.textContent = d.text;
      banner.style.display = 'block';
    } else {
      banner.style.display = 'none';
    }
  } catch (e) { console.warn('notice load failed', e); }
}

// ── ブログ：カードHTML ──
function postCard(p) {
  const cat = firstCategory(p);
  const thumb = p.eyecatch && p.eyecatch.url
    ? '<img src="' + p.eyecatch.url + '?fit=crop&w=640&h=420" alt="">'
    : '<span class="post-card-noimg">Cow girl.</span>';
  return '<a class="post-card" href="article.html?id=' + encodeURIComponent(p.id) + '">' +
    '<div class="post-card-thumb">' + thumb + '</div>' +
    '<div class="post-card-body">' +
      '<div class="post-card-meta"><span class="post-card-date">' + fmtDate(p.publishedAt || p.createdAt) + '</span>' +
      (cat ? '<span class="post-card-cat">' + escapeHtml(cat) + '</span>' : '') + '</div>' +
      '<div class="post-card-title">' + escapeHtml(p.title) + '</div>' +
    '</div></a>';
}

// ── トップの最新記事（最大3件）──
async function loadHomeNews() {
  const wrap = document.getElementById('news-grid');
  if (!wrap) return;
  try {
    const d = await cmsGet('blog', '?limit=3&orders=-publishedAt');
    wrap.innerHTML = (d.contents && d.contents.length)
      ? d.contents.map(postCard).join('')
      : '<div class="news-empty">記事はまだありません。</div>';
  } catch (e) {
    wrap.innerHTML = '<div class="news-empty">記事を読み込めませんでした。</div>';
    console.warn('home news load failed', e);
  }
}

// ── ブログ一覧（blog.html）──
async function loadBlogList() {
  const wrap = document.getElementById('blog-grid');
  if (!wrap) return;
  try {
    const d = await cmsGet('blog', '?limit=100&orders=-publishedAt');
    wrap.innerHTML = (d.contents && d.contents.length)
      ? d.contents.map(postCard).join('')
      : '<div class="news-empty">記事はまだありません。</div>';
  } catch (e) {
    wrap.innerHTML = '<div class="news-empty">記事を読み込めませんでした。</div>';
    console.warn('blog list load failed', e);
  }
}

// ── 記事個別（article.html?id=xxx）──
async function loadArticle() {
  const wrap = document.getElementById('article');
  if (!wrap) return;
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { wrap.innerHTML = '<p class="news-empty">記事が見つかりません。</p>'; return; }
  try {
    const p = await cmsGet('blog', '/' + encodeURIComponent(id));
    const cat = firstCategory(p);
    document.title = p.title + ' — Lounge Cow girl.';
    const eyecatch = p.eyecatch && p.eyecatch.url
      ? '<img class="article-eyecatch" src="' + p.eyecatch.url + '?w=1200" alt="">'
      : '';
    wrap.innerHTML =
      '<div class="article-meta"><span>' + fmtDate(p.publishedAt || p.createdAt) + '</span>' +
        (cat ? '<span class="article-cat">' + escapeHtml(cat) + '</span>' : '') + '</div>' +
      '<h1 class="article-title">' + escapeHtml(p.title) + '</h1>' +
      eyecatch +
      '<div class="article-content">' + (p.content || '') + '</div>' +
      '<div class="article-back"><a href="blog.html">← 一覧へ戻る</a></div>';
  } catch (e) {
    wrap.innerHTML = '<p class="news-empty">記事を読み込めませんでした。</p>';
    console.warn('article load failed', e);
  }
}

// ── 初期化（各ページで必要なものだけ動く）──
document.addEventListener('DOMContentLoaded', () => {
  loadStore();
  loadConcept();
  loadNotice();
  loadHomeNews();
  loadBlogList();
  loadArticle();
});
