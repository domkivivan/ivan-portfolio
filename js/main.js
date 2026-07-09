/* DOMKIV® — init: environment flags, smooth scroll, shared reveals */

window.DK = (function () {
  const isMobile = matchMedia('(max-width: 768px)').matches;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasWebGL = (function () {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { return false; }
  })();
  return { isMobile, reducedMotion, hasWebGL };
})();

document.addEventListener('DOMContentLoaded', function () {
  const { reducedMotion } = window.DK;

  /* CDN failure: show everything, skip motion */
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    document.documentElement.classList.remove('js');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* Lenis smooth scroll (skip when reduced motion) */
  if (!reducedMotion && typeof Lenis !== 'undefined') {
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.DK.lenis = lenis;
  }

  /* Generic scroll reveals */
  document.querySelectorAll(
    '.manifesto__lead, .manifesto__tail, .case__intro > *, .widget__head > *, ' +
    '.services__head > *, .service, .services__note, .process__title, .step, ' +
    '.contact__title, .contact__offer, .contact__actions, .contact__legal, ' +
    '.case__cta, .fact'
  ).forEach(function (el) { el.classList.add('reveal'); });

  if (reducedMotion) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.remove('reveal');
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  }

  /* Manifesto core line: per-word scrub reveal */
  const manifestoLine = document.querySelector('.manifesto__line');
  if (manifestoLine && !reducedMotion) {
    const words = manifestoLine.innerHTML.trim().split(/\s+/);
    manifestoLine.innerHTML = words
      .map(function (w) { return '<span class="char">' + w + '</span>'; })
      .join(' ');
    gsap.fromTo(manifestoLine.querySelectorAll('.char'),
      { opacity: 0.12 },
      {
        opacity: 1, stagger: 0.12, ease: 'none',
        scrollTrigger: {
          trigger: manifestoLine,
          start: 'top 80%', end: 'top 30%', scrub: true
        }
      });
  }

  /* Fact counters */
  document.querySelectorAll('.fact__num').forEach(function (el) {
    const target = el.dataset.count;
    const text = el.dataset.text;
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: function () {
        if (text) { el.textContent = text; return; }
        const suffix = el.dataset.suffix || '';
        const obj = { v: 0 };
        gsap.to(obj, {
          v: parseInt(target, 10),
          duration: reducedMotion ? 0 : 1.4,
          ease: 'power2.out',
          onUpdate: function () { el.textContent = Math.round(obj.v) + suffix; }
        });
      }
    });
  });

  /* Floating pill + identity strip appear after entry */
  setTimeout(function () {
    document.getElementById('tg-pill').classList.add('is-in');
    document.getElementById('identity').classList.add('is-in');
  }, reducedMotion ? 0 : 1400);
});
