/* =============================================================
   ALVIAN BAGUS WIJAKSONO — PORTFOLIO INTERACTIONS
   Scroll reveal · parallax · custom cursor · nav · lightbox
   No libraries. Fast on mobile. Respects prefers-reduced-motion.
   ============================================================= */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var touchDevice = !finePointer;

  var docEl = document.documentElement;

  /* ---------- Helpers ---------- */
  function raf(fn) {
    return window.requestAnimationFrame(fn);
  }

  function throttle(fn, ms) {
    var last = 0;
    var timer = null;
    return function () {
      var now = Date.now();
      var args = arguments;
      var remaining = ms - (now - last);
      if (remaining <= 0) {
        if (timer) { clearTimeout(timer); timer = null; }
        last = now;
        fn.apply(null, args);
      } else if (!timer) {
        timer = setTimeout(function () {
          last = Date.now();
          timer = null;
          fn.apply(null, args);
        }, remaining);
      }
    };
  }

  /* ---------- Scroll progress + header state ---------- */
  var progress = document.querySelector(".progress");
  var siteHead = document.querySelector(".site-head");

  function onScrollState() {
    var y = window.scrollY || docEl.scrollTop;
    var max = (docEl.scrollHeight - window.innerHeight) || 1;
    if (progress) progress.style.width = Math.min(100, (y / max) * 100) + "%";
    if (siteHead) siteHead.classList.toggle("is-scrolled", y > 12);
  }

  window.addEventListener("scroll", throttle(onScrollState, 20), { passive: true });
  onScrollState();

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.querySelector(".menu-toggle");
  var navPanelLinks = document.querySelectorAll(".nav-mobile a");

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      var open = siteHead.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("menu-locked", open);
      document.body.style.overflow = open ? "hidden" : "";
    });

    navPanelLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        siteHead.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-locked");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Active nav link on scroll (IntersectionObserver) ---------- */
  var sections = document.querySelectorAll("main section[id], footer[id]");
  var navItems = document.querySelectorAll(".nav-links .nav-item");

  function setActive(id) {
    navItems.forEach(function (item) {
      var href = item.getAttribute("href") || "";
      item.classList.toggle("is-active", href === "#" + id);
    });
  }

  if ("IntersectionObserver" in window && navItems.length) {
    var sectionMap = {};
    sections.forEach(function (s) { sectionMap[s.id] = s; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealables = document.querySelectorAll("[data-reveal]");
  var staggers = document.querySelectorAll(".stagger");

  function revealNow(el) {
    el.classList.add("is-revealed");
  }

  function revealHero() {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var title = hero.querySelector(".hero-title");
    if (title) {
      var spans = title.querySelectorAll(".stagger");
      spans.forEach(function (span, i) {
        span.style.transitionDelay = (120 + i * 70) + "ms";
        span.classList.add("is-revealed");
      });
    }
    var kicker = hero.querySelector(".hero-kicker");
    var tagline = hero.querySelector(".hero-tagline");
    var sub = hero.querySelector(".hero-sub");
    var actions = hero.querySelector(".hero-actions");
    var meta = hero.querySelector(".hero-meta");
    [kicker, tagline, sub, actions, meta].forEach(function (el, i) {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(22px)";
      el.style.transition = "opacity 0.8s cubic-bezier(0.19,1,0.22,1), transform 0.8s cubic-bezier(0.19,1,0.22,1)";
      el.style.transitionDelay = (300 + i * 110) + "ms";
      raf(function () {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
    });
  }

  function revealSectionTitles() {
    // fallback used only when IntersectionObserver is unavailable
    staggers.forEach(function (stagger, i) {
      if (stagger.closest(".hero")) return;
      stagger.style.transitionDelay = (i % 3) * 90 + "ms";
    });
  }

  if (reducedMotion) {
    revealables.forEach(revealNow);
    staggers.forEach(revealNow);
    revealHero();
  } else if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealNow(entry.target);
        obs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    revealables.forEach(function (el) {
      var order = el.getAttribute("data-reveal-order");
      if (order) el.style.setProperty("--d", Math.min(Number(order) * 90, 400) + "ms");
      revealObserver.observe(el);
    });

    var titleObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var spans = entry.target.querySelectorAll(".stagger");
        spans.forEach(function (span, i) {
          span.style.transitionDelay = (i * 90) + "ms";
          revealNow(span);
        });
        obs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.2 });

    document.querySelectorAll(".section-title").forEach(function (title) {
      titleObserver.observe(title);
    });

    revealHero();
  } else {
    revealables.forEach(revealNow);
    staggers.forEach(revealNow);
    revealHero();
  }

  /* ---------- Interactive typography: outline fill on hover ---------- */
  document.querySelectorAll(".outline-word").forEach(function (word) {
    word.addEventListener("pointerenter", function () { word.classList.add("is-hovered"); });
    word.addEventListener("pointerleave", function () { word.classList.remove("is-hovered"); });
  });

  /* ---------- Skill name: hover reveals full meaning ---------- */
  document.querySelectorAll(".skill-name[data-hover-text]").forEach(function (name) {
    var original = name.textContent.trim();
    var meaning = name.getAttribute("data-hover-text");
    if (touchDevice) {
      // Show the meaning inline on touch devices
      var parent = name.closest(".skill-head");
      if (parent) {
        var small = document.createElement("span");
        small.className = "skill-meaning";
        small.textContent = meaning;
        small.setAttribute("aria-hidden", "true");
        parent.appendChild(small);
      }
      return;
    }
    name.addEventListener("mouseenter", function () { name.textContent = meaning; });
    name.addEventListener("mouseleave", function () { name.textContent = original; });
  });

  /* ---------- Interactive backdrop: parallax blobs + drifting dots ---------- */
  var backdrop = document.querySelector(".backdrop");
  var dotsHost = backdrop ? backdrop.querySelector(".dots") : null;

  function driftDots() {
    if (!dotsHost || reducedMotion) return;
    var dots = dotsHost.querySelectorAll(".dot");
    if (!dots.length) return;
    var ms = 1.5;
    var y = window.scrollY || 0;
    dots.forEach(function (dot) {
      var fx = parseFloat(dot.getAttribute("data-fx")) || 0.25;
      var fy = parseFloat(dot.getAttribute("data-fy")) || 0.5;
      var range = 30;
      var offset = y * fy;
      var px = fx * (window.innerWidth + 160);
      var py = 160 + ((offset + fy * 240) % (window.innerHeight + 200));
      dot.style.transform = "translate3d(" + px + "px," + py + "px,0)";
    });
  }

  if (backdrop) {
    var count = touchDevice ? 6 : 12;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var dot = document.createElement("span");
      dot.className = "dot";
      dot.style.left = "0";
      dot.style.top = "0";
      var fx = Math.random();
      var fy = 0.12 + Math.random() * 0.5;
      dot.setAttribute("data-fx", fx);
      dot.setAttribute("data-fy", fy);
      var size = 2 + Math.random() * 3;
      dot.style.width = size + "px";
      dot.style.height = size + "px";
      dot.style.opacity = (0.15 + Math.random() * 0.35).toFixed(2);
      if (!dotsHost) continue;
      dotsHost.appendChild(dot);
    }
  }

  function parallaxBackdrop() {
    if (!backdrop || reducedMotion) return;
    var y = window.scrollY || 0;
    var blobs = backdrop.querySelectorAll(".blob");
    blobs.forEach(function (blob) {
      var depth = parseFloat(blob.getAttribute("data-depth")) || 20;
      blob.style.transform = "translate3d(0," + (y * (depth / 100)).toFixed(1) + "px,0)";
    });
    driftDots();
  }

  if (!reducedMotion) {
    window.addEventListener("scroll", throttle(parallaxBackdrop, 24), { passive: true });
    window.addEventListener("resize", throttle(driftDots, 120));
    parallaxBackdrop();
  }

  /* ---------- Image parallax (subtle) ---------- */
  var parallaxEls = document.querySelectorAll("[data-parallax]");
  if (!reducedMotion && !touchDevice && "IntersectionObserver" in window) {
    parallaxEls.forEach(function (el) {
      var inner = el.querySelector("img");
      if (!inner) return;
      var start = null;
      var target = 0;
      var current = 0;
      var isInView = false;

      var obs = new IntersectionObserver(function (entries) {
        isInView = entries[0].isIntersecting;
      }, { threshold: 0 });
      obs.observe(el);

      function tick(now) {
        if (start === null) start = now;
        var delta = Math.min((now - start) / 1000, 0.1);
        start = now;
        if (isInView) {
          var rect = el.getBoundingClientRect();
          var progressInView = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
          target = progressInView * 26; // px of shift
        }
        current += (target - current) * Math.min(1, delta * 6);
        inner.style.transform = "translate3d(0," + current.toFixed(2) + "px,0)";
        raf(tick);
      }
      raf(tick);
    });
  }

  /* ---------- Custom cursor (desktop, fine pointer only) ---------- */
  var cursorDot, cursorRing, dotX = 0, dotY = 0, ringX = 0, ringY = 0;

  function initCursor() {
    if (reducedMotion || !finePointer) return;
    cursorDot = document.createElement("div");
    cursorDot.className = "cursor-dot";
    cursorDot.setAttribute("aria-hidden", "true");
    cursorRing = document.createElement("div");
    cursorRing.className = "cursor-ring";
    cursorRing.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);
    document.body.classList.add("cursor-on");

    window.addEventListener("pointermove", function (e) {
      dotX = e.clientX;
      dotY = e.clientY;
      if (cursorDot) {
        cursorDot.style.left = dotX + "px";
        cursorDot.style.top = dotY + "px";
      }
    }, { passive: true });

    var activeEl = null;
    document.addEventListener("pointerover", function (e) {
      var t = e.target.closest ? e.target.closest("a, button, [data-cursor]") : null;
      if (!t) return;
      var mode = t.getAttribute("data-cursor") || "link";
      document.body.classList.remove("cursor-link", "cursor-view");
      if (mode === "view") document.body.classList.add("cursor-view");
      else document.body.classList.add("cursor-link");
      activeEl = t;
    });

    document.addEventListener("pointerout", function (e) {
      var t = e.target.closest ? e.target.closest("a, button, [data-cursor]") : null;
      if (t && activeEl === t) {
        document.body.classList.remove("cursor-link", "cursor-view");
        activeEl = null;
      }
    });

    (function ringLoop() {
      ringX += (dotX - ringX) * 0.16;
      ringY += (dotY - ringY) * 0.16;
      if (cursorRing) {
        cursorRing.style.left = ringX + "px";
        cursorRing.style.top = ringY + "px";
      }
      raf(ringLoop);
    })();
  }

  initCursor();

  /* ---------- Lightbox ---------- */
  var lightbox = document.querySelector(".lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector(".lightbox-img") : null;
  var lightboxCaption = lightbox ? lightbox.querySelector(".lightbox-caption") : null;
  var lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;
  var lastFocus = null;

  function openLightbox(item) {
    if (!lightbox || !lightboxImg) return;
    var img = item.querySelector("img");
    var caption = item.getAttribute("data-caption") || (img && img.getAttribute("alt")) || "";
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    if (lightboxCaption) lightboxCaption.textContent = caption;
    lastFocus = item;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lightboxImg) lightboxImg.src = "";
    if (lastFocus) lastFocus.focus();
  }

  if (lightbox) {
    document.querySelectorAll(".gallery-item").forEach(function (item) {
      item.addEventListener("click", function () { openLightbox(item); });
    });
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "Tab") {
        // simple focus trap
        var focusables = lightbox.querySelectorAll("button, [tabindex]");
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ---------- Hover preview for projects (big cursor) ---------- */
  if (!reducedMotion && finePointer) {
    var previewEl = document.createElement("div");
    previewEl.className = "project-preview";
    previewEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(previewEl);

    var previewImg = document.createElement("img");
    previewImg.alt = "";
    previewEl.appendChild(previewImg);

    document.querySelectorAll("[data-hover-preview]").forEach(function (project) {
      project.addEventListener("pointerenter", function () {
        previewImg.src = project.getAttribute("data-hover-preview");
        previewEl.classList.add("is-visible");
      });
      project.addEventListener("pointermove", function (e) {
        previewEl.style.left = (e.clientX + 26) + "px";
        previewEl.style.top = (e.clientY - 80) + "px";
      });
      project.addEventListener("pointerleave", function () {
        previewEl.classList.remove("is-visible");
      });
    });

    var previewStyle = document.createElement("style");
    previewStyle.textContent =
      ".project-preview{position:fixed;z-index:150;width:250px;height:146px;overflow:hidden;" +
      "border:1px solid var(--accent-dim);background:var(--surface);opacity:0;pointer-events:none;" +
      "transform:translateY(10px) scale(.96);transition:opacity .25s,transform .35s cubic-bezier(.19,1,.22,1);}" +
      ".project-preview.is-visible{opacity:1;transform:translateY(0) scale(1);}" +
      ".project-preview img{width:100%;height:100%;object-fit:cover;}";
    document.head.appendChild(previewStyle);
  }

  /* ---------- Profile-in-code: fake Python playground ---------- */
  var codeRun = document.querySelector(".code-run");
  var codeOutput = document.querySelector(".code-output");
  var codeOutputBody = codeOutput ? codeOutput.querySelector("pre") : null;
  var codeOutputLines = [
    "nama: Alvian Bagus Wijaksono",
    "kelas: X-4",
    "sekolah: SMA Negeri 1 Babat",
    "kontak: 0857-2729-8747",
    "hobi: membaca",
    "cita_cita: web development"
  ];

  if (codeRun && codeOutput) {
    codeRun.addEventListener("click", function () {
      if (codeRun.classList.contains("is-running")) return;
      var label = codeRun.querySelector(".run-label");
      codeRun.classList.add("is-running");
      if (label) label.textContent = "Running…";

      codeOutput.hidden = false;
      codeOutput.classList.remove("is-visible");
      if (codeOutputBody) codeOutputBody.textContent = "";

      setTimeout(function () {
        if (codeOutputBody) codeOutputBody.textContent = codeOutputLines.join("\n");
        codeOutput.classList.add("is-visible");
        codeRun.classList.remove("is-running");
        if (label) label.textContent = "Run";
      }, 560);
    });
  }
})();
