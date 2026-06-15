# Firebase Setup Guide — Hugs to Elders Newsletters

This guide walks you through connecting Firebase so **only authorized H2E board members** can post newsletters, and the **public website shows only the 3 most recent** (older ones are deleted automatically).

---

## What you get

| Feature | How it works |
|--------|----------------|
| **Public site** | Home page + Newsletters section load the 3 newest items from Firestore |
| **Admin page** | `/admin.html` — sign in to publish newsletters |
| **Access control** | Only emails listed in `firestore.rules` and `firebase-config.js` can post |
| **Auto cleanup** | Cloud Function deletes newsletters beyond the 3 most recent |

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

### Install Cloud Functions dependencies

```bash
cd functions
npm install
cd ..
```

### Deploy everything

```bash
firebase deploy
```

This deploys:
- **Firestore security rules** — public read, admin-only write
- **Cloud Function `trimNewsletters`** — keeps only 3 newsletters
- **Website hosting** — your site at `https://YOUR_PROJECT_ID.web.app`

---

## Step 7: Post your first newsletter

1. Open **https://YOUR_PROJECT_ID.web.app/admin.html** (or `http://localhost:3456/admin.html` locally)
2. Sign in with an authorized email/password
3. Fill in:
   - **Date Label** — e.g. `June 2026`
   - **Title** — e.g. `Summer Volunteer Drive`
   - **Summary** — short text shown on the home page
   - **Link** — Google Drive, Canva, or PDF URL for the full newsletter
4. Click **Publish Newsletter**

The newsletter appears on the home page and Newsletters section. When you publish a 4th newsletter, the oldest is removed automatically.

---

## Local development

1. Copy config: `copy firebase-config.example.js firebase-config.js` and fill in values
2. Serve the site:

```bash
npx serve .
```

3. Visit `http://localhost:3000` (public site) and `http://localhost:3000/admin.html` (admin)

Firestore and Auth work from localhost once `firebase-config.js` is configured (add `localhost` is allowed by default in Firebase).

---

## File overview

| File | Purpose |
|------|---------|
| `firebase-config.js` | Your Firebase credentials (do not commit — in `.gitignore`) |
| `firebase-config.example.js` | Template to copy |
| `firestore.rules` | Who can read/write newsletters |
| `functions/index.js` | Auto-deletes newsletters beyond the 3 newest |
| `admin.html` + `admin.js` | Admin login & publish form |
| `js/newsletters.js` | Shared fetch/render logic |
| `index.html` | Public site — loads 3 newest newsletters |

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

**Newsletters not trimming to 3**  
→ Deploy functions: `firebase deploy --only functions`. Check Firebase Console → Functions → Logs.

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
firebase deploy                         # Deploy rules, functions, and hosting
firebase deploy --only hosting          # Deploy website only
firebase deploy --only firestore:rules    # Deploy security rules only
firebase deploy --only functions        # Deploy trim function only
```

For questions, contact the H2E tech lead or see [Firebase Documentation](https://firebase.google.com/docs).
