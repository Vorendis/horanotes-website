# Hora Notes website

One-page website for Hora Notes, a Vedic astrology (Jyotish) practice. Plain HTML, CSS and JavaScript with no build step, hosted on Zoho Catalyst Slate.

## Files

| Path | What it is |
|---|---|
| `index.html` | The page |
| `css/site.css` | All styles |
| `js/config.js` | **Site settings: the only file to edit for day-to-day changes** |
| `js/hora.js` | The live hora dial (sunrise, sunset and the 24 horas) |
| `js/site.js` | Applies the settings to the page |
| `assets/` | Logo, icons and the link-preview image |

## Common changes (all in `js/config.js`)

- **Turn on bookings:** paste the Zoho Bookings inline embed address into `booking.embedUrl` and the booking page link into `booking.pageUrl`. The calendar replaces the countdown from `launchDate`, or set `booking.open: true` to show it now.
- **Payments:** `payment.mode` is `"bookings"` (fee taken inside Zoho Bookings), `"link"` (separate pay button opening `payment.linkUrl`) or `"none"`.
- **Waitlist:** paste a Zoho Forms link into `waitlistUrl` and the buttons change to "Join the waitlist".
- **Price, length, launch date:** `consultation` and `launchDate`.
- **Contact details in the footer:** `contact.email` and `contact.whatsapp`.

## Deploying to Catalyst Slate

**Direct Upload:** zip `index.html`, `css`, `js` and `assets` (not the folder around them), then upload in Catalyst > Slate > Direct Upload, or use Re-Upload on an existing app.

**From this repository:** connect the repository in Slate and choose the static/plain HTML framework. The site sits at the repository root, so there is no build command and the output folder is the root.

Preview locally with any static server, for example `python3 -m http.server` in this folder.
