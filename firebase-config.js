/* ==========================================================================
   JESS — Firebase configuration
   Same Firebase project as before (jess-website-9962e). This is the NEW
   registered web app inside that project (note the different appId and
   measurementId) — one Firestore database, one set of security rules,
   shared with the other JESS sites.
   ========================================================================== */

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCS4qmv6Cz-63WQSVuhLNYsdpbaUrdOIqI",
  authDomain: "jess-website-9962e.firebaseapp.com",
  databaseURL: "https://jess-website-9962e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jess-website-9962e",
  storageBucket: "jess-website-9962e.firebasestorage.app",
  messagingSenderId: "866208405959",
  appId: "1:866208405959:web:9ac43110f7471bbaeaa1e2",
  measurementId: "G-40HHYS0EXJ"
};

// The email of the admin user in Firebase Authentication > Users.
// Must match the isAdmin() check in firestore.rules exactly, or every
// write from the admin panel is rejected with permission-denied.
window.FIREBASE_ADMIN_EMAIL = "begawanbillykurniawan@gmail.com";

// TEMPORARY placeholder password for testing — visible in this repo on
// purpose, per instruction, since the site holds no real user data yet
// and access will be locked down (repo made private / site taken down)
// once testing is done. This value is NOT itself the security boundary:
// Firebase Authentication still has to accept it, so the ACTUAL account
// password in Firebase Console (Authentication > Users > that account >
// Edit user) must be set to this exact same string, or login will fail.
// If you ever change this line, change the Firebase Console password to
// match — the two are not automatically linked.
window.FIREBASE_ADMIN_PASSWORD = "JESSPassword";
