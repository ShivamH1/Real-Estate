/* Samarth Corporation — interactions */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Nav shadow on scroll ---------------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile drawer ---------------- */
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.getElementById("drawer");

  function setDrawer(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    drawer.classList.toggle("open", open);
    document.body.classList.toggle("drawer-locked", open);
  }

  toggle.addEventListener("click", function () {
    setDrawer(toggle.getAttribute("aria-expanded") !== "true");
  });

  drawer.addEventListener("click", function (e) {
    if (e.target.closest("a")) setDrawer(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("open")) setDrawer(false);
  });

  /* ---------------- Scrollspy ---------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var spied = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && spied.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    spied.forEach(function (sec) { spy.observe(sec); });
  }

  /* ---------------- Reveal on scroll ---------------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------- Animated counters ---------------- */
  var counters = document.querySelectorAll("[data-count]");

  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString("en-IN") + suffix;
      return;
    }
    var duration = 1200;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-IN") + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var countSpy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          countSpy.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countSpy.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------------- Property filters ---------------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var cards = document.querySelectorAll(".property-card");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var filter = btn.getAttribute("data-filter");
      cards.forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-type") === filter;
        card.classList.toggle("filtered-out", !show);
      });
    });
  });

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      // close siblings so only one answer is open at a time
      document.querySelectorAll(".faq-item.open").forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------------- Enquiry form ---------------- */
  var form = document.getElementById("enquiry-form");
  if (form) {
    var successNote = form.querySelector(".form-success");

    function fieldWrap(input) { return input.closest(".field"); }

    function validateField(input) {
      var wrap = fieldWrap(input);
      var value = input.value.trim();
      var ok = true;

      if (input.required && !value) ok = false;
      if (ok && value && input.type === "tel") ok = /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(value);
      if (ok && value && input.type === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      wrap.classList.toggle("invalid", !ok);
      wrap.classList.toggle("valid", ok && value !== "");
      return ok;
    }

    // select needs a class hook for its floating label
    var select = form.querySelector("select");
    select.addEventListener("change", function () {
      fieldWrap(select).classList.toggle("has-value", select.value !== "");
      validateField(select);
    });

    form.querySelectorAll("input, textarea").forEach(function (input) {
      input.addEventListener("blur", function () {
        if (input.value.trim() || input.required) validateField(input);
      });
      input.addEventListener("input", function () {
        if (fieldWrap(input).classList.contains("invalid")) validateField(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allValid = true;
      form.querySelectorAll("input, select, textarea").forEach(function (input) {
        if (!validateField(input)) allValid = false;
      });

      if (!allValid) {
        var firstInvalid = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // No backend yet — acknowledge and reset.
      // TODO: wire to the client's preferred handler (email service / WhatsApp deep link / CRM).
      form.reset();
      form.querySelectorAll(".field").forEach(function (f) {
        f.classList.remove("valid", "invalid", "has-value");
      });
      successNote.classList.add("show");
      successNote.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion ? "auto" : "smooth" });
      setTimeout(function () { successNote.classList.remove("show"); }, 8000);
    });
  }

  /* ---------------- Footer year ---------------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
