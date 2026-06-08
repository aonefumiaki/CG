// ============================================================
//  川渡りパズル（オオカミとヒツジ）
//  ボートは最大2匹・最低1匹で移動。どちらの岸でも
//  「ヒツジ＜オオカミ（ヒツジが0でない）」になったら失敗。
//  全員を右岸へ渡せばクリア。
// ============================================================
(function () {
  function init() {
    var el = function (id) { return document.getElementById(id); };
    var tokL = el('tokL'); if (!tokL) return;
    var tokR = el('tokR'), tokB = el('tokB');
    var bankL = el('bankL'), bankR = el('bankR'), dock = el('dock');
    var statusEl = el('status'), movesEl = el('moves'), crossBtn = el('cross');
    var s;

    function reset() {
      s = { L: { w: 3, s: 3 }, R: { w: 0, s: 0 }, B: { w: 0, s: 0 }, side: 'L', over: false, win: false, moves: 0 };
      crossBtn.disabled = false;
      render();
    }
    function bankNow() { return s[s.side]; }
    function board(type) { if (s.over || s.win) return; if (s.B.w + s.B.s >= 2) return; if (bankNow()[type] <= 0) return; bankNow()[type]--; s.B[type]++; render(); }
    function unboard(type) { if (s.over || s.win) return; if (s.B[type] <= 0) return; s.B[type]--; bankNow()[type]++; render(); }
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
    }

    function makeTok(type, tappable, onClick) {
      var d = document.createElement('div');
      d.className = 'tok ' + (type === 'w' ? 'wolf' : 'sheep') + (tappable ? '' : ' dim');
      d.textContent = type === 'w' ? '泥棒' : '警官';
      if (tappable) d.addEventListener('click', onClick);
      return d;
    }
    function renderBank(container, obj, docked) {
      container.innerHTML = '';
      var tappable = docked && !s.over && !s.win;
      for (var i = 0; i < obj.w; i++) container.appendChild(makeTok('w', tappable, function () { board('w'); }));
      for (var j = 0; j < obj.s; j++) container.appendChild(makeTok('s', tappable, function () { board('s'); }));
    }
    function renderBoat() {
      tokB.innerHTML = '';
      var tappable = !s.over && !s.win;
      for (var i = 0; i < s.B.w; i++) tokB.appendChild(makeTok('w', tappable, function () { unboard('w'); }));
      for (var j = 0; j < s.B.s; j++) tokB.appendChild(makeTok('s', tappable, function () { unboard('s'); }));
    }
    function render() {
      renderBank(tokL, s.L, s.side === 'L');
      renderBank(tokR, s.R, s.side === 'R');
      renderBoat();
      bankL.classList.toggle('active', s.side === 'L');
      bankR.classList.toggle('active', s.side === 'R');
      dock.textContent = '（' + (s.side === 'L' ? '左岸' : '右岸') + 'にいます）';
      movesEl.textContent = '手数: ' + s.moves;
      if (s.win) {
        statusEl.textContent = 'クリア！ 全員が右岸へわたれました（手数 ' + s.moves + '）。';
        statusEl.className = 'river-status win'; crossBtn.disabled = true;
      } else if (s.over) {
        statusEl.textContent = '失敗… 警官が泥棒より少なくなり、取り押さえられてしまいました。「最初から」でリトライ。';
        statusEl.className = 'river-status fail'; crossBtn.disabled = true;
      } else {
        statusEl.textContent = '岸のコマをタップしてボートに乗せ（最大2人）、「渡る」で対岸へ。どちらの岸も「警官＜泥棒」になると失敗です。';
        statusEl.className = 'river-status';
      }
    }
    crossBtn.addEventListener('click', cross);
    el('reset').addEventListener('click', reset);
    reset();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
