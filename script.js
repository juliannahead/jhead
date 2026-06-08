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
