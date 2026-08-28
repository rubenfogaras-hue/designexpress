-- Design Express v3: the questionnaire dropped from six questions to three.
-- Paste this into the Supabase SQL Editor and click Run.
--
-- What changed in the wizard:
--   q1  În ce etapă sunteți?                          — unchanged
--   q2  V-ați gândit la un stil anume sau o atmosferă? — NEW, free text
--       (it used to be "La ce decizie sunteți blocat acum?")
--   q3  Ce regret vreți să evitați cel mai mult?       — unchanged
--   q4  budget          — REMOVED
--   q5  city            — REMOVED
--   q6  how can we help — REMOVED
--
-- Nothing is deleted from the table. The answers column still holds whatever
-- was stored, including q4/q5/q6 on older rows — this only changes which
-- columns the dashboard view surfaces.
--
-- ⚠ READ THIS BEFORE TRUSTING THE COLUMN:
-- `stil_atmosfera` reads q2. On orders placed BEFORE this change, q2 held the
-- old "La ce decizie sunteți blocat acum?" answer, so older rows will show
-- things like "Bugetul" or "Materialele" in that column. Anything from today
-- onward is the free-text style answer.
--
-- ⚠ `segment` (the green/red split) was derived from the budget question,
-- which no longer exists. Every new order will be 'red'. The column is kept so
-- historical rows stay readable — but it is frozen, not live. Tell Claude if
-- you want it re-based on a new signal or removed.

-- The view must be dropped rather than replaced: `create or replace view` can
-- only append columns, and this drops three (buget, oras, cum_putem_ajuta).
-- Dropping a view removes no data — it is only a saved query over the table.
drop view if exists public.design_express_answers;

create view public.design_express_answers
with (security_invoker = true) as
select
  to_char(created_at at time zone 'Europe/Bucharest', 'YYYY-MM-DD HH24:MI') as data,
  name  as nume,
  email,
  phone as telefon,
  answers ->> 'q1' as etapa,
  answers ->> 'q2' as stil_atmosfera,
  answers ->> 'q3' as regret_evitat,
  note  as mentiune,
  branch as segment,
  confirmation_email_sent as platit_email,
  order_id
from public.design_express_clients
order by created_at desc;

revoke all on public.design_express_answers from anon, authenticated;
