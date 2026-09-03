# JESS — new site (white & green)

Static site for the Javanese English Speaking Society. Upload the contents of
this folder to GitHub Pages (or any static host) exactly as they are.

## Files

| File | What it is |
|---|---|
| `index.html` | Public homepage |
| `admin.html` | Staff admin portal (password-gated) |
| `style.css` | All styling for both pages |
| `script.js` | Public site — reads data and renders it live |
| `admin.js` | Admin panels — reads/writes data |
| `data.js` | Shared data model + Firestore persistence |
| `firebase-config.js` | Firebase keys + the admin email |
| `firestore.rules` | Security rules (deploy separately, see below) |
| `assets/images/` | Logo and favicon |

## First run: reset the theme

The site's colours are stored in Firestore (`jess/site` → `theme`), and the
existing document still holds the **old blue** palette from the previous site.
Until that's updated, the new site will render blue instead of green.

To fix it, once: open `admin.html` → **Theme** → **Reset theme to default**.
That writes the new green palette (`#2F9E63` / `#186A41`) to Firestore, and both
the public site and the admin panel pick it up immediately. You can then tweak
the colours from that same panel whenever you like.

## Firebase setup

`firebase-config.js` points at the **new** web app registered inside the same
project (`jess-website-9962e`) — note the different `appId` and `measurementId`.
The Firestore database, the security rules, and the admin account are shared
with the other JESS sites.

Two things must be true or admin saves will be rejected:

1. The admin account exists in **Authentication → Users** with the email
   `begawanbillykurniawan@gmail.com`, matching `isAdmin()` in `firestore.rules`
   exactly (it's a case-sensitive string comparison).
2. **Email/Password** is enabled under Authentication → Sign-in method.

## Deploying the rules

`firestore.rules` is included here for reference. Deploy it from wherever you
keep the shared Firebase project (the rules cover every JESS site's collections
at once), or paste it into Firebase Console → Firestore Database → Rules →
Publish.

## Notes on how it works

- Firestore is the source of truth. `localStorage` is only an instant-paint
  cache and an offline fallback, so the public site never goes blank if Firebase
  is unreachable.
- All site content lives in a single Firestore document (`jess/site`), which has
  a **1 MB limit**. Photos are base64-encoded into that same document, so
  `admin.js` compresses every upload before saving. If saves start failing after
  many photo uploads, the document size is the first thing to check.
- Contact messages go to their own `messages` collection precisely so a flood of
  them can't blow past that 1 MB limit.
- Content only appears publicly when its document has `published == true`.
