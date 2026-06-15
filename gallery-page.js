// Gallery page — full album view
function registerGalleryReveal(root) {
  if (typeof registerRevealElements === 'function') {
    registerRevealElements(root);
    root.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      revealObserver?.observe(el);
    });
  }
}

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  toggle?.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  links?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
  });
}

let revealObserver = null;

const REVEAL_SELECTORS = [
  '.section-header',
  '.gallery-item',
  '.gallery-album',
  '.gallery-page-back',
  '.site-footer .container > *'
].join(',');

function registerRevealElements(root = document) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = root.querySelectorAll(REVEAL_SELECTORS);

  elements.forEach((el) => {
    if (el.classList.contains('reveal')) return;

    el.classList.add('reveal');

    if (el.matches('.gallery-item')) {
      const siblings = el.parentElement?.querySelectorAll(':scope > .reveal:not(.is-visible)') || [];
      const index = Array.from(siblings).indexOf(el);
      el.style.setProperty('--reveal-delay', `${index * 0.1}s`);
    }

    if (reducedMotion) {
      el.classList.add('is-visible');
    } else if (revealObserver) {
      revealObserver.observe(el);
    }
  });
}

function initScrollReveal() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  registerRevealElements();

  if (reducedMotion) return;

  document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
    revealObserver.observe(el);
  });
}

document.getElementById('year').textContent = new Date().getFullYear();
document.body.classList.add('page-loaded');

initScrollReveal();
initNav();
window.H2EGallery.renderFull(
  document.getElementById('gallery-albums'),
  registerGalleryReveal
);
