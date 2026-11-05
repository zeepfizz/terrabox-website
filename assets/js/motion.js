// Entrances for elements marked .rv: heading, text and picture rise in once, staggered (v2.css: .rv-wait / .rv-in).
// Only elements that start below the first screen are hidden, so content is never invisible without scrolling or JS.
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const els = Array.from(document.querySelectorAll('.rv'));
  const fold = window.innerHeight;
  const waiting = els.filter(el => el.getBoundingClientRect().top > fold);
  if (!waiting.length) return;
  waiting.forEach(el => el.classList.add('rv-wait'));
  const io = new IntersectionObserver(entries => {
    const shown = entries.filter(en => en.isIntersecting).map(en => en.target);
    shown.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    shown.forEach((el, i) => {
      el.style.transitionDelay = Math.min(i, 5) * 75 + 'ms';
      el.classList.add('rv-in');
      io.unobserve(el);
      el.addEventListener('transitionend', () => { el.classList.remove('rv-wait', 'rv-in'); el.style.transitionDelay = ''; }, { once: true });
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  waiting.forEach(el => io.observe(el));
})();
