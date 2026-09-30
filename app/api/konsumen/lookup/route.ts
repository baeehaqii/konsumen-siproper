"use server"

import { NextResponse } from "next/server"
import { LACAK } from "@/lib/lacak-seed"
import { konsumenToken } from "@/lib/konsumen-token"

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

// ─── Dummy data untuk testing (NIK → data konsumen) ───────────────────────────
const DUMMY_BY_NIK: Record<string, object> = {
  "3302251111990003": {
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
  // ponytail: lookup only needs the id, full dummy lives in /api/konsumen/[...nik]
  "3302141708880005": { id: "KONS-2024-002", nama: "Agus Setiawan" },
}

// NIK sudah terverifikasi → kirim id + token link, halaman detail menolak URL tanpa token valid
function found(data: { id?: string } & Record<string, unknown>) {
  return NextResponse.json({ status: "success", data, token: data?.id ? konsumenToken(data.id) : undefined })
}

// Rate limit lookup NIK: max 10 percobaan per IP per hari
// ponytail: Map in-memory per instance, reset saat server restart; pindah ke Redis/Upstash kalau deploy multi-instance/serverless
const LOOKUP_LIMIT = 10
const DAY_MS = 24 * 60 * 60 * 1000
const lookupHits = new Map<string, { count: number; resetAt: number }>()

function takeLookupSlot(ip: string) {
  const now = Date.now()
  const hit = lookupHits.get(ip)
  if (!hit || now >= hit.resetAt) {
    if (lookupHits.size > 10_000) for (const [k, v] of lookupHits) if (now >= v.resetAt) lookupHits.delete(k)
    lookupHits.set(ip, { count: 1, resetAt: now + DAY_MS })
    return { ok: true, resetAt: now + DAY_MS }
  }
  hit.count++
  return { ok: hit.count <= LOOKUP_LIMIT, resetAt: hit.resetAt }
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown"
  const slot = takeLookupSlot(ip)
  if (!slot.ok) {
    return NextResponse.json(
      { status: "error", message: "Terlalu banyak percobaan. Coba lagi besok." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((slot.resetAt - Date.now()) / 1000)) } }
    )
  }

  try {
    const body = await request.json()
    const nik: string = (body.nik ?? "").replace(/\D/g, "")

    if (!nik || nik.length !== 16) {
      return NextResponse.json(
        { status: "error", message: "NIK tidak valid. Harus 16 digit angka." },
        { status: 400 }
      )
    }

    console.log(`🔍 Lookup konsumen for NIK: ${nik}`)

    // Dummy data check
    if (DUMMY_BY_NIK[nik]) {
      console.log("✅ Returning dummy data")
      return found(DUMMY_BY_NIK[nik] as { id: string })
    }
    const seed = LACAK.find((r) => r.nik === nik)
    if (seed) return found({ id: seed.id, nama: seed.pemesanan.nama })

    // Hit real backend
    const baseUrl = process.env.SIPROPER_API_URL
    const token = await getAccessToken()

    let response = await fetch(`${baseUrl}/api/konsumen/nik/${nik}`, {
      method: "GET",
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
      response = await fetch(`${baseUrl}/api/konsumen/nik/${nik}`, {
        method: "GET",
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
        { status: "error", message: data.message || "NIK tidak ditemukan dalam sistem" },
        { status: response.status }
      )
    }

    return found(data)
  } catch (error) {
    console.error("❌ Error lookup konsumen:", error)
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Terjadi kesalahan" },
      { status: 500 }
    )
  }
}
