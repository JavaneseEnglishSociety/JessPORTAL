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
    document.getElementById("heroTitle").innerHTML = autoField(DATA.hero, "title");
    document.getElementById("heroSubtitle").innerHTML = autoField(DATA.hero, "subtitle");
    document.getElementById("heroBtnPrimary").innerHTML = autoField(DATA.hero, "primaryBtn");
    document.getElementById("heroBtnSecondary").innerHTML = autoField(DATA.hero, "secondaryBtn");
  }

  function renderMission() {
    document.getElementById("visionText").innerHTML = autoField(DATA.mission, "vision");
    const hasManualList = lang === "id" && DATA.mission.missionList_id && DATA.mission.missionList_id.length;
    const mList = hasManualList ? DATA.mission.missionList_id : DATA.mission.missionList;
    document.getElementById("missionList").innerHTML = mList
      .map((m) => hasManualList
        ? `<li>${esc(m)}</li>`
        : `<li><span data-autotranslate="${esc(m)}">${esc(m)}</span></li>`)
      .join("");
  }

  // A small, fixed set of icon choices for About points. Admin picks one
  // by name rather than supplying arbitrary SVG, which keeps the visual
  // style consistent with the rest of the site.
  const ICON_PRESETS = {
    book: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>',
    chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/>',
    people: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/>',
    star: '<path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.2l7.1-.6Z"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'
  };
  function iconSvg(name) {
    const paths = ICON_PRESETS[name] || ICON_PRESETS.book;
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  }

  function renderAboutPoints() {
    const grid = document.getElementById("aboutGrid");
    if (!grid) return;
    grid.innerHTML = (DATA.aboutPoints || []).map(a => `
      <div class="about-point fade-in-up visible">
        <div class="point-icon">${iconSvg(a.icon)}</div>
        <h3>${autoField(a, "title")}</h3>
        <p>${autoField(a, "desc")}</p>
      </div>`).join("");
  }

  function renderVolunteerSteps() {
    const list = document.getElementById("volunteerStepsList");
    if (!list) return;
    list.innerHTML = (DATA.volunteerSteps || []).map(v => `
      <li><strong>${autoField(v, "title")}</strong><span>${autoField(v, "desc")}</span></li>`).join("");
  }

  /* ==========================================================================
     Impact dashboard renderer.

     Every visual here is inline SVG built by hand rather than by a charting
     library. That is deliberate: no third-party script to download (the
     site is read on slow mobile connections in Indonesia), nothing to pay
     for or sign up to, no version to keep updated, and it renders the same
     offline once the page is cached. The trade-off is that each chart type
     is written out explicitly below instead of configured, which is fine
     at this scale.
     ========================================================================== */

  const IMPACT_COLORS = {
    green: "#2F9E63", blue: "#2E6DA4", gold: "#B07D26",
    coral: "#A8412F", purple: "#6B4C7A", teal: "#2F8F8F"
  };
  function impactColor(name) { return IMPACT_COLORS[name] || IMPACT_COLORS.green; }

  function svgWrap(inner, viewBox, extraClass) {
    return `<svg class="impact-svg ${extraClass || ""}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" role="img">${inner}</svg>`;
  }

  /* Count-up animation for headline numbers. Uses requestAnimationFrame
     and respects prefers-reduced-motion by jumping straight to the final
     value instead of animating. */
  function animateCount(el, target, suffix) {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !target) { el.textContent = target + (suffix || ""); return; }
    const duration = 1100;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + (suffix || "");
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function seriesMax(series) {
    return Math.max(1, ...series.map((s) => Number(s.value) || 0));
  }
  function seriesTotal(series) {
    return series.reduce((sum, s) => sum + (Number(s.value) || 0), 0);
  }

  /* ---- Individual chart builders ------------------------------------- */

  function chartBigNumber(b) {
    return `<div class="impact-figure" data-count="${Number(b.value) || 0}" data-suffix="${esc(b.suffix || "")}"
              style="color:${impactColor(b.color)}">0</div>`;
  }

  function chartPlainText(b) {
    // No number, no chart -- just a written statement (a quote, a fact,
    // a short note) sitting in the same grid as the charts around it.
    return `<p class="impact-text">${esc(b.value || "")}</p>`;
  }

  function chartTrend(b) {
    const cur = Number(b.value) || 0, prev = Number(b.previous) || 0;
    const diff = cur - prev;
    const pct = prev ? Math.round((diff / prev) * 100) : 0;
    const up = diff >= 0;
    return `<div class="impact-figure" data-count="${cur}" data-suffix="${esc(b.suffix || "")}"
              style="color:${impactColor(b.color)}">0</div>
            <div class="impact-trend ${up ? "up" : "down"}">${up ? "▲" : "▼"} ${Math.abs(pct)}% vs ${prev}</div>`;
  }

  function chartProgress(b) {
    const val = Number(b.value) || 0, goal = Number(b.goal) || 1;
    const pct = Math.max(0, Math.min(100, (val / goal) * 100));
    return `<div class="impact-figure-sm" style="color:${impactColor(b.color)}">${val.toLocaleString()} <span class="impact-of">of ${goal.toLocaleString()}</span></div>
      <div class="impact-progress-track"><div class="impact-progress-fill" style="width:${pct}%;background:${impactColor(b.color)}"></div></div>
      <div class="impact-sub">${Math.round(pct)}% there</div>`;
  }

  function chartGauge(b) {
    const val = Number(b.value) || 0, max = Number(b.max) || 100;
    const pct = Math.max(0, Math.min(1, val / max));
    // Semicircle: radius 70, centred at (80,80), sweeping 180 degrees.
    const r = 62, cx = 80, cy = 80;
    const len = Math.PI * r;
    const angle = Math.PI * pct;
    const ex = cx - r * Math.cos(angle), ey = cy - r * Math.sin(angle);
    const inner =
      `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="#E5DDCB" stroke-width="14" stroke-linecap="round"/>` +
      `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${ex} ${ey}" fill="none" stroke="${impactColor(b.color)}" stroke-width="14" stroke-linecap="round"/>` +
      `<text x="${cx}" y="${cy - 6}" text-anchor="middle" class="impact-svg-big" fill="${impactColor(b.color)}">${val}${esc(b.suffix || "")}</text>`;
    return svgWrap(inner, "0 0 160 96");
  }

  function chartDonut(b) {
    const total = seriesTotal(b.series) || 1;
    const r = 54, cx = 80, cy = 80, stroke = 26;
    const circ = 2 * Math.PI * r;
    let offset = 0;
    const rings = b.series.map((s) => {
      const frac = (Number(s.value) || 0) / total;
      const dash = `${(frac * circ).toFixed(2)} ${(circ - frac * circ).toFixed(2)}`;
      const el = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${impactColor(s.color)}"
        stroke-width="${stroke}" stroke-dasharray="${dash}" stroke-dashoffset="${(-offset * circ).toFixed(2)}"
        transform="rotate(-90 ${cx} ${cy})"/>`;
      offset += frac;
      return el;
    }).join("");
    const inner = rings + `<text x="${cx}" y="${cy + 7}" text-anchor="middle" class="impact-svg-big" fill="var(--ink,#17241C)">${total}</text>`;
    return svgWrap(inner, "0 0 160 160") + impactLegend(b.series);
  }

  function chartPie(b) {
    const total = seriesTotal(b.series) || 1;
    const cx = 80, cy = 80, r = 70;
    let angle = -Math.PI / 2;
    const slices = b.series.map((s) => {
      const frac = (Number(s.value) || 0) / total;
      const end = angle + frac * 2 * Math.PI;
      const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
      const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
      const large = frac > 0.5 ? 1 : 0;
      const path = `<path d="M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${impactColor(s.color)}"/>`;
      angle = end;
      return path;
    }).join("");
    return svgWrap(slices, "0 0 160 160") + impactLegend(b.series);
  }

  function chartBarsV(b) {
    const max = seriesMax(b.series);
    const w = 260, h = 120, gap = 8;
    const bw = (w - gap * (b.series.length - 1)) / b.series.length;
    const bars = b.series.map((s, i) => {
      const bh = ((Number(s.value) || 0) / max) * (h - 22);
      const x = i * (bw + gap), y = h - 18 - bh;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(2, bh).toFixed(1)}" rx="3" fill="${impactColor(b.color)}"/>
              <text x="${(x + bw / 2).toFixed(1)}" y="${h - 5}" text-anchor="middle" class="impact-svg-axis">${esc(s.label)}</text>`;
    }).join("");
    return svgWrap(bars, `0 0 ${w} ${h}`);
  }

  function chartBarsH(b) {
    const max = seriesMax(b.series);
    return `<div class="impact-hbars">` + b.series.map((s) => {
      const pct = ((Number(s.value) || 0) / max) * 100;
      return `<div class="impact-hbar-row">
        <span class="impact-hbar-label">${esc(s.label)}</span>
        <span class="impact-hbar-track"><span class="impact-hbar-fill" style="width:${pct}%;background:${impactColor(b.color)}"></span></span>
        <span class="impact-hbar-val">${esc(String(s.value))}</span>
      </div>`;
    }).join("") + `</div>`;
  }

  function chartRanked(b) {
    const max = seriesMax(b.series);
    return `<div class="impact-hbars">` + b.series.map((s, i) => {
      const pct = ((Number(s.value) || 0) / max) * 100;
      return `<div class="impact-hbar-row">
        <span class="impact-rank">${i + 1}</span>
        <span class="impact-hbar-label">${esc(s.label)}</span>
        <span class="impact-hbar-track"><span class="impact-hbar-fill" style="width:${pct}%;background:${impactColor(b.color)}"></span></span>
        <span class="impact-hbar-val">${esc(String(s.value))}</span>
      </div>`;
    }).join("") + `</div>`;
  }

  function linePoints(series, w, h, pad) {
    const max = seriesMax(series);
    const step = series.length > 1 ? (w - pad * 2) / (series.length - 1) : 0;
    return series.map((s, i) => {
      const x = pad + i * step;
      const y = h - pad - ((Number(s.value) || 0) / max) * (h - pad * 2);
      return [x, y];
    });
  }

  function chartLine(b) {
    const w = 260, h = 120, pad = 18;
    const pts = linePoints(b.series, w, h, pad);
    const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
    const dots = pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5" fill="${impactColor(b.color)}"/>`).join("");
    const labels = b.series.map((s, i) =>
      `<text x="${pts[i][0].toFixed(1)}" y="${h - 4}" text-anchor="middle" class="impact-svg-axis">${esc(s.label)}</text>`).join("");
    return svgWrap(`<path d="${d}" fill="none" stroke="${impactColor(b.color)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${dots}${labels}`, `0 0 ${w} ${h}`);
  }

  function chartArea(b) {
    const w = 260, h = 120, pad = 18;
    const pts = linePoints(b.series, w, h, pad);
    const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
    const fill = `${d} L ${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L ${pts[0][0].toFixed(1)} ${h - pad} Z`;
    const labels = b.series.map((s, i) =>
      `<text x="${pts[i][0].toFixed(1)}" y="${h - 4}" text-anchor="middle" class="impact-svg-axis">${esc(s.label)}</text>`).join("");
    return svgWrap(
      `<path d="${fill}" fill="${impactColor(b.color)}" opacity="0.18"/>
       <path d="${d}" fill="none" stroke="${impactColor(b.color)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${labels}`,
      `0 0 ${w} ${h}`);
  }

  function chartSparkline(b) {
    const w = 240, h = 60, pad = 6;
    const pts = linePoints(b.series, w, h, pad);
    const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
    const last = pts[pts.length - 1];
    const latest = b.series[b.series.length - 1];
    return svgWrap(
      `<path d="${d}" fill="none" stroke="${impactColor(b.color)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
       <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="4" fill="${impactColor(b.color)}"/>`,
      `0 0 ${w} ${h}`) +
      `<div class="impact-sub">Latest: <strong>${esc(String(latest ? latest.value : ""))}</strong></div>`;
  }

  function chartStacked(b) {
    const total = seriesTotal(b.series) || 1;
    const segs = b.series.map((s) => {
      const pct = ((Number(s.value) || 0) / total) * 100;
      return `<span class="impact-stack-seg" style="width:${pct}%;background:${impactColor(s.color)}" title="${esc(s.label)}"></span>`;
    }).join("");
    return `<div class="impact-stack">${segs}</div>` + impactLegend(b.series);
  }

  function chartPictogram(b) {
    const per = Number(b.perIcon) || 10;
    const total = Number(b.value) || 0;
    const full = Math.min(60, Math.floor(total / per)); // capped so a big number can't render thousands of nodes
    const icons = Array.from({ length: full }, () => `<span class="impact-pict-icon">${b.icon || "🧑‍🎓"}</span>`).join("");
    return `<div class="impact-figure-sm" style="color:${impactColor(b.color)}">${total.toLocaleString()}</div>
            <div class="impact-pictogram">${icons}</div>`;
  }

  function chartCompare(b) {
    const before = Number(b.beforeValue) || 0, after = Number(b.afterValue) || 0;
    const max = Math.max(before, after, 1);
    return `<div class="impact-compare">
      <div class="impact-compare-col">
        <span class="impact-compare-bar" style="height:${(before / max) * 100}%;background:#C4B79E"></span>
        <span class="impact-compare-val">${before}${esc(b.suffix || "")}</span>
        <span class="impact-compare-label">${esc(b.beforeLabel || "Before")}</span>
      </div>
      <div class="impact-compare-arrow">→</div>
      <div class="impact-compare-col">
        <span class="impact-compare-bar" style="height:${(after / max) * 100}%;background:${impactColor("green")}"></span>
        <span class="impact-compare-val" style="color:${impactColor("green")}">${after}${esc(b.suffix || "")}</span>
        <span class="impact-compare-label">${esc(b.afterLabel || "After")}</span>
      </div>
    </div>`;
  }

  function chartHeatgrid(b) {
    const vals = Array.isArray(b.series) ? b.series.map((v) => (typeof v === "object" ? Number(v.value) : Number(v)) || 0) : [];
    const max = Math.max(1, ...vals);
    const cells = vals.map((v) => {
      const intensity = v / max;
      const alpha = v === 0 ? 0.08 : 0.2 + intensity * 0.8;
      return `<span class="impact-heat-cell" style="background:${impactColor(b.color)};opacity:${alpha.toFixed(2)}"></span>`;
    }).join("");
    return `<div class="impact-heatgrid">${cells}</div>
            <div class="impact-sub">Each square is one week</div>`;
  }

  function chartTimeline(b) {
    return `<ol class="impact-timeline">` + b.series.map((s) => `
      <li><span class="impact-tl-dot"></span>
        <span class="impact-tl-year">${esc(String(s.value))}</span>
        <span class="impact-tl-label">${esc(s.label)}</span></li>`).join("") + `</ol>`;
  }

  function impactLegend(series) {
    return `<div class="impact-legend">` + series.map((s) =>
      `<span class="impact-legend-item"><span class="impact-legend-dot" style="background:${impactColor(s.color)}"></span>${esc(s.label)} <strong>${esc(String(s.value))}</strong></span>`
    ).join("") + `</div>`;
  }

  const IMPACT_BUILDERS = {
    bigNumber: chartBigNumber, plainText: chartPlainText, trend: chartTrend, progress: chartProgress, gauge: chartGauge,
    donut: chartDonut, pie: chartPie, barsV: chartBarsV, barsH: chartBarsH, ranked: chartRanked,
    line: chartLine, area: chartArea, sparkline: chartSparkline, stacked: chartStacked,
    pictogram: chartPictogram, compare: chartCompare, heatgrid: chartHeatgrid, timeline: chartTimeline
  };

  // Blocks that read better across the full width of the grid.
  const IMPACT_WIDE = ["barsV", "line", "area", "heatgrid", "ranked", "timeline", "barsH"];

  function renderImpact() {
    const section = document.getElementById("impact");
    if (!section) return;
    const imp = DATA.impact;
    if (!imp || imp.enabled === false || !imp.blocks || !imp.blocks.length) {
      section.hidden = true;
      section.innerHTML = "";
      return;
    }
    section.hidden = false;

    const cards = imp.blocks.map((b) => {
      const build = IMPACT_BUILDERS[b.type];
      if (!build) return "";
      let body = "";
      try { body = build(b); }
      catch (e) {
        // One malformed block (e.g. an empty series after an edit) must
        // never blank the whole dashboard.
        console.warn("JESS: could not draw an impact block.", b.type, e);
        return "";
      }
      return `<article class="impact-card ${IMPACT_WIDE.indexOf(b.type) !== -1 ? "impact-card-wide" : ""}">
        <h3 class="impact-card-label">${esc(field(b, "label"))}</h3>
        ${body}
      </article>`;
    }).join("");

    section.innerHTML = `
      <div class="section-inner">
        <div class="section-head fade-in-up visible">
          <span class="marker">${esc(field(imp, "title"))}</span>
          <h2>${esc(field(imp, "subtitle"))}</h2>
        </div>
        <div class="impact-grid">${cards}</div>
      </div>`;

    // Count-up figures animate only once they scroll into view, so the
    // number isn't already finished before anyone looks at it.
    const figures = section.querySelectorAll("[data-count]");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          animateCount(el, Number(el.dataset.count), el.dataset.suffix);
          io.unobserve(el);
        });
      }, { threshold: 0.4 });
      figures.forEach((el) => io.observe(el));
    } else {
      figures.forEach((el) => animateCount(el, Number(el.dataset.count), el.dataset.suffix));
    }
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
        <h3>${autoField(p, "title")}</h3>
        <p>${autoField(p, "desc")}</p>
      </div>`).join("");
  }

  // A single configurable banner linking out to JessEDU. Entirely hidden
  // (not just empty) when unpublished, since it's meant to be switchable
  // off completely rather than shown as a blank section.
  function renderJessEdu() {
    const section = document.getElementById("jessedu-link");
    if (!section) return;
    const j = DATA.jessEdu;
    if (!j || j.published === false) {
      section.hidden = true;
      section.innerHTML = "";
      return;
    }
    section.hidden = false;
    section.innerHTML = `
      <div class="section-inner">
        <div class="jessedu-card fade-in-up visible">
          ${j.image ? `<div class="jessedu-image"><img src="${esc(j.image)}" alt="" loading="lazy"></div>` : ""}
          <div class="jessedu-body">
            <span class="marker">${autoField(j, "marker")}</span>
            <h2>${autoField(j, "heading")}</h2>
            <p class="lede">${autoField(j, "description")}</p>
            <a href="${esc(j.url || "#")}" class="btn btn-primary" target="_blank" rel="noopener">${autoField(j, "buttonText")}</a>
          </div>
        </div>
      </div>`;
  }

  /* ---- Native browser translation (progressive enhancement) --------- *
   * Chrome and Edge ship an on-device Translator API (self.Translator)
   * that works entirely in the browser, no server, no API key, and no
   * per-request network call once its small language model has
   * downloaded once. It fills a real gap: several fields never got a
   * manual "(ID)" box in the admin panel at all (team bios/roles,
   * testimonial reviews, gallery captions, event descriptions), so
   * without this they simply stay in English forever when Indonesian
   * is selected. Where the API isn't available (Safari, Firefox, an
   * older Chrome), those specific fields just remain in English —
   * everything else on the site keeps working exactly as before,
   * since this only ever supplements the manual translations already
   * in place, never replaces them.
   * --------------------------------------------------------------------- */
  /* ---- Automatic translation (no admin typing required) -------------- *
   * Every fixed UI label (nav, buttons, section markers/headings) is
   * already translated instantly via the dictionary in data.js — no
   * network call needed for those, and nothing for the admin to type.
   *
   * Everything else — programs, events, team, testimonials, gallery
   * captions, FAQ, news, contact text, partner descriptions — is
   * content someone typed into the admin panel, in English, with no
   * "(ID)" field ever filled in. For THAT content, this calls a
   * translation service over the network so the whole site comes
   * across in Indonesian without anyone writing a second copy of
   * everything by hand.
   *
   * This uses Google Translate's public web-client endpoint (the same
   * one translate.google.com itself calls from the browser) rather
   * than the official Cloud Translation API, because the official API
   * requires a billing account and a secret key — and a secret key
   * cannot be kept secret in a static site's own JavaScript anyway,
   * since anyone can view-source it. The endpoint used here needs no
   * key and works from any browser, but it is not an officially
   * supported public API: Google could rate-limit or change it
   * without notice. Every call is wrapped so that if it ever fails,
   * the text just stays in English instead of breaking the page, and
   * results are cached so the same sentence is never fetched twice.
   * --------------------------------------------------------------------- */
  const translationCache = new Map();
  const translationInFlight = new Map();

  function loadTranslationCache() {
    try {
      const raw = sessionStorage.getItem("jess-translation-cache");
      if (raw) JSON.parse(raw).forEach(([k, v]) => translationCache.set(k, v));
    } catch (e) { /* ignore */ }
  }
  function saveTranslationCache() {
    try {
      sessionStorage.setItem("jess-translation-cache", JSON.stringify([...translationCache].slice(-500)));
    } catch (e) { /* ignore */ }
  }
  loadTranslationCache();

  async function apiTranslate(text) {
    if (!text || !text.trim()) return text;
    if (translationCache.has(text)) return translationCache.get(text);
    // If a request for this exact text is already in flight (very common
    // when several elements on the page share the same short label),
    // reuse that one promise instead of firing a second identical
    // request — this is what keeps a full page re-render from turning
    // into hundreds of network calls.
    if (translationInFlight.has(text)) return translationInFlight.get(text);
    const promise = (async () => {
      try {
        const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=" + encodeURIComponent(text);
        const res = await fetch(url);
        if (!res.ok) throw new Error("translate request failed: " + res.status);
        const data = await res.json();
        const translated = (data[0] || []).map((chunk) => chunk[0]).join("");
        const finalText = translated || text;
        translationCache.set(text, finalText);
        saveTranslationCache();
        return finalText;
      } catch (e) {
        console.warn("JESS: automatic translation failed for one piece of text; leaving it in English.", e);
        return text;
      } finally {
        translationInFlight.delete(text);
      }
    })();
    translationInFlight.set(text, promise);
    return promise;
  }

  // Elements carrying data-autotranslate="<original English>" get
  // patched in place once their translation resolves. Safe to call
  // repeatedly; it no-ops in English and skips anything already
  // translated or since replaced by a fresh render.
  function runAutoTranslate() {
    if (lang !== "id") return;
    document.querySelectorAll("[data-autotranslate]").forEach((el) => {
      const original = el.dataset.autotranslate;
      apiTranslate(original).then((translated) => {
        if (lang === "id" && el.isConnected && el.dataset.autotranslate === original) {
          el.textContent = translated;
        }
      });
    });
  }

  // Renders a field that MAY have a manually-written "(ID)" version.
  // If the admin has actually filled one in, that wins outright (a
  // human translation is always better than a machine one) and no
  // network call happens. If not, this renders the English text
  // immediately (so the page never looks empty while waiting) inside a
  // marker span that runAutoTranslate() will silently upgrade to
  // Indonesian a moment later. In English mode this is identical to
  // just calling field() directly.
  function autoField(obj, name) {
    if (lang !== "id") return esc(field(obj, name));
    const hasManual = obj && typeof obj[name + "_id"] === "string" && obj[name + "_id"].trim() !== "";
    if (hasManual) return esc(field(obj, name));
    const original = (obj && obj[name]) || "";
    return `<span data-autotranslate="${esc(original)}">${esc(original)}</span>`;
  }

  function renderTeam() {
    document.getElementById("teamGrid").innerHTML = DATA.team.map(m => `
      <div class="team-card fade-in-up visible">
        ${m.photo
          ? `<img class="team-photo" src="${esc(m.photo)}" alt="${esc(m.name)}">`
          : `<div class="team-photo"></div>`}
        <div class="team-card-body">
          <h3>${esc(m.name)}</h3>
          <div class="team-role" data-autotranslate="${esc(m.role)}">${esc(m.role)}</div>
          <p class="team-desc" data-autotranslate="${esc(m.desc)}">${esc(m.desc)}</p>
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
      // Logos render as a CSS background instead of an <img> tag so the
      // zoom and position an admin sets in the crop tool actually fill
      // the frame edge to edge, instead of floating inside it at a fixed
      // size with padding around it.
      const zoom = p.logoZoom || 1;
      const posX = (typeof p.logoPosX === "number") ? p.logoPosX : 50;
      const posY = (typeof p.logoPosY === "number") ? p.logoPosY : 50;
      const frameStyle = p.logo
        ? ` style="background-image:url('${esc(p.logo)}');background-size:${(zoom * 100).toFixed(0)}%;background-position:${posX}% ${posY}%;"`
        : "";
      const frameInner = p.logo
        ? ""
        : `<span class="partner-initials">${esc((p.name || "?").trim().charAt(0).toUpperCase())}</span>`;
      const desc = field(p, "description");
      const hasManualDesc = typeof p.description_id === "string" && p.description_id.trim() !== "";
      const descHtml = desc
        ? (lang === "id" && !hasManualDesc
            ? `<p class="partner-desc" data-autotranslate="${esc(desc)}">${esc(desc)}</p>`
            : `<p class="partner-desc">${esc(desc)}</p>`)
        : "";
      return `
      <div class="partner-card fade-in-up visible">
        <div class="partner-frame ${shape}"${frameStyle}>${frameInner}</div>
        <h3 class="partner-name">${esc(p.name)}</h3>
        ${descHtml}
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
        <div class="masonry-caption" data-autotranslate="${esc(g.caption)}">${esc(g.caption)}</div>
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
  // Turns a pasted URL into embeddable video markup. YouTube and Vimeo
  // links become a responsive iframe embed; anything else is assumed to
  // be a direct file link (e.g. a Firebase Storage download URL from
  // the admin's upload button) and becomes a native <video> player.
  function videoEmbedHtml(url) {
    if (!url) return "";
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) {
      return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${yt[1]}" title="video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    }
    const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeo) {
      return `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${vimeo[1]}" title="video" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    }
    return `<div class="video-embed"><video controls preload="metadata" src="${esc(url)}"></video></div>`;
  }

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
      const hasManualBody = typeof n.body_id === "string" && n.body_id.trim() !== "";
      const shortHtml = (lang === "id" && !hasManualBody)
        ? `<span data-autotranslate="${esc(short)}">${esc(short)}</span>`
        : esc(short);
      const dateLabel = n.date
        ? new Date(n.date + "T00:00:00").toLocaleDateString(lang === "id" ? "id-ID" : undefined,
            { year: "numeric", month: "long", day: "numeric" })
        : "";
      return `
      <article class="news-card fade-in-up visible">
        ${n.image
          ? `<div class="news-image">${n.video ? '<span class="news-video-badge">▶ Video</span>' : ""}<img src="${esc(n.image)}" alt="${esc(field(n, "title"))}" loading="lazy"></div>`
          : (n.video ? `<div class="news-image news-video-cover"><span class="news-play-icon">▶</span></div>` : "")}
        <div class="news-card-body">
          ${dateLabel ? `<div class="news-date">${esc(dateLabel)}</div>` : ""}
          <h3>${autoField(n, "title")}</h3>
          <p class="news-body">${shortHtml}</p>
          ${(body.length > 180 || n.video)
            ? `<button type="button" class="news-more" data-news="${esc(n.id)}">${esc(n.video ? L.t("watch_video", lang) : L.t("read_more", lang))}</button>`
            : ""}
        </div>
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
        ${n.video
          ? videoEmbedHtml(n.video)
          : (n.image ? `<div class="news-image news-image-modal"><img src="${esc(n.image)}" alt="${esc(field(n, "title"))}"></div>` : "")}
        <h3>${autoField(n, "title")}</h3>
        ${n.date ? `<p class="news-date">${esc(n.date)}</p>` : ""}
        <p style="white-space:pre-wrap;">${autoField(n, "body")}</p>
      </div>`;
    document.body.appendChild(overlay);
    runAutoTranslate();
    const close = () => overlay.remove();
    overlay.querySelector(".modal-close").addEventListener("click", close);
    overlay.addEventListener("click", (e2) => { if (e2.target === overlay) close(); });
  });

  function renderFaq() {
    document.getElementById("faqAccordion").innerHTML = DATA.faq.map((f, i) => `
      <div class="accordion-item" data-index="${i}">
        <button class="accordion-q">${autoField(f, "q")} <span class="chev">&#9662;</span></button>
        <div class="accordion-a"><p>${autoField(f, "a")}</p></div>
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
    document.getElementById("contactIntro").innerHTML = autoField(DATA.contact, "intro");
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
    renderAboutPoints();
    renderMission();
    renderImpact();
    renderStats();
    renderPrograms();
    renderJessEdu();
    renderVolunteerSteps();
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
    // One single DOM-wide translation pass per full render, instead of
    // one per section — each render function above used to call this
    // itself, which meant a full page render fired the same scan over
    // a growing DOM more than a dozen times in a row and multiplied
    // network requests to the translation service accordingly.
    runAutoTranslate();
  }

  /* ---- Language toggle ---------------------------------------------- *
   * Static labels in the HTML carry data-i18n="key" (and data-i18n-ph for
   * placeholders). Switching language rewrites those, then re-renders the
   * data-driven sections. The choice is stored so it survives a reload.
   * ------------------------------------------------------------------- */
  // Maps each data-i18n key used for a section marker/heading to the
  // matching field on DATA.sectionText. When the admin has customised
  // that field (Content panel > Sections), it wins; otherwise this falls
  // back to the fixed UI_STRINGS translation exactly as before, so an
  // untouched site looks identical to how it always did.
  const SECTION_TEXT_MAP = {
    marker_about: "about_marker", h_about: "about_heading",
    marker_vision: "vision_marker", h_vision: "vision_heading",
    marker_mission: "mission_marker", h_mission: "mission_heading",
    marker_programs: "programs_marker", h_programs: "programs_heading",
    marker_calendar: "events_marker", h_events: "events_heading",
    marker_team: "team_marker", h_team: "team_heading",
    marker_volunteer: "volunteer_marker", h_volunteer: "volunteer_heading",
    marker_partners: "partners_marker", h_partners: "partners_heading",
    marker_news: "news_marker", h_news: "news_heading",
    marker_testimonials: "testimonials_marker", h_testimonials: "testimonials_heading",
    marker_gallery: "gallery_marker", h_gallery: "gallery_heading",
    marker_questions: "faq_marker", h_faq: "faq_heading",
    marker_contact: "contact_marker", h_contact: "contact_heading"
  };

  function applyStaticStrings() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      const sectionField = SECTION_TEXT_MAP[key];
      el.textContent = (sectionField && DATA.sectionText)
        ? field(DATA.sectionText, sectionField)
        : L.t(key, lang);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.setAttribute("placeholder", L.t(el.dataset.i18nPh, lang));
    });
    document.documentElement.setAttribute("lang", lang === "id" ? "id" : "en");
    const btn = document.getElementById("langToggle");
    if (btn) {
      // The label shows the language you'd switch TO, which is the
      // clearer convention for a two-language switch.
      const labelEl = document.getElementById("langToggleLabel");
      if (labelEl) labelEl.textContent = lang === "id" ? "EN" : "ID";
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
    DATA.team.forEach(t => index.push({ type: "Team", label: `${t.name}, ${t.role}`, target: "#team" }));
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

  // A one-off event is "past" once its date and time have actually
  // elapsed. A recurring event is never past in this sense; it keeps
  // coming back, so the NEXT occurrence is what matters, not the
  // original date it was created on.
  function isEventPast(e) {
    if (e.recurring && e.recurring !== "none") return false;
    const eventEnd = new Date(e.date + "T" + (e.time || "23:59"));
    return eventEnd < new Date();
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
      // A whole day reads as "past" once its date is before today, so
      // the eye can skip it at a glance when scanning for what's next.
      const isPastDay = key < todayKey;
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
      html += `<button type="button" class="cal-day ${evs.length ? "filled" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${isPastDay ? "past-day" : ""}"${blockStyle} data-key="${key}" role="gridcell" aria-label="${key}${evs.length ? ', ' + evs.length + ' events' : ''}">
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
  function openApplyModal(presetRole) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    const titleKey = presetRole === "student" ? "apply_as_student" : "apply_to_volunteer";
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(L.t(titleKey, lang))}">
        <button class="modal-close" aria-label="${esc(L.t("close", lang))}">&times;</button>
        <h3>${esc(L.t(titleKey, lang))}</h3>
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
            <option value="volunteer" ${presetRole !== "student" ? "selected" : ""}>${esc(L.t("volunteer_teacher", lang))}</option>
            <option value="student" ${presetRole === "student" ? "selected" : ""}>${esc(L.t("student_join", lang))}</option>
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
  if (applyBtn) applyBtn.addEventListener("click", () => openApplyModal("volunteer"));
  const applyStudentBtn = document.getElementById("openApplyStudentBtn");
  if (applyStudentBtn) applyStudentBtn.addEventListener("click", () => openApplyModal("student"));
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
      ? evs.map(e => {
          const past = isEventPast(e);
          return `
        <div class="day-event ${past ? "day-event-past" : ""}" style="border-color:${e.color}">
          <div class="day-event-head">
            <strong>${esc(e.title)}</strong>
            ${past ? `<span class="past-badge">${esc(L.t("event_passed", lang))}</span>` : ""}
          </div>
          ${e.time ? esc(e.time) + " · " : ""}${esc(e.location || "")}
          ${renderTags(e)}
          <div data-autotranslate="${esc(e.desc || "")}">${esc(e.desc || "")}</div>
          ${past ? "" : renderRegisterBtn(e)}
        </div>`;
        }).join("")
      : `<p class="day-empty-msg">${esc(L.t("no_events_day", lang))}</p>`;
    runAutoTranslate();
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
        <p class="testi-quote" data-autotranslate="${esc(t.review)}">&ldquo;${esc(t.review)}&rdquo;</p>
        <div class="testi-name">${esc(t.name)}</div>
        <div class="testi-school">${esc(t.school)}</div>
      </div>`).join("");
    runAutoTranslate();

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
      statusEl.textContent = "Thanks. Your message has been sent. We'll reply within a few days.";
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
          statusEl.textContent = "Thanks. Your message has been sent. We'll reply within a few days.";
          form.reset();
        } else {
          statusEl.textContent = "Something went wrong sending that. Please email us directly at " + DATA.contact.email + ".";
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
