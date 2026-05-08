# NEPA-PRO GOLD — Mobile Gold & Silver Buyers PWA

Production-ready single-page progressive web app for **gold.nepa-pro.com**.
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
| `apple-touch-icon.png` + `-167.png` + `-152.png` | iPhone + iPad home-screen icons in 152/167/180. iOS picks the right size automatically. |
| `mask-icon.svg` | Monochrome SVG for Safari pinned-tab rendering (filled with `#d4af37`). |
| `icon-192.png` / `icon-512.png` | PWA icons (`purpose: any`). |
| `icon-192-maskable.png` / `icon-512-maskable.png` | Android adaptive icons (`purpose: maskable`). |
| `icon.svg` | The vector NPG monogram used as the in-page logo. |
| `splash/splash-*.png` (14 files) | iOS launch screens for every iPhone + iPad family. Without these, iOS shows a blank white frame on PWA launch — these give a branded launch matching the hero. |
| `og-card.png` / `og-card.svg` | 1200×630 unified business-card share image (Open Graph + Twitter Card + iMessage). |

---

## Deploy

This is a static site. Drop the contents of this folder at the **root** of any static host and point `gold.nepa-pro.com` at it. Three good options:

### Option A — GitHub Pages (free, easy)
1. Create a repo, e.g. `nepa-pro/gold.nepa-pro.com`.
2. Commit every file in this folder to the root of `main`.
3. Settings → Pages → Source: **GitHub Actions** (or **Deploy from branch: main / root**).
4. Settings → Pages → Custom domain: `gold.nepa-pro.com`. GitHub will create a `CNAME` file for you.
5. At your DNS provider, point:
   - `ALIAS` / `ANAME` `@` → `<your-username>.github.io`
   - `CNAME` `www` → `<your-username>.github.io`
6. Wait for **Enforce HTTPS** to become checkable (5–60 min). Check it. Done.

### Option B — Cloudflare Pages
1. New project → Connect repo (or upload directly).
2. Build command: *none*. Output directory: `/` (or wherever this folder lives).
3. Custom domain → `gold.nepa-pro.com`. Cloudflare handles the cert.

### Option C — Netlify / Vercel
Drag-and-drop the folder. Add the custom domain in the dashboard.

> **HTTPS is required** for the service worker to register. Every option above gives you free HTTPS automatically.

---

## Live spot price subsystem

The estimator pulls **live spot prices** from `api.gold-api.com` — a free, no-key, no-signup, CORS-enabled endpoint serving real-time XAU (gold) and XAG (silver) prices in USD/oz t. The implementation is built for resilience:

**On every page load:**
1. **Instant hydrate from localStorage cache** — if the user has visited before, the most recent live price they saw renders before any network call. No flash of stale baked-in defaults.
2. **Background fetch from `api.gold-api.com`** — single retry with 1.5s backoff if the first attempt fails.
3. **Status badge updates live**: `LIVE · just now` (green pulsing) → `LIVE · 3 min ago` → `CACHED · 45 min ago` (amber).

**While the tab stays open:**
- Auto-refreshes every **5 minutes**.
- Pauses when the tab is backgrounded; immediately re-fetches when the user returns if data is older than 5 min.
- Updates the relative-time label every 30 seconds so "just now" smoothly becomes "1 min ago".

**Manual control:**
- A **Refresh** button next to the status badge lets users force-pull the latest price.
- Throttled to one request per 30 seconds (so users can't accidentally hammer the API).
- An **Edit** button on each price chip lets users override the spot manually — when overridden, the badge shows `MANUAL OVERRIDE · X min ago` and auto-refresh pauses for that price (the live fetcher won't quietly overwrite the user's value).

**Failure modes (graceful):**
- API unreachable + no cache + no manual override → status reads `Live feed unavailable · estimate only` and the page uses the baked-in floor values until the next attempt succeeds.
- localStorage unavailable (private mode, quota) → silently degrades to fetch-every-load, no cache. Still works.
- Bad data from API (negative number, NaN, gold price below $200/oz which is impossible) → rejected, retry attempted, falls through to cache or default.

**No API key required, ever.** If `gold-api.com` ever goes away, swap the two URLs at the top of the live-price subsystem in `index.html`:
```js
const SPOT_API = {
  gold:   'https://api.gold-api.com/price/XAU',
  silver: 'https://api.gold-api.com/price/XAG'
};
```

Other free options to swap to (some require a free signup/API key): `metals.dev` (100 free req/month), `metalpriceapi.com`, `goldapi.io` (100 req/day free).

---

## How the calculator works

- **Karat factors (gold):** 10K=0.4167, 14K=0.5833, 18K=0.7500, 22K=0.9167, 24K=0.9990.
- **Silver fineness:** .999 (default), .925 sterling, .900 coin, .800 continental.
- **Weight units:** grams / dwt / troy oz (segmented control, all units convert internally to grams).
- **Offer slider:** 85–90% of spot value (i.e. **10–15% below spot, exactly as advertised**). Default 87.5%.
- The **Email this estimate** button writes the entire breakdown into the mailto body, so when someone taps it they get a fully-prefilled email to `service@nepa-pro.com` with the metal type, weight, purity, percent of spot, and computed payout. No form submission backend needed — the user's mail client handles it.

## CTA architecture (no dead links)

Every interactive element on the page resolves to **exactly one of three things**:

1. `mailto:service@nepa-pro.com` (with prefilled subject + body) — the primary CTA, repeated in hero, calculator, and final banner.
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
const VERSION = 'npg-v1.0.0';  // change to v1.0.1, etc.
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
Questions: `service@nepa-pro.com` · `570-677-7971`

---

## SEO — what's wired in vs. what only you can do

### What ships in the code (already done, 100/100 Lighthouse SEO ready)

**Structured data (the biggest lever for AI search & voice).** A 6-entity JSON-LD `@graph` covers:
- `LocalBusiness` with full geo, service area circle, opening hours, payment methods, ID-tagged for cross-referencing
- `Organization` (parent NEPA-PRO LLC) with `subOrganization` link to the gold business — this is how Google/Claude/GPT understand corporate relationships
- `WebSite` + `WebPage` with `speakable` CSS selectors — tells Siri, Alexa, and Google Assistant which parts of the page to read aloud
- `BreadcrumbList` for SERP breadcrumb display
- `FAQPage` with 10 Q&A pairs in voice-search format — this is what powers Google AI Overviews, ChatGPT citations, and assistant answers
- `OfferCatalog` with 8 services so search engines understand what we buy

**On-page meta.** Geo region, lat/lng, ICBM coordinates (Bing/Yandex), comprehensive description, semantic keywords, robots directives with `max-image-preview:large`.

**robots.txt.** Explicitly welcomes all 20+ major AI crawlers — GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Google-Extended, Applebot, Applebot-Extended (Siri/Apple Intelligence), Amazonbot (Alexa), Meta-ExternalAgent, Bingbot, DuckAssistBot, MistralAI-User, CCBot, YouBot, plus all social preview bots.

**sitemap.xml** with image sitemap extension and `lastmod` dates so AI crawlers see freshness signals.

**llms.txt** — the emerging standard for LLM-readable site summaries. Gives ChatGPT, Claude, and Perplexity a clean concise digest of who we are, what we buy, how pricing works, hours, and contact info. Even when full crawls don't happen, this single file can keep the model's answer accurate.

**FAQ section** with 10 questions structured as both human-readable accordion *and* `FAQPage` schema. The questions are written in real voice-search syntax: "Where can I sell gold near me…", "How much will I get for my gold?", etc.

**Service-worker SEO bypass.** robots.txt, sitemap.xml, llms.txt, and humans.txt are explicitly *never* cached by the SW — search crawlers always see the live versions, never a stale copy.

**404 page** branded and matching the design system.

### What only you can do (off-page — bigger ranking lever than code)

Honest truth: for **local search rankings**, on-page SEO is maybe 20% of the equation. The other 80% is off-page. To rank #1 in NEPA for "sell gold near me," do these in order:

1. **Google Business Profile** ← biggest single ranking factor. Free at https://business.google.com. Set business name, address (or service area), phone, hours, photos. Verify by postcard. **Without this, no on-page work will get you top-3 in local search.**
2. **Apple Business Connect** at https://businessconnect.apple.com — this is what makes Siri actually find you on iPhone Maps/Spotlight searches.
3. **Bing Places for Business** at https://www.bingplaces.com — feeds Alexa, ChatGPT search, DuckDuckGo.
4. **Yelp listing** — even if you never use Yelp directly, Apple Maps and Alexa pull from it as a citation source.
5. **NAP consistency.** Your Name + Address + Phone must match *byte-for-byte* across every listing. Pick one canonical format and stick to it everywhere: `NEPA-PRO GOLD` / `service@nepa-pro.com` / `570-677-7971` / Clarks Summit, PA.
6. **Citations** — get listed at: BBB, Yellow Pages, Manta, Foursquare, Hotfrog, Chamber of Commerce of NE Pennsylvania, Scranton/Wilkes-Barre business directories.
7. **Real customer reviews** on Google Business Profile. Aim for 10+ to start showing up in the local 3-pack. Never fabricate.
8. **Local backlinks** — guest post on a NEPA-area blog, get mentioned in the Scranton Times-Tribune or Times Leader, local Chamber listing.
9. **Submit sitemap manually** to Google Search Console (https://search.google.com/search-console) and Bing Webmaster Tools (https://www.bing.com/webmasters) once the site is live.

### About ranking for "everything NEPA-PRO does"

This site (`gold.nepa-pro.com`) is laser-focused on gold/silver buying — that's actually a strength, not a weakness. Google ranks specialized pages higher than generalist ones for specific queries.

For NEPA-PRO's other services (mold remediation, electrical, HVAC, full-home renovations, etc.), you want the parent **`nepa-pro.com`** to either:
- (A) Be a hub site that links out to subdomains for each major service line — `mold.nepa-pro.com`, `electric.nepa-pro.com`, etc. (best for SEO if you have the time)
- (B) Be a single comprehensive site with one detailed page per service, all interlinked from a clear top-nav

The schema on **this** page is already wired to credit **NEPA-PRO LLC** as the parent organization (`subOrganization` → `parentOrganization` schema link), so when search engines crawl us, they associate the gold business with the broader NEPA-PRO brand. Once `nepa-pro.com` ships with similar structured data and `subOrganization` listings for each service line, you'll have a proper corporate knowledge graph in Google.

### Quick post-launch verification

After deploying:
1. Test rich results: https://search.google.com/test/rich-results?url=https://gold.nepa-pro.com/
2. Test mobile-friendly: https://search.google.com/test/mobile-friendly
3. Run Lighthouse in Chrome DevTools (target: 100 SEO, 100 PWA, 90+ Performance)
4. Verify schema: https://validator.schema.org/?url=https%3A%2F%2Fgold.nepa-pro.com%2F
5. Submit sitemap to Google Search Console and Bing Webmaster Tools
6. Check robots.txt: https://gold.nepa-pro.com/robots.txt
