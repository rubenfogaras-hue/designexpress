# Prompt for starting a new chat on this project

Copy everything below the line into a fresh Claude Code session, then replace the
last section with whatever you want changed.

Keep this file updated when something structural changes.

---

I want to make changes to my Design Express funnel. The project is here:

`C:\Users\ruben\OneDrive - horizont visuals\04.Claude\Design express funnel`

**Read these two files before touching anything — they are accurate and current:**

- `CLAUDE.MD` — how I want you to work and how to explain things to me
- `project_specs.md` — the app, tech stack, data model, the offer, environment
  variables, and what "done" means

Short version: a single-page Next.js 14 landing page and order funnel for my interior
design studio in Târgu Mureș. A homeowner uploads photos of two rooms, answers three
short questions, pays **497 lei** through a Stripe Payment Link, and I present the
redesigns live on a call. Romanian throughout. No login. Page sections live in
`components/landing/`, assembled in `components/LandingPage.tsx`; every CTA opens the
same `Wizard`.

## Live infrastructure — not visible from the code

- **Vercel**, project `designexpress`, team `fogarasruben-2511-2aa1a04f` ("Team 3"),
  live at https://designexpress.vercel.app
- **Deployed from GitHub** `rubenfogaras-hue/designexpress` — code changes only reach
  the live site once pushed
- **Vercel CLI is already logged in** on this machine as `fogarasruben-2511`
- **Supabase**: table `design_express_clients` + view `design_express_answers`. RLS on
  with no policies; only the server's `service_role` key gets in. Never add a policy
  for `anon` or `authenticated`.
- **Photos**: private `design-express-photos` bucket, reached only by signed URLs
- **Stripe**: hosted Payment Link, no API key in the app. A cross-sell "Ideile Tale pe
  Plan" (97 lei) is attached in Stripe and mirrored on the page — change both together.

## Traps that already cost a day each

**Email.** The mailbox `info@rubenhorizontvisual.com` is Titan resold through GoDaddy,
so SMTP is `smtpout.secureserver.net`. `smtp.titan.email` answers `AccountNotFound` —
it looks exactly like a wrong password. Don't change the host back.

**Meta tracking.** All events are defined **in the code**, wired to the real button
handlers, and deduplicated against server copies sharing an `event_id`:

| Event | Fires | Where |
| --- | --- | --- |
| `PageView` | page load | `app/layout.tsx` |
| `ViewContent` | a CTA opens the wizard | `components/LandingPage.tsx` |
| `Lead` | order stored | `Wizard.tsx` + `api/submit-order` |
| `InitiateCheckout` | redirect to Stripe | `Wizard.tsx` + `api/submit-order` |
| `Purchase` | Stripe confirms payment | `api/stripe-webhook`, server only |

**Do not move these into Meta's Event Setup Tool.** It matches on button *text*, so it
breaks silently whenever a label is reworded, and it cannot carry the `event_id`
deduplication needs. Never map a button to `Purchase` — every button fires before
payment, which happens on Stripe's domain.

Two Next.js quirks that caused double-counting: a raw `<script>` is emitted twice (use
`next/script` with an `id`), and React preloads the `<img>` inside `<noscript>`, which
fetches the tracking URL in normal browsers — that beacon is deliberately omitted.

Test with `https://designexpress.vercel.app/?test_event_code=TEST…` so nothing pollutes
live reporting.

## Ground rules

Follow `CLAUDE.MD` — plain English, I'm not a coder. Don't rewrite unrelated code.
`npm run build` must pass before anything is called done. Never expose the
`service_role` key client-side, never disable RLS, never commit `.env.local`.

Note: `npm run build` fails locally with an `EINVAL readlink` error because the project
sits in OneDrive. That's the environment, not the code — Vercel builds fine.

## What I want to change

<!-- Replace this with what you actually want. Be specific. -->
