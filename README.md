# hugtoelders

Student-led nonprofit website for **Hugs to Elders (H2E)** — care packages, volunteering, and community outreach for seniors.

## Site

- `index.html` — main site
- `gallery.html` — full photo gallery
- `admin.html` — newsletter admin (Firebase)

## Setup

1. Open `index.html` locally, or deploy with Firebase Hosting.
2. For newsletters: copy `firebase-config.example.js` to `firebase-config.js` and follow `FIREBASE_SETUP.md`.

## Deploy on Vercel

1. Import [github.com/erkhesenkh9-tech/hugtoelders](https://github.com/erkhesenkh9-tech/hugtoelders) on [vercel.com](https://vercel.com)
2. Vercel reads settings from `vercel.json` automatically
3. Add **Environment Variables** in the Vercel project:

| Variable | Value |
|----------|--------|
| `FIREBASE_API_KEY` | Your Firebase `apiKey` |
| `FIREBASE_AUTH_DOMAIN` | `hugtoelders.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `hugtoelders` |
| `FIREBASE_STORAGE_BUCKET` | `hugtoelders.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `1067330771792` |
| `FIREBASE_APP_ID` | `1:1067330771792:web:f2378f74f9f280053c6a55` |
| `FIREBASE_ADMIN_EMAILS` | `hugstoelders@gmail.com,erkhesenkh9@gmail.com` |
| `WEB3FORMS_ACCESS_KEY` | From [web3forms.com](https://web3forms.com) (see below) |

4. Deploy, then add your Vercel URL under **Firebase → Authentication → Authorized domains**

### Contact form email (Web3Forms)

The contact form sends to **hugstoelders@gmail.com** through a free Web3Forms key:

1. Go to [web3forms.com](https://web3forms.com)
2. Enter **hugstoelders@gmail.com** and click **Create Access Key**
3. Check that inbox for the key (or copy it from the site)
4. In Vercel → **Settings → Environment Variables**, add:
   - Key: `WEB3FORMS_ACCESS_KEY`
   - Value: your access key
5. **Redeploy** the site (Deployments → ⋯ → Redeploy)

Test: submit the contact form on your live site — the message should arrive at hugstoelders@gmail.com within a minute.

## Deploy (Firebase Hosting)

```bash
firebase deploy
```
