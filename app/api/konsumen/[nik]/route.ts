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
    progres_pembangunan: 72,
    target_selesai: "Agustus 2025",
    status_pembangunan: "Konstruksi Dinding & Atap",
    skema_pembiayaan: "KPR BTN",
    total_harga: 650000000,
    nama_agent: "Rindha Puspita",
    jabatan_agent: "Sales Officer Sapphire Griya",
    no_hp_agent: "082198765432",
    progres_tahap: [
      {
        id: "pondasi",
        nama: "Pondasi",
        persen: 100,
        status: "completed",
        tanggal_mulai: "15 Feb 2024",
        tanggal_selesai: "20 Mar 2024",
        catatan: "Pondasi cakar ayam selesai sesuai spesifikasi.",
      },
      {
        id: "atap",
        nama: "Atap",
        persen: 100,
        status: "completed",
        tanggal_mulai: "21 Mar 2024",
        tanggal_selesai: "15 Mei 2024",
        catatan: "Pemasangan rangka & genteng baja ringan selesai.",
      },
      {
        id: "fasad",
        nama: "Fasad",
        persen: 65,
        status: "in_progress",
        tanggal_mulai: "16 Mei 2024",
        catatan: "Plester & aci dinding eksterior sedang berjalan.",
      },
      {
        id: "hitaman",
        nama: "Hitaman",
        persen: 20,
        status: "in_progress",
        tanggal_mulai: "10 Jul 2024",
        catatan: "Instalasi kelistrikan sedang dikerjakan.",
      },
      {
        id: "bast",
        nama: "BAST",
        persen: 0,
        status: "upcoming",
        catatan: "Menunggu seluruh tahap selesai.",
      },
    ],
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ nik: string }> }
) {
  try {
    // param disebut 'nik' di folder tapi isinya consumer ID (bukan NIK asli)
    const { nik: id } = await params

    console.log(`🔍 Fetching konsumen by ID: ${id}`)

    // Dummy check by ID
    if (DUMMY_BY_ID[id]) {
      console.log("✅ Returning dummy data for ID:", id)
      return NextResponse.json({ status: "success", data: DUMMY_BY_ID[id] })
    }

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
