-- Design Express: a readable "orders + questionnaire" list for the Supabase
-- dashboard. Paste into the Supabase SQL Editor and click Run.
--
-- What it does: creates a VIEW that shows one row per order, newest first, with
-- each of the six questionnaire answers in its own clearly named column (the
-- stored values are already the full answer text). Open it in Table Editor →
-- Views → "design_express_answers", or run: select * from design_express_answers;
--
-- Column → question:
--   data              when the order came in (Romania time)
--   nume / email / telefon
--   etapa             q1 · În ce etapă sunteți?
--   decizie_blocata   q2 · La ce decizie sunteți blocat acum?
--   regret_evitat     q3 · Ce regret vreți să evitați cel mai mult?
--   buget             q4 · Care este ordinul de mărime al bugetului?
--   oras              q5 · În ce oraș este locuința?
--   cum_putem_ajuta   q6 · Cum credeți că vă putem ajuta cel mai mult?
--   mentiune          the optional free-text note
--   segment           green = buget ≥ 20.000 € · red = restul
--   platit_email      whether the confirmation email was sent
--   order_id          matches the Stripe payment's client_reference_id + the
--                     photo folder in the design-express-photos bucket
--
-- SECURITY: created with security_invoker so the view respects the base table's
-- row-level security. The dashboard (service role) sees every row; the public
-- anon key sees nothing — the same protection the underlying table has. We also
-- revoke access from the anon/authenticated roles as a belt-and-suspenders.

create or replace view public.design_express_answers
with (security_invoker = true) as
select
  to_char(created_at at time zone 'Europe/Bucharest', 'YYYY-MM-DD HH24:MI') as data,
  name  as nume,
  email,
  phone as telefon,
  answers ->> 'q1' as etapa,
  answers ->> 'q2' as decizie_blocata,
  answers ->> 'q3' as regret_evitat,
  answers ->> 'q4' as buget,
  answers ->> 'q5' as oras,
  answers ->> 'q6' as cum_putem_ajuta,
  note  as mentiune,
  branch as segment,
  confirmation_email_sent as platit_email,
  order_id
from public.design_express_clients
order by created_at desc;

revoke all on public.design_express_answers from anon, authenticated;
