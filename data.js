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

function rawDefaultData() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  return {
    aboutPoints: [
      { id: uid(), icon: "book", title: "Free for every student", desc: "Every class, every material, every session costs students nothing. It always will." },
      { id: uid(), icon: "chat", title: "Speaking before grammar", desc: "Fluency grows through conversation, not memorisation. Students talk from day one." },
      { id: uid(), icon: "people", title: "Students become teachers", desc: "Our volunteers are teenagers who trained with us, then stayed to teach the next class." },
      { id: uid(), icon: "globe", title: "Open across Java", desc: "We run fully online, so a student in any town joins the same class as everyone else." }
    ],
    volunteerSteps: [
      { id: uid(), title: "Send us a message", desc: "Use the contact form below and tell us a little about yourself." },
      { id: uid(), title: "Have a short chat", desc: "An informal conversation so we can hear how you speak and what you would like to teach." },
      { id: uid(), title: "Join teacher training", desc: "A short orientation covering lesson structure, classroom confidence, and our materials." },
      { id: uid(), title: "Take your first class", desc: "You will co-teach with an experienced volunteer before leading on your own." }
    ],
    jessEdu: {
      published: true,
      marker: "Free learning materials",
      heading: "Keep learning with JessEDU.",
      description: "JessEDU is JESS's own learning site: free lessons, practice activities, and a placement quiz so you can start at the right level, all built by the same team behind these EduTrips.",
      buttonText: "Visit JessEDU",
      url: "https://javaneseenglishsociety.github.io/JessEDU/",
      image: "",
      marker_id: "", heading_id: "", description_id: "", buttonText_id: ""
    },
    sectionText: {
      about_marker: "About JESS", about_marker_id: "Tentang JESS",
      about_heading: "Peer teaching, at the scale of a movement.", about_heading_id: "Belajar dari sesama pelajar, dalam skala gerakan.",
      vision_marker: "Our vision", vision_marker_id: "Visi kami",
      vision_heading: "Where we are going", vision_heading_id: "Arah kami",
      mission_marker: "Our mission", mission_marker_id: "Misi kami",
      mission_heading: "How we get there", mission_heading_id: "Cara kami mewujudkannya",
      programs_marker: "Programs", programs_marker_id: "Program",
      programs_heading: "What we run.", programs_heading_id: "Yang kami jalankan.",
      events_marker: "Calendar", events_marker_id: "Kalender",
      events_heading: "What is coming up.", events_heading_id: "Yang akan datang.",
      team_marker: "The team", team_marker_id: "Tim kami",
      team_heading: "Who runs JESS.", team_heading_id: "Pengurus JESS.",
      volunteer_marker: "Volunteer", volunteer_marker_id: "Relawan",
      volunteer_heading: "Teach the class you wish you had had.", volunteer_heading_id: "Ajarkan kelas yang dulu kamu inginkan.",
      partners_marker: "Partners", partners_marker_id: "Mitra",
      partners_heading: "Schools and organisations we work with.", partners_heading_id: "Sekolah dan organisasi mitra kami.",
      news_marker: "News", news_marker_id: "Berita",
      news_heading: "Latest from JESS.", news_heading_id: "Kabar terbaru dari JESS.",
      testimonials_marker: "In their words", testimonials_marker_id: "Kata mereka",
      testimonials_heading: "What students say.", testimonials_heading_id: "Kata para siswa.",
      gallery_marker: "Gallery", gallery_marker_id: "Galeri",
      gallery_heading: "Moments from our classes.", gallery_heading_id: "Momen dari kelas kami.",
      faq_marker: "Questions", faq_marker_id: "Pertanyaan",
      faq_heading: "Things people ask us.", faq_heading_id: "Pertanyaan yang sering diajukan.",
      contact_marker: "Contact", contact_marker_id: "Kontak",
      contact_heading: "Get in touch.", contact_heading_id: "Hubungi kami."
    },
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
      { id: uid(), name: "Aisyah Rahma", school: "SMA Labschool", review: "I joined as a student and now I teach. JESS changed how I see my own potential.", photo: "" }
    ],
    gallery: [
      { id: uid(), img: "", caption: "Weekly conversation club" },
      { id: uid(), img: "", caption: "Speech competition finals" },
      { id: uid(), img: "", caption: "Volunteer teacher training day" },
      { id: uid(), img: "", caption: "Community English fair" }
    ],
    faq: [
      { id: uid(), q: "Is JESS really free for students?", a: "Yes, every class, material, and event JESS runs is completely free for students." },
      { id: uid(), q: "Who can become a volunteer teacher?", a: "Qualified middle and high school students who pass our teacher training program can lead classes through peer teaching." },
      { id: uid(), q: "Where does JESS operate?", a: "JESS operates fully online, with students and volunteer teachers joining from across Java and beyond." },
      { id: uid(), q: "How do I enroll as a student?", a: "Fill out the contact form below or reach out through our Instagram, and we'll guide you through enrollment." }
    ],
    contact: {
      intro: "Questions, partnership ideas, or ready to volunteer? Send us a message. We reply within a few days.",
      email: "hello@jess-english.org",
      location: "Fully online, Java, Indonesia",
      instagram: "#",
      tiktok: "#",
      discord: "#"
    },
    footer: {
      privacyUrl: "#",
      termsUrl: "#"
    },
    news: [],
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

/* The predetermined markers an event can carry. Admin picks from this list
   rather than typing free text, so the public site can style them and
   visitors see consistent wording. */
const EVENT_TAGS = [
  "Online",
  "Offline",
  "Hybrid",
  "Open to public",
  "Available to volunteer",
  "Registration required",
  "Members only"
];

/* ------------------------------------------------------------------ *
 * NORMALISATION — the reason existing content survives upgrades.
 *
 * mergeWithDefaults() is a SHALLOW Object.assign: any top-level key the
 * stored document already has (events, team, contact…) replaces the
 * default outright. That is fine for brand-new top-level keys such as
 * `news`, which simply fall through to the default [].
 *
 * It is NOT enough for new fields added INSIDE existing items — an event
 * saved before this version has no `tags` and no `registration`. So after
 * merging we walk the stored items and fill in only what is missing,
 * never overwriting a value that is already there. Nothing the admin has
 * entered is touched; upgrades are additive.
 * ------------------------------------------------------------------ */
function normalizeData(data) {
  const d = data || {};

  // Arrays that must exist even if an older document predates them.
  ["stats", "programs", "events", "team", "testimonials",
   "gallery", "partners", "faq", "news"].forEach((k) => {
    if (!Array.isArray(d[k])) d[k] = [];
  });

  // Events gained tags + an optional registration block.
  d.events = d.events.map((e) => ({
    ...e,
    id: e.id || uid(),
    tags: Array.isArray(e.tags) ? e.tags.filter((t) => EVENT_TAGS.includes(t)) : [],
    registration: {
      enabled: !!(e.registration && e.registration.enabled),
      // "form" collects sign-ups into Firestore; "link" sends people to an
      // external form (Google Forms, etc.) the org may already use.
      mode: (e.registration && e.registration.mode === "link") ? "link" : "form",
      url: (e.registration && e.registration.url) || "",
      askWhy: !!(e.registration && e.registration.askWhy),
      closed: !!(e.registration && e.registration.closed)
    }
  }));

  // News items are new, but normalise defensively in case of a partial import.
  d.news = d.news.map((n) => ({
    id: n.id || uid(),
    title: n.title || "",
    date: n.date || "",
    body: n.body || "",
    image: n.image || "",
    video: n.video || "",
    published: n.published !== false,
    title_id: n.title_id || "",
    body_id: n.body_id || ""
  }));

  // Indonesian counterparts for translatable content. Empty string means
  // "not translated yet" and the site falls back to the English text, so
  // adding the toggle never blanks out anything already written.
  d.hero = d.hero || {};
  ["title_id", "subtitle_id", "primaryBtn_id", "secondaryBtn_id"].forEach((k) => {
    if (typeof d.hero[k] !== "string") d.hero[k] = "";
  });
  d.mission = d.mission || {};
  if (typeof d.mission.vision_id !== "string") d.mission.vision_id = "";
  if (!Array.isArray(d.mission.missionList_id)) d.mission.missionList_id = [];
  if (!Array.isArray(d.mission.missionList)) d.mission.missionList = [];
  d.contact = d.contact || {};
  if (typeof d.contact.intro_id !== "string") d.contact.intro_id = "";

  d.programs = d.programs.map((p) => ({
    ...p, title_id: p.title_id || "", desc_id: p.desc_id || ""
  }));
  d.faq = d.faq.map((f) => ({ ...f, q_id: f.q_id || "", a_id: f.a_id || "" }));

  // Partners gained a description, a logo frame shape, a choice of
  // whether to show a "Visit website" button, and crop controls so a
  // logo can be repositioned and zoomed to actually fill the frame
  // instead of floating inside it with padding.
  d.partners = d.partners.map((p) => ({
    ...p,
    description: p.description || "",
    description_id: p.description_id || "",
    frameShape: p.frameShape === "circle" ? "circle" : "square",
    showButton: p.showButton !== false,
    logoZoom: (typeof p.logoZoom === "number" && p.logoZoom >= 1) ? p.logoZoom : 1,
    logoPosX: (typeof p.logoPosX === "number") ? p.logoPosX : 50,
    logoPosY: (typeof p.logoPosY === "number") ? p.logoPosY : 50
  }));

  // Older saved documents predate these sections entirely; fall back to
  // a fresh default set rather than leaving them undefined.
  if (!Array.isArray(d.aboutPoints) || !d.aboutPoints.length) d.aboutPoints = rawDefaultData().aboutPoints;
  if (!Array.isArray(d.volunteerSteps) || !d.volunteerSteps.length) d.volunteerSteps = rawDefaultData().volunteerSteps;
  d.aboutPoints = d.aboutPoints.map((a) => ({
    id: a.id || uid(), icon: a.icon || "book", title: a.title || "", desc: a.desc || "",
    title_id: a.title_id || "", desc_id: a.desc_id || ""
  }));
  d.volunteerSteps = d.volunteerSteps.map((v) => ({
    id: v.id || uid(), title: v.title || "", desc: v.desc || "",
    title_id: v.title_id || "", desc_id: v.desc_id || ""
  }));

  // Older saved documents predate the JessEDU cross-link section
  // entirely; fill in the shipped default rather than leaving it
  // undefined, but keep anything the admin has already customised.
  d.jessEdu = Object.assign({}, rawDefaultData().jessEdu, d.jessEdu || {});

  const defaultSectionText = rawDefaultData().sectionText;
  const savedSectionText = d.sectionText || {};
  d.sectionText = Object.assign({}, defaultSectionText);
  // Only an actually-filled-in value from a saved document overrides the
  // shipped default. This matters specifically for the "_id" fields: an
  // earlier version of this file shipped them as empty strings, and a
  // site that saved once while that was live would otherwise have that
  // empty value silently override the real Indonesian text added here,
  // even though the admin never deliberately cleared anything.
  Object.keys(savedSectionText).forEach((key) => {
    const val = savedSectionText[key];
    if (typeof val === "string" && val.trim() !== "") d.sectionText[key] = val;
  });

  return d;
}

function mergeWithDefaults(remote) {
  return normalizeData(Object.assign(rawDefaultData(), remote || {}));
}

/* defaultData() is used directly on several paths — a brand-new site, the
   offline fallback, and admin's "Reset website" — so it must come out
   normalised too. Otherwise those paths produce events with no tags or
   registration block while the Firestore path produces complete ones. */
function defaultData() {
  return normalizeData(rawDefaultData());
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
let db, auth, fsFns, authFns, storage, storageFns;

async function trySetupFirebase() {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith("PASTE_")) {
    console.warn("JESS: Firebase config is missing or still a placeholder (see firebase-config.js). Running in local-only mode.");
    return false;
  }
  try {
    const [{ initializeApp }, firestoreMod, authMod, storageMod] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js")
    ]);
    const app = initializeApp(cfg);
    fsFns = firestoreMod;
    authFns = authMod;
    storageFns = storageMod;
    db = firestoreMod.getFirestore(app);
    auth = authMod.getAuth(app);
    storage = storageMod.getStorage(app);
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
/* ------------------------------------------------------------------ *
 * SPLIT COLLECTIONS — team, testimonials, gallery, partners, and news
 * each live in their OWN Firestore collection (one document per item)
 * instead of as arrays embedded inside the single jess/site document.
 *
 * jess/site has a hard 1MB total limit shared by everything written to
 * it. With these five arrays embedded, every team photo, gallery
 * image, partner logo, and news cover image all counted against that
 * ONE shared ceiling — which is exactly what "exceeds the 1MB limit"
 * meant when it actually happened. A single item in its own document
 * gets its OWN 1MB ceiling; one person's name, bio, and one compressed
 * photo will never come close to that on their own, and adding a
 * hundredth team member costs nothing against the size of any other
 * document, including jess/site itself.
 *
 * This needs no new Firebase product, no billing plan, and no new
 * signup — it's the same Firestore database already in use, just
 * organised so no single write can hit a wall the others share.
 * ------------------------------------------------------------------ */
const SPLIT_FIELDS = ["team", "testimonials", "gallery", "partners", "news"];

// jessEdu is a single object, not a list of items, so it doesn't fit the
// SPLIT_FIELDS pattern above — but it holds its own image, and older
// saved sites may still have that image sitting as embedded base64 from
// before uploads moved to Storage. Left inside the core document, that
// alone can be large enough to keep jess/site over the 1MB limit even
// after every genuinely large field is stripped out above. Same fix,
// applied to a single field instead of an array: it gets its own tiny
// document too.
const SINGLETON_COLLECTION = "config";
const SINGLETON_FIELDS = ["jessEdu"];

// Which item IDs this tab has actually seen written to each collection,
// captured on load and updated after every save. Diffing against this
// on the next save is how a removed item gets deleted from Firestore
// instead of silently lingering there forever.
let knownSplitIds = { team: new Set(), testimonials: new Set(), gallery: new Set(), partners: new Set(), news: new Set() };

function splitCollectionRef(field) {
  return fsFns.collection(db, field);
}

async function loadSplitCollections() {
  const out = {};
  await Promise.all(SPLIT_FIELDS.map(async (field) => {
    const snap = await fsFns.getDocs(splitCollectionRef(field));
    out[field] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }));
  return out;
}

// One-time migration: a site created before this change still has its
// team/testimonials/gallery/partners/news sitting as arrays embedded in
// the jess/site document itself. The very first time this runs against
// such a site, each embedded item is copied out into its own new
// document in the matching collection, so nothing already on the site
// is lost. Runs at most once per field, ever — after migration, the
// collection is non-empty, so this check never fires for that field
// again, even if the old embedded array is still sitting in the core
// document unused.
async function migrateSplitFieldIfNeeded(field, splitItems, coreEmbeddedItems) {
  if (splitItems.length > 0) return splitItems; // already migrated (or genuinely empty on purpose)
  if (!coreEmbeddedItems || coreEmbeddedItems.length === 0) return splitItems;
  console.info(`JESS: migrating ${coreEmbeddedItems.length} existing ${field} item(s) into their own documents.`);
  const migrated = [];
  for (const item of coreEmbeddedItems) {
    const id = item.id || uid();
    const withId = { ...item, id };
    try {
      await fsFns.setDoc(fsFns.doc(db, field, id), withId);
      migrated.push(withId);
    } catch (e) {
      console.warn(`JESS: could not migrate one ${field} item; it stays only in the old embedded copy for now.`, e);
    }
  }
  return migrated.length ? migrated : splitItems;
}

async function loadAndMergeSplitCollections(coreData) {
  const split = await loadSplitCollections();
  for (const field of SPLIT_FIELDS) {
    split[field] = await migrateSplitFieldIfNeeded(field, split[field], coreData[field]);
    coreData[field] = split[field];
    knownSplitIds[field] = new Set(split[field].map((item) => item.id));
  }

  // Singleton fields (currently just jessEdu): same idea, one field
  // instead of a list. If its own document doesn't exist yet but the
  // core document still has real content for it (an image especially),
  // copy it over once; from then on the singleton document is
  // authoritative.
  for (const field of SINGLETON_FIELDS) {
    try {
      const snap = await fsFns.getDoc(fsFns.doc(db, SINGLETON_COLLECTION, field));
      if (snap.exists()) {
        coreData[field] = snap.data();
      } else if (coreData[field] && Object.keys(coreData[field]).length) {
        await fsFns.setDoc(fsFns.doc(db, SINGLETON_COLLECTION, field), coreData[field]);
      }
    } catch (e) {
      console.warn(`JESS: could not load/migrate the ${field} singleton; using the core document's copy for now.`, e);
    }
  }

  return coreData;
}

// Writes only what actually needs writing: new or changed items get
// upserted, items that existed on the last load/save but are gone from
// the in-memory data now get deleted. Every item is its own small
// document, so this is many small writes rather than one big one —
// well within Firestore's free daily write quota for a site this size.
async function saveSplitCollections(data) {
  for (const field of SPLIT_FIELDS) {
    const items = data[field] || [];
    const currentIds = new Set(items.map((item) => item.id));
    const removedIds = [...knownSplitIds[field]].filter((id) => !currentIds.has(id));

    await Promise.all(items.map((item) => fsFns.setDoc(fsFns.doc(db, field, item.id), item)));
    await Promise.all(removedIds.map((id) => fsFns.deleteDoc(fsFns.doc(db, field, id))));

    knownSplitIds[field] = currentIds;
  }
  for (const field of SINGLETON_FIELDS) {
    await fsFns.setDoc(fsFns.doc(db, SINGLETON_COLLECTION, field), data[field] || {});
  }
}

function stripSplitFields(data) {
  const core = { ...data };
  SPLIT_FIELDS.forEach((field) => { delete core[field]; });
  SINGLETON_FIELDS.forEach((field) => { delete core[field]; });
  return core;
}

function subscribe(callback) {
  const cached = getLocalCache();
  if (cached) callback(mergeWithDefaults(cached));

  if (!firebaseReady) {
    if (!cached) callback(defaultData());
    return () => {};
  }

  // The five split collections don't get their own live onSnapshot
  // listeners here — that would mean six separate real-time streams to
  // coordinate for a site update this infrequent. Instead, the public
  // site re-fetches them each time the core document changes, which
  // covers admin saves (which always touch jess/site too) without the
  // added complexity of merging six independent live streams into one
  // callback.
  return fsFns.onSnapshot(siteDocRef(), (snap) => {
    const raw = snap.exists() ? snap.data() : defaultData();
    if (!snap.exists()) {
      fsFns.setDoc(siteDocRef(), raw).catch((e) => console.warn("JESS: could not seed Firestore.", e));
    }
    loadAndMergeSplitCollections(raw).then((withSplit) => {
      const merged = mergeWithDefaults(withSplit);
      setLocalCache(merged);
      callback(merged);
    }).catch((e) => {
      console.warn("JESS: could not load team/testimonials/gallery/partners/news; showing core content only.", e);
      const merged = mergeWithDefaults(raw);
      setLocalCache(merged);
      callback(merged);
    });
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
    let raw;
    if (snap.exists()) {
      raw = snap.data();
    } else {
      raw = defaultData();
      await fsFns.setDoc(siteDocRef(), raw);
    }
    const withSplit = await loadAndMergeSplitCollections(raw);
    const merged = mergeWithDefaults(withSplit);
    setLocalCache(merged);
    return merged;
  } catch (e) {
    console.warn("JESS: could not reach Firestore, using local cache/defaults.", e);
    return cached || defaultData();
  }
}

/* ------------------------------------------------------------------ *
 * SAVE (admin only — Firestore security rules require an
 * authenticated user for writes)
 * ------------------------------------------------------------------ */
let lastSaveError = null;

async function saveData(data) {
  setLocalCache(data);
  if (!firebaseReady) return false;
  try {
    // The core document never contains team/testimonials/gallery/
    // partners/news anymore — those are saved separately, each item as
    // its own small document, specifically so nothing here can ever
    // grow into the 1MB-per-document wall on its own.
    await fsFns.setDoc(siteDocRef(), stripSplitFields(data));
    await saveSplitCollections(data);
    lastSaveError = null;
    return true;
  } catch (e) {
    console.warn("JESS: Firestore save failed — change was kept locally only.", e);
    lastSaveError = e;
    return false;
  }
}

// Lets admin.js build a specific error message after a failed save,
// instead of only ever guessing "you may be signed out" — the actual
// most common cause in practice is the site's single Firestore
// document (every photo, logo, and now every news image all share
// ONE document with a hard 1MB total limit) going over that limit,
// which surfaces as a distinct Firestore error, not a permission or
// connectivity problem at all.
function getLastSaveError() {
  return lastSaveError;
}

/* ------------------------------------------------------------------ *
 * LANGUAGE (English / Bahasa Indonesia)
 *
 * Two separate things are translated:
 *  1. Fixed interface labels — the UI_STRINGS table below.
 *  2. Admin-entered content — via optional "_id" sibling fields
 *     (title_id, desc_id…). When a translation is blank the English text
 *     is shown instead, so switching language never blanks the page and
 *     the org can translate gradually.
 * ------------------------------------------------------------------ */
const LANG_KEY = "jess-lang";

const UI_STRINGS = {
  en: {
    nav_about: "About", nav_programs: "Programs", nav_events: "Events",
    nav_team: "Team", nav_volunteer: "Volunteer", nav_partners: "Partners",
    nav_contact: "Contact", nav_news: "News",
    search_placeholder: "Search programs, team, events…",
    marker_about: "About JESS", marker_vision: "Our vision", marker_mission: "Our mission",
    marker_programs: "Programs", marker_calendar: "Calendar", marker_team: "The team",
    marker_volunteer: "Volunteer", marker_partners: "Partners", marker_news: "News",
    marker_testimonials: "In their words", marker_gallery: "Gallery",
    marker_questions: "Questions", marker_contact: "Contact",
    h_about: "Peer teaching, at the scale of a movement.",
    h_vision: "Where we're going", h_mission: "How we get there",
    h_programs: "What we run.", h_events: "What's coming up.",
    h_team: "Who runs JESS.", h_volunteer: "Teach the class you wish you'd had.",
    h_partners: "Schools and organisations we work with.",
    h_news: "Latest from JESS.", h_testimonials: "What students say.",
    h_gallery: "Moments from our classes.", h_faq: "Things people ask us.",
    h_contact: "Get in touch.",
    select_date: "Select a date", no_events_day: "No events on this day.",
    choose_day: "Choose a day on the calendar to see its events.",
    no_upcoming: "No upcoming events yet.", no_news: "No news posts yet.",
    register: "Register", registration_closed: "Registration closed",
    register_for: "Register for", full_name: "Your name", email: "Email",
    phone: "Phone or WhatsApp", role: "I want to join as",
    participant: "Participant", volunteer: "Volunteer",
    why_join: "Why do you want to join?", send: "Send", sending: "Sending…",
    reg_ok: "You're registered. We'll be in touch by email.",
    reg_fail: "Couldn't send that. Please check your connection and try again.",
    required_fields: "Please fill in your name and email.",
    days: "Days", hrs: "Hrs", min: "Min", live: "Live",
    read_more: "Read more", watch_video: "Watch video", close: "Close",
    footer_explore: "Explore", footer_involved: "Get involved",
    staff_login: "Staff login", privacy: "Privacy", terms: "Terms",
    form_name: "Your name", form_email: "Email", form_message: "Message",
    form_send: "Send message",
    apply_to_volunteer: "Apply to volunteer", apply_as_student: "Apply as a Student", check_status: "Check application status",
    apply_intro: "Tell us a bit about yourself. We'll review it and let you know.",
    school: "School", volunteer_teacher: "Volunteer as a member", student_join: "Join as a student",
    availability: "When are you available?", availability_ph: "e.g. weekday evenings, weekends",
    department: "Department", department_ph: "Select a department",
    dept_academics: "Academics", dept_media: "Media and Marketing",
    dept_pr: "Public Relations", dept_internal: "Internal Management",
    apply_ok_title: "Application received", apply_ok_body: "Save this code. It is the only way to check your status later.",
    apply_ok_hint: "We'll review your application and update your status here. If you're accepted, check your email for next steps.",
    copy_code: "Copy code", copied: "Copied!",
    check_status_hint: "Enter the confirmation code you received when you applied.",
    confirm_code: "Confirmation code", check: "Check",
    code_not_found: "We couldn't find an application with that code. Double-check it and try again.",
    status_pending: "Under review", status_accepted: "Accepted!", status_declined: "Not selected this time",
    event_passed: "Event passed",
    check_email_notice: "Please check your email for next steps.",
    visit_website: "Visit website"
  },
  id: {
    nav_about: "Tentang", nav_programs: "Program", nav_events: "Acara",
    nav_team: "Tim", nav_volunteer: "Relawan", nav_partners: "Mitra",
    nav_contact: "Kontak", nav_news: "Berita",
    search_placeholder: "Cari program, tim, acara…",
    marker_about: "Tentang JESS", marker_vision: "Visi kami", marker_mission: "Misi kami",
    marker_programs: "Program", marker_calendar: "Kalender", marker_team: "Tim kami",
    marker_volunteer: "Relawan", marker_partners: "Mitra", marker_news: "Berita",
    marker_testimonials: "Kata mereka", marker_gallery: "Galeri",
    marker_questions: "Pertanyaan", marker_contact: "Kontak",
    h_about: "Belajar dari sesama pelajar, dalam skala gerakan.",
    h_vision: "Arah kami", h_mission: "Cara kami mewujudkannya",
    h_programs: "Yang kami jalankan.", h_events: "Yang akan datang.",
    h_team: "Pengurus JESS.", h_volunteer: "Ajarkan kelas yang dulu kamu inginkan.",
    h_partners: "Sekolah dan organisasi mitra kami.",
    h_news: "Kabar terbaru dari JESS.", h_testimonials: "Kata para siswa.",
    h_gallery: "Momen dari kelas kami.", h_faq: "Pertanyaan yang sering diajukan.",
    h_contact: "Hubungi kami.",
    select_date: "Pilih tanggal", no_events_day: "Tidak ada acara pada hari ini.",
    choose_day: "Pilih hari pada kalender untuk melihat acaranya.",
    no_upcoming: "Belum ada acara mendatang.", no_news: "Belum ada berita.",
    register: "Daftar", registration_closed: "Pendaftaran ditutup",
    register_for: "Daftar untuk", full_name: "Nama kamu", email: "Email",
    phone: "Telepon atau WhatsApp", role: "Saya ingin bergabung sebagai",
    participant: "Peserta", volunteer: "Relawan",
    why_join: "Mengapa kamu ingin bergabung?", send: "Kirim", sending: "Mengirim…",
    reg_ok: "Pendaftaran berhasil. Kami akan menghubungi lewat email.",
    reg_fail: "Gagal mengirim, periksa koneksi lalu coba lagi.",
    required_fields: "Mohon isi nama dan email kamu.",
    days: "Hari", hrs: "Jam", min: "Mnt", live: "Berlangsung",
    read_more: "Selengkapnya", watch_video: "Tonton video", close: "Tutup",
    footer_explore: "Jelajahi", footer_involved: "Ikut terlibat",
    staff_login: "Masuk pengurus", privacy: "Privasi", terms: "Ketentuan",
    form_name: "Nama kamu", form_email: "Email", form_message: "Pesan",
    form_send: "Kirim pesan",
    apply_to_volunteer: "Daftar jadi relawan", apply_as_student: "Daftar sebagai Siswa", check_status: "Cek status pendaftaran",
    apply_intro: "Ceritakan sedikit tentang dirimu. Kami akan meninjau dan menghubungi kembali.",
    school: "Sekolah", volunteer_teacher: "Menjadi anggota relawan", student_join: "Bergabung sebagai siswa",
    availability: "Kapan kamu tersedia?", availability_ph: "misalnya sore hari kerja, akhir pekan",
    department: "Departemen", department_ph: "Pilih departemen",
    dept_academics: "Akademik", dept_media: "Media dan Pemasaran",
    dept_pr: "Hubungan Masyarakat", dept_internal: "Manajemen Internal",
    apply_ok_title: "Pendaftaran diterima", apply_ok_body: "Simpan kode ini. Ini satu-satunya cara untuk mengecek status kamu nanti.",
    apply_ok_hint: "Kami akan meninjau pendaftaranmu dan memperbarui statusnya di sini. Jika diterima, periksa email untuk langkah selanjutnya.",
    copy_code: "Salin kode", copied: "Tersalin!",
    check_status_hint: "Masukkan kode konfirmasi yang kamu terima saat mendaftar.",
    confirm_code: "Kode konfirmasi", check: "Cek",
    code_not_found: "Kami tidak menemukan pendaftaran dengan kode itu. Periksa kembali dan coba lagi.",
    status_pending: "Sedang ditinjau", status_accepted: "Diterima!", status_declined: "Belum berhasil kali ini",
    event_passed: "Acara telah selesai",
    check_email_notice: "Silakan periksa email untuk langkah selanjutnya.",
    visit_website: "Kunjungi situs"
  }
};

// Indonesian labels for the fixed event markers.
const TAG_LABELS = {
  id: {
    "Online": "Daring",
    "Offline": "Luring",
    "Hybrid": "Hibrida",
    "Open to public": "Terbuka untuk umum",
    "Available to volunteer": "Terbuka untuk relawan",
    "Registration required": "Perlu pendaftaran",
    "Members only": "Khusus anggota"
  }
};

function getLang() {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === "id" ? "id" : "en";
  } catch (e) { return "en"; }
}

function setLang(lang) {
  try { localStorage.setItem(LANG_KEY, lang === "id" ? "id" : "en"); } catch (e) { /* ignore */ }
}

function t(key, lang) {
  const l = lang || getLang();
  return (UI_STRINGS[l] && UI_STRINGS[l][key]) || UI_STRINGS.en[key] || key;
}

function tagLabel(tag, lang) {
  const l = lang || getLang();
  return (TAG_LABELS[l] && TAG_LABELS[l][tag]) || tag;
}

/* Pick the translated field when present, else fall back to the original.
   field("title") on an Indonesian page reads obj.title_id, or obj.title
   when the translation is still blank. */
function field(obj, name, lang) {
  const l = lang || getLang();
  if (!obj) return "";
  if (l === "id") {
    const translated = obj[name + "_id"];
    if (typeof translated === "string" && translated.trim() !== "") return translated;
  }
  return obj[name] || "";
}

/* ------------------------------------------------------------------ *
 * EVENT REGISTRATIONS
 *
 * Sign-ups live in their own top-level collection, NOT inside the site
 * document — the same reasoning as contact messages. The site doc has a
 * hard 1MB ceiling shared with every inline photo, so an event that goes
 * well must not be able to break the whole site by filling it up.
 * ------------------------------------------------------------------ */
const REGISTRATIONS_COLLECTION = "registrations";

function registrationsCollection() {
  return fsFns.collection(db, REGISTRATIONS_COLLECTION);
}

async function submitRegistration({ eventId, eventTitle, name, email, phone, role, why }) {
  if (!firebaseReady) return false;
  try {
    await fsFns.addDoc(registrationsCollection(), {
      eventId: String(eventId || ""),
      eventTitle: String(eventTitle || ""),
      name: String(name || "").slice(0, 120),
      email: String(email || "").slice(0, 160),
      phone: String(phone || "").slice(0, 40),
      // "participant" or "volunteer" — an event can invite both.
      role: role === "volunteer" ? "volunteer" : "participant",
      why: String(why || "").slice(0, 1200),
      createdAt: Date.now()
    });
    return true;
  } catch (e) {
    console.warn("JESS: registration failed.", e);
    return false;
  }
}

async function listRegistrations() {
  if (!firebaseReady) return [];
  try {
    const snap = await fsFns.getDocs(registrationsCollection());
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (e) {
    console.warn("JESS: could not load registrations.", e);
    return [];
  }
}

async function deleteRegistration(id) {
  if (!firebaseReady) return false;
  try {
    await fsFns.deleteDoc(fsFns.doc(db, REGISTRATIONS_COLLECTION, id));
    return true;
  } catch (e) {
    console.warn("JESS: could not delete registration.", e);
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * VOLUNTEER APPLICATIONS
 *
 * A dedicated pipeline, separate from event sign-ups: someone applies to
 * join JESS itself (not a single event), staff review and accept/decline,
 * and the applicant can check the outcome without an email round-trip.
 *
 * There is no backend here — this is a static site plus Firestore, with
 * no server to send mail from. So "notify them" works two ways instead
 * of an automatic email:
 *   1. The applicant gets a private, unguessable confirmation code at
 *      submit time and can look up their status with it any time
 *      (getApplicationByCode). Firestore rules allow GET-by-exact-ID for
 *      anyone, but forbid LIST entirely, so a code is required — it
 *      can't be browsed or enumerated, only redeemed if you have it.
 *   2. The admin panel's "Email applicant" button opens a pre-filled
 *      mailto: link (recipient, subject, and a status-appropriate body
 *      already written), so sending the real email is one click, not
 *      copy-pasting an address by hand.
 * ------------------------------------------------------------------ */
const APPLICATIONS_COLLECTION = "applications";

function applicationsCollection() {
  return fsFns.collection(db, APPLICATIONS_COLLECTION);
}

const DEPARTMENTS = ["Academics", "Media and Marketing", "Public Relations", "Internal Management"];

async function submitApplication({ name, email, phone, school, role, department, availability, why }) {
  if (!firebaseReady) return { ok: false };
  try {
    const isVolunteer = role === "volunteer";
    const ref = await fsFns.addDoc(applicationsCollection(), {
      name: String(name || "").slice(0, 120),
      email: String(email || "").slice(0, 160),
      phone: String(phone || "").slice(0, 40),
      school: String(school || "").slice(0, 160),
      role: isVolunteer ? "volunteer" : "student",
      // Department only applies to members/volunteers — a student
      // applicant has none, so it's stored empty rather than omitted,
      // keeping every document the same shape for the rules and the
      // admin panel to rely on.
      department: (isVolunteer && DEPARTMENTS.includes(department)) ? department : "",
      availability: String(availability || "").slice(0, 300),
      why: String(why || "").slice(0, 1200),
      status: "pending",
      note: "",
      createdAt: Date.now(),
      reviewedAt: null
    });
    return { ok: true, code: ref.id };
  } catch (e) {
    console.warn("JESS: application submission failed.", e);
    return { ok: false };
  }
}

// Public lookup by confirmation code — a GET on a known document ID.
// Firestore rules permit this for anyone but forbid listing the
// collection, so the code itself is what protects every applicant's
// privacy; there is no way to browse to someone else's application.
async function getApplicationByCode(code) {
  if (!firebaseReady || !code) return null;
  try {
    const ref = fsFns.doc(db, APPLICATIONS_COLLECTION, String(code).trim());
    const snap = await fsFns.getDoc(ref);
    if (!snap.exists()) return null;
    const d = snap.data();
    // Only the fields the applicant needs to see their own outcome —
    // never the full document (keeps this symmetrical with what the
    // rules actually intend to expose).
    return { status: d.status || "pending", note: d.note || "", name: d.name || "" };
  } catch (e) {
    console.warn("JESS: application lookup failed.", e);
    return null;
  }
}

async function listApplications() {
  if (!firebaseReady) return [];
  try {
    const snap = await fsFns.getDocs(applicationsCollection());
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (e) {
    console.warn("JESS: could not load applications.", e);
    return [];
  }
}

async function updateApplicationStatus(id, status, note) {
  if (!firebaseReady) return false;
  try {
    await fsFns.updateDoc(fsFns.doc(db, APPLICATIONS_COLLECTION, id), {
      status,
      note: String(note || "").slice(0, 800),
      reviewedAt: Date.now()
    });
    return true;
  } catch (e) {
    console.warn("JESS: could not update application.", e);
    return false;
  }
}

async function deleteApplication(id) {
  if (!firebaseReady) return false;
  try {
    await fsFns.deleteDoc(fsFns.doc(db, APPLICATIONS_COLLECTION, id));
    return true;
  } catch (e) {
    console.warn("JESS: could not delete application.", e);
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * AUTH (admin portal login/logout)
 *
 * This is now a purely LOCAL password check — it never calls Firebase
 * Authentication at all. `isAdminUnlocked` lives only in this tab's
 * memory: true after a correct password, reset to false on logout or
 * page reload. There is no session, no token, nothing persisted.
 *
 * This only works at all because firestore.rules was changed to stop
 * requiring a signed-in Firebase account for JessPortal's collections
 * (jess/site, messages, registrations, applications, portalTotals,
 * portal presence) — Firestore's rules run server-side and can't see
 * this password, so removing the real auth check there is what makes
 * a repo-local password meaningful again instead of a UI dead end.
 * The real-world effect: those collections now have no server-side
 * write protection at all, for anyone, regardless of this password.
 * ------------------------------------------------------------------ */
let isAdminUnlocked = false;
const authListeners = [];

function login(password) {
  const expected = window.FIREBASE_ADMIN_PASSWORD;
  if (!expected) return Promise.reject(new Error("No admin password is configured (firebase-config.js)."));
  if (password !== expected) return Promise.reject(new Error("Wrong password."));
  isAdminUnlocked = true;
  authListeners.forEach((cb) => cb({ email: window.FIREBASE_ADMIN_EMAIL || "admin" }));
  return Promise.resolve();
}

function logout() {
  isAdminUnlocked = false;
  authListeners.forEach((cb) => cb(null));
  return Promise.resolve();
}

function onAuthChange(cb) {
  authListeners.push(cb);
  // Fire once immediately with the current state, matching how Firebase's
  // own onAuthStateChanged reports the existing session right away.
  cb(isAdminUnlocked ? { email: window.FIREBASE_ADMIN_EMAIL || "admin" } : null);
  return () => {
    const i = authListeners.indexOf(cb);
    if (i !== -1) authListeners.splice(i, 1);
  };
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

/* ------------------------------------------------------------------ *
 * VIDEO UPLOAD (Firebase Storage)
 *
 * Video is stored differently from every photo elsewhere on this site.
 * Team photos, gallery images, partner logos, and news cover images are
 * all compressed and saved as base64 text directly inside the single
 * jess/site Firestore document — but that document has a hard 1MB
 * limit shared across everything on the site, and even a few seconds
 * of video easily exceeds 1MB on its own. So video files go to Firebase
 * Storage instead (a separate product built for actual files), and only
 * the resulting short download URL — a few dozen characters — gets
 * saved into the news post itself.
 *
 * This needs Storage enabled once in the Firebase Console (Build >
 * Storage > Get started) and its own storage.rules published, the same
 * way Firestore needed firestore.rules. See storage.rules in this
 * project for the exact rules to publish.
 * ------------------------------------------------------------------ */
const MAX_VIDEO_BYTES = 60 * 1024 * 1024; // 60MB — generous for a short clip, small enough to upload on an average connection without timing out

function uploadVideoFile(file, onProgress) {
  if (!firebaseReady) return Promise.reject(new Error("Firebase is not configured yet."));
  if (!storage || !storageFns) return Promise.reject(new Error("Firebase Storage isn't set up yet — see storage.rules and firebase-config.js."));
  if (!file.type.startsWith("video/")) return Promise.reject(new Error("That file isn't a video."));
  if (file.size > MAX_VIDEO_BYTES) return Promise.reject(new Error("That video is larger than 60MB — trim it down or compress it first."));

  const path = "news-videos/" + Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileRef = storageFns.ref(storage, path);
  const task = storageFns.uploadBytesResumable(fileRef, file);

  return new Promise((resolve, reject) => {
    task.on("state_changed",
      (snapshot) => {
        if (onProgress) onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      },
      (err) => reject(err),
      async () => {
        try {
          const url = await storageFns.getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/* ------------------------------------------------------------------ *
 * IMAGE UPLOAD (Firebase Storage) — replaces storing photos as base64
 * text directly inside the single jess/site Firestore document.
 *
 * Every photo on this site (team, testimonials, gallery, partner
 * logos, news covers) used to be compressed into a base64 string and
 * saved as a field on jess/site — but that document has Firestore's
 * hard 1MB total limit, SHARED by every single one of those photos
 * combined. A site with enough real content (a full team, a gallery,
 * a few partners, some news posts with covers) will eventually and
 * permanently hit that ceiling, at which point EVERY save fails,
 * including ones that have nothing to do with images, until an old
 * photo is deleted to make room again. This happened for real, not
 * hypothetically — that's what "exceeds the 1MB limit" meant.
 *
 * Storage has no such per-document limit (5GB on the free plan, a
 * roughly 5000x bigger ceiling), so images now go there instead, and
 * only the short resulting download URL — a few dozen characters —
 * gets saved onto jess/site. The image is still compressed
 * client-side first (smaller files, faster loads for visitors on
 * slow connections), it just isn't embedded as text in the document
 * anymore.
 * ------------------------------------------------------------------ */
const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB raw upload cap, before compression

function compressImageToBlob(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) { reject(new Error("Not an image file.")); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read that image."));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round(height * (maxDim / width)); width = maxDim; }
        else if (height > maxDim) { width = Math.round(width * (maxDim / height)); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error("Could not process that image.")); return; }
          resolve(blob);
        }, "image/jpeg", quality);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// folder examples: "team-photos", "gallery", "partner-logos",
// "testimonial-photos", "news-images", "jessedu-images"
async function uploadImageFile(file, folder, maxDim, quality, onProgress) {
  if (!firebaseReady) return Promise.reject(new Error("Firebase is not configured yet."));
  if (!storage || !storageFns) return Promise.reject(new Error("Firebase Storage isn't set up yet — see storage.rules and firebase-config.js."));
  if (!file.type.startsWith("image/")) return Promise.reject(new Error("That file isn't an image."));
  if (file.size > MAX_IMAGE_BYTES) return Promise.reject(new Error("That image is larger than 15MB — try a smaller file."));

  const blob = await compressImageToBlob(file, maxDim || 640, quality || 0.78);
  const path = folder + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ".jpg";
  const fileRef = storageFns.ref(storage, path);
  const task = storageFns.uploadBytesResumable(fileRef, blob, { contentType: "image/jpeg" });

  return new Promise((resolve, reject) => {
    task.on("state_changed",
      (snapshot) => {
        if (onProgress) onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      },
      (err) => reject(err),
      async () => {
        try {
          const url = await storageFns.getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

window.JESSData = {
  STORAGE_KEY, uid, defaultData,
  subscribe, loadOnce, saveData,
  login, logout, onAuthChange,
  submitMessage, listMessages, deleteMessage,
  submitRegistration, listRegistrations, deleteRegistration,
  submitApplication, getApplicationByCode, listApplications, updateApplicationStatus, deleteApplication, DEPARTMENTS,
  EVENT_TAGS, getLang, setLang, t, tagLabel, field, UI_STRINGS,
  trackVisit, startPresenceHeartbeat, getAnalyticsTotals, listOnlinePresence, clearStalePresence,
  uploadVideoFile, uploadImageFile, getLastSaveError,
  firebaseReady: () => firebaseReady
};

window.dispatchEvent(new Event("jessdata-ready"));
