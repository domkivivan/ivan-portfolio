/* DOMKIV® hero — "Cinematic Transformation Scroll"
   A generic SaaS mockup camera-pushes, color-grades, sweeps and flash-cuts
   into the live hero above it, driven by a pinned + scrubbed GSAP timeline.
   The shard/CTA morphs use Flubber (unpkg CDN) to interpolate between hand
   -drawn SVG paths. See production spec from the art director for the exact
   percentages/eases below — they are implemented as given, not reinvented. */

(function () {
  var SAME_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'; // matches --ease in main.css

  function run() {
    var hero = document.getElementById('hero');
    var beforeFrame = hero.querySelector('.hero-before-frame');
    var stage = hero.querySelector('.hero-before-stage');
    var grade = hero.querySelector('.hero-before-grade');
    var heroInner = hero.querySelector('.hero__inner');
    var flash = hero.querySelector('.hero-flash');
    var tgPill = document.getElementById('tg-pill');
    var identity = document.getElementById('identity');

    var reducedMotion = window.DK ? window.DK.reducedMotion : matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* No GSAP available: progressive enhancement — reveal the real content,
       drop the before-frame overlay entirely so nothing stays hidden. */
    if (typeof gsap === 'undefined') {
      if (heroInner) heroInner.style.opacity = '1';
      if (beforeFrame) beforeFrame.remove();
      if (flash) flash.remove();
      return;
    }

    /* ── prefers-reduced-motion: no pin, no scrub, no camera move.
       Just a static crossfade the moment the hero enters the viewport. ── */
    if (reducedMotion) {
      gsap.set('.hero__word', { y: 0 });
      gsap.set('.hero__sub', { opacity: 1, y: 0 });
      if (tgPill) tgPill.classList.add('is-in');
      if (identity) identity.classList.add('is-in');

      var revealed = false;
      var io = new IntersectionObserver(function (entries) {
        if (revealed || !entries[0].isIntersecting) return;
        revealed = true;
        var tl = gsap.timeline();
        tl.to(beforeFrame, { opacity: 0, duration: 0.6, ease: 'power1.inOut' }, 0);
        tl.to(heroInner, { opacity: 1, duration: 0.6, ease: 'power1.inOut' }, 0);
        io.disconnect();
      }, { threshold: 0.15 });
      io.observe(hero);
      return;
    }

    /* ── Full cinematic version ───────────────────── */
    if (typeof ScrollTrigger === 'undefined' || typeof flubber === 'undefined') {
      /* dependency missing: fail safe to visible content, no broken pin */
      heroInner.style.opacity = '1';
      beforeFrame.remove();
      flash.remove();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    var shardPath = hero.querySelector('.hero-before-shard .shard-path');
    var ctaPath = hero.querySelector('.hero-before-cta .cta-path');
    var chrome = hero.querySelector('.hero-before-chrome');
    var sweepCore = hero.querySelector('.hero-sweep--core');
    var sweepBloom = hero.querySelector('.hero-sweep--bloom');

    var BLOB_D = 'M660,140 C700,138 730,155 738,190 C746,222 730,250 705,258 C715,285 700,310 668,312 C630,315 598,300 585,270 C560,262 540,240 542,208 C544,175 570,150 605,148 C622,140 642,138 660,140 Z';
    var SHARD_D = 'M655,132 L742,168 L725,275 L645,308 L570,255 L585,175 Z';
    var CAPSULE_D = 'M295.5,308 L362.5,308 A12.5,12.5 0 0 1 362.5,333 L295.5,333 A12.5,12.5 0 0 1 295.5,308 Z';
    var CHAMFER_D = 'M289,308 L369,308 L375,314 L375,327 L369,333 L289,333 L283,327 L283,314 Z';

    var blobInterp = flubber.interpolate(BLOB_D, SHARD_D, { maxSegmentLength: 4 });
    var ctaInterp = flubber.interpolate(CAPSULE_D, CHAMFER_D, { maxSegmentLength: 2 });

    /* The mockup art (1024x576) is shown with object-fit:cover, so how much
       of it is visible/cropped depends on the viewport's own aspect ratio.
       "27% 32%" (the headline anchor) only means the right thing in image
       -space; it has to be converted to stage-space (viewport-relative)
       percentages, or on wide viewports the push zooms toward a point that
       isn't actually under the headline, dragging the CTA/shard glints
       completely out of frame. */
    function coverOriginPercent(imgXPct, imgYPct) {
      var IMG_W = 1024, IMG_H = 576;
      var vw = hero.clientWidth, vh = hero.clientHeight;
      var scale = Math.max(vw / IMG_W, vh / IMG_H);
      var renderedW = IMG_W * scale, renderedH = IMG_H * scale;
      var offsetX = (vw - renderedW) / 2, offsetY = (vh - renderedH) / 2;
      var screenX = offsetX + (imgXPct / 100) * IMG_W * scale;
      var screenY = offsetY + (imgYPct / 100) * IMG_H * scale;
      return (screenX / vw * 100).toFixed(2) + '% ' + (screenY / vh * 100).toFixed(2) + '%';
    }
    var HEADLINE_ORIGIN = coverOriginPercent(27, 32);

    /* base transform state, owned entirely by GSAP so it doesn't fight any
       CSS-authored `transform` shorthand. Grade (filter) lives on a nested
       wrapper around just the raster image, so the shard/CTA glint layers
       stay vivid on top of it instead of darkening/desaturating with it. */
    gsap.set(stage, { scale: 1, transformOrigin: '50% 50%', y: 0 });
    gsap.set(grade, { filter: 'hue-rotate(0deg) saturate(1) brightness(1) contrast(1)' });
    gsap.set(sweepCore, { rotation: -15, x: '-70vw' });
    gsap.set(sweepBloom, { rotation: -15, x: '-70vw' });
    gsap.set(flash, { opacity: 0 });
    gsap.set(beforeFrame, { opacity: 1 });
    gsap.set(heroInner, { opacity: 0 });

    /* one unit == one percent of the pinned scroll distance (0-100) */
    var heroTL = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero', start: 'top top', end: '+=300%',
        scrub: 0.6, pin: true, anticipatePin: 1
      },
      defaults: { ease: 'none' }
    });

    /* camera push — phase 1: gentle linear creep, 0-30% */
    heroTL.to(stage, { scale: 1.04, duration: 30 }, 0);

    /* camera push — phase 2: hard push toward the headline/CTA zone, 26-58% */
    heroTL.to(stage, {
      scale: 2.6, transformOrigin: HEADLINE_ORIGIN, y: '18vh',
      duration: 32, ease: 'power2.inOut'
    }, 26);

    /* color grade pull, 30-68% */
    heroTL.to(grade, {
      filter: 'hue-rotate(-150deg) saturate(0.15) brightness(0.16) contrast(1.25)',
      duration: 38, ease: 'power1.in'
    }, 30);

    /* light sweep — core, 26-58% */
    heroTL.to(sweepCore, { x: '70vw', duration: 32, ease: 'power2.in' }, 26);
    /* light sweep — bloom duplicate, +2% both edges, 28-60% */
    heroTL.to(sweepBloom, { x: '70vw', duration: 32, ease: 'power2.in' }, 28);

    /* browser chrome dots fade, 40-50% */
    heroTL.to(chrome, { opacity: 0, duration: 10, ease: 'power1.in' }, 40);

    /* CTA pill morph: path + color reveal, 34-56% */
    heroTL.to({ t: 0 }, {
      t: 1, duration: 22, ease: 'power3.inOut',
      onUpdate: function () { ctaPath.setAttribute('d', ctaInterp(this.targets()[0].t)); }
    }, 34);
    heroTL.to(ctaPath, { opacity: 1, duration: 22, ease: 'power3.inOut' }, 34);

    /* blob -> shard morph, 44-58% */
    heroTL.to({ t: 0 }, {
      t: 1, duration: 14, ease: 'power2.out',
      onUpdate: function () { shardPath.setAttribute('d', blobInterp(this.targets()[0].t)); }
    }, 44);
    heroTL.to(shardPath, { opacity: 1, duration: 14, ease: 'power2.out' }, 44);

    /* handoff flash, 55-65% */
    heroTL.to(flash, { opacity: 0.85, duration: 4, ease: 'power2.in' }, 55);
    heroTL.to(flash, { opacity: 0, duration: 6, ease: 'power2.out' }, 59);

    /* handoff swap, inside the flash peak: 57-60% */
    heroTL.to(beforeFrame, { opacity: 0, duration: 3, ease: 'power1.inOut' }, 57);
    heroTL.to(heroInner, { opacity: 1, duration: 3, ease: 'power1.inOut' }, 57);

    /* After: trigger the existing word-by-word reveal at 65% — a real,
       un-scrubbed tween fired once the scroll crosses this point, not tied
       frame-by-frame to scroll position. */
    heroTL.call(function () {
      gsap.to('.hero__word', {
        y: 0, duration: 0.8, stagger: 0.09, ease: SAME_EASE
      });
    }, [], 65);

    /* sub-copy, 68-74% */
    heroTL.to('.hero__sub', { opacity: 1, y: 0, duration: 6, ease: 'power3.out' }, 68);

    /* identity strip + telegram pill, triggered at 76% (CSS owns the 1s fade) */
    heroTL.call(function () {
      if (tgPill) tgPill.classList.add('is-in');
      if (identity) identity.classList.add('is-in');
    }, [], 76);

    /* Pad the timeline out to exactly 100 units. Without this, GSAP sizes the
       timeline's total duration to the last child's end time (76), and
       ScrollTrigger maps its 0-1 scroll progress onto THAT duration — which
       silently rescales every position label above (e.g. 58 would actually
       fire at 58% * 76/100 = 44). This keeps 1 unit === 1% of pinned scroll. */
    heroTL.set({}, {}, 100);
  }

  document.addEventListener('DOMContentLoaded', run);
})();
