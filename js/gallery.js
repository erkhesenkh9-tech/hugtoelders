// Shared gallery helpers — used on index (preview) and gallery.html (full)
window.H2EGallery = (function () {
  const PREVIEW_LIMIT = 6;

  async function fetchAlbums() {
    const res = await fetch('js/gallery-data.json');
    if (!res.ok) throw new Error('Could not load gallery');
    return res.json();
  }

  function flattenPhotos(albums) {
    return albums.flatMap((album) =>
      album.photos.map((photo) => ({
        src: photo.src,
        albumTitle: album.title
      }))
    );
  }

  function renderPhotoItem(photo) {
    return `
      <figure class="gallery-item reveal">
        <img src="${photo.src}" alt="${photo.albumTitle}" loading="lazy">
      </figure>
    `;
  }

  function renderPreviewHTML(albums, limit = PREVIEW_LIMIT) {
    const photos = flattenPhotos(albums).slice(0, limit);
    if (!photos.length) return '<p class="gallery-loading">No photos yet.</p>';
    return `<div class="gallery-grid">${photos.map(renderPhotoItem).join('')}</div>`;
  }

  function renderAlbumsHTML(albums) {
    if (!albums.length) return '<p class="gallery-loading">No photos yet.</p>';
    return albums.map((album) => `
      <section class="gallery-album reveal">
        <h3 class="gallery-album-title">${album.title}</h3>
        <div class="gallery-grid">
          ${album.photos.map((photo) => renderPhotoItem({ src: photo.src, albumTitle: album.title })).join('')}
        </div>
      </section>
    `).join('');
  }

  async function renderPreview(root, onRendered) {
    if (!root) return;
    try {
      const albums = await fetchAlbums();
      root.innerHTML = renderPreviewHTML(albums);
      onRendered?.(root);
    } catch (err) {
      console.error('Gallery preview failed:', err);
      root.innerHTML = '<p class="gallery-loading">Unable to load gallery photos.</p>';
    }
  }

  async function renderFull(root, onRendered) {
    if (!root) return;
    try {
      const albums = await fetchAlbums();
      root.innerHTML = renderAlbumsHTML(albums);
      onRendered?.(root);
    } catch (err) {
      console.error('Gallery load failed:', err);
      root.innerHTML = '<p class="gallery-loading">Unable to load gallery photos.</p>';
    }
  }

  return {
    PREVIEW_LIMIT,
    fetchAlbums,
    renderPreview,
    renderFull
  };
})();
