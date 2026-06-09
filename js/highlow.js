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
    const SCODE={'♠':'s','♥':'h','♦':'d','♣':'c'};   // 絵札画像ファイル名のスート記号
    const rankLabel=v=>RANKS[v-1];
    const courtSrc=c=>`images/cards/${rankLabel(c.rank)}-${SCODE[c.suit]}.png`;

    let deck=[], current=null, streak=0, best=0, gameOver=false, showProb=false, history=[];

    // 絵札画像を先読み（めくり演出時のちらつき防止）
    for(const rk of ['J','Q','K']) for(const sc of ['s','h','d','c']){
      const im=new Image(); im.src=`images/cards/${rk}-${sc}.png`;
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
        window.cgCelebrate && (streak>=5 && streak===best ? cgCelebrate.win(`${streak} 連勝！`) : cgCelebrate.correct());
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
      if(isFace){
        // 絵札は専用イラストを全面表示（カード枠・隅の数字も画像に含まれる）
        el.className='card cardimg '+current.color;
        el.innerHTML=`<img class="court" src="${courtSrc(current)}" alt="${rankLabel(current.rank)}${current.suit}">`;
      }else{
        el.className='card '+current.color;
        el.innerHTML=
          `<div class="corner tl ${current.color}"><div class="r">${rankLabel(current.rank)}</div><div class="s">${current.suit}</div></div>`
         +`<div class="big ${current.color}">${current.suit}</div>`
         +`<div class="corner br ${current.color}"><div class="r">${rankLabel(current.rank)}</div><div class="s">${current.suit}</div></div>`;
      }
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
