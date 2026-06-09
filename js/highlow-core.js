// ============================================================
//  ハイ＆ロー 共通コア（1人用・複数人用で共有） window.HLCore
//  既存1人用のデッキ生成・カード比較・絵札描画を再利用
// ============================================================
(function(){
  if (window.HLCore) return;
  var SUITS=[{s:'♠',c:'blk'},{s:'♥',c:'red'},{s:'♦',c:'red'},{s:'♣',c:'blk'}];
  var RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  var SCODE={'♠':'s','♥':'h','♦':'d','♣':'c'};
  function rankLabel(v){ return RANKS[v-1]; }
  function courtSrc(c){ return 'images/cards/'+rankLabel(c.rank)+'-'+SCODE[c.suit]+'.png'; }

  // 52枚・重複なしのデッキを生成してシャッフル（exclude を渡すとその1枚を除く）
  function buildDeck(exclude){
    var d=[];
    for(var v=1;v<=13;v++) for(var k=0;k<SUITS.length;k++){
      var su=SUITS[k];
      if(exclude && exclude.rank===v && exclude.suit===su.s) continue;
      d.push({rank:v, suit:su.s, color:su.c});
    }
    for(var i=d.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=d[i]; d[i]=d[j]; d[j]=t; }
    return d;
  }

  // 次のカードが今より高い/低い/同じか。'high' | 'low' | 'tie'
  function relation(cur, next){
    if(next.rank===cur.rank) return 'tie';
    return next.rank>cur.rank ? 'high' : 'low';
  }
  // 予想(guess='high'|'low')に対する判定。{outcome:'correct'|'wrong'|'tie', delta:+1|-1|0}
  function judge(cur, next, guess){
    var rel=relation(cur,next);
    if(rel==='tie') return {outcome:'tie', delta:0};
    return rel===guess ? {outcome:'correct', delta:1} : {outcome:'wrong', delta:-1};
  }

  // 絵札画像の先読み（めくり演出時のちらつき防止）
  function preload(){
    var rks=['J','Q','K'], scs=['s','h','d','c'];
    for(var a=0;a<rks.length;a++) for(var b=0;b<scs.length;b++){ var im=new Image(); im.src='images/cards/'+rks[a]+'-'+scs[b]+'.png'; }
  }

  // カード要素へ描画（既存1人用と同じ：絵札は専用イラスト、数字札は隅指数＋スート）
  function renderCard(el, c, dealAnim){
    var isFace = c.rank>=11;
    if(isFace){
      el.className='card cardimg '+c.color;
      el.innerHTML='<img class="court" src="'+courtSrc(c)+'" alt="'+rankLabel(c.rank)+c.suit+'">';
    } else {
      el.className='card '+c.color;
      el.innerHTML=
        '<div class="corner tl '+c.color+'"><div class="r">'+rankLabel(c.rank)+'</div><div class="s">'+c.suit+'</div></div>'
       +'<div class="big '+c.color+'">'+c.suit+'</div>'
       +'<div class="corner br '+c.color+'"><div class="r">'+rankLabel(c.rank)+'</div><div class="s">'+c.suit+'</div></div>';
    }
    if(dealAnim){ void el.offsetWidth; el.classList.add('deal'); }
  }

  // 競技順位（同点は同順位、その分だけ次の順位を飛ばす）。players:[{score}] -> ranks[]（1始まり）
  function ranking(players){
    var order=players.map(function(p,i){return {i:i, score:p.score};}).sort(function(a,b){return b.score-a.score;});
    var ranks=new Array(players.length);
    for(var k=0;k<order.length;k++){
      if(k>0 && order[k].score===order[k-1].score) ranks[order[k].i]=ranks[order[k-1].i];
      else ranks[order[k].i]=k+1;
    }
    return ranks;
  }

  window.HLCore={ SUITS:SUITS, RANKS:RANKS, SCODE:SCODE, rankLabel:rankLabel, courtSrc:courtSrc,
                  buildDeck:buildDeck, relation:relation, judge:judge, preload:preload, renderCard:renderCard, ranking:ranking };
})();
