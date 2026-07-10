// Newsletters page — full newsletter list + subscribe
let revealObserver = null;

const REVEAL_SELECTORS = [
  '.section-header',
  '.newsletter-card',
  '.newsletter-subscribe',
  '.newsletters-page-back',
  '.site-footer .container > *'
].join(',');

function registerRevealElements(root = document) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = root.querySelectorAll(REVEAL_SELECTORS);

  elements.forEach((el) => {
    if (el.classList.contains('reveal')) return;

    el.classList.add('reveal');

    if (el.matches('.newsletter-card')) {
      el.classList.add('reveal-tilt');
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

function initSubscribeForm() {
  const subscribeForm = document.getElementById('subscribe-form');
  if (!subscribeForm) return;

  subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('subscribe-message');
    const email = subscribeForm.querySelector('input[name="email"]').value;

    const subject = encodeURIComponent('Newsletter Subscription Request');
    const body = encodeURIComponent(`Please subscribe this email to the H2E monthly newsletter:\n\n${email}`);
    window.location.href = `mailto:hugstoelders@gmail.com?subject=${subject}&body=${body}`;

    if (msg) {
      msg.textContent = "Thanks! We'll add you to our newsletter list.";
      msg.className = 'form-note success';
    }
    subscribeForm.reset();
  });
}

async function loadNewsletters() {
  const grid = document.getElementById('newsletter-grid');
  const { getConfig, initFirebase, fetchArchiveNewsletters, renderNewsletterGrid } = window.H2ENewsletters;

  const showError = (message) => {
    if (grid) grid.innerHTML = `<p class="newsletter-error">${message}</p>`;
  };

  if (!grid) return;

  if (!getConfig()) {
    grid.innerHTML = '<p class="newsletter-empty">Newsletters will appear here once Firebase is connected. See FIREBASE_SETUP.md.</p>';
    return;
  }

  const services = initFirebase();
  if (!services) return;

  try {
    const items = await fetchArchiveNewsletters(services.db);
    if (!items.length) {
      grid.innerHTML = '<p class="newsletter-empty">No past newsletters yet. The latest issue is featured on the home page.</p>';
      return;
    }
    renderNewsletterGrid(grid, items);
    registerRevealElements(grid);
    grid.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      revealObserver?.observe(el);
    });
  } catch (err) {
    console.error('Failed to load newsletters:', err);
    showError('Could not load newsletters. Please try again later.');
  }
}

document.getElementById('year').textContent = new Date().getFullYear();
document.body.classList.add('page-loaded');

initScrollReveal();
initNav();
initSubscribeForm();
loadNewsletters();
