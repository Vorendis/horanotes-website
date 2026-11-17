/*
  Hora Notes — site settings
  ---------------------------------------------------------------
  This is the only file you need to edit to change prices, dates,
  turn on bookings or add a payment link. Save, re-zip the folder
  and re-upload it to Catalyst Slate.
*/
window.HORA_CONFIG = {

  // Date consultations open (YYYY-MM-DD, Indian time).
  launchDate: "2027-09-01",

  consultation: {
    minutes: 30,
    priceINR: 2499,
    priceUSD: 50,          // shown as "USD ($50) for clients outside India"; set to 0 to hide
    priceNote: "Launch fee"
  },

  // Zoho Bookings ----------------------------------------------
  // 1. In Zoho Bookings, open Booking Pages > Share > Embed as Widget > Inline Embed.
  // 2. Copy the code, find src="..." inside it and paste that address into embedUrl.
  // 3. Paste the plain booking page link into pageUrl (used as a backup link).
  // open: "auto" shows the calendar from launchDate onwards,
  //       true shows it now (for testing), false keeps it hidden.
  booking: {
    embedUrl: "",
    pageUrl: "",
    open: "auto"
  },

  // Payments ---------------------------------------------------
  // "bookings" : the fee is collected inside Zoho Bookings when a slot is confirmed
  //              (connect Razorpay or another gateway in Zoho Bookings settings).
  // "link"     : show a separate "Pay the consultation fee" button that opens linkUrl
  //              (a Zoho Payments or Razorpay payment page).
  // "none"     : no payment shown on the site.
  payment: {
    mode: "bookings",
    linkUrl: ""
  },

  // Waitlist: paste a Zoho Forms (or any form) link to collect names before launch.
  // Left empty, visitors are sent to Instagram instead.
  waitlistUrl: "",

  instagram: "horanotes",

  // YouTube channel link for the footer icon. Leave empty to hide the icon.
  youtube: "https://www.youtube.com/channel/UCp7vSeMEZR4KN85V-0vIQGw",

  // Optional contact details shown in the footer. Leave empty to hide.
  contact: {
    email: "",
    whatsapp: ""   // digits with country code, e.g. "919800000000"
  },

  // The live hora dial uses this place until a visitor shares their own location.
  hora: {
    place: "New Delhi",
    lat: 28.6139,
    lon: 77.2090,
    timeZone: "Asia/Kolkata"
  }
};
