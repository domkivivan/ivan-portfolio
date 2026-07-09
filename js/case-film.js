/* OASIS case film — pinned scroll-driven phone sequence */

document.addEventListener('DOMContentLoaded', function () {
  const { isMobile, reducedMotion } = window.DK;

  const screens = gsap.utils.toArray('.phone__screen');
  const captions = gsap.utils.toArray('.case__caption');
  const steps = screens.length;

  function setStep(i) {
    screens.forEach(function (s) {
      s.classList.toggle('is-active', +s.dataset.step === i);
    });
    captions.forEach(function (c) {
      c.classList.toggle('is-active', +c.dataset.step === i);
    });
  }

  /* Mobile / reduced motion: no pin — captions are stacked in CSS,
     phone simply shows the first screen and screens rotate on a timer-free
     tap-through is overkill; keep first screen + stacked captions. */
  if (isMobile || reducedMotion) {
    setStep(0);
    /* On mobile show each screen next to nothing—cycle screens slowly so the
       device still feels alive, but respect reduced motion. */
    if (!reducedMotion) {
      let i = 0;
      setInterval(function () {
        i = (i + 1) % steps;
        screens.forEach(function (s) {
          s.classList.toggle('is-active', +s.dataset.step === i);
        });
      }, 2600);
    }
    return;
  }

  setStep(0);

  const film = document.getElementById('case-film');

  ScrollTrigger.create({
    trigger: film,
    start: 'top top',
    end: '+=' + steps * 90 + '%',
    pin: true,
    scrub: true,
    onUpdate: function (self) {
      const i = Math.min(steps - 1, Math.floor(self.progress * steps));
      setStep(i);
    }
  });

  /* phone slowly counter-rotates through the film */
  gsap.fromTo('.phone__frame',
    { rotateY: -18, rotateX: 5 },
    {
      rotateY: 14, rotateX: -3, ease: 'none',
      scrollTrigger: {
        trigger: film,
        start: 'top top',
        end: '+=' + steps * 90 + '%',
        scrub: true
      }
    });
});
