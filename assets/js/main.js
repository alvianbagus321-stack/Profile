/* =============================================================
   ALVIAN BAGUS — REWORKED INTERACTIONS
   Fixed mobile overlap, parallax 3D, snake easter egg
   No libraries, respects prefers-reduced-motion
   ============================================================= */
(function(){
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var isTouch = !finePointer;

  function $(s, r){ return (r||document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
  function raf(fn){ return requestAnimationFrame(fn); }
  function throttle(fn, ms){
    var last=0, timer=null;
    return function(){
      var now=Date.now(), args=arguments, rem=ms-(now-last);
      if(rem<=0){ if(timer){clearTimeout(timer);timer=null} last=now; fn.apply(null,args); }
      else if(!timer){ timer=setTimeout(function(){ last=Date.now(); timer=null; fn.apply(null,args); }, rem); }
    };
  }

  /* ---------- CLOCK ---------- */
  function updateClocks(){
    var now = new Date();
    var opts = {timeZone:"Asia/Jakarta", hour:"2-digit", minute:"2-digit", hour12:false};
    try{
      var time = new Intl.DateTimeFormat("id-ID", opts).format(now);
      var lc = $("#liveClock"), fc = $("#footerClock");
      if(lc) lc.textContent = time;
      if(fc) fc.textContent = time;
    }catch(e){}
  }
  updateClocks();
  setInterval(updateClocks, 30000);

  /* ---------- TYPING ---------- */
  var typingEl = $("#typingText");
  var phrases = ["build in public", "learn by doing", "ship > perfect", "code. read. repeat."];
  var pi=0, ci=0, del=false, tSpeed=90;
  function typeLoop(){
    if(!typingEl) return;
    var cur = phrases[pi];
    if(!del){
      typingEl.textContent = cur.slice(0, ci+1) + "█";
      ci++;
      if(ci===cur.length){ del=true; setTimeout(typeLoop, 1200); return; }
    }else{
      typingEl.textContent = cur.slice(0, ci-1) + "█";
      ci--;
      if(ci===0){ del=false; pi=(pi+1)%phrases.length; }
    }
    setTimeout(typeLoop, del? 40 : tSpeed + Math.random()*60);
  }
  if(!reduced) setTimeout(typeLoop, 800);

  /* ---------- SCROLL PROGRESS + HEADER ---------- */
  var progress = $(".progress");
  var siteHead = $("#siteHead");
  function onScrollState(){
    var y = window.scrollY || document.documentElement.scrollTop;
    var max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
    if(progress) progress.style.width = Math.min(100, (y/max)*100) + "%";
    if(siteHead) siteHead.classList.toggle("is-scrolled", y>10);
  }
  window.addEventListener("scroll", throttle(onScrollState, 20), {passive:true});
  onScrollState();

  /* ---------- MOBILE MENU - FIXED ---------- */
  var menuToggle = $(".menu-toggle");
  var navPanel = $("#nav-mobile");
  var navMobileLinks = $$(".nav-mobile a");
  function closeMenu(){
    if(!siteHead) return;
    siteHead.classList.remove("menu-open");
    if(menuToggle) menuToggle.setAttribute("aria-expanded","false");
    if(navPanel) navPanel.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
  }
  function openMenu(){
    if(!siteHead) return;
    siteHead.classList.add("menu-open");
    if(menuToggle) menuToggle.setAttribute("aria-expanded","true");
    if(navPanel) navPanel.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
  }
  if(menuToggle && siteHead){
    menuToggle.addEventListener("click", function(){
      var isOpen = siteHead.classList.contains("menu-open");
      if(isOpen) closeMenu(); else openMenu();
    });
    navMobileLinks.forEach(function(l){ l.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape" && siteHead.classList.contains("menu-open")) closeMenu(); });
    // close if resize to desktop
    window.addEventListener("resize", throttle(function(){ if(window.innerWidth>900 && siteHead.classList.contains("menu-open")) closeMenu(); }, 200));
  }

  /* ---------- ACTIVE NAV ---------- */
  var sections = $$("main section[id]");
  var navItems = $$(".nav-links .nav-item");
  function setActive(id){
    navItems.forEach(function(it){
      var href = it.getAttribute("href")||"";
      it.classList.toggle("is-active", href==="#"+id);
    });
  }
  if("IntersectionObserver" in window && navItems.length){
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting) setActive(en.target.id); });
    }, {rootMargin:"-35% 0px -55% 0px", threshold:0});
    sections.forEach(function(s){ obs.observe(s); });
  }

  /* ---------- REVEAL ---------- */
  var revealables = $$("[data-reveal]");
  var staggers = $$(".stagger");
  function revealNow(el){ el.classList.add("is-revealed"); }

  if(reduced){
    revealables.forEach(revealNow);
    staggers.forEach(revealNow);
  }else if("IntersectionObserver" in window){
    var revealObserver = new IntersectionObserver(function(entries, o){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        revealNow(e.target);
        o.unobserve(e.target);
      });
    }, {rootMargin:"0px 0px -8% 0px", threshold:0.08});
    revealables.forEach(function(el, i){
      el.style.setProperty("--d", Math.min(i%4*70, 280)+"ms");
      revealObserver.observe(el);
    });

    // hero stagger
    var heroTitle = $(".hero-title");
    if(heroTitle){
      var heroSpans = $$(".stagger", heroTitle);
      heroSpans.forEach(function(sp, i){
        sp.style.transitionDelay = (100 + i*90)+"ms";
        sp.style.transform = "translateY(100%)";
        setTimeout(function(){ sp.classList.add("is-revealed"); sp.style.transform="translateY(0)"; }, 200 + i*90);
      });
    }
    var titleObserver = new IntersectionObserver(function(entries, o){
      entries.forEach(function(en){
        if(!en.isIntersecting) return;
        var spans = $$(".stagger", en.target);
        spans.forEach(function(sp, i){
          sp.style.transitionDelay = (i*80)+"ms";
          sp.style.transform = "translateY(100%)";
          setTimeout(function(){ sp.classList.add("is-revealed"); sp.style.transform="translateY(0)"; }, i*80);
        });
        o.unobserve(en.target);
      });
    }, {rootMargin:"0px 0px -10% 0px", threshold:0.2});
    $$(".section-title").forEach(function(t){ titleObserver.observe(t); });
  }else{
    revealables.forEach(revealNow);
    staggers.forEach(revealNow);
  }

  /* ---------- PARALLAX BACKDROP ---------- */
  var bgParallax = $("#bgParallax");
  var pDotsHost = $("#pDots");
  var pDots = [];

  if(!reduced){
    // create dots
    if(pDotsHost){
      var dotCount = isTouch? 14 : 28;
      for(var i=0;i<dotCount;i++){
        var d = document.createElement("span");
        d.className="p-dot";
        var x = Math.random()*100;
        var y = Math.random()*100;
        var size = 1.5 + Math.random()*2.5;
        d.style.left = x+"%";
        d.style.top = y+"%";
        d.style.width = size+"px";
        d.style.height = size+"px";
        d.style.opacity = (0.08 + Math.random()*0.18).toFixed(2);
        d.dataset.speed = (0.15 + Math.random()*0.6).toFixed(2);
        d.dataset.x = x;
        pDotsHost.appendChild(d);
        pDots.push(d);
      }
    }

    var ticking = false;
    function parallaxUpdate(){
      var y = window.scrollY || 0;
      if(bgParallax){
        bgParallax.style.transform = "translate3d(0," + (y*0.12).toFixed(1) + "px,0)";
      }
      // grid shift
      var grid = $(".bg-grid");
      if(grid){
        grid.style.transform = "translate3d(0," + (y*0.08).toFixed(1) + "px,0)";
      }
      // dots parallax
      pDots.forEach(function(dot){
        var speed = parseFloat(dot.dataset.speed)||0.3;
        var offset = (y*speed*0.15) % 120;
        dot.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
      ticking=false;
    }
    function onScrollParallax(){
      if(!ticking){ ticking=true; raf(parallaxUpdate); }
    }
    window.addEventListener("scroll", throttle(onScrollParallax, 16), {passive:true});
    parallaxUpdate();
  }

  /* ---------- MOUSE PARALLAX FOR BLOBS & HERO CARD ---------- */
  if(!reduced && finePointer){
    var mouseX=0, mouseY=0, targetX=0, targetY=0;
    window.addEventListener("pointermove", function(e){
      targetX = (e.clientX / window.innerWidth - 0.5);
      targetY = (e.clientY / window.innerHeight - 0.5);
    }, {passive:true});
    (function mouseParallaxLoop(){
      mouseX += (targetX - mouseX)*0.06;
      mouseY += (targetY - mouseY)*0.06;
      var blobs = $$(".p-blob");
      blobs.forEach(function(b, i){
        var depth = (i+1)*0.6;
        b.style.transform = "translate3d(" + (mouseX*depth*30).toFixed(1) + "px," + (mouseY*depth*20).toFixed(1) + "px,0) scale(" + (1 + Math.abs(mouseX)*0.02) + ")";
      });
      var heroCard = $("#heroCard");
      if(heroCard){
        heroCard.style.transform = "perspective(900px) rotateY(" + (mouseX*8).toFixed(2) + "deg) rotateX(" + (-mouseY*8).toFixed(2) + "deg) translateZ(0)";
      }
      raf(mouseParallaxLoop);
    })();
  }

  /* ---------- TILT + SPOTLIGHT ON PROJECT CARDS ---------- */
  if(!reduced && finePointer){
    $$("[data-tilt]").forEach(function(card){
      card.addEventListener("pointermove", function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left)/r.width - 0.5;
        var py = (e.clientY - r.top)/r.height - 0.5;
        card.style.setProperty("--mx", ((px+0.5)*100).toFixed(1)+"%");
        card.style.setProperty("--my", ((py+0.5)*100).toFixed(1)+"%");
        card.style.transform = "perspective(1100px) rotateX(" + (-py*3.5).toFixed(2) + "deg) rotateY(" + (px*4.5).toFixed(2) + "deg) translateY(-2px)";
      });
      card.addEventListener("pointerleave", function(){
        card.style.transform="";
      });
    });
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if(!reduced && finePointer){
    $$(".btn").forEach(function(btn){
      btn.addEventListener("pointermove", function(e){
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left)/r.width - 0.5;
        var y = (e.clientY - r.top)/r.height - 0.5;
        btn.style.transform = "translate(" + (x*10).toFixed(1) + "px," + (y*6).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function(){ btn.style.transform=""; });
    });
  }

  /* ---------- CURSOR ---------- */
  var cursorDot, cursorRing, dotX=0, dotY=0, ringX=0, ringY=0;
  function initCursor(){
    if(reduced || !finePointer) return;
    cursorDot = document.createElement("div"); cursorDot.className="cursor-dot"; cursorDot.setAttribute("aria-hidden","true");
    cursorRing = document.createElement("div"); cursorRing.className="cursor-ring"; cursorRing.setAttribute("aria-hidden","true");
    document.body.appendChild(cursorDot); document.body.appendChild(cursorRing);
    document.body.classList.add("cursor-on");
    window.addEventListener("pointermove", function(e){
      dotX=e.clientX; dotY=e.clientY;
      if(cursorDot){ cursorDot.style.left=dotX+"px"; cursorDot.style.top=dotY+"px"; }
    }, {passive:true});
    var active=null;
    document.addEventListener("pointerover", function(e){
      var t = e.target.closest ? e.target.closest("a, button, [data-cursor], .gallery-item, .project") : null;
      if(!t) return;
      var mode = t.getAttribute("data-cursor") || (t.classList.contains("gallery-item")||t.classList.contains("project") ? "view" : "link");
      document.body.classList.remove("cursor-link","cursor-view");
      document.body.classList.add(mode==="view"?"cursor-view":"cursor-link");
      active=t;
    });
    document.addEventListener("pointerout", function(e){
      var t = e.target.closest ? e.target.closest("a, button, [data-cursor], .gallery-item, .project") : null;
      if(t && active===t){ document.body.classList.remove("cursor-link","cursor-view"); active=null; }
    });
    (function ringLoop(){
      ringX += (dotX - ringX)*0.14; ringY += (dotY - ringY)*0.14;
      if(cursorRing){ cursorRing.style.left=ringX+"px"; cursorRing.style.top=ringY+"px"; }
      raf(ringLoop);
    })();
  }
  initCursor();

  /* ---------- LIGHTBOX ---------- */
  var lightbox = $(".lightbox");
  var lbImg = lightbox ? $(".lightbox-img", lightbox) : null;
  var lbCap = lightbox ? $(".lightbox-caption", lightbox) : null;
  var lbClose = lightbox ? $(".lightbox-close", lightbox) : null;
  var lastFocus=null;
  function openLightbox(item){
    if(!lightbox||!lbImg) return;
    var img = $("img", item);
    var cap = item.getAttribute("data-caption") || (img && img.getAttribute("alt")) || "";
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    if(lbCap) lbCap.textContent=cap;
    lastFocus=item;
    lightbox.hidden=false;
    document.body.style.overflow="hidden";
    if(lbClose) lbClose.focus();
  }
  function closeLightbox(){
    if(!lightbox) return;
    lightbox.hidden=true;
    document.body.style.overflow="";
    if(lbImg) lbImg.src="";
    if(lastFocus) lastFocus.focus();
  }
  if(lightbox){
    $$(".gallery-item").forEach(function(it){ it.addEventListener("click", function(){ openLightbox(it); }); });
    if(lbClose) lbClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function(e){ if(e.target===lightbox) closeLightbox(); });
    document.addEventListener("keydown", function(e){ if(!lightbox.hidden && e.key==="Escape") closeLightbox(); });
  }

  /* ---------- CODE PLAYGROUND + EASTER EGG ---------- */
  var codeEditor = $("#codeEditor");
  var codeRun = $(".code-run");
  var codeOutput = $("#codeOutput");
  var codeOutputPre = $("#codeOutputPre");
  var defaultLines = [
    "nama: Alvian Bagus Wijaksono",
    "kelas: X-4",
    "sekolah: SMA Negeri 1 Babat",
    "kontak: 0857-2729-8747",
    "hobi: membaca",
    "cita_cita: web development"
  ];

  function isGameCommand(text){
    if(!text) return false;
    var t = text.toLowerCase();
    return (
      t.includes("py run game") ||
      t.includes("python run game") ||
      t.includes("py game") ||
      t.includes("run game") ||
      t.includes("play snake") ||
      t.includes("snake game") ||
      t.includes("py run snake") ||
      t === "game" ||
      t.includes("easter egg")
    );
  }

  function runCode(){
    if(!codeEditor || !codeOutput || !codeOutputPre) return;
    var val = codeEditor.value || "";
    if(isGameCommand(val)){
      openGame();
      codeOutput.hidden=false;
      codeOutputPre.textContent = "> easter egg detected: py run game\n> launching SNAKE.exe...\n> use WASD / Arrow keys to play";
      codeOutput.classList.add("is-visible");
      return;
    }
    if(codeRun) { codeRun.classList.add("is-running"); var lbl=$(".run-label",codeRun); if(lbl) lbl.textContent="Running…"; }
    codeOutput.hidden=false;
    codeOutput.classList.remove("is-visible");
    codeOutputPre.textContent="";
    setTimeout(function(){
      codeOutputPre.textContent = defaultLines.join("\n");
      codeOutput.classList.add("is-visible");
      if(codeRun){ codeRun.classList.remove("is-running"); var lbl2=$(".run-label",codeRun); if(lbl2) lbl2.textContent="Run"; }
    }, 380);
  }

  if(codeRun){ codeRun.addEventListener("click", runCode); }
  if(codeEditor){
    codeEditor.addEventListener("keydown", function(e){
      if((e.ctrlKey||e.metaKey) && e.key==="Enter"){ e.preventDefault(); runCode(); }
      // tab support
      if(e.key==="Tab"){ e.preventDefault(); var s=this.selectionStart, ee=this.selectionEnd; this.value=this.value.substring(0,s)+"    "+this.value.substring(ee); this.selectionStart=this.selectionEnd=s+4; }
    });
  }

  var easterHint = $("#easterHint");
  if(easterHint){ easterHint.addEventListener("click", function(){ openGame(); }); }

  /* ---------- SNAKE GAME ---------- */
  var gameOverlay = $("#gameOverlay");
  var gameCanvas = $("#gameCanvas");
  var gameScoreEl = $("#gameScore");
  var gameBestEl = $("#gameBest");
  var gameClose = $("#gameClose");
  var gameStartEl = $("#gameStart");
  var gameOverEl = $("#gameOver");
  var gameOverScore = $("#gameOverScore");
  var gameStartBtn = $("#gameStartBtn");
  var gameRestartBtn = $("#gameRestartBtn");
  var ctx = gameCanvas ? gameCanvas.getContext("2d") : null;

  var snake, food, dir, nextDir, score, best, gameLoopId, gameSpeed, paused, gameRunning;
  var gridSize = 20;
  var tileCount = 21; // 420/20 =21

  function initSnake(){
    snake = [{x:10,y:10}];
    dir = {x:1,y:0};
    nextDir = {x:1,y:0};
    food = randomFood();
    score = 0;
    gameSpeed = 110;
    paused = false;
    updateScore();
  }

  function randomFood(){
    var pos;
    do{
      pos = {x: Math.floor(Math.random()*tileCount), y: Math.floor(Math.random()*tileCount)};
    }while(snake && snake.some(function(s){ return s.x===pos.x && s.y===pos.y; }));
    return pos;
  }

  function updateScore(){
    if(gameScoreEl) gameScoreEl.textContent = score;
    best = parseInt(localStorage.getItem("snake_best")||"0",10);
    if(score>best){ best=score; localStorage.setItem("snake_best", best); }
    if(gameBestEl) gameBestEl.textContent = best;
  }

  function draw(){
    if(!ctx || !gameCanvas) return;
    // bg
    ctx.fillStyle="#0a0a0a";
    ctx.fillRect(0,0,gameCanvas.width,gameCanvas.height);
    // subtle grid
    ctx.strokeStyle="rgba(255,255,255,0.04)";
    ctx.lineWidth=1;
    for(var i=0;i<=tileCount;i++){
      ctx.beginPath(); ctx.moveTo(i*gridSize,0); ctx.lineTo(i*gridSize, gameCanvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,i*gridSize); ctx.lineTo(gameCanvas.width, i*gridSize); ctx.stroke();
    }
    // food
    ctx.fillStyle="#f5f3ef";
    ctx.fillRect(food.x*gridSize+2, food.y*gridSize+2, gridSize-4, gridSize-4);
    // snake
    snake.forEach(function(seg, idx){
      if(idx===0){
        ctx.fillStyle="#f5f3ef";
      }else{
        ctx.fillStyle="rgba(245,243,239," + (0.9 - idx*0.02).toFixed(2) + ")";
        if(idx>30) ctx.fillStyle="rgba(245,243,239,0.3)";
      }
      ctx.fillRect(seg.x*gridSize+1, seg.y*gridSize+1, gridSize-2, gridSize-2);
    });
    // pause overlay
    if(paused){
      ctx.fillStyle="rgba(0,0,0,0.6)";
      ctx.fillRect(0,0,gameCanvas.width,gameCanvas.height);
      ctx.fillStyle="#f5f3ef";
      ctx.font="700 20px JetBrains Mono, monospace";
      ctx.textAlign="center";
      ctx.fillText("PAUSED", gameCanvas.width/2, gameCanvas.height/2);
      ctx.font="12px JetBrains Mono, monospace";
      ctx.fillText("Press P to resume", gameCanvas.width/2, gameCanvas.height/2+24);
    }
  }

  function move(){
    if(paused || !gameRunning) return;
    dir = nextDir;
    var head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
    // wrap around
    if(head.x<0) head.x=tileCount-1;
    if(head.x>=tileCount) head.x=0;
    if(head.y<0) head.y=tileCount-1;
    if(head.y>=tileCount) head.y=0;

    // self collision
    if(snake.some(function(s){ return s.x===head.x && s.y===head.y; })){
      gameOver();
      return;
    }

    snake.unshift(head);
    if(head.x===food.x && head.y===food.y){
      score += 10;
      if(score%50===0 && gameSpeed>60) gameSpeed -= 5;
      food = randomFood();
      updateScore();
      // restart loop with new speed
      clearInterval(gameLoopId);
      gameLoopId = setInterval(tick, gameSpeed);
    }else{
      snake.pop();
    }
    draw();
  }

  function tick(){ move(); }

  function gameOver(){
    gameRunning=false;
    clearInterval(gameLoopId);
    if(gameOverScore) gameOverScore.textContent = score;
    if(gameOverEl) gameOverEl.hidden=false;
    draw();
  }

  function startGame(){
    initSnake();
    gameRunning=true;
    if(gameStartEl) gameStartEl.style.display="none";
    if(gameOverEl) gameOverEl.hidden=true;
    draw();
    clearInterval(gameLoopId);
    gameLoopId = setInterval(tick, gameSpeed);
  }

  function openGame(){
    if(!gameOverlay) return;
    gameOverlay.hidden=false;
    document.body.style.overflow="hidden";
    if(gameStartEl) gameStartEl.style.display="flex";
    if(gameOverEl) gameOverEl.hidden=true;
    initSnake();
    draw();
    // focus for keyboard
    setTimeout(function(){ if(gameCanvas) gameCanvas.focus(); }, 100);
  }

  function closeGame(){
    if(!gameOverlay) return;
    gameOverlay.hidden=true;
    document.body.style.overflow="";
    gameRunning=false;
    clearInterval(gameLoopId);
  }

  if(gameClose) gameClose.addEventListener("click", closeGame);
  if(gameOverlay) gameOverlay.addEventListener("click", function(e){ if(e.target===gameOverlay) closeGame(); });
  if(gameStartBtn) gameStartBtn.addEventListener("click", startGame);
  if(gameRestartBtn) gameRestartBtn.addEventListener("click", startGame);

  // keyboard
  document.addEventListener("keydown", function(e){
    if(!gameOverlay || gameOverlay.hidden) return;
    // prevent scrolling
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();

    if(e.key==="Escape"){ closeGame(); return; }
    if(e.key.toLowerCase()==="p"){
      if(!gameRunning) return;
      paused=!paused;
      draw();
      return;
    }
    if(e.key===" "){
      if(!gameRunning){ startGame(); return; }
      paused=!paused;
      draw();
      return;
    }
    var newDir=null;
    switch(e.key){
      case "ArrowUp": case "w": case "W": newDir={x:0,y:-1}; break;
      case "ArrowDown": case "s": case "S": newDir={x:0,y:1}; break;
      case "ArrowLeft": case "a": case "A": newDir={x:-1,y:0}; break;
      case "ArrowRight": case "d": case "D": newDir={x:1,y:0}; break;
    }
    if(newDir){
      // prevent reverse
      if(newDir.x===-dir.x && newDir.y===-dir.y) return;
      nextDir=newDir;
      if(!gameRunning && gameStartEl && gameStartEl.style.display!=="none"){
        startGame();
      }
    }
  });

  // dpad buttons
  $$(".dpad button[data-dir]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var d = btn.getAttribute("data-dir");
      var nd=null;
      if(d==="up") nd={x:0,y:-1};
      if(d==="down") nd={x:0,y:1};
      if(d==="left") nd={x:-1,y:0};
      if(d==="right") nd={x:1,y:0};
      if(nd){
        if(nd.x===-dir.x && nd.y===-dir.y) return;
        nextDir=nd;
        if(!gameRunning) startGame();
      }
    });
  });

  // Konami or secret key sequence: type "py run game" anywhere?
  var buffer="";
  document.addEventListener("keydown", function(e){
    if(e.target && (e.target.tagName==="TEXTAREA"||e.target.tagName==="INPUT")) return;
    buffer += e.key.toLowerCase();
    if(buffer.length>20) buffer=buffer.slice(-20);
    if(buffer.includes("py run game") || buffer.includes("rungame")){
      openGame();
      buffer="";
    }
  });

  /* ---------- HERO FADE ON SCROLL ---------- */
  var heroInner = $(".hero-inner");
  var scrollCue = $(".scroll-cue");
  if(!reduced && heroInner){
    window.addEventListener("scroll", throttle(function(){
      var y = window.scrollY||0;
      if(y>window.innerHeight) return;
      var p = Math.min(y/(window.innerHeight*0.85),1);
      heroInner.style.opacity = (1 - p*0.5).toFixed(3);
      heroInner.style.transform = "translateY(" + (p*40).toFixed(1) + "px)";
      if(scrollCue) scrollCue.style.opacity = (1-p).toFixed(3);
    },16), {passive:true});
  }

})();
