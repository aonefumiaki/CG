// ============================================================
//  ハイ＆ロー 複数人対戦（1台パス＆プレイ・2〜6人）
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

    if(C.preload) C.preload();

    var nPlayers=2, rounds=5;
    var players=[], cur=0, round=1, deck=[], current=null, history=[], busy=false, over=false;

    /* ---------- セットアップ ---------- */
    function seg(e, attr, set){
      var b=e.target.closest('button'); if(!b) return;
      var ch=e.currentTarget.children;
      for(var i=0;i<ch.length;i++) ch[i].classList.remove('on');
      b.classList.add('on'); set(b.dataset[attr]);
    }
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

    $('hlm-start').addEventListener('click', function(){
      players=[];
      for(var i=0;i<nPlayers;i++){
        var el=$('hlm-nm'+i);
        var nm=((el&&el.value)||'').trim() || ('プレイヤー'+(i+1));
        players.push({name:nm, score:0});
      }
      cur=0; round=1; history=[]; over=false; busy=false;
      deck=C.buildDeck(null); current=deck.pop();
      $('hlm-setup').classList.add('hidden'); $('hlm-result').classList.add('hidden'); $('hlm-game').classList.remove('hidden');
      setMsg('','');
      render(true);
    });

    /* ---------- ゲーム進行 ---------- */
    function ensureDeck(){ if(deck.length===0) deck=C.buildDeck(current); }

    function guess(dir){
      if(over||busy) return;
      busy=true;
      ensureDeck();
      var next=deck.pop();
      var prev=current;
      var j=C.judge(prev, next, dir);
      players[cur].score += j.delta;
      history.unshift(prev); if(history.length>8) history.pop();
      current=next;

      var nm=players[cur].name, lbl=C.rankLabel(next.rank);
      if(j.outcome==='tie'){ setMsg(nm+'：引き分け（'+lbl+'）— セーフ、増減なし', 'push'); }
      else if(j.outcome==='correct'){ setMsg(nm+'：正解！ '+lbl+' で +1点', 'good'); window.cgCelebrate && cgCelebrate.correct(); }
      else { setMsg(nm+'：はずれ… '+lbl+' で −1点', 'bad'); }

      render(true);

      // 次の手番へ（少し見せてから）
      setTimeout(function(){
        cur++;
        if(cur>=players.length){ cur=0; round++; }
        busy=false;
        if(round>rounds){ endGame(); return; }
        // メッセージは残しつつ手番表示だけ更新
        renderTurn();
      }, 850);
    }
    $('hlm-high').addEventListener('click', function(){ guess('high'); });
    $('hlm-low').addEventListener('click', function(){ guess('low'); });
    $('hlm-quit').addEventListener('click', function(){ toSetup(); });
    $('hlm-back').addEventListener('click', function(){ toSetup(); });
    $('hlm-again').addEventListener('click', function(){
      for(var i=0;i<players.length;i++) players[i].score=0;
      cur=0; round=1; history=[]; over=false; busy=false;
      deck=C.buildDeck(null); current=deck.pop();
      $('hlm-result').classList.add('hidden'); $('hlm-game').classList.remove('hidden');
      setMsg('','');
      render(true);
    });
    function toSetup(){
      over=false; busy=false;
      $('hlm-game').classList.add('hidden'); $('hlm-result').classList.add('hidden'); $('hlm-setup').classList.remove('hidden');
    }

    /* ---------- 表示 ---------- */
    function setMsg(t,c){ $('hlm-msg').textContent=t; $('hlm-msg').className='msg'+(c?' '+c:''); }

    function renderTurn(){
      $('hlm-who').textContent = over ? '' : players[cur].name+' の番';
      $('hlm-meta').textContent = over ? '' : (round+' / '+rounds+'周');
      var sc=$('hlm-scores'); sc.innerHTML='';
      for(var i=0;i<players.length;i++){
        var d=document.createElement('div');
        d.className='hlm-sc'+(!over&&i===cur?' cur':'');
        d.innerHTML='<div class="nm">'+esc(players[i].name)+'</div><div class="pt">'+players[i].score+'</div>';
        sc.appendChild(d);
      }
      var human=!over&&!busy;
      $('hlm-high').disabled=!human; $('hlm-low').disabled=!human;
      $('hlm-hint').textContent = over ? '' : players[cur].name+'さん：場のカードより次が「高い」か「低い」かを予想してください。';
    }

    function render(dealAnim){
      C.renderCard($('hlm-card'), current, dealAnim);
      // 履歴
      var h=$('hlm-history'); h.innerHTML='';
      for(var i=0;i<history.length && i<8;i++){
        var c=history[i];
        var e=document.createElement('div'); e.className='hcard '+c.color;
        e.innerHTML='<span class="'+c.color+'">'+C.rankLabel(c.rank)+c.suit+'</span>';
        h.appendChild(e);
      }
      renderTurn();
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
