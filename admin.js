(function () {
  const { getConfig, initFirebase, fetchAllNewsletters, isAdminEmail, escapeHtml } = window.H2ENewsletters;

  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const configWarning = document.getElementById('config-warning');
  const loginForm = document.getElementById('login-form');
  const newsletterForm = document.getElementById('newsletter-form');
  const loginMessage = document.getElementById('login-message');
  const publishMessage = document.getElementById('publish-message');
  const userEmailEl = document.getElementById('user-email');
  const adminList = document.getElementById('admin-newsletter-list');
  const logoutBtn = document.getElementById('logout-btn');
  const publishBtn = document.getElementById('publish-btn');

  let firebaseServices = null;

  const REQUEST_TIMEOUT_MS = 20000;

  function withTimeout(promise, label) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`${label} timed out. Check your connection and try again.`));
        }, REQUEST_TIMEOUT_MS);
      })
    ]);
  }

  function showMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = `form-note ${type || ''}`;
  }

  function showConfigWarning() {
    loginSection.hidden = true;
    dashboardSection.hidden = true;
    configWarning.hidden = false;
  }

  function showLogin() {
    loginSection.hidden = false;
    dashboardSection.hidden = true;
    configWarning.hidden = true;
  }

  function showDashboard(user) {
    loginSection.hidden = true;
    dashboardSection.hidden = false;
    configWarning.hidden = true;
    userEmailEl.textContent = user.email;
    loadAdminNewsletters();
  }

  function formatFirestoreError(err) {
    if (!err) return 'Unknown error';
    if (err.code === 'permission-denied') {
      return 'Permission denied. Redeploy firestore.rules and confirm your email is an admin.';
    }
    if (err.code === 'failed-precondition') {
      return 'Firestore index missing. Run: firebase deploy --only firestore:indexes';
    }
    return err.message || String(err);
  }

  async function loadAdminNewsletters() {
    if (!firebaseServices) return;

    adminList.innerHTML = '<p class="newsletter-loading">Loading...</p>';

    try {
      const items = await withTimeout(
        fetchAllNewsletters(firebaseServices.db),
        'Loading newsletters'
      );

      if (!items.length) {
        adminList.innerHTML = '<p class="newsletter-empty">No newsletters published yet.</p>';
        return;
      }

      adminList.innerHTML = items.map((item) => `
        <article class="admin-newsletter-item" data-id="${escapeHtml(item.id)}">
          <div class="admin-newsletter-item-header">
            <p class="meta">${escapeHtml(item.dateLabel)}</p>
            <button type="button" class="btn btn-delete" data-delete-id="${escapeHtml(item.id)}" aria-label="Delete ${escapeHtml(item.title)}">Delete</button>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.excerpt)}</p>
          <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">View link →</a>
        </article>
      `).join('');
    } catch (err) {
      console.error(err);
      adminList.innerHTML = `<p class="newsletter-error">Could not load newsletters: ${escapeHtml(formatFirestoreError(err))}</p>`;
    }
  }

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMessage(loginMessage, 'Signing in...', '');

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    if (!isAdminEmail(email)) {
      showMessage(loginMessage, 'This email is not authorized to post newsletters.', 'error');
      return;
    }

    try {
      await firebaseServices.auth.signInWithEmailAndPassword(email, password);
      showMessage(loginMessage, '', '');
    } catch (err) {
      console.error('Admin login error:', err.code, err.message);
      const messages = {
        'auth/user-not-found':
          'No Firebase account exists for this email. In Firebase Console → Authentication → Users → Add user, create this email with a password, then try again.',
        'auth/wrong-password': 'Incorrect password. Reset it in Firebase Console → Authentication → Users.',
        'auth/invalid-credential':
          'Invalid email or password. If this is your first login, create the user in Firebase Console → Authentication → Users → Add user.',
        'auth/invalid-email': 'That email address is not valid.',
        'auth/operation-not-allowed':
          'Email/password sign-in is disabled. In Firebase Console → Authentication → Sign-in method, enable Email/Password.',
        'auth/unauthorized-domain':
          'This website domain is not authorized. In Firebase Console → Authentication → Settings → Authorized domains, add your live site URL (e.g. your-site.vercel.app).',
        'auth/too-many-requests': 'Too many attempts. Try again later or reset the password in Firebase Console.'
      };
      showMessage(loginMessage, messages[err.code] || err.message, 'error');
    }
  });

  newsletterForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    publishBtn.disabled = true;
    showMessage(publishMessage, 'Publishing...', '');

    const data = {
      dateLabel: document.getElementById('nl-date').value.trim(),
      title: document.getElementById('nl-title').value.trim(),
      excerpt: document.getElementById('nl-excerpt').value.trim(),
      link: document.getElementById('nl-link').value.trim(),
      createdAt: firebase.firestore.Timestamp.now()
    };

    if (!data.link.startsWith('http://') && !data.link.startsWith('https://')) {
      showMessage(publishMessage, 'Link must start with http:// or https://', 'error');
      publishBtn.disabled = false;
      return;
    }

    try {
      const user = firebaseServices.auth.currentUser;
      if (user) {
        await withTimeout(user.getIdToken(false), 'Checking login');
      }

      await withTimeout(
        firebaseServices.db.collection('newsletters').add(data),
        'Publishing'
      );
      showMessage(publishMessage, 'Published! It will appear on the home page (newest) and past issues stay in the archive.', 'success');
      newsletterForm.reset();
      loadAdminNewsletters();
    } catch (err) {
      console.error(err);
      if (err.code === 'permission-denied') {
        showMessage(publishMessage, formatFirestoreError(err), 'error');
      } else {
        showMessage(publishMessage, formatFirestoreError(err), 'error');
      }
    } finally {
      publishBtn.disabled = false;
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    await firebaseServices.auth.signOut();
  });

  adminList?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-delete-id]');
    if (!btn || !firebaseServices) return;

    const id = btn.dataset.deleteId;
    const itemEl = btn.closest('.admin-newsletter-item');
    const title = itemEl?.querySelector('h3')?.textContent || 'this newsletter';

    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    btn.disabled = true;
    btn.textContent = 'Deleting…';

    try {
      await withTimeout(
        firebaseServices.db.collection('newsletters').doc(id).delete(),
        'Deleting newsletter'
      );
      itemEl?.remove();
      if (!adminList.querySelector('.admin-newsletter-item')) {
        adminList.innerHTML = '<p class="newsletter-empty">No newsletters published yet.</p>';
      }
    } catch (err) {
      console.error(err);
      btn.disabled = false;
      btn.textContent = 'Delete';
      alert(
        err.code === 'permission-denied'
          ? 'Permission denied. Deploy updated Firestore rules: firebase deploy --only firestore:rules'
          : 'Could not delete newsletter. Try again.'
      );
    }
  });

  function init() {
    if (!getConfig()) {
      showConfigWarning();
      return;
    }

    if (!window.firebaseConfig.authDomain) {
      showMessage(
        loginMessage,
        'Firebase authDomain is missing. Add FIREBASE_AUTH_DOMAIN (or FIREBASE_PROJECT_ID) in Vercel/Netlify env vars and redeploy.',
        'error'
      );
      showLogin();
      return;
    }

    firebaseServices = initFirebase();
    if (!firebaseServices) {
      showConfigWarning();
      return;
    }

    firebaseServices.auth.onAuthStateChanged((user) => {
      if (user && isAdminEmail(user.email)) {
        showDashboard(user);
      } else {
        if (user && !isAdminEmail(user.email)) {
          firebaseServices.auth.signOut();
          showMessage(loginMessage, 'This account is not authorized.', 'error');
        }
        showLogin();
      }
    });
  }

  init();
})();
