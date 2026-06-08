// ============================================================
//  サイコロ役づくり（ヤッツィー系・2〜6人 パス＆プレイ）
//  ※ アップロードされたロジックを外部JS化（#yacht にスコープ）
// ============================================================
(function(){
  function init(){
    if(!document.getElementById("pcount")) return;
const $=id=>document.getElementById(id);
const r6=()=>1+Math.floor(Math.random()*6);
const PIP={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};

// categories
const CATS=[
  {k:'ones',  s:'upper', label:'1の目',  fn:d=>face(d,1)},
  {k:'twos',  s:'upper', label:'2の目',  fn:d=>face(d,2)},
  {k:'threes',s:'upper', label:'3の目',  fn:d=>face(d,3)},
  {k:'fours', s:'upper', label:'4の目',  fn:d=>face(d,4)},
  {k:'fives', s:'upper', label:'5の目',  fn:d=>face(d,5)},
  {k:'sixes', s:'upper', label:'6の目',  fn:d=>face(d,6)},
  {k:'three', s:'lower', label:'3つぞろい', fn:d=>cnt(d).some(x=>x>=3)?sum(d):0},
  {k:'four',  s:'lower', label:'4つぞろい', fn:d=>cnt(d).some(x=>x>=4)?sum(d):0},
  {k:'full',  s:'lower', label:'フルハウス（25）', fn:d=>{const c=cnt(d);return ((c.includes(3)&&c.includes(2))||c.includes(5))?25:0;}},
  {k:'sstr',  s:'lower', label:'小ストレート（30）', fn:d=>hasRun(d,4)?30:0},
  {k:'lstr',  s:'lower', label:'大ストレート（40）', fn:d=>hasRun(d,5)?40:0},
  {k:'yacht', s:'lower', label:'ヤッツィー（50）', fn:d=>cnt(d).some(x=>x===5)?50:0},
  {k:'chance',s:'lower', label:'チャンス', fn:d=>sum(d)},
];
function face(d,f){return d.filter(v=>v===f).length*f;}
function sum(d){return d.reduce((a,b)=>a+b,0);}
function cnt(d){const c=[0,0,0,0,0,0,0];d.forEach(v=>c[v]++);return c;}
function hasRun(d,len){
  const set=new Set(d);
  const runs = len===4 ? [[1,2,3,4],[2,3,4,5],[3,4,5,6]] : [[1,2,3,4,5],[2,3,4,5,6]];
  return runs.some(run=>run.every(v=>set.has(v)));
}

let players=[], cur=0, round=1, dice=[1,1,1,1,1], held=[false,false,false,false,false], rollsLeft=3, rolled=false;
let animating=false, animFace=[1,1,1,1,1], rolling=[false,false,false,false,false];

/* ---- setup ---- */
let nPlayers=2;
function buildNameInputs(){
  $('names').innerHTML='';
  for(let i=0;i<nPlayers;i++){
    const inp=document.createElement('input');
    inp.type='text'; inp.value='プレイヤー'+(i+1); inp.maxLength=10; inp.id='nm'+i;
    $('names').appendChild(inp);
  }
}
$('pcount').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b)return;
  [...e.currentTarget.children].forEach(x=>x.classList.remove('on'));
  b.classList.add('on'); nPlayers=parseInt(b.dataset.n,10); buildNameInputs();
});
$('start').addEventListener('click',()=>{
  players=[];
  for(let i=0;i<nPlayers;i++){
    const nm=($('nm'+i).value||('プレイヤー'+(i+1))).trim();
    players.push({name:nm, scores:{}});
  }
  cur=0; round=1;
  $('setup').classList.add('hidden'); $('result').classList.add('hidden'); $('game').classList.remove('hidden');
  newTurn();
});

/* ---- turn flow ---- */
function newTurn(){
  dice=[1,1,1,1,1]; held=[false,false,false,false,false]; rollsLeft=3; rolled=false;
  render();
}
$('roll').addEventListener('click',()=>{
  if(rollsLeft<=0 || animating) return;
  for(let i=0;i<5;i++){ rolling[i]=!held[i]; if(!held[i]) dice[i]=r6(); }
  rollsLeft--; rolled=true;
  animating=true; $('roll').disabled=true;
  let ticks=0; const TT=9;
  const iv=setInterval(()=>{
    ticks++;
    for(let i=0;i<5;i++) if(rolling[i]) animFace[i]=r6();
    drawDice();
    if(ticks>=TT){ clearInterval(iv); animating=false; rolling=[false,false,false,false,false]; render(); }
  }, 55);
});
$('greset') && $('greset').addEventListener('click',()=>{
  if(animating) return;
  if(confirm('ゲームをリセットして人数選択に戻りますか？（今の得点は消えます）')){
    $('game').classList.add('hidden'); $('setup').classList.remove('hidden');
  }
});
function toggleHold(i){ if(!rolled) return; held[i]=!held[i]; render(); }
function choose(catKey){
  if(!rolled) return;
  if(players[cur].scores[catKey]!==undefined) return;
  const cat=CATS.find(c=>c.k===catKey);
  players[cur].scores[catKey]=cat.fn(dice);
  advance();
}
function advance(){
  cur++;
  if(cur>=players.length){ cur=0; round++; if(round>13){ endGame(); return; } }
  newTurn();
}

/* ---- scoring totals ---- */
function upperSub(p){return ['ones','twos','threes','fours','fives','sixes'].reduce((a,k)=>a+(p.scores[k]||0),0);}
function bonus(p){return upperSub(p)>=63?35:0;}
function lowerSum(p){return ['three','four','full','sstr','lstr','yacht','chance'].reduce((a,k)=>a+(p.scores[k]||0),0);}
function total(p){return upperSub(p)+bonus(p)+lowerSum(p);}

/* ---- render ---- */
function render(){
  $('who').textContent=players[cur].name+' の番';
  $('meta').textContent=`ラウンド ${round}/13 ・ 残り ${rollsLeft} 回`;
  $('roll').disabled = rollsLeft<=0;
  $('roll').textContent = rollsLeft===3 ? 'サイコロを振る' : `振り直す（残り${rollsLeft}）`;
  $('ghint').textContent = !rolled ? 'サイコロを振ってください。'
    : (rollsLeft>0 ? '残す目をタップ→振り直すか、緑のマスをタップして役を決めます。' : '緑のマスをタップして役を1つ選びます（0点でもOK）。');

  drawDice();
  renderCard();
}
function faceFor(i){ return (animating && rolling[i]) ? animFace[i] : dice[i]; }
function drawDice(){
  const dc=$('dice'); dc.innerHTML='';
  for(let i=0;i<5;i++){
    const die=document.createElement('div');
    const showPips = rolled || animating;
    die.className='die'+(!showPips?' empty':'')+(held[i]?' held':'')+((animating&&rolling[i])?' rolling':'');
    if(showPips){
      const f=faceFor(i);
      for(let cell=0;cell<9;cell++){
        const c=document.createElement('div');
        if(PIP[f].includes(cell)){const p=document.createElement('div');p.className='pip';c.appendChild(p);}
        die.appendChild(c);
      }
      if(!animating) die.addEventListener('click',()=>toggleHold(i));
    }
    dc.appendChild(die);
  }
}
function renderCard(){
  const t=$('card');
  let h='<thead><tr><th class="cat">役</th>';
  players.forEach((p,i)=>{ h+=`<th class="${i===cur?'curcol':''}">${esc(p.name)}</th>`; });
  h+='</tr></thead><tbody>';

  const drawSection=(sec,title)=>{
    h+=`<tr class="secthead"><td colspan="${players.length+1}">${title}</td></tr>`;
    CATS.filter(c=>c.s===sec).forEach(cat=>{
      h+=`<tr><td class="cat">${cat.label}</td>`;
      players.forEach((p,i)=>{
        const isCur=i===cur, val=p.scores[cat.k];
        if(val!==undefined){
          h+=`<td class="filled ${isCur?'curcol curdone':''}">${val}</td>`;
        }else if(isCur && rolled){
          const pv=cat.fn(dice);
          h+=`<td class="pick curcol ${pv===0?'zero':''}" data-k="${cat.k}">${pv}</td>`;
        }else{
          h+=`<td class="${isCur?'curcol':''}">–</td>`;
        }
      });
      h+='</tr>';
    });
  };
  drawSection('upper','上の段（1〜6の目／合計63以上でボーナス+35）');
  // upper subtotal + bonus
  h+=`<tr><td class="cat">上の段 小計</td>`;
  players.forEach((p,i)=>h+=`<td class="filled ${i===cur?'curcol':''}">${upperSub(p)}</td>`); h+='</tr>';
  h+=`<tr><td class="cat">ボーナス</td>`;
  players.forEach((p,i)=>h+=`<td class="filled ${i===cur?'curcol':''}">${bonus(p)}</td>`); h+='</tr>';
  drawSection('lower','下の段（役）');
  h+=`<tr class="total"><td class="cat">合計</td>`;
  players.forEach((p,i)=>h+=`<td class="${i===cur?'curcol':''}">${total(p)}</td>`); h+='</tr>';
  h+='</tbody>';
  t.innerHTML=h;

  t.querySelectorAll('td.pick').forEach(td=>td.addEventListener('click',()=>choose(td.dataset.k)));
}
function esc(s){return s.replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));}

/* ---- result ---- */
function endGame(){
  $('game').classList.add('hidden'); $('result').classList.remove('hidden');
  const ranked=[...players].map(p=>({name:p.name,pts:total(p)})).sort((a,b)=>b.pts-a.pts);
  const medal=['🥇','🥈','🥉'];
  let h='';
  ranked.forEach((p,i)=>{
    const pos = i<3?medal[i]:(i+1)+'位';
    h+=`<div class="rankrow ${i===0?'first':''}"><div class="pos">${pos}</div>`
      +`<div class="nm">${esc(p.name)}</div><div class="pts">${p.pts} 点</div></div>`;
  });
  $('rank').innerHTML=h;
}
$('again').addEventListener('click',()=>{
  players.forEach(p=>p.scores={}); cur=0; round=1;
  $('result').classList.add('hidden'); $('game').classList.remove('hidden'); newTurn();
});
$('reset').addEventListener('click',()=>{
  $('result').classList.add('hidden'); $('setup').classList.remove('hidden');
});

buildNameInputs();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
