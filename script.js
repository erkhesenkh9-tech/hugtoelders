// ===== Board Members =====
// 2025-2026 board — from https://sites.google.com/view/hugstoelders/our-board
// Layout: 2 Co-Presidents, then 3, then 3
const boardRows = [
  {
    columns: 2,
    members: [
      {
        name: 'Aubrey Socarras',
        role: 'Co-President',
        gradYear: '2027',
        school: 'Lowell HS',
        photo: 'images/board/aubrey-socarras.jpg'
      },
      {
        name: 'Fiona Liang',
        role: 'Co-President',
        gradYear: '2027',
        school: 'Lowell HS',
        photo: 'images/board/fiona-liang.jpg'
      }
    ]
  },
  {
    columns: 3,
    members: [
      {
        name: 'Ada Kwan',
        role: 'Human Resources (HR)',
        gradYear: '2027',
        school: 'George Washington HS',
        photo: 'images/board/ada-kwan.jpg'
      },
      {
        name: 'Vickie Yee',
        role: 'Human Resources (HR)',
        gradYear: '2027',
        school: 'Lowell HS',
        photo: 'images/board/vickie-yee.jpg'
      },
      {
        name: 'Anamaria Tapus',
        role: 'Treasurer',
        gradYear: '2027',
        school: 'Lowell HS',
        photo: 'images/board/anamaria-tapus.jpg'
      }
    ]
  },
  {
    columns: 3,
    members: [
      {
        name: 'Laura Ly',
        role: 'Public Relations (PR)',
        gradYear: '2027',
        school: 'Lowell HS',
        photo: 'images/board/laura-ly.jpg'
      },
      {
        name: 'Kaitlyn Hau',
        role: 'Co-Public Relations (PR)',
        gradYear: '2027',
        school: 'Lowell HS',
        photo: 'images/board/kaitlyn-hau.jpg'
      },
      {
        name: 'Chloe Liang',
        role: 'Website Manager / Historian',
        gradYear: '2026',
        school: 'Abraham Lincoln HS',
        photo: 'images/board/chloe-liang.jpg'
      }
    ]
  }
];

// ===== Page Load Reveal =====
function initPageReveal() {
  const overlay = document.getElementById('page-reveal');
  if (!overlay) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('is-loading');

  const finishReveal = () => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('page-loaded');
    initHeroReveal();
    overlay.remove();
  };

  if (reducedMotion) {
    finishReveal();
    document.querySelector('.site-header')?.classList.add('header-visible');
    return;
  }

  setTimeout(() => {
    overlay.classList.add('is-exiting');
    document.body.classList.remove('is-loading');
    initHeroReveal();
    document.querySelector('.site-header')?.classList.add('header-visible');
  }, 1600);

  // Failsafe — always reveal the page even if the exit animation doesn't fire
  setTimeout(finishReveal, 3500);

  overlay.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'transform') {
      document.body.classList.add('page-loaded');
      overlay.remove();
    }
  }, { once: true });
}

function initHeroReveal() {
  const items = document.querySelectorAll('.hero-tag, .hero h1, .hero-subtitle, .hero-actions, .hero-stats');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  items.forEach((el, i) => {
    el.classList.add('hero-reveal');
    if (reducedMotion) {
      el.classList.add('is-visible');
    } else {
      setTimeout(() => el.classList.add('is-visible'), 80 + i * 110);
    }
  });
}

// ===== Scroll Reveal =====
let revealObserver = null;

const REVEAL_SELECTORS = [
  '.section-header',
  '.welcome-text',
  '.welcome-photo-card',
  '.coming-soon-title',
  '.instagram-link',
  '.newsletter-card',
  '.home-newsletters-cta',
  '.mission-card',
  '.mission-story',
  '.board-row',
  '.board-card',
  '.contact-info > *',
  '.contact-form',
  '.site-footer .container > *'
].join(',');

function registerRevealElements(root = document) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = root.querySelectorAll(REVEAL_SELECTORS);

  elements.forEach((el) => {
    if (el.classList.contains('reveal')) return;

    el.classList.add('reveal');

    // Directional variant: explicit data-reveal wins, otherwise assign by type
    const explicit = el.dataset.reveal;
    if (explicit) {
      el.classList.add(`reveal-${explicit}`);
    } else if (el.matches('.gallery-item, .welcome-photo-card')) {
      el.classList.add('reveal-zoom');
    } else if (el.matches('.board-card')) {
      const siblings = Array.from(el.parentElement?.children || []);
      const pos = siblings.indexOf(el) % 3;
      el.classList.add(pos === 0 ? 'reveal-left' : pos === 2 ? 'reveal-right' : 'reveal-zoom');
    } else if (el.matches('.newsletter-card')) {
      el.classList.add('reveal-tilt');
    }

    if (el.matches('.mission-card, .board-card, .welcome-photo-card, .newsletter-card')) {
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

// ===== Render Board =====
function renderBoardCard(member) {
  return `
    <article class="board-card">
      <div class="board-photo">
        <img src="${member.photo}" alt="${member.name}" loading="lazy">
      </div>
      <div class="board-info">
        <p class="board-role">${member.role}</p>
        <h3 class="board-name">${member.name}</h3>
        <ul class="board-meta">
          <li><span class="board-meta-label">Class</span> ${member.gradYear}</li>
          <li><span class="board-meta-label">School</span> ${member.school}</li>
        </ul>
      </div>
    </article>
  `;
}

function renderBoard() {
  const root = document.getElementById('board-groups');
  if (!root) return;

  root.innerHTML = boardRows.map((row) => `
    <div class="board-row board-row--${row.columns} reveal">
      ${row.members.map(renderBoardCard).join('')}
    </div>
  `).join('');

  registerRevealElements(root);
  root.querySelectorAll('.board-card.reveal:not(.is-visible), .board-row.reveal:not(.is-visible)').forEach((el) => {
    revealObserver?.observe(el);
  });
}

// ===== Render Home Photos =====
function registerHomeReveal(root) {
  registerRevealElements(root);
  root.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
    revealObserver?.observe(el);
  });
}

async function renderHomePhotos() {
  if (!window.H2EHome) return;
  await window.H2EHome.renderWelcome(
    document.getElementById('welcome-photos'),
    registerHomeReveal
  );
  await window.H2EHome.renderComingSoon(
    document.getElementById('coming-soon-photos'),
    registerHomeReveal
  );
}

// ===== Load Latest Newsletter on Home =====
async function loadHomeNewsletter() {
  const preview = document.getElementById('home-newsletter-preview');
  const { getConfig, initFirebase, fetchLatestNewsletters, renderNewsletterGrid, HOME_DISPLAY } = window.H2ENewsletters;

  if (!preview || !window.H2ENewsletters) return;

  if (!getConfig()) {
    preview.innerHTML = '<p class="newsletter-empty">Newsletters will appear here once Firebase is connected.</p>';
    return;
  }

  const services = initFirebase();
  if (!services) return;

  try {
    const items = await fetchLatestNewsletters(services.db, HOME_DISPLAY);
    renderNewsletterGrid(preview, items);
    registerRevealElements(preview);
    preview.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      revealObserver?.observe(el);
    });
  } catch (err) {
    console.error('Failed to load home newsletter:', err);
    preview.innerHTML = '<p class="newsletter-error">Could not load newsletter. Please try again later.</p>';
  }
}

// ===== Mobile Nav =====
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  toggle?.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  links?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== Form Handling =====
const SUBJECT_LABELS = {
  volunteer: 'Volunteering',
  partner: 'Partnership / Collaboration',
  general: 'General Inquiry'
};

function initForms() {
  const contactForm = document.getElementById('contact-form');

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('contact-message');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    if (msg) {
      msg.textContent = 'Sending…';
      msg.className = 'form-note';
    }
    if (submitBtn) submitBtn.disabled = true;

    const formData = new FormData(contactForm);
    const interest = formData.get('subject');
    formData.set('interest', SUBJECT_LABELS[interest] || interest);

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });

      if (!response.ok) throw new Error('Submit failed');

      if (msg) {
        msg.textContent = 'Thanks! Your message was sent — we\'ll get back to you soon.';
        msg.className = 'form-note success';
      }
      contactForm.reset();
    } catch {
      if (msg) {
        msg.textContent = 'Something went wrong. Please email us at hugstoelders@gmail.com.';
        msg.className = 'form-note error';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// ===== Footer Year =====
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Init =====
initPageReveal();
initScrollReveal();
renderBoard();
renderHomePhotos();
loadHomeNewsletter();
initNav();
initForms();
