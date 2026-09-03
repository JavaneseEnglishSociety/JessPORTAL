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
    document.getElementById("heroTitle").textContent = DATA.hero.title;
    document.getElementById("heroSubtitle").textContent = DATA.hero.subtitle;
    document.getElementById("heroBtnPrimary").textContent = DATA.hero.primaryBtn;
    document.getElementById("heroBtnSecondary").textContent = DATA.hero.secondaryBtn;
  }

  function renderMission() {
    document.getElementById("visionText").textContent = DATA.mission.vision;
    document.getElementById("missionList").innerHTML = DATA.mission.missionList
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
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.desc)}</p>
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
    document.getElementById("partnersGrid").innerHTML = DATA.partners.map(p => `
      <a class="partner-logo fade-in-up visible" href="${esc(p.url || '#')}" target="_blank" rel="noopener">
        ${p.logo ? `<img src="${esc(p.logo)}" alt="${esc(p.name)}">` : `<span>${esc(p.name)}</span>`}
      </a>`).join("");
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

  function renderFaq() {
    document.getElementById("faqAccordion").innerHTML = DATA.faq.map((f, i) => `
      <div class="accordion-item" data-index="${i}">
        <button class="accordion-q">${esc(f.q)} </button>
        <div class="accordion-a"><p>${esc(f.a)}</p></div>
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
    document.getElementById("contactIntro").textContent = DATA.contact.intro;
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
    renderContact();
    renderCalendar();
    renderUpcoming();
    renderTestimonials();
    applyTheme();
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
      const dots = evs.slice(0, 4).map(e => `<span class="cal-dot" style="background:${e.color}"></span>`).join("");
      html += `<button type="button" class="cal-day ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}" data-key="${key}" role="gridcell" aria-label="${key}${evs.length ? ', ' + evs.length + ' events' : ''}">
        ${d}<div class="cal-dots">${dots}</div>
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

  function renderDayPanel() {
    const title = document.getElementById("dayPanelTitle");
    const list = document.getElementById("dayPanelEvents");
    if (!selectedDate) { title.textContent = "Select a day"; list.innerHTML = ""; return; }

    const d = new Date(selectedDate + "T00:00:00");
    title.textContent = d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const evs = eventsForDate(selectedDate);
    list.innerHTML = evs.length
      ? evs.map(e => `
        <div class="day-event" style="border-color:${e.color}">
          <strong>${esc(e.title)}</strong>
          ${e.time ? esc(e.time) + " · " : ""}${esc(e.location || "")}
          <div>${esc(e.desc || "")}</div>
        </div>`).join("")
      : `<p class="day-empty-msg">No events on this day.</p>`;
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
        <div class="u-date">${new Date(e.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div>
        <h4>${esc(e.title)}</h4>
        <p style="margin:0 0 6px;font-size:0.85rem;">${esc(e.location || "")}</p>
        <div class="countdown"></div>
        <a href="#contact" class="btn btn-secondary btn-sm">Register</a>
      </div>`).join("") || `<p>No upcoming events yet.</p>`;

    updateCountdowns();
  }

  function updateCountdowns() {
    document.querySelectorAll("[data-countdown]").forEach(card => {
      const target = new Date(card.dataset.countdown);
      const cdEl = card.querySelector(".countdown");
      const diff = target - new Date();
      if (diff <= 0) { cdEl.innerHTML = `<div><div class="cd-num">Live</div></div>`; return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      cdEl.innerHTML = `
        <div><div class="cd-num">${days}</div><div class="cd-label">Days</div></div>
        <div><div class="cd-num">${hours}</div><div class="cd-label">Hrs</div></div>
        <div><div class="cd-num">${mins}</div><div class="cd-label">Min</div></div>`;
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
