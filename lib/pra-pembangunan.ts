// Progres pembangunan langsung dari Siproper: GET /api/pra-pembangunan/nik/<nik>
// Server-only: login pakai SIPROPER_EMAIL/PASSWORD ke host PRA_PEMBANGUNAN_API_URL.

const BASE = process.env.PRA_PEMBANGUNAN_API_URL || "https://sys2.siproper.com"

interface Termin { nama_termin: string; sla: string | null; realisasi: string | null }
export interface PraPembangunan {
  id_unit_cif: string
  blok_rumah: string
  clustering: string | null
  progres_lapangan: number | null
  termin: Termin[]
}

let token: string | null = null
let expiry = 0

async function getToken(fresh = false) {
  if (!fresh && token && Date.now() < expiry) return token
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: process.env.SIPROPER_EMAIL, password: process.env.SIPROPER_PASSWORD }),
  })
  const body = await res.json()
  if (body.status !== "success") throw new Error(`Login pra-pembangunan: ${body.message ?? res.status}`)
  token = body.data.access_token as string
  expiry = Date.now() + (body.data.expires_in - 60) * 1000
  return token
}

async function fetchByNik(nik: string): Promise<PraPembangunan[]> {
  const get = async (t: string) =>
    fetch(`${BASE}/api/pra-pembangunan/nik/${encodeURIComponent(nik)}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${t}` },
      cache: "no-store",
    })
  let res = await get(await getToken())
  if (res.status === 401) res = await get(await getToken(true))
  if (res.status === 404) return []
  const body = await res.json()
  if (!res.ok || !body.success) throw new Error(`pra-pembangunan: ${body.message ?? res.status}`)
  return body.data ?? []
}

const TAHAP = [
  ["pondasi", "Pondasi"],
  ["atap", "Atap"],
  ["fasad", "Fasad"],
  ["hitaman", "Hitaman"],
  ["bast", "BAST"],
] as const

const tgl = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : undefined
const norm = (s: string) => s.replace(/\/+/g, "/")

// Field KonsumenData bagian pembangunan; null kalau unit tidak ada di API
export function toPembangunan(u: PraPembangunan) {
  const byNama = new Map(u.termin.map((t) => [t.nama_termin.toLowerCase(), t]))
  const progres = Math.round(u.progres_lapangan ?? 0)
  const aktif = TAHAP.findIndex(([id]) => !byNama.get(id)?.realisasi) // -1 = semua selesai
  const progres_tahap = TAHAP.map(([id, nama], i) => {
    const t = byNama.get(id)
    const status = aktif === -1 || i < aktif ? "completed" : i === aktif ? "in_progress" : "upcoming"
    return {
      id,
      nama,
      // ponytail: API hanya punya progres lapangan total, jadi tahap aktif memakai angka itu
      persen: status === "completed" ? 100 : status === "in_progress" ? progres : 0,
      status,
      ...(t?.realisasi ? { tanggal_selesai: tgl(t.realisasi) } : {}),
      ...(t?.sla ? { catatan: `Target (SLA): ${tgl(t.sla)}` } : {}),
    }
  })
  return {
    progres_pembangunan: progres,
    status_pembangunan: aktif === -1 ? "Rumah Selesai" : u.clustering || TAHAP[aktif][1],
    target_selesai: tgl(byNama.get("bast")?.sla),
    progres_tahap,
  }
}

// Cari unit milik konsumen (by id_unit_cif, lalu blok); error API tidak memblokir halaman
export async function findPembangunan(nik: string, id: string, blok?: string) {
  try {
    const units = await fetchByNik(nik)
    const u =
      units.find((x) => norm(x.id_unit_cif) === norm(id)) ??
      units.find((x) => blok && x.blok_rumah === blok) ??
      (units.length === 1 ? units[0] : undefined)
    return u ? toPembangunan(u) : null
  } catch (e) {
    console.error("❌ pra-pembangunan:", e)
    return null
  }
}
