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

  async function loadAdminNewsletters() {
    if (!firebaseServices) return;

    adminList.innerHTML = '<p class="newsletter-loading">Loading...</p>';

    try {
      const items = await fetchAllNewsletters(firebaseServices.db);

      if (!items.length) {
        adminList.innerHTML = '<p class="newsletter-empty">No newsletters published yet.</p>';
        return;
      }

      adminList.innerHTML = items.map((item) => `
        <article class="admin-newsletter-item">
          <p class="meta">${escapeHtml(item.dateLabel)}</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.excerpt)}</p>
          <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">View link →</a>
        </article>
      `).join('');
    } catch (err) {
      console.error(err);
      adminList.innerHTML = '<p class="newsletter-error">Could not load newsletters. Check your Firebase setup.</p>';
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
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      await firebaseServices.db.collection('newsletters').add(data);
      showMessage(publishMessage, 'Published! It will appear on the home page (newest) and past issues stay in the archive.', 'success');
      newsletterForm.reset();
      setTimeout(loadAdminNewsletters, 1500);
    } catch (err) {
      console.error(err);
      if (err.code === 'permission-denied') {
        showMessage(publishMessage, 'Permission denied. Make sure your email is in firestore.rules and you are signed in.', 'error');
      } else {
        showMessage(publishMessage, err.message || 'Failed to publish newsletter.', 'error');
      }
    } finally {
      publishBtn.disabled = false;
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    await firebaseServices.auth.signOut();
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
