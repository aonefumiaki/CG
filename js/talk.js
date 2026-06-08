// ============================================================
//  トークテーマ・ルーレット
//  ジャンルを選んで「回す」と、会話のお題がランダムで出ます。
//  お題は下の CATS で自由に増やせます。
// ============================================================
(function () {
  const CATS = {
    'おまかせ': null,
    '定番': [
      '最近ハマっていることは？', '休みの日は何をして過ごす？', '最近行ってよかったお店は？',
      '好きな食べ物トップ3は？', '子どもの頃の夢は？', '最近うれしかった出来事は？',
      '行ってみたい場所は？', '好きな季節とその理由は？', '最近ちょっと笑ったことは？',
      '今のマイブームは？', '朝型？それとも夜型？', 'インドア派？アウトドア派？',
    ],
    '深い質問': [
      '人生で一番の贅沢は？', '今までで一番の決断は？', '10年後どうなっていたい？',
      '自分を動物に例えると？', '大切にしている言葉は？', 'もし宝くじが当たったら何に使う？',
      '生まれ変わったら何になりたい？', '一番影響を受けた人は？', '今、頑張っていることは？',
      '幸せを感じる瞬間は？',
    ],
    '恋愛・好み': [
      '好きなタイプは？', '初恋はいつ頃？', '理想のデートは？', 'ドキッとする仕草は？',
      '言われて嬉しい言葉は？', '年上派？それとも年下派？', '一目惚れは信じる？',
      'デートで行きたい場所は？', 'ギャップに弱いところは？',
    ],
    'ちょっと笑える': [
      '最近やらかした失敗談は？', '隠れた特技は？', '実はちょっと苦手なものは？',
      'カラオケの十八番は？', 'ちょっと変な癖ある？', '子どもの頃のあだ名は？',
      '人には言えないこだわりは？', '最近の "やっちゃった" は？',
    ],
    'お店・お酒ネタ': [
      '初めて飲んだお酒は？', '好きなお酒・カクテルは？', '宇部のおすすめスポットは？',
      'お酒での失敗談は？', '締めに食べたいものは？', '行きつけのお店は？',
      '一緒に飲みたい有名人は？', '今日はどんな一日だった？',
    ],
  };

  function allTopics() {
    let a = [];
    for (const k in CATS) { if (CATS[k]) a = a.concat(CATS[k].map(t => ({ t: t, cat: k }))); }
    return a;
  }

  function init() {
    const catsEl = document.getElementById('talk-cats');
    if (!catsEl) return;
    const themeEl = document.getElementById('talk-theme');
    const labelEl = document.getElementById('talk-label');
    const spinBtn = document.getElementById('talk-spin');

    let selected = 'おまかせ', spinning = false;

    Object.keys(CATS).forEach(cat => {
      const b = document.createElement('button');
      b.className = 'talk-cat' + (cat === 'おまかせ' ? ' active' : '');
      b.textContent = cat;
      b.onclick = () => {
        selected = cat;
        catsEl.querySelectorAll('.talk-cat').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      };
      catsEl.appendChild(b);
    });

    function pool() {
      return selected === 'おまかせ' ? allTopics() : CATS[selected].map(t => ({ t: t, cat: selected }));
    }

    function spin() {
      if (spinning) return;
      const p = pool();
      if (!p.length) return;
      spinning = true;
      spinBtn.disabled = true;
      themeEl.classList.remove('placeholder');

      let ticks = 0;
      const total = 15;
      const iv = setInterval(() => {
        const it = p[Math.floor(Math.random() * p.length)];
        themeEl.textContent = it.t;
        labelEl.textContent = it.cat;
        ticks++;
        if (ticks >= total) {
          clearInterval(iv);
          let fin;
          do { fin = p[Math.floor(Math.random() * p.length)]; } while (p.length > 1 && fin.t === themeEl.textContent);
          themeEl.textContent = fin.t;
          labelEl.textContent = fin.cat;
          spinning = false;
          spinBtn.disabled = false;
          spinBtn.textContent = 'もう一度回す';
        }
      }, 70);
    }

    spinBtn.addEventListener('click', spin);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
