/**
 * Generates firebase-config.js for local dev and Netlify builds.
 * Netlify: set FIREBASE_* environment variables in the site dashboard.
 * Local: copy firebase.public.example.json → firebase.public.json (gitignored).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const localPath = path.join(ROOT, 'firebase.public.json');
const outPath = path.join(ROOT, 'firebase-config.js');

function fromEnv() {
  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY') return null;

  return {
    firebaseConfig: {
      apiKey,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    },
    adminEmails: (process.env.FIREBASE_ADMIN_EMAILS || 'hugstoelders@gmail.com')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean)
  };
}

function fromLocalFile() {
  if (!fs.existsSync(localPath)) return null;

  const raw = JSON.parse(fs.readFileSync(localPath, 'utf8'));
  const { adminEmails, ...firebaseConfig } = raw;

  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
    return null;
  }

  return { firebaseConfig, adminEmails };
}

const data = fromEnv() || fromLocalFile();

if (!data) {
  console.error(
    'Missing Firebase config. On Netlify, add FIREBASE_* env vars in Site settings. ' +
    'Locally, copy firebase.public.example.json to firebase.public.json and fill in values.'
  );
  process.exit(1);
}

const contents = `// Auto-generated at build time — do not edit.
window.firebaseConfig = ${JSON.stringify(data.firebaseConfig, null, 2)};

window.adminEmails = ${JSON.stringify(data.adminEmails, null, 2)};
`;

fs.writeFileSync(outPath, contents);
console.log('Wrote firebase-config.js');
