// ============================================================
//  文字シャッフル ゲーム
//  お題の文字をバラバラに並べ、お客様に元の言葉を当ててもらう遊びです。
//  「おまかせ出題」用のお題リストは下の PHRASES を自由に増やせます。
// ============================================================
(function () {
  const PHRASES = [
    'また会いたくなる人',
    '今日のあなたは素敵です',
    '星がきれいな夜ですね',
    '笑顔が一番の魅力',
    'もう一杯いかがですか',
    '秘密にしておきたい話',
    '宇部の夜は長い',
    '桜が咲きました',
    'ありがとうの気持ち',
    '運命の出会いかも',
    '君に乾杯',
    'また明日も頑張ろう',
    '内緒のおはなし',
    '素敵な時間をありがとう',
    'お酒より酔いそうです',
    '今宵はゆっくりと',
    '白州とソーダ',
    '夜空に乾杯',
    'あなたに夢中です',
    'おかえりなさい',
    'また来てくださいね',
    '今日もお疲れさま',
    'ちょっと一息つきましょう',
    '特別な夜にしましょう',
    '笑う門には福来る',
    '一期一会の出会い',
    'カウガールへようこそ',
    '乾杯しましょう',
  ];

  function init() {
    const src = document.getElementById('src');
    const poolEl = document.getElementById('pool');
    const pickedEl = document.getElementById('picked');
    const resultEl = document.getElementById('result');
    const countEl = document.getElementById('count');
    const answerEl = document.getElementById('answer');
    const setupEl = document.getElementById('setup');
    const playEl = document.getElementById('play');
    if (!src || !poolEl) return;

    let stripped = '';   // 空白を除いた正解
    let pool = [];       // 問題側に残っている文字
    let picked = [];     // 解答側に並べた文字

    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
      }
      return a;
    }

    function draw() {
      poolEl.innerHTML = '';
      pool.forEach(function (ch, i) {
        const t = document.createElement('div');
        t.className = 'game-tile';
        t.textContent = ch;
        t.addEventListener('click', function () {   // 問題 → 解答
          picked.push(pool.splice(i, 1)[0]);
          draw();
        });
        poolEl.appendChild(t);
      });

      pickedEl.innerHTML = '';
      picked.forEach(function (ch, i) {
        const t = document.createElement('div');
        t.className = 'game-tile';
        t.textContent = ch;
        t.addEventListener('click', function () {   // 解答 → 問題（戻す）
          pool.push(picked.splice(i, 1)[0]);
          draw();
        });
        pickedEl.appendChild(t);
      });

      resultEl.className = 'game-result';
      if (picked.length === Array.from(stripped).length && picked.length > 0) {
        if (picked.join('') === stripped) {
          resultEl.textContent = '正解！';
          resultEl.classList.add('ok');
          window.cgCelebrate && cgCelebrate.win('正解！');
        } else {
          resultEl.textContent = 'ちがうみたい…';
        }
      } else {
        resultEl.textContent = '';
      }
    }

    function deal() {
      let s = shuffle(Array.from(stripped));
      let tries = 0;
      while (s.join('') === stripped && tries++ < 20) { s = shuffle(Array.from(stripped)); }
      pool = s;
      picked = [];
      answerEl.classList.add('game-hidden');
      answerEl.innerHTML = '';
      draw();
    }

    function startGame(text) {
      const t = (text != null) ? text : src.value;
      if (!t.trim()) { src.focus(); return; }
      stripped = Array.from(t).filter(function (c) { return !/\s/.test(c); }).join('');
      src.value = '';   // 入力欄を空に（答えを残さない）
      countEl.textContent = Array.from(stripped).length + ' 文字';
      setupEl.classList.add('game-hidden');
      playEl.classList.remove('game-hidden');
      deal();
    }

    document.getElementById('shuffleBtn').addEventListener('click', function () { startGame(); });
    document.getElementById('randomBtn').addEventListener('click', function () {
      startGame(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
    });
    document.getElementById('reshuffleBtn').addEventListener('click', deal);
    document.getElementById('revealBtn').addEventListener('click', function () {
      answerEl.innerHTML = '正解：<b>' + stripped.replace(/</g, '&lt;') + '</b>';
      answerEl.classList.remove('game-hidden');
    });
    document.getElementById('newBtn').addEventListener('click', function () {
      stripped = ''; pool = []; picked = [];
      resultEl.textContent = '';
      playEl.classList.add('game-hidden');
      setupEl.classList.remove('game-hidden');
      src.focus();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
