# hugtoelders

Student-led nonprofit website for **Hugs to Elders (H2E)** — care packages, volunteering, and community outreach for seniors.

## Site

- `index.html` — main site
- `gallery.html` — full photo gallery
- `admin.html` — newsletter admin (Firebase)

## Setup

1. Open `index.html` locally, or deploy with Firebase Hosting.
2. For newsletters: copy `firebase-config.example.js` to `firebase-config.js` and follow `FIREBASE_SETUP.md`.

## Deploy

**Netlify** or **Vercel** — set `FIREBASE_*` environment variables (see `FIREBASE_SETUP.md`), then deploy the repo root.

```bash
firebase deploy
```
