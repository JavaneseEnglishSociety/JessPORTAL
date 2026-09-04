/* ==========================================================================
   JESS — Javanese English Speaking Society
   script.js — PUBLIC SITE ONLY. Subscribes to shared data (data.js) and
   renders it live. All editing happens in admin.html — this file never
   writes content, it only reads via JESSData.subscribe().
   ========================================================================== */

(function () {
  "use strict";

  function main() {

  let DATA = window.JESSData.defaultData();

  // Language state. `L` is just a shorthand for the helpers in data.js;
  // `field(obj,name)` returns the Indonesian variant when one exists and
  // falls back to the English text when it doesn't, so an untranslated
  // site still reads correctly in either mode.
  const L = window.JESSData;
  let lang = L.getLang();
  const field = (obj, name) => L.field(obj, name, lang);

  /* ------------------------------------------------------------------ *
   * THEME APPLICATION
   * ------------------------------------------------------------------ */
  const FONT_STACKS = {
    modern: { display: "'Cormorant',Georgia,serif", body: "'Karla',system-ui,sans-serif" },
    classic: { display: "'Cormorant','Georgia',serif", body: "'Georgia',serif" },
    friendly: { display: "'Karla',system-ui,sans-serif", body: "'Karla',system-ui,sans-serif" }
  };

  function applyTheme() {
    const root = document.documentElement;
    const t = DATA.theme;
    root.style.setProperty("--color-primary", t.primary);
    root.style.setProperty("--color-secondary", t.secondary);
    root.style.setProperty("--radius-sm", Math.max(0, t.radius - 8) + "px");
    root.style.setProperty("--radius-md", t.radius + "px");
    root.style.setProperty("--radius-lg", Number(t.radius) + 10 + "px");
    root.style.setProperty("--anim-speed", t.animSpeed);
    const fonts = FONT_STACKS[t.font] || FONT_STACKS.modern;
    root.style.setProperty("--font-display", fonts.display);
    root.style.setProperty("--font-body", fonts.body);
    root.setAttribute("data-theme", t.darkMode ? "dark" : "light");
  }

  /* ------------------------------------------------------------------ *
   * RENDER FUNCTIONS — read DATA, write DOM
   * ------------------------------------------------------------------ */
  function esc(str) {
    const d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }

  function renderHero() {
    document.getElementById("heroTitle").textContent = field(DATA.hero, "title");
    document.getElementById("heroSubtitle").textContent = field(DATA.hero, "subtitle");
    document.getElementById("heroBtnPrimary").textContent = field(DATA.hero, "primaryBtn");
    document.getElementById("heroBtnSecondary").textContent = field(DATA.hero, "secondaryBtn");
  }

  function renderMission() {
    document.getElementById("visionText").textContent = field(DATA.mission, "vision");
    const mList = (lang === "id" && DATA.mission.missionList_id && DATA.mission.missionList_id.length)
      ? DATA.mission.missionList_id
      : DATA.mission.missionList;
    document.getElementById("missionList").innerHTML = mList
      .map((m) => `<li>${esc(m)}</li>`).join("");
  }

  function renderStats() {
    document.getElementById("statsGrid").innerHTML = DATA.stats.map(s => `
      <div class="stat-card fade-in-up visible">
        <div class="stat-number">${esc(s.number)}</div>
        <div class="stat-label">${esc(s.label)}</div>
      </div>`).join("");
  }

  function renderPrograms() {
    document.getElementById("programsGrid").innerHTML = DATA.programs.map(p => `
      <div class="program-card fade-in-up visible">
        <div class="program-icon">${p.icon || "📘"}</div>
        <h3>${esc(field(p, "title"))}</h3>
        <p>${esc(field(p, "desc"))}</p>
      </div>`).join("");
  }

  function renderTeam() {
    document.getElementById("teamGrid").innerHTML = DATA.team.map(m => `
      <div class="team-card fade-in-up visible">
        ${m.photo
          ? `<img class="team-photo" src="${esc(m.photo)}" alt="${esc(m.name)}">`
          : `<div class="team-photo"></div>`}
        <div class="team-card-body">
          <h3>${esc(m.name)}</h3>
          <div class="team-role">${esc(m.role)}</div>
          <p class="team-desc">${esc(m.desc)}</p>
          <div class="team-socials">
            <a href="${esc(m.ig || '#')}" aria-label="${esc(m.name)} Instagram">Instagram</a>
            <a href="${esc(m.linkedin || '#')}" aria-label="${esc(m.name)} LinkedIn">LinkedIn</a>
          </div>
        </div>
      </div>`).join("");
  }

  function renderPartners() {
    document.getElementById("partnersGrid").innerHTML = DATA.partners.map(p => {
      const shape = p.frameShape === "circle" ? "shape-circle" : "shape-square";
      const frameInner = p.logo
        ? `<img src="${esc(p.logo)}" alt="${esc(p.name)}">`
        : `<span class="partner-initials">${esc((p.name || "?").trim().charAt(0).toUpperCase())}</span>`;
      const desc = field(p, "description");
      return `
      <div class="partner-card fade-in-up visible">
        <div class="partner-frame ${shape}">${frameInner}</div>
        <h3 class="partner-name">${esc(p.name)}</h3>
        ${desc ? `<p class="partner-desc">${esc(desc)}</p>` : ""}
        ${p.showButton !== false && p.url
          ? `<a class="btn btn-outline btn-sm partner-visit" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(L.t("visit_website", lang))}</a>`
          : ""}
      </div>`;
    }).join("");
  }

  function renderGallery() {
    document.getElementById("galleryGrid").innerHTML = DATA.gallery.map(g => `
      <div class="masonry-item fade-in-up visible">
        <img loading="lazy" src="${g.img || placeholderImg()}" alt="${esc(g.caption)}">
        <div class="masonry-caption">${esc(g.caption)}</div>
      </div>`).join("");
  }

  function placeholderImg() {
    return "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='220'><rect width='100%' height='100%' fill='%23e4eaf0'/><text x='50%' y='50%' fill='%2364748b' font-family='sans-serif' font-size='14' text-anchor='middle'>Photo</text></svg>`
    );
  }

  /* ---- News --------------------------------------------------------- *
   * Short updates, newest first. Unpublished posts are hidden from the
   * public site but stay editable in the admin panel, so a post can be
   * drafted before it goes live.
   * ------------------------------------------------------------------- */
  function renderNews() {
    const grid = document.getElementById("newsGrid");
    if (!grid) return;
    const posts = (DATA.news || [])
      .filter(n => n.published !== false)
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

    if (!posts.length) {
      grid.innerHTML = `<p class="empty-note">${esc(L.t("no_news", lang))}</p>`;
      return;
    }
    grid.innerHTML = posts.map(n => {
      const body = field(n, "body");
      const short = body.length > 180 ? body.slice(0, 180).trim() + "…" : body;
      const dateLabel = n.date
        ? new Date(n.date + "T00:00:00").toLocaleDateString(lang === "id" ? "id-ID" : undefined,
            { year: "numeric", month: "long", day: "numeric" })
        : "";
      return `
      <article class="news-card fade-in-up visible">
        ${dateLabel ? `<div class="news-date">${esc(dateLabel)}</div>` : ""}
        <h3>${esc(field(n, "title"))}</h3>
        <p class="news-body">${esc(short)}</p>
        ${body.length > 180
          ? `<button type="button" class="news-more" data-news="${esc(n.id)}">${esc(L.t("read_more", lang))}</button>`
          : ""}
      </article>`;
    }).join("");
  }

  // Expand a news post into a modal rather than truncating it forever.
  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-news]");
    if (!btn) return;
    const n = (DATA.news || []).find(x => String(x.id) === String(btn.dataset.news));
    if (!n) return;
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <button class="modal-close" aria-label="${esc(L.t("close", lang))}">&times;</button>
        <h3>${esc(field(n, "title"))}</h3>
        ${n.date ? `<p class="news-date">${esc(n.date)}</p>` : ""}
        <p style="white-space:pre-wrap;">${esc(field(n, "body"))}</p>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector(".modal-close").addEventListener("click", close);
    overlay.addEventListener("click", (e2) => { if (e2.target === overlay) close(); });
  });

  function renderFaq() {
    document.getElementById("faqAccordion").innerHTML = DATA.faq.map((f, i) => `
      <div class="accordion-item" data-index="${i}">
        <button class="accordion-q">${esc(field(f, "q"))} <span class="chev">&#9662;</span></button>
        <div class="accordion-a"><p>${esc(field(f, "a"))}</p></div>
      </div>`).join("");

    document.querySelectorAll("#faqAccordion .accordion-q").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".accordion-item");
        const wasOpen = item.classList.contains("open");
        document.querySelectorAll("#faqAccordion .accordion-item").forEach(i => {
          i.classList.remove("open");
          i.querySelector(".accordion-a").style.maxHeight = null;
        });
        if (!wasOpen) {
          item.classList.add("open");
          const a = item.querySelector(".accordion-a");
          a.style.maxHeight = a.scrollHeight + 40 + "px";
        }
      });
    });
  }

  function renderContact() {
    document.getElementById("contactIntro").textContent = field(DATA.contact, "intro");
    document.getElementById("contactEmail").textContent = DATA.contact.email;
    document.getElementById("contactLocation").textContent = DATA.contact.location;
    document.getElementById("socialInstagram").href = DATA.contact.instagram;
    document.getElementById("socialTiktok").href = DATA.contact.tiktok;
    document.getElementById("socialDiscord").href = DATA.contact.discord;
    document.getElementById("socialEmail").href = "mailto:" + DATA.contact.email;
    document.getElementById("footerPrivacy").href = DATA.footer.privacyUrl;
    document.getElementById("footerTerms").href = DATA.footer.termsUrl;
  }

  function renderAll() {
    renderHero();
    renderMission();
    renderStats();
    renderPrograms();
    renderTeam();
    renderPartners();
    renderGallery();
    renderFaq();
    renderNews();
    renderContact();
    renderCalendar();
    renderUpcoming();
    renderTestimonials();
    applyTheme();
    applyStaticStrings();
  }

  /* ---- Language toggle ---------------------------------------------- *
   * Static labels in the HTML carry data-i18n="key" (and data-i18n-ph for
   * placeholders). Switching language rewrites those, then re-renders the
   * data-driven sections. The choice is stored so it survives a reload.
   * ------------------------------------------------------------------- */
  function applyStaticStrings() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = L.t(el.dataset.i18n, lang);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.setAttribute("placeholder", L.t(el.dataset.i18nPh, lang));
    });
    document.documentElement.setAttribute("lang", lang === "id" ? "id" : "en");
    const btn = document.getElementById("langToggle");
    if (btn) {
      // The button shows the language you'd switch TO, which is the
      // clearer convention for a two-language switch.
      btn.textContent = lang === "id" ? "EN" : "ID";
      btn.setAttribute("aria-label",
        lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia");
    }
  }

  const langBtn = document.getElementById("langToggle");
  if (langBtn) {
    langBtn.addEventListener("click", () => {
      lang = (lang === "id") ? "en" : "id";
      L.setLang(lang);
      applyStaticStrings();
      renderAll();
    });
  }

  /* ------------------------------------------------------------------ *
   * NAVBAR — hamburger + search
   * ------------------------------------------------------------------ */
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  hamburger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", open);
  });
  navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
  }));

  const searchOverlay = document.getElementById("searchOverlay");
  const searchInput = document.getElementById("searchInput");
  document.getElementById("searchToggle").addEventListener("click", () => {
    searchOverlay.hidden = false;
    searchInput.value = "";
    document.getElementById("searchResults").innerHTML = "";
    setTimeout(() => searchInput.focus(), 50);
  });
  document.getElementById("searchClose").addEventListener("click", () => searchOverlay.hidden = true);
  searchOverlay.addEventListener("click", (e) => { if (e.target === searchOverlay) searchOverlay.hidden = true; });

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    const resultsEl = document.getElementById("searchResults");
    if (!q) { resultsEl.innerHTML = ""; return; }

    const index = [];
    DATA.programs.forEach(p => index.push({ type: "Program", label: p.title, target: "#programs" }));
    DATA.team.forEach(t => index.push({ type: "Team", label: `${t.name} — ${t.role}`, target: "#team" }));
    DATA.events.forEach(e => index.push({ type: "Event", label: `${e.title} (${e.date})`, target: "#events" }));
    DATA.faq.forEach(f => index.push({ type: "FAQ", label: f.q, target: "#faq" }));
    DATA.partners.forEach(p => index.push({ type: "Partner", label: p.name, target: "#partners" }));

    const matches = index.filter(i => i.label.toLowerCase().includes(q)).slice(0, 12);
    resultsEl.innerHTML = matches.length
      ? matches.map(m => `<div class="search-result-item" data-target="${m.target}"><span>${m.type}</span>${esc(m.label)}</div>`).join("")
      : `<div class="search-result-item">No results for "${esc(searchInput.value)}"</div>`;

    resultsEl.querySelectorAll(".search-result-item[data-target]").forEach(el => {
      el.addEventListener("click", () => {
        searchOverlay.hidden = true;
        document.querySelector(el.dataset.target)?.scrollIntoView({ behavior: "smooth" });
      });
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") searchOverlay.hidden = true;
  });

  /* ------------------------------------------------------------------ *
   * SCROLL FADE-IN (IntersectionObserver)
   * ------------------------------------------------------------------ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  function observeFadeIns() {
    // Opt in to the hidden start state only now that we know the observer
    // exists and will run — CSS keeps everything visible otherwise.
    document.documentElement.classList.add("js-on");
    document.querySelectorAll(".fade-in-up:not(.visible)").forEach(el => io.observe(el));
  }

  /* ------------------------------------------------------------------ *
   * CALENDAR (read-only — editing happens in admin.html)
   * ------------------------------------------------------------------ */
  let calYear, calMonth, selectedDate = null;
  (function initCalDate() {
    const now = new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();
  })();

  function pad(n) { return String(n).padStart(2, "0"); }
  function dateKey(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

  function eventsForDate(key) {
    return DATA.events.filter(e => {
      if (e.date === key) return true;
      if (e.recurring === "weekly") {
        const base = new Date(e.date + "T00:00:00");
        const target = new Date(key + "T00:00:00");
        if (target < base) return false;
        return base.getDay() === target.getDay();
      }
      if (e.recurring === "monthly") {
        const base = new Date(e.date + "T00:00:00");
        const target = new Date(key + "T00:00:00");
        if (target < base) return false;
        return base.getDate() === target.getDate();
      }
      return false;
    });
  }

  function renderCalendar() {
    const label = document.getElementById("calendarLabel");
    const grid = document.getElementById("calendarGrid");
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    label.textContent = `${monthNames[calMonth]} ${calYear}`;

    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date();
    const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

    let html = "";
    for (let i = 0; i < firstDay; i++) html += `<div class="cal-day empty"></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
      const key = dateKey(calYear, calMonth, d);
      const evs = eventsForDate(key);
      const isToday = key === todayKey;
      const isSelected = key === selectedDate;
      // A day with events is filled with that event's own colour so it reads
      // as a solid block at a glance, not a dot you have to hunt for. With
      // several events the cell is split into colour bands, one per event.
      let blockStyle = "";
      let countBadge = "";
      if (evs.length === 1) {
        blockStyle = ` style="--day-bg:${evs[0].color}"`;
      } else if (evs.length > 1) {
        const slice = evs.slice(0, 3);
        const step = 100 / slice.length;
        const bands = slice.map((e, i) =>
          `${e.color} ${(i * step).toFixed(2)}%, ${e.color} ${((i + 1) * step).toFixed(2)}%`
        ).join(", ");
        blockStyle = ` style="--day-bg:linear-gradient(135deg, ${bands})"`;
        countBadge = `<span class="cal-count">${evs.length}</span>`;
      }
      html += `<button type="button" class="cal-day ${evs.length ? "filled" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}"${blockStyle} data-key="${key}" role="gridcell" aria-label="${key}${evs.length ? ', ' + evs.length + ' events' : ''}">
        <span class="cal-num">${d}</span>${countBadge}
      </button>`;
    }
    grid.innerHTML = html;

    grid.querySelectorAll(".cal-day:not(.empty)").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedDate = btn.dataset.key;
        renderCalendar();
        renderDayPanel();
      });
    });

    if (!selectedDate) {
      selectedDate = (calYear === today.getFullYear() && calMonth === today.getMonth()) ? todayKey : dateKey(calYear, calMonth, 1);
    }
    renderDayPanel();
  }

  /* ---- Event markers + registration ---------------------------------- *
   * Tags come from a fixed vocabulary in data.js, so they render with
   * consistent wording and colour instead of free text. The two that
   * change what a visitor can DO — volunteering and online/offline — get
   * their own colour; the rest share a neutral style.
   * -------------------------------------------------------------------- */
  function renderTags(e) {
    if (!e.tags || !e.tags.length) return "";
    return `<div class="tag-row">${e.tags.map(tag => {
      const mod = tag === "Available to volunteer" ? " tag-volunteer"
                : tag === "Online" ? " tag-online"
                : tag === "Offline" ? " tag-offline"
                : "";
      return `<span class="tag${mod}">${esc(L.tagLabel(tag, lang))}</span>`;
    }).join("")}</div>`;
  }

  function renderRegisterBtn(e) {
    const r = e.registration || {};
    if (!r.enabled) return "";
    if (r.closed) {
      return `<span class="reg-closed">${esc(L.t("registration_closed", lang))}</span>`;
    }
    if (r.mode === "link" && r.url) {
      return `<a class="btn btn-primary btn-sm reg-btn" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(L.t("register", lang))}</a>`;
    }
    return `<button type="button" class="btn btn-primary btn-sm reg-btn" data-register="${esc(e.id)}">${esc(L.t("register", lang))}</button>`;
  }

  // One delegated listener handles every Register button on the page,
  // including ones re-rendered later by the calendar or the language switch.
  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-register]");
    if (btn) openRegistrationModal(btn.dataset.register);
  });

  function openRegistrationModal(eventId) {
    const e = DATA.events.find(x => String(x.id) === String(eventId));
    if (!e) return;
    const r = e.registration || {};
    const canVolunteer = (e.tags || []).includes("Available to volunteer");

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(L.t("register_for", lang))} ${esc(field(e, "title"))}">
        <button class="modal-close" aria-label="${esc(L.t("close", lang))}">&times;</button>
        <h3>${esc(L.t("register_for", lang))} ${esc(field(e, "title"))}</h3>
        <p class="panel-hint">${esc(e.date)}${e.time ? " · " + esc(e.time) : ""}${e.location ? " · " + esc(e.location) : ""}</p>
        <form id="regForm">
          <label for="regName">${esc(L.t("full_name", lang))}</label>
          <input id="regName" required autocomplete="name">
          <label for="regEmail">${esc(L.t("email", lang))}</label>
          <input id="regEmail" type="email" required autocomplete="email">
          <label for="regPhone">${esc(L.t("phone", lang))}</label>
          <input id="regPhone" autocomplete="tel">
          ${canVolunteer ? `
          <label for="regRole">${esc(L.t("role", lang))}</label>
          <select id="regRole">
            <option value="participant">${esc(L.t("participant", lang))}</option>
            <option value="volunteer">${esc(L.t("volunteer", lang))}</option>
          </select>` : ""}
          ${r.askWhy ? `
          <label for="regWhy">${esc(L.t("why_join", lang))}</label>
          <textarea id="regWhy" rows="3"></textarea>` : ""}
          <button type="submit" class="btn btn-primary">${esc(L.t("send", lang))}</button>
          <p class="form-status" id="regStatus" role="status"></p>
        </form>
      </div>`;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector(".modal-close").addEventListener("click", close);
    overlay.addEventListener("click", (ev) => { if (ev.target === overlay) close(); });
    document.addEventListener("keydown", function esc2(ev) {
      if (ev.key === "Escape") { close(); document.removeEventListener("keydown", esc2); }
    });
    setTimeout(() => overlay.querySelector("#regName").focus(), 40);

    overlay.querySelector("#regForm").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const statusEl = overlay.querySelector("#regStatus");
      const submitBtn = overlay.querySelector("button[type=submit]");
      const name = overlay.querySelector("#regName").value.trim();
      const email = overlay.querySelector("#regEmail").value.trim();
      if (!name || !email) {
        statusEl.textContent = L.t("required_fields", lang);
        statusEl.className = "form-status err";
        return;
      }
      submitBtn.disabled = true;
      statusEl.className = "form-status";
      statusEl.textContent = L.t("sending", lang);

      window.JESSData.submitRegistration({
        eventId: e.id,
        eventTitle: e.title,
        name, email,
        phone: overlay.querySelector("#regPhone").value.trim(),
        role: overlay.querySelector("#regRole") ? overlay.querySelector("#regRole").value : "participant",
        why: overlay.querySelector("#regWhy") ? overlay.querySelector("#regWhy").value.trim() : ""
      }).then((ok) => {
        if (ok) {
          statusEl.className = "form-status ok";
          statusEl.textContent = L.t("reg_ok", lang);
          overlay.querySelector("#regForm").reset();
          setTimeout(close, 2200);
        } else {
          statusEl.className = "form-status err";
          statusEl.textContent = L.t("reg_fail", lang);
          submitBtn.disabled = false;
        }
      });
    });
  }

  /* ---- Volunteer application + status check -------------------------- *
   * Separate from event sign-ups: this is applying to join JESS itself.
   * On submit the applicant gets a confirmation code (the Firestore
   * document ID) and is told to save it — that code is the only way
   * (besides asking staff) to look their status up again later, since
   * the site has no login for applicants and no backend to email them
   * automatically.
   * ------------------------------------------------------------------- */
  function openApplyModal() {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(L.t("apply_to_volunteer", lang))}">
        <button class="modal-close" aria-label="${esc(L.t("close", lang))}">&times;</button>
        <h3>${esc(L.t("apply_to_volunteer", lang))}</h3>
        <p class="panel-hint">${esc(L.t("apply_intro", lang))}</p>
        <form id="applyForm">
          <label for="apName">${esc(L.t("full_name", lang))}</label>
          <input id="apName" required autocomplete="name">
          <label for="apEmail">${esc(L.t("email", lang))}</label>
          <input id="apEmail" type="email" required autocomplete="email">
          <label for="apPhone">${esc(L.t("phone", lang))}</label>
          <input id="apPhone" autocomplete="tel">
          <label for="apSchool">${esc(L.t("school", lang))}</label>
          <input id="apSchool" autocomplete="organization">
          <label for="apRole">${esc(L.t("role", lang))}</label>
          <select id="apRole">
            <option value="volunteer">${esc(L.t("volunteer_teacher", lang))}</option>
            <option value="student">${esc(L.t("student_join", lang))}</option>
          </select>
          <div id="apDeptWrap">
            <label for="apDept">${esc(L.t("department", lang))}</label>
            <select id="apDept">
              <option value="" disabled selected>${esc(L.t("department_ph", lang))}</option>
              <option value="Academics">${esc(L.t("dept_academics", lang))}</option>
              <option value="Media and Marketing">${esc(L.t("dept_media", lang))}</option>
              <option value="Public Relations">${esc(L.t("dept_pr", lang))}</option>
              <option value="Internal Management">${esc(L.t("dept_internal", lang))}</option>
            </select>
          </div>
          <label for="apAvail">${esc(L.t("availability", lang))}</label>
          <input id="apAvail" placeholder="${esc(L.t("availability_ph", lang))}">
          <label for="apWhy">${esc(L.t("why_join", lang))}</label>
          <textarea id="apWhy" rows="3"></textarea>
          <button type="submit" class="btn btn-primary">${esc(L.t("send", lang))}</button>
          <p class="form-status" id="apStatus" role="status"></p>
        </form>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector(".modal-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    setTimeout(() => overlay.querySelector("#apName").focus(), 40);

    // Department only makes sense for a volunteer/member application, not
    // a student sign-up, so it's shown or hidden as that choice changes.
    const roleSel = overlay.querySelector("#apRole");
    const deptWrap = overlay.querySelector("#apDeptWrap");
    const syncDeptVisibility = () => { deptWrap.hidden = roleSel.value !== "volunteer"; };
    syncDeptVisibility();
    roleSel.addEventListener("change", syncDeptVisibility);

    overlay.querySelector("#applyForm").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const statusEl = overlay.querySelector("#apStatus");
      const submitBtn = overlay.querySelector("button[type=submit]");
      const name = overlay.querySelector("#apName").value.trim();
      const email = overlay.querySelector("#apEmail").value.trim();
      const roleVal = overlay.querySelector("#apRole").value;
      const deptVal = overlay.querySelector("#apDept").value;
      if (!name || !email || (roleVal === "volunteer" && !deptVal)) {
        statusEl.className = "form-status err";
        statusEl.textContent = L.t("required_fields", lang);
        return;
      }
      submitBtn.disabled = true;
      statusEl.className = "form-status";
      statusEl.textContent = L.t("sending", lang);

      L.submitApplication({
        name, email,
        phone: overlay.querySelector("#apPhone").value.trim(),
        school: overlay.querySelector("#apSchool").value.trim(),
        role: overlay.querySelector("#apRole").value,
        department: overlay.querySelector("#apDept").value,
        availability: overlay.querySelector("#apAvail").value.trim(),
        why: overlay.querySelector("#apWhy").value.trim()
      }).then((res) => {
        if (res.ok) {
          // Replace the form with the confirmation code rather than just
          // toasting it — this is the applicant's only way back in, so it
          // needs to stay on screen long enough to actually copy down.
          overlay.querySelector(".modal").innerHTML = `
            <button class="modal-close" aria-label="${esc(L.t("close", lang))}">&times;</button>
            <h3>${esc(L.t("apply_ok_title", lang))}</h3>
            <p>${esc(L.t("apply_ok_body", lang))}</p>
            <div class="confirm-code">${esc(res.code)}</div>
            <p class="panel-hint">${esc(L.t("apply_ok_hint", lang))}</p>
            <button type="button" class="btn btn-primary" id="apCopyCode">${esc(L.t("copy_code", lang))}</button>
          `;
          overlay.querySelector(".modal-close").addEventListener("click", close);
          overlay.querySelector("#apCopyCode").addEventListener("click", (e2) => {
            navigator.clipboard?.writeText(res.code).then(() => {
              e2.target.textContent = L.t("copied", lang);
            });
          });
        } else {
          statusEl.className = "form-status err";
          statusEl.textContent = L.t("reg_fail", lang);
          submitBtn.disabled = false;
        }
      });
    });
  }

  function openStatusModal() {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(L.t("check_status", lang))}">
        <button class="modal-close" aria-label="${esc(L.t("close", lang))}">&times;</button>
        <h3>${esc(L.t("check_status", lang))}</h3>
        <p class="panel-hint">${esc(L.t("check_status_hint", lang))}</p>
        <form id="statusForm">
          <label for="stCode">${esc(L.t("confirm_code", lang))}</label>
          <input id="stCode" required autocomplete="off">
          <button type="submit" class="btn btn-primary">${esc(L.t("check", lang))}</button>
        </form>
        <div id="statusResult"></div>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector(".modal-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    setTimeout(() => overlay.querySelector("#stCode").focus(), 40);

    overlay.querySelector("#statusForm").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const code = overlay.querySelector("#stCode").value.trim();
      const resultEl = overlay.querySelector("#statusResult");
      if (!code) return;
      resultEl.innerHTML = `<p class="panel-hint">${esc(L.t("sending", lang))}</p>`;
      L.getApplicationByCode(code).then((app) => {
        if (!app) {
          resultEl.innerHTML = `<p class="form-status err">${esc(L.t("code_not_found", lang))}</p>`;
          return;
        }
        const statusLabels = {
          pending: L.t("status_pending", lang),
          accepted: L.t("status_accepted", lang),
          declined: L.t("status_declined", lang)
        };
        const statusClass = { pending: "app-pending", accepted: "app-accepted", declined: "app-declined" }[app.status] || "app-pending";
        resultEl.innerHTML = `
          <div class="app-result ${statusClass}">
            <span class="app-status-label">${esc(statusLabels[app.status] || app.status)}</span>
            ${app.status === "accepted" ? `<p>${esc(L.t("check_email_notice", lang))}</p>` : ""}
            ${app.note ? `<p class="app-note">${esc(app.note)}</p>` : ""}
          </div>`;
      });
    });
  }

  const applyBtn = document.getElementById("openApplyBtn");
  if (applyBtn) applyBtn.addEventListener("click", openApplyModal);
  const statusBtn = document.getElementById("openStatusBtn");
  if (statusBtn) statusBtn.addEventListener("click", openStatusModal);

  function renderDayPanel() {
    const title = document.getElementById("dayPanelTitle");
    const list = document.getElementById("dayPanelEvents");
    if (!selectedDate) { title.textContent = L.t("select_date", lang); list.innerHTML = ""; return; }

    const d = new Date(selectedDate + "T00:00:00");
    title.textContent = d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const evs = eventsForDate(selectedDate);
    list.innerHTML = evs.length
      ? evs.map(e => `
        <div class="day-event" style="border-color:${e.color}">
          <strong>${esc(e.title)}</strong>
          ${e.time ? esc(e.time) + " · " : ""}${esc(e.location || "")}
          ${renderTags(e)}
          <div>${esc(e.desc || "")}</div>
          ${renderRegisterBtn(e)}
        </div>`).join("")
      : `<p class="day-empty-msg">${esc(L.t("no_events_day", lang))}</p>`;
  }

  document.getElementById("prevMonth").addEventListener("click", () => {
    calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  document.getElementById("nextMonth").addEventListener("click", () => {
    calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  function renderUpcoming() {
    const now = new Date();
    const upcoming = DATA.events
      .map(e => ({ ...e, _dt: new Date(e.date + "T" + (e.time || "00:00")) }))
      .filter(e => e._dt >= now || e.recurring !== "none")
      .sort((a, b) => a._dt - b._dt)
      .slice(0, 3);

    document.getElementById("upcomingGrid").innerHTML = upcoming.map(e => `
      <div class="upcoming-card fade-in-up visible" style="border-top-color:${e.color}" data-countdown="${e.date}T${e.time || '00:00'}">
        <div class="u-date">${new Date(e.date + "T00:00:00").toLocaleDateString(lang === "id" ? "id-ID" : undefined, { month: "short", day: "numeric", year: "numeric" })}</div>
        <h4>${esc(field(e, "title"))}</h4>
        <p style="margin:0 0 6px;font-size:0.85rem;">${esc(e.location || "")}</p>
        ${renderTags(e)}
        <div class="countdown"></div>
        ${renderRegisterBtn(e) || `<a href="#contact" class="btn btn-secondary btn-sm">${esc(L.t("register", lang))}</a>`}
      </div>`).join("") || `<p class="empty-note">${esc(L.t("no_upcoming", lang))}</p>`;

    updateCountdowns();
  }

  function updateCountdowns() {
    document.querySelectorAll("[data-countdown]").forEach(card => {
      const target = new Date(card.dataset.countdown);
      const cdEl = card.querySelector(".countdown");
      const diff = target - new Date();
      if (diff <= 0) { cdEl.innerHTML = `<div><div class="cd-num">${L.t("live", lang)}</div></div>`; return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      cdEl.innerHTML = `
        <div><div class="cd-num">${days}</div><div class="cd-label">${L.t("days", lang)}</div></div>
        <div><div class="cd-num">${hours}</div><div class="cd-label">${L.t("hrs", lang)}</div></div>
        <div><div class="cd-num">${mins}</div><div class="cd-label">${L.t("min", lang)}</div></div>`;
    });
  }
  setInterval(updateCountdowns, 60000);

  /* ------------------------------------------------------------------ *
   * TESTIMONIAL CAROUSEL
   * ------------------------------------------------------------------ */
  let testiIndex = 0;
  function renderTestimonials() {
    const vp = document.getElementById("testimonialViewport");
    const dots = document.getElementById("testiDots");
    if (testiIndex >= DATA.testimonials.length) testiIndex = 0;

    vp.innerHTML = DATA.testimonials.map((t, i) => `
      <div class="testimonial-slide ${i === testiIndex ? "active" : ""}">
        ${t.photo ? `<img class="testi-photo" src="${esc(t.photo)}" alt="${esc(t.name)}">` : `<div class="testi-photo" style="margin:0 auto 14px;"></div>`}
        <p class="testi-quote">&ldquo;${esc(t.review)}&rdquo;</p>
        <div class="testi-name">${esc(t.name)}</div>
        <div class="testi-school">${esc(t.school)}</div>
      </div>`).join("");

    dots.innerHTML = DATA.testimonials.map((_, i) => `<button class="${i === testiIndex ? "active" : ""}" data-i="${i}" aria-label="Go to testimonial ${i + 1}"></button>`).join("");
    dots.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { testiIndex = Number(b.dataset.i); renderTestimonials(); }));
  }
  document.getElementById("testiPrev").addEventListener("click", () => {
    testiIndex = (testiIndex - 1 + DATA.testimonials.length) % DATA.testimonials.length;
    renderTestimonials();
  });
  document.getElementById("testiNext").addEventListener("click", () => {
    testiIndex = (testiIndex + 1) % DATA.testimonials.length;
    renderTestimonials();
  });

  /* ------------------------------------------------------------------ *
   * CONTACT FORM — saves straight to Firestore (a "messages" collection
   * separate from the site's content). Visible in the admin portal's
   * Messages tab. The button never navigates anywhere — this always
   * stays on the page and just updates the status text inline.
   * ------------------------------------------------------------------ */
  document.getElementById("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const statusEl = document.getElementById("formStatus");
    const submitBtn = form.querySelector("button[type=submit]");

    // Simple spam trap: real visitors never fill this hidden field.
    if (form.querySelector("[name=bot-field]").value) {
      form.reset();
      statusEl.textContent = "Thanks — your message has been sent. We'll reply within a few days.";
      return;
    }

    const formData = new FormData(form);
    submitBtn.disabled = true;
    statusEl.textContent = "Sending…";

    window.JESSData.submitMessage({
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message")
    })
      .then((result) => {
        if (result.ok) {
          statusEl.textContent = "Thanks — your message has been sent. We'll reply within a few days.";
          form.reset();
        } else {
          statusEl.textContent = "Something went wrong sending that — please email us directly at " + DATA.contact.email + ".";
        }
      })
      .finally(() => { submitBtn.disabled = false; });
  });

  /* ------------------------------------------------------------------ *
   * INIT — subscribe to live data. Renders instantly from the local
   * cache (if any), then re-renders in real time whenever the admin
   * portal saves a change, on ANY device.
   * ------------------------------------------------------------------ */
  document.getElementById("footerYear").textContent = new Date().getFullYear();
  window.JESSData.subscribe((data) => {
    DATA = data;
    renderAll();
    observeFadeIns();
  });
  window.JESSData.trackVisit();
  window.JESSData.startPresenceHeartbeat();

  } // end main()

  // data.js may still be finishing its Firebase setup (which can involve a
  // slow or failed network request) when this script would otherwise run.
  // Wait for its explicit ready signal instead of assuming module load order.
  if (window.JESSData) {
    main();
  } else {
    window.addEventListener("jessdata-ready", main, { once: true });
  }

})();
