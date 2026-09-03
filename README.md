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

## What's new in this version

- **Calendar days are filled blocks.** A day with an event is painted in that
  event's colour instead of carrying a small dot. Several events on one day
  split the cell into colour bands and add a count badge.
- **Event markers.** Pick from a fixed list — Online, Offline, Hybrid, Open to
  public, Available to volunteer, Registration required, Members only — in the
  Events editor. Fixed wording keeps them consistent and translatable.
- **Sign-ups.** Any event can accept registrations, either through a form on
  this site or a link to an external one. "Available to volunteer" adds a
  participant/volunteer choice to the form. Sign-ups appear in the new
  **Sign-ups** admin panel with CSV export.
- **News.** A new admin panel and homepage section for short updates. Posts can
  be drafted with Published unticked.
- **English / Bahasa Indonesia toggle.** The `ID` / `EN` button in the navbar.
  Interface labels are translated already; your own content has optional
  "(ID)" fields throughout the admin. **Anything left blank falls back to the
  English text**, so the toggle works immediately and you can translate
  gradually.

### Deploy the rules again

Sign-ups need a new `registrations` collection rule. Until you publish the
updated `firestore.rules`, the sign-up form will fail with a permission error.
Firebase Console → Firestore Database → Rules → paste → Publish.

## Your existing content is safe

This upgrade is additive. `data.js` now runs a `normalizeData()` pass that
fills in only the fields an older document is missing — new event markers, the
registration block, the `news` array, the Indonesian fields — and never
overwrites a value that is already there. Team members, programs, partners,
FAQs, photos, stats and testimonials all carry over untouched. This was tested
against a document saved in the old format before release.

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
