import { createClient } from "@supabase/supabase-js";

let _client = null;

export function getSupabase() {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquantes.");
  _client = createClient(url, key);
  return _client;
}

// Alias pour compatibilité (lazy proxy)
export const supabase = new Proxy({}, {
  get(_, prop) { return getSupabase()[prop]; },
});
