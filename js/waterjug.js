// ============================================================
//  水汲みパズル（2容器・満タン/空/移す・最短BFSソルバー付き）
//  #waterjug にスコープ
// ============================================================
(function(){
  function init(){
    if(!document.getElementById('jugs')) return;
    const $=id=>document.getElementById(id);
    const PUZZLES=[ {ca:5,cb:3,t:4}, {ca:9,cb:4,t:6}, {ca:7,cb:5,t:1}, {ca:8,cb:3,t:4} ];
    let pi=0, ca=5, cb=3, target=4, a=0, b=0, moves=0, history=[], optimal=null, won=false;

    function solveJug(ca,cb,target){
      const key=(x,y)=>x+','+y, q=[[0,0,0,[]]], seen=new Set(['0,0']);
      while(q.length){
        const [x,y,d,path]=q.shift();
        if(x===target||y===target) return {moves:d,path};
        const pa=Math.min(x,cb-y), pb=Math.min(y,ca-x);
        const nx=[[ca,y,'満タンA'],[x,cb,'満タンB'],[0,y,'空A'],[x,0,'空B'],[x-pa,y+pa,'A→B'],[x+pb,y-pb,'B→A']];
        for(const [u,v,op] of nx){ const k=key(u,v); if(!seen.has(k)){seen.add(k);q.push([u,v,d+1,[...path,op]]);} }
      }
      return {moves:-1,path:[]};
    }

    function loadPuzzle(i){
      const p=PUZZLES[i]; ca=p.ca; cb=p.cb; target=p.t;
      a=0; b=0; moves=0; history=[]; won=false;
      optimal=solveJug(ca,cb,target);
      $('optimal').textContent='?';
      $('goal').innerHTML=`${ca}L と ${cb}L の容器で、<b>${target}L</b> をつくろう`;
      $('msg').textContent=''; $('msg').className='msg'; $('log').innerHTML='';
      render();
    }

    function act(fn,label){
      if(won) return;
      history.push({a,b});
      fn();
      moves++; log(`${label} → A:${a}L / B:${b}L（${moves}手）`);
      checkWin(); render();
    }
    function fillA(){ act(()=>a=ca,'Aを満タン'); }
    function fillB(){ act(()=>b=cb,'Bを満タン'); }
    function emptyA(){ act(()=>a=0,'Aを空に'); }
    function emptyB(){ act(()=>b=0,'Bを空に'); }
    function pourAB(){ act(()=>{const m=Math.min(a,cb-b);a-=m;b+=m;},'A→B'); }
    function pourBA(){ act(()=>{const m=Math.min(b,ca-a);b-=m;a+=m;},'B→A'); }

    function checkWin(){
      if(a===target||b===target){
        won=true; $('optimal').textContent=optimal.moves;
        if(moves===optimal.moves){
          $('msg').textContent=`${target}L 完成！ ${moves}手 — 最短ぴったり！🎉`; $('msg').className='msg good';
          window.cgCelebrate && cgCelebrate.win('最短で正解！', `${target}L・${moves}手ぴったり`);
        } else {
          $('msg').textContent=`${target}L 完成！ ${moves}手（最短は ${optimal.moves}手）🎉`; $('msg').className='msg good';
          window.cgCelebrate && cgCelebrate.clear('正解！', `${moves}手（最短は ${optimal.moves}手）おしい！`);
        }
      }
    }
    function log(t){ const d=document.createElement('div'); d.textContent='・'+t; $('log').appendChild(d); $('log').scrollTop=$('log').scrollHeight; }

    const UNIT=22; // 1Lあたりのpx（両容器で共通）
    function jugHTML(label,cap,amt){
      const isT=(amt===target);
      const gh=cap*UNIT, wh=amt*UNIT;
      let ticks='';
      for(let i=1;i<cap;i++){ ticks+=`<div class="tick" style="bottom:${i*UNIT}px"></div>`; }
      return `<div class="jugwrap">
        <div class="cap">${label}（${cap}L）</div>
        <div class="glass${isT?' target':''}" style="height:${gh}px">
          <div class="ticks">${ticks}</div>
          <div class="water" style="height:${wh}px"></div>
        </div>
        <div class="amt">${amt}L</div>
        <div class="jugbtns">
          <button data-act="fill${label}">満タン</button>
          <button data-act="empty${label}">空</button>
        </div>
      </div>`;
    }
    function render(){
      $('moves').textContent=moves;
      $('jugs').innerHTML = jugHTML('A',ca,a)+jugHTML('B',cb,b);
      $('jugs').querySelectorAll('button[data-act]').forEach(btn=>{
        const m={fillA,fillB,emptyA,emptyB}[btn.dataset.act];
        btn.addEventListener('click',m);
      });
      $('undo').disabled=history.length===0;
      $('hint').textContent = won ? '完成！「次の問題」や「最初から」で続けられます。'
        : '満タン／空／注ぐ を組み合わせて、どちらかの容器を目標の量にします。';
    }

    $('AB').addEventListener('click',pourAB);
    $('BA').addEventListener('click',pourBA);
    $('undo').addEventListener('click',()=>{
      if(!history.length) return;
      const h=history.pop(); a=h.a; b=h.b; moves=Math.max(0,moves-1); won=false;
      $('log').lastChild&&$('log').removeChild($('log').lastChild);
      $('msg').textContent=''; $('msg').className='msg'; render();
    });
    $('reset2').addEventListener('click',()=>loadPuzzle(pi));
    $('reveal').addEventListener('click',()=>{
      $('optimal').textContent=optimal.moves;
      $('msg').textContent=`最短は ${optimal.moves}手：${optimal.path.join(' → ')}`;
      $('msg').className='msg good';
    });
    $('next').addEventListener('click',()=>{ pi=(pi+1)%PUZZLES.length; loadPuzzle(pi); });

    loadPuzzle(0);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
