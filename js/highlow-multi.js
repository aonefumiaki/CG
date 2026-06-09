// ============================================================
//  ハイ＆ロー 複数人対戦（1台パス＆プレイ・2〜6人）
//  形式は2種類：
//   ・一斉(blitz) … 1枚の場のカードに全員が賭け → 出そろったらめくって一斉判定
//   ・リレー(relay) … 順番に1人ずつ予想し、その場でめくって判定（1人ごとに新しいカード）
//  当たり+1 / 外れ-1 / 引き分け0。共通コア HLCore を使用。
//  #highlow にスコープ（カード等のデザインは css/highlow.css を流用）
// ============================================================
(function(){
  function init(){
    if(!document.getElementById('hlm-setup')) return;
    if(!window.HLCore){ return; }
    var C=HLCore;
    var $=function(id){ return document.getElementById(id); };
    var esc=function(s){ return String(s).replace(/[<>&]/g,function(c){return ({'<':'&lt;','>':'&gt;','&':'&amp;'})[c];}); };
    var betLabel=function(b){ return b==='high' ? '▲ハイ' : b==='low' ? '▼ロー' : '—'; };

    if(C.preload) C.preload();

    var style='blitz', nPlayers=2, rounds=5;
    var players=[], cur=0, round=1, deck=[], current=null, history=[], phase='bet', busy=false, over=false;

    /* ---------- セットアップ ---------- */
    function seg(e, attr, set){
      var b=e.target.closest('button'); if(!b) return;
      var ch=e.currentTarget.children;
      for(var i=0;i<ch.length;i++) ch[i].classList.remove('on');
      b.classList.add('on'); set(b.dataset[attr]);
    }
    $('hlm-style').addEventListener('click', function(e){ seg(e,'s',function(v){ style=v; }); });
    $('hlm-count').addEventListener('click', function(e){ seg(e,'n',function(v){ nPlayers=parseInt(v,10); buildNames(); }); });
    $('hlm-rounds').addEventListener('click', function(e){ seg(e,'r',function(v){ rounds=parseInt(v,10); }); });

    function buildNames(){
      var wrap=$('hlm-names'); wrap.innerHTML='';
      for(var i=0;i<nPlayers;i++){
        var inp=document.createElement('input');
        inp.type='text'; inp.value='プレイヤー'+(i+1); inp.maxLength=10; inp.id='hlm-nm'+i;
        wrap.appendChild(inp);
      }
    }

    function startGame(){
      round=1; history=[]; over=false; busy=false;
      deck=C.buildDeck(null); current=deck.pop();
      $('hlm-setup').classList.add('hidden'); $('hlm-result').classList.add('hidden'); $('hlm-game').classList.remove('hidden');
      drawCard(true);
      beginRound();
    }
    $('hlm-start').addEventListener('click', function(){
      players=[];
      for(var i=0;i<nPlayers;i++){
        var el=$('hlm-nm'+i);
        var nm=((el&&el.value)||'').trim() || ('プレイヤー'+(i+1));
        players.push({name:nm, score:0, bet:null, result:null});
      }
      startGame();
    });

    function beginRound(){
      for(var i=0;i<players.length;i++){ players[i].bet=null; players[i].result=null; }
      cur=0; busy=false;
      phase = (style==='relay') ? 'relay' : 'bet';
      setMsg('','');
      renderBoard();
    }

    /* ---------- 入力（ハイ/ロー） ---------- */
    function onGuess(dir){
      if(style==='relay') relayGuess(dir);
      else betBlitz(dir);
    }
    $('hlm-high').addEventListener('click', function(){ onGuess('high'); });
    $('hlm-low').addEventListener('click', function(){ onGuess('low'); });

    function ensureDeck(){ if(deck.length===0) deck=C.buildDeck(current); }

    /* ---- 一斉(blitz)：賭け収集 → めくる → 一斉判定 ---- */
    function betBlitz(dir){
      if(phase!=='bet') return;
      players[cur].bet=dir;
      cur++;
      if(cur>=players.length){ phase='reveal'; setMsg('全員の予想が出そろいました。「めくる！」で勝負！',''); }
      renderBoard();
    }
    function doReveal(){
      if(phase!=='reveal') return;
      ensureDeck();
      var prev=current, next=deck.pop();
      var prevL=C.rankLabel(prev.rank), nextL=C.rankLabel(next.rank);
      var anyCorrect=false;
      for(var i=0;i<players.length;i++){
        var r=C.judge(prev, next, players[i].bet);
        players[i].result=r; players[i].score+=r.delta;
        if(r.outcome==='correct') anyCorrect=true;
      }
      history.unshift(prev); if(history.length>8) history.pop();
      current=next; phase='result';
      drawCard(true);
      var relTxt = next.rank===prev.rank ? '引き分け（同じ数）' : (next.rank>prev.rank ? 'ハイ！' : 'ロー！');
      setMsg(prevL+' → '+nextL+' ＝ '+relTxt, next.rank===prev.rank ? 'push' : 'good');
      if(anyCorrect && window.cgCelebrate) cgCelebrate.correct();
      renderBoard();
    }
    $('hlm-reveal').addEventListener('click', doReveal);
    $('hlm-next').addEventListener('click', function(){
      round++;
      if(round>rounds){ endGame(); return; }
      beginRound();
    });

    /* ---- リレー(relay)：1人ずつ予想 → その場でめくる ---- */
    function relayGuess(dir){
      if(phase!=='relay' || busy) return;
      busy=true;
      ensureDeck();
      var prev=current, next=deck.pop();
      var prevL=C.rankLabel(prev.rank), nextL=C.rankLabel(next.rank);
      var r=C.judge(prev, next, dir);
      players[cur].bet=dir; players[cur].result=r; players[cur].score+=r.delta;
      history.unshift(prev); if(history.length>8) history.pop();
      current=next;
      drawCard(true);
      var nm=players[cur].name;
      if(r.outcome==='tie'){ setMsg(nm+'：'+prevL+'→'+nextL+' 引き分け（増減なし）','push'); }
      else if(r.outcome==='correct'){ setMsg(nm+'：'+prevL+'→'+nextL+' 正解！ +1点','good'); window.cgCelebrate && cgCelebrate.correct(); }
      else { setMsg(nm+'：'+prevL+'→'+nextL+' はずれ… −1点','bad'); }
      renderBoard();
      setTimeout(function(){
        players[cur].result=null; players[cur].bet=null;
        cur++; busy=false;
        if(cur>=players.length){ cur=0; round++; }
        if(round>rounds){ endGame(); return; }
        renderBoard();
      }, 1100);
    }

    /* ---------- 共通操作 ---------- */
    $('hlm-quit').addEventListener('click', toSetup);
    $('hlm-back').addEventListener('click', toSetup);
    $('hlm-again').addEventListener('click', function(){
      for(var i=0;i<players.length;i++){ players[i].score=0; players[i].bet=null; players[i].result=null; }
      $('hlm-result').classList.add('hidden'); $('hlm-game').classList.remove('hidden');
      startGame();
    });
    function toSetup(){
      over=false; busy=false;
      $('hlm-game').classList.add('hidden'); $('hlm-result').classList.add('hidden'); $('hlm-setup').classList.remove('hidden');
    }

    /* ---------- 表示 ---------- */
    function setMsg(t,c){ $('hlm-msg').textContent=t; $('hlm-msg').className='msg'+(c?' '+c:''); }
    function drawCard(dealAnim){ C.renderCard($('hlm-card'), current, dealAnim); }

    function renderBoard(){
      // 手番バー
      var who, meta=round+' / '+rounds+'周';
      if(phase==='reveal'){ who='全員そろいました！'; }
      else if(phase==='result'){ who='結果'; }
      else { who=players[cur].name+(style==='relay'?' の番':' の予想'); }  // bet / relay
      $('hlm-who').textContent=who; $('hlm-meta').textContent=meta;

      // スコアボード
      var sc=$('hlm-scores'); sc.innerHTML='';
      for(var i=0;i<players.length;i++){
        var p=players[i], cls='hlm-sc', line='';
        if(p.result){
          if(p.result.outcome==='correct'){ cls+=' win'; line='○ +1'; }
          else if(p.result.outcome==='wrong'){ cls+=' lose'; line='× −1'; }
          else { line='△ 0'; }
        } else if(style==='blitz' && (phase==='bet'||phase==='reveal')){
          if(phase==='bet' && i===cur) cls+=' cur';
          if(p.bet) cls+=' betdone';
          line=betLabel(p.bet);
        } else if(style==='relay' && phase==='relay'){
          if(i===cur && !busy) cls+=' cur';
          line='';
        }
        var d=document.createElement('div'); d.className=cls;
        d.innerHTML='<div class="nm">'+esc(p.name)+'</div><div class="pt">'+p.score+'</div><div class="bet">'+line+'</div>';
        sc.appendChild(d);
      }

      // ボタン出し分け
      var guessOn = (style==='blitz' && phase==='bet') || (style==='relay' && phase==='relay' && !busy);
      $('hlm-guess').style.display = guessOn ? 'flex' : 'none';
      $('hlm-high').disabled=!guessOn; $('hlm-low').disabled=!guessOn;
      $('hlm-reveal').classList.toggle('hidden', !(style==='blitz' && phase==='reveal'));
      $('hlm-next').classList.toggle('hidden', !(style==='blitz' && phase==='result'));
      if(style==='blitz' && phase==='result') $('hlm-next').textContent = (round>=rounds) ? '結果を見る' : '次のカードへ';

      // 履歴
      var h=$('hlm-history'); h.innerHTML='';
      for(var k=0;k<history.length && k<8;k++){
        var c=history[k];
        var e=document.createElement('div'); e.className='hcard '+c.color;
        e.innerHTML='<span class="'+c.color+'">'+C.rankLabel(c.rank)+c.suit+'</span>';
        h.appendChild(e);
      }

      // ヒント
      $('hlm-hint').textContent =
        phase==='reveal' ? '全員の予想がそろいました。「めくる！」を押して一斉に判定します。'
        : phase==='result' ? (round>=rounds ? '「結果を見る」で最終順位へ。' : '「次のカードへ」で続けます。')
        : style==='relay' ? players[cur].name+'さん：場のカード（'+C.rankLabel(current.rank)+'）より次が高い(ハイ)か低い(ロー)か予想。当たり+1 / 外れ−1。'
        : players[cur].name+'さん：場のカード（'+C.rankLabel(current.rank)+'）より次が高い(ハイ)か低い(ロー)か予想して、端末を次の人へ。';
    }

    /* ---------- 結果 ---------- */
    function endGame(){
      over=true;
      $('hlm-game').classList.add('hidden'); $('hlm-result').classList.remove('hidden');
      var ranks=C.ranking(players);
      var order=players.map(function(p,i){ return {name:p.name, score:p.score, rank:ranks[i]}; })
                       .sort(function(a,b){ return a.rank-b.rank; });
      var medal={1:'🥇',2:'🥈',3:'🥉'};
      var html='';
      for(var i=0;i<order.length;i++){
        var o=order[i];
        var pos = medal[o.rank] || (o.rank+'位');
        html+='<div class="hlm-rankrow'+(o.rank===1?' first':'')+'">'
            +'<div class="pos">'+pos+'</div>'
            +'<div class="nm">'+esc(o.name)+'</div>'
            +'<div class="pts">'+o.score+'点</div></div>';
      }
      $('hlm-rank').innerHTML=html;

      var winners=order.filter(function(o){ return o.rank===1; });
      var wtext = winners.length>1 ? '引き分け！' : (winners[0].name+' の勝ち！');
      var wsub  = winners.length>1 ? winners.map(function(o){return o.name;}).join('・')+'（'+winners[0].score+'点）' : (winners[0].score+'点');
      window.cgCelebrate && cgCelebrate.win(wtext, wsub);
    }

    buildNames();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
