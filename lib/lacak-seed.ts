// Seed LACAK di Supabase (tabel lacak_konsumen, diisi scripts/seed-lacak.py).
// Server-only: pakai secret key, tabel RLS tanpa policy jadi tidak bisa dibaca dari browser.
// ponytail: fetch ke REST API, tanpa @supabase/supabase-js untuk 2 query select
type Nullable<T> = { [K in keyof T]: T[K] | null }

export interface LacakSeed {
  id: string
  nik: string | null
  proyek: string | null
  pemesanan: { blok: string } & Nullable<{
    nama: string; status_unit: string; tgl_order: string; tipe: number; luas: number; harga: number
    sales: string; divisi: string; metode_pembelian: string; bank: string; spjb: string
  }> & Record<string, unknown>
  teknik: Nullable<{ tahap: string; progress: number; spmk: string }> & Record<string, unknown>
  legal: Nullable<{ akad: string; shm: string }> & Record<string, unknown>
  keuangan: Nullable<{ penjualan: number; dana_masuk: number }> & Record<string, unknown>
}

async function findOne(filter: string): Promise<LacakSeed | null> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null // seed belum dikonfigurasi → lanjut ke backend Siproper
  const res = await fetch(`${url}/rest/v1/lacak_konsumen?select=data&limit=1&${filter}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Supabase lacak_konsumen: ${res.status}`)
  const rows: { data: LacakSeed }[] = await res.json()
  return rows[0]?.data ?? null
}

// url_id = id dengan "//" dirapatkan, karena URL menormalkannya (mis. 018/023//A-5/Booking)
export const findSeedById = (id: string) => findOne(`url_id=eq.${encodeURIComponent(id.replace(/\/+/g, "/"))}`)
export const findSeedByNik = (nik: string) => findOne(`nik=eq.${encodeURIComponent(nik)}`)
