/* ============================================================
   Julianna Head — Portfolio interactions
   ============================================================ */

(function () {
  "use strict";

  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  /* ---- Year ---- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Nav background on scroll + progress bar ---- */
  function onScroll() {
    const y = window.scrollY || window.pageYOffset;

    if (nav) nav.classList.toggle("is-scrolled", y > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  function closeMenu() {
    if (!navToggle || !mobileMenu) return;
    navToggle.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      const open = mobileMenu.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  /* ---- Scroll reveal ---- */
  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Stagger hero reveals slightly ---- */
  document.querySelectorAll(".hero .reveal").forEach(function (el, i) {
    el.style.transitionDelay = i * 0.09 + "s";
  });

  /* ---- Work slider — scroll-pinned on desktop, swipe on mobile ---- */
  const workSection = document.getElementById("work");
  const workPinWrap = document.getElementById("workPinWrap");
  const workPin = document.getElementById("workPin");
  const workAlign = document.getElementById("workAlign");
  const workViewport = document.getElementById("workViewport");
  const workTrack = document.getElementById("workTrack");
  const workPrev = document.getElementById("workPrev");
  const workNext = document.getElementById("workNext");
  const workCurrent = document.getElementById("workCurrent");
  const workProgressBar = document.getElementById("workProgressBar");
  const workHint = document.getElementById("workHint");

  if (workTrack && workViewport) {
    const cards = workTrack.querySelectorAll(".case-card");
    const total = cards.length;
    const SLIDE_MS = 550;
    const SCROLL_STEP_RATIO = 0.55;
    let activeIndex = 0;
    let isAnimating = false;
    let wheelCooldown = false;
    let scrollPinEnabled = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartTranslate = 0;
    let dragMoved = false;
    let dragBounds = { min: 0, max: 0 };

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 860px)");

    function padIndex(n) {
      return String(n).padStart(2, "0");
    }

    function getScrollStep() {
      return Math.max(380, window.innerHeight * SCROLL_STEP_RATIO);
    }

    function getViewportMetrics() {
      const rect = workViewport.getBoundingClientRect();
      const style = getComputedStyle(workViewport);
      const padL = parseFloat(style.paddingLeft) || 0;
      const padR = parseFloat(style.paddingRight) || 0;
      return {
        left: rect.left + padL,
        right: rect.right - padR,
        width: rect.width - padL - padR,
        clientWidth: workViewport.clientWidth,
      };
    }

    function getAlignInset() {
      if (!workAlign) return getEdgePad();
      const metrics = getViewportMetrics();
      return workAlign.getBoundingClientRect().left - metrics.left;
    }

    function getEdgePad() {
      const rootPad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--pad"));
      return Number.isFinite(rootPad) ? rootPad : 80;
    }

    function getSlideTarget(index) {
      const card = cards[index];
      if (!card) return 0;

      const metrics = getViewportMetrics();
      const alignLeft = workAlign
        ? workAlign.getBoundingClientRect().left
        : metrics.left;
      const cardWidth = card.offsetWidth;
      const edgeGap = index === total - 1 ? 24 : 8;
      let desiredLeft = alignLeft;

      if (index === total - 1 || cardWidth > metrics.width - (alignLeft - metrics.left)) {
        desiredLeft = Math.min(alignLeft, metrics.right - cardWidth - edgeGap);
      }

      const inset = desiredLeft - metrics.left;
      return Math.max(0, card.offsetLeft - inset);
    }

    function getSlideOffset(index) {
      const target = getSlideTarget(index);
      const maxOffset = Math.max(0, workTrack.scrollWidth - getViewportMetrics().clientWidth);
      return Math.max(0, Math.min(maxOffset, target));
    }

    function getTrackTranslate() {
      const matrix = new DOMMatrix(getComputedStyle(workTrack).transform);
      return matrix.m41;
    }

    function getTranslateBounds() {
      updateTrackPadding();
      workTrack.offsetHeight;
      const maxOffset = Math.max(0, workTrack.scrollWidth - workViewport.clientWidth);
      return { min: -maxOffset, max: 0 };
    }

    function resolveFinalOffset(index) {
      updateTrackPadding();
      workTrack.offsetHeight;

      let offset = getSlideOffset(index);
      if (index !== total - 1) return offset;

      const savedTransform = workTrack.style.transform;
      const savedTransition = workTrack.style.transition;
      workTrack.style.transition = "none";

      for (let guard = 0; guard < 6; guard++) {
        workTrack.style.transform = "translateX(" + (-offset) + "px)";
        workTrack.offsetHeight;
        const overflow = cards[index].getBoundingClientRect().right - getViewportMetrics().right;
        if (overflow <= 0.5) break;
        offset += overflow + 6;
        const pad = parseFloat(workTrack.style.paddingRight) || 0;
        workTrack.style.paddingRight = (pad + overflow + 20) + "px";
        workTrack.offsetHeight;
        offset = Math.max(offset, getSlideOffset(index));
      }

      workTrack.style.transform = savedTransform;
      workTrack.style.transition = savedTransition;
      return offset;
    }

    function setTranslateX(offset, animate) {
      const useTransition = animate && !reducedMotionQuery.matches && !isDragging;
      if (!useTransition) {
        workTrack.style.transition = "none";
      }
      workTrack.style.transform = "translateX(" + (-offset) + "px)";
      if (!useTransition) {
        workTrack.offsetHeight;
        workTrack.style.transition = "";
      }
    }

    function updateTrackPadding() {
      const lastCard = cards[total - 1];
      if (!lastCard) return;

      const metrics = getViewportMetrics();
      const lastTarget = getSlideTarget(total - 1);
      const contentEnd = lastCard.offsetLeft + lastCard.offsetWidth;
      const spare = Math.max(getEdgePad(), lastTarget + metrics.clientWidth - contentEnd);
      workTrack.style.paddingRight = spare + "px";
    }

    function updateWorkControls() {
      if (workCurrent) workCurrent.textContent = padIndex(activeIndex + 1);
      if (workPrev) workPrev.disabled = activeIndex === 0;
      if (workNext) workNext.disabled = activeIndex >= total - 1;
      if (workProgressBar && total > 1) {
        workProgressBar.style.width = ((activeIndex / (total - 1)) * 100) + "%";
      }
    }

    function setActiveCard(index) {
      cards.forEach(function (card, i) {
        card.classList.toggle("is-active", i === index);
      });
    }

    function finishAnimation() {
      isAnimating = false;
      updateWorkControls();
    }

    function goTo(index, animate) {
      const nextIndex = Math.max(0, Math.min(total - 1, index));
      if (nextIndex === activeIndex && animate !== false) return false;

      activeIndex = nextIndex;
      setActiveCard(activeIndex);
      updateWorkControls();

      const finalOffset = resolveFinalOffset(activeIndex);
      const useAnimate = animate !== false && !reducedMotionQuery.matches;

      if (!useAnimate) {
        setTranslateX(finalOffset, false);
        finishAnimation();
        return true;
      }

      isAnimating = true;
      setTranslateX(finalOffset, true);
      return true;
    }

    function step(direction) {
      if (isAnimating || isDragging) return;
      goTo(activeIndex + direction);
    }

    function snapFromDrag(deltaX) {
      if (deltaX <= -40 && activeIndex < total - 1) {
        goTo(activeIndex + 1, true);
      } else if (deltaX >= 40 && activeIndex > 0) {
        goTo(activeIndex - 1, true);
      } else {
        goTo(activeIndex, true);
      }
    }

    function setPinHeight() {
      if (!workPinWrap || !workPin) return;
      if (!scrollPinEnabled) {
        workPinWrap.style.height = "";
        return;
      }
      updateTrackPadding();
      const step = getScrollStep();
      const pinHeight = workPin.offsetHeight;
      workPinWrap.style.height = (pinHeight + (total - 1) * step) + "px";
    }

    function evaluateScrollPin() {
      scrollPinEnabled = !reducedMotionQuery.matches && !mobileQuery.matches && !!workPinWrap && !!workPin;
      if (workSection) workSection.classList.toggle("work--scroll-pin", scrollPinEnabled);
      if (workHint) {
        workHint.textContent = scrollPinEnabled
          ? "Keep scrolling →"
          : "Drag or use arrows →";
      }
      setPinHeight();
      onPinScroll();
    }

    function onPinScroll() {
      if (!scrollPinEnabled || !workPinWrap) return;

      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 64;
      const wrapTop = workPinWrap.getBoundingClientRect().top;
      const scrolled = Math.max(0, navH - wrapTop);
      const step = getScrollStep();
      const pinTravel = (total - 1) * step;
      const progress = pinTravel > 0 ? Math.min(1, scrolled / pinTravel) : 0;
      const targetIndex = Math.min(total - 1, Math.round(progress * (total - 1)));

      if (targetIndex !== activeIndex) {
        goTo(targetIndex, false);
      }
    }

    workTrack.addEventListener("transitionend", function (e) {
      if (e.propertyName === "transform") finishAnimation();
    });

    if (workPrev) {
      workPrev.addEventListener("click", function () { step(-1); });
    }

    if (workNext) {
      workNext.addEventListener("click", function () { step(1); });
    }

    workViewport.addEventListener("wheel", function (e) {
      if (scrollPinEnabled) return;

      const delta = e.deltaY;
      if (Math.abs(delta) < 12) return;

      const goingNext = delta > 0;
      const goingPrev = delta < 0;

      if (goingNext && activeIndex >= total - 1) return;
      if (goingPrev && activeIndex <= 0) return;

      const isFocused = workViewport.contains(document.activeElement);
      if (!workViewport.matches(":hover") && !isFocused) return;

      e.preventDefault();

      if (isAnimating || wheelCooldown || isDragging) return;

      if (goTo(activeIndex + (goingNext ? 1 : -1))) {
        wheelCooldown = true;
        window.setTimeout(function () {
          wheelCooldown = false;
        }, SLIDE_MS);
      }
    }, { passive: false });

    workViewport.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    });

    workViewport.addEventListener("mousedown", function (e) {
      if (e.button !== 0 || isAnimating) return;

      isDragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartTranslate = getTrackTranslate();
      dragBounds = getTranslateBounds();

      workTrack.style.transition = "none";
      workViewport.classList.add("is-dragging");
      workTrack.classList.add("is-dragging");
      e.preventDefault();
    });

    window.addEventListener("mousemove", function (e) {
      if (!isDragging) return;

      const dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 4) dragMoved = true;

      const bounds = dragBounds;
      const next = Math.max(bounds.min, Math.min(bounds.max, dragStartTranslate + dx));
      workTrack.style.transform = "translateX(" + next + "px)";
    });

    window.addEventListener("mouseup", function (e) {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartX;
      isDragging = false;
      workViewport.classList.remove("is-dragging");
      workTrack.classList.remove("is-dragging");
      workTrack.style.transition = "";

      if (!dragMoved) return;
      snapFromDrag(deltaX);
    });

    workViewport.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });

    workViewport.addEventListener("touchstart", function (e) {
      if (isDragging) return;
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    workViewport.addEventListener("touchend", function (e) {
      if (isDragging) return;
      const dx = e.changedTouches[0].screenX - touchStartX;
      const dy = e.changedTouches[0].screenY - touchStartY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) step(1);
      else step(-1);
    }, { passive: true });

    window.addEventListener("scroll", onPinScroll, { passive: true });
    window.addEventListener("resize", function () {
      evaluateScrollPin();
      updateTrackPadding();
      goTo(activeIndex, false);
    });

    reducedMotionQuery.addEventListener("change", evaluateScrollPin);
    mobileQuery.addEventListener("change", evaluateScrollPin);

    window.addEventListener("load", function () {
      evaluateScrollPin();
      updateTrackPadding();
      goTo(0, false);
      onPinScroll();
    });

    evaluateScrollPin();
    updateTrackPadding();
    goTo(0, false);
  }

  /* ---- Contact form (async submit, inline status) ---- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const accessKey = form.querySelector('input[name="access_key"]');
      if (accessKey && accessKey.value === "YOUR_WEB3FORMS_ACCESS_KEY") {
        setStatus("Form isn't connected yet. Add your access key to start receiving messages.", "error");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const original = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }
      setStatus("", "");

      const data = new FormData(form);

      fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      })
        .then(function (res) { return res.json().then(function (json) { return { ok: res.ok, json: json }; }); })
        .then(function (r) {
          if (r.ok && r.json.success) {
            form.reset();
            setStatus("Thanks. Your message is on its way. I'll be in touch soon.", "success");
          } else {
            setStatus((r.json && r.json.message) || "Something went wrong. Please try again.", "error");
          }
        })
        .catch(function () {
          setStatus("Network error. Please try again, or reach me on LinkedIn.", "error");
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = original; }
        });
    });
  }

  function setStatus(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.classList.remove("is-success", "is-error");
    if (type === "success") status.classList.add("is-success");
    if (type === "error") status.classList.add("is-error");
  }
})();
