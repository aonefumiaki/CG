// ============================================================
//  ジェスチャー当て（Heads Up! タップ版）
//  額にスマホを当て、お題を見た周りがジェスチャー、持ち主が当てる。
//  画面タップ＝正解／パスボタン＝スキップ。制限時間60秒。
//  お題は下の CATS で自由に増やせます。
// ============================================================
(function () {
  const CATS = {
    'おまかせ': null,
    '動物': ['ぞう','きりん','ペンギン','ライオン','うさぎ','ねこ','いぬ','ゴリラ','へび','かえる','たこ','パンダ','コアラ','フラミンゴ','カンガルー','ナマケモノ'],
    '食べ物・飲み物': ['ラーメン','寿司','たこ焼き','ハンバーガー','アイス','うどん','カレー','ピザ','ポップコーン','シャンパン','焼き鳥','餃子','バナナ','わたあめ'],
    '有名人・キャラ': ['アンパンマン','ピカチュウ','マリオ','ドラえもん','スーパーマン','忍者','サンタクロース','力士','アイドル','魔法使い','警察官','宇宙人'],
    'スポーツ・動作': ['サッカー','野球','ボクシング','水泳','ゴルフ','ダンス','縄跳び','ヨガ','釣り','スキー','自撮り','筋トレ','あくび','くしゃみ'],
    '宇部・お店ネタ': ['乾杯','ウイスキー','山崎','白州','カラオケ','二日酔い','シャンパンタワー','常連さん','同伴','おしぼり','カウガール','ハイボール','送迎','看板娘'],
  };
  const TIME = 60;

  function allWords() {
    let a = [];
    for (const k in CATS) { if (CATS[k]) a = a.concat(CATS[k]); }
    return a;
  }

  function init() {
    const catsEl = document.getElementById('hu-cats');
    if (!catsEl) return;
    const setupEl = document.getElementById('hu-setup');
    const endEl = document.getElementById('hu-end');
    const screenEl = document.getElementById('hu-screen');
    const wordEl = document.getElementById('hu-word');
    const timerEl = document.getElementById('hu-timer');
    const scoreTopEl = document.getElementById('hu-scoretop');

    let selectedCat = 'おまかせ';
    let deck = [], results = [], score = 0, timeLeft = TIME, timerId = null, locked = false, playing = false;

    Object.keys(CATS).forEach(cat => {
      const b = document.createElement('button');
      b.className = 'hu-cat' + (cat === 'おまかせ' ? ' active' : '');
      b.textContent = cat;
      b.onclick = () => {
        selectedCat = cat;
        catsEl.querySelectorAll('.hu-cat').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      };
      catsEl.appendChild(b);
    });

    function shuffle(a) {
      a = a.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
      return a;
    }
    function buildDeck() {
      const base = selectedCat === 'おまかせ' ? allWords() : CATS[selectedCat];
      deck = shuffle(base);
    }
    function nextWord() {
      if (!deck.length) buildDeck();
      wordEl.textContent = deck.pop();
    }

    function mark(ok) {
      if (locked || !playing) return;
      const w = wordEl.textContent;
      results.push({ word: w, ok: ok });
      if (ok) score++;
      scoreTopEl.textContent = score;
      locked = true;
      screenEl.classList.add(ok ? 'ok' : 'pass');
      wordEl.textContent = ok ? '正解！' : 'パス';
      setTimeout(() => {
        screenEl.classList.remove('ok', 'pass');
        if (playing) nextWord();
        locked = false;
      }, 350);
    }

    function start() {
      score = 0; results = []; timeLeft = TIME; locked = true; playing = false;
      buildDeck();
      setupEl.style.display = 'none';
      endEl.style.display = 'none';
      scoreTopEl.textContent = '0';
      timerEl.textContent = TIME;
      screenEl.classList.add('show');
      let c = 3;
      wordEl.textContent = c;
      const cd = setInterval(() => {
        c--;
        if (c > 0) { wordEl.textContent = c; }
        else { clearInterval(cd); beginPlay(); }
      }, 800);
    }

    function beginPlay() {
      playing = true; locked = false;
      nextWord();
      timeLeft = TIME; timerEl.textContent = timeLeft;
      timerId = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) endGame();
      }, 1000);
    }

    function endGame() {
      playing = false; clearInterval(timerId);
      screenEl.classList.remove('show', 'ok', 'pass');
      document.getElementById('hu-score').textContent = score;
      const list = document.getElementById('hu-results');
      list.innerHTML = results.length
        ? results.map(r => '<li><span>' + r.word + '</span><span class="' + (r.ok ? 'ok' : 'ng') + '">' + (r.ok ? '○ 正解' : '× パス') + '</span></li>').join('')
        : '<li><span style="color:var(--muted)">お題なし</span></li>';
      endEl.style.display = 'block';
      endEl.scrollIntoView({ behavior: 'smooth' });
    }

    screenEl.addEventListener('click', () => mark(true));
    document.getElementById('hu-pass').addEventListener('click', e => { e.stopPropagation(); mark(false); });
    document.getElementById('hu-start').addEventListener('click', start);
    document.getElementById('hu-retry').addEventListener('click', () => {
      endEl.style.display = 'none';
      setupEl.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
