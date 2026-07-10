/**
 * Shared Firebase + newsletter helpers for public site and admin panel.
 */
(function () {
  const HOME_DISPLAY = 1;

  function getConfig() {
    if (!window.firebaseConfig || window.firebaseConfig.apiKey === 'YOUR_API_KEY') {
      return null;
    }
    return window.firebaseConfig;
  }

  function initFirebase() {
    const config = getConfig();
    if (!config) return null;

    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }

    return {
      db: firebase.firestore(),
      auth: firebase.auth()
    };
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatNewsletterCard(item) {
    const link = item.link || '#';
    const isExternal = link.startsWith('http');
    const linkAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';

    return `
      <article class="newsletter-card">
        <div class="newsletter-header">
          <p class="newsletter-date">${escapeHtml(item.dateLabel)}</p>
          <h3>${escapeHtml(item.title)}</h3>
        </div>
        <div class="newsletter-body">
          <p>${escapeHtml(item.excerpt)}</p>
          <a href="${escapeHtml(link)}" class="newsletter-link"${linkAttrs}>
            Read Full Newsletter →
          </a>
        </div>
      </article>
    `;
  }

  function renderNewsletterGrid(container, items) {
    if (!container) return;

    if (!items.length) {
      container.innerHTML = `
        <p class="newsletter-empty">No newsletters yet. Check back soon!</p>
      `;
      return;
    }

    container.innerHTML = items.map(formatNewsletterCard).join('');
  }

  async function fetchLatestNewsletters(db, limit) {
    const snapshot = await db
      .collection('newsletters')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async function fetchAllNewsletters(db) {
    const snapshot = await db
      .collection('newsletters')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /** All newsletters except the newest (shown on the home page). */
  async function fetchArchiveNewsletters(db) {
    const all = await fetchAllNewsletters(db);
    return all.slice(HOME_DISPLAY);
  }

  function isAdminEmail(email) {
    const allowed = window.adminEmails || [];
    return allowed.includes(String(email || '').trim().toLowerCase());
  }

  window.H2ENewsletters = {
    HOME_DISPLAY,
    getConfig,
    initFirebase,
    fetchLatestNewsletters,
    fetchAllNewsletters,
    fetchArchiveNewsletters,
    renderNewsletterGrid,
    isAdminEmail,
    escapeHtml
  };
})();
