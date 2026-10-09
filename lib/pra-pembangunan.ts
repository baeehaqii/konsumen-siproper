// Progres pembangunan dari Siproper sys2: GET /api/pra-pembangunan/nik/<nik>
import { siproperGet } from "@/lib/siproper"

interface Termin { nama_termin: string; sla: string | null; realisasi: string | null }
export interface PraPembangunan {
  id_unit_cif: string
  proyek: string | null
  blok_rumah: string
  nama_konsumen: string | null
  clustering: string | null
  progres_lapangan: number | null
  termin: Termin[]
}

export async function fetchPraPembangunan(nik: string): Promise<PraPembangunan[]> {
  const res = await siproperGet("sys2", `pra-pembangunan/nik/${encodeURIComponent(nik)}`)
  if (res.status === 404) return [] // NIK tidak ada (nginx 404, bukan JSON)
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

// Field KonsumenData bagian pembangunan
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

// Unit sys2 untuk konsumen ini by id_unit_cif; fallback blok / satu-satunya unit hanya kalau
// blok diberikan (NIK dari seed, pasti milik id ini). Error API tidak memblokir halaman.
export async function findUnit(nik: string, id: string, blok?: string) {
  try {
    const units = await fetchPraPembangunan(nik)
    const exact = units.find((x) => norm(x.id_unit_cif) === norm(id))
    if (exact || !blok) return exact
    return units.find((x) => x.blok_rumah === blok) ?? (units.length === 1 ? units[0] : undefined)
  } catch (e) {
    console.error("❌ pra-pembangunan:", e)
    return undefined
  }
}
