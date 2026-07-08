# Project Specs — Horizont Visuals "Design Express" funnel

_The blueprint. Read this and `CLAUDE.MD` before changing anything._

## What the app does & who uses it

A single-page **opt-in / order funnel** for Horizont Visuals, an interior-design
studio. A visitor (homeowner thinking about renovating) uploads photos of a room,
pays **49 €**, and receives a photorealistic redesign in a classic-contemporary
style within 1–2 working days.

- **Visitor** → fills the form on `/`, pays via Stripe, lands on `/multumire`.
- **Studio (Ruben)** → receives the order + photos, sends the render by email.

There is **no login and no dashboard** in this build — it is a lead + payment
funnel, nothing more.

## Tech stack

| Layer      | Choice                                            |
| ---------- | ------------------------------------------------- |
| Language   | TypeScript                                        |
| Framework  | Next.js 14 (App Router)                           |
| Styling    | Tailwind CSS + brand tokens (`tailwind.config.ts`)|
| Animation  | GSAP + ScrollTrigger (`@gsap/react`)              |
| Payments   | Stripe Checkout (hosted redirect)                 |
| Fonts      | `next/font` — Cormorant Garamond + Inter          |
| Hosting    | Vercel (target)                                   |

> The template `CLAUDE.MD` lists Supabase. This funnel does **not** use Supabase
> yet — see "Photo storage" below for when/why we would add it.

## Pages & user flows (all public)

| Route                             | Type    | Purpose                                             |
| --------------------------------- | ------- | --------------------------------------------------- |
| `/`                               | Static  | The opt-in page (hero pitch + offer form).          |
| `/multumire`                      | Dynamic | Thank-you page. Stripe's `success_url`. Verifies the session server-side. |
| `/api/create-checkout-session`    | Dynamic | POST: validates the order, stores photos, creates the Stripe session, returns `{ url }`. |

**Happy path:** fill form → click CTA → `POST /api/create-checkout-session` →
redirect to Stripe → pay → Stripe redirects to `/multumire?session_id=…`.

**Error paths:** invalid name/email/consent → `400` with a Romanian message shown
under the button; Stripe/network failure → `500` with a generic Romanian message;
photo storage failure never blocks payment (logged, skipped).

## Data models & where data is stored

No database. Per order we capture:

```
name, email, note (≤300 chars), consent, photos[] (≤5, JPG/PNG)
```

- **Order metadata** (name, email, note, photo count, orderId) → Stripe session
  `metadata` + a local `uploads/<orderId>/order.json`.
- **Photos** → saved to `uploads/<orderId>/` on the server (see below).

## Photo storage — important

This build writes uploads to the local `/uploads` folder. **That works in local
dev but not on Vercel**, where the filesystem is ephemeral/read-only. The write is
wrapped in try/catch so a failure is logged and payment still completes.

**Production upgrade path:** swap the filesystem write in
`app/api/create-checkout-session/route.ts` for **Supabase Storage** (matches the
house stack) or Vercel Blob / S3. Store a signed reference, not a public URL.

## Hero before/after photos

The page shows `public/assets/before.jpg` and `public/assets/after.jpg`. Until you
add them, the hero shows a warm placeholder block (no broken image). Drop the two
photos in and they appear automatically — no code change.

## Third-party services

- **Stripe** — Checkout. Needs `STRIPE_SECRET_KEY` (test key while developing).
  No webhook required for this funnel; the thank-you page verifies the session on
  load. Add a webhook later for guaranteed server-side fulfilment.

## Environment variables

See `.env.example`; `.env.local` holds your real values (never committed).

- `STRIPE_SECRET_KEY` — Stripe dashboard → Developers → API keys.
- `NEXT_PUBLIC_BASE_URL` — `http://localhost:3000` locally; your domain in prod.
- `DESIGN_EXPRESS_PRICE_CENTS` — price in euro cents (default `4900` = 49 €).

## What "done" looks like

- [x] `npm run build` passes with no TypeScript errors.
- [x] `/` renders the design pixel-faithfully (ivory/navy/gold, Romanian copy).
- [x] Form validates (name, email, consent) and enforces ≤5 JPG/PNG photos.
- [x] Live 300-char note counter (warns near the limit).
- [x] CTA POSTs the order and redirects to Stripe Checkout.
- [x] `/multumire` shows the on-brand confirmation and verifies the session.
- [x] GSAP reveal-on-scroll (12px rise + fade) + staggered hero entrance.
- [ ] Real Stripe key added and one live test payment completed (needs your key).
- [ ] Real before.jpg / after.jpg added to public/assets.
- [ ] Photo storage moved to Supabase/Blob before production deploy.
