/* Saamarth Properties — interactions
   Smooth scrolling: Lenis · Scroll animations: GSAP ScrollTrigger
   Both load from CDN; everything degrades gracefully without them. */
(function () {
  "use strict";

  // ?noanim disables smooth-scroll + reveals (debugging / screenshot runs)
  var noAnim = /[?&]noanim/.test(window.location.search);
  var prefersReducedMotion = noAnim || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var hasLenis = typeof window.Lenis !== "undefined";
  var lenis = null;

  /* ---------------- Lenis smooth scroll ---------------- */
  if (hasLenis && !prefersReducedMotion) {
    // Lenis owns scrolling — native CSS smooth-scroll would fight it
    document.documentElement.style.scrollBehavior = "auto";

    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });

    if (hasGsap) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      })(0);
    }
  } else if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
  }

  function navOffset() {
    var nav = document.querySelector(".nav");
    return -(nav ? nav.offsetHeight : 80) - 12;
  }

  function scrollToTarget(target) {
    if (lenis) {
      lenis.scrollTo(target, { offset: navOffset(), duration: 1.3 });
    } else {
      var el = typeof target === "string" ? document.querySelector(target) : target;
      if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  }

  // Route all in-page anchors through Lenis
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      scrollToTarget(el);
      history.replaceState(null, "", id);
    });
  });

  /* ---------------- Nav state ---------------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 40);
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
    nav.classList.toggle("scrolled", open || window.scrollY > 40);
    if (lenis) { open ? lenis.stop() : lenis.start(); }
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

  /* ---------------- Scroll reveals (.fx / .img-reveal) ---------------- */
  var fxEls = Array.prototype.slice.call(document.querySelectorAll(".fx, .img-reveal"));

  fxEls.forEach(function (el) {
    var delay = el.getAttribute("data-fx-delay");
    if (delay) el.style.transitionDelay = delay + "s";
  });

  function revealNow(el) { el.classList.add("in"); }

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    fxEls.forEach(revealNow);
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          revealNow(entry.target);
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    fxEls.forEach(function (el) {
      if (el.closest(".hero")) return; // hero plays on load
      revealer.observe(el);
    });
  }

  // Hero entrance — script is deferred, so the DOM is ready; double-rAF
  // lets the browser paint the hidden state first so the transition runs.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.querySelectorAll(".hero .fx").forEach(revealNow);
    });
  });

  /* ---------------- Parallax backdrops ---------------- */
  if (hasGsap && !prefersReducedMotion) {
    document.querySelectorAll("[data-parallax]").forEach(function (img) {
      gsap.fromTo(img,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest("section") || img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
    });
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
    var duration = 1400;
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
    }, { threshold: 0.5 });
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
        if (show) card.classList.add("in"); // don't re-hide revealed cards
      });
      if (hasGsap) ScrollTrigger.refresh();
    });
  });

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        q.setAttribute("aria-expanded", "true");
      }
      if (hasGsap) setTimeout(function () { ScrollTrigger.refresh(); }, 400);
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
      return ok;
    }

    form.querySelectorAll("input, textarea, select").forEach(function (input) {
      input.addEventListener("blur", function () {
        if (input.value.trim() || input.required) validateField(input);
      });
      input.addEventListener("input", function () {
        if (fieldWrap(input).classList.contains("invalid")) validateField(input);
      });
      input.addEventListener("change", function () { validateField(input); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allValid = true;
      form.querySelectorAll("input, select, textarea").forEach(function (input) {
        if (!validateField(input)) allValid = false;
      });

      if (!allValid) {
        var firstInvalid = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
        if (firstInvalid) firstInvalid.focus({ preventScroll: false });
        return;
      }

      // No backend yet — acknowledge and reset.
      // TODO: wire to the client's preferred handler (email service / WhatsApp deep link / CRM).
      form.reset();
      form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("invalid"); });
      successNote.classList.add("show");
      setTimeout(function () { successNote.classList.remove("show"); }, 8000);
    });
  }

  /* ---------------- Footer year ---------------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
