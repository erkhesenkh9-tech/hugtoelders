# Firebase Setup Guide — Hugs to Elders Newsletters

This guide walks you through connecting Firebase so **authorized H2E board members** can post newsletters from a simple admin page — **no manual website editing required**.

---

## What you get

| Feature | How it works |
|--------|----------------|
| **Home page** | Shows only the **newest** newsletter |
| **Newsletters page** (`/newsletters.html`) | Archive of all **older** newsletters + subscribe form |
| **Admin page** (`/admin.html`) | Board members sign in and publish a new issue each month |
| **Access control** | Only emails listed in `firestore.rules` and `firebase-config.js` can post |
| **Archive** | All past newsletters are **kept forever** (nothing is auto-deleted) |

### Recommended workflow each month

1. Design the full newsletter in **Canva** or **Google Docs** (free, familiar tools).
2. Export or share it as a **public link** (Google Drive, Canva share link, or PDF URL).
3. Go to **`/admin.html`**, sign in, and fill in the title, summary, and link.
4. Click **Publish** — it appears on the website immediately.

You never touch HTML or code when posting.

---

## Why Firebase?

Your site already uses **Firebase** (Google's free backend) as the "outside source" that stores newsletters and serves them to the website. Alternatives like Mailchimp or Substack are great for *emailing* subscribers, but they don't automatically update your website unless you build a custom integration. Firebase is the simplest fit because:

- **Free tier** is enough for a student org site
- **Admin page is already built** (`admin.html`)
- **Only trusted board emails** can publish
- **Works with Canva / Google Drive links** for the full newsletter PDF

---

## Netlify hosting (https://hugtoelders.netlify.app)

Netlify builds from GitHub. Firebase config is generated at build time from **environment variables** (keys are never committed to Git — Netlify blocks that).

### One-time: add environment variables in Netlify

1. Open [Netlify](https://app.netlify.com/) → your **hugtoelders** site
2. Go to **Site configuration** → **Environment variables** → **Add a variable**
3. Add each of these — **copy exact values from Firebase Console → Project settings → Your apps** (project ID is `hugtoelders`, not `hugstoelders`):

| Variable | Value |
|----------|--------|
| `FIREBASE_API_KEY` | Your Firebase `apiKey` |
| `FIREBASE_AUTH_DOMAIN` | `hugtoelders.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `hugtoelders` |
| `FIREBASE_STORAGE_BUCKET` | `hugtoelders.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `1067330771792` |
| `FIREBASE_APP_ID` | `1:1067330771792:web:f2378f74f9f280053c6a55` |
| `FIREBASE_ADMIN_EMAILS` | `hugstoelders@gmail.com,erkhesenkh9@gmail.com` |

4. Save, then trigger a new deploy (**Deploys** → **Trigger deploy** → **Deploy site**)

If the build still fails with **“Secrets scanning found secrets”**, Netlify is flagging the generated `firebase-config.js` (expected). This repo’s `netlify.toml` already sets `SECRETS_SCAN_OMIT_PATHS` for that file. If needed, also add env var `SECRETS_SCAN_OMIT_PATHS` = `firebase-config.js,firebase.public.json`, then **Clear cache and deploy site**.

### One-time: authorize Netlify in Firebase

1. [Firebase Console](https://console.firebase.google.com/project/hugtoelders/authentication/settings) → **Authentication** → **Settings** → **Authorized domains**
2. Click **Add domain**
3. Add: `hugtoelders.netlify.app`
4. Save

Without this step, **admin login will fail** on Netlify (even with correct password).

### Local development

```bash
copy firebase.public.example.json firebase.public.json
# Edit firebase.public.json with your real values (this file is gitignored)
node scripts/generate-firebase-config.js
```

### Add admins

Edit `FIREBASE_ADMIN_EMAILS` in Netlify env vars and the matching list in `firestore.rules`, then:

```bash
firebase deploy --only firestore:rules
```

---

## Step 1: Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → name it e.g. `hugstoelders`
3. Disable Google Analytics (optional) → **Create project**

---

## Step 2: Enable Authentication

1. In Firebase Console → **Build** → **Authentication** → **Get started**
2. Click **Sign-in method** → enable **Email/Password**
3. Go to **Users** → **Add user**
4. Create accounts for each board member who should post newsletters (e.g. `hugstoelders@gmail.com`)
5. Set a strong password for each account

---

## Step 3: Create Firestore database

1. **Build** → **Firestore Database** → **Create database**
2. Choose **Production mode** (we deploy custom rules next)
3. Pick a region close to you (e.g. `us-west1`)

---

## Step 4: Register your web app

1. Project **Settings** (gear icon) → **Your apps** → **Web** (`</>`)
2. App nickname: `Hugs to Elders Website`
3. Copy the `firebaseConfig` object
4. In this project folder, run:

```bash
copy firebase-config.example.js firebase-config.js
```

5. Open `firebase-config.js` and paste your values:

```javascript
window.firebaseConfig = {
  apiKey: 'AIza...',
  authDomain: 'hugstoelders-xxxxx.firebaseapp.com',
  projectId: 'hugstoelders-xxxxx',
  storageBucket: 'hugstoelders-xxxxx.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef'
};

window.adminEmails = [
  'hugstoelders@gmail.com',
  'another-board-member@gmail.com'  // add all authorized emails
];
```

---

## Step 5: Add authorized admin emails to Firestore rules

Open `firestore.rules` and add every admin email to the `isAdmin()` list:

```javascript
function isAdmin() {
  return isSignedIn() && request.auth.token.email in [
    'hugstoelders@gmail.com',
    'another-board-member@gmail.com'
  ];
}
```

**Important:** Emails in `firebase-config.js` (client check) and `firestore.rules` (server security) must match.

---

## Step 6: Install Firebase CLI & deploy

### Install Node.js

Download from [nodejs.org](https://nodejs.org/) if you don't have it.

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Log in and link project

```bash
cd "c:\Users\f_enk\New folder (13)"
firebase login
firebase use --add
```

Select your `hugstoelders` project when prompted.

### Deploy

```bash
firebase deploy
```

This deploys:
- **Firestore security rules** — public read, admin-only write
- **Website hosting** — your site at `https://YOUR_PROJECT_ID.web.app`

---

## Step 7: Post your first newsletter

1. Open **https://YOUR_PROJECT_ID.web.app/admin.html**
2. Sign in with an authorized email/password
3. Fill in:
   - **Date Label** — e.g. `June 2026`
   - **Title** — e.g. `Summer Volunteer Drive`
   - **Summary** — short text shown on the home page card
   - **Link** — Google Drive, Canva, or PDF URL for the full newsletter
4. Click **Publish Newsletter**

The newest issue appears on the **home page**. When you publish again next month, the previous one moves to the **Newsletter Archive** on `/newsletters.html`.

---

## Local development

1. Copy config: `copy firebase-config.example.js firebase-config.js` and fill in values
2. Serve the site:

```bash
npx serve .
```

3. Visit `http://localhost:3000` (public site) and `http://localhost:3000/admin.html` (admin)

---

## File overview

| File | Purpose |
|------|---------|
| `firebase-config.js` | Your Firebase credentials (do not commit — in `.gitignore`) |
| `firebase-config.example.js` | Template to copy |
| `firestore.rules` | Who can read/write newsletters |
| `admin.html` + `admin.js` | Admin login & publish form |
| `js/newsletters.js` | Shared fetch/render logic |
| `index.html` | Home page — shows 1 newest newsletter |
| `newsletters.html` | Archive page — all older newsletters + subscribe |

---

## Adding or removing admins

1. Add their email to `window.adminEmails` in `firebase-config.js`
2. Add the same email to `firestore.rules` → `isAdmin()` list
3. Create their user in Firebase Authentication
4. Redeploy:

```bash
firebase deploy --only firestore:rules,hosting
```

---

## Troubleshooting

**"Firebase Not Configured" on admin page**  
→ Copy `firebase-config.example.js` to `firebase-config.js` and add your API keys.

**"Permission denied" when publishing**  
→ Your signed-in email must be in both `adminEmails` and `firestore.rules`. Redeploy rules: `firebase deploy --only firestore:rules`

**Blank newsletter section**  
→ Open browser DevTools (F12) → Console for errors. Confirm Firestore has documents in the `newsletters` collection.

---

## Security notes

- Never commit `firebase-config.js` to public GitHub (it's in `.gitignore`)
- Firebase API keys in client apps are normal; security comes from **Firestore rules** and **Authentication**
- Only add trusted board member emails to the admin list

---

## Quick command reference

```bash
firebase login                          # Sign in to Firebase CLI
firebase use --add                      # Link local project to Firebase
firebase deploy                         # Deploy rules and hosting
firebase deploy --only hosting          # Deploy website only
firebase deploy --only firestore:rules  # Deploy security rules only
```

For questions, contact the H2E tech lead or see [Firebase Documentation](https://firebase.google.com/docs).
