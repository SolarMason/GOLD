# NEPA-PRO GOLD — Mobile Gold & Silver Buyers PWA

Production-ready single-page progressive web app for **nepa-gold.com**.
Veteran-owned, Northeast Pennsylvania mobile gold & silver buyer.
Built with iOS-native UX feel, glassmorphism + bullion-luxury aesthetic.

---

## What's in this folder

| File | Purpose |
|---|---|
| `index.html` | The whole site. Self-contained — no external CSS/JS files except Google Fonts. |
| `manifest.webmanifest` | PWA manifest. Makes the site installable on iOS/Android/desktop. |
| `sw.js` | Service worker. App-shell precache, offline fallback, network-first HTML. |
| `favicon.svg` / `favicon.ico` / `favicon-16.png` / `favicon-32.png` | Favicon set for every browser. |
| `apple-touch-icon.png` | 180×180 — iOS home screen icon (no transparency, per Apple spec). |
| `icon-192.png` / `icon-512.png` | PWA icons (`purpose: any`). |
| `icon-192-maskable.png` / `icon-512-maskable.png` | Android adaptive icons (`purpose: maskable`). |
| `icon.svg` | The vector NG monogram used as the in-page logo. |
| `og-card.png` / `og-card.svg` | 1200×630 unified business-card share image (Open Graph + Twitter Card + iMessage). |

---

## Deploy

This is a static site. Drop the contents of this folder at the **root** of any static host and point `nepa-gold.com` at it. Three good options:

### Option A — GitHub Pages (free, easy)
1. Create a repo, e.g. `nepa-gold/nepa-gold.com`.
2. Commit every file in this folder to the root of `main`.
3. Settings → Pages → Source: **GitHub Actions** (or **Deploy from branch: main / root**).
4. Settings → Pages → Custom domain: `nepa-gold.com`. GitHub will create a `CNAME` file for you.
5. At your DNS provider, point:
   - `ALIAS` / `ANAME` `@` → `<your-username>.github.io`
   - `CNAME` `www` → `<your-username>.github.io`
6. Wait for **Enforce HTTPS** to become checkable (5–60 min). Check it. Done.

### Option B — Cloudflare Pages
1. New project → Connect repo (or upload directly).
2. Build command: *none*. Output directory: `/` (or wherever this folder lives).
3. Custom domain → `nepa-gold.com`. Cloudflare handles the cert.

### Option C — Netlify / Vercel
Drag-and-drop the folder. Add the custom domain in the dashboard.

> **HTTPS is required** for the service worker to register. Every option above gives you free HTTPS automatically.

---

## How the calculator works

- **Live spot prices** are fetched from `api.gold-api.com` (free, no key, CORS-enabled).
  - If the call fails (offline, blocked, downtime), the page silently falls back to baked-in defaults from late April 2026: gold ~$4,650/oz t, silver ~$73.50/oz t.
  - The user can always tap **Edit** on either price chip to override the value manually.
- **Karat factors:** 10K=0.4167, 14K=0.5833, 18K=0.7500, 22K=0.9167, 24K=0.9990.
- **Silver fineness:** .999 (default), .925 sterling, .900 coin, .800 continental.
- **Weight units:** grams / dwt / troy oz (segmented control, all units convert internally to grams).
- **Offer slider:** 85–90% of spot value (i.e. **10–15% below spot, exactly as advertised**). Default 87.5%.
- The **Email this estimate** button writes the entire breakdown into the mailto body, so when someone taps it they get a fully-prefilled email to `sell@nepa-gold.com` with the metal type, weight, purity, percent of spot, and computed payout. No form submission backend needed — the user's mail client handles it.

## CTA architecture (no dead links)

Every interactive element on the page resolves to **exactly one of three things**:

1. `mailto:sell@nepa-gold.com` (with prefilled subject + body) — the primary CTA, repeated in hero, calculator, and final banner.
2. `tel:+15706777971` — the click-to-call pill in the upper-right, plus a few secondary spots.
3. Internal anchor scroll (`#estimator`, `#top`).

There are **no `href="#"`, no `javascript:` URLs, no fake buttons, no broken anchors**. Auditable with:
```bash
grep -nE 'href="#"|href="javascript:|onclick=""' index.html
# (returns nothing)
```

## SEO / sharing

- **Schema.org `LocalBusiness` JSON-LD** is in `<head>` with the phone, email, hours, and every NEPA county served.
- **Open Graph + Twitter Card** both point to the same `og-card.png` — that's your unified business card across iMessage, X, Facebook, LinkedIn, Slack, Discord, etc.
- `theme-color` is `#0a0907` (deep noir) — matches the hero on iOS Safari.

## Updating spot prices manually

If `api.gold-api.com` ever changes, edit the constants near the bottom of `index.html`:
```js
const FALLBACK_GOLD_USD_PER_OZT = 4650.00;
const FALLBACK_SILVER_USD_PER_OZT = 73.50;
```
Bump these every few months and re-deploy. The page also lets visitors edit prices live in the UI.

## Updating the service worker

When you ship a meaningful change, bump the version string at the top of `sw.js`:
```js
const VERSION = 'nepa-gold-v1.0.0';  // change to v1.0.1, etc.
```
This invalidates the old cache and pulls the new app shell on the next visit.

---

## Branding constants (for future work)

```
Colors
  --noir         #0a0907   (background)
  --obsidian     #14110d
  --ink          #1c1812
  --champagne    #e6c878
  --gold         #d4af37   (primary gold)
  --gold-deep    #b8860b
  --bullion      #f4d68a
  --gold-bright  #fff1c0
  --cream        #faf3e0   (text on dark)

Type — iOS native system stack (San Francisco). Zero web fonts loaded.
  Display: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, ...
  Body:    -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, ...
  Mono:    ui-monospace, "SF Mono", SFMono-Regular, Menlo, ...

  On iPhone/iPad/Mac → real SF Pro (identical to native iOS apps).
  On Windows/Android → graceful fallback to Segoe UI / Roboto.
  Italic is real SF italic, never synthesized (font-synthesis: none).

Easing: cubic-bezier(0.16, 1, 0.3, 1)
Glass:  backdrop-filter: saturate(180%) blur(22px); rgba(28,24,18,0.55) bg
```

---

Built for Solar Mason / NEPA-PRO GOLD.
Questions: `sell@nepa-gold.com` · `570-677-7971`
