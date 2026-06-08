// ============================================================
//  ピッグ（Pig Dice・2〜6人 パス＆プレイ ＋ CPU対戦）
//  サイコロを振る演出つき（#pig にスコープ）
// ============================================================
(function(){
  function init(){
    if(!document.getElementById('pig')) return;
    const $=id=>document.getElementById(id);
    const r6=()=>1+Math.floor(Math.random()*6);
    const PIP={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
    const esc=s=>String(s).replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));

    let mode='cpu', nPlayers=2, goal=50;
    let players=[], cur=0, turnTotal=0, die=1, phase='idle';
    let animating=false, justRolled=false;

    /* ---------- setup ---------- */
    function seg(e,attr,set){
      const b=e.target.closest('button'); if(!b) return;
      [...e.currentTarget.children].forEach(x=>x.classList.remove('on'));
      b.classList.add('on'); set(b.dataset[attr]);
    }
    $('modeSeg').addEventListener('click',e=>seg(e,'m',v=>{
      mode=v;
      $('countRow').style.display = (mode==='multi') ? 'flex' : 'none';
      buildNames();
    }));
    $('countSeg').addEventListener('click',e=>seg(e,'n',v=>{ nPlayers=parseInt(v,10); buildNames(); }));
    $('goalSeg').addEventListener('click',e=>seg(e,'g',v=>goal=parseInt(v,10)));

    function buildNames(){
      const wrap=$('names'); wrap.innerHTML='';
      if(mode!=='multi') return;
      for(let i=0;i<nPlayers;i++){
        const inp=document.createElement('input');
        inp.type='text'; inp.value='プレイヤー'+(i+1); inp.maxLength=10; inp.id='nm'+i;
        wrap.appendChild(inp);
      }
    }

    $('start').addEventListener('click',()=>{
      if(mode==='cpu'){
        players=[{name:'あなた',score:0,cpu:false},{name:'コンピューター',score:0,cpu:true}];
      }else{
        players=[];
        for(let i=0;i<nPlayers;i++){
          const el=$('nm'+i);
          const nm=((el&&el.value)||'').trim()||('プレイヤー'+(i+1));
          players.push({name:nm,score:0,cpu:false});
        }
      }
      cur=0; turnTotal=0; die=1; justRolled=false;
      $('setup').classList.add('hidden'); $('result').classList.add('hidden'); $('game').classList.remove('hidden');
      setMsg('','');
      startTurn();
    });

    /* ---------- turn flow ---------- */
    function startTurn(){
      turnTotal=0;
      if(players[cur].cpu){ phase='cpu'; render(); setTimeout(cpuStep,700); }
      else { phase='human'; render(); }
    }
    function nextPlayer(){
      cur=(cur+1)%players.length;
      startTurn();
    }

    $('roll').addEventListener('click',()=>{ if(phase==='human' && !animating) doRoll(false); });
    $('hold').addEventListener('click',()=>{ if(phase==='human' && !animating && turnTotal>0) doHold(false); });
    $('greset').addEventListener('click',()=>{
      if(animating) return;
      $('game').classList.add('hidden'); $('result').classList.add('hidden');
      $('setup').classList.remove('hidden');
    });

    function doRoll(isCpu){
      const final=r6();
      rollAnim(final,()=>{
        if(die===1){
          turnTotal=0;
          setMsg('「1」が出た！ ためた点が消えました。','bad');
          render();
          setTimeout(nextPlayer, isCpu?1100:700);
        }else{
          turnTotal+=die;
          setMsg('','');
          render();
          if(isCpu) setTimeout(cpuStep,800);
        }
      });
    }
    function doHold(isCpu){
      players[cur].score+=turnTotal;
      const banked=turnTotal; turnTotal=0;
      if(players[cur].score>=goal){ phase='over'; render(); return endGame(); }
      setMsg(`${players[cur].name} は ${banked} 点を確保。`,'good');
      render();
      setTimeout(nextPlayer, isCpu?900:650);
    }

    /* CPU: 20点たまるか、その手で勝てるなら確定。それ以外は振る */
    function cpuStep(){
      if(phase!=='cpu' || animating) return;
      const p=players[cur];
      if(p.score+turnTotal>=goal){ doHold(true); return; }
      if(turnTotal>=20){ doHold(true); return; }
      doRoll(true);
    }

    /* ---------- サイコロ演出 ---------- */
    function rollAnim(finalFace, cb){
      animating=true; syncButtons();
      const el=$('die');
      let ticks=0; const TT=9;
      const iv=setInterval(()=>{
        ticks++;
        drawDie(r6(),'rolling');
        if(ticks>=TT){
          clearInterval(iv);
          die=finalFace;
          animating=false;
          justRolled=true;
          cb&&cb();
        }
      },65);
    }
    function drawDie(face,cls){
      const el=$('die');
      el.className='die'+(cls?' '+cls:'')+( (cls!=='rolling'&&face===1) ?' one':'');
      el.innerHTML='';
      for(let c=0;c<9;c++){
        const d=document.createElement('div');
        if(PIP[face].includes(c)){ const p=document.createElement('div'); p.className='pip'; d.appendChild(p); }
        el.appendChild(d);
      }
    }

    /* ---------- render ---------- */
    function syncButtons(){
      const human=(phase==='human' && !animating);
      $('roll').disabled=!human;
      $('hold').disabled=!human || turnTotal===0;
    }
    function setMsg(t,c){ $('msg').textContent=t; $('msg').className='msg'+(c?' '+c:''); }

    function render(){
      const sc=$('scores'); sc.innerHTML='';
      players.forEach((p,i)=>{
        const c=document.createElement('div'); c.className='pcard'+(i===cur?' cur':'');
        c.innerHTML=`<div class="nm">${esc(p.name)}</div><div class="sc">${p.score}</div>`;
        sc.appendChild(c);
      });
      $('turnTotal').textContent=turnTotal;
      drawDie(die, justRolled?'settle':'');
      justRolled=false;
      syncButtons();
      $('hint').textContent = phase==='cpu' ? 'コンピューターが考えています…'
        : phase==='human' ? `ゴールは ${goal} 点。${players[cur].name}はあと ${Math.max(0,goal-players[cur].score)} 点で勝ち。`
        : '';
    }

    /* ---------- result ---------- */
    function endGame(){
      const winner=players.find(p=>p.score>=goal) || players[cur];
      $('game').classList.add('hidden'); $('result').classList.remove('hidden');
      $('wname').textContent=`${winner.name} の勝ち！`;
      $('finalscore').textContent=players
        .slice().sort((a,b)=>b.score-a.score)
        .map(p=>`${p.name} ${p.score}点`).join(' ／ ');
    }
    $('again').addEventListener('click',()=>{
      players.forEach(p=>p.score=0); cur=0; turnTotal=0; die=1; justRolled=false;
      $('result').classList.add('hidden'); $('game').classList.remove('hidden'); setMsg('','');
      startTurn();
    });
    $('back').addEventListener('click',()=>{
      $('result').classList.add('hidden'); $('setup').classList.remove('hidden');
    });

    // 初期サイコロ
    drawDie(1,'');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
