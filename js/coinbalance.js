// ============================================================
//  天秤の偽コイン（適応的・最適手順ソルバー付き）
//  #coinbalance にスコープ
// ============================================================
(function(){
  function init(){
    if(!document.getElementById('beam')) return;
    const $=id=>document.getElementById(id);
    let mode='easy', N=9, maxW=2, knownHeavier=true;
    let state=[], fake=-1, fakeDir=1, used=0, sel=[], accuseMode=false, over=false, weighRecords=[];

    /* ---------- 適応的・最適手順ソルバー ----------
       仮説 {c:coin, d:+1 重い / -1 軽い}; 傾き +1=左下がり, -1=右下がり, 0=つり合い */
    function predictTilt(h,L,R){ if(L.includes(h.c))return h.d; if(R.includes(h.c))return -h.d; return 0; }
    function classify(H,n){ const dirs={}; for(let i=0;i<n;i++)dirs[i]=new Set(); H.forEach(h=>dirs[h.c].add(h.d));
      const cls={}; for(let i=0;i<n;i++){ const k=[...dirs[i]].sort().join(',')||'g'; (cls[k]=cls[k]||[]).push(i); } return cls; }
    function profileGen(keys,cls,idx,cl,cr,out){ if(idx===keys.length){ if(cl.length===cr.length&&cl.length>=1) out.push([cl.slice(),cr.slice()]); return; }
      const coins=cls[keys[idx]], c=coins.length;
      for(let l=0;l<=c;l++) for(let r=0;r+l<=c;r++){ profileGen(keys,cls,idx+1, cl.concat(coins.slice(0,l)), cr.concat(coins.slice(l,l+r)), out); } }
    const solveMemo=new Map();
    function solveCoins(H,k,n){
      if(H.length<=1) return {ok:true};
      if(k===0) return {ok:false};
      const mk=k+'|'+H.map(h=>h.c+(h.d>0?'H':'L')).sort().join('.');
      if(solveMemo.has(mk)) return solveMemo.get(mk);
      const cls=classify(H,n), out=[]; profileGen(Object.keys(cls),cls,0,[],[],out);
      let best=null,bestWorst=Infinity;
      for(const [L,R] of out){
        const b={'-1':[],'0':[],'1':[]};
        for(const h of H) b[predictTilt(h,L,R)].push(h);
        if(b['-1'].length===H.length||b['0'].length===H.length||b['1'].length===H.length) continue;
        let ok=true,worst=0;
        for(const t of ['-1','0','1']){ const bk=b[t]; worst=Math.max(worst,bk.length); if(bk.length&&!solveCoins(bk,k-1,n).ok){ok=false;break;} }
        if(ok&&worst<bestWorst){bestWorst=worst;best={L,R};}
      }
      const res=best?{ok:true,move:best}:{ok:false};
      solveMemo.set(mk,res); return res;
    }

    function setMode(m){
      mode=m;
      if(m==='hard'){ N=12; maxW=3; knownHeavier=false; }
      else { N=9; maxW=2; knownHeavier=true; }
      newGame();
    }
    function newGame(){
      state=Array(N).fill('');     // '', 'L', 'R'
      fake=Math.floor(Math.random()*N);
      fakeDir = knownHeavier ? 1 : (Math.random()<0.5?1:-1);
      used=0; sel=[]; accuseMode=false; over=false; weighRecords=[];
      $('msg').textContent=''; $('msg').className='msg';
      $('log').innerHTML=''; $('result').textContent='';
      setBeam(0,0); render();
    }

    function place(loc){       // 選択中のコイン（複数可）を置き場所（L / R / ''）へまとめて移動
      if(over||accuseMode||sel.length===0) return;
      sel.forEach(i=>state[i]=loc); sel=[]; render();
    }
    function selectCoin(i){
      if(over) return;
      if(accuseMode){ doAccuse(i); return; }
      if(sel.includes(i)) sel=sel.filter(x=>x!==i); else sel=sel.concat(i);
      render();
    }

    function weigh(){
      if(over) return;
      const L=[],R=[];
      state.forEach((s,i)=>{ if(s==='L')L.push(i); else if(s==='R')R.push(i); });
      if(L.length<1||R.length<1){ flash('左右の皿に1枚以上ずつ載せてください'); return; }
      if(used>=maxW){ flash('天秤の使用回数の上限です。偽物を指名してください'); return; }
      const w=arr=>arr.reduce((s,i)=>s+10+(i===fake?fakeDir:0),0);
      const diff=w(L)-w(R), tilt=diff>0?1:diff<0?-1:0;
      used++;
      weighRecords.push({L:L.slice(),R:R.slice(),tilt});
      const res=tilt>0?'左が下がった（左が重い）':tilt<0?'右が下がった（右が重い）':'つり合った';
      log(`${used}回目： 左[${L.map(i=>i+1).join(',')}] と 右[${R.map(i=>i+1).join(',')}] → ${res}`);
      render();
      // まず水平にもどす → 少し間をおいて、ゆっくり傾く
      setBeam(0,0.28);
      $('result').textContent='はかっています…';
      setTimeout(()=>{ setBeam(tilt,1.1); $('result').textContent=res; }, 420);
    }
    function flash(t){ $('result').textContent=t; }
    function setBeam(tilt,dur){
      if(dur===undefined)dur=0.55;
      const b=$('beam'), pl=$('panL'), pr=$('panR');
      const tr=`transform ${dur}s cubic-bezier(.33,1,.5,1)`;
      b.style.transition=tr; pl.style.transition=tr; pr.style.transition=tr;
      b.style.transform=`translateX(-50%) rotate(${ -tilt*7 }deg)`;
      pl.style.transform=`translateY(${ tilt>0?16:tilt<0?-16:0 }px)`;
      pr.style.transform=`translateY(${ tilt<0?16:tilt>0?-16:0 }px)`;
    }

    function doAccuse(i){
      over=true;
      const dirTxt=fakeDir>0?'重い':'軽い';
      if(i===fake){
        $('msg').textContent=`正解！ ${i+1} 番が偽物（本物より${dirTxt}）。天秤 ${used} 回で発見！🎉`; $('msg').className='msg good';
        window.cgCelebrate && (used<=maxW-1
          ? cgCelebrate.win('お見事！', `天秤 ${used} 回で発見`)
          : cgCelebrate.win('正解！', `${i+1} 番が偽物（本物より${dirTxt}）`));
      } else {
        $('msg').textContent=`はずれ。偽物は ${fake+1} 番（本物より${dirTxt}）でした。`; $('msg').className='msg bad';
        window.cgCelebrate && cgCelebrate.fail('はずれ…', `偽物は ${fake+1} 番（${dirTxt}）でした`);
      }
      accuseMode=false; render();
    }

    function suggest(){
      if(over) return;
      const all=[]; for(let i=0;i<N;i++){ all.push({c:i,d:1}); if(!knownHeavier) all.push({c:i,d:-1}); }
      const H=all.filter(h=>weighRecords.every(r=>predictTilt(h,r.L,r.R)===r.tilt));
      const dirTxt=d=>d>0?'重い':'軽い';
      if(H.length<=1){
        if(H.length===1){ const h=H[0]; setTip(`もう特定できます：${h.c+1} 番が偽物（${dirTxt(h.d)}）。「偽物を指名」で当てましょう。`); }
        else setTip('これまでの結果に合う可能性がありません（操作を見直してください）。');
        return;
      }
      const k=maxW-used;
      if(k<=0){ setTip(`天秤の回数が残っていません。残りの可能性は ${H.length} 通りです。`); return; }
      solveMemo.clear();
      const r=solveCoins(H,k,N);
      if(!r.ok){ setTip(`残り ${k} 回では確実に特定するのは難しい状態です。今の可能性は ${H.length} 通り。`); return; }
      const L=r.move.L, R=r.move.R;
      state=Array(N).fill(''); L.forEach(i=>state[i]='L'); R.forEach(i=>state[i]='R'); sel=[];
      render();
      setTip(`おすすめ：左[${L.map(x=>x+1).join(',')}] と 右[${R.map(x=>x+1).join(',')}] をはかる（今ありうる偽物は ${H.length} 通り）。皿に並べました。`);
    }
    function setTip(t){ $('msg').textContent=t; $('msg').className='msg good'; }
    function log(t){ const d=document.createElement('div'); d.textContent='・'+t; $('log').appendChild(d); $('log').scrollTop=$('log').scrollHeight; }

    function coinEl(i){
      const el=document.createElement('div');
      el.className='coin'+(sel.includes(i)?' sel':'')+(over&&i===fake?' fake':'');
      el.textContent=i+1;
      if(!over) el.addEventListener('click',e=>{ e.stopPropagation(); selectCoin(i); });
      return el;
    }
    function render(){
      $('weighs').textContent=`${used} / ${maxW}`;
      $('condition').innerHTML = knownHeavier
        ? `<div class="big">偽物は本物より「重い」</div><div class="small">コイン ${N}枚 ／ 天秤は ${maxW}回まで</div>`
        : `<div class="big">偽物は「重いか軽いか」分からない</div><div class="small">コイン ${N}枚 ／ 天秤は ${maxW}回まで</div>`;
      const pL=$('panL'), pR=$('panR'), tray=$('tray');
      pL.innerHTML='<div class="wire"></div><div class="plabel">左の皿</div>';
      pR.innerHTML='<div class="wire"></div><div class="plabel">右の皿</div>';
      tray.innerHTML='<div class="traylabel">手元（ここをタップで戻す）</div>';
      for(let i=0;i<N;i++){
        const dest = state[i]==='L'?pL : state[i]==='R'?pR : tray;
        dest.appendChild(coinEl(i));
      }
      $('weigh').disabled=over||used>=maxW;
      $('clear').disabled=over;
      $('accuse').classList.toggle('on',accuseMode);
      $('accuse').disabled=over;
      $('hintBtn').disabled=over;
      $('hint').textContent = over ? '「最初から」で新しい問題に挑戦できます。'
        : accuseMode ? '指名モード：偽物だと思うコインをタップしてください。'
        : sel.length ? `${sel.map(i=>i+1).join('・')} を選択中（${sel.length}枚）。「左の皿」「右の皿」「手元」をタップするとまとめて移動します。`
        : (knownHeavier ? '偽物は本物より「重い」と分かっています。コインをタップで選択（複数まとめて選べます）→置き場所（皿や手元）をタップで移動。'
                        : '偽物は重いか軽いか分かりません。コインをタップで選択（複数まとめて選べます）→置き場所をタップで移動。');
    }

    $('panL').addEventListener('click',()=>place('L'));
    $('panR').addEventListener('click',()=>place('R'));
    $('tray').addEventListener('click',()=>place(''));
    $('modeSeg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;[...e.currentTarget.children].forEach(x=>x.classList.remove('on'));b.classList.add('on');setMode(b.dataset.m);});
    $('weigh').addEventListener('click',weigh);
    $('clear').addEventListener('click',()=>{ if(over)return; state=Array(N).fill(''); sel=[]; render(); });
    $('accuse').addEventListener('click',()=>{ if(over)return; accuseMode=!accuseMode; sel=[]; render(); });
    $('hintBtn').addEventListener('click',suggest);
    $('restart').addEventListener('click',newGame);

    setMode('easy');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
