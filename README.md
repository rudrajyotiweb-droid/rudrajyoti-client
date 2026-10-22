# Rudra Jyoti — Client Site

Devotee-facing PWA for puja booking, chadhava and the devotional store. All content, prices, images, bookings, orders and payments come from the **backend API** (`../backend`).

## Run

```bash
pnpm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000
pnpm dev --port 3123         # API must be running (cd ../backend && pnpm dev)
pnpm build && pnpm start     # production server
```

The API's `CLIENT_URL` / `CORS_EXTRA_ORIGINS` must include the URL this site runs on.

## How data flows

- Catalog pages (home, puja, chadhava, temples, store) are **server-rendered with ISR**: cached and refreshed from the API every 30–300 s, so admin changes appear without a rebuild. New slugs render on first visit.
- The booking page is always fresh (prices and cutoff must match what the server charges).
- Account, cart, checkout and login call the API from the browser with the devotee's token (auto-refreshed).
- Images are `/media/...` URLs, proxied by `next.config.ts` to the API (they are stored in MongoDB).
- If the API is unreachable, pages show a friendly "We'll be right back" screen instead of crashing.

## Deploy

This is now a **Next.js server app** (it was a static export in the UI phase). On Netlify use Git deploy (Next.js runtime is detected automatically) or deploy to Vercel / any Node host with `pnpm build && pnpm start`. Set `NEXT_PUBLIC_API_URL` (and optionally `API_URL`) in the host's environment.

Open on your phone (same Wi-Fi): `http://<your-ip>:3123` (also add that URL to the API's CORS list).

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · Framer Motion · Lucide · Zustand (cart, wishlist, auth session, UI prefs — persisted to localStorage) · Embla carousel.

## Structure

```
src/app/(site)/          all public + account pages (shared header, bottom tab bar, footer)
  page.tsx               home
  puja/ [slug]/ book/    listing, detail (BRD §6.4), multi-step booking flow
  chadhava/ temples/     listings + details
  store/ cart/ checkout/ shop, category, product detail, cart, checkout
  account/               user panel: dashboard, bookings, orders, family, addresses,
                         wishlist, reviews, notifications, profile, support
  login/                 phone OTP (Message Central via the API)
  payment/status/        payment confirmation (Paytm redirect fallback, pending payments)
  pages/[slug]/          CMS policy pages (privacy, terms, refund, shipping)
src/app/manifest.ts      PWA manifest
public/sw.js             service worker (offline fallback, image SWR, static cache-first)
src/components/          ui primitives, layout chrome, cards, home sections, puja, store, account
src/lib/api.ts           API client (server ISR fetch + browser fetch with token refresh)
src/lib/payment.ts       Paytm JS Checkout / test-mode payment, always verified by the API
src/lib/site.tsx         live settings (contact, shipping fees, bottom nav) from Admin → Settings
src/lib/types.ts         API response types
src/data/                static copy only (brand fallback, nav, FAQs, filter vocabularies)
src/store/               Zustand: cart, wishlist (synced when signed in), auth session, UI
public/assets/images/    photos (see ATTRIBUTIONS.md)
```

## Things to try

- Sign in: any 10-digit mobile → OTP. In API test mode the OTP is `123456` (also printed in the API log).
- Book a puja → package → sankalp (saved family members, gotra) → add-ons → coupon `BHAKTI10` → Pay. In API test mode a "TEST MODE" dialog stands in for Paytm (OK = success, Cancel = failure, then retry).
- Shop → cart → checkout (online or COD) → Account → Orders (cancel before shipping).
- Account → Bookings shows live status and the puja video once the admin uploads it.

## Images

All photos are from Wikimedia Commons under CC / public-domain licenses — see `public/assets/images/ATTRIBUTIONS.md` and the `/credits` page. CC BY / BY-SA images require that credit to stay visible. Replace them with your own temple and product photography before launch.
