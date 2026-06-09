// ============================================================
//  特殊算ドリル（鶴亀算/旅人算/仕事算/流水算/ニュートン算）
//  ※ アップロードされたロジックをそのまま外部JS化（#drill にスコープ）
// ============================================================
(function(){
  function init(){
    if(!document.getElementById("levelSeg")) return;
const KINDS=['鶴亀算','旅人算','仕事算','流水算','ニュートン算'];
let level=1, idx=0, probs=[], answered=[];

const $=id=>document.getElementById(id);
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const choice=a=>a[Math.floor(Math.random()*a.length)];
function gcd(a,b){ while(b){[a,b]=[b,a%b];} return a; }
function lcm(a,b){ return a/gcd(a,b)*b; }
function lcm3(a,b,c){ return lcm(lcm(a,b),c); }
function divisors(n){ const d=[]; for(let i=1;i<=n;i++) if(n%i===0) d.push(i); return d; }

/* ============ generators (answer-first → integers guaranteed) ============ */
function genTsuruKame(lv){
  if(lv>=4){
    const c=ri(2,8), k=2*c, o=ri(2,8);   // カメ＝ツル×2
    const N=c+k+o, L=2*c+4*k+8*o;
    return {
      kind:'鶴亀算（3種類・応用）',
      q:`不思議な水族館に <b>ツル</b>（足2本）、<b>カメ</b>（足4本）、<b>タコ</b>（足8本）が`
        +`合わせて <b>${N}</b> 匹います。足の数は全部で <b>${L}</b> 本。`
        +`さらに、カメの数はツルの数のちょうど <b>2倍</b> でした。`
        +`ツル・カメ・タコはそれぞれ何匹ですか？`,
      fields:[{key:'c',label:'ツル',unit:'匹'},{key:'k',label:'カメ',unit:'匹'},{key:'o',label:'タコ',unit:'匹'}],
      ans:{c,k,o},
      explain:()=>`<h4>考え方：カメ＝ツル×2 を使って文字を減らす</h4>`
        +`ツルを c 匹とすると、カメは 2c 匹。タコを o 匹とします。<br>`
        +`頭数：c＋2c＋o＝3c＋o＝${N}　…①<br>`
        +`足：2c＋4×2c＋8o＝10c＋8o＝${L}　…②<br>`
        +`①より o＝${N}−3c。これを②に代入すると 10c＋8(${N}−3c)＝${L}。<br>`
        +`整理して 8×${N}−14c＝${L} → c＝(${8*N}−${L})÷14＝<span class="ans">ツル ${c} 匹</span>。<br>`
        +`カメ＝2×${c}＝<span class="ans">${k} 匹</span>、タコ＝${N}−3×${c}＝<span class="ans">${o} 匹</span>。`
    };
  }
  if(lv===1){
    const range=[5,12], N=ri(range[0],range[1]);
    const t=ri(1,N-1), c=N-t, L=2*c+4*t;
    return {
      kind:'鶴亀算（基本）',
      q:`小屋に <b>ツル</b> と <b>カメ</b> が合わせて <b>${N}</b> 匹います。`
        +`足の数を全部数えると <b>${L}</b> 本でした。ツルとカメはそれぞれ何匹ですか？`
        +`<br><span class="unit">（ツルの足は2本、カメの足は4本）</span>`,
      fields:[{key:'c',label:'ツル',unit:'匹'},{key:'t',label:'カメ',unit:'匹'}],
      ans:{c,t},
      explain:()=>{const allCrane=2*N,diff=L-allCrane;
        return `<h4>考え方：全部ツルだと仮定する</h4>`
         +`全部ツルなら足は 2×${N}＝${allCrane} 本。実際は ${L} 本で、差は ${diff} 本。<br>`
         +`カメ1匹で足が2本増えるので、カメ＝${diff}÷2＝<span class="ans">${t} 匹</span>、`
         +`ツル＝${N}−${t}＝<span class="ans">${c} 匹</span>。`;}
    };
  }
  if(lv===2){
    let c,t;do{const N=ri(8,20);t=ri(2,N-1);c=N-t;}while(!(2*t>c+1));
    const N=c+t, D=4*t-2*c;
    return {
      kind:'鶴亀算（足の差）',
      q:`ツルとカメが合わせて <b>${N}</b> 匹います。`
        +`カメの足の合計は、ツルの足の合計より <b>${D}</b> 本多いそうです。`
        +`ツルとカメはそれぞれ何匹ですか？`,
      fields:[{key:'c',label:'ツル',unit:'匹'},{key:'t',label:'カメ',unit:'匹'}],
      ans:{c,t},
      explain:()=>`<h4>考え方：全部カメ・全部ツルで差をはさむ</h4>`
        +`ツルを c 匹、カメを t 匹とすると c＋t＝${N}、4t−2c＝${D}。<br>`
        +`下の式に c＝${N}−t を代入すると 4t−2(${N}−t)＝${D} → 6t−${2*N}＝${D}。<br>`
        +`t＝(${D}＋${2*N})÷6＝<span class="ans">カメ ${t} 匹</span>、c＝${N}−${t}＝<span class="ans">ツル ${c} 匹</span>。`
    };
  }
  // lv 3: 3種類だがタコの数が分かっている
  const hi=14, c=ri(2,hi), t=ri(2,hi), o=ri(2,8);
  const N=c+t+o, L=2*c+4*t+8*o;
  return {
    kind:'鶴亀算（3種類・タコ既知）',
    q:`水族館に <b>ツル</b>（足2本）、<b>カメ</b>（足4本）、<b>タコ</b>（足8本）が`
      +`合わせて <b>${N}</b> 匹いて、足は全部で <b>${L}</b> 本です。`
      +`このうちタコが <b>${o}</b> 匹だと分かっています。ツルとカメはそれぞれ何匹ですか？`,
    fields:[{key:'c',label:'ツル',unit:'匹'},{key:'t',label:'カメ',unit:'匹'}],
    ans:{c,t},
    explain:()=>`<h4>考え方：まずタコを除いて、ふつうの鶴亀算にする</h4>`
      +`タコ${o}匹は頭数で ${o}、足で 8×${o}＝${8*o} 本ぶん。<br>`
      +`残りのツル＋カメは ${N}−${o}＝${N-o} 匹、足は ${L}−${8*o}＝${L-8*o} 本。<br>`
      +`全部ツルと仮定すると足は 2×${N-o}＝${2*(N-o)} 本、差は ${L-8*o}−${2*(N-o)}＝${(L-8*o)-2*(N-o)} 本。<br>`
      +`カメ＝${(L-8*o)-2*(N-o)}÷2＝<span class="ans">${t} 匹</span>、ツル＝${N-o}−${t}＝<span class="ans">${c} 匹</span>。`
  };
}

function genTabibito(lv){
  if(lv>=4){
    let vA,vB,t1,t2,Dr,tries=0;
    do{
      vB=ri(2,8); vA=vB+ri(1,8);
      const sum=vA+vB, diff=vA-vB, g=gcd(sum,diff), s=ri(1,2);
      t1=s*diff/g; t2=s*sum/g; Dr=s*sum*diff/g;
      tries++;
    }while((t1<1||t2<1||t1>18||t2>18||t1===t2)&&tries<200);
    const SC=10, VA=vA*SC, VB=vB*SC, D=Dr*SC;   // 実感の出る速さに換算
    return {
      kind:'旅人算（周回コース・応用）',
      q:`1周 <b>${D}</b> m の周回コースを、AとBが同じ地点から同時に出発します。`
        +`<b>反対向き</b> に回ると <b>${t1}</b> 分で初めて出会い、`
        +`<b>同じ向き</b> に回るとAがBに <b>${t2}</b> 分で初めて追いつきます。`
        +`AとBの速さはそれぞれ分速何mですか？（Aの方が速い）`,
      fields:[{key:'vA',label:'Aの速さ',unit:'m/分'},{key:'vB',label:'Bの速さ',unit:'m/分'}],
      ans:{vA:VA,vB:VB},
      explain:()=>`<h4>考え方：出会い＝速さの和、追いつき＝速さの差</h4>`
        +`反対向きは1周ぶん近づいて出会うので、速さの和＝${D}÷${t1}＝分速 ${VA+VB} m。<br>`
        +`同じ向きは1周ぶんの差をつめて追いつくので、速さの差＝${D}÷${t2}＝分速 ${VA-VB} m。<br>`
        +`A＝(和＋差)÷2＝(${VA+VB}＋${VA-VB})÷2＝<span class="ans">分速 ${VA} m</span>。<br>`
        +`B＝(和−差)÷2＝<span class="ans">分速 ${VB} m</span>。`
    };
  }
  if(lv===1){ // 追いつき（同時・距離の差）
    const vA=ri(40,70), diff=ri(10,30), vB=vA+diff, T=ri(3,9), gap=diff*T;
    return {
      kind:'旅人算（追いつき）',
      q:`妹が分速 <b>${vA}</b> m で歩いています。妹の <b>${gap}</b> m 後ろから、`
        +`姉が同時に分速 <b>${vB}</b> m で追いかけ始めました。`
        +`姉が妹に追いつくのは何分後ですか？`,
      fields:[{key:'T',label:'追いつくまで',unit:'分後'}],
      ans:{T},
      explain:()=>`<h4>考え方：速さの「差」で差がちぢむ</h4>`
        +`速さの差は ${vB}−${vA}＝${diff} m/分。最初の差 ${gap} m をこの差でちぢめるので、<br>`
        +`${gap}÷${diff}＝<span class="ans">${T} 分後</span>。`
    };
  }
  if(lv===2){ // 出会い
    const vA=ri(40,80), vB=ri(40,80), T=ri(4,12), D=(vA+vB)*T;
    return {
      kind:'旅人算（出会い）',
      q:`A町とB町は <b>${D}</b> m 離れています。太郎はA町から分速 <b>${vA}</b> m、`
        +`花子はB町から分速 <b>${vB}</b> m で、同時に向かい合って歩き出しました。`
        +`2人が出会うのは何分後ですか？`,
      fields:[{key:'T',label:'出会うまで',unit:'分後'}],
      ans:{T},
      explain:()=>`<h4>考え方：向かい合うので速さの「和」でちぢむ</h4>`
        +`1分で ${vA}＋${vB}＝${vA+vB} m ずつ近づきます。はじめの距離 ${D} m を縮めるので、<br>`
        +`${D}÷${vA+vB}＝<span class="ans">${T} 分後</span>。`
    };
  }
  // lv 3: 時間差のある追いつき（先行距離を出す2段階）
  let vA,vB,h,T,tries=0;
  do{ vA=ri(50,90); vB=vA+ri(10,40); h=ri(3,12);
      const gap=vA*h; T=(gap%(vB-vA)===0)? gap/(vB-vA) : -1; tries++;
  }while((T<3||T>40)&&tries<300);
  const gap=vA*h;
  return {
    kind:'旅人算（時間差で追いつき）',
    q:`兄が分速 <b>${vA}</b> m で家を出ました。その <b>${h}</b> 分後に、`
      +`弟が同じ道を分速 <b>${vB}</b> m で追いかけます。`
      +`弟が兄に追いつくのは、弟が出発してから何分後ですか？`,
    fields:[{key:'T',label:'追いつくまで',unit:'分後'}],
    ans:{T},
    explain:()=>`<h4>考え方：まず先行距離を出してから追いつく</h4>`
      +`弟が出るまでに兄は ${vA}×${h}＝${gap} m 先行しています。<br>`
      +`そこからは速さの差 ${vB}−${vA}＝${vB-vA} m/分でちぢめるので、<br>`
      +`${gap}÷${vB-vA}＝<span class="ans">${T} 分後</span>。`
  };
}

function genShigoto(lv){
  if(lv>=4){
    const set=[1,2,3,4,6]; let a,b,c,T,tries=0;
    do{
      const rA=choice(set), rB=choice(set), rC=choice(set);
      const K=lcm3(rA,rB,rC), W=K*(rA+rB+rC);
      a=W/rA; b=W/rB; c=W/rC; T=K;
      tries++;
    }while((a>60||b>60||c>60||(a===b&&b===c))&&tries<200);
    const L=lcm3(a,b,c), ra=L/a, rb=L/b, rc=L/c;
    return {
      kind:'仕事算（3人・応用）',
      q:`ある仕事を、Aさん1人だと <b>${a}</b> 日、Bさん1人だと <b>${b}</b> 日、`
        +`Cさん1人だと <b>${c}</b> 日かかります。`
        +`この仕事を <b>3人いっしょに</b> やると、何日で終わりますか？`,
      fields:[{key:'t',label:'3人で',unit:'日'}],
      ans:{t:T},
      explain:()=>`<h4>考え方：全体の仕事量を3人の日数でそろえる</h4>`
        +`全体の仕事量を ${a}・${b}・${c} の最小公倍数 <b>${L}</b> とおきます。<br>`
        +`1日あたり A＝${ra}、B＝${rb}、C＝${rc}。<br>`
        +`3人で1日 ${ra}＋${rb}＋${rc}＝${ra+rb+rc}。<br>`
        +`よって ${L}÷${ra+rb+rc}＝<span class="ans">${T} 日</span>。`
    };
  }
  if(lv===1){ // 2人で（和）
    const t=ri(2,5); const ds=divisors(t*t).filter(d=>{const aa=t+d,bb=t+t*t/d;return aa<=24&&bb<=24&&aa!==bb;});
    const d=choice(ds.length?ds:[1]); const a=t+d, b=t+t*t/d, W=lcm(a,b), ra=W/a, rb=W/b;
    return {
      kind:'仕事算（2人で）',
      q:`ある仕事を、Aさん1人だと <b>${a}</b> 日、Bさん1人だと <b>${b}</b> 日かかります。`
        +`2人で力を合わせると何日で終わりますか？`,
      fields:[{key:'t',label:'2人で',unit:'日'}],
      ans:{t},
      explain:()=>`<h4>考え方：全体の仕事量をそろえる</h4>`
        +`全体を ${a} と ${b} の最小公倍数 <b>${W}</b> とおくと、1日 A＝${ra}、B＝${rb}。<br>`
        +`2人で1日 ${ra}＋${rb}＝${ra+rb}。よって ${W}÷${ra+rb}＝<span class="ans">${t} 日</span>。`
    };
  }
  if(lv===2){ // 片方と2人の日数から他方を逆算（差）
    const t=ri(3,7); const ds=divisors(t*t).filter(d=>{const aa=t+d,bb=t+t*t/d;return aa<=40&&bb<=40&&aa!==bb;});
    const d=choice(ds.length?ds:[1]); const a=t+d, b=t+t*t/d, W=lcm(a,t), wa=W/a, wt=W/t;
    return {
      kind:'仕事算（逆算）',
      q:`ある仕事を、Aさん1人だと <b>${a}</b> 日かかります。`
        +`AさんとBさんの2人で力を合わせると <b>${t}</b> 日で終わります。`
        +`Bさん1人だと何日かかりますか？`,
      fields:[{key:'b',label:'Bさん1人',unit:'日'}],
      ans:{b},
      explain:()=>`<h4>考え方：2人ぶんからAぶんを引く</h4>`
        +`全体を ${a} と ${t} の最小公倍数 <b>${W}</b> とおくと、2人で1日 ${W}÷${t}＝${wt}、Aは1日 ${W}÷${a}＝${wa}。<br>`
        +`Bは1日 ${wt}−${wa}＝${wt-wa} の仕事。よって ${W}÷${wt-wa}＝<span class="ans">${b} 日</span>。`
    };
  }
  // lv 3: 水そう（片方先行→両方）2段階
  const set=[2,3,4,6]; let rA,rB,Wc,a,b,p,t2,total,tries=0,done=false;
  do{
    rA=choice(set); rB=choice(set); if(rA===rB){tries++;continue;}
    Wc=rA*rB; a=Wc/rA; b=Wc/rB;
    const cands=[];for(let pp=1;pp<a;pp++){const rem=Wc-rA*pp; if(rem>0 && rem%(rA+rB)===0) cands.push(pp);}
    if(cands.length){ p=choice(cands); t2=(Wc-rA*p)/(rA+rB); total=p+t2; if(t2>=1&&total<=80) done=true; }
    tries++;
  }while(!done && tries<300);
  const filled=rA*p;
  return {
    kind:'仕事算（水そう・2段階）',
    q:`空の水そうを、A管だけだと <b>${a}</b> 分、B管だけだと <b>${b}</b> 分で満水にできます。`
      +`はじめに <b>A管だけ</b> で <b>${p}</b> 分入れ、そのあと <b>B管も開けて2本</b> で満水にしました。`
      +`満水になるまで全部で何分かかりましたか？`,
    fields:[{key:'total',label:'満水まで',unit:'分'}],
    ans:{total},
    explain:()=>`<h4>考え方：水の量を数でそろえ、2段階に分ける</h4>`
      +`満水を ${a} と ${b} の最小公倍数 <b>${Wc}</b> とおくと、1分で A＝${rA}、B＝${rB}。<br>`
      +`はじめのA管 ${p} 分で ${rA}×${p}＝${filled} 入り、残りは ${Wc}−${filled}＝${Wc-filled}。<br>`
      +`2本だと1分 ${rA}＋${rB}＝${rA+rB} なので、残りに ${Wc-filled}÷${rA+rB}＝${t2} 分。<br>`
      +`合計 ${p}＋${t2}＝<span class="ans">${total} 分</span>。`
  };
}

function genNewton(lv){
  if(lv>=4){
    const Glist=[60,72,80,90,96,100,120,144,180,200,240];
    let r,G,picks,tries=0;
    do{
      r=ri(1,4); G=choice(Glist);
      const ds=divisors(G).filter(d=>{const D=G/d,m=r+d;return d>=2&&D>=4&&D<=60&&m<=60;});
      if(ds.length>=3) picks=[...ds].sort(()=>Math.random()-0.5).slice(0,3).sort((x,y)=>x-y);
      else picks=null;
      tries++;
    }while(!picks&&tries<60);
    if(!picks){ r=5; G=100; picks=[5,10,20]; }
    const [d1,d2,d3]=picks;
    const m1=r+d1,m2=r+d2,m3=r+d3,D1=G/d1,D2=G/d2,D3=G/d3;
    return {
      kind:'ニュートン算（応用）',
      q:`草が毎日一定の割合で生える牧場があります。牛を <b>${m1}</b> 頭放牧すると <b>${D1}</b> 日、`
        +`<b>${m2}</b> 頭だと <b>${D2}</b> 日で草を食べ尽くします。`
        +`(1) 何頭までなら、草を食べ尽くさずにいつまでも放牧し続けられますか？　`
        +`(2) <b>${m3}</b> 頭放牧すると何日で食べ尽くしますか？`,
      fields:[{key:'max',label:'(1) いつまでも放牧できる最大',unit:'頭'},{key:'D',label:'(2) 食べ尽くすまで',unit:'日'}],
      ans:{max:r,D:D3},
      explain:()=>`<h4>考え方：まず「毎日生える草」と「最初の草」を出す</h4>`
        +`毎日生える草を r、最初の草を G とすると、<br>`
        +`r＝(${m1}×${D1}−${m2}×${D2})÷(${D1}−${D2})＝<b>${r}</b>、G＝(${m1}−${r})×${D1}＝<b>${G}</b>。<br>`
        +`(1) 牛が1日に食べる量がちょうど毎日生える ${r} と同じなら草は減りません。`
        +`つまり <span class="ans">${r} 頭</span> までならいつまでも放牧できます。<br>`
        +`(2) ${m3}頭では1日に ${m3}−${r}＝${m3-r} ずつ減るので、${G}÷${m3-r}＝<span class="ans">${D3} 日</span>。`
    };
  }
  const Glist = lv===1?[60,72,80,90,96,100,120]
              : lv===2?[120,144,168,180,200,240]
              :         [120,144,168,180,200,240];
  const dayRange = lv===1?[5,40]:[5,50];
  const cowCap   = lv===1?30:50;
  let r,G,picks,tries=0;
  do{
    r = ri(1, lv===1?3:4);
    G = choice(Glist);
    const ds=divisors(G).filter(d=>{ const D=G/d, m=r+d; return d>=2 && D>=dayRange[0] && D<=dayRange[1] && m<=cowCap; });
    if(ds.length>=3){ picks=[...ds].sort(()=>Math.random()-0.5).slice(0,3).sort((x,y)=>x-y); } else picks=null;
    tries++;
  }while(!picks && tries<60);
  if(!picks){ r=5; G=100; picks=[5,10,20]; }
  const [d1,d2,d3]=picks;
  const m1=r+d1, m2=r+d2, m3=r+d3, D1=G/d1, D2=G/d2, D3=G/d3;
  const given=`牛を <b>${m1}</b> 頭放牧すると <b>${D1}</b> 日、<b>${m2}</b> 頭だと <b>${D2}</b> 日で草を食べ尽くします。`;
  const derive=`毎日生える草を r、最初の草を G とすると、`
    +`r＝(${m1}×${D1}−${m2}×${D2})÷(${D1}−${D2})＝<b>${r}</b>、G＝(${m1}−${r})×${D1}＝<b>${G}</b>。`;

  if(lv===1){ // 日数を求める
    return {
      kind:'ニュートン算（日数を求める）',
      q:`草が毎日一定の割合で生える牧場があります。${given}`
        +`では <b>${m3}</b> 頭放牧すると何日で食べ尽くしますか？`,
      fields:[{key:'D',label:'食べ尽くすまで',unit:'日'}],
      ans:{D:D3},
      explain:()=>`<h4>考え方：最初の草と毎日生える草を分ける</h4>${derive}<br>`
        +`${m3}頭では1日に ${m3}−${r}＝${m3-r} ずつ減るので、${G}÷${m3-r}＝<span class="ans">${D3} 日</span>。`
    };
  }
  if(lv===2){ // 永遠に放牧できる頭数
    return {
      kind:'ニュートン算（いつまで放牧できるか）',
      q:`草が毎日一定の割合で生える牧場があります。${given}`
        +`では、草を食べ尽くさずに <b>いつまでも放牧し続けられる</b> のは、最大何頭までですか？`,
      fields:[{key:'max',label:'いつまでも放牧できる最大',unit:'頭'}],
      ans:{max:r},
      explain:()=>`<h4>考え方：毎日生える量と同じだけ食べれば草は減らない</h4>${derive}<br>`
        +`牛が1日に食べる量が、毎日生える草 ${r} とちょうど同じなら草は減りません。`
        +`つまり <span class="ans">${r} 頭</span> までなら、いつまでも放牧できます。`
    };
  }
  // lv 3: 指定日数で食べ尽くす頭数（逆算）
  return {
    kind:'ニュートン算（必要な頭数・逆算）',
    q:`草が毎日一定の割合で生える牧場があります。${given}`
      +`では、ちょうど <b>${D3}</b> 日で草を食べ尽くすには、牛を何頭放牧すればよいですか？`,
    fields:[{key:'m',label:'必要な頭数',unit:'頭'}],
    ans:{m:m3},
    explain:()=>`<h4>考え方：日数から逆に頭数を求める</h4>${derive}<br>`
      +`${D3}日で食べ尽くすには、1日に ${G}÷${D3}＝${G/D3} ずつ減らす必要があります。<br>`
      +`これは「毎日食べる量＝毎日生える草＋減らす量」なので、頭数＝${r}＋${G/D3}＝<span class="ans">${m3} 頭</span>。`
  };
}

function genRyusui(lv){
  if(lv>=4){
    const a=ri(2,4), b=a+2*ri(1,2), m=ri(2,4);
    const v=m*(a+b)/2, f=m*(b-a)/2, D=a*b*m, T=a+b;
    return {
      kind:'流水算（往復・応用）',
      q:`静水時の速さが時速 <b>${v}</b> km の船で、流れの速さが時速 <b>${f}</b> km の川を、`
        +`ある地点まで上って、また下って戻ってきました。往復にかかった時間は合計 <b>${T}</b> 時間です。`
        +`出発点からその地点までの距離は何kmですか？`,
      fields:[{key:'D',label:'距離',unit:'km'}],
      ans:{D},
      explain:()=>`<h4>考え方：上りと下りの時間を足すと往復時間</h4>`
        +`上りの速さ＝${v}−${f}＝${v-f}、下りの速さ＝${v}＋${f}＝${v+f}。<br>`
        +`距離を D とすると、往復時間は D÷${v-f}＋D÷${v+f}＝${T}。<br>`
        +`通分すると D×(${v+f}＋${v-f})÷(${v-f}×${v+f})＝${T}、すなわち D×${2*v}÷${v*v-f*f}＝${T}。<br>`
        +`よって D＝${T}×${v*v-f*f}÷${2*v}＝<span class="ans">${D} km</span>。`
    };
  }
  if(lv===1){
    const v=ri(8,15), f=ri(2,Math.floor(v/2));
    const down=v+f, up=v-f;
    return {
      kind:'流水算（速さの和と差）',
      q:`ある船が川を <b>下る</b> ときの速さは時速 <b>${down}</b> km、`
        +`<b>上る</b> ときの速さは時速 <b>${up}</b> km でした。`
        +`この船の <b>静水時（流れのない水）の速さ</b> と、<b>川の流れの速さ</b> はそれぞれ時速何kmですか？`,
      fields:[{key:'v',label:'静水時の速さ',unit:'km/h'},{key:'f',label:'流れの速さ',unit:'km/h'}],
      ans:{v,f},
      explain:()=>`<h4>考え方：下り＝船＋流れ、上り＝船−流れ</h4>`
        +`下り ${down} と 上り ${up} を足すと、流れが打ち消し合って船の速さの2倍になります。<br>`
        +`静水時の速さ＝(${down}＋${up})÷2＝<span class="ans">時速 ${v} km</span>。<br>`
        +`引くと船の速さが打ち消し合って流れの2倍になるので、<br>`
        +`流れの速さ＝(${down}−${up})÷2＝<span class="ans">時速 ${f} km</span>。`
    };
  }
  // L2 / L3 共通：小さい整数の時間 a<b（同じ偶奇）と速さ倍率 m から構成
  const a=ri(2,4), b=a+2*ri(1,2), m=ri(2,4);
  const down=b*m, up=a*m;            // 下り時間a → 下り速さ=D/a
  const v=m*(a+b)/2, f=m*(b-a)/2, D=a*b*m;
  if(lv===2){
    return {
      kind:'流水算（時間から速さへ）',
      q:`ある船が、${D}km 離れた2地点の間を、`
        +`川を <b>下る</b> のに <b>${a}</b> 時間、<b>上る</b> のに <b>${b}</b> 時間かかりました。`
        +`この船の <b>静水時の速さ</b> と <b>川の流れの速さ</b> はそれぞれ時速何kmですか？`,
      fields:[{key:'v',label:'静水時の速さ',unit:'km/h'},{key:'f',label:'流れの速さ',unit:'km/h'}],
      ans:{v,f},
      explain:()=>`<h4>考え方：まず上り下りの速さを出し、次に和と差</h4>`
        +`下りの速さ＝${D}÷${a}＝時速 ${down} km。<br>`
        +`上りの速さ＝${D}÷${b}＝時速 ${up} km。<br>`
        +`静水時の速さ＝(${down}＋${up})÷2＝<span class="ans">時速 ${v} km</span>。<br>`
        +`流れの速さ＝(${down}−${up})÷2＝<span class="ans">時速 ${f} km</span>。`
    };
  }
  // lv 3
  return {
    kind:'流水算（距離が未知）',
    q:`ある船が、川のある区間を <b>下る</b> のに <b>${a}</b> 時間、`
      +`<b>上る</b> のに <b>${b}</b> 時間かかりました。`
      +`川の流れの速さが時速 <b>${f}</b> km のとき、`
      +`この船の <b>静水時の速さ</b> と、その区間の <b>距離</b> を求めなさい。`,
    fields:[{key:'v',label:'静水時の速さ',unit:'km/h'},{key:'D',label:'距離',unit:'km'}],
    ans:{v,D},
    explain:()=>`<h4>考え方：同じ距離であることを式にする</h4>`
      +`静水時の速さを v とすると、下りは (v＋${f})、上りは (v−${f})。<br>`
      +`同じ距離なので (v＋${f})×${a}＝(v−${f})×${b} が成り立ちます。<br>`
      +`これを整理すると v＝${f}×(${a}＋${b})÷(${b}−${a})＝<span class="ans">時速 ${v} km</span>。<br>`
      +`距離＝下りの速さ×下りの時間＝(${v}＋${f})×${a}＝<span class="ans">${D} km</span>。`
  };
}

function buildProbs(){
  probs=[ genTsuruKame(level), genTabibito(level), genShigoto(level), genRyusui(level), genNewton(level) ];
  answered=probs.map(()=>false);
  idx=0;
  render();
}

/* ============ UI ============ */
function renderSteps(){
  $('steps').innerHTML='';
  KINDS.forEach((k,i)=>{
    const s=document.createElement('div');
    s.className='step'+(i===idx?' cur':answered[i]?' done':'');
    s.textContent=`${i+1}. ${k}`;
    $('steps').appendChild(s);
  });
}
function render(){
  const p=probs[idx];
  renderSteps();
  $('kind').textContent='第'+(idx+1)+'問　'+p.kind;
  $('q').innerHTML=p.q;
  const ans=$('answers'); ans.innerHTML='';
  p.fields.forEach(f=>{
    const wrap=document.createElement('div'); wrap.className='field';
    const lab=document.createElement('label'); lab.textContent=f.label; wrap.appendChild(lab);
    const row=document.createElement('div'); row.className='row';
    const inp=document.createElement('input'); inp.type='number'; inp.id='in_'+f.key; inp.inputMode='numeric';
    inp.addEventListener('keydown',e=>{ if(e.key==='Enter') checkAns(); });
    const u=document.createElement('span'); u.className='unit'; u.textContent=f.unit;
    row.appendChild(inp); row.appendChild(u); wrap.appendChild(row); ans.appendChild(wrap);
  });
  $('result').textContent=''; $('result').className='result';
  $('solution').className='solution'; $('solution').innerHTML=p.explain();
  $('next').disabled = !answered[idx];
  $('check').disabled = false;
}
function checkAns(){
  const p=probs[idx];
  let allOk=true, blank=false;
  p.fields.forEach(f=>{
    const v=$('in_'+f.key).value;
    if(v==='') blank=true;
    if(parseInt(v,10)!==p.ans[f.key]) allOk=false;
  });
  if(blank){ $('result').textContent='答えを入力してください。'; $('result').className='result ng'; return; }
  if(allOk){
    $('result').textContent='正解！🎉';
    $('result').className='result ok';
    window.cgCelebrate && cgCelebrate.win('正解！');
    answered[idx]=true; $('next').disabled=false;
    $('solution').classList.add('show');
    renderSteps();
  }else{
    $('result').textContent='✕ もう一度考えてみましょう（「解き方を見る」も使えます）';
    $('result').className='result ng';
  }
}

$('levelSeg').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  [...e.currentTarget.children].forEach(x=>x.classList.remove('on'));
  b.classList.add('on'); level=parseInt(b.dataset.lv,10); buildProbs();
});
$('check').addEventListener('click',checkAns);
$('showsol').addEventListener('click',()=>$('solution').classList.toggle('show'));
$('next').addEventListener('click',()=>{
  if(idx<probs.length-1){ idx++; render(); }
  else { buildProbs(); } // after last, regenerate a fresh set
});

buildProbs();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
