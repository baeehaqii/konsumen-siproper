import { readFileSync } from "node:fs"
import path from "node:path"

// Seed dari scripts/seed-lacak.py. data/ di-.gitignore (isi data konsumen asli),
// jadi dibaca saat runtime: file tidak ada (clone baru / deploy) → seed kosong.
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

function load(): LacakSeed[] {
  try {
    return JSON.parse(readFileSync(path.join(process.cwd(), "data", "lacak-konsumen.json"), "utf8"))
  } catch {
    return []
  }
}

export const LACAK = load()
