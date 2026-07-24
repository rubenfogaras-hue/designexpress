# Project Specs — Horizont Visuals "Design Express" funnel

_The blueprint. Read this and `CLAUDE.MD` before changing anything._

> **Status:** rewritten for the v2 design imported from Claude Design project
> `cef3ac94-4c46-4119-9bce-30061cb7260e`, file `Design Express.dc.html`.
> Awaiting approval before implementation.

## What the app does & who uses it

A single-page **landing page + order funnel** for Horizont Visuals, an interior-design
studio in Târgu Mureș. A homeowner planning a renovation uploads photos of their four
rooms, answers six short qualifying questions, pays **197 lei**, and receives
photorealistic redesigns in classic-contemporary style — presented **live on a call**.

- **Visitor** → reads the page, opens the wizard, uploads 4 photos, answers 6
  questions, enters contact details, pays via Stripe.
- **Studio (Ruben)** → receives the order, photos, answers and phone number;
  calls the customer to schedule the live presentation.

No login, no dashboard. Lead capture + payment only.

## What changed from v1

| | v1 (live today) | v2 (this design) |
| --- | --- | --- |
| Page | Form-only opt-in page | Full landing page; form moved into a modal wizard |
| Photos | 1–4 optional room slots | **All 4 required** (living, bucătărie, dormitor, baie) |
| Questions | none | **6 qualifying questions**, asked one at a time |
| Phone | not collected | **required** (min 9 digits) |
| Note | 300 chars, optional | 300 chars, optional ("mențiune") |
| Confirmation | Stripe's hosted page | **Branches on the budget answer** (see below) |
| Booking | none | "Rezervă discuția de 20 min" CTA on the green branch |
| Price | 197 lei | 197 lei (unchanged — same Stripe Payment Link) |

## Tech stack

| Layer      | Choice                                            |
| ---------- | ------------------------------------------------- |
| Language   | TypeScript                                        |
| Framework  | Next.js 14 (App Router)                           |
| Styling    | Inline styles + CSS custom properties from the design's `colors_and_type.css` |
| Payments   | Stripe **Payment Link** (hosted redirect)         |
| Database   | Supabase Postgres (`design_express_clients`)      |
| Storage    | Supabase Storage (`design-express-photos`, private) |
| Fonts      | `next/font` — Cormorant Garamond + Inter          |
| Hosting    | Vercel                                            |

## Pages & user flows (all public)

| Route | Type | Purpose |
| --- | --- | --- |
| `/` | Static | Landing page + wizard modal |
| `/multumire` | Static | Post-payment return page; shows the branched confirmation |
| `/api/submit-order` | Dynamic | POST: validates order, saves it, returns signed upload URLs |

**Happy path:** land on `/` → click any CTA → wizard opens →
**Step 1** upload all 4 room photos →
**Step 2** answer 6 questions one at a time, optional 300-char note →
**Step 3** name, email, phone, consent → click pay →
`POST /api/submit-order` saves the order and returns one signed upload URL per photo →
browser uploads the 4 photos straight to Supabase Storage →
redirect to the Stripe Payment Link (`client_reference_id` = orderId) →
customer pays → Stripe redirects to `/multumire` → branched confirmation.

**Error paths:** any validation failure returns `400` with a Romanian message shown
in the wizard. Upload failure blocks the redirect to Stripe (never take money for an
order with no photos). Stripe failure leaves the order row in place, unpaid.

## The confirmation branch

Question 4 asks the renovation budget. The design shows two different confirmations:

- **Green** — budget is `20.000–50.000 €`, `50.000–100.000 €`, or `Peste 100.000 €`.
  Message: photos received, live 20-minute presentation, plus a **"Rezervă discuția
  de 20 min"** button.
- **Red** — every other answer (`Sub 20.000 €`, `Încă nu știu`).
  Message: photos received, renders arrive by email in 1–2 working days, plus an
  Instagram follow link.

## Data model

Supabase table `design_express_clients`. v2 adds three columns:

```
id           uuid pk
order_id     uuid unique
name         text
email        text
phone        text          -- NEW, required
answers      jsonb         -- NEW, the 6 question answers
branch       text          -- NEW, 'green' | 'red', derived from answers.q4
note         text          -- the optional "mențiune"
photo_paths  text[]        -- 4 paths, one per room
created_at   timestamptz
```

RLS stays on with **no policies** — only the server's `service_role` key can read or
write. Photos stay in the private `design-express-photos` bucket, one folder per
`order_id`, each file named after its room.

**Note:** the order row is written *before* payment and there is no Stripe webhook,
so an abandoned checkout looks identical to a paid one. Match the Stripe payment's
`client_reference_id` to `order_id` to confirm who actually paid.

## Third-party services

- **Stripe** — Payment Link `https://buy.stripe.com/fZu28kc5F9fw9gPgtZ3F601`
  (197 RON, live). No secret key needed; the app only builds a URL.
- **Supabase** — Postgres + Storage. Server-side `service_role` key for writes and
  signed URLs; public anon key in the browser only to PUT to a signed URL.

## Assets to import

Eight images from the design project into `/public/assets/`:

```
20250925_144311.jpg   20250925_165738.jpg   20250925_165807.jpg   20250925_165816.jpg
Bathroom_renovation_...jpeg   Bedroom_interior_...jpeg
Classic-contemporary_luxury_kitc_...jpeg   Living_room_finished_...jpeg
```

## Environment variables

Unchanged, minus Stripe's secret key (no longer used):

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — server-only.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — browser upload only.

Dead and safe to delete from Vercel: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`,
`DESIGN_EXPRESS_PRICE_MINOR`, `DESIGN_EXPRESS_CURRENCY`, `NEXT_PUBLIC_BASE_URL`.

## Decisions taken (2026-07-23)

1. **No branched confirmation for now.** The wizard's green/red screens are not
   implemented. On submit the customer goes straight to Stripe and sees Stripe's own
   hosted confirmation, exactly as v1 does. The budget answer is still **stored** as
   `branch` so Ruben can spot high-intent leads in the database — it is simply not
   shown to the customer. Revisit once the funnel is proven.
2. **No booking tool.** The "Rezervă discuția de 20 min" CTA is dropped along with
   the branch screens. The promise of a call lives in Stripe's confirmation message
   instead, which is updated to say Ruben will ring the number provided.
3. **No refund promise.** The FAQ item "Dacă nu-mi place? Îți returnez cei 197 lei"
   is removed. Four FAQ items ship.

## What "done" looks like

Verified in Chromium (Playwright), API stubbed so nothing was written to the
live database:

- [x] `npm run build` passes with no TypeScript errors.
- [x] `/` renders every section of the design (top bar, hero, before/after,
      cum funcționează, value stack, FAQ, footer).
- [x] Wizard: all 4 photos required before Step 2; 6 questions gate Step 3; name +
      valid email + 9-digit phone + consent gate the pay button.
- [x] "Cum să fotografiez corect?" modal opens and closes.
- [x] FAQ accordion renders four items; the refund item is gone.
- [x] Reveal-on-scroll goes 0 → 1 for every section; nothing stays invisible.
- [x] Submit sends phone, answers and branch; branch is `green` for
      "Peste 100.000 €" and `red` for "Sub 20.000 €".
- [x] Redirect to Stripe carries `client_reference_id` and `prefilled_email`.
- [x] API rejects: no name, bad email, short/missing phone, no consent, fewer
      than 4 photos, duplicate room, non-image file.
- [x] Mobile: 0px horizontal overflow at 360px wide.

Still open (needs Ruben):

- [ ] Run `supabase/migrations/0002_add_phone_answers_branch.sql` — until then
      every submit fails on insert, because `phone`/`answers`/`branch` don't exist.
- [ ] Export the six missing photos from the design project into `/public/assets`.
- [ ] One real end-to-end purchase against the live database and Stripe.
