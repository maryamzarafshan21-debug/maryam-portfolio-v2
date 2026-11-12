/* ============================================================
   Maryam Zarafshan — Portfolio v2
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  $$("#year, .pre-year").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Preloader ---------- */
  const preloader = $("#preloader");
  const preCount = $("#pre-count");
  const preBar = $("#pre-bar-fill");
  const preWord = $("#pre-word");
  const preSkip = $("#pre-skip");
  const words = ["Funnels", "Automations", "AI Agents", "CRM Systems"];

  const finishPreload = () => {
    if (!preloader) { document.body.classList.add("loaded"); return; }
    if (preloader.classList.contains("done")) return;
    if (preCount) preCount.textContent = "100";
    if (preBar) preBar.style.width = "100%";
    preloader.classList.add("done");
    document.body.classList.add("loaded");
    document.body.classList.remove("no-scroll");
    setTimeout(() => { preloader.style.display = "none"; }, 700);
  };

  if (preloader) {
    document.body.classList.add("no-scroll");
    if (reduceMotion) {
      finishPreload();
    } else {
      const duration = 2000;
      const start = performance.now();
      let wordIdx = 0;
      const wordTimer = setInterval(() => {
        wordIdx = (wordIdx + 1) % words.length;
        if (preWord) {
          preWord.textContent = words[wordIdx];
          preWord.style.animation = "none";
          void preWord.offsetWidth;
          preWord.style.animation = "wordUp 0.5s cubic-bezier(0.22,1,0.36,1)";
        }
      }, 480);

      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        if (preCount) preCount.textContent = Math.round(eased * 100);
        if (preBar) preBar.style.width = `${eased * 100}%`;
        if (p < 1) requestAnimationFrame(tick);
        else { clearInterval(wordTimer); finishPreload(); }
      };
      requestAnimationFrame(tick);
      if (preSkip) preSkip.addEventListener("click", () => { clearInterval(wordTimer); finishPreload(); });
      setTimeout(finishPreload, 4500);
    }
  }

  /* ---------- Scroll progress + header ---------- */
  const header = $("#site-header");
  const progressFill = $("#progress-fill");
  const onScroll = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 20);
    if (progressFill) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? window.scrollY / h : 0;
      progressFill.style.width = `${Math.min(p, 1) * 100}%`;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu overlay ---------- */
  const menuBtn = $("#menu-btn");
  const menuOverlay = $("#menu-overlay");
  const menuClose = $("#menu-close");

  const openMenu = () => {
    if (!menuOverlay) return;
    menuOverlay.classList.add("open");
    menuOverlay.setAttribute("aria-hidden", "false");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
  };
  const closeMenu = () => {
    if (!menuOverlay) return;
    menuOverlay.classList.remove("open");
    menuOverlay.setAttribute("aria-hidden", "true");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
  };
  if (menuBtn) menuBtn.addEventListener("click", openMenu);
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  if (menuOverlay) $$("a", menuOverlay).forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  /* ---------- Split-text heading reveal ---------- */
  const splitWords = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    let index = 0;
    textNodes.forEach((node) => {
      const parts = node.nodeValue.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement("span");
          span.className = "word";
          span.textContent = part;
          span.style.transitionDelay = `${Math.min(index * 0.05, 0.65)}s`;
          index += 1;
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    });
    root.classList.add("split");
  };

  const splitEls = $$(".statement, .section-title, .contact-title");
  if (!reduceMotion && splitEls.length) {
    splitEls.forEach((el) => { el.classList.remove("reveal"); splitWords(el); });
    if ("IntersectionObserver" in window) {
      const splitIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add("in"); splitIO.unobserve(entry.target); }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
      splitEls.forEach((el) => splitIO.observe(el));
    } else {
      splitEls.forEach((el) => el.classList.add("in"));
    }
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min((i % 5) * 60, 260)}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Stat counters ---------- */
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const statEls = $$(".a-num[data-count]");
  if ("IntersectionObserver" in window) {
    const statIO = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { animateCount(e.target); statIO.unobserve(e.target); }
      }),
      { threshold: 0.6 }
    );
    statEls.forEach((el) => statIO.observe(el));
  }

  /* ---------- Skill bars ---------- */
  const skillsBlock = $(".skills");
  const fillSkills = () => {
    $$(".skill", skillsBlock).forEach((skill) => {
      const level = skill.dataset.level || 0;
      const bar = $(".skill-bar span", skill);
      if (bar) bar.style.width = `${level}%`;
    });
  };
  if (skillsBlock) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      const skIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { fillSkills(); skIO.disconnect(); } });
      }, { threshold: 0.3 });
      skIO.observe(skillsBlock);
    } else { fillSkills(); }
  }

  /* ---------- Accordion ---------- */
  const accItems = $$(".acc-item");
  const setPanel = (item, open) => {
    const panel = $(".acc-panel", item);
    const trigger = $(".acc-trigger", item);
    if (!panel) return;
    if (open) {
      item.classList.add("open");
      panel.style.maxHeight = `${panel.scrollHeight}px`;
      if (trigger) trigger.setAttribute("aria-expanded", "true");
    } else {
      item.classList.remove("open");
      panel.style.maxHeight = "0px";
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    }
  };
  accItems.forEach((item) => {
    setPanel(item, item.classList.contains("open"));
    const trigger = $(".acc-trigger", item);
    if (trigger) {
      trigger.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        accItems.forEach((other) => { if (other !== item) setPanel(other, false); });
        setPanel(item, !isOpen);
      });
    }
  });
  window.addEventListener("resize", () => {
    accItems.forEach((item) => {
      if (item.classList.contains("open")) {
        const panel = $(".acc-panel", item);
        if (panel) panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    $$(".btn, .menu-btn").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Hero parallax ---------- */
  const heroBg = $(".hero-bg");
  const heroOrbs = $(".hero-orbs");
  if (!reduceMotion && heroBg) {
    let raf = false;
    window.addEventListener("scroll", () => {
      if (raf) return;
      raf = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 900);
        heroBg.style.transform = `translateY(${y * 0.12}px)`;
        if (heroOrbs) heroOrbs.style.transform = `translateY(${y * 0.2}px)`;
        raf = false;
      });
    }, { passive: true });
  }

  /* ---------- Featured projects: hover preview ---------- */
  const workRows = $$(".work-row");
  const previewImgs = $$(".work-preview-img");
  const previewTitle = $("#work-preview-title");
  const previewDesc = $("#work-preview-desc");
  const previewMeta = $("#work-preview-meta");
  const previewIndex = $("#work-preview-index");

  let lastWorkIndex = 0;
  const setActiveProject = (row) => {
    workRows.forEach((item) => item.classList.toggle("is-active", item === row));
    const index = Number(row.dataset.index) || 0;
    lastWorkIndex = index;
    previewImgs.forEach((img, i) => img.classList.toggle("is-active", i === index));
    if (previewTitle) previewTitle.textContent = row.dataset.title || "";
    if (previewDesc) previewDesc.textContent = row.dataset.desc || "";
    if (previewMeta) previewMeta.textContent = row.dataset.meta || "";
    if (previewIndex) {
      const total = String(workRows.length).padStart(2, "0");
      previewIndex.textContent = `${row.dataset.num || String(index + 1).padStart(2, "0")} / ${total}`;
    }
  };

  /* ---------- Lightbox ---------- */
  const lightbox = $("#lightbox");
  const lbImg = $("#lb-img");
  const lbTitle = $("#lb-title");
  const lbDesc = $("#lb-desc");
  const lbTags = $("#lb-tags");
  let lastFocused = null;

  const openLightbox = (row) => {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    lbImg.src = row.dataset.img || "";
    lbImg.alt = row.dataset.title || "Project screenshot";
    lbTitle.textContent = row.dataset.title || "";
    lbDesc.textContent = row.dataset.desc || "";
    lbTags.textContent = row.dataset.tags || "Project";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    const closeBtn = $(".lb-close", lightbox);
    if (closeBtn) closeBtn.focus();
  };
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocused) lastFocused.focus();
  };
  workRows.forEach((row) => {
    row.addEventListener("mouseenter", () => setActiveProject(row));
    row.addEventListener("focus", () => setActiveProject(row));
    row.addEventListener("click", () => openLightbox(row));
  });
  if (workRows[0]) setActiveProject(workRows[0]);

  /* ---------- Featured projects: scroll-driven active row ---------- */
  const workSection = $("#work");
  let workRaf = 0;
  const updateWorkByScroll = () => {
    workRaf = 0;
    if (!workSection || !workRows.length) return;
    const sectionRect = workSection.getBoundingClientRect();
    if (sectionRect.bottom < 0 || sectionRect.top > window.innerHeight) return;
    const line = window.innerHeight * 0.5;
    let best = 0;
    let bestDist = Infinity;
    workRows.forEach((row, i) => {
      const r = row.getBoundingClientRect();
      const dist = Math.abs(r.top + r.height / 2 - line);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    if (best !== lastWorkIndex) setActiveProject(workRows[best]);
  };
  const onWorkScroll = () => {
    if (!workRaf) workRaf = requestAnimationFrame(updateWorkByScroll);
  };
  window.addEventListener("scroll", onWorkScroll, { passive: true });
  window.addEventListener("resize", onWorkScroll);
  updateWorkByScroll();
  if (lightbox) {
    $$("[data-close]", lightbox).forEach((el) => el.addEventListener("click", closeLightbox));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
    });
  }

  /* ---------- Particle text (studio-merge style) ---------- */
  const ptEls = document.querySelectorAll('.particles-text');
  const reduceMotionParticles = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PT_FONT = '"Inter Tight", "Inter", system-ui, sans-serif';
  const ptGold = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent')
    .trim() || '#1e3a5f';

  function initParticles(el) {
    const text = el.dataset.text || '';
    let canvas = el.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      el.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const baseColor = getComputedStyle(el).color || '#2a2520';

    let width = 0;
    let height = 0;
    let baseY = 0;
    let particles = [];
    let raf = null;

    function layout() {
      width = el.clientWidth;
      let fs = 200;
      ctx.font = `800 ${fs}px ${PT_FONT}`;
      let tw = ctx.measureText(text).width;
      if (!tw) tw = 1;
      fs = Math.min(fs * ((width * 0.96) / tw), width * 0.32);
      height = fs * 1.45;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `800 ${fs}px ${PT_FONT}`;
      ctx.textBaseline = 'alphabetic';
      baseY = fs * 1.18;

      const chars = Array.from(text);
      particles = chars.map((ch, i) => ({
        ch,
        x: i === 0 ? 0 : ctx.measureText(text.slice(0, i)).width,
        phaseA: Math.random() * Math.PI * 2,
        phaseB: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.55,
        ampY: 3 + Math.random() * 6,
        ampX: 1.5 + Math.random() * 3,
        gold: i % 6 === 0,
      }));
    }

    function draw(t) {
      ctx.clearRect(0, 0, width, height);
      ctx.textAlign = 'left';
      particles.forEach((p) => {
        const dx = Math.cos(t * 0.001 * p.speed + p.phaseA) * p.ampX;
        const dy = Math.sin(t * 0.0012 * p.speed + p.phaseB) * p.ampY;
        ctx.fillStyle = p.gold ? ptGold : baseColor;
        ctx.fillText(p.ch, p.x + dx, baseY + dy);
      });
      raf = requestAnimationFrame(draw);
    }

    function staticDraw() {
      ctx.clearRect(0, 0, width, height);
      ctx.textAlign = 'left';
      particles.forEach((p) => {
        ctx.fillStyle = p.gold ? ptGold : baseColor;
        ctx.fillText(p.ch, p.x, baseY);
      });
    }

    layout();
    if (reduceMotionParticles) {
      staticDraw();
    } else {
      raf = requestAnimationFrame(draw);
    }

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        if (el.clientWidth > 0) layout();
      });
      ro.observe(el);
    }
  }

  ptEls.forEach(initParticles);

  /* ---------- Custom cursor ---------- */
  const cursorDot = $("#cursor-dot");
  const cursorRing = $("#cursor-ring");
  const cursorLabel = $("#cursor-label");
  const rootEl = document.documentElement;

  if (
    window.matchMedia("(pointer: fine)").matches &&
    !reduceMotion &&
    cursorDot &&
    cursorRing
  ) {
    rootEl.classList.add("custom-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX, dotY = mouseY;
    let ringX = mouseX, ringY = mouseY;
    let visible = false;

    const interactiveSelector =
      "a, button, [role='button'], .gallery-card, .work-row, .acc-trigger, .hero-stamp, input, textarea, select, .cursor-hover";

    const getCursorLabel = (el) => {
      if (!el) return "";
      if (el.dataset && el.dataset.cursor) return el.dataset.cursor;
      if (el.matches("input, textarea, select")) return "Type";
      if (el.matches(".work-row")) return "View";
      if (el.matches(".hanging-bulb")) return "Lights";
      if (el.matches(".hero-stamp")) return "Hey";
      if (el.closest("#contact, .contact")) return "Say hi";
      if (el.matches("a, button")) return "Open";
      return "";
    };

    const showCursor = () => {
      if (visible) return;
      visible = true;
      dotX = ringX = mouseX;
      dotY = ringY = mouseY;
      cursorDot.classList.add("is-visible");
      cursorRing.classList.add("is-visible");
    };

    window.addEventListener(
      "pointermove",
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        showCursor();
      },
      { passive: true }
    );

    document.addEventListener("pointerleave", () => {
      visible = false;
      cursorDot.classList.remove("is-visible");
      cursorRing.classList.remove("is-visible");
    });

    const renderCursor = () => {
      dotX += (mouseX - dotX) * 0.55;
      dotY += (mouseY - dotY) * 0.55;
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    document.addEventListener("pointerover", (e) => {
      const hit = e.target.closest(interactiveSelector);
      if (!hit) return;
      rootEl.classList.add("cursor-hover");
      if (cursorLabel) cursorLabel.textContent = getCursorLabel(hit);
    });
    document.addEventListener("pointerout", (e) => {
      const hit = e.target.closest(interactiveSelector);
      const next = e.relatedTarget && e.relatedTarget.closest
        ? e.relatedTarget.closest(interactiveSelector)
        : null;
      if (hit && !next) rootEl.classList.remove("cursor-hover");
    });
    window.addEventListener("pointerdown", () => rootEl.classList.add("cursor-down"));
    window.addEventListener("pointerup", () => rootEl.classList.remove("cursor-down"));
  }

  /* ---------- Funky utilities: toast, confetti, sound ---------- */
  const toastEl = $("#easter-toast");
  let toastTimer = null;
  const showToast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
  };

  const confettiColors = ["#6b1f2f", "#d8a24a", "#c98580", "#171012", "#f4ede3"];
  const burstConfetti = (x, y, count = 26) => {
    if (reduceMotion) return;
    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      piece.style.background = confettiColors[i % confettiColors.length];
      piece.style.borderRadius = i % 3 === 0 ? "50%" : "1px";
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = 70 + Math.random() * 140;
      piece.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      piece.style.setProperty("--dy", `${Math.sin(angle) * dist - 40}px`);
      piece.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 1300);
    }
  };

  const soundToggle = $("#sound-toggle");
  let audioCtx = null;
  let soundOn = false;
  const playBlip = (freq = 520, dur = 0.08, type = "sine", peak = 0.05) => {
    if (!soundOn || !audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  };

  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      soundOn = !soundOn;
      soundToggle.classList.toggle("is-on", soundOn);
      soundToggle.setAttribute("aria-pressed", String(soundOn));
      soundToggle.setAttribute("aria-label", soundOn ? "Disable sound" : "Enable sound");
      const label = $(".sound-label", soundToggle);
      if (label) label.textContent = soundOn ? "Sound on" : "Sound off";
      if (soundOn) {
        if (!audioCtx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (AC) audioCtx = new AC();
        }
        if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
        playBlip(660, 0.09, "sine", 0.05);
        setTimeout(() => playBlip(880, 0.1, "sine", 0.04), 95);
      }
    });
    document.addEventListener("click", (e) => {
      if (!soundOn) return;
      if (e.target.closest("#sound-toggle")) return;
      if (e.target.closest("a, button")) playBlip(420, 0.05, "triangle", 0.03);
    });
  }

  /* ---------- Sticker parallax ---------- */
  const stickers = $$(".sticker[data-speed]");
  if (!reduceMotion && stickers.length) {
    let stickerRaf = false;
    const moveStickers = () => {
      stickerRaf = false;
      const y = Math.min(window.scrollY, 1000);
      stickers.forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 0;
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
    };
    window.addEventListener("scroll", () => {
      if (stickerRaf) return;
      stickerRaf = true;
      requestAnimationFrame(moveStickers);
    }, { passive: true });
    moveStickers();
  }

  /* ---------- Clip-path reveals ---------- */
  const clipEls = $$(".clip-reveal");
  if (clipEls.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      const clipIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            $$(".clip-reveal", entry.target).forEach((el) => el.classList.add("in"));
            clipIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      clipEls.forEach((el) => {
        const watch = el.parentElement;
        if (watch) clipIO.observe(watch);
        else el.classList.add("in");
      });
    } else {
      clipEls.forEach((el) => el.classList.add("in"));
    }
  }

  /* ---------- Scramble hover ---------- */
  const scrambleEls = $$(".menu-links a, .work-row-title, .sec-label");
  if (!reduceMotion && scrambleEls.length) {
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*";
    scrambleEls.forEach((el) => {
      const original = el.textContent;
      let rafId = null;
      el.addEventListener("pointerenter", () => {
        if (rafId) cancelAnimationFrame(rafId);
        let frame = 0;
        const total = 14;
        const run = () => {
          el.textContent = original.split("").map((ch, i) => {
            if (ch === " ") return " ";
            if (i < (frame / total) * original.length) return ch;
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          }).join("");
          frame += 1;
          if (frame <= total) {
            rafId = requestAnimationFrame(run);
          } else {
            el.textContent = original;
            rafId = null;
          }
        };
        run();
      });
    });
  }

  /* ---------- 3D tilt cards ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    $$(".d-card, .hero-stamp").forEach((el) => {
      el.classList.add("tilt");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(800px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Easter egg: the MZ stamp ---------- */
  const heroStamp = $(".hero-stamp");
  if (heroStamp) {
    heroStamp.addEventListener("click", () => {
      const r = heroStamp.getBoundingClientRect();
      burstConfetti(r.left + r.width / 2, r.top + r.height / 2, 30);
      showToast("You found the easter egg — now let's build something funky.");
      playBlip(880, 0.12, "sine", 0.05);
    });
  }

  /* ---------- Hanging bulb ---------- */
  const hangingBulb = $("#hanging-bulb");
  if (hangingBulb) {
    let bulbTimer = null;
    const lightBulb = (hold = 700) => {
      hangingBulb.classList.add("is-on");
      clearTimeout(bulbTimer);
      bulbTimer = setTimeout(() => hangingBulb.classList.remove("is-on"), hold);
    };

    hangingBulb.addEventListener("click", () => {
      const off = document.body.classList.toggle("lights-off");
      hangingBulb.classList.add("is-on");
      hangingBulb.setAttribute("aria-pressed", String(off));
      hangingBulb.setAttribute("aria-label", off ? "Toggle lights on" : "Toggle lights off");
      playBlip(off ? 320 : 640, 0.12, "sine", 0.045);
      if (off) showToast("Lights off — tap the bulb again to bring them back.");
    });

    if (!reduceMotion) {
      window.addEventListener(
        "scroll",
        () => lightBulb(650),
        { passive: true }
      );

      if ("IntersectionObserver" in window) {
        const bulbIO = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.18) {
                lightBulb(900);
              }
            });
          },
          { threshold: [0.18] }
        );
        $$("main section").forEach((section) => bulbIO.observe(section));
      }

      setTimeout(() => lightBulb(1400), 2600);
    }
  }

  /* ---------- Contact form ---------- */
  const form = $("#contact-form");
  const formNote = $("#form-note");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      $$("[required]", form).forEach((field) => {
        const wrap = field.closest(".form-field");
        const ok = field.value.trim().length > 0 &&
          (field.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
        if (wrap) wrap.classList.toggle("invalid", !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        if (formNote) { formNote.textContent = "Please fill in the required fields correctly."; formNote.classList.remove("success"); }
        return;
      }
      const name = ($("#f-name").value.trim().split(" ")[0]) || "there";
      form.reset();
      if (formNote) {
        formNote.textContent = `Thanks ${name}! Your message is ready — I'll reply shortly.`;
        formNote.classList.add("success");
      }
      const submitBtn = $(".btn-block", form);
      if (submitBtn) {
        const r = submitBtn.getBoundingClientRect();
        burstConfetti(r.left + r.width / 2, r.top + r.height / 2, 34);
      }
      playBlip(700, 0.1, "sine", 0.05);
      setTimeout(() => playBlip(980, 0.14, "sine", 0.045), 110);
    });
    $$("input, textarea", form).forEach((field) => {
      field.addEventListener("input", () => {
        const wrap = field.closest(".form-field");
        if (wrap) wrap.classList.remove("invalid");
      });
    });
  }
})();
