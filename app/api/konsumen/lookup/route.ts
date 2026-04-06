"use server"

import { NextResponse } from "next/server"

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
    progres_pembangunan: 72,
    target_selesai: "Agustus 2025",
    status_pembangunan: "Konstruksi Dinding & Atap",
    skema_pembiayaan: "KPR BTN",
    total_harga: 650000000,
    nama_agent: "Rindha Puspita",
    jabatan_agent: "Senior Property Advisor",
    no_hp_agent: "082198765432",
    milestones: [
      { nama: "Booking & Reservasi", status: "completed", tanggal: "Feb 2024" },
      { nama: "Pengajuan & Approval KPR", status: "completed", tanggal: "Apr 2024" },
      { nama: "Akad Kredit", status: "completed", tanggal: "Jun 2024" },
      { nama: "Konstruksi Dinding & Atap", status: "in_progress", tanggal: "Des 2024" },
      { nama: "Finishing & Mekanikal", status: "upcoming", tanggal: "Mar 2025" },
      { nama: "Serah Terima Kunci", status: "upcoming", tanggal: "Agu 2025" },
    ],
  },
}

export async function POST(request: Request) {
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
      return NextResponse.json({ status: "success", data: DUMMY_BY_NIK[nik] })
    }

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

    return NextResponse.json({ status: "success", data })
  } catch (error) {
    console.error("❌ Error lookup konsumen:", error)
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Terjadi kesalahan" },
      { status: 500 }
    )
  }
}
