# Project Specs — Horizont Visuals "Design Express" funnel

_The blueprint. Read this and `CLAUDE.MD` before changing anything._

> **Status:** live. This file describes what is actually in the code as of
> 2026-08-06 — not a plan. If you change the code, change this too.

## What the app does & who uses it

A single-page **landing page + order funnel** for Horizont Visuals, an interior-design
studio in Târgu Mureș. A homeowner planning a renovation uploads photos of their four
rooms, answers six short qualifying questions, pays **297 lei**, and receives
photorealistic redesigns in classic-contemporary style — presented **live on a call**.

- **Visitor** → reads the page, opens the wizard, uploads 4 photos, answers 6
  questions, enters contact details, pays via Stripe.
- **Studio (Ruben)** → receives the order, photos, answers and phone number;
  calls the customer to schedule the live presentation.

No login, no dashboard. Lead capture + payment only.

## Tech stack

| Layer      | Choice                                            |
| ---------- | ------------------------------------------------- |
| Language   | TypeScript                                        |
| Framework  | Next.js 14 (App Router)                           |
| Styling    | Inline styles + CSS custom properties in `app/globals.css` |
| Payments   | Stripe **Payment Link** (hosted redirect)         |
| Database   | Supabase Postgres (`design_express_clients`)      |
| Storage    | Supabase Storage (`design-express-photos`, private) |
| Email      | Titan SMTP via `nodemailer` (`lib/email.ts`)      |
| Fonts      | `next/font` — Cormorant Garamond + Inter          |
| Hosting    | Vercel (project `designexpress`)                  |

Tailwind is installed and its directives sit at the top of `globals.css`, but the
page itself is written in inline styles + CSS variables. Only `font-sans` is used
as a class. Don't add Tailwind utilities to landing components — match what's there.

## Pages & user flows (all public)

| Route | Type | Purpose |
| --- | --- | --- |
| `/` | Static | Landing page + wizard modal |
| `/multumire` | Static | Unindexed thank-you page. **Not in the paid flow** — the Payment Link uses Stripe's hosted confirmation and never redirects here. Kept in case that changes. |
| `/api/submit-order` | Dynamic | POST: validates the order, saves it, returns signed upload URLs |
| `/api/stripe-webhook` | Dynamic | POST: Stripe pings this when a payment completes; sends the confirmation email |

### Landing page sections

Assembled in `components/LandingPage.tsx`; one file per section in
`components/landing/`: `TopBar`, `Hero`, `BeforeAfter`, `HowItWorks`,
`ValueStack`, `Faq`, `SiteFooter`. Every CTA on the page opens the same
`Wizard`. Shared type/button styles live in `components/landing/styles.ts`.

All four before/after photos are `BeforeAfterSlider` — one frame with a
draggable divider, built on a transparent `<input type="range">` so mouse,
touch, tap-to-jump and arrow keys all work. Roughly 95% of traffic is mobile,
and the slider halves the height each pair used to take.

**Happy path:** land on `/` → click any CTA → wizard opens →
**Step 1** upload all 4 room photos (generic slots — see below) →
**Step 2** answer 6 questions one at a time, optional 300-char note →
**Step 3** name, email, phone, consent → click pay →
`POST /api/submit-order` saves the order and returns one signed upload URL per photo →
browser uploads the 4 photos straight to Supabase Storage →
redirect to the Stripe Payment Link (`client_reference_id` = orderId) →
customer pays → Stripe shows its own hosted confirmation → the webhook emails the
customer.

**Error paths:** any validation failure returns `400` with a Romanian message shown
in the wizard. Upload failure blocks the redirect to Stripe (never take money for an
order with no photos). Stripe failure leaves the order row in place, unpaid.

## The four room slots

The wizard's slots are **generic**: `camera1`…`camera4`, labelled "Camera 1"…
"Camera 4". They used to be Living / Bucătărie / Dormitor / Baie, which lost
customers whose rooms were a dining room, an office or a second bedroom.

The customer picks any four rooms. The keys are the filenames in Storage
(`<orderId>/camera1.jpg`) and are validated by `ROOM_KEYS` in
`app/api/submit-order/route.ts` — **wizard and API must always agree.**

Orders placed before 2026-08-27 have the old `living/bucatarie/dormitor/baie`
paths; nothing migrates them, and nothing needs to.

The before/after photos on the page still carry real room names (Dormitor,
Living, Bucătărie, Baie) — those are Ruben's own finished projects, not slots.

## The offer (single source of truth: the code)

**297 lei.** The number appears in `Wizard.tsx` (header, total, pay button),
`ValueStack.tsx` (price block + CTA), `SiteFooter.tsx` (CTA), `app/layout.tsx`
(meta description) and `app/multumire/page.tsx`. Change all of them together.

The value stack (`ValueStack.tsx`) lists five **included** items:

| # | Item | Value |
| --- | --- | --- |
| 1 | Cele 4 camere transformate | 400 lei |
| 2 | Discuție live 1-la-1 cu designerul *(highlighted row)* | 500 lei |
| 3 | Moodboard | 200 lei |
| 4 | Harta luminii | 100 lei |
| 5 | Interior personalizat | 50 lei |
| | **Dacă le-ai cumpăra separat** | **1.250 lei** |

Each item has a numbered navy badge, a bold title, a muted one-line description
and its standalone value struck through. Below the list: "Dacă le-ai cumpăra
separat 1.250 lei" struck, then a navy block — "Prețul tău azi", **297 lei**,
"O singură plată · economisești 953 lei" — and the gold CTA.

The card itself is ivory (`--canvas`) on the navy section, so it reads as a
printed page laid on the dark band.

Below the navy block sits one **optional add-on, sold separately** — "Lista
achiziții", +200 lei, on a tinted strip headed "Opțional · nu e inclus în preț",
with a gold `+` badge and its price **not** struck through. It is deliberately
**excluded** from the 1.250 lei total and from the savings figure, because it is
not part of what 297 lei buys. Keep it that way: the struck-through total must
only ever be the sum of the included items.

If you change any item price, recompute both `Valoare totală` (sum of `ITEMS`)
and `Economisești` (that sum minus 297).

## Post-payment confirmation email

The Payment Link doesn't call the app back on its own, so a **Stripe webhook**
(`/api/stripe-webhook`) is the trigger. On `checkout.session.completed` with
`payment_status = paid`, it looks the order up by `client_reference_id`
(= orderId), then emails the customer once: payment confirmed, we'll call them
as soon as possible on a working day (Mon–Fri) to schedule the live 20-min
meeting, and a thank-you. Sent from `info@rubenhorizontvisual.com` via Titan SMTP.

- Signature is verified with HMAC-SHA256 (`STRIPE_WEBHOOK_SECRET`) — **no Stripe
  API key needed**.
- `confirmation_email_sent` (migration 0003) dedupes so Stripe retries never
  send twice.
- Email copy: `lib/email.ts`.

**The promise must stay consistent in three places** — the wizard's step 3, the
confirmation email, and `/multumire`: *we phone you to schedule the live
presentation*. Nothing may promise delivery by email.

## Data model

Supabase table `design_express_clients`:

```
id                        uuid pk
order_id                  uuid unique
name                      text
email                     text
phone                     text          -- required, min 9 digits
answers                   jsonb         -- the 6 question answers
branch                    text          -- 'green' | 'red', derived from answers.q4
note                      text          -- the optional "mențiune"
photo_paths               text[]        -- 4 paths, one per room
confirmation_email_sent   boolean       -- dedupes the webhook email
created_at                timestamptz
```

RLS stays on with **no policies** — only the server's `service_role` key can read or
write. Photos stay in the private `design-express-photos` bucket, one folder per
`order_id`, each file named after its room.

Migrations in `supabase/migrations/`, run in order in the Supabase SQL editor:

| File | What it does |
| --- | --- |
| `0001_design_express_clients.sql` | creates the table, turns RLS on |
| `0002_add_phone_answers_branch.sql` | adds `phone`, `answers`, `branch` |
| `0003_add_confirmation_email_sent.sql` | adds the email-sent flag |
| `0004_readable_answers_view.sql` | creates the `design_express_answers` view |

**Reading the orders:** open Supabase → Table Editor → Views →
**`design_express_answers`**. One row per order, newest first, Romanian column
names, one column per question.

**Note:** the order row is written *before* payment, so an abandoned checkout looks
like a paid one in the table. `confirmation_email_sent = true` (column
`platit_email` in the view) is the marker that money actually arrived.

## The green/red branch

Question 4 asks the renovation budget.

- **green** — `20.000–50.000 €`, `50.000–100.000 €`, or `Peste 100.000 €`.
- **red** — everything else (`Sub 20.000 €`, `Încă nu știu`).

It is **stored only, never shown to the customer** (decision 1 below). It exists so
high-intent leads can be spotted in the database.

## Third-party services

- **Stripe** — Payment Link `https://buy.stripe.com/6oU5kw5HhbnEakT5Pl3F602`
  (297 RON, live), hard-coded in `components/landing/Wizard.tsx`. Set to
  `hosted_confirmation`. No Stripe API key is used anywhere in the app.
- **Supabase** — Postgres + Storage. Server-side `service_role` key for writes and
  signed URLs; public anon key in the browser only to PUT to a signed URL.
- **Titan** — the `info@rubenhorizontvisual.com` mailbox, over SMTP.

## Environment variables

See `.env.example`. All of these are read by the code:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — server-only.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — browser upload only.
- `STRIPE_WEBHOOK_SECRET` — verifies the webhook signature.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` — the confirmation email.

They must be set both in `.env.local` (for `npm run dev`) and on Vercel
(Settings → Environment Variables) for the live site.

## Decisions taken (2026-07-23)

1. **No branched confirmation screen.** On submit the customer goes straight to
   Stripe and sees Stripe's own hosted confirmation. The budget answer is still
   stored as `branch`, it is simply not shown. Revisit once the funnel is proven.
2. **No booking tool.** The "Rezervă discuția de 20 min" CTA from the original
   design is dropped. The promise of a call lives in the confirmation email instead.
3. **No refund promise.** The FAQ item "Dacă nu-mi place? Îți returnez banii" is
   removed. Four FAQ items ship.

## Housekeeping (2026-08-06)

- `/multumire` copy realigned to the phone-call promise.
- `.env.local` cleaned: five dead v1 keys removed (`STRIPE_SECRET_KEY`,
  `STRIPE_PRICE_ID`, `DESIGN_EXPRESS_PRICE_MINOR`, `DESIGN_EXPRESS_CURRENCY`,
  `NEXT_PUBLIC_BASE_URL`); the webhook + SMTP keys added.
- Instagram handle in the footer is now a real link.
- **Still to delete** (blocked on permission, do it manually): the dead v1
  `components/OptInPage.tsx`, and the `uploads/` folder of v1 test orders.

## What "done" looks like for any change

- `npm run build` passes with no TypeScript errors.
- `npm run dev` → the page renders every section, no console errors.
- The wizard still gates: 4 photos → 6 answers → name + valid email + 9-digit
  phone + consent.
- Price is identical in every place listed under "The offer".
- The phone-call promise is identical in the wizard, the email and `/multumire`.
