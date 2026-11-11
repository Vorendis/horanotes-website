/*
  Live hora dial.
  The Vedic day runs from sunrise to the next sunrise. Daytime (sunrise to sunset)
  is split into 12 equal horas and night (sunset to next sunrise) into 12 more.
  The first hora belongs to the lord of the weekday; the rest follow the order
  Shani, Guru, Mangal, Surya, Shukra, Budha, Chandra.
*/
(function () {
  "use strict";

  var CFG = (window.HORA_CONFIG && window.HORA_CONFIG.hora) || {};
  var svg = document.getElementById("hora-svg");
  if (!svg) return;

  var GRAHA = {
    surya:   { en: "Surya",   deva: "सूर्य",   ab: "सू", use: "authority, government work and meeting people in power" },
    chandra: { en: "Chandra", deva: "चन्द्र",  ab: "चं", use: "travel, dealing with the public and matters of home" },
    mangal:  { en: "Mangal",  deva: "मंगल",   ab: "मं", use: "courage, sport, property and settling disputes" },
    budha:   { en: "Budha",   deva: "बुध",    ab: "बु", use: "study, writing, trade and communication" },
    guru:    { en: "Guru",    deva: "गुरु",    ab: "गु", use: "learning, worship and auspicious beginnings" },
    shukra:  { en: "Shukra",  deva: "शुक्र",   ab: "शु", use: "art, beauty, romance and comforts" },
    shani:   { en: "Shani",   deva: "शनि",    ab: "श",  use: "hard work, discipline and long, patient tasks" }
  };
  var ORDER = ["shani", "guru", "mangal", "surya", "shukra", "budha", "chandra"];
  var VARA  = ["surya", "chandra", "mangal", "budha", "guru", "shukra", "shani"]; // Sun..Sat

  var place = {
    name: CFG.place || "New Delhi",
    lat: typeof CFG.lat === "number" ? CFG.lat : 28.6139,
    lon: typeof CFG.lon === "number" ? CFG.lon : 77.2090,
    tz: CFG.timeZone || "Asia/Kolkata"
  };
  try { new Intl.DateTimeFormat("en", { timeZone: place.tz }); }
  catch (e) { place.tz = Intl.DateTimeFormat().resolvedOptions().timeZone; }

  /* ---------- sun ---------- */
  var RAD = Math.PI / 180;
  function sunTimes(y, m, d, lat, lon) {
    var jd = Date.UTC(y, m - 1, d, 12) / 864e5 + 2440587.5;
    var n = Math.round(jd - 2451545.0 + 0.0008);
    var js = n - lon / 360;
    var M = (357.5291 + 0.98560028 * js) % 360;
    var C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 0.0003 * Math.sin(3 * M * RAD);
    var L = (M + C + 180 + 102.9372) % 360;
    var jt = 2451545.0 + js + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * L * RAD);
    var dec = Math.asin(Math.sin(L * RAD) * Math.sin(23.4397 * RAD));
    var cw = (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * Math.sin(dec)) / (Math.cos(lat * RAD) * Math.cos(dec));
    if (cw < -1 || cw > 1) return null;
    var w = Math.acos(cw) / RAD;
    var toMs = function (J) { return (J - 2440587.5) * 864e5; };
    return { rise: toMs(jt - w / 360), set: toMs(jt + w / 360) };
  }

  /* ---------- calendar helpers in the place's time zone ---------- */
  function ymdIn(tz, ms) {
    var f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
    var p = {};
    f.formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    return { y: +p.year, m: +p.month, d: +p.day };
  }
  function shift(o, n) {
    var t = new Date(Date.UTC(o.y, o.m - 1, o.d + n));
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
  }
  function weekday(o) { return new Date(Date.UTC(o.y, o.m - 1, o.d)).getUTCDay(); }
  function clock(ms) {
    return new Intl.DateTimeFormat("en-IN", { timeZone: place.tz, hour: "numeric", minute: "2-digit", hour12: true })
      .format(new Date(ms)).replace(/\s?(am|pm)/i, function (s) { return " " + s.trim().toLowerCase(); });
  }

  /* ---------- the 24 horas around now ---------- */
  function cycle(now) {
    var today = ymdIn(place.tz, now);
    var st = sunTimes(today.y, today.m, today.d, place.lat, place.lon);
    var base = today, s0 = st;
    if (st && now < st.rise) { base = shift(today, -1); s0 = sunTimes(base.y, base.m, base.d, place.lat, place.lon); }
    var nx = shift(base, 1);
    var s1 = sunTimes(nx.y, nx.m, nx.d, place.lat, place.lon);
    var equal = !s0 || !s1;
    if (equal) { // polar day or night: fall back to equal hours from 6 am
      var six = Date.UTC(today.y, today.m - 1, today.d, 6) - tzOffset(now);
      if (now < six) { six -= 864e5; base = shift(today, -1); }
      s0 = { rise: six, set: six + 432e5 }; s1 = { rise: six + 864e5 };
    }
    var rise = s0.rise, set = s0.set, next = s1.rise;
    var first = ORDER.indexOf(VARA[weekday(base)]);
    var segs = [];
    for (var i = 0; i < 24; i++) {
      var a = i < 12 ? rise + i * (set - rise) / 12 : set + (i - 12) * (next - set) / 12;
      var b = i < 12 ? rise + (i + 1) * (set - rise) / 12 : set + (i - 11) * (next - set) / 12;
      segs.push({ i: i, start: a, end: b, day: i < 12, lord: ORDER[(first + i) % 7] });
    }
    return { segs: segs, rise: rise, set: set, next: next, equal: equal };
  }
  function tzOffset(ms) { // ms that local clock in place.tz is ahead of UTC
    var o = ymdIn(place.tz, ms);
    var hm = new Intl.DateTimeFormat("en-GB", { timeZone: place.tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(ms)).split(":");
    var local = Date.UTC(o.y, o.m - 1, o.d, +hm[0], +hm[1]);
    return Math.round((local - ms) / 6e4) * 6e4;
  }

  /* ---------- drawing ---------- */
  var NS = "http://www.w3.org/2000/svg";
  var CX = 200, CY = 200, R_IN = 116, R_OUT = 172, R_LAB = 144;
  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function pt(r, deg) { var a = (deg - 90) * RAD; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; }
  function wedge(a0, a1) {
    var big = a1 - a0 > 180 ? 1 : 0;
    var p1 = pt(R_OUT, a0), p2 = pt(R_OUT, a1), p3 = pt(R_IN, a1), p4 = pt(R_IN, a0);
    return "M" + p1 + "A" + R_OUT + " " + R_OUT + " 0 " + big + " 1 " + p2 +
           "L" + p3 + "A" + R_IN + " " + R_IN + " 0 " + big + " 0 " + p4 + "Z";
  }

  var state = null, nodes = [], hand = null, drawnFor = null;

  function draw(c, intro) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    nodes = [];
    var span = c.next - c.rise;
    var ang = function (t) { return (t - c.rise) / span * 360; };

    svg.appendChild(el("circle", { cx: CX, cy: CY, r: 186, class: "d-rim" }));
    var g = el("g", { class: intro ? "d-segs is-intro" : "d-segs" });
    c.segs.forEach(function (s) {
      var a0 = ang(s.start), a1 = ang(s.end), mid = (a0 + a1) / 2;
      var grp = el("g", { class: "d-seg " + (s.day ? "is-day" : "is-night"), style: "--i:" + s.i });
      var path = el("path", { d: wedge(a0, a1) });
      var title = el("title", {}); title.textContent = GRAHA[s.lord].en + " hora, " + clock(s.start) + " to " + clock(s.end);
      path.appendChild(title);
      var lp = pt(R_LAB, mid);
      var t = el("text", { x: lp[0], y: lp[1], "text-anchor": "middle", "dominant-baseline": "central", lang: "sa" });
      t.textContent = GRAHA[s.lord].ab;
      grp.appendChild(path); grp.appendChild(t); g.appendChild(grp);
      nodes.push(grp);
    });
    svg.appendChild(g);

    // sunrise star (top) and sunset mark
    var sr = pt(194, 0);
    svg.appendChild(el("path", { class: "d-star", d: star(sr[0], sr[1] - 4, 11) }));
    var ss = pt(R_OUT + 1, ang(c.set));
    svg.appendChild(el("circle", { class: "d-sunset", cx: ss[0], cy: ss[1], r: 4.5 }));

    svg.appendChild(el("circle", { cx: CX, cy: CY, r: R_IN - 8, class: "d-hub" }));

    hand = el("g", { class: intro ? "d-hand is-intro" : "d-hand" });
    var h1 = pt(R_IN - 12, 0), h2 = pt(190, 0);
    hand.appendChild(el("line", { x1: h1[0], y1: h1[1], x2: h2[0], y2: h2[1] }));
    hand.appendChild(el("circle", { cx: h2[0], cy: h2[1], r: 3.2 }));
    svg.appendChild(hand);
    drawnFor = c.rise + ":" + place.lat + ":" + place.lon;
  }
  function star(x, y, r) { // four-point star like the one on the logo
    var k = r * 0.22;
    return "M" + x + " " + (y - r) + "L" + (x + k) + " " + (y - k) + "L" + (x + r) + " " + y + "L" + (x + k) + " " + (y + k) +
           "L" + x + " " + (y + r) + "L" + (x - k) + " " + (y + k) + "L" + (x - r) + " " + y + "L" + (x - k) + " " + (y - k) + "Z";
  }

  var $ = function (id) { return document.getElementById(id); };

  function update(intro) {
    var now = Date.now();
    var c = cycle(now);
    if (!state || now >= state.next || drawnFor !== c.rise + ":" + place.lat + ":" + place.lon) draw(c, intro);
    state = c;
    var cur = c.segs.filter(function (s) { return now >= s.start && now < s.end; })[0] || c.segs[0];
    var nxt = c.segs[cur.i + 1];
    nodes.forEach(function (n, i) { n.classList.toggle("is-now", i === cur.i); });
    var deg = (now - c.rise) / (c.next - c.rise) * 360;
    hand.style.setProperty("--deg", deg + "deg");
    hand.setAttribute("transform", "rotate(" + deg + " " + CX + " " + CY + ")");

    var G = GRAHA[cur.lord];
    $("hora-deva").textContent = G.deva;
    $("hora-name").textContent = G.en + " hora";
    $("hora-until").textContent = "until " + clock(cur.end);
    $("hora-use").textContent = G.en + " hora is traditionally chosen for " + G.use + ".";
    var nextLord = GRAHA[nxt ? nxt.lord : ORDER[(ORDER.indexOf(cur.lord) + 1) % 7]].en;
    $("hora-next").textContent = "Next: " + nextLord + " hora from " + clock(cur.end) + ".";
    $("hora-sun").textContent = c.equal
      ? "Shown in equal hours for " + place.name + "."
      : "Sunrise " + clock(c.rise) + " and sunset " + clock(c.set) + " in " + place.name + ".";
  }

  /* ---------- visitor's own location ---------- */
  var btn = $("hora-locate");
  if (btn) {
    if (!("geolocation" in navigator)) btn.hidden = true;
    btn.addEventListener("click", function () {
      btn.disabled = true; btn.textContent = "Finding you…";
      try {
        navigator.geolocation.getCurrentPosition(function (pos) {
          place.lat = pos.coords.latitude; place.lon = pos.coords.longitude;
          place.tz = Intl.DateTimeFormat().resolvedOptions().timeZone || place.tz;
          place.name = "your location";
          btn.hidden = true; update(false);
        }, fail, { timeout: 10000, maximumAge: 6e5 });
      } catch (e) { fail(); }
      function fail() {
        btn.disabled = false; btn.textContent = "Try my location again";
        $("hora-sun").textContent = "Your location isn't available, so this still shows " + place.name + ".";
      }
    });
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  update(!reduce);
  setInterval(function () { update(false); }, 20000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) update(false); });

  // exposed for testing
  window.__hora = { sunTimes: sunTimes, cycle: cycle, place: place };
})();
