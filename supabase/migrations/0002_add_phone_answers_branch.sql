-- Design Express v2: the wizard now collects a phone number, six qualifying
-- answers and a derived lead "branch". Paste this into the Supabase SQL Editor
-- and click Run.
--
-- What it does:
--   1. phone   — the number to call to schedule the live presentation.
--   2. answers — the six question answers, stored as JSON so adding or
--                reordering questions later doesn't need another migration.
--   3. branch  — 'green' when the budget answer is 20.000 € or above,
--                otherwise 'red'. Lets you spot high-intent leads at a glance.
--
-- All three are added with defaults so existing rows stay valid. RLS is
-- untouched: still on, still no policies, so only the server's service_role
-- key can read or write.

alter table public.design_express_clients
  add column if not exists phone text not null default '',
  add column if not exists answers jsonb not null default '{}'::jsonb,
  add column if not exists branch text not null default 'red';

-- Quick filter for the leads worth calling first.
create index if not exists design_express_clients_branch_idx
  on public.design_express_clients (branch);
