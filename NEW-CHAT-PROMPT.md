# Prompt for starting a new chat on this project

Copy everything below the line into a fresh Claude Code session, then replace the
last section with whatever you actually want changed.

---

I want to make changes to my Design Express funnel. The whole project is here:

`C:\Users\ruben\OneDrive - horizont visuals\04.Claude\Design express funnel`

**Before touching anything, read these two files — they are accurate and current:**

- `CLAUDE.MD` — how I want you to work and respond
- `project_specs.md` — what the app is, the tech stack, the data model, the offer,
  the environment variables, and what "done" looks like

Short version so you know what you're looking at: it's a single-page Next.js 14
landing page and order funnel for my interior design studio. A homeowner uploads
photos of four rooms, answers six qualifying questions, pays 497 lei through a Stripe
Payment Link, and I call them to present the redesigns live. Romanian copy
throughout. No login, no dashboard. The page is built from section components in
`components/landing/`, all assembled in `components/LandingPage.tsx`, and every CTA
opens the same `Wizard`.

## Live infrastructure — things you can't tell from the code

- **Hosted on Vercel**, project `designexpress`, under the team
  `fogarasruben-2511-2aa1a04f` (shown as "Team 3" in the dashboard). Live at
  https://designexpress.vercel.app
- **Deployed from GitHub**: `rubenfogaras-hue/designexpress`. Code changes only reach
  the live site once they're pushed there.
- **Vercel CLI is already logged in** on this machine as `fogarasruben-2511`.
- **Supabase**: table `design_express_clients`, plus a readable view
  `design_express_answers`. RLS is on with no policies — the server's `service_role`
  key is the only way in. Never add a policy for `anon` or `authenticated`.
- **Photos** live in the private `design-express-photos` Supabase Storage bucket,
  reached only through signed URLs.

## One trap that already cost a day

The business mailbox `info@rubenhorizontvisual.com` is **Titan resold through
GoDaddy**. The SMTP host is `smtpout.secureserver.net` (ports 465 and 587 both work).

`smtp.titan.email` answers `AccountNotFound` for this address — it looks exactly like
a wrong password and sends you chasing credential resets. It is not. Don't change the
host back.

This was fixed on 2026-08-28 by adding `SMTP_HOST` and `SMTP_PORT` as environment
variables in Vercel. Before that, no `SMTP_HOST` variable existed at all, so the code
fell back to the hardcoded `smtp.titan.email` and every post-payment confirmation
email had been failing silently in production.

**Known outstanding:** the matching fallback fix in `lib/email.ts` was made locally
but has **not been pushed to GitHub**. The env vars do the job, so it isn't urgent,
but the local repo is ahead of what's deployed.

## Ground rules

- Follow `CLAUDE.MD`: explain things in plain English, I'm not a coder.
- Don't rewrite what isn't related to the task.
- `npm run build` must pass before you say anything is done.
- Never expose the `service_role` key client-side, never disable RLS, never commit
  `.env.local`.

## What I want to change

<!-- Replace this with what you actually want. Be specific — a section, a wording
     change, a new question in the wizard, a price change, whatever. -->
