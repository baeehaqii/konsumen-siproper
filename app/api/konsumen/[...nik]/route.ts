"use server"

import { NextResponse } from "next/server"
import { LACAK, type LacakSeed } from "@/lib/lacak-seed"
import { isValidKonsumenToken } from "@/lib/konsumen-token"

let cachedToken: string | null = null
let tokenExpiry: number = 0

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const baseUrl = process.env.SIPROPER_API_URL
  const email = process.env.SIPROPER_EMAIL
  const password = process.env.SIPROPER_PASSWORD

  if (!baseUrl || !email || !password) {
    throw new Error("Missing API credentials in environment variables")
  }

  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) throw new Error(`Login failed: ${response.statusText}`)

  const data = await response.json()
  if (data.status !== "success") throw new Error(data.message || "Login failed")

  cachedToken = data.data.access_token
  tokenExpiry = Date.now() + (data.data.expires_in - 60) * 1000
  return cachedToken as string
}

// ─── Dummy data keyed by consumer ID (bukan NIK) ──────────────────────────────
const DUMMY_BY_ID: Record<string, object> = {
  "KONS-2024-001": {
    id: "KONS-2024-001",
    nama: "Baehaqi",
    email: "baehaqi@gmail.com",
    no_hp: "081234567890",
    alamat: "Jl. Merdeka No. 12, Purwokerto, Banyumas, Jawa Tengah",
    status_konsumen: "Konsumen Aktif",
    bergabung_sejak: "2024",
    nama_proyek: "Sapphire Mansion Purwokerto",
    nama_blok: "Blok A",
    nomor_unit: "A-11",
    tipe_unit: "Tipe 45/90",
    gaya: "Modern Minimalist",
    progres_pembangunan: 10,
    target_selesai: "Agustus 2025",
    status_pembangunan: "Pekerjaan Pondasi",
    skema_pembiayaan: "KPR BTN",
    total_harga: 650000000,
    nama_agent: "Rindha Puspita",
    jabatan_agent: "Sales Officer Sapphire Griya",
    no_hp_agent: "082198765432",
    progres_tahap: [
      {
        id: "pondasi",
        nama: "Pondasi",
        persen: 45,
        status: "in_progress",
        tanggal_mulai: "15 Feb 2024",
        catatan: "Pengecoran sloof dan pemasangan besi kolom sedang berjalan.",
      },
      { id: "atap", nama: "Atap", persen: 0, status: "upcoming", catatan: "Dimulai setelah pondasi dan dinding selesai." },
      { id: "fasad", nama: "Fasad", persen: 0, status: "upcoming", catatan: "Menunggu pekerjaan struktur selesai." },
      { id: "hitaman", nama: "Hitaman", persen: 0, status: "upcoming", catatan: "Menunggu pekerjaan struktur selesai." },
      { id: "bast", nama: "BAST", persen: 0, status: "upcoming", catatan: "Menunggu seluruh tahap selesai." },
    ],
    milestones: [
      { nama: "Booking & Reservasi", status: "completed", tanggal: "Feb 2024" },
      { nama: "Pengajuan & Approval KPR", status: "completed", tanggal: "Apr 2024" },
      { nama: "Akad Kredit", status: "completed", tanggal: "Jun 2024" },
      { nama: "Pekerjaan Pondasi", status: "in_progress", tanggal: "Mei 2024" },
      { nama: "Konstruksi Dinding & Atap", status: "upcoming", tanggal: "Des 2024" },
      { nama: "Finishing & Mekanikal", status: "upcoming", tanggal: "Mar 2025" },
      { nama: "Serah Terima Kunci", status: "upcoming", tanggal: "Agu 2025" },
    ],
  },
  "KONS-2024-002": {
    id: "KONS-2024-002",
    nama: "Agus Setiawan",
    email: "agus.setiawan@gmail.com",
    no_hp: "085726481930",
    alamat: "Jl. Gatot Subroto No. 45, Sokaraja, Banyumas, Jawa Tengah",
    status_konsumen: "Konsumen Aktif",
    bergabung_sejak: "2023",
    nama_proyek: "Sapphire Mansion Purwokerto",
    nama_blok: "Blok C",
    nomor_unit: "C-07",
    tipe_unit: "Tipe 45/90",
    gaya: "Modern Minimalist",
    progres_pembangunan: 100,
    target_selesai: "Juli 2025",
    status_pembangunan: "Serah Terima (BAST)",
    skema_pembiayaan: "KPR BTN",
    total_harga: 620000000,
    jumlah_terbayar: 496000000,
    nama_agent: "Rindha Puspita",
    jabatan_agent: "Sales Officer Sapphire Griya",
    no_hp_agent: "082198765432",
    progres_tahap: [
      { id: "pondasi", nama: "Pondasi", persen: 100, status: "completed", tanggal_mulai: "10 Mar 2024", tanggal_selesai: "28 Mei 2024", catatan: "Pondasi, sloof, dan kolom praktis selesai dicor." },
      { id: "atap", nama: "Atap", persen: 100, status: "completed", tanggal_mulai: "3 Jun 2024", tanggal_selesai: "20 Sep 2024", catatan: "Rangka baja ringan dan genteng terpasang." },
      { id: "fasad", nama: "Fasad", persen: 100, status: "completed", tanggal_mulai: "1 Okt 2024", tanggal_selesai: "15 Jan 2025", catatan: "Plester, aci, dan cat eksterior selesai." },
      { id: "hitaman", nama: "Hitaman", persen: 100, status: "completed", tanggal_mulai: "20 Jan 2025", tanggal_selesai: "30 Apr 2025", catatan: "Instalasi listrik, air, dan finishing interior selesai." },
      { id: "bast", nama: "BAST", persen: 100, status: "completed", tanggal_mulai: "5 Mei 2025", tanggal_selesai: "18 Jul 2025", catatan: "Berita Acara Serah Terima ditandatangani, kunci sudah diserahkan." },
    ],
    milestones: [
      { nama: "Booking & Reservasi", status: "completed", tanggal: "Nov 2023" },
      { nama: "Pengajuan & Approval KPR", status: "completed", tanggal: "Jan 2024" },
      { nama: "Akad Kredit", status: "completed", tanggal: "Feb 2024" },
      { nama: "Pekerjaan Pondasi", status: "completed", tanggal: "Mei 2024" },
      { nama: "Konstruksi Dinding & Atap", status: "completed", tanggal: "Sep 2024" },
      { nama: "Finishing & Mekanikal", status: "completed", tanggal: "Apr 2025" },
      { nama: "Serah Terima Kunci", status: "completed", tanggal: "Jul 2025" },
    ],
  },
}

// ─── Seed dari sheet LACAK (scripts/seed-lacak.py) → bentuk KonsumenData ──────
// URL tidak bisa memuat "//" (mis. 018/023//A-5/Booking), jadi key dinormalkan
const SEED_BY_ID = new Map(LACAK.map((r) => [r.id.replace(/\/+/g, "/"), r]))

const TAHAP_PAGE = ["pondasi", "atap", "fasad", "hitaman", "bast"] as const
const TAHAP_NAMA = { pondasi: "Pondasi", atap: "Atap", fasad: "Fasad", hitaman: "Hitaman", bast: "BAST" }
// index tahap Excel → index tahap halaman (plat 2 lantai dihitung sebelum atap, rumah selesai = semua beres)
const TAHAP_EXCEL: Record<string, number> = { pondasi: 0, plat_2_lantai: 1, atap: 1, fasad: 2, hitaman: 3, bast: 4, rumah_selesai: 5 }

const tgl = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : undefined

function fromLacak({ id, proyek, pemesanan: p, teknik: t, legal: l, keuangan: k }: LacakSeed) {
  const aktif = t.tahap ? TAHAP_EXCEL[t.tahap] : -1
  const persen = Math.round((t.progress ?? 0) * 100)
  const total = k.penjualan || p.harga || 0
  const done = (d?: string | null) => (d ? "completed" : "upcoming")
  return {
    id,
    nama: p.nama,
    status_konsumen: p.status_unit,
    bergabung_sejak: p.tgl_order?.slice(0, 4),
    nama_proyek: proyek,
    nama_blok: `Blok ${p.blok.split("-")[0]}`,
    nomor_unit: p.blok,
    tipe_unit: `Tipe ${p.tipe}/${p.luas}`,
    progres_pembangunan: persen,
    status_pembangunan: aktif === 5 ? "Rumah Selesai" : aktif >= 0 ? TAHAP_NAMA[TAHAP_PAGE[aktif]] : "Belum Dimulai",
    skema_pembiayaan: [p.metode_pembelian, p.metode_pembelian === "KPR" ? p.bank : null].filter(Boolean).join(" "),
    total_harga: total,
    jumlah_terbayar: Math.round(total * (k.dana_masuk ?? 0)),
    nama_agent: p.sales ?? "Tim Sapphire",
    jabatan_agent: p.divisi ?? "Sales Officer",
    progres_tahap: TAHAP_PAGE.map((tid, i) => ({
      id: tid,
      nama: TAHAP_NAMA[tid],
      // ponytail: Excel hanya punya progress total, jadi tahap aktif memakai angka itu
      persen: i < aktif ? 100 : i === aktif ? persen : 0,
      status: i < aktif ? "completed" : i === aktif ? "in_progress" : "upcoming",
      ...(i === 0 && t.spmk ? { tanggal_mulai: tgl(t.spmk) } : {}),
    })),
    milestones: [
      { nama: "Booking & Reservasi", status: done(p.tgl_order), tanggal: tgl(p.tgl_order) },
      { nama: "SPU & SPJB", status: done(p.spjb), tanggal: tgl(p.spjb) },
      { nama: "Akad", status: done(l.akad), tanggal: tgl(l.akad) },
      { nama: "SPMK / Mulai Bangun", status: done(t.spmk), tanggal: tgl(t.spmk) },
      { nama: "Serah Terima Kunci", status: aktif === 5 ? "completed" : "upcoming" },
      { nama: "Sertifikat (SHM)", status: l.shm ? "completed" : "upcoming" },
    ],
    lacak: { pemesanan: p, teknik: t, legal: l, keuangan: k },
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ nik: string[] }> }
) {
  try {
    // param disebut 'nik' di folder tapi isinya consumer ID (bukan NIK asli)
    // URL: /api/konsumen/<id...>/<token> — token dari lookup NIK
    const segments = (await params).nik.map(decodeURIComponent)
    const linkToken = segments.pop() ?? ""
    const id = segments.join("/")
    if (!id || !isValidKonsumenToken(id, linkToken)) {
      return NextResponse.json({ status: "error", message: "Konsumen tidak ditemukan" }, { status: 404 })
    }

    console.log(`🔍 Fetching konsumen by ID: ${id}`)

    // Dummy check by ID
    if (DUMMY_BY_ID[id]) {
      console.log("✅ Returning dummy data for ID:", id)
      return NextResponse.json({ status: "success", data: DUMMY_BY_ID[id] })
    }
    const seed = SEED_BY_ID.get(id)
    if (seed) return NextResponse.json({ status: "success", data: fromLacak(seed) })

    const baseUrl = process.env.SIPROPER_API_URL
    const token = await getAccessToken()

    let response = await fetch(`${baseUrl}/api/konsumen/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    if (response.status === 401) {
      cachedToken = null
      tokenExpiry = 0
      const newToken = await getAccessToken()
      response = await fetch(`${baseUrl}/api/konsumen/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${newToken}`,
        },
        cache: "no-store",
      })
    }

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { status: "error", message: data.message || "Konsumen tidak ditemukan" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error fetching konsumen:", error)
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
