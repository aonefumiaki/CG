// ============================================================
//  チョンプ（Chomp）— 最強CPU（完全読み）／2人対戦
//  マスを選ぶとその右下すべてを食べる。左上の毒マス☠を食べた人が負け。
// ============================================================
(function () {
  function init() {
    const gridEl = document.getElementById('grid');
    if (!gridEl) return;
    const turnEl = document.getElementById('turn');
    const msgEl = document.getElementById('msg');
    const revealBox = document.getElementById('revealBox');
    const boardEl = document.querySelector('#chomp .chomp-board');
    const overlayEl = document.getElementById('chompOverlay');

    let C, R, heights, startC, startR, mode = 'cpu', turn = 0, gameOver = false, showReveal = false, locked = false;
    // heights[c] = 列cに残っている上からの行数。左→右で非増加。
    // 毒マスは (row 0, col 0)。(r,c)を食べると c'>=c について heights[c'] = min(heights[c'], r)。

    function setBoard(c, r) { startC = c; startR = r; reset(); }
    function reset() {
      C = startC; R = startR; heights = Array(C).fill(R);
      turn = 0; gameOver = false; locked = false; msgEl.textContent = '';
      if (overlayEl) { overlayEl.className = 'chomp-overlay'; overlayEl.innerHTML = ''; }
      if (boardEl) boardEl.classList.remove('shake');
      render();
    }
    function playerName(t) {
      if (mode === 'cpu') return t === 0 ? 'あなた' : 'CPU';
      return t === 0 ? 'プレイヤー1' : 'プレイヤー2';
    }
    function humanCanAct() { return !locked && !gameOver && !(mode === 'cpu' && turn === 1); }
    function updateTurnBadge() {
      if (gameOver) { turnEl.style.display = 'none'; return; }
      turnEl.style.display = 'inline-block';
      turnEl.textContent = playerName(turn) + 'の番';
      turnEl.className = 'turn ' + (turn === 0 ? 'you' : 'opp');
    }
    function present(r, c) { return r < heights[c]; }

    function render() {
      gridEl.innerHTML = '';
      gridEl.style.gridTemplateColumns = 'repeat(' + C + ', 46px)';
      for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) {
          const cell = document.createElement('div'); cell.className = 'cell';
          if (!present(r, c)) { cell.classList.add('gone'); gridEl.appendChild(cell); continue; }
          if (r === 0 && c === 0) { cell.classList.add('poison'); const s = document.createElement('span'); s.className = 'skull'; s.textContent = '☠'; cell.appendChild(s); }
          if (humanCanAct()) {
            cell.addEventListener('mouseenter', () => hover(r, c, true));
            cell.addEventListener('mouseleave', () => hover(r, c, false));
            cell.addEventListener('click', () => humanEat(r, c));
          }
          gridEl.appendChild(cell);
        }
      }
      updateTurnBadge();
      renderReveal();
    }
    function cellAt(r, c) { return gridEl.children[r * C + c]; }
    function hover(r, c, on) {
      for (let rr = r; rr < R; rr++) for (let cc = c; cc < C; cc++) {
        if (present(rr, cc)) cellAt(rr, cc).classList.toggle('eat', on);
      }
    }

    function humanEat(r, c) {
      if (!humanCanAct()) return;
      if (r === 0 && c === 0) {
        const others = heights.some((h, i) => i === 0 ? h > 1 : h > 0);
        if (others && !confirm('毒マス ☠ を食べると負けです。本当に食べますか？')) return;
      }
      applyEat(r, c);
    }

    function applyEat(r, c) {
      for (let cc = c; cc < C; cc++) heights[cc] = Math.min(heights[cc], r);
      if (checkEnd()) { render(); return; }
      turn = 1 - turn; render();
      if (mode === 'cpu' && turn === 1 && !gameOver) {
        locked = true; render();
        setTimeout(() => { cpuMove(); locked = false; render(); }, 600);
      }
    }
    function checkEnd() {
      if (heights.every(h => h === 0)) {
        gameOver = true;
        const loser = turn, winner = 1 - turn;
        msgEl.style.color = (mode === 'cpu') ? (winner === 0 ? 'var(--c-win)' : 'var(--c-lose)') : 'var(--c-win)';
        msgEl.textContent = playerName(loser) + 'が毒マスを食べた… ' + playerName(winner) + 'の勝ち！';
        updateTurnBadge();
        showOverlay(winner, loser);
        return true;
      }
      return false;
    }
    function showOverlay(winner, loser) {
      if (!overlayEl) return;
      let kind, title, sub;
      if (mode === 'cpu') {
        if (winner === 0) { kind = 'win'; title = '🎉 あなたの勝ち！'; sub = 'CPUが毒マスを食べました。お見事！'; }
        else { kind = 'lose'; title = '💀 あなたの負け…'; sub = '毒マスを食べてしまいました。'; }
      } else {
        kind = 'win'; title = '🎉 ' + playerName(winner) + 'の勝ち！'; sub = playerName(loser) + 'が毒マスを食べました。';
      }
      overlayEl.className = 'chomp-overlay show ' + kind;
      overlayEl.innerHTML = '<div class="co-title">' + title + '</div><div class="co-sub">' + sub + '</div><button class="co-btn" id="coRetry">同じ盤でもう一度</button>';
      const b = document.getElementById('coRetry'); if (b) b.addEventListener('click', reset);
      if (kind === 'win' && window.cgCelebrate) cgCelebrate.win(title.replace(/^🎉\s*/, ''));
      if (boardEl) { boardEl.classList.remove('shake'); void boardEl.offsetWidth; if (kind === 'lose') boardEl.classList.add('shake'); }
    }

    /* ---------- 完全読みCPU（メモ化ミニマックス） ---------- */
    const memo = new Map();
    function key(h) { return h.join(','); }
    function applyTo(h, r, c) { const n = h.slice(); for (let cc = c; cc < C; cc++) n[cc] = Math.min(n[cc], r); return n; }
    function legalMoves(h) {
      const mv = [];
      for (let c = 0; c < C; c++) for (let r = 0; r < h[c]; r++) { if (r === 0 && c === 0) continue; mv.push([r, c]); }
      return mv;
    }
    function isWin(h) {
      const k = key(h);
      if (memo.has(k)) return memo.get(k);
      const mv = legalMoves(h);
      if (mv.length === 0) { memo.set(k, false); return false; }
      let win = false;
      for (const m of mv) { if (!isWin(applyTo(h, m[0], m[1]))) { win = true; break; } }
      memo.set(k, win); return win;
    }
    function eatenCount(h, r, c) { let n = 0; for (let cc = c; cc < C; cc++) n += Math.max(0, h[cc] - r); return n; }
    function cpuMove() {
      const mv = legalMoves(heights);
      if (mv.length === 0) { applyEat(0, 0); return; }
      for (const m of mv) { if (!isWin(applyTo(heights, m[0], m[1]))) { applyEat(m[0], m[1]); return; } }
      let best = mv[0], bestN = Infinity;
      for (const m of mv) { const n = eatenCount(heights, m[0], m[1]); if (n < bestN) { bestN = n; best = m; } }
      applyEat(best[0], best[1]);
    }

    /* ---------- 種明かし ---------- */
    function renderReveal() {
      if (!showReveal) { revealBox.textContent = ''; return; }
      if (heights.every(h => h === 0)) { revealBox.textContent = '終了'; return; }
      const w = isWin(heights);
      revealBox.textContent = w
        ? 'いまの局面は手番側が有利（勝てる手が存在する）'
        : 'いまの局面は手番側が不利（どう打っても最善の相手には勝てない）';
    }

    /* ---------- 配線 ---------- */
    document.getElementById('modeSeg').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      [...e.currentTarget.children].forEach(x => x.classList.remove('on'));
      b.classList.add('on'); mode = b.dataset.mode; reset();
    });
    document.getElementById('presets').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const parts = b.dataset.s.split(',').map(Number); setBoard(parts[0], parts[1]);
    });
    document.getElementById('reset').addEventListener('click', reset);
    document.getElementById('reveal').addEventListener('click', () => { showReveal = !showReveal; renderReveal(); });

    setBoard(4, 3);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
