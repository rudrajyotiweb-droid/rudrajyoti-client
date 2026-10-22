# Decisions (UI phase)

| # | Decision | Why |
|---|---|---|
| 1 | **Colour palette follows the client's mock** (`#D32F2F` red, `#FFF9F0` cream, `#EDE2D6` sand, `#000/#1A1A1A` text) instead of BRD §9.2's `#B3121B`. BRD's maroon (`#9E1C1C`), gold accent and border tokens are kept. | Client said "use the palette I gave"; the mock is the latest reference. Change in `src/app/globals.css` `:root` only. |
| 2 | Fonts: Playfair Display + **Inter** (mock) rather than Poppins. | Matches the mock's typography panel. |
| 3 | Brand name, phone, email, stats in one place: `src/data/site.ts`. | Brand is still "to be provided" (BRD §15). Stats are placeholders until real numbers come from admin. |
| 4 | Images from **Wikimedia Commons**, not srimandir.com. | BRD §1 forbids copying Sri Mandir's photos (copyright). Commons images are free-licensed; attributions in `ATTRIBUTIONS.md` and `/credits`. |
| 5 | Reviews come from the API (approved only). Seeded demo reviews are flagged `isDemo` and the API hides them in production ("Be the first to review" is shown instead). | BRD §6.13 — no fake reviews in production. |
| 6 | Hand-written `public/sw.js` instead of Serwist (also caches `/media` images). | Serwist needs webpack; the app builds with Turbopack. |
| 7 | Package manager is **pnpm** (installed globally); `pnpm-workspace.yaml` whitelists build scripts. | pnpm 10+ blocks postinstall scripts by default. |
| 8 | ~~Demo date shifting~~ — removed. Dates come from the database and render with `<IstDate>`. | Backend phase. |
| 9 | Phone-OTP login through the API (Message Central); tokens in `useAuth` (localStorage) with automatic refresh. Booking asks for login before the sankalp step and keeps the selection in sessionStorage. Account pages redirect to `/login?next=…`. Google sign-in button removed until it is implemented. | BRD §6.5, §6.11. Bearer tokens instead of cookies because the API is on another domain. |
| 10 | shadcn/ui not installed — small custom primitives in `src/components/ui`. | Fewer dependencies for a fully custom look; can adopt shadcn later without conflicts. |
| 11 | Page transition is pure CSS (`template.tsx`), section reveals use Framer Motion. | Pages never stay invisible if JS is slow; all motion respects `prefers-reduced-motion`. |
| 12 | Bengali (bn) switcher is visual only. | next-intl wiring is Phase 6. |
| 13 | ~~Static export~~ → **Next.js server rendering with ISR** (`trailingSlash: true` kept). Headers moved from `public/_headers` to `next.config.ts`. Netlify drag-and-drop no longer works — use Git deploy / Vercel / a Node host. | Planned in the UI phase: pages must show data added in the admin without a rebuild. |
| 14 | Payments: Paytm JS Checkout in an overlay (`merchant.redirect = false`); the final status always comes from `POST /payments/verify`. A failed payment retries on the same booking/order (`/checkout/retry`). `/payment/status` handles Paytm's redirect fallback and bank-pending payments (polls for ~2 min). | Server-verified payments; no duplicate bookings on retry. |
| 15 | Payment method tiles (UPI/Card/…) replaced by one "Pay securely with Paytm" card. | Paytm's checkout shows the methods itself; picking one beforehand did nothing. |
| 16 | Contact details, stats, shipping fees and the bottom nav are read from Admin → Settings via `SiteProvider`; brand name/tagline/logo stay static in `data/site.ts`. | Contact and fees change often; the brand identity changes with a redeploy. |
| 17 | Policy pages (privacy, terms, refund, shipping) are CMS pages at `/pages/[slug]`, written in Markdown in the admin and rendered by a small safe renderer (no raw HTML). | BRD §7.11. |
| 18 | Contact form creates a support ticket; anonymous traffic source is counted once per session for Admin → Reports. | Real follow-up instead of a dead form; no personal tracking. |
| 19 | Everything the design shows now comes from the API: page header images, the home hero deity image, the install-app photo and the How-it-works steps live in **Admin → Settings → Website content**; the Shop promo block and the puja-listing strip come from **Banners** (Store / Puja listing); all FAQs come from **Content → FAQs**. The bundled `public/assets/images` are only an offline fallback (`lib/settings.ts`). | Client: all design data with images must be in the database and editable from admin. |
