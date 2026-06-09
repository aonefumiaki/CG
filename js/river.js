// ============================================================
//  川渡りパズル（市民と狼男）— イラスト版
//  ボートは最大2人・最低1人で移動。どちらの岸でも
//  「市民＜狼男（市民が0でない）」になったら失敗。全員を右岸へ渡せばクリア。
// ============================================================
(function () {
  function init() {
    var el = function (id) { return document.getElementById(id); };
    var tokL = el('tokL'); if (!tokL) return;
    var tokR = el('tokR'), tokB = el('tokB');
    var bankL = el('bankL'), bankR = el('bankR'), boatEl = el('boatEl');
    var statusEl = el('status'), movesEl = el('moves'), crossBtn = el('cross');
    var overlay = el('overlay'), scene = document.querySelector('#river .scene');
    var s;

    function reset() {
      s = { L: { w: 3, s: 3 }, R: { w: 0, s: 0 }, B: { w: 0, s: 0 }, side: 'L', over: false, win: false, moves: 0 };
      crossBtn.disabled = false;
      render();
    }
    function bankNow() { return s[s.side]; }
    function board(t) { if (s.over || s.win) return; if (s.B.w + s.B.s >= 2) return; if (bankNow()[t] <= 0) return; bankNow()[t]--; s.B[t]++; render(); }
    function unboard(t) { if (s.over || s.win) return; if (s.B[t] <= 0) return; s.B[t]--; bankNow()[t]++; render(); }
    function unsafe(b) { return b.s > 0 && b.w > b.s; }
    function cross() {
      if (s.over || s.win) return;
      if (s.B.w + s.B.s === 0) { statusEl.textContent = 'ボートに1人は乗せてください。'; return; }
      s.side = s.side === 'L' ? 'R' : 'L';
      s[s.side].w += s.B.w; s[s.side].s += s.B.s; s.B = { w: 0, s: 0 };
      s.moves++;
      if (unsafe(s.L) || unsafe(s.R)) s.over = true;
      else if (s.R.w === 3 && s.R.s === 3) s.win = true;
      render();
      if (s.over && scene) { scene.classList.remove('shake'); void scene.offsetWidth; scene.classList.add('shake'); }
    }

    function makeTok(type, tappable, onClick) {
      var d = document.createElement('div');
      d.className = 'tok' + (tappable ? '' : ' dim');
      d.innerHTML = '<span class="ic">' + (type === 'w' ? '🐺' : '🧑') + '</span><span class="lb">' + (type === 'w' ? '狼男' : '市民') + '</span>';
      if (tappable) d.addEventListener('click', onClick);
      return d;
    }
    function renderBank(container, obj, docked) {
      container.innerHTML = '';
      var t = docked && !s.over && !s.win;
      for (var i = 0; i < obj.w; i++) container.appendChild(makeTok('w', t, function () { board('w'); }));
      for (var j = 0; j < obj.s; j++) container.appendChild(makeTok('s', t, function () { board('s'); }));
    }
    function renderBoat() {
      tokB.innerHTML = '';
      var t = !s.over && !s.win;
      for (var i = 0; i < s.B.w; i++) tokB.appendChild(makeTok('w', t, function () { unboard('w'); }));
      for (var j = 0; j < s.B.s; j++) tokB.appendChild(makeTok('s', t, function () { unboard('s'); }));
    }
    function showOverlay(kind, title, msg, btn) {
      if (!overlay) return;
      overlay.className = 'river-overlay show ' + kind;
      overlay.innerHTML = '<div class="ov-title">' + title + '</div><div class="ov-msg">' + msg + '</div><button class="ov-btn">' + btn + '</button>';
      var b = overlay.querySelector('.ov-btn');
      if (b) b.addEventListener('click', reset);
    }
    function render() {
      renderBank(tokL, s.L, s.side === 'L');
      renderBank(tokR, s.R, s.side === 'R');
      renderBoat();
      bankL.classList.toggle('active', s.side === 'L');
      bankR.classList.toggle('active', s.side === 'R');
      boatEl.classList.toggle('right', s.side === 'R');
      movesEl.textContent = '手数: ' + s.moves;
      if (s.win) {
        statusEl.textContent = 'クリア！（手数 ' + s.moves + '）';
        statusEl.className = 'river-status win'; crossBtn.disabled = true;
        showOverlay('win', 'クリア！', '全員ぶじに右岸へ渡れました（手数 ' + s.moves + '）', 'もう一度あそぶ');
        window.cgCelebrate && cgCelebrate.win('クリア！');
      } else if (s.over) {
        statusEl.textContent = '失敗…';
        statusEl.className = 'river-status fail'; crossBtn.disabled = true;
        showOverlay('fail', '✕ 失敗', '市民が狼男より少なくなり、襲われてしまいました。', '最初からやり直す');
      } else {
        statusEl.textContent = '岸のコマをタップしてボートに乗せ（最大2人）、「渡る」で対岸へ。どちらの岸も「市民＜狼男」になると失敗です。';
        statusEl.className = 'river-status';
        if (overlay) { overlay.className = 'river-overlay'; overlay.innerHTML = ''; }
      }
    }
    crossBtn.addEventListener('click', cross);
    el('reset').addEventListener('click', reset);
    reset();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
