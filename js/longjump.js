// ============================================================
//  走り幅跳び（助走→踏切→空中連打。1〜6人で記録を競う）
//  #longjump にスコープ
// ============================================================
(function(){
  function init(){
    if(!document.getElementById('longjump')) return;
    var $=function(id){ return document.getElementById(id); };
    const cv=$('cv'), ctx=cv.getContext('2d');
    const W=cv.width, H=cv.height;
    const groundY=H*0.72, boardX=W*0.46, pxPerM=(W-boardX-14)/9.4;

    const ZONE_START=0.86, FOUL=1.0, VMAX=0.52, STEP=0.05, DECAYP=1.3, POSF=0.9;
    function computeDistance(S,takeoffX,airTaps){
      if(takeoffX>FOUL) return null;
      const base=3.0 + S*S*5.0;                          // スピードを二乗で効かせる
      const air=Math.min(Math.max(airTaps,0),10)*0.1, pen=(FOUL-takeoffX)*4.0;
      return Math.max(0,Math.round((base+air-pen)*100)/100);
    }

    let phase='intro';        // intro / ready / run / air / shown / final
    let x=0,v=0,airTaps=0,prevSide=null,prevTime=0,takeoffX=0,baseDist=0,targetDist=0,curDist=0;
    let players=[], pi=0, numPlayers=2, attempt=0, names=[];
    let last=performance.now(), airStart=0, legPhase=0, landed=false, zonePrompted=false, runCycle=0;
    const FLIGHT=1200;

    function setStage(t,cls){ $('stage').textContent=t; $('stage').className='stage '+(cls||''); }
    function setBtns(html){ $('btns').innerHTML=html; }
    function renderAtt(){
      const p=players[pi]; if(!p) return;
      $('who').textContent=p.name;
      $('attemptPill').textContent=`試技 ${Math.min(attempt+1,3)} / 3`;
      $('bestPill').textContent = p.best!==null?p.best.toFixed(2)+'m':'--';
      $('attempts').innerHTML = p.results.map((r,i)=>{
        const lab = r===null?'-' : r===0?'ファウル' : r.toFixed(2)+'m';
        const isBest = p.best!==null && r===p.best && r>0;
        return `<div class="att${isBest?' best':''}">${i+1}回目<br>${lab}</div>`;
      }).join('');
    }

    /* ---------- input (bottom tap pad) ---------- */
    function handleRun(side){
      if(phase!=='run') return;
      const now=performance.now();
      const inZone=(x>=ZONE_START && x<=FOUL);
      const isDouble = side===prevSide && (now-prevTime<340);
      if(inZone && isDouble){ takeoff(); }
      else {
        if(side!==prevSide) v=Math.min(VMAX, v+STEP);   // good alternating step
        else v=Math.max(0, v-0.02);                      // same side (stumble)
        legPhase^=1;
      }
      prevSide=side; prevTime=now;
    }
    function handleAir(){
      if(phase!=='air') return;
      airTaps++; targetDist=Math.min(baseDist+1.0, targetDist+0.1);
    }
    $('padL').addEventListener('pointerdown',e=>{e.preventDefault();handleRun('L');});
    $('padR').addEventListener('pointerdown',e=>{e.preventDefault();handleRun('R');});
    $('padMash').addEventListener('pointerdown',e=>{e.preventDefault();handleAir();});

    function updatePad(){
      const run=(phase==='run'), air=(phase==='air');
      $('pad').style.display=(run||air)?'flex':'none';
      $('padL').style.display=run?'flex':'none';
      $('padR').style.display=run?'flex':'none';
      $('padMash').style.display=air?'flex':'none';
    }
    function updateSpeedUI(){
      const S=Math.max(0,Math.min(1,v/VMAX));
      $('spdfill').style.width=(S*100)+'%';
      $('spdtxt').textContent=Math.round(S*38)+' km/h';
    }

    /* ---------- game flow ---------- */
    function startAttempt(){
      phase='run'; x=0; v=0; airTaps=0; prevSide=null; prevTime=0; landed=false; zonePrompted=false; runCycle=0;
      setStage('助走！ 下の「左」「右」を交互に連打','run');
      setBtns('');
      updatePad(); updateSpeedUI();
      $('hint').textContent='下のボタンを左右交互に押して加速。踏切ゾーン（赤い線の手前）で「同じボタンを2回すばやく」押すとジャンプ！線を越えるとファウル。';
    }
    function takeoff(){
      takeoffX=x; const S=v/VMAX;
      baseDist=computeDistance(S,takeoffX,0);
      if(baseDist===null){ foul(); return; }
      targetDist=baseDist; curDist=baseDist;
      phase='air'; airStart=performance.now();
      updatePad();
      setStage('空中！ 「連打！」ボタンを叩いて伸ばせ！','air');
      $('hint').textContent='着地まで連打！ たくさん叩くほど距離が伸びる。';
    }
    function foul(){
      phase='shown'; players[pi].results[attempt]=0; recomputeBest(); renderAtt(); updatePad();
      setStage('踏み切り板を越えた！ ファウル','foul');
      $('hint').textContent='踏切は線を越えないように。';
      nextButton();
    }
    function land(){
      landed=true; phase='shown'; updatePad();
      curDist=targetDist; players[pi].results[attempt]=curDist; recomputeBest(); renderAtt();
      setStage(`記録 ${curDist.toFixed(2)} m！`,'ok');
      $('hint').textContent='';
      if(window.cgCelebrate) cgCelebrate.correct();
      nextButton();
    }
    function recomputeBest(){ const p=players[pi]; p.best=null; p.results.forEach(r=>{ if(r!==null&&r>0&&(p.best===null||r>p.best)) p.best=r; }); }
    function nextButton(){
      if(attempt<2){
        setBtns('<button class="act" id="nx">次の試技 ▶</button>');
        $('nx').onclick=()=>{ attempt++; renderAtt(); startAttempt(); };
      } else if(pi<numPlayers-1){
        const np=players[pi+1].name;
        setBtns(`<button class="act" id="np">${np} の番へ ▶</button>`);
        $('np').onclick=()=>{ pi++; beginPlayerTurn(); };
      } else {
        phase='final'; showFinal();
      }
    }
    function beginPlayerTurn(){
      const p=players[pi]; p.results=[null,null,null]; p.best=null; attempt=0;
      phase='ready'; x=0; v=0; runCycle=0; landed=false;
      updatePad(); updateSpeedUI(); updatePcount(); renderAtt();
      setStage(`${p.name} の番！ 用意ができたらスタート`,'ok');
      setBtns('<button class="act" id="go2">助走スタート</button>'); $('go2').onclick=startAttempt;
      $('hint').textContent=`全${numPlayers}人が3回ずつ挑戦。ベスト記録で順位を競います。`;
    }
    function showFinal(){
      updatePad(); updatePcount();
      const ranked=players.map(p=>({name:p.name,best:p.best})).sort((a,b)=>((b.best||-1)-(a.best||-1)));
      const medal=['🥇','🥈','🥉'];
      $('attempts').innerHTML = ranked.map((p,i)=>{
        const lab=p.best?p.best.toFixed(2)+'m':'記録なし';
        return `<div class="att${i===0&&p.best?' best':''}" style="min-width:78px;">${medal[i]||(i+1)+'位'} ${p.name}<br>${lab}</div>`;
      }).join('');
      if(numPlayers===1){
        const b=ranked[0].best;
        const c = b===null?'記録なし…。もう一度挑戦！':b>=8.5?'世界記録級！とんでもない跳躍！🏅':b>=7.5?'日本トップ級！お見事！':b>=6.5?'すばらしい跳躍！':b>=5.5?'なかなかの記録！':'まだ伸びしろあり！';
        setStage(c, b&&b>=7.5?'ok':'');
        if(window.cgCelebrate){ if(b===null) cgCelebrate.fail('記録なし…','もう一度挑戦！'); else cgCelebrate.win(b.toFixed(2)+'m！', c); }
      } else {
        setStage(ranked[0].best?`優勝：${ranked[0].name}！ 🏆`:'結果発表','ok');
        if(window.cgCelebrate){
          if(ranked[0].best) cgCelebrate.win(`優勝：${ranked[0].name}！`, ranked[0].best.toFixed(2)+'m');
          else cgCelebrate.fail('記録なし…','もう一度挑戦！');
        }
      }
      $('hint').textContent='';
      setBtns('<button class="act" id="again">もう一度</button>'); $('again').onclick=toIntro;
    }
    function toIntro(){
      phase='intro'; players=[]; pi=0; attempt=0;
      setStage('人数を選んでスタート！');
      $('who').textContent='プレイヤー1'; $('attemptPill').textContent='試技 1 / 3'; $('bestPill').textContent='--';
      $('attempts').innerHTML='';
      $('hint').textContent='1台を回して順番にプレイ。各自3回ずつ跳び、ベスト記録で順位を競います。';
      setBtns('<button class="act" id="go">スタート</button>'); $('go').onclick=startGame;
      updatePad(); updatePcount(); updateSpeedUI();
    }
    function renderNames(){
      const box=$('names'); box.innerHTML='';
      for(let i=0;i<numPlayers;i++){
        const def = (names[i]&&names[i].length)?names[i]:`プレイヤー${i+1}`;
        names[i]=def;
        const row=document.createElement('label'); row.className='namerow';
        row.innerHTML=`<span>P${i+1}</span>`;
        const inp=document.createElement('input'); inp.type='text'; inp.maxLength=10; inp.value=def;
        inp.addEventListener('input',()=>{ names[i]=inp.value; });
        row.appendChild(inp); box.appendChild(row);
      }
    }
    function updatePcount(){
      const at=(phase==='intro');
      $('pcount').style.display=at?'flex':'none';
      $('names').style.display=at?'flex':'none';
      if(at) renderNames();
    }
    $('pseg').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; [...e.currentTarget.children].forEach(x=>x.classList.remove('on')); b.classList.add('on'); numPlayers=parseInt(b.dataset.p,10); renderNames(); });
    function startGame(){
      players=[]; for(let i=0;i<numPlayers;i++){ const nm=(names[i]&&names[i].trim())||`プレイヤー${i+1}`; players.push({name:nm, results:[null,null,null], best:null}); }
      pi=0; beginPlayerTurn();
    }

    /* ---------- loop & draw ---------- */
    function loop(now){
      const dt=Math.min(0.05,(now-last)/1000); last=now;
      if(phase==='run'){
        v=Math.max(0, v-DECAYP*v*dt);
        x+=v*POSF*dt;
        runCycle += (0.4 + (v/VMAX)*2.4)*dt;     // leg cycle speeds up with running speed
        if(x>=ZONE_START && !zonePrompted){ zonePrompted=true; setStage('今だ！ 同じボタンを2回でジャンプ！','ok'); }
        if(x>=FOUL){ x=FOUL+0.001; foul(); }     // ran past the line
        updateSpeedUI();
      } else if(phase==='air'){
        const p=Math.min(1,(now-airStart)/FLIGHT);
        curDist=targetDist;
        if(p>=1 && !landed) land();
      }
      draw(now);
      requestAnimationFrame(loop);
    }

    const SEG={TH:10,SH:10,TO:15,UP:8,FO:8,NK:5,HEAD:6};
    function pt(o,ang,len){ return {x:o.x+Math.sin(ang)*len, y:o.y+Math.cos(ang)*len}; }
    function seg(a,b){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
    function drawFigure(cx,hipY,a){
      const S=SEG, hip={x:cx,y:hipY};
      const sh={x:hip.x+Math.sin(a.lean)*S.TO, y:hip.y-Math.cos(a.lean)*S.TO};
      const hd={x:sh.x+Math.sin(a.lean)*S.NK, y:sh.y-Math.cos(a.lean)*S.NK};
      ctx.strokeStyle='#2b2b2b'; ctx.lineWidth=3; ctx.lineCap='round'; ctx.lineJoin='round';
      // back limbs (faded for depth)
      ctx.globalAlpha=0.5;
      const kL=pt(hip,a.tL,S.TH), ftL=pt(kL,a.sL,S.SH); seg(hip,kL); seg(kL,ftL);
      const eL=pt(sh,a.aL,S.UP), wL=pt(eL,a.fL,S.FO); seg(sh,eL); seg(eL,wL);
      ctx.globalAlpha=1;
      seg(hip,sh);                                   // torso
      ctx.fillStyle='#a52a2a'; ctx.beginPath(); ctx.arc(hd.x,hd.y-S.HEAD*0.2,S.HEAD,0,7); ctx.fill();
      const kR=pt(hip,a.tR,S.TH), ftR=pt(kR,a.sR,S.SH); seg(hip,kR); seg(kR,ftR);  // front leg
      const eR=pt(sh,a.aR,S.UP), wR=pt(eR,a.fR,S.FO); seg(sh,eR); seg(eR,wR);      // front arm
    }
    function runPose(c){
      const ph=c*Math.PI*2;
      const tR=Math.sin(ph)*0.8, kR=0.35+0.85*Math.max(0,Math.sin(ph));        // 前に振った脚ほどひざを深く曲げる
      const tL=Math.sin(ph+Math.PI)*0.8, kL=0.35+0.85*Math.max(0,Math.sin(ph+Math.PI));
      const sArmR=-Math.sin(ph), sArmL=Math.sin(ph);                           // 腕の振り（前+ / 後-、脚と逆）
      const arm=s=>{ const up = s>=0 ? s*0.6 : s*1.9; return {a:up, f:up+1.5}; }; // 後ろ振りでは肘を高く上げる
      const AR=arm(sArmR), AL=arm(sArmL);
      return { lean:0.32,
        tR, sR:tR-kR, tL, sL:tL-kL,                                           // ひざ＝太もも−後ろ曲げ
        aR:AR.a, fR:AR.f, aL:AL.a, fL:AL.f };                                 // ひじ＝上腕＋前折りたたみ
    }
    const STAND={lean:0.05, tR:-0.12,sR:-0.20, tL:0.12,sL:0.04, aR:-0.15,fR:0.10, aL:0.15,fL:0.40};
    function lerpPose(A,B,t){ const o={}; for(const k in A) o[k]=A[k]+(B[k]-A[k])*t; return o; }
    // 踏切：リード脚を引き上げ深く曲げ、後ろ脚は蹴り伸ばし、腕を振り上げる
    const AIR0={lean:0.45, tR:0.9,sR:-0.3, tL:-0.8,sL:-1.1, aR:2.2,fR:2.5, aL:2.3,fL:2.6};
    // 空中：両ひざを体の下にたたむ
    const AIR1={lean:0.10, tR:0.5,sR:-0.9, tL:0.2,sL:-1.1, aR:1.9,fR:2.3, aL:2.0,fL:2.4};
    // 着地：両脚を前へ伸ばし（ひざは軽く曲げる）、腕は前へ
    const AIR2={lean:-0.20, tR:1.2,sR:0.9, tL:1.1,sL:0.75, aR:0.9,fR:1.4, aL:0.95,fL:1.45};
    // 尻もち：お尻を地面につけて最下点に、脚は前へ放り出して足はお尻より上、手は前について踏ん張る
    const SIT={lean:0.10, tR:1.95,sR:1.5, tL:1.85,sL:1.4, aR:0.8,fR:1.2, aL:0.9,fL:1.3};
    function airPose(p){ return p<0.45 ? lerpPose(AIR0,AIR1,p/0.45) : lerpPose(AIR1,AIR2,(p-0.45)/0.55); }
    function shadow(cx,gy,s){ ctx.fillStyle='rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(cx,gy+1,12*s,3.5,0,0,7); ctx.fill(); }
    function draw(now){
      ctx.clearRect(0,0,W,H);
      // runway
      ctx.fillStyle='#c08a5a'; ctx.fillRect(0,groundY,boardX,H-groundY);
      // lane lines
      ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=1;
      for(let i=1;i<8;i++){ const lx=i/8*boardX; ctx.beginPath(); ctx.moveTo(lx,groundY); ctx.lineTo(lx,groundY+5); ctx.stroke(); }
      // takeoff board (white) + foul line (red)
      ctx.fillStyle='#f4efe2'; ctx.fillRect(boardX-26,groundY,26,6);
      ctx.fillStyle='#a52a2a'; ctx.fillRect(boardX-3,groundY,3,7);
      // takeoff zone highlight when running near
      if(phase==='run' && x>=ZONE_START){ ctx.fillStyle='rgba(224,184,76,.45)'; ctx.fillRect(boardX-26,groundY-3,26,3); }
      // sand pit
      ctx.fillStyle='#e9d7a8'; ctx.fillRect(boardX,groundY,W-boardX,H-groundY);
      // meter markers
      ctx.fillStyle='rgba(120,95,40,.6)'; ctx.font='9px monospace'; ctx.textAlign='center';
      for(let m=1;m<=9;m++){ const mx=boardX+m*pxPerM; ctx.fillRect(mx,groundY,1,m%2===1?7:4); if(m%2===1) ctx.fillText(m+'m',mx,groundY+17); }

      // athlete
      const HIPH=20, baseHip=groundY-HIPH;
      if(phase==='intro'){
        shadow(8,groundY,1); drawFigure(8,baseHip,STAND);
      } else if(phase==='run'){
        const ax=x*boardX, bob=-Math.abs(Math.sin(runCycle*Math.PI*2))*2.5;
        shadow(ax,groundY,1); drawFigure(ax,baseHip+bob,runPose(runCycle));
      } else if(phase==='air'){
        const p=Math.min(1,(now-airStart)/FLIGHT);
        const arc=Math.min(95,42+curDist*6);
        const ax=boardX+curDist*pxPerM*p, hipY=baseHip-arc*4*p*(1-p);
        drawFigure(ax,hipY,airPose(p));
        ctx.fillStyle='#3f7f9e'; ctx.font='bold 13px monospace'; ctx.textAlign='center'; ctx.fillText(curDist.toFixed(2)+'m', ax, hipY-20);
      } else { // ready / shown / final
        const r=players[pi]?players[pi].results[attempt]:null;
        let ax=8;
        if(r===0) ax=boardX-12; else if(r) ax=Math.min(W-10, boardX+r*pxPerM);
        if(r&&r>0){ shadow(ax,groundY,1.3); drawFigure(ax, groundY-2, SIT); }   // 尻もち（お尻が最下点）
        else { shadow(ax,groundY,1); drawFigure(ax, baseHip, STAND); }
      }
    }

    toIntro();
    requestAnimationFrame(loop);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
