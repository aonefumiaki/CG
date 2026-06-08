// ============================================================
//  ハイ＆ロー（HIGH & LOW・トランプ運だめし）
//  カードをめくる演出つき（#highlow にスコープ）
// ============================================================
(function(){
  function init(){
    if(!document.getElementById('highlow')) return;
    const $=id=>document.getElementById(id);
    const SUITS=[{s:'♠',c:'blk'},{s:'♥',c:'red'},{s:'♦',c:'red'},{s:'♣',c:'blk'}];
    const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const rankLabel=v=>RANKS[v-1];

    let deck=[], current=null, streak=0, best=0, gameOver=false, showProb=false, history=[];

    /* 絵札（J/Q/K）の王冠エンブレム。上下対称に配置 */
    function faceArt(letter, colorClass, suit){
      const col = colorClass==='red' ? '#c0392b' : '#1c1c1c';
      const gold='#d4a52a', goldd='#b8901f';
      const crowns={
        K:`<path d="M27 52 L30 28 L40 42 L50 24 L60 42 L70 28 L73 52 Z" fill="${gold}" stroke="${col}" stroke-width="1.6" stroke-linejoin="round"/>`
          +`<path d="M50 24 L50 14 M45 18 L55 18" stroke="${col}" stroke-width="1.6" stroke-linecap="round"/>`
          +`<rect x="27" y="52" width="46" height="10" rx="2.5" fill="${gold}" stroke="${col}" stroke-width="1.6"/>`
          +`<circle cx="30" cy="27" r="2.6" fill="${col}"/><circle cx="70" cy="27" r="2.6" fill="${col}"/>`
          +`<circle cx="38" cy="57" r="2" fill="${col}"/><circle cx="50" cy="57" r="2.4" fill="${goldd}" stroke="${col}" stroke-width="1"/><circle cx="62" cy="57" r="2" fill="${col}"/>`,
        Q:`<path d="M29 52 Q30 38 40 45 Q44 30 50 30 Q56 30 60 45 Q70 38 71 52 Z" fill="${gold}" stroke="${col}" stroke-width="1.6" stroke-linejoin="round"/>`
          +`<rect x="29" y="52" width="42" height="9" rx="2.5" fill="${gold}" stroke="${col}" stroke-width="1.6"/>`
          +`<circle cx="50" cy="27" r="3.4" fill="${goldd}" stroke="${col}" stroke-width="1.1"/>`
          +`<circle cx="34" cy="40" r="1.8" fill="${col}"/><circle cx="66" cy="40" r="1.8" fill="${col}"/>`
          +`<circle cx="40" cy="56.5" r="1.7" fill="${col}"/><circle cx="50" cy="56.5" r="1.7" fill="${col}"/><circle cx="60" cy="56.5" r="1.7" fill="${col}"/>`,
        J:`<path d="M33 52 L35 38 L43 46 L50 35 L57 46 L65 38 L67 52 Z" fill="${gold}" stroke="${col}" stroke-width="1.6" stroke-linejoin="round"/>`
          +`<rect x="33" y="52" width="34" height="9" rx="2.5" fill="${gold}" stroke="${col}" stroke-width="1.6"/>`
          +`<path d="M67 40 Q83 33 79 53 Q72 47 66 50 Z" fill="${col}" opacity="0.85"/>`
          +`<circle cx="50" cy="56.5" r="2" fill="${goldd}" stroke="${col}" stroke-width="1"/>`
      };
      const emblem=`<g>${crowns[letter]}<text x="50" y="70" text-anchor="middle" font-size="15" fill="${col}" font-family="Georgia,serif">${suit}</text></g>`;
      return `<svg class="faceart" viewBox="0 0 100 144" width="98" height="150" xmlns="http://www.w3.org/2000/svg">`
        +`<rect x="5" y="5" width="90" height="134" rx="9" fill="none" stroke="${gold}" stroke-width="1" opacity="0.6"/>`
        +`<line x1="13" y1="72" x2="87" y2="72" stroke="${gold}" stroke-width="1" opacity="0.45"/>`
        +`<circle cx="50" cy="72" r="2.2" fill="${gold}" opacity="0.7"/>`
        +emblem
        +`<g transform="translate(0,144) scale(1,-1)">${emblem}</g>`
        +`</svg>`;
    }

    function buildDeck(exclude){
      const d=[];
      for(let v=1;v<=13;v++) for(const su of SUITS){
        if(exclude && exclude.rank===v && exclude.suit===su.s) continue;
        d.push({rank:v, suit:su.s, color:su.c});
      }
      for(let i=d.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; }
      return d;
    }
    function newGame(){
      deck=buildDeck(null); current=deck.pop();
      streak=0; gameOver=false; history=[];
      $('msg').textContent=''; $('msg').className='msg';
      $('retry').classList.add('hidden');
      ensureDeck();
      render(true);
    }
    function ensureDeck(){ if(deck.length===0){ deck=buildDeck(current); } }

    function guess(dir){
      if(gameOver) return;
      ensureDeck();
      const next=deck.pop();
      history.unshift(current); if(history.length>8) history.pop();
      if(next.rank===current.rank){
        current=next; setMsg(`引き分け（${rankLabel(next.rank)} が出た）— セーフ、続けて！`,'push');
        ensureDeck(); render(true); return;
      }
      const correct = (dir==='high' && next.rank>current.rank) || (dir==='low' && next.rank<current.rank);
      current=next;
      if(correct){
        streak++; if(streak>best) best=streak;
        setMsg(`正解！ ${rankLabel(next.rank)} ・ ${streak} 連勝中`,'good');
        ensureDeck(); render(true);
      }else{
        gameOver=true;
        setMsg(`はずれ… ${rankLabel(next.rank)} が出ました。${streak} 連勝でゲーム終了。`,'bad');
        render(true);
      }
    }
    function setMsg(t,c){ $('msg').textContent=t; $('msg').className='msg'+(c?' '+c:''); }

    function render(dealAnim){
      $('streak').textContent=streak;
      $('best').textContent=best;
      $('left').textContent=deck.length;

      // card
      const el=$('card'); const isFace=current.rank>=11;
      el.className='card '+(current.color)+(isFace?' face':'');
      const center = isFace
        ? faceArt(rankLabel(current.rank), current.color, current.suit)
        : `<div class="big ${current.color}">${current.suit}</div>`;
      el.innerHTML=
        `<div class="corner tl ${current.color}"><div class="r">${rankLabel(current.rank)}</div><div class="s">${current.suit}</div></div>`
       +center
       +`<div class="corner br ${current.color}"><div class="r">${rankLabel(current.rank)}</div><div class="s">${current.suit}</div></div>`;
      if(dealAnim){ void el.offsetWidth; el.classList.add('deal'); }

      // probability hint
      if(showProb && !gameOver){
        const tot=deck.length;
        const hi=deck.filter(c=>c.rank>current.rank).length;
        const lo=deck.filter(c=>c.rank<current.rank).length;
        const pc=n=>tot?Math.round(n/tot*100):0;
        $('prob').textContent=`残り山札で ハイ ${pc(hi)}% ／ ロー ${pc(lo)}%（同じ ${pc(tot-hi-lo)}%）`;
      }else $('prob').textContent='';

      // history
      const h=$('history'); h.innerHTML='';
      history.slice(0,8).forEach(c=>{
        const e=document.createElement('div'); e.className='hcard '+c.color;
        e.innerHTML=`<span class="${c.color}">${rankLabel(c.rank)}${c.suit}</span>`; h.appendChild(e);
      });

      $('high').disabled=gameOver; $('low').disabled=gameOver;
      $('retry').classList.toggle('hidden',!gameOver);
      $('hint').textContent = gameOver ? 'ゲーム終了。「もう一度」で再挑戦できます。'
        : 'ハイ（高い）かロー（低い）を選んでください。';
    }

    $('high').addEventListener('click',()=>guess('high'));
    $('low').addEventListener('click',()=>guess('low'));
    $('retry').addEventListener('click',newGame);
    $('probToggle').addEventListener('click',()=>{ showProb=!showProb; $('probToggle').textContent='確率ヒント：'+(showProb?'ON':'OFF'); render(false); });

    newGame();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
