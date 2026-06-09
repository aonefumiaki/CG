// ============================================================
//  橋渡し（懐中電灯）パズル — 1/2/5/10分の定番（最短ソルバー付き）
//  橋・懐中電灯のイラスト演出つき（#bridge にスコープ）
// ============================================================
(function(){
  function init(){
    if(!document.getElementById('peopleL')) return;
    const $=id=>document.getElementById(id);
    const NAMES=['A','B','C','D'];

    let times=[1,2,5,10], people=[], flash='L', elapsed=0, selected=[], history=[], optimal=null;
    let justMoved=false;

    /* ---------- 最短ソルバー：(mask,flash) 上のダイクストラ ---------- */
    function solveBridge(ts){
      const m=ts.length, FULL=(1<<m)-1, idx=(mask,f)=>mask*2+f;
      const N=(FULL+1)*2, dist=new Array(N).fill(Infinity), prev=new Array(N).fill(null), vis=new Array(N).fill(false);
      dist[idx(FULL,0)]=0;
      while(true){
        let u=-1,b=Infinity;
        for(let s=0;s<N;s++) if(!vis[s]&&dist[s]<b){b=dist[s];u=s;}
        if(u===-1)break; vis[u]=true;
        const mask=Math.floor(u/2), f=u%2, side=[];
        for(let i=0;i<m;i++){const onL=(mask>>i)&1; if((f===0&&onL)||(f===1&&!onL))side.push(i);}
        const grps=[];
        for(let i=0;i<side.length;i++){grps.push([side[i]]);for(let j=i+1;j<side.length;j++)grps.push([side[i],side[j]]);}
        for(const g of grps){
          const cost=Math.max(...g.map(i=>ts[i]));
          let nm=mask; for(const i of g){ if(f===0)nm&=~(1<<i); else nm|=(1<<i); }
          const v=idx(nm,f^1);
          if(dist[u]+cost<dist[v]){dist[v]=dist[u]+cost;prev[v]={u,g,nf:f^1,cost};}
        }
      }
      const goal=idx(0,1), seq=[]; let cur=goal;
      while(prev[cur]){const p=prev[cur];seq.unshift(p);cur=p.u;}
      return {time:dist[goal],seq};
    }

    /* ---------- start（定番の 1·2·5·10） ---------- */
    function startGame(){
      people=times.map((t,i)=>({id:i,name:NAMES[i],time:t,side:'L'}));
      flash='L'; elapsed=0; selected=[]; history=[]; justMoved=false;
      optimal=solveBridge(times);
      $('optimal').textContent='?';
      $('msg').textContent=''; $('msg').className='msg'; $('log').innerHTML='';
      render();
    }

    /* ---------- game ---------- */
    function toggleSel(id){
      const p=people[id];
      if(p.side!==flash) return;            // 電灯がある岸の人だけ選べる
      if(selected.includes(id)) selected=selected.filter(x=>x!==id);
      else { if(selected.length>=2) return; selected.push(id); }
      render();
    }
    $('cross').addEventListener('click',()=>{
      if(selected.length<1||selected.length>2) return;
      const cost=Math.max(...selected.map(i=>people[i].time));
      history.push({moved:[...selected],from:flash,cost,elapsed});
      selected.forEach(i=>people[i].side = flash==='L'?'R':'L');
      elapsed+=cost;
      const dir = flash==='L'?'→':'←';
      log(`${selected.map(i=>people[i].name).join('・')} が${flash==='L'?'向こうへ':'こちらへ'}（${cost}分） ${dir} 合計 ${elapsed}分`);
      flash = flash==='L'?'R':'L';
      selected=[]; justMoved=true;
      checkWin(); render();
    });
    $('undo').addEventListener('click',()=>{
      if(!history.length) return;
      const h=history.pop();
      h.moved.forEach(i=>people[i].side=h.from);
      flash=h.from; elapsed=h.elapsed; selected=[];
      $('log').lastChild&&$('log').removeChild($('log').lastChild);
      $('msg').textContent=''; $('msg').className='msg';
      render();
    });
    $('reveal').addEventListener('click',()=>{
      $('optimal').textContent=optimal.time;
      const steps=optimal.seq.map(s=>`${s.g.map(i=>people[i].name).join('・')}${s.nf===1?'→':'←'}(${s.cost})`).join('  ');
      $('msg').textContent=`最短は ${optimal.time}分。手順：${steps}`;
      $('msg').className='msg good';
    });
    $('reset2').addEventListener('click',()=>{
      people.forEach(p=>p.side='L'); flash='L'; elapsed=0; selected=[]; history=[];
      $('log').innerHTML=''; $('msg').textContent=''; $('msg').className='msg'; render();
    });

    function checkWin(){
      if(people.every(p=>p.side==='R')){
        $('optimal').textContent=optimal.time;
        if(elapsed===optimal.time){
          $('msg').textContent=`全員わたり切った！ ${elapsed}分 — 最短ぴったり！🎉`; $('msg').className='msg good';
          window.cgCelebrate && cgCelebrate.win('最短クリア！', `${elapsed}分・最短ぴったり`);
        } else {
          $('msg').textContent=`全員わたり切った！ ${elapsed}分（最短は ${optimal.time}分）`; $('msg').className='msg good';
          window.cgCelebrate && cgCelebrate.clear('クリア！', `${elapsed}分（最短は ${optimal.time}分）あと一歩！`);
        }
      }
    }
    function log(t){ const d=document.createElement('div'); d.textContent='・'+t; $('log').appendChild(d); $('log').scrollTop=$('log').scrollHeight; }

    function render(){
      $('elapsed').textContent=elapsed;
      $('bankL').classList.toggle('lit',flash==='L');
      $('bankR').classList.toggle('lit',flash==='R');
      const done = people.every(p=>p.side==='R');

      // 懐中電灯：電灯のある岸に、橋（内側）へ向けて配置
      const flashEl=$('flash');
      if(done){
        flashEl.className='flash done';
      }else{
        if(flash==='L'){ flashEl.src='images/flashlight-right.png'; flashEl.className='flash on-left'; }
        else           { flashEl.src='images/flashlight-left.png';  flashEl.className='flash on-right'; }
        if(justMoved){ void flashEl.offsetWidth; flashEl.classList.add(flash==='R'?'arrive-r':'arrive-l'); }
      }
      justMoved=false;

      ['L','R'].forEach(side=>{
        const box=$(side==='L'?'peopleL':'peopleR'); box.innerHTML='';
        people.filter(p=>p.side===side).sort((a,b)=>a.time-b.time).forEach(p=>{
          const el=document.createElement('div');
          const lit=(p.side===flash)&&!done;
          el.className='person'+(selected.includes(p.id)?' sel':'')+(lit?'':' locked');
          el.innerHTML=`<span class="who">${p.name}さん</span><span class="t">${p.time}分</span>`;
          if(lit) el.addEventListener('click',()=>toggleSel(p.id));
          box.appendChild(el);
        });
      });

      $('cross').disabled = done || selected.length<1;
      $('undo').disabled = history.length===0;
      $('cross').textContent = flash==='L' ? '選んだ人を渡らせる →' : '← 選んだ人を戻す';
      $('hint').textContent = done ? '全員ゴール！「最初から」で再挑戦できます。'
        : `懐中電灯がある${flash==='L'?'こちら岸':'向こう岸'}から、1〜2人を選んで渡らせます。`;
    }

    startGame();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
