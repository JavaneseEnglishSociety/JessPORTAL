/* ==========================================================================
   JESS — Javanese English Speaking Society
   data.js — SHARED data model + persistence, loaded by BOTH index.html and
   admin.html. Firestore is the source of truth (shared across every device
   and visitor). localStorage is kept as an instant-paint cache AND as a
   full fallback if Firebase can't be reached at all (network issue,
   ad-blocker, not configured yet, etc.) — the public site must never go
   fully blank just because Firebase failed to load.
   ========================================================================== */

const STORAGE_KEY = "jess_site_data";
const DOC_COLLECTION = "jess";
const DOC_ID = "site";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function defaultData() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  return {
    hero: {
      title: "Making English Accessible For Everyone.",
      subtitle: "Free English education, youth empowerment, and a stronger future through peer teaching.",
      primaryBtn: "Join JESS",
      secondaryBtn: "Become a Volunteer"
    },
    mission: {
      vision: "To build a generation of confident English speakers through accessible education and youth collaboration.",
      missionList: [
        "Free English education",
        "Peer teaching",
        "Empower young educators",
        "Build confidence",
        "Promote English literacy",
        "Collaborate with schools and organizations"
      ]
    },
    stats: [
      { id: uid(), number: "500+", label: "Students" },
      { id: uid(), number: "30+", label: "Volunteers" },
      { id: uid(), number: "20+", label: "Events" },
      { id: uid(), number: "10+", label: "Partner Schools" }
    ],
    programs: [
      { id: uid(), icon: "📖", title: "English Classes", desc: "Weekly free English learning." },
      { id: uid(), icon: "💬", title: "Conversation Club", desc: "Practice speaking with friends." },
      { id: uid(), icon: "🧑‍🏫", title: "Teacher Development", desc: "Train volunteers to become educators." },
      { id: uid(), icon: "🏆", title: "Events", desc: "English competitions, seminars and workshops." },
      { id: uid(), icon: "🤝", title: "Partnership Program", desc: "Collaborate with schools and communities." }
    ],
    events: [
      { id: uid(), title: "English Speech Competition", date: `${y}-${String(m + 1).padStart(2, "0")}-18`, time: "09:00", desc: "Annual speech competition for junior and senior high students.", location: "Online (Zoom)", color: "#2F9E63", recurring: "none" },
      { id: uid(), title: "Volunteer Teacher Training", date: `${y}-${String(m + 1).padStart(2, "0")}-24`, time: "13:00", desc: "Orientation and training for new peer teachers.", location: "Online (Zoom)", color: "#186A41", recurring: "none" },
      { id: uid(), title: "Weekly Conversation Club", date: `${y}-${String(m + 1).padStart(2, "0")}-12`, time: "16:00", desc: "Casual English conversation practice, open to all levels.", location: "Online (Zoom)", color: "#C9A227", recurring: "weekly" }
    ],
    team: [
      { id: uid(), name: "Aditya Pratama", role: "President", desc: "Leads JESS's vision and partnerships across Java.", photo: "", ig: "#", linkedin: "#" },
      { id: uid(), name: "Sarah Wijaya", role: "Operations Manager", desc: "Keeps programs and events running smoothly.", photo: "", ig: "#", linkedin: "#" },
      { id: uid(), name: "Budi Santoso", role: "Lead Instructor", desc: "Designs the peer-teaching curriculum.", photo: "", ig: "#", linkedin: "#" },
      { id: uid(), name: "Citra Ramadhani", role: "Public Relations", desc: "Builds relationships with schools and media.", photo: "", ig: "#", linkedin: "#" },
      { id: uid(), name: "Fajar Nugroho", role: "Marketing", desc: "Grows JESS's reach across Indonesia.", photo: "", ig: "#", linkedin: "#" },
      { id: uid(), name: "Dewi Lestari", role: "Academic Division", desc: "Oversees teaching quality and materials.", photo: "", ig: "#", linkedin: "#" },
      { id: uid(), name: "Rangga Saputra", role: "Social Media Manager", desc: "Tells JESS's story online.", photo: "", ig: "#", linkedin: "#" }
    ],
    partners: [
      { id: uid(), name: "SMA Harapan Bangsa", url: "#", logo: "" },
      { id: uid(), name: "SMP Nusantara", url: "#", logo: "" },
      { id: uid(), name: "British Council Indonesia", url: "#", logo: "" },
      { id: uid(), name: "Java Youth Forum", url: "#", logo: "" },
      { id: uid(), name: "EduBridge Foundation", url: "#", logo: "" }
    ],
    testimonials: [
      { id: uid(), name: "Nadia Putri", school: "SMAN 3 Bandung", review: "JESS gave me the confidence to speak English in front of a crowd for the first time.", photo: "" },
      { id: uid(), name: "Rian Hidayat", school: "SMPN 12 Surabaya", review: "My peer teacher made English feel simple and fun instead of scary.", photo: "" },
      { id: uid(), name: "Aisyah Rahma", school: "SMA Labschool", review: "I joined as a student and now I teach — JESS changed how I see my own potential.", photo: "" }
    ],
    gallery: [
      { id: uid(), img: "", caption: "Weekly conversation club" },
      { id: uid(), img: "", caption: "Speech competition finals" },
      { id: uid(), img: "", caption: "Volunteer teacher training day" },
      { id: uid(), img: "", caption: "Community English fair" }
    ],
    faq: [
      { id: uid(), q: "Is JESS really free for students?", a: "Yes — every class, material, and event JESS runs is completely free for students." },
      { id: uid(), q: "Who can become a volunteer teacher?", a: "Qualified middle and high school students who pass our teacher training program can lead classes through peer teaching." },
      { id: uid(), q: "Where does JESS operate?", a: "JESS operates fully online, with students and volunteer teachers joining from across Java and beyond." },
      { id: uid(), q: "How do I enroll as a student?", a: "Fill out the contact form below or reach out through our Instagram — we'll guide you through enrollment." }
    ],
    contact: {
      intro: "Questions, partnership ideas, or ready to volunteer? Send us a message — we reply within a few days.",
      email: "hello@jess-english.org",
      location: "Fully online — Java, Indonesia",
      instagram: "#",
      tiktok: "#",
      discord: "#"
    },
    footer: {
      privacyUrl: "#",
      termsUrl: "#"
    },
    theme: {
      primary: "#2F9E63",
      secondary: "#186A41",
      font: "modern",
      radius: "14",
      animSpeed: "1",
      darkMode: false
    }
  };
}

function mergeWithDefaults(remote) {
  return Object.assign(defaultData(), remote || {});
}

function getLocalCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setLocalCache(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore quota errors */ }
}

/* ------------------------------------------------------------------ *
 * FIREBASE INIT — dynamic imports, wrapped in try/catch, so a network
 * problem or CDN block degrades to local-only mode instead of taking
 * the whole site down (a static top-level `import` would not do this:
 * if it fails, NOTHING in the module runs, not even the fallback).
 * ------------------------------------------------------------------ */
let firebaseReady = false;
let db, auth, fsFns, authFns;

async function trySetupFirebase() {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith("PASTE_")) {
    console.warn("JESS: Firebase config is missing or still a placeholder (see firebase-config.js). Running in local-only mode.");
    return false;
  }
  try {
    const [{ initializeApp }, firestoreMod, authMod] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js")
    ]);
    const app = initializeApp(cfg);
    fsFns = firestoreMod;
    authFns = authMod;
    db = firestoreMod.getFirestore(app);
    auth = authMod.getAuth(app);
    return true;
  } catch (e) {
    console.warn("JESS: Firebase could not be loaded or initialized. Running in local-only mode.", e);
    return false;
  }
}

firebaseReady = await trySetupFirebase();

const siteDocRef = () => fsFns.doc(db, DOC_COLLECTION, DOC_ID);

/* ------------------------------------------------------------------ *
 * REAL-TIME SUBSCRIBE (used by the public site — updates live, across
 * every device, whenever the admin portal saves a change)
 * ------------------------------------------------------------------ */
function subscribe(callback) {
  const cached = getLocalCache();
  if (cached) callback(mergeWithDefaults(cached));

  if (!firebaseReady) {
    if (!cached) callback(defaultData());
    return () => {};
  }

  return fsFns.onSnapshot(siteDocRef(), (snap) => {
    if (snap.exists()) {
      const merged = mergeWithDefaults(snap.data());
      setLocalCache(merged);
      callback(merged);
    } else {
      const def = defaultData();
      fsFns.setDoc(siteDocRef(), def).catch((e) => console.warn("JESS: could not seed Firestore.", e));
      setLocalCache(def);
      callback(def);
    }
  }, (err) => {
    console.warn("JESS: Firestore real-time read failed, using local cache/defaults.", err);
    if (!cached) callback(defaultData());
  });
}

/* ------------------------------------------------------------------ *
 * ONE-TIME LOAD (used by the admin portal so an in-progress edit
 * doesn't get overwritten mid-keystroke by a live snapshot)
 * ------------------------------------------------------------------ */
async function loadOnce() {
  const cached = getLocalCache();
  if (!firebaseReady) return cached || defaultData();

  try {
    const snap = await fsFns.getDoc(siteDocRef());
    if (snap.exists()) {
      const merged = mergeWithDefaults(snap.data());
      setLocalCache(merged);
      return merged;
    }
    const def = defaultData();
    await fsFns.setDoc(siteDocRef(), def);
    setLocalCache(def);
    return def;
  } catch (e) {
    console.warn("JESS: could not reach Firestore, using local cache/defaults.", e);
    return cached || defaultData();
  }
}

/* ------------------------------------------------------------------ *
 * SAVE (admin only — Firestore security rules require an
 * authenticated user for writes)
 * ------------------------------------------------------------------ */
async function saveData(data) {
  setLocalCache(data);
  if (!firebaseReady) return false;
  try {
    await fsFns.setDoc(siteDocRef(), data);
    return true;
  } catch (e) {
    console.warn("JESS: Firestore save failed — change was kept locally only.", e);
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * AUTH (admin portal login/logout)
 * ------------------------------------------------------------------ */
function login(password) {
  if (!firebaseReady) return Promise.reject(new Error("Firebase is not configured yet."));
  const email = window.FIREBASE_ADMIN_EMAIL || "staff@jess.internal";
  return authFns.signInWithEmailAndPassword(auth, email, password);
}

function logout() {
  if (!firebaseReady) return Promise.resolve();
  return authFns.signOut(auth);
}

function onAuthChange(cb) {
  if (!firebaseReady) { cb(null); return () => {}; }
  return authFns.onAuthStateChanged(auth, cb);
}

/* ------------------------------------------------------------------ *
 * CONTACT MESSAGES — stored in their own Firestore collection (not
 * the single site doc, so a flood of messages can never blow past
 * that document's 1MB size limit). Public visitors can only CREATE;
 * only an authenticated admin can list, read, or delete them
 * (enforced by Firestore security rules, not just this client code).
 * ------------------------------------------------------------------ */
function messagesCollection() {
  return fsFns.collection(db, "messages");
}

async function submitMessage(data) {
  if (!firebaseReady) return { ok: false, reason: "not-configured" };
  try {
    await fsFns.addDoc(messagesCollection(), {
      name: (data.name || "").slice(0, 200),
      email: (data.email || "").slice(0, 200),
      message: (data.message || "").slice(0, 5000),
      createdAt: Date.now()
    });
    return { ok: true };
  } catch (e) {
    console.warn("JESS: could not submit message.", e);
    return { ok: false, reason: "error", error: e };
  }
}

async function listMessages() {
  if (!firebaseReady) return [];
  try {
    const snap = await fsFns.getDocs(messagesCollection());
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return items;
  } catch (e) {
    console.warn("JESS: could not load messages.", e);
    return [];
  }
}

async function deleteMessage(id) {
  if (!firebaseReady) return false;
  try {
    await fsFns.deleteDoc(fsFns.doc(db, "messages", id));
    return true;
  } catch (e) {
    console.warn("JESS: could not delete message.", e);
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * VISITOR ANALYTICS — a single counter doc for all-time visits, plus a
 * "presence" collection so the admin panel can see who's on the site
 * right now. No backend/Cloud Functions in this project, so all of this
 * runs from the visitor's own browser — the security rules (not this
 * code) are what stop a visitor from reading anyone else's presence doc
 * or tampering with the counter beyond "+1".
 * ------------------------------------------------------------------ */
const ANALYTICS_COLLECTION = "analytics";
const ANALYTICS_TOTALS_ID = "portalTotals"; // shared DB with JESSEDU — "eduTotals" is the other site's doc
const PRESENCE_COLLECTION = "presence";      // shared DB with JESSEDU — every doc here is tagged site:"portal" below
const PRESENCE_STALE_MS = 90 * 1000;      // no heartbeat in 90s = counted offline
const PRESENCE_HEARTBEAT_MS = 25 * 1000;  // how often an open tab pings in
const SESSION_KEY = "jess_session_id";

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : uid() + uid());
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch (e) {
    // sessionStorage unavailable (privacy mode, etc.) — fall back to an
    // id that lives only for this call, so tracking just no-ops quietly.
    return uid();
  }
}

// Counts one visit per browser tab session (not every render), so a
// single visitor reloading the same page repeatedly isn't over-counted.
const VISIT_FLAG_KEY = "jess_visit_counted";
async function trackVisit() {
  if (!firebaseReady) return;
  try {
    if (sessionStorage.getItem(VISIT_FLAG_KEY)) return;
    sessionStorage.setItem(VISIT_FLAG_KEY, "1");
  } catch (e) { /* if sessionStorage is unavailable, just track every load */ }

  const ref = fsFns.doc(db, ANALYTICS_COLLECTION, ANALYTICS_TOTALS_ID);
  try {
    const snap = await fsFns.getDoc(ref);
    if (snap.exists()) {
      await fsFns.updateDoc(ref, {
        visits: fsFns.increment(1),
        lastVisitAt: Date.now(),
      });
    } else {
      await fsFns.setDoc(ref, { visits: 1, lastVisitAt: Date.now() });
    }
  } catch (e) {
    console.warn("JESS: could not record visit.", e);
  }
}

async function getAnalyticsTotals() {
  if (!firebaseReady) return { visits: 0, lastVisitAt: null };
  try {
    const snap = await fsFns.getDoc(fsFns.doc(db, ANALYTICS_COLLECTION, ANALYTICS_TOTALS_ID));
    return snap.exists() ? snap.data() : { visits: 0, lastVisitAt: null };
  } catch (e) {
    console.warn("JESS: could not load visit totals.", e);
    return { visits: 0, lastVisitAt: null };
  }
}

// Called from the public site: writes/refreshes this tab's presence doc
// on an interval for as long as the tab stays open.
let presenceTimer = null;
function startPresenceHeartbeat() {
  if (!firebaseReady || presenceTimer) return;
  const sessionId = getSessionId();
  const ping = () => {
    fsFns.setDoc(
      fsFns.doc(db, PRESENCE_COLLECTION, sessionId),
      { lastSeen: Date.now(), page: location.pathname.includes("admin") ? "admin" : "site", site: "portal" },
      { merge: true }
    ).catch((e) => console.warn("JESS: presence ping failed.", e));
  };
  ping();
  presenceTimer = setInterval(ping, PRESENCE_HEARTBEAT_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") ping();
  });
}

// Admin-only (Firestore rules require auth to read the presence
// collection): returns how many sessions have pinged in within the
// stale window, i.e. "online right now". Filtered to this site only —
// the collection is shared with JESSEDU, tagged by a "site" field.
async function listOnlinePresence() {
  if (!firebaseReady) return { onlineCount: 0, sessions: [] };
  try {
    const snap = await fsFns.getDocs(fsFns.collection(db, PRESENCE_COLLECTION));
    const cutoff = Date.now() - PRESENCE_STALE_MS;
    const sessions = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.site === "portal" && (data.lastSeen || 0) >= cutoff) sessions.push({ id: d.id, ...data });
    });
    return { onlineCount: sessions.length, sessions };
  } catch (e) {
    console.warn("JESS: could not load presence.", e);
    return { onlineCount: 0, sessions: [] };
  }
}

// Admin-only cleanup: presence docs from tabs that closed a while ago
// just sit there forever otherwise (there's no backend to expire them
// automatically). Safe to run anytime — only removes truly stale docs,
// and only this site's (JESSEDU's stale docs are its own admin's job).
async function clearStalePresence(olderThanMs = 24 * 60 * 60 * 1000) {
  if (!firebaseReady) return 0;
  try {
    const snap = await fsFns.getDocs(fsFns.collection(db, PRESENCE_COLLECTION));
    const cutoff = Date.now() - olderThanMs;
    const stale = [];
    snap.forEach((d) => {
      if (d.data().site === "portal" && (d.data().lastSeen || 0) < cutoff) stale.push(d.id);
    });
    await Promise.all(stale.map((id) => fsFns.deleteDoc(fsFns.doc(db, PRESENCE_COLLECTION, id))));
    return stale.length;
  } catch (e) {
    console.warn("JESS: could not clear stale presence.", e);
    return 0;
  }
}

window.JESSData = {
  STORAGE_KEY, uid, defaultData,
  subscribe, loadOnce, saveData,
  login, logout, onAuthChange,
  submitMessage, listMessages, deleteMessage,
  trackVisit, startPresenceHeartbeat, getAnalyticsTotals, listOnlinePresence, clearStalePresence,
  firebaseReady: () => firebaseReady
};

window.dispatchEvent(new Event("jessdata-ready"));
