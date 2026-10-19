// Client API Siproper, server-only. Tiap sistem login sendiri (token di-cache per instance):
//   sys2 → pembangunan & legal
//   sys1 → pembayaran & dokumen (belum dipakai)
// Env: SIPROPER_SYS1_URL / _EMAIL / _PASSWORD, SIPROPER_SYS2_URL / _EMAIL / _PASSWORD
export type Sys = "sys1" | "sys2"

const tokens: Partial<Record<Sys, { value: string; expiry: number }>> = {}

async function login(sys: Sys, fresh: boolean) {
  const cached = tokens[sys]
  if (!fresh && cached && Date.now() < cached.expiry) return cached.value

  const env = (k: string) => process.env[`SIPROPER_${sys.toUpperCase()}_${k}`]
  const [url, email, password] = [env("URL"), env("EMAIL"), env("PASSWORD")]
  if (!url || !email || !password) throw new Error(`Kredensial Siproper ${sys} belum di-set`)

  const res = await fetch(`${url}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  })
  const body = await res.json().catch(() => ({}))
  if (body.status !== "success") throw new Error(`Login Siproper ${sys}: ${body.message ?? res.status}`)

  tokens[sys] = { value: body.data.access_token, expiry: Date.now() + (body.data.expires_in - 60) * 1000 }
  return body.data.access_token as string
}

// GET (atau POST kalau ada body) <sys>/api/<path>, login ulang sekali kalau token ditolak
export async function siproperGet(sys: Sys, path: string, body?: unknown) {
  const get = async (fresh: boolean) =>
    fetch(`${process.env[`SIPROPER_${sys.toUpperCase()}_URL`]}/api/${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${await login(sys, fresh)}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    })
  const res = await get(false)
  return res.status === 401 ? get(true) : res
}

// Teruskan respons Siproper apa adanya (status + JSON) ke client
export async function siproperProxy(sys: Sys, path: string, body?: unknown) {
  try {
    const res = await siproperGet(sys, path, body)
    const data = await res.json().catch(() => ({ status: "error", message: res.statusText }))
    return Response.json(data, { status: res.status })
  } catch (e) {
    return Response.json({ status: "error", message: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}
