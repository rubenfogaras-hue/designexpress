"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client using the public anon key. Only used to
 * PUT a customer's own photos to a signed upload URL our server generated
 * — the anon key alone has no read/write access to anything (RLS is on,
 * no policies), so this is safe to ship to the client.
 */
export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.");
  }
  return createClient(url, key);
}
