/* ==========================================================================
   JESS — Javanese English Speaking Society
   admin.js — Staff Admin Portal logic. Password-gated (session-based).
   Every panel reads/writes DATA and calls saveData(), which persists to the
   SAME localStorage key the public site (script.js) reads from.
   ========================================================================== */

(function () {
  "use strict";

  function main() {

  const { saveData: persist, uid } = window.JESSData;
  let DATA = null;
  let lastSaveFailureToastAt = 0;
  function saveData() {
    if (!DATA) return Promise.resolve(false);
    return persist(DATA).then((ok) => {
      // persist() resolves false when the write never reached Firestore
      // (permission error, session expired, offline, etc.) — the edit
      // still gets cached in THIS browser, which is exactly why changes
      // can look like they "worked" locally but never show up anywhere
      // else. Surface it instead of failing silently, but debounce so
      // typing in a text field doesn't spam a toast per keystroke.
      if (ok === false) {
        const now = Date.now();
        if (now - lastSaveFailureToastAt > 4000) {
          lastSaveFailureToastAt = now;
          toast("⚠️ Not saved to Firestore — you may be signed out, or offline. Refresh and log in again.");
        }
      }
      return ok;
    });
  }

  /* ------------------------------------------------------------------ *
   * TOAST
   * ------------------------------------------------------------------ */
  const toastEl = document.getElementById("toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  function esc(str) {
    const d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }

  // Photos are stored inline in the site's single Firestore document,
  // which has a 1MB total size limit. A raw phone photo alone can be
  // several MB, so every image is resized and compressed client-side
  // before it's saved — this is what makes photo uploads actually work
  // reliably instead of silently failing once the document gets too big.
  function compressImage(file, maxDim = 480, quality = 0.75) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) { reject(new Error("Not an image file")); return; }
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Could not read that image"));
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxDim) { height = Math.round(height * (maxDim / width)); width = maxDim; }
          else if (height > maxDim) { width = Math.round(width * (maxDim / height)); height = maxDim; }
          const canvas = document.createElement("canvas");
          canvas.width = width; canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ------------------------------------------------------------------ *
   * PASSWORD GATE (Firebase Authentication — enforced server-side by
   * Firestore's security rules, not just this client-side check)
   * ------------------------------------------------------------------ */
  const loginGate = document.getElementById("loginGate");
  const adminDashboard = document.getElementById("adminDashboard");

  function showDashboard() {
    loginGate.hidden = true;
    adminDashboard.hidden = false;
    renderAdminPanel("content");
  }
  function showGate(message) {
    adminDashboard.hidden = true;
    loginGate.hidden = false;
    document.getElementById("loginPassword").value = "";
    document.getElementById("loginStatus").textContent = message || "";
    setTimeout(() => document.getElementById("loginPassword").focus(), 50);
  }

  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const val = document.getElementById("loginPassword").value;
    const submitBtn = e.target.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    window.JESSData.login(val)
      .catch((err) => {
        console.warn("JESS admin login failed:", err);
        document.getElementById("loginStatus").textContent =
          !window.JESSData.firebaseReady()
            ? "Firebase isn't configured yet — see firebase-config.js."
            : "Incorrect password. Please try again.";
      })
      .finally(() => { submitBtn.disabled = false; });
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    window.JESSData.logout();
  });

  // Firebase tells us whenever sign-in state changes (initial load,
  // successful login, or logout) — this drives which screen is shown.
  window.JESSData.onAuthChange((user) => {
    if (user) {
      window.JESSData.loadOnce().then((data) => {
        DATA = data;
        showDashboard();
      });
    } else {
      showGate();
    }
  });


  /* ------------------------------------------------------------------ *
   * ADMIN NAV
   * ------------------------------------------------------------------ */
  const adminContent = document.getElementById("adminContent");

  document.getElementById("adminNav").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-panel]");
    if (!btn) return;
    document.querySelectorAll("#adminNav button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderAdminPanel(btn.dataset.panel);
  });

  function renderAdminPanel(name) {
    const panels = {
      content: panelContent,
      messages: panelMessages,
      stats: panelStats,
      programs: panelPrograms,
      events: panelEvents,
      team: panelTeam,
      testimonials: panelTestimonials,
      gallery: panelGallery,
      partners: panelPartners,
      faq: panelFaq,
      news: panelNews,
      applications: panelApplications,
      registrations: panelRegistrations,
      contact: panelContact,
      theme: panelTheme,
      data: panelData
    };
    adminContent.innerHTML = `<div class="admin-panel active"></div>`;
    (panels[name] || panelContent)(adminContent.querySelector(".admin-panel"));
  }

  /* ---- Content panel: hero + mission/vision ---- */
  function panelContent(root) {
    root.innerHTML = `
      <h2>Site Content</h2>
      <p class="panel-hint">Edit the hero section and mission &amp; vision text. Changes save instantly.</p>

      <div class="field-group"><label>Hero Title</label><input id="fHeroTitle" value="${esc(DATA.hero.title)}"></div>
      <div class="field-group"><label>Hero Subtitle</label><textarea id="fHeroSub" rows="2">${esc(DATA.hero.subtitle)}</textarea></div>
      <div class="field-row">
        <div class="field-group"><label>Primary Button Text</label><input id="fHeroBtn1" value="${esc(DATA.hero.primaryBtn)}"></div>
        <div class="field-group"><label>Secondary Button Text</label><input id="fHeroBtn2" value="${esc(DATA.hero.secondaryBtn)}"></div>
      </div>

      <div class="field-group"><label>Vision Statement</label><textarea id="fVision" rows="2">${esc(DATA.mission.vision)}</textarea></div>
      <div class="field-group"><label>Mission Points (one per line)</label><textarea id="fMission" rows="6">${esc(DATA.mission.missionList.join("\n"))}</textarea></div>

      <h3 style="font-size:1.05rem;margin:28px 0 4px;">Bahasa Indonesia</h3>
      <p class="panel-hint">Optional. Anything left blank falls back to the English text above, so you can translate a bit at a time without the site ever going blank.</p>
      <div class="field-group"><label>Hero Title (ID)</label><input id="fHeroTitleId" value="${esc(DATA.hero.title_id || "")}"></div>
      <div class="field-group"><label>Hero Subtitle (ID)</label><textarea id="fHeroSubId" rows="2">${esc(DATA.hero.subtitle_id || "")}</textarea></div>
      <div class="field-row">
        <div class="field-group"><label>Primary Button (ID)</label><input id="fHeroBtn1Id" value="${esc(DATA.hero.primaryBtn_id || "")}"></div>
        <div class="field-group"><label>Secondary Button (ID)</label><input id="fHeroBtn2Id" value="${esc(DATA.hero.secondaryBtn_id || "")}"></div>
      </div>
      <div class="field-group"><label>Vision Statement (ID)</label><textarea id="fVisionId" rows="2">${esc(DATA.mission.vision_id || "")}</textarea></div>
      <div class="field-group"><label>Mission Points (ID, one per line)</label><textarea id="fMissionId" rows="6">${esc((DATA.mission.missionList_id || []).join("\n"))}</textarea></div>

      <button class="btn btn-primary" id="saveContent">Save Changes</button>
    `;
    root.querySelector("#saveContent").addEventListener("click", () => {
      DATA.hero.title = root.querySelector("#fHeroTitle").value.trim() || DATA.hero.title;
      DATA.hero.subtitle = root.querySelector("#fHeroSub").value.trim();
      DATA.hero.primaryBtn = root.querySelector("#fHeroBtn1").value.trim();
      DATA.hero.secondaryBtn = root.querySelector("#fHeroBtn2").value.trim();
      DATA.mission.vision = root.querySelector("#fVision").value.trim();
      DATA.mission.missionList = root.querySelector("#fMission").value.split("\n").map(s => s.trim()).filter(Boolean);
      DATA.hero.title_id = root.querySelector("#fHeroTitleId").value.trim();
      DATA.hero.subtitle_id = root.querySelector("#fHeroSubId").value.trim();
      DATA.hero.primaryBtn_id = root.querySelector("#fHeroBtn1Id").value.trim();
      DATA.hero.secondaryBtn_id = root.querySelector("#fHeroBtn2Id").value.trim();
      DATA.mission.vision_id = root.querySelector("#fVisionId").value.trim();
      DATA.mission.missionList_id = root.querySelector("#fMissionId").value.split("\n").map(s => s.trim()).filter(Boolean);
      saveData();
      toast("Content saved.");
    });
  }

  /* ---- Messages panel: contact form submissions, deleted manually ---- */
  function panelMessages(root) {
    root.innerHTML = `
      <h2>Messages</h2>
      <p class="panel-hint">Contact form submissions from the public site. Read one, then delete it with the button below it — nothing is removed automatically.</p>
      <div id="msgLoading" style="color:var(--color-text-gray);font-size:0.9rem;">Loading messages…</div>
      <div class="admin-card-list" id="msgList"></div>
    `;

    function timeAgo(ts) {
      const d = new Date(ts);
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) +
        " at " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }

    function draw(messages) {
      root.querySelector("#msgLoading").remove();
      const listEl = root.querySelector("#msgList");
      if (!messages.length) {
        listEl.innerHTML = `<p class="panel-hint">No messages yet.</p>`;
        return;
      }
      listEl.innerHTML = messages.map((m) => `
        <div class="admin-item-card" data-id="${m.id}">
          <div class="admin-item-card-head">
            <strong>${esc(m.name || "(no name)")} — ${esc(m.email || "(no email)")}</strong>
            <div class="admin-item-actions"><button class="danger" data-del>Delete</button></div>
          </div>
          <div style="font-size:0.8rem;color:var(--color-text-gray);margin-bottom:8px;">${timeAgo(m.createdAt)}</div>
          <div style="font-size:0.92rem;white-space:pre-wrap;">${esc(m.message || "")}</div>
        </div>`).join("");

      listEl.querySelectorAll("[data-del]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.closest("[data-id]").dataset.id;
          if (confirm("Delete this message? This can't be undone.")) {
            window.JESSData.deleteMessage(id).then(() => {
              toast("Message deleted.");
              refresh();
            });
          }
        });
      });
    }

    function refresh() {
      window.JESSData.listMessages().then(draw);
    }

    refresh();
  }

  /* ---- Statistics panel ---- */
  function panelStats(root) {
    root.innerHTML = `
      <h2>Statistics</h2>

      <h3 style="font-size:1.05rem;margin-bottom:4px;">Live Traffic</h3>
      <p class="panel-hint">Real visitor numbers from the public site. "Online now" counts sessions that pinged in within the last 90 seconds.</p>
      <div class="stats-grid" id="liveStatsGrid" style="margin-bottom:14px;">
        <div class="stat-card"><div class="stat-number" id="lsVisits">…</div><div class="stat-label">Total Visits</div></div>
        <div class="stat-card"><div class="stat-number" id="lsOnline">…</div><div class="stat-label">Online Now</div></div>
        <div class="stat-card"><div class="stat-number" id="lsLastVisit" style="font-size:1rem;">…</div><div class="stat-label">Last Visit</div></div>
      </div>
      <div class="admin-toolbar">
        <button class="btn btn-outline" id="refreshLive">Refresh</button>
        <button class="btn btn-outline" id="clearStale">Clear sessions older than 24h</button>
      </div>

      <h3 style="font-size:1.05rem;margin:28px 0 4px;">Homepage Statistics</h3>
      <p class="panel-hint">Editable numbers shown in the About section.</p>
      <div class="admin-card-list" id="statsList"></div>
      <button class="btn btn-outline" id="addStat">+ Add Statistic</button>
    `;

    function fmtWhen(ts) {
      if (!ts) return "—";
      const diffMs = Date.now() - ts;
      if (diffMs < 60000) return "just now";
      if (diffMs < 3600000) return Math.floor(diffMs / 60000) + "m ago";
      if (diffMs < 86400000) return Math.floor(diffMs / 3600000) + "h ago";
      return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }

    function loadLiveStats() {
      root.querySelector("#lsVisits").textContent = "…";
      root.querySelector("#lsOnline").textContent = "…";
      Promise.all([
        window.JESSData.getAnalyticsTotals(),
        window.JESSData.listOnlinePresence()
      ]).then(([totals, presence]) => {
        root.querySelector("#lsVisits").textContent = (totals.visits || 0).toLocaleString();
        root.querySelector("#lsOnline").textContent = presence.onlineCount;
        root.querySelector("#lsLastVisit").textContent = fmtWhen(totals.lastVisitAt);
      });
    }
    loadLiveStats();
    const liveRefreshTimer = setInterval(loadLiveStats, 15000);
    // Stop polling once this panel is no longer on screen (switching tabs
    // re-renders #adminContent, which detaches this node from the DOM).
    const stopWhenGone = new MutationObserver(() => {
      if (!document.body.contains(root)) { clearInterval(liveRefreshTimer); stopWhenGone.disconnect(); }
    });
    stopWhenGone.observe(document.getElementById("adminContent"), { childList: true, subtree: true });

    root.querySelector("#refreshLive").addEventListener("click", loadLiveStats);
    root.querySelector("#clearStale").addEventListener("click", () => {
      root.querySelector("#clearStale").disabled = true;
      window.JESSData.clearStalePresence().then((count) => {
        toast(count ? `Cleared ${count} old session${count === 1 ? "" : "s"}.` : "No old sessions to clear.");
        root.querySelector("#clearStale").disabled = false;
        loadLiveStats();
      });
    });

    function draw() {
      root.querySelector("#statsList").innerHTML = DATA.stats.map((s, i) => `
        <div class="admin-item-card" data-i="${i}">
          <div class="field-row">
            <div class="field-group"><label>Number</label><input data-f="number" value="${esc(s.number)}"></div>
            <div class="field-group"><label>Label</label><input data-f="label" value="${esc(s.label)}"></div>
          </div>
          <div class="admin-item-actions"><button class="danger" data-del>Remove</button></div>
        </div>`).join("");
      root.querySelectorAll("#statsList .admin-item-card").forEach(card => {
        const i = Number(card.dataset.i);
        card.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => {
          DATA.stats[i][inp.dataset.f] = inp.value; saveData();
        }));
        card.querySelector("[data-del]").addEventListener("click", () => {
          DATA.stats.splice(i, 1); saveData(); draw(); toast("Statistic removed.");
        });
      });
    }
    draw();
    root.querySelector("#addStat").addEventListener("click", () => {
      DATA.stats.push({ id: uid(), number: "0+", label: "New Stat" });
      saveData(); draw();
    });
  }

  /* ---- Programs panel ---- */
  function panelPrograms(root) {
    root.innerHTML = `
      <h2>Programs</h2>
      <p class="panel-hint">The program cards shown on the homepage.</p>
      <div class="admin-card-list" id="progList"></div>
      <button class="btn btn-outline" id="addProg">+ Add Program</button>
    `;
    function draw() {
      root.querySelector("#progList").innerHTML = DATA.programs.map((p, i) => `
        <div class="admin-item-card" data-i="${i}">
          <div class="field-row">
            <div class="field-group"><label>Icon (emoji)</label><input data-f="icon" value="${esc(p.icon)}"></div>
            <div class="field-group"><label>Title</label><input data-f="title" value="${esc(p.title)}"></div>
          </div>
          <div class="field-group"><label>Description</label><input data-f="desc" value="${esc(p.desc)}"></div>
          <div class="field-row">
            <div class="field-group"><label>Title (ID) <span class="opt">optional</span></label><input data-f="title_id" value="${esc(p.title_id || "")}"></div>
            <div class="field-group"><label>Description (ID) <span class="opt">optional</span></label><input data-f="desc_id" value="${esc(p.desc_id || "")}"></div>
          </div>
          <div class="admin-item-actions"><button class="danger" data-del>Remove</button></div>
        </div>`).join("");
      root.querySelectorAll("#progList .admin-item-card").forEach(card => {
        const i = Number(card.dataset.i);
        card.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => {
          DATA.programs[i][inp.dataset.f] = inp.value; saveData();
        }));
        card.querySelector("[data-del]").addEventListener("click", () => {
          DATA.programs.splice(i, 1); saveData(); draw(); toast("Program removed.");
        });
      });
    }
    draw();
    root.querySelector("#addProg").addEventListener("click", () => {
      DATA.programs.push({ id: uid(), icon: "📘", title: "New Program", desc: "Description here." });
      saveData(); draw();
    });
  }

  /* ---- Events panel (add/edit/delete/filter/search/color/recurring) ---- */
  let eventFilter = "";
  function panelEvents(root) {
    root.innerHTML = `
      <h2>Events</h2>
      <p class="panel-hint">Manage the events calendar shown on the public site. Recurring events repeat weekly or monthly from their start date.</p>
      <div class="admin-toolbar">
        <input type="search" id="eventSearch" placeholder="Search events…" value="${esc(eventFilter)}">
        <button class="btn btn-primary" id="addEvt">+ Add Event</button>
      </div>
      <div class="admin-card-list" id="evtList"></div>
    `;
    function draw() {
      const q = eventFilter.toLowerCase();
      const list = DATA.events
        .filter(e => !q || e.title.toLowerCase().includes(q) || (e.location || "").toLowerCase().includes(q))
        .sort((a, b) => a.date.localeCompare(b.date));

      root.querySelector("#evtList").innerHTML = list.map(e => `
        <div class="admin-item-card" data-id="${e.id}">
          <div class="admin-item-card-head">
            <strong style="color:${e.color}">● ${esc(e.title)}</strong>
            <div class="admin-item-actions">
              <button data-edit>Edit</button>
              <button class="danger" data-del>Delete</button>
            </div>
          </div>
          <div style="font-size:0.85rem;color:var(--color-text-gray)">${e.date} ${e.time || ""} · ${esc(e.location || "")} ${e.recurring !== "none" ? "· recurring " + e.recurring : ""}</div>
          ${(e.tags && e.tags.length) || (e.registration && e.registration.enabled) ? `
          <div class="tag-row">
            ${(e.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join("")}
            ${e.registration && e.registration.enabled
              ? `<span class="tag tag-reg">${e.registration.closed ? "Sign-ups closed" : "Sign-ups open"}</span>` : ""}
          </div>` : ""}
        </div>`).join("") || `<p class="panel-hint">No events match.</p>`;

      root.querySelectorAll("#evtList [data-edit]").forEach(b => b.addEventListener("click", () => openEventEditor(b.closest("[data-id]").dataset.id, draw)));
      root.querySelectorAll("#evtList [data-del]").forEach(b => b.addEventListener("click", () => {
        const id = b.closest("[data-id]").dataset.id;
        if (confirm("Delete this event?")) {
          DATA.events = DATA.events.filter(e => e.id !== id);
          saveData(); draw(); toast("Event deleted.");
        }
      }));
    }
    draw();
    root.querySelector("#eventSearch").addEventListener("input", (e) => { eventFilter = e.target.value; draw(); });
    root.querySelector("#addEvt").addEventListener("click", () => openEventEditor(null, draw));
  }

  function openEventEditor(id, onDone) {
    const TAGS = window.JESSData.EVENT_TAGS;
    const existing = id ? DATA.events.find(e => e.id === id) : null;
    const today = new Date();
    const ev = existing || {
      id: uid(), title: "",
      date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
      time: "09:00", desc: "", location: "", color: "#2F9E63", recurring: "none",
      title_id: "", tags: [],
      registration: { enabled: false, mode: "form", url: "", askWhy: false, closed: false }
    };

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal">
        <button class="modal-close" aria-label="Close">&times;</button>
        <h3>${existing ? "Edit Event" : "Add Event"}</h3>
        <form id="eventForm">
          <label>Title</label><input required id="evTitle" value="${esc(ev.title)}">
          <div class="field-row">
            <div><label>Date</label><input required type="date" id="evDate" value="${ev.date}"></div>
            <div><label>Time</label><input type="time" id="evTime" value="${ev.time}"></div>
          </div>
          <label>Title (Bahasa Indonesia) <span class="opt">optional</span></label>
          <input id="evTitleId" value="${esc(ev.title_id || "")}" placeholder="Leave blank to reuse the English title">
          <label>Location</label><input id="evLocation" value="${esc(ev.location)}">
          <label>Description</label><input id="evDesc" value="${esc(ev.desc)}">

          <label>Markers</label>
          <div class="tag-picker">
            ${TAGS.map(tag => `
              <label class="tag-check">
                <input type="checkbox" value="${esc(tag)}" ${(ev.tags || []).includes(tag) ? "checked" : ""}>
                <span>${esc(tag)}</span>
              </label>`).join("")}
          </div>

          <label class="switch-row">
            <input type="checkbox" id="evRegEnabled" ${ev.registration && ev.registration.enabled ? "checked" : ""}>
            <span>Let people sign up for this event</span>
          </label>
          <div id="regOptions" ${ev.registration && ev.registration.enabled ? "" : "hidden"}>
            <label>Sign-up handled by</label>
            <select id="evRegMode">
              <option value="form" ${!ev.registration || ev.registration.mode !== "link" ? "selected" : ""}>A form on this site (collects sign-ups here, visible in the Sign-ups panel)</option>
              <option value="link" ${ev.registration && ev.registration.mode === "link" ? "selected" : ""}>Google Form (or any other link)</option>
            </select>
            <div id="regUrlWrap" ${ev.registration && ev.registration.mode === "link" ? "" : "hidden"}>
              <label>Google Form link</label>
              <input id="evRegUrl" type="url" value="${esc((ev.registration && ev.registration.url) || "")}" placeholder="https://forms.gle/… or https://docs.google.com/forms/…">
              <p class="field-note">Open your Google Form, click Send, copy the link, and paste it here. The Register button will open it in a new tab.</p>
            </div>
            <label class="switch-row">
              <input type="checkbox" id="evRegAskWhy" ${ev.registration && ev.registration.askWhy ? "checked" : ""}>
              <span>Ask why they want to join</span>
            </label>
            <label class="switch-row">
              <input type="checkbox" id="evRegClosed" ${ev.registration && ev.registration.closed ? "checked" : ""}>
              <span>Close sign-ups (keeps the event visible)</span>
            </label>
          </div>
          <div class="field-row">
            <div><label>Color</label><input type="color" id="evColor" value="${ev.color}"></div>
            <div><label>Recurring</label>
              <select id="evRecurring">
                <option value="none" ${ev.recurring === "none" ? "selected" : ""}>None</option>
                <option value="weekly" ${ev.recurring === "weekly" ? "selected" : ""}>Weekly</option>
                <option value="monthly" ${ev.recurring === "monthly" ? "selected" : ""}>Monthly</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-primary">${existing ? "Save Event" : "Add Event"}</button>
        </form>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector(".modal-close").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });

    // Show the sign-up options only when sign-ups are switched on, and the
    // URL field only when an external form is chosen.
    const regChk = overlay.querySelector("#evRegEnabled");
    const regOpts = overlay.querySelector("#regOptions");
    const regMode = overlay.querySelector("#evRegMode");
    const regUrlWrap = overlay.querySelector("#regUrlWrap");
    regChk.addEventListener("change", () => { regOpts.hidden = !regChk.checked; });
    regMode.addEventListener("change", () => { regUrlWrap.hidden = regMode.value !== "link"; });

    overlay.querySelector("#eventForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const tags = Array.from(overlay.querySelectorAll(".tag-picker input:checked"))
        .map(cb => cb.value);
      const regEnabled = overlay.querySelector("#evRegEnabled").checked;
      const regModeVal = overlay.querySelector("#evRegMode").value;
      const regUrlVal = overlay.querySelector("#evRegUrl") ? overlay.querySelector("#evRegUrl").value.trim() : "";
      if (regEnabled && regModeVal === "link" && !regUrlVal) {
        alert("Add the Google Form link, or switch sign-up back to \"A form on this site\".");
        return;
      }
      const updated = {
        // Spread the existing event first so any field this form does not
        // manage (now or in future) survives the edit untouched.
        ...(existing || ev),
        id: ev.id,
        title: overlay.querySelector("#evTitle").value.trim(),
        title_id: overlay.querySelector("#evTitleId").value.trim(),
        date: overlay.querySelector("#evDate").value,
        time: overlay.querySelector("#evTime").value,
        location: overlay.querySelector("#evLocation").value.trim(),
        desc: overlay.querySelector("#evDesc").value.trim(),
        color: overlay.querySelector("#evColor").value,
        recurring: overlay.querySelector("#evRecurring").value,
        tags,
        registration: {
          enabled: regEnabled,
          mode: overlay.querySelector("#evRegMode").value === "link" ? "link" : "form",
          url: overlay.querySelector("#evRegUrl") ? overlay.querySelector("#evRegUrl").value.trim() : "",
          askWhy: overlay.querySelector("#evRegAskWhy").checked,
          closed: overlay.querySelector("#evRegClosed").checked
        }
      };
      if (existing) {
        Object.assign(existing, updated);
      } else {
        DATA.events.push(updated);
      }
      saveData();
      overlay.remove();
      toast(existing ? "Event updated." : "Event added.");
      if (onDone) onDone();
    });
  }

  /* ---- Team panel (add/remove/photo/reorder) ---- */
  function panelTeam(root) {
    root.innerHTML = `
      <h2>Team</h2>
      <p class="panel-hint">Add unlimited team members. Use the arrows to reorder.</p>
      <div class="admin-card-list" id="teamList"></div>
      <button class="btn btn-outline" id="addMember">+ Add Team Member</button>
    `;
    function draw() {
      root.querySelector("#teamList").innerHTML = DATA.team.map((m, i) => `
        <div class="admin-item-card" data-i="${i}">
          <div class="field-row">
            <div class="field-group"><label>Name</label><input data-f="name" value="${esc(m.name)}"></div>
            <div class="field-group"><label>Role</label><input data-f="role" value="${esc(m.role)}"></div>
          </div>
          <div class="field-group"><label>Description</label><input data-f="desc" value="${esc(m.desc)}"></div>
          <div class="field-row">
            <div class="field-group"><label>Instagram URL</label><input data-f="ig" value="${esc(m.ig)}"></div>
            <div class="field-group"><label>LinkedIn URL</label><input data-f="linkedin" value="${esc(m.linkedin)}"></div>
          </div>
          <div class="field-group"><label>Photo</label><input type="file" accept="image/*" data-photo></div>
          <div class="admin-item-actions">
            <button class="move" data-up>↑ Move up</button>
            <button class="move" data-down>↓ Move down</button>
            <button class="danger" data-del>Remove</button>
          </div>
        </div>`).join("");

      root.querySelectorAll("#teamList .admin-item-card").forEach(card => {
        const i = Number(card.dataset.i);
        card.querySelectorAll("input[data-f]").forEach(inp => inp.addEventListener("input", () => {
          DATA.team[i][inp.dataset.f] = inp.value; saveData();
        }));
        card.querySelector("[data-photo]").addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (!file) return;
          toast("Processing photo…");
          compressImage(file).then((url) => {
            DATA.team[i].photo = url;
            saveData().then((ok) => toast(ok === false ? "Saved locally, but couldn't reach Firestore — check your connection." : "Photo updated."));
          }).catch(() => toast("Couldn't process that image — try a different file."));
        });
        card.querySelector("[data-del]").addEventListener("click", () => {
          DATA.team.splice(i, 1); saveData(); draw(); toast("Team member removed.");
        });
        card.querySelector("[data-up]").addEventListener("click", () => {
          if (i > 0) { [DATA.team[i - 1], DATA.team[i]] = [DATA.team[i], DATA.team[i - 1]]; saveData(); draw(); }
        });
        card.querySelector("[data-down]").addEventListener("click", () => {
          if (i < DATA.team.length - 1) { [DATA.team[i + 1], DATA.team[i]] = [DATA.team[i], DATA.team[i + 1]]; saveData(); draw(); }
        });
      });
    }
    draw();
    root.querySelector("#addMember").addEventListener("click", () => {
      DATA.team.push({ id: uid(), name: "New Member", role: "Role", desc: "Description here.", photo: "", ig: "#", linkedin: "#" });
      saveData(); draw();
    });
  }

  /* ---- Testimonials panel ---- */
  function panelTestimonials(root) {
    root.innerHTML = `
      <h2>Testimonials</h2>
      <p class="panel-hint">Shown in the carousel on the homepage.</p>
      <div class="admin-card-list" id="testiList"></div>
      <button class="btn btn-outline" id="addTesti">+ Add Testimonial</button>
    `;
    function draw() {
      root.querySelector("#testiList").innerHTML = DATA.testimonials.map((t, i) => `
        <div class="admin-item-card" data-i="${i}">
          <div class="field-row">
            <div class="field-group"><label>Name</label><input data-f="name" value="${esc(t.name)}"></div>
            <div class="field-group"><label>School</label><input data-f="school" value="${esc(t.school)}"></div>
          </div>
          <div class="field-group"><label>Review</label><textarea rows="2" data-f="review">${esc(t.review)}</textarea></div>
          <div class="field-group"><label>Photo</label><input type="file" accept="image/*" data-photo></div>
          <div class="admin-item-actions"><button class="danger" data-del>Remove</button></div>
        </div>`).join("");

      root.querySelectorAll("#testiList .admin-item-card").forEach(card => {
        const i = Number(card.dataset.i);
        card.querySelectorAll("[data-f]").forEach(inp => inp.addEventListener("input", () => {
          DATA.testimonials[i][inp.dataset.f] = inp.value; saveData();
        }));
        card.querySelector("[data-photo]").addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (!file) return;
          toast("Processing photo…");
          compressImage(file).then((url) => {
            DATA.testimonials[i].photo = url;
            saveData().then((ok) => toast(ok === false ? "Saved locally, but couldn't reach Firestore — check your connection." : "Photo updated."));
          }).catch(() => toast("Couldn't process that image — try a different file."));
        });
        card.querySelector("[data-del]").addEventListener("click", () => {
          DATA.testimonials.splice(i, 1); saveData(); draw(); toast("Testimonial removed.");
        });
      });
    }
    draw();
    root.querySelector("#addTesti").addEventListener("click", () => {
      DATA.testimonials.push({ id: uid(), name: "New Student", school: "School Name", review: "Review text.", photo: "" });
      saveData(); draw();
    });
  }

  /* ---- Gallery panel ---- */
  function panelGallery(root) {
    root.innerHTML = `
      <h2>Gallery</h2>
      <p class="panel-hint">Upload images and captions for the masonry gallery.</p>
      <div class="admin-card-list" id="galList"></div>
      <button class="btn btn-outline" id="addGal">+ Add Image</button>
    `;
    function draw() {
      root.querySelector("#galList").innerHTML = DATA.gallery.map((g, i) => `
        <div class="admin-item-card" data-i="${i}">
          <div class="field-group"><label>Caption</label><input data-f="caption" value="${esc(g.caption)}"></div>
          <div class="field-group"><label>Image</label><input type="file" accept="image/*" data-photo></div>
          <div class="admin-item-actions">
            <button class="move" data-up>↑</button>
            <button class="move" data-down>↓</button>
            <button class="danger" data-del>Remove</button>
          </div>
        </div>`).join("");

      root.querySelectorAll("#galList .admin-item-card").forEach(card => {
        const i = Number(card.dataset.i);
        card.querySelector("[data-f]").addEventListener("input", (e) => {
          DATA.gallery[i].caption = e.target.value; saveData();
        });
        card.querySelector("[data-photo]").addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (!file) return;
          toast("Processing image…");
          compressImage(file, 640, 0.75).then((url) => {
            DATA.gallery[i].img = url;
            saveData().then((ok) => toast(ok === false ? "Saved locally, but couldn't reach Firestore — check your connection." : "Image updated."));
          }).catch(() => toast("Couldn't process that image — try a different file."));
        });
        card.querySelector("[data-del]").addEventListener("click", () => {
          DATA.gallery.splice(i, 1); saveData(); draw(); toast("Image removed.");
        });
        card.querySelector("[data-up]").addEventListener("click", () => {
          if (i > 0) { [DATA.gallery[i - 1], DATA.gallery[i]] = [DATA.gallery[i], DATA.gallery[i - 1]]; saveData(); draw(); }
        });
        card.querySelector("[data-down]").addEventListener("click", () => {
          if (i < DATA.gallery.length - 1) { [DATA.gallery[i + 1], DATA.gallery[i]] = [DATA.gallery[i], DATA.gallery[i + 1]]; saveData(); draw(); }
        });
      });
    }
    draw();
    root.querySelector("#addGal").addEventListener("click", () => {
      DATA.gallery.push({ id: uid(), img: "", caption: "New photo" });
      saveData(); draw();
    });
  }

  /* ---- Partners panel ---- */
  function panelPartners(root) {
    root.innerHTML = `
      <h2>Partners</h2>
      <p class="panel-hint">Partner logos link out to their websites.</p>
      <div class="admin-card-list" id="partList"></div>
      <button class="btn btn-outline" id="addPart">+ Add Partner</button>
    `;
    function draw() {
      root.querySelector("#partList").innerHTML = DATA.partners.map((p, i) => `
        <div class="admin-item-card" data-i="${i}">
          <div class="field-row">
            <div class="field-group"><label>Name</label><input data-f="name" value="${esc(p.name)}"></div>
            <div class="field-group"><label>Website URL</label><input data-f="url" value="${esc(p.url)}"></div>
          </div>
          <div class="field-group"><label>Logo</label><input type="file" accept="image/*" data-photo></div>
          <div class="admin-item-actions">
            <button class="move" data-up>↑</button>
            <button class="move" data-down>↓</button>
            <button class="danger" data-del>Remove</button>
          </div>
        </div>`).join("");

      root.querySelectorAll("#partList .admin-item-card").forEach(card => {
        const i = Number(card.dataset.i);
        card.querySelectorAll("[data-f]").forEach(inp => inp.addEventListener("input", () => {
          DATA.partners[i][inp.dataset.f] = inp.value; saveData();
        }));
        card.querySelector("[data-photo]").addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (!file) return;
          toast("Processing logo…");
          compressImage(file, 320, 0.8).then((url) => {
            DATA.partners[i].logo = url;
            saveData().then((ok) => toast(ok === false ? "Saved locally, but couldn't reach Firestore — check your connection." : "Logo updated."));
          }).catch(() => toast("Couldn't process that image — try a different file."));
        });
        card.querySelector("[data-del]").addEventListener("click", () => {
          DATA.partners.splice(i, 1); saveData(); draw(); toast("Partner removed.");
        });
        card.querySelector("[data-up]").addEventListener("click", () => {
          if (i > 0) { [DATA.partners[i - 1], DATA.partners[i]] = [DATA.partners[i], DATA.partners[i - 1]]; saveData(); draw(); }
        });
        card.querySelector("[data-down]").addEventListener("click", () => {
          if (i < DATA.partners.length - 1) { [DATA.partners[i + 1], DATA.partners[i]] = [DATA.partners[i], DATA.partners[i + 1]]; saveData(); draw(); }
        });
      });
    }
    draw();
    root.querySelector("#addPart").addEventListener("click", () => {
      DATA.partners.push({ id: uid(), name: "New Partner", url: "#", logo: "" });
      saveData(); draw();
    });
  }

  /* ---- FAQ panel ---- */
  function panelFaq(root) {
    root.innerHTML = `
      <h2>FAQ</h2>
      <p class="panel-hint">Frequently asked questions shown as an accordion.</p>
      <div class="admin-card-list" id="faqList"></div>
      <button class="btn btn-outline" id="addFaq">+ Add Question</button>
    `;
    function draw() {
      root.querySelector("#faqList").innerHTML = DATA.faq.map((f, i) => `
        <div class="admin-item-card" data-i="${i}">
          <div class="field-group"><label>Question</label><input data-f="q" value="${esc(f.q)}"></div>
          <div class="field-group"><label>Answer</label><textarea rows="2" data-f="a">${esc(f.a)}</textarea></div>
          <div class="field-group"><label>Question (ID) <span class="opt">optional</span></label><input data-f="q_id" value="${esc(f.q_id || "")}"></div>
          <div class="field-group"><label>Answer (ID) <span class="opt">optional</span></label><textarea rows="2" data-f="a_id">${esc(f.a_id || "")}</textarea></div>
          <div class="admin-item-actions"><button class="danger" data-del>Remove</button></div>
        </div>`).join("");
      root.querySelectorAll("#faqList .admin-item-card").forEach(card => {
        const i = Number(card.dataset.i);
        card.querySelectorAll("[data-f]").forEach(inp => inp.addEventListener("input", () => {
          DATA.faq[i][inp.dataset.f] = inp.value; saveData();
        }));
        card.querySelector("[data-del]").addEventListener("click", () => {
          DATA.faq.splice(i, 1); saveData(); draw(); toast("Question removed.");
        });
      });
    }
    draw();
    root.querySelector("#addFaq").addEventListener("click", () => {
      DATA.faq.push({ id: uid(), q: "New question?", a: "Answer here." });
      saveData(); draw();
    });
  }

  /* ---- News panel ---- */
  function panelNews(root) {
    root.innerHTML = `
      <h2>News</h2>
      <p class="panel-hint">Short updates shown on the homepage, newest first. Untick "Published" to draft a post without showing it publicly.</p>
      <div class="admin-card-list" id="newsList"></div>
      <button class="btn btn-outline" id="addNews">+ Add post</button>
    `;
    function draw() {
      const posts = DATA.news.slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
      root.querySelector("#newsList").innerHTML = posts.length ? posts.map((n) => `
        <div class="admin-item-card" data-id="${n.id}">
          <div class="field-row">
            <div class="field-group"><label>Title</label><input data-f="title" value="${esc(n.title)}"></div>
            <div class="field-group"><label>Date</label><input type="date" data-f="date" value="${esc(n.date)}"></div>
          </div>
          <div class="field-group"><label>Body</label><textarea rows="4" data-f="body">${esc(n.body)}</textarea></div>
          <div class="field-group">
            <label>Title (Bahasa Indonesia) <span class="opt">optional</span></label>
            <input data-f="title_id" value="${esc(n.title_id || "")}" placeholder="Leave blank to reuse the English title">
          </div>
          <div class="field-group">
            <label>Body (Bahasa Indonesia) <span class="opt">optional</span></label>
            <textarea rows="4" data-f="body_id" placeholder="Leave blank to reuse the English body">${esc(n.body_id || "")}</textarea>
          </div>
          <label class="switch-row">
            <input type="checkbox" data-pub ${n.published !== false ? "checked" : ""}>
            <span>Published</span>
          </label>
          <div class="admin-item-actions"><button class="danger" data-del>Remove</button></div>
        </div>`).join("") : `<p class="panel-hint">No posts yet.</p>`;

      root.querySelectorAll("#newsList .admin-item-card").forEach(card => {
        const id = card.dataset.id;
        const item = DATA.news.find(x => String(x.id) === String(id));
        if (!item) return;
        card.querySelectorAll("[data-f]").forEach(inp => inp.addEventListener("input", () => {
          item[inp.dataset.f] = inp.value; saveData();
        }));
        card.querySelector("[data-pub]").addEventListener("change", (e) => {
          item.published = e.target.checked; saveData();
        });
        card.querySelector("[data-del]").addEventListener("click", () => {
          if (!confirm("Remove this post?")) return;
          DATA.news = DATA.news.filter(x => String(x.id) !== String(id));
          saveData(); draw(); toast("Post removed.");
        });
      });
    }
    draw();
    root.querySelector("#addNews").addEventListener("click", () => {
      const today = new Date();
      const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      DATA.news.push({ id: uid(), title: "New post", date: iso, body: "", published: true, title_id: "", body_id: "" });
      saveData(); draw();
    });
  }

  /* ---- Volunteer Applications panel ---- */
  function panelApplications(root) {
    root.innerHTML = `
      <h2>Volunteer applications</h2>
      <p class="panel-hint">People who applied to join JESS. Accept or decline, optionally leave a note, and use "Email applicant" to send them the real email — this site has no backend to send mail automatically, so that button just opens your email client with the message already written.</p>
      <div class="admin-toolbar" id="appTabs">
        <button type="button" class="tab-btn active" data-tab="pending">Pending</button>
        <button type="button" class="tab-btn" data-tab="accepted">Accepted</button>
        <button type="button" class="tab-btn" data-tab="declined">Declined</button>
        <button type="button" class="tab-btn" data-tab="all">All</button>
        <input type="search" id="appSearch" placeholder="Search by name or email…" style="margin-left:auto;">
      </div>
      <div id="appLoading" style="color:var(--color-text-gray);font-size:0.9rem;">Loading applications…</div>
      <div class="admin-card-list" id="appList"></div>
    `;
    let all = [];
    let tab = "pending";
    let filter = "";

    function when(ts) {
      if (!ts) return "";
      const d = new Date(ts);
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) +
        " at " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }

    function emailTemplate(app) {
      const subject = app.status === "accepted"
        ? "Welcome to JESS!"
        : app.status === "declined"
        ? "Your JESS application"
        : "Your JESS application";
      const body = app.status === "accepted"
        ? `Hi ${app.name},\n\nGreat news — you've been accepted to JESS! ${app.note ? app.note + "\n\n" : ""}We'll follow up here with next steps.\n\nWelcome aboard,\nJESS`
        : app.status === "declined"
        ? `Hi ${app.name},\n\nThank you for applying to JESS. ${app.note ? app.note + " " : ""}We're not able to bring you on this round, but we'd love to see you apply again in future.\n\nThank you,\nJESS`
        : `Hi ${app.name},\n\nThanks for applying to JESS — we're reviewing your application and will be in touch soon.\n\nJESS`;
      return `mailto:${encodeURIComponent(app.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    function draw() {
      const q = filter.toLowerCase();
      let rows = tab === "all" ? all : all.filter(a => (a.status || "pending") === tab);
      rows = rows.filter(a => !q || (a.name || "").toLowerCase().includes(q) || (a.email || "").toLowerCase().includes(q));

      const listEl = root.querySelector("#appList");
      if (!rows.length) {
        listEl.innerHTML = `<p class="panel-hint">Nothing here.</p>`;
        return;
      }
      listEl.innerHTML = rows.map(a => `
        <div class="admin-item-card" data-id="${a.id}">
          <div class="admin-item-card-head">
            <strong>${esc(a.name || "(no name)")}</strong>
            <span class="tag app-tag-${a.status || "pending"}">${esc((a.status || "pending"))}</span>
          </div>
          <div class="tag-row">
            <span class="tag">${a.role === "volunteer" ? "Volunteer teacher" : "Student"}</span>
          </div>
          <div style="font-size:0.9rem;margin-top:8px;">
            ${esc(a.email || "")}${a.phone ? " · " + esc(a.phone) : ""}${a.school ? " · " + esc(a.school) : ""}
          </div>
          ${a.availability ? `<div style="font-size:0.9rem;margin-top:4px;"><strong>Availability:</strong> ${esc(a.availability)}</div>` : ""}
          ${a.why ? `<div style="font-size:0.92rem;margin-top:8px;white-space:pre-wrap;">${esc(a.why)}</div>` : ""}
          <div style="font-size:0.8rem;color:var(--color-text-gray);margin-top:8px;">Applied ${when(a.createdAt)}${a.reviewedAt ? " · Reviewed " + when(a.reviewedAt) : ""}</div>

          <div class="field-group" style="margin-top:14px;">
            <label>Note to applicant <span class="opt">shown to them + used in the email</span></label>
            <textarea rows="2" data-note>${esc(a.note || "")}</textarea>
          </div>

          <div class="admin-item-actions">
            <button data-status="accepted" class="${a.status === "accepted" ? "" : ""}">Accept</button>
            <button data-status="declined">Decline</button>
            <button data-status="pending">Reset to pending</button>
            <a data-mailto href="${esc(emailTemplate(a))}">Email applicant</a>
            <button class="danger" data-del>Delete</button>
          </div>
        </div>`).join("");

      listEl.querySelectorAll(".admin-item-card").forEach(card => {
        const id = card.dataset.id;
        const app = all.find(x => String(x.id) === String(id));
        if (!app) return;

        card.querySelectorAll("[data-status]").forEach(btn => {
          btn.addEventListener("click", () => {
            const note = card.querySelector("[data-note]").value.trim();
            window.JESSData.updateApplicationStatus(id, btn.dataset.status, note).then((ok) => {
              if (ok) {
                app.status = btn.dataset.status;
                app.note = note;
                app.reviewedAt = Date.now();
                toast(`Marked ${btn.dataset.status}.`);
                draw();
              } else {
                toast("Couldn't update — check your connection.");
              }
            });
          });
        });
        card.querySelector("[data-del]").addEventListener("click", () => {
          if (!confirm("Delete this application? This can't be undone.")) return;
          window.JESSData.deleteApplication(id).then(() => {
            all = all.filter(x => x.id !== id);
            toast("Deleted.");
            draw();
          });
        });
        // Keep the mailto link's note/subject in sync with unsaved edits
        // to the note field, so "Email applicant" always sends what's on
        // screen right now, not the last-saved version.
        card.querySelector("[data-note]").addEventListener("input", (e) => {
          const mailtoLink = card.querySelector("[data-mailto]");
          const preview = { ...app, note: e.target.value };
          mailtoLink.href = emailTemplate(preview);
        });
      });
    }

    root.querySelectorAll("#appTabs .tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("#appTabs .tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        tab = btn.dataset.tab;
        draw();
      });
    });
    root.querySelector("#appSearch").addEventListener("input", (e) => { filter = e.target.value; draw(); });

    window.JESSData.listApplications().then((rows) => {
      all = rows;
      const loading = root.querySelector("#appLoading");
      if (loading) loading.remove();
      draw();
    });
  }

  /* ---- Registrations panel ---- */
  function panelRegistrations(root) {
    root.innerHTML = `
      <h2>Sign-ups</h2>
      <p class="panel-hint">People who registered for an event through the site. Stored separately from your site content, so they never count against the page's storage limit.</p>
      <div class="admin-toolbar">
        <input type="search" id="regSearch" placeholder="Search by name, email, or event…">
        <button class="btn btn-outline" id="regExport">Export CSV</button>
      </div>
      <div id="regLoading" style="color:var(--color-text-gray);font-size:0.9rem;">Loading sign-ups…</div>
      <div class="admin-card-list" id="regList"></div>
    `;
    let all = [];
    let filter = "";

    function when(ts) {
      if (!ts) return "";
      const d = new Date(ts);
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) +
        " at " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }

    function draw() {
      const q = filter.toLowerCase();
      const rows = all.filter(r => !q ||
        (r.name || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q) ||
        (r.eventTitle || "").toLowerCase().includes(q));

      const listEl = root.querySelector("#regList");
      if (!rows.length) {
        listEl.innerHTML = `<p class="panel-hint">${all.length ? "No sign-ups match that search." : "No sign-ups yet."}</p>`;
        return;
      }
      listEl.innerHTML = rows.map(r => `
        <div class="admin-item-card" data-id="${r.id}">
          <div class="admin-item-card-head">
            <strong>${esc(r.name || "(no name)")}</strong>
            <div class="admin-item-actions"><button class="danger" data-del>Delete</button></div>
          </div>
          <div class="tag-row">
            <span class="tag${r.role === "volunteer" ? " tag-volunteer" : ""}">${r.role === "volunteer" ? "Volunteer" : "Participant"}</span>
            <span class="tag">${esc(r.eventTitle || "(event removed)")}</span>
          </div>
          <div style="font-size:0.9rem;margin-top:8px;">
            ${esc(r.email || "")}${r.phone ? " · " + esc(r.phone) : ""}
          </div>
          ${r.why ? `<div style="font-size:0.92rem;margin-top:8px;white-space:pre-wrap;">${esc(r.why)}</div>` : ""}
          <div style="font-size:0.8rem;color:var(--color-text-gray);margin-top:8px;">${when(r.createdAt)}</div>
        </div>`).join("");

      listEl.querySelectorAll("[data-del]").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.closest("[data-id]").dataset.id;
          if (!confirm("Delete this sign-up? This can't be undone.")) return;
          window.JESSData.deleteRegistration(id).then(() => {
            all = all.filter(x => x.id !== id);
            toast("Sign-up deleted.");
            draw();
          });
        });
      });
    }

    root.querySelector("#regSearch").addEventListener("input", (e) => { filter = e.target.value; draw(); });

    root.querySelector("#regExport").addEventListener("click", () => {
      if (!all.length) { toast("Nothing to export yet."); return; }
      const cell = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
      const csv = ["Name,Email,Phone,Role,Event,Why,Registered"]
        .concat(all.map(r => [r.name, r.email, r.phone, r.role, r.eventTitle, r.why,
          r.createdAt ? new Date(r.createdAt).toISOString() : ""].map(cell).join(",")))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "jess-signups.csv"; a.click();
      URL.revokeObjectURL(url);
      toast("Exported.");
    });

    window.JESSData.listRegistrations().then((rows) => {
      all = rows;
      const loading = root.querySelector("#regLoading");
      if (loading) loading.remove();
      draw();
    });
  }

  /* ---- Contact & footer panel ---- */
  function panelContact(root) {
    root.innerHTML = `
      <h2>Contact &amp; Footer</h2>
      <p class="panel-hint">Update contact details, social links, and footer link URLs.</p>
      <div class="field-group"><label>Intro Text</label><textarea id="cIntro" rows="2">${esc(DATA.contact.intro)}</textarea></div>
      <div class="field-row">
        <div class="field-group"><label>Email</label><input id="cEmail" value="${esc(DATA.contact.email)}"></div>
        <div class="field-group"><label>Location</label><input id="cLocation" value="${esc(DATA.contact.location)}"></div>
      </div>
      <div class="field-row">
        <div class="field-group"><label>Instagram URL</label><input id="cIg" value="${esc(DATA.contact.instagram)}"></div>
        <div class="field-group"><label>TikTok URL</label><input id="cTt" value="${esc(DATA.contact.tiktok)}"></div>
      </div>
      <div class="field-group"><label>Discord URL</label><input id="cDc" value="${esc(DATA.contact.discord)}"></div>
      <div class="field-row">
        <div class="field-group"><label>Privacy Policy URL</label><input id="fPrivacy" value="${esc(DATA.footer.privacyUrl)}"></div>
        <div class="field-group"><label>Terms URL</label><input id="fTerms" value="${esc(DATA.footer.termsUrl)}"></div>
      </div>
      <button class="btn btn-primary" id="saveContact">Save Changes</button>
    `;
    root.querySelector("#saveContact").addEventListener("click", () => {
      DATA.contact.intro = root.querySelector("#cIntro").value;
      DATA.contact.email = root.querySelector("#cEmail").value;
      DATA.contact.location = root.querySelector("#cLocation").value;
      DATA.contact.instagram = root.querySelector("#cIg").value;
      DATA.contact.tiktok = root.querySelector("#cTt").value;
      DATA.contact.discord = root.querySelector("#cDc").value;
      DATA.footer.privacyUrl = root.querySelector("#fPrivacy").value;
      DATA.footer.termsUrl = root.querySelector("#fTerms").value;
      saveData();
      toast("Contact info saved.");
    });
  }

  /* ---- Theme panel ---- */
  function panelTheme(root) {
    const t = DATA.theme;
    root.innerHTML = `
      <h2>Theme Settings</h2>
      <p class="panel-hint">Changes apply live across the public site.</p>
      <div class="field-row">
        <div class="field-group"><label>Primary Color</label><input type="color" id="tPrimary" value="${t.primary}"></div>
        <div class="field-group"><label>Secondary Color</label><input type="color" id="tSecondary" value="${t.secondary}"></div>
      </div>
      <div class="field-group">
        <label>Font Style</label>
        <select id="tFont">
          <option value="modern" ${t.font === "modern" ? "selected" : ""}>Modern (Space Grotesk / Inter)</option>
          <option value="classic" ${t.font === "classic" ? "selected" : ""}>Classic (Serif)</option>
          <option value="friendly" ${t.font === "friendly" ? "selected" : ""}>Friendly (Rounded sans)</option>
        </select>
      </div>
      <div class="field-group">
        <label>Corner Roundness: <span id="radiusVal">${t.radius}px</span></label>
        <input type="range" id="tRadius" min="0" max="32" value="${t.radius}">
      </div>
      <div class="field-group">
        <label>Animation Speed: <span id="speedVal">${t.animSpeed}x</span></label>
        <input type="range" id="tSpeed" min="0.5" max="2" step="0.1" value="${t.animSpeed}">
      </div>
      <div class="field-group">
        <label><input type="checkbox" id="tDark" ${t.darkMode ? "checked" : ""} style="width:auto;margin-right:8px;"> Dark Mode</label>
      </div>
      <button class="btn btn-outline" id="resetTheme">Reset Theme to Default</button>
    `;
    function update() {
      DATA.theme.primary = root.querySelector("#tPrimary").value;
      DATA.theme.secondary = root.querySelector("#tSecondary").value;
      DATA.theme.font = root.querySelector("#tFont").value;
      DATA.theme.radius = root.querySelector("#tRadius").value;
      DATA.theme.animSpeed = root.querySelector("#tSpeed").value;
      DATA.theme.darkMode = root.querySelector("#tDark").checked;
      root.querySelector("#radiusVal").textContent = DATA.theme.radius + "px";
      root.querySelector("#speedVal").textContent = DATA.theme.animSpeed + "x";
      saveData();
    }
    root.querySelectorAll("input, select").forEach(el => el.addEventListener("input", update));
    root.querySelector("#resetTheme").addEventListener("click", () => {
      DATA.theme = window.JESSData.defaultData().theme;
      saveData(); panelTheme(root);
      toast("Theme reset.");
    });
  }

  /* ---- Data (export/import/reset) panel ---- */
  function panelData(root) {
    root.innerHTML = `
      <h2>Data</h2>
      <p class="panel-hint">Export your site content as a JSON backup, restore from a backup, or reset everything to defaults.</p>
      <div class="data-actions">
        <button class="btn btn-primary" id="exportBtn">Export Website Data</button>
        <button class="btn btn-outline" id="importBtn">Import Website Data</button>
        <input type="file" id="importFile" accept="application/json">
        <button class="btn btn-outline" id="resetBtn" style="grid-column:1/-1;border-color:#C62828;color:#C62828;">Reset Website</button>
      </div>
    `;
    root.querySelector("#exportBtn").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "jess-website-data.json"; a.click();
      URL.revokeObjectURL(url);
      toast("Data exported.");
    });
    root.querySelector("#importBtn").addEventListener("click", () => root.querySelector("#importFile").click());
    root.querySelector("#importFile").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          DATA = Object.assign(window.JESSData.defaultData(), parsed);
          saveData();
          renderAdminPanel("data");
          toast("Data imported successfully.");
        } catch (err) {
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    });
    root.querySelector("#resetBtn").addEventListener("click", () => {
      if (confirm("This will erase all edits and restore default content. Continue?")) {
        DATA = window.JESSData.defaultData();
        saveData();
        renderAdminPanel("data");
        toast("Website reset to defaults.");
      }
    });
  }

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
