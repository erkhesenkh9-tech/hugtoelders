/**
 * Generates firebase-config.js for local dev and Netlify builds.
 * Source: firebase.public.json (safe to commit — Firebase client keys are public).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const sourcePath = path.join(ROOT, 'firebase.public.json');
const outPath = path.join(ROOT, 'firebase-config.js');

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const { adminEmails, ...firebaseConfig } = raw;

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
  console.error('firebase.public.json is missing real Firebase values.');
  process.exit(1);
}

const contents = `// Auto-generated — do not edit. Update firebase.public.json instead.
window.firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};

window.adminEmails = ${JSON.stringify(adminEmails, null, 2)};
`;

fs.writeFileSync(outPath, contents);
console.log('Wrote firebase-config.js');
