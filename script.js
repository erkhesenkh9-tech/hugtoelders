// ===== Board Members =====
// 2025-2026 board — from https://sites.google.com/view/hugstoelders/our-board
const boardMembers = [
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
  },
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
  },
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
    role: 'Website Manager/Historian',
    gradYear: '2026',
    school: 'Abraham Lincoln HS',
    photo: 'images/board/chloe-liang.jpg'
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

  overlay.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'transform') {
      document.body.classList.add('page-loaded');
      overlay.remove();
    }
  }, { once: true });
}

function initHeroReveal() {
  const items = document.querySelectorAll('.hero-tag, .hero h1, .hero-subtitle, .hero-actions');
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
  '.welcome-impact',
  '.welcome-photo-card',
  '.coming-soon-title',
  '.instagram-link',
  '.mission-card',
  '.mission-story',
  '.board-card',
  '.newsletter-card',
  '.gallery-item',
  '.gallery-album',
  '.newsletter-subscribe',
  '.home-newsletters-cta',
  '.gallery-cta',
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

    if (el.matches('.mission-card, .board-card, .gallery-item, .newsletter-card, .welcome-photo-card')) {
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
function renderBoard() {
  const grid = document.getElementById('board-grid');
  if (!grid) return;

  grid.innerHTML = boardMembers.map(member => `
    <article class="board-card">
      <div class="board-photo">
        <img src="${member.photo}" alt="${member.name}" loading="lazy" referrerpolicy="no-referrer">
      </div>
      <h3 class="board-role">${member.role}</h3>
      <p class="board-name">${member.name}</p>
      <p class="board-detail">Class of ${member.gradYear}</p>
      <p class="board-detail">School: ${member.school}</p>
    </article>
  `).join('');

  registerRevealElements(grid);
}

// ===== Render Gallery Preview (home page) =====
function registerGalleryReveal(root) {
  registerRevealElements(root);
  root.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
    revealObserver?.observe(el);
  });
}

async function renderGalleryPreview() {
  const root = document.getElementById('gallery-preview');
  if (!root || !window.H2EGallery) return;
  await window.H2EGallery.renderPreview(root, registerGalleryReveal);
}

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

// ===== Load Newsletters from Firebase =====
async function loadNewslettersFromFirebase() {
  const homeGrid = document.getElementById('home-newsletter-grid');
  const fullGrid = document.getElementById('newsletter-grid');
  const { getConfig, initFirebase, fetchLatestNewsletters, renderNewsletterGrid, MAX_DISPLAY } = window.H2ENewsletters;

  const showError = (message) => {
    const html = `<p class="newsletter-error">${message}</p>`;
    if (homeGrid) homeGrid.innerHTML = html;
    if (fullGrid) fullGrid.innerHTML = html;
  };

  if (!getConfig()) {
    const msg = 'Newsletters will appear here once Firebase is connected. See FIREBASE_SETUP.md.';
    if (homeGrid) homeGrid.innerHTML = `<p class="newsletter-empty">${msg}</p>`;
    if (fullGrid) fullGrid.innerHTML = `<p class="newsletter-empty">${msg}</p>`;
    return;
  }

  const services = initFirebase();
  if (!services) return;

  try {
    const items = await fetchLatestNewsletters(services.db, MAX_DISPLAY);
    renderNewsletterGrid(homeGrid, items);
    renderNewsletterGrid(fullGrid, items);
    registerRevealElements(homeGrid);
    registerRevealElements(fullGrid);
  } catch (err) {
    console.error('Failed to load newsletters:', err);
    showError('Could not load newsletters. Please try again later.');
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

// ===== Donation Amount Toggle =====
function initDonationToggle() {
  const subject = document.getElementById('subject');
  const donationGroup = document.getElementById('donation-group');
  const amountInput = document.getElementById('amount');
  const amountBtns = document.querySelectorAll('.amount-btn');

  subject?.addEventListener('change', () => {
    const showDonation = subject.value === 'donate';
    donationGroup.hidden = !showDonation;
  });

  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (amountInput) amountInput.value = btn.dataset.amount;
    });
  });
}

// ===== Form Handling =====
function initForms() {
  const contactForm = document.getElementById('contact-form');
  const subscribeForm = document.getElementById('subscribe-form');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('contact-message');
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // Opens email client with form data — replace with Formspree, Netlify Forms, or backend
    const subject = encodeURIComponent(`H2E ${data.subject}: Message from ${data.name}`);
    let body = `Name: ${data.name}%0D%0AEmail: ${data.email}%0D%0AInterest: ${data.subject}%0D%0A`;
    if (data.amount) body += `Donation Amount: $${data.amount}%0D%0A`;
    body += `%0D%0AMessage:%0D%0A${encodeURIComponent(data.message)}`;

    window.location.href = `mailto:hugstoelders@gmail.com?subject=${subject}&body=${body}`;

    if (msg) {
      msg.textContent = 'Opening your email app… If it didn\'t open, email us at hugstoelders@gmail.com';
      msg.className = 'form-note success';
    }
    contactForm.reset();
    document.getElementById('donation-group').hidden = true;
    document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
  });

  subscribeForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('subscribe-message');
    const email = subscribeForm.querySelector('input[name="email"]').value;

    const subject = encodeURIComponent('Newsletter Subscription Request');
    const body = encodeURIComponent(`Please subscribe this email to the H2E monthly newsletter:\n\n${email}`);
    window.location.href = `mailto:hugstoelders@gmail.com?subject=${subject}&body=${body}`;

    if (msg) {
      msg.textContent = 'Thanks! We\'ll add you to our newsletter list.';
      msg.className = 'form-note success';
    }
    subscribeForm.reset();
  });
}

// ===== Footer Year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Init =====
initPageReveal();
initScrollReveal();
renderBoard();
renderHomePhotos();
renderGalleryPreview();
loadNewslettersFromFirebase();
initNav();
initDonationToggle();
initForms();
