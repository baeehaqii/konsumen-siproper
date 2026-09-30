// Server-only REST call ke Supabase pakai secret key (bypass RLS). Jangan di-import dari client component.
// ponytail: fetch ke REST API, tanpa @supabase/supabase-js untuk beberapa query
export function supabaseRest(path: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init.headers },
  })
}
