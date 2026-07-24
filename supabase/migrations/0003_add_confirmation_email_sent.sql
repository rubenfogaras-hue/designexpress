-- Design Express: track whether the post-payment confirmation email has gone
-- out for an order. Paste into the Supabase SQL Editor and click Run.
--
-- Why: Stripe can deliver the same webhook more than once (retries). The
-- webhook flips this to true after emailing, and skips the send if it is
-- already true — so the customer never gets two confirmation emails.
--
-- Safe to run twice (add column if not exists). RLS is untouched.

alter table public.design_express_clients
  add column if not exists confirmation_email_sent boolean not null default false;
