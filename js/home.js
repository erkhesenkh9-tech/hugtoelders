// Home page images — from https://sites.google.com/view/hugstoelders/home
window.H2EHome = (function () {
  let cache = null;

  async function fetchData() {
    if (cache) return cache;
    const res = await fetch('js/home-images.json');
    if (!res.ok) throw new Error('Could not load home images');
    cache = await res.json();
    return cache;
  }

  function renderPhotoCard(item) {
    return `
      <figure class="welcome-photo-card reveal">
        <img src="${item.src}" alt="${item.caption}" loading="lazy">
        <figcaption>${item.caption}</figcaption>
      </figure>
    `;
  }

  function renderWelcomeHTML(data) {
    return data.welcome.map(renderPhotoCard).join('');
  }

  function renderComingSoonHTML(data) {
    return data.comingSoon.map(renderPhotoCard).join('');
  }

  async function renderWelcome(root, onRendered) {
    if (!root) return;
    try {
      const data = await fetchData();
      root.innerHTML = renderWelcomeHTML(data);
      onRendered?.(root);
    } catch (err) {
      console.error('Welcome photos failed:', err);
      root.innerHTML = '<p class="gallery-loading">Unable to load photos.</p>';
    }
  }

  async function renderComingSoon(root, onRendered) {
    if (!root) return;
    try {
      const data = await fetchData();
      root.innerHTML = renderComingSoonHTML(data);
      onRendered?.(root);
    } catch (err) {
      console.error('Coming soon photos failed:', err);
      root.innerHTML = '';
    }
  }

  return { renderWelcome, renderComingSoon };
})();
