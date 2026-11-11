/* Applies config.js to the page: prices, launch date, booking, payment, waitlist, contact. */
(function () {
  "use strict";
  var C = window.HORA_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var setText = function (sel, text) { $$(sel).forEach(function (n) { n.textContent = text; }); };

  var ig = "https://www.instagram.com/" + (C.instagram || "horanotes") + "/";
  $$("[data-ig]").forEach(function (a) { a.href = ig; });
  setText("[data-ig-handle]", "@" + (C.instagram || "horanotes"));

  if (C.youtube) $$("[data-yt]").forEach(function (a) { a.href = C.youtube; });
  else $$("[data-yt-item]").forEach(function (li) { li.hidden = true; });

  /* consultation details */
  var cons = C.consultation || {};
  if (cons.priceINR) {
    setText("[data-price]", new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cons.priceINR));
  }
  if (cons.minutes) setText("[data-minutes]", String(cons.minutes));
  if (cons.priceNote) setText("[data-price-note]", cons.priceNote);

  /* launch date */
  var launch = C.launchDate ? new Date(C.launchDate + "T00:00:00+05:30") : null;
  if (launch && !isNaN(launch)) {
    var nice = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(launch);
    setText("[data-launch]", nice);
    var days = Math.ceil((launch - Date.now()) / 864e5);
    setText("[data-days]", days > 0 ? days.toLocaleString("en-IN") : "0");
    setText("[data-days-word]", days === 1 ? "day to go" : "days to go");
  }

  /* which state is the booking section in? */
  var B = C.booking || {};
  var open = !!B.embedUrl && (B.open === true || (B.open !== false && launch && Date.now() >= launch.getTime()));
  var waitlist = !open && !!C.waitlistUrl;

  var ctaLabel = open ? "Book a consultation" : waitlist ? "Join the waitlist" : "Get notified";
  setText("[data-cta]", ctaLabel);

  var soon = $("#book-soon"), live = $("#book-open");
  if (open && live && soon) {
    soon.hidden = true; live.hidden = false;
    var frame = document.createElement("iframe");
    frame.src = B.embedUrl;
    frame.title = "Book a Hora Notes consultation";
    frame.loading = "lazy";
    frame.setAttribute("allow", "payment");
    $(".booking-frame", live).appendChild(frame);
    var backup = $("#book-backup");
    if (backup) { if (B.pageUrl) backup.querySelector("a").href = B.pageUrl; else backup.hidden = true; }

    var P = C.payment || {};
    var payNote = $("#pay-note"), payLink = $("#pay-link");
    if (P.mode === "link" && P.linkUrl && payLink) {
      payLink.href = P.linkUrl; payLink.hidden = false;
      if (payNote) payNote.textContent = "Book your time, then pay the consultation fee to confirm it.";
    } else if (P.mode === "none" && payNote) {
      payNote.hidden = true;
    }
  } else if (soon) {
    var go = $("#book-action");
    if (waitlist) {
      go.href = C.waitlistUrl; go.textContent = "Join the waitlist";
      setText("[data-soon-copy]", "Leave your name and you'll hear the day the calendar opens.");
    }
  }

  /* contact */
  var ct = C.contact || {}, list = $("#contact-list");
  if (list) {
    if (ct.email) list.insertAdjacentHTML("beforeend", '<li><a href="mailto:' + encodeURI(ct.email) + '">' + ct.email.replace(/[<>&"]/g, "") + "</a></li>");
    if (ct.whatsapp) list.insertAdjacentHTML("beforeend", '<li><a href="https://wa.me/' + String(ct.whatsapp).replace(/\D/g, "") + '" target="_blank" rel="noopener">WhatsApp</a></li>');
  }

  setText("[data-year]", String(new Date().getFullYear()));
})();
