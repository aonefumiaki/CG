// ============================================================
//  正解・クリア演出（全ゲーム共通） window.cgCelebrate
//  紙吹雪＋中央バッジ。pointer-events:none で操作を邪魔しない。
// ============================================================
(function(){
  if (window.cgCelebrate) return;
  var COLORS = ['#e0b84c','#b8907a','#3f5226','#a52a2a','#5aa0c4','#d4a896','#e8d5a0','#2c6c8c'];

  function injectStyles(){
    if (document.getElementById('cg-celebrate-style')) return;
    var css =
      '#cg-celebrate-layer{position:fixed;inset:0;z-index:9999;pointer-events:none;overflow:hidden;}'+
      '.cg-confetti{position:fixed;top:-12vh;will-change:transform;animation:cg-fall linear forwards;}'+
      '@keyframes cg-fall{0%{opacity:1;}90%{opacity:1;}100%{transform:translateY(122vh) rotateZ(var(--rot,360deg));opacity:.9;}}'+
      '.cg-badge{position:fixed;top:38%;left:50%;transform:translate(-50%,-50%);text-align:center;'+
        'animation:cg-pop 1.9s cubic-bezier(.2,1.3,.4,1) forwards;}'+
      '.cg-badge-main{display:inline-block;font-family:"Noto Serif JP",serif;font-weight:700;font-size:2.2rem;'+
        'color:#fff;background:linear-gradient(135deg,#3f5226,#5a7436);padding:14px 34px;border-radius:16px;'+
        'box-shadow:0 14px 34px -10px rgba(63,82,38,.6);letter-spacing:.04em;}'+
      '.cg-badge-sub{margin-top:10px;font-family:"Noto Serif JP",serif;font-size:.95rem;color:#3a2e28;'+
        'background:rgba(255,255,255,.92);display:inline-block;padding:6px 16px;border-radius:10px;box-shadow:0 8px 20px -12px rgba(80,60,20,.5);}'+
      '@keyframes cg-pop{0%{opacity:0;transform:translate(-50%,-50%) scale(.4);}'+
        '18%{opacity:1;transform:translate(-50%,-50%) scale(1.12);}'+
        '32%{transform:translate(-50%,-50%) scale(1);}'+
        '78%{opacity:1;transform:translate(-50%,-50%) scale(1);}'+
        '100%{opacity:0;transform:translate(-50%,-55%) scale(.95);}}'+
      '@media(max-width:480px){.cg-badge-main{font-size:1.7rem;padding:12px 26px;}}'+
      '@media(prefers-reduced-motion:reduce){.cg-confetti{display:none;}}';
    var st = document.createElement('style');
    st.id = 'cg-celebrate-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  function layer(){
    var l = document.getElementById('cg-celebrate-layer');
    if (!l){ l = document.createElement('div'); l.id = 'cg-celebrate-layer'; document.body.appendChild(l); }
    return l;
  }

  function confetti(n){
    injectStyles();
    var l = layer();
    for (var i=0;i<n;i++){
      var p = document.createElement('div');
      p.className = 'cg-confetti';
      var size = 6 + Math.random()*8;
      p.style.left = (Math.random()*100) + 'vw';
      p.style.width = size + 'px';
      p.style.height = (size*0.6) + 'px';
      p.style.background = COLORS[(Math.random()*COLORS.length)|0];
      p.style.animationDuration = (1.4 + Math.random()*1.4) + 's';
      p.style.animationDelay = (Math.random()*0.25) + 's';
      p.style.setProperty('--rot', (Math.random()*1080 - 540) + 'deg');
      if (Math.random() < 0.5) p.style.borderRadius = '50%';
      l.appendChild(p);
      (function(el){ setTimeout(function(){ el.remove(); }, 3400); })(p);
    }
  }

  function badge(text, sub){
    injectStyles();
    var l = layer();
    var b = document.createElement('div');
    b.className = 'cg-badge';
    b.innerHTML = '<div class="cg-badge-main">' + (text || '正解！') + '</div>' +
                  (sub ? '<div class="cg-badge-sub">' + sub + '</div>' : '');
    l.appendChild(b);
    setTimeout(function(){ b.remove(); }, 2000);
  }

  // 大きめの正解/クリア演出（紙吹雪＋バッジ）
  function win(text, sub){ confetti(90); badge(text || '正解！', sub || ''); }
  // 軽い正解演出（紙吹雪のみ・連続正解向け）
  function correct(){ confetti(26); }

  window.cgCelebrate = { win: win, correct: correct, confetti: confetti, badge: badge };
})();
