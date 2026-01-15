# Prime Preview Market (local development)

This workspace adds Firestore-backed supplier product listing, image upload to Firebase Storage, Firebase Security Rules, and a minimal PWA service worker and manifest.

Quick start

1. Serve the site locally (recommended) from the project root:

```bash
cd "c:/Users/USER/Downloads/primepreviewmarket-main/primepreviewmarket-main"
python -m http.server 8000
```

2. Open in browser: `http://localhost:8000/auth/supplier-login.html` to test supplier flows.

Features added

- Products are persisted to Firestore (collection `products`) when possible, and saved locally to `localStorage` as a fallback.
- Suppliers can upload one product image which is saved to Firebase Storage.
- `firebase.rules` provides starter Firestore security rules — review and tailor before production.
- `manifest.json` and `sw.js` provide basic PWA installability and offline asset caching.

Notes & next steps

- You must enable Firebase services (Firestore and Storage) in your Firebase project and ensure the `firebaseConfig` values in `auth/auth.js`, `auth/admin-dashboard.js` and `auth/supplier-dashboard.js` match your project.
- Review and tighten Security Rules before deploying to production.
- Add server-side order/payment verification for production payments.

