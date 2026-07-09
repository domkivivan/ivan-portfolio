/* Hero shader + entry sequence — implemented in Task 3 */
document.addEventListener('DOMContentLoaded', function () {
  // Temporary: no-webgl styling path until shader lands, entry fades out
  document.getElementById('hero').classList.add('no-webgl');
  const entry = document.getElementById('entry');
  const mark = entry.querySelector('.entry__mark');
  gsap.timeline()
    .to(mark, { opacity: 1, duration: 0.4, ease: 'power2.out' })
    .to(entry, { opacity: 0, duration: 0.5, delay: 0.4, ease: 'power2.inOut',
      onComplete: function () { entry.remove(); } })
    .to('.hero__word', { y: 0, duration: 1, stagger: 0.08, ease: 'power4.out' }, '-=0.3')
    .to('.hero__sub', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');
});
