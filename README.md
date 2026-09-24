# IBCOCO Quality Hairs — Full-Stack Rebuild

A from-scratch, fully custom-coded replacement for the current jeyharlem.com WordPress/WooCommerce/Elementor site, scaffolded from the Hair by Gifty full-stack template (React + Express) and rebranded/re-populated for IBCOCO Quality Hairs. Same cream/black/gold luxury aesthetic direction as the current live site — new codebase, new structure, fully owned (no WordPress, no page-builder lock-in).

## Stack
- Frontend: React 19 + Vite + Lucide Icons
- Backend: Node.js + Express
- Payments: **Stripe Checkout** (GBP) — chosen for this build; the live site currently also takes Paystack/Verve, see "Open items" below
- Persistence: **Postgres when `DATABASE_URL` is set** (see "Database" below), otherwise a JSON data store (`server/data/db.json`) — no code changes needed to switch, it auto-detects
- API: products, newsletter subscriptions, appointment requests, Stripe checkout/orders, contact messages, admin endpoints

## What's real vs. placeholder in this pass
Pulled live from jeyharlem.com on 2026-09-22 and wired in directly:
- 30 real products (name, price, sale price where applicable, product photo — see "Product images" below) in `server/data/db.json`
- Real FAQ copy (`client/src/data/content.js`)
- Real shipping/returns policy text (`client/src/pages/ShippingReturns.jsx`)
- Real WhatsApp number (+44 7506 297286) and social handles (Instagram/TikTok/Snapchat @IBCOCO or similar)
- Real hero taglines and brand phrases ("We Style, You Smile", "Pure Luxury", "Not Just Hair. A Standard.")

Still placeholder — needs your (or the client's) input before this goes live:
- **Product descriptions** — the live store's product pages weren't scraped individually (would've meant 30 extra page loads); every product currently has a generic placeholder description. I only pulled name/price/photo from the store's product-list API.
- **Contact email and street address** — nothing findable on the live site; `Contact.jsx` and the footer currently say so explicitly rather than guessing.
- **Testimonials** (`client/src/components/Testimonials.jsx`) — deliberately left as clearly-labeled placeholders. No real client reviews were supplied, and I won't fabricate customer quotes attributed to invented names — swap these for real ones (with permission) before launch.
- **Logo** — there's no real logo file in hand, so the header/footer currently use a text wordmark ("IBCOCO / Quality Hairs") instead of an image. Drop a real logo file into `client/public/` and swap it back to an `<img>` in `Header.jsx`/`Footer.jsx` if the client has one.
- **Category tagging** (Wigs / Lace Fronts / Hair Bundles / Hair Products) — the live site's product API didn't expose WooCommerce categories, so products were auto-sorted by keyword matching on the product name. Worth a manual pass in `server/data/db.json` against the real category assignments.
- **Product images are currently hot-linked** straight from `jeyharlem.com/wp-content/uploads/...` — fine for development, but download them into this project's own storage (or an image CDN) before the WordPress site is decommissioned, or the photos will go dark.

## Open item: Paystack / Verve
The live site's footer advertises Visa, Mastercard, Verve, Paystack and Apple Pay. This build's checkout only wires up **Stripe** (per your call) — Stripe doesn't support Verve and isn't the natural fit for Naira transactions the way Paystack is. If IBCOCO's customer base skews Nigerian/African (Verve + Paystack usually signal that), it's worth revisiting — say the word and I'll wire up Paystack as a second checkout option.

## Run locally
Requirements: Node.js 20+, a free [Stripe](https://dashboard.stripe.com/register) account for test keys.

```bash
npm run install:all
cp server/.env.example server/.env
# then edit server/.env and add your Stripe test keys (see "Stripe setup" below)
npm run dev
```

Frontend: http://localhost:5173
API: http://localhost:4000

Production build:
```bash
npm run build
npm start
```

## Database
By default the site stores everything (products, orders, newsletter signups, appointments, messages, admin users) in a single file, `server/data/db.json`. That's fine for getting started, but a real database is safer for production (no risk of the file getting corrupted or wiped on redeploy, and it's the standard setup a host expects).

To switch to Postgres:
1. Get a Postgres database. Easiest free options: [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) — both give you a connection string in under a minute. (Or use Hostinger's own database if your plan includes Postgres.)
2. Copy that connection string into `server/.env` as `DATABASE_URL=postgres://...`.
3. Run `cd server && npm install` (pulls in the `pg` package).
4. Start the server as normal (`npm run dev` or `npm start`).

That's it — on first connection the server automatically creates the tables it needs, and if it finds your existing `server/data/db.json` still has data in it, it imports everything from that file into Postgres one time only (your 30 products, settings, etc. carry over — nothing is lost). After that, `db.json` is no longer read or written; Postgres is the source of truth.

Leave `DATABASE_URL` unset and nothing changes — the site keeps using `server/data/db.json` exactly as before. This is fully backward compatible.

## Images
Product photos, category tiles, hero slides, the logo, and 5 more site photos (homepage atelier teaser, Contact page, About page portrait, and 2 Hair Care Guide photos) can all be uploaded straight from the admin panel (Settings → "Site Photos", and each product's edit screen) — no code or redeploy needed. Uploaded files are saved to `server/public/uploads/` and served at `/uploads/...`. **This folder needs to survive redeploys** — back it up / make sure your hosting setup doesn't wipe it when you push new code.

Some product photos still hotlink the old jeyharlem.com WordPress site. Settings → "Move All Images Onto This Site" downloads every external image currently in use (products, variants, categories, hero, logo, site photos) into this site's own storage in one click — safe to run more than once, already-local images are skipped.

**Recommended image sizes** (upload the largest of these if unsure — they crop to fit their frame, so oversized is safe, undersized will look blurry):
- Hero slides (homepage banner): 1920×1080px (desktop), plus an optional 800×450px mobile crop for faster phone loading
- Category tiles (homepage & shop filters): 1000×1250px (4:5 portrait)
- Logo: 400×120px transparent PNG (roughly — anything wider-than-tall works; it's shown at a small fixed height)
- Product photos (main + variants): 1200×1200px square, plain background
- Site photos — Homepage atelier, Contact page, About page portrait, Hair Care Guide photos: 1200×1500px (4:5 portrait)

## Scrolling ticker & texture finder
The scrolling strip at the top of every page ("Worldwide Shipping · 100% Raw Human Hair · …") is editable from Settings → "Scrolling Ticker Text" — add, edit, remove or reorder phrases, no code changes needed. It also now fades out after ~1 second of no scrolling and reappears while the page is being scrolled, so it doesn't sit on screen permanently.

The homepage "Find Your Texture Match" tool scopes its "Shop This Texture" button to the Wigs category (instead of mixing in care products/closures). Full texture-vs-category differentiation (Body Wave vs. Deep Curl vs. Silk Straight actually showing different products) needs the real texture assigned per product in the catalogue — right now 29 of 30 products are tagged "straight" in the seed data, so send over the real texture per product when you have it and this can be tightened further.

## Hosting note
This is a Node.js app (Vite-built static frontend + an Express API), not a PHP/WordPress site — the current Hostinger plan needs to support Node.js hosting (or a VPS) for the `server/` half to run; the built `client/dist` can be served as static files from almost anything. Worth checking your Hostinger plan's Node.js support before deploy.

## Deployment — Netlify (frontend) + a Node host (backend)
Netlify only runs static sites and short-lived serverless functions — it can't run the always-on Express API, admin panel, checkout, or the self-hosted `server/public/uploads/` folder this app depends on. So this ships as two pieces: `client/` on Netlify, `server/` on a real Node host (Render, Railway, Fly.io, or a VPS). `netlify.toml` at the project root is already set up to proxy `/api/*` and `/uploads/*` through to wherever the backend ends up, so the split is invisible to visitors. Full step-by-step instructions were given in chat — ask again here if you need them repeated.

## Stripe setup
1. Get your test **Secret key** from the Stripe Dashboard → Developers → API keys, and put it in `server/.env` as `STRIPE_SECRET_KEY`.
2. For webhooks locally, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run `stripe listen --forward-to localhost:4000/api/webhooks/stripe` — it prints a signing secret; put that in `STRIPE_WEBHOOK_SECRET`.
3. In production, add a webhook endpoint in the Stripe Dashboard pointing at `https://yourdomain.com/api/webhooks/stripe`, listening for the `checkout.session.completed` event, and use the signing secret it gives you.
4. Set `CLIENT_URL` in `server/.env` to wherever the frontend is served from — Stripe redirects the customer back there after payment.
5. Without keys configured, the site still runs — checkout requests are still recorded as pending orders, but the customer sees a "Stripe is not configured yet" message instead of being sent to pay.

## API endpoints
- `GET /api/health`
- `GET /api/products`
- `POST /api/newsletter` `{ "email": "..." }`
- `POST /api/appointments` `{ name,email,phone,date,time,service,notes }` (booking UI exists in the codebase but isn't linked from the main nav — the live site doesn't currently offer installs booking; wire the "Book Now" button back into `Header.jsx`/`Home.jsx` if you want it)
- `POST /api/checkout` `{ customer, items }` — creates a Stripe Checkout Session, returns `{ url }`
- `POST /api/webhooks/stripe` — marks the matching order as paid (Stripe signature verified)
- `POST /api/messages` `{ name,email,phone,message }`
- `GET /api/admin/summary` and `GET /api/admin/newsletter|appointments|orders|messages` with `x-admin-key`

## Before launch
Add live Stripe keys and a live webhook endpoint, fill in the placeholders listed above, migrate product images off the old WordPress uploads folder, and (recommended) set `DATABASE_URL` to switch on Postgres — see "Database" above.
