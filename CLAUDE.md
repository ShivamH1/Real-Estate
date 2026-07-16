# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project State

A **single-page website for Saamarth Properties** — Aashish Suryakant Magar, RERA-registered real estate broker in Pune (MahaRERA A011262503354, core localities Hadapsar / Magarpatta / Amanora / Kharadi). Static stack — plain HTML + hand-written CSS + vanilla JS, no build step. An earlier Starbucks-derived design spec (`desgin.txt`) was retired by the client; the current theme is bespoke.

- `index.html` — the entire page: fixed nav + full-screen drawer, photo hero with stat bar, property listings with filters, why-us dark band, photo service cards, about (mission/vision from the client questionnaire), testimonials, FAQ accordion, CTA band, contact form, footer, floating WhatsApp button. `<!-- TODO -->` comments mark placeholder content (listings, testimonials, profile photo, full street address, stats other than years/RERA).
- `css/styles.css` — design tokens in `:root`, then per-section styles. `1rem = 10px` via `font-size: 62.5%`.
- `js/main.js` — Lenis smooth scroll + GSAP ScrollTrigger (CDN, `defer`; everything degrades gracefully if they fail to load). Reveals use IntersectionObserver adding `.in` to `.fx` / `.img-reveal` elements (CSS owns the transitions); GSAP is used only for parallax scrub on `[data-parallax]` images. Also: nav state, drawer, scrollspy, counters, filters, accordion, form validation (no backend; client-side acknowledgement).

## Theme (current design language)

- **Palette:** deep charcoal `#101820` bands/footer, warm ivory `#f6f3ec` canvas, white cards, bronze-gold accent `#b98a44` (buttons, eyebrows, rules). Text ink `#171d26` / body `#454d59`.
- **Type:** Playfair Display (serif) for headlines with italic gold `<em>` accents; Inter for body/UI. Buttons are small-radius (6px) uppercase-tracked labels — not pills.
- **Imagery:** Unsplash hotlinks (`images.unsplash.com/photo-<id>?auto=format&fit=crop&w=…&q=80`) as placeholders until client photos arrive. Footer credits this.
- **Motion:** "dive-in" reveals — `.fx` + `.fx-up/.fx-left/.fx-right/.fx-zoom` (stagger via `data-fx-delay` seconds), `.img-reveal` curtain + settle-zoom on images, parallax hero/why backdrops. `prefers-reduced-motion` disables everything.

## Run / verify

No build — open `index.html` directly (CDN + Unsplash need network).

- **`?noanim` query param** disables Lenis + all reveals/animations (treated as reduced-motion). Use it for deterministic screenshots.
- Desktop full-page screenshot: `msedge --headless --disable-gpu --window-size=1440,9000 --virtual-time-budget=20000 --screenshot=out.png "file:///D:/real-estate-agent/index.html?noanim"` — the hero is capped at `min(100svh, 96rem)` so tall-viewport captures work.
- **Headless Edge quirks (verified):** navigating to `#anchor` URLs screenshots a blank frame — don't use anchors; use the tall-viewport capture. Desktop Edge also enforces a ~500px minimum layout width, so for mobile checks wrap the page in a 390px iframe harness (`<iframe src="...index.html?noanim" style="width:390px">`) and screenshot that at ≥500px window width.
- Slice tall PNGs before reading them (System.Drawing in PowerShell works) — a 9000px image is unreadable at full-page scale.

## Content rules

- Company is **"Saamarth Properties"** (double-a) — the older "Samarth Corporation" naming is obsolete.
- Real facts from the client: name/title, tagline ("Your Dream Home is just a call away"), 14+ years (since ~2012), mission/vision text, 10 trust points, RERA number, localities, phone/WhatsApp `+91 99214 97347`, email `saamarthproperties@gmail.com`, Google Maps link `https://maps.app.goo.gl/8777zrSjGTNdBAHF7`, Facebook `https://www.facebook.com/share/18wM5rcsM7/`, Instagram `https://www.instagram.com/saamarth_properties`, and credentials "Founder of Saamarth Properties" + "Shareholder & landowner of Magarpatta City" (about section `.about-creds`). Still invented placeholder: prices/listing names, testimonial names, profile photo, full street address, stat counts other than years — keep the `TODO` comments until real content lands.
- `Real_Estate_Broker_Website_Questionnaire.docx` defines the full section checklist (Gallery is still pending client photos). It is a .docx — extract text via unzip of `word/document.xml`.
