-- Design Express clients: one row per order (name, email, note, photo
-- storage paths). Paste this into the Supabase SQL Editor and click Run.
--
-- What it does:
--   1. Creates the table that holds every customer's order info.
--   2. Turns on Row Level Security (RLS) — required so the table isn't
--      publicly readable/writable by anyone with the public "anon" key.
--   3. Deliberately adds NO policies. That means only the secret
--      "service_role" key (used by our server, never the browser) can
--      read or write rows. This matches the project's Supabase rules:
--      always RLS, sensitive data only touched server-side.

create table if not exists public.design_express_clients (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique,
  name text not null,
  email text not null,
  note text not null default '',
  photo_paths text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.design_express_clients enable row level security;
