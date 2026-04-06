"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Circle,
  MapPin,
  Phone,
  Mail,
  Home,
  TrendingUp,
  FileText,
  Scale,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  User,
  CalendarDays,
  Building2,
  BadgeCheck,
  Download,
  AlertCircle,
} from "lucide-react"
import BannerSlider from "@/components/banner-slider"
import ContactModal from "@/components/contact-modal"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Milestone {
  nama: string
  status: "completed" | "in_progress" | "upcoming"
  tanggal?: string
}

interface Cicilan {
  nomor: number
  status: "lunas" | "menunggu" | "akan_datang"
  tanggal?: string
  jatuh_tempo?: string
  metode?: string
  jumlah: number
}

interface KonsumenData {
  nama?: string
  nik?: string
  email?: string
  no_hp?: string
  alamat?: string
  foto_url?: string
  status_konsumen?: string
  bergabung_sejak?: string
  // Unit
  nama_proyek?: string
  nama_blok?: string
  nomor_unit?: string
  tipe_unit?: string
  gaya?: string
  foto_unit?: string[]
  // Progress
  progres_pembangunan?: number
  target_selesai?: string
  status_pembangunan?: string
  // Finance
  skema_pembiayaan?: string
  total_harga?: number
  jumlah_terbayar?: number
  cicilan_per_bulan?: number
  nomor_akad?: string
  suku_bunga?: string
  tenor?: string
  // Agent
  nama_agent?: string
  foto_agent?: string
  jabatan_agent?: string
  no_hp_agent?: string
  // Timeline
  milestones?: Milestone[]
  [key: string]: unknown
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY = "#031632"
const PRIMARY_CONTAINER = "#1a2b48"
const SECONDARY = "#1b6d24"
const BG = "#f8f9fa"
const SURFACE = "#ffffff"
const SURFACE_LOW = "#f3f4f5"
const ON_SURFACE = "#191c1d"
const ON_SURFACE_VARIANT = "#44474d"
const OUTLINE_VARIANT = "#c5c6ce"

const TABS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "pembayaran", label: "Pembayaran", icon: CreditCard },
  { id: "pembangunan", label: "Pembangunan", icon: Building2 },
  { id: "dokumen", label: "Dokumen", icon: FileText },
  { id: "legalitas", label: "Legalitas", icon: Scale },
]

const DEFAULT_MILESTONES: Milestone[] = [
  { nama: "Booking & Reservasi", status: "completed", tanggal: "Jan 2024" },
  { nama: "Akad Kredit & Legalitas", status: "completed", tanggal: "Mar 2024" },
  { nama: "Konstruksi Dinding", status: "in_progress" },
  { nama: "Pemasangan Atap", status: "upcoming" },
  { nama: "Finishing Interior", status: "upcoming" },
  { nama: "Serah Terima Kunci", status: "upcoming", tanggal: "Okt 2024" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-white overflow-hidden ${className}`}>
      <div className="p-6 space-y-3 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-100 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  )
}

function MilestoneItem({ item }: { item: Milestone }) {
  const iconProps =
    item.status === "completed"
      ? { icon: CheckCircle2, color: SECONDARY, bg: "#dcfce7" }
      : item.status === "in_progress"
      ? { icon: Clock, color: "#c97900", bg: "#fef9c3" }
      : { icon: Circle, color: OUTLINE_VARIANT, bg: SURFACE_LOW }

  const Icon = iconProps.icon

  return (
    <div className="flex items-start gap-4">
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
        style={{ background: iconProps.bg }}
      >
        <Icon className="h-4 w-4" style={{ color: iconProps.color }} />
      </div>
      <div className="flex-1 min-w-0 pb-5 border-b last:border-b-0" style={{ borderColor: OUTLINE_VARIANT + "40" }}>
        <p
          className="text-sm font-semibold"
          style={{ color: item.status === "upcoming" ? ON_SURFACE_VARIANT : ON_SURFACE }}
        >
          {item.nama}
        </p>
        {item.tanggal && (
          <p className="text-xs mt-0.5" style={{ color: ON_SURFACE_VARIANT }}>
            {item.status === "completed" ? "Selesai" : "Target"}: {item.tanggal}
          </p>
        )}
        {item.status === "in_progress" && (
          <span
            className="inline-block mt-1 text-xs font-medium rounded-full px-2 py-0.5"
            style={{ background: "#fef9c3", color: "#c97900" }}
          >
            Sedang Berjalan
          </span>
        )}
      </div>
    </div>
  )
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{ background: SURFACE_LOW }}
    >
      <div
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: PRIMARY_CONTAINER + "18" }}
      >
        <Icon className="h-4 w-4" style={{ color: PRIMARY_CONTAINER }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs leading-none mb-0.5" style={{ color: ON_SURFACE_VARIANT }}>
          {label}
        </p>
        <p className="text-sm font-semibold truncate" style={{ color: ON_SURFACE }}>
          {value}
        </p>
      </div>
    </div>
  )
}

// ─── Pembayaran Tab ───────────────────────────────────────────────────────────

function CicilanItem({ cicilan }: { cicilan: Cicilan }) {
  const isLunas = cicilan.status === "lunas"
  const isMenunggu = cicilan.status === "menunggu"

  return (
    <div className="px-5 py-4 flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: isLunas ? "#dcfce7" : isMenunggu ? "#fef9c3" : SURFACE_LOW }}
      >
        {isLunas ? (
          <CheckCircle2 className="h-4 w-4" style={{ color: SECONDARY }} />
        ) : isMenunggu ? (
          <Clock className="h-4 w-4" style={{ color: "#c97900" }} />
        ) : (
          <Circle className="h-4 w-4" style={{ color: OUTLINE_VARIANT }} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold" style={{ color: ON_SURFACE }}>
            Cicilan #{cicilan.nomor}
          </p>
          {isLunas && (
            <span
              className="text-xs font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
              style={{ background: "#dcfce7", color: SECONDARY }}
            >
              Lunas
            </span>
          )}
          {isMenunggu && (
            <span
              className="text-xs font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
              style={{ background: "#fef9c3", color: "#c97900" }}
            >
              Menunggu
            </span>
          )}
          {cicilan.status === "akan_datang" && (
            <span
              className="text-xs font-medium rounded-full px-2 py-0.5"
              style={{ background: SURFACE_LOW, color: ON_SURFACE_VARIANT }}
            >
              Akan Datang
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: ON_SURFACE_VARIANT }}>
          {isLunas
            ? `Dibayar ${cicilan.tanggal}${cicilan.metode ? ` · ${cicilan.metode}` : ""}`
            : `Jatuh tempo: ${cicilan.jatuh_tempo}`}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold" style={{ color: ON_SURFACE }}>
          {formatRupiah(cicilan.jumlah)}
        </p>
        {isMenunggu && (
          <button
            className="mt-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-all hover:opacity-90 active:scale-95"
            style={{ background: PRIMARY, color: "#ffffff" }}
          >
            Bayar
          </button>
        )}
      </div>
    </div>
  )
}

function LoanDetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: PRIMARY + "12" }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: PRIMARY }} />
      </div>
      <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
        <p className="text-xs flex-shrink-0" style={{ color: ON_SURFACE_VARIANT }}>
          {label}
        </p>
        <p className="text-sm font-semibold text-right truncate" style={{ color: ON_SURFACE }}>
          {value}
        </p>
      </div>
    </div>
  )
}

function TabPembayaran({ data }: { data: KonsumenData | null }) {
  const totalHarga = data?.total_harga ?? 1450000000
  const cicilanPerBulan = data?.cicilan_per_bulan ?? 8450000
  const jumlahTerbayar = data?.jumlah_terbayar ?? Math.round(totalHarga * 0.7)
  const sisaPembayaran = totalHarga - jumlahTerbayar
  const progresPayment = Math.min(100, Math.round((jumlahTerbayar / totalHarga) * 100))

  const defaultCicilan: Cicilan[] = [
    {
      nomor: 24,
      status: "lunas",
      tanggal: "12 Okt 2023",
      metode: "Virtual Account BCA",
      jumlah: cicilanPerBulan,
    },
    {
      nomor: 25,
      status: "menunggu",
      jatuh_tempo: "12 Nov 2023",
      jumlah: cicilanPerBulan,
    },
    {
      nomor: 26,
      status: "akan_datang",
      jatuh_tempo: "12 Des 2023",
      jumlah: cicilanPerBulan,
    },
  ]

  const unitLabel = [data?.nama_blok, data?.nomor_unit].filter(Boolean).join(" ")

  return (
    <div className="space-y-5">
      {/* Performance notification */}
      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}
      >
        <TrendingUp className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: SECONDARY }} />
        <p className="text-sm" style={{ color: "#14532d" }}>
          Bulan ini Anda membayar{" "}
          <strong>5 hari lebih awal</strong> dari jatuh tempo. Pertahankan performa kredit Anda!
        </p>
      </div>

      {/* Payment Progress Card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE }}>
        {/* Card top bar */}
        <div
          className="px-5 py-4"
          style={{
            background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_CONTAINER} 100%)`,
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Progres Pembayaran KPR
            </p>
            <span
              className="text-xs font-bold rounded-full px-2.5 py-1"
              style={{ background: "rgba(255,255,255,0.2)", color: "#ffffff" }}
            >
              {progresPayment}% Terbayar
            </span>
          </div>
          {(unitLabel || data?.nama_proyek) && (
            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
              {unitLabel}
              {data?.nama_proyek ? ` · ${data.nama_proyek}` : ""}
            </p>
          )}
        </div>

        <div className="px-5 py-5">
          {/* Progress bar */}
          <div
            className="relative h-3 rounded-full overflow-hidden mb-4"
            style={{ background: SURFACE_LOW }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
              style={{
                width: `${progresPayment}%`,
                background: `linear-gradient(90deg, ${PRIMARY} 0%, ${PRIMARY_CONTAINER} 100%)`,
              }}
            />
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs mb-0.5" style={{ color: ON_SURFACE_VARIANT }}>
                Total Harga
              </p>
              <p className="text-sm font-bold" style={{ color: ON_SURFACE }}>
                {formatRupiah(totalHarga)}
              </p>
            </div>
            <div>
              <p className="text-xs mb-0.5" style={{ color: ON_SURFACE_VARIANT }}>
                Terbayar
              </p>
              <p className="text-sm font-bold" style={{ color: SECONDARY }}>
                {formatRupiah(jumlahTerbayar)}
              </p>
            </div>
            <div>
              <p className="text-xs mb-0.5" style={{ color: ON_SURFACE_VARIANT }}>
                Sisa
              </p>
              <p className="text-sm font-bold" style={{ color: PRIMARY }}>
                {formatRupiah(sisaPembayaran)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Installment History */}
      <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE }}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <p
            className="text-sm font-bold"
            style={{ color: ON_SURFACE, fontFamily: "Manrope, Inter, sans-serif" }}
          >
            Riwayat Cicilan
          </p>
          <button
            className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-all hover:opacity-80"
            style={{ background: SURFACE_LOW, color: ON_SURFACE_VARIANT }}
          >
            <Download className="h-3.5 w-3.5" />
            Unduh Rekap
          </button>
        </div>

        <div className="divide-y" style={{ borderColor: OUTLINE_VARIANT + "40" }}>
          {defaultCicilan.map((c) => (
            <CicilanItem key={c.nomor} cicilan={c} />
          ))}
        </div>

        <div
          className="px-5 py-3 border-t"
          style={{ borderColor: OUTLINE_VARIANT + "40" }}
        >
          <button
            className="w-full text-xs font-semibold py-1 transition-all hover:opacity-70"
            style={{ color: PRIMARY }}
          >
            Lihat Semua Cicilan →
          </button>
        </div>
      </div>

      {/* Loan Details */}
      <div className="rounded-2xl p-5" style={{ background: SURFACE }}>
        <p
          className="text-sm font-bold mb-4"
          style={{ color: ON_SURFACE, fontFamily: "Manrope, Inter, sans-serif" }}
        >
          Detail Pinjaman
        </p>
        <div className="space-y-3">
          <LoanDetailRow
            icon={FileText}
            label="Nomor Akad"
            value={data?.nomor_akad ?? "KPR/2021/10/8892"}
          />
          <LoanDetailRow
            icon={TrendingUp}
            label="Suku Bunga"
            value={data?.suku_bunga ?? "4,5% Fixed (3 Tahun)"}
          />
          <LoanDetailRow
            icon={CalendarDays}
            label="Tenor"
            value={data?.tenor ?? "15 Tahun (180 Bulan)"}
          />
          <LoanDetailRow
            icon={CreditCard}
            label="Cicilan/Bulan"
            value={formatRupiah(cicilanPerBulan)}
          />
        </div>
      </div>

      {/* Early repayment promo */}
      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
      >
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#d97706" }} />
        <div>
          <p className="text-sm font-semibold mb-0.5" style={{ color: "#92400e" }}>
            Dapatkan Cashback Hingga 50 Juta
          </p>
          <p className="text-xs" style={{ color: "#b45309" }}>
            Untuk pelunasan awal KPR sebelum 31 Desember. Syarat dan ketentuan berlaku.
          </p>
        </div>
      </div>

      {/* Help Section */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_CONTAINER} 100%)`,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-bold mb-1 text-white"
              style={{ fontFamily: "Manrope, Inter, sans-serif" }}
            >
              Butuh Bantuan?
            </p>
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.75)" }}>
              Konsultasikan kebutuhan finansial Anda dengan advisor kami.
            </p>
            <button
              className="inline-flex items-center gap-2 text-xs font-semibold rounded-full px-4 py-2 transition-all hover:opacity-90 active:scale-95"
              style={{ background: "rgba(255,255,255,0.2)", color: "#ffffff" }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Chat Konsultan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KonsumenDetailPage({
  params,
}: {
  params: Promise<{ nik: string }>
}) {
  const router = useRouter()
  const { nik } = use(params)

  const [data, setData] = useState<KonsumenData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [isContactOpen, setIsContactOpen] = useState(false)

  useEffect(() => {
    fetchKonsumen()
  }, [nik])

  const fetchKonsumen = async () => {
    try {
      const res = await fetch(`/api/konsumen/${nik}`)
      const result = await res.json()

      if (result.status === "error") {
        setError(result.message || "Konsumen tidak ditemukan")
        return
      }

      setData(result.data ?? result)
    } catch {
      setError("Gagal memuat data. Periksa koneksi Anda.")
    } finally {
      setIsLoading(false)
    }
  }

  const milestones: Milestone[] = data?.milestones ?? DEFAULT_MILESTONES
  const progres = data?.progres_pembangunan ?? 65
  const namaKonsumen = data?.nama ?? "—"
  const nikDisplay = nik.replace(/(\d{6})(\d{6})(\d{4})/, "$1-$2-$3")

  // ── Render: Error ──
  if (!isLoading && error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: BG }}
      >
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: "#fde8e8" }}
          >
            <ShieldCheck className="h-8 w-8" style={{ color: "#c0392b" }} />
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: ON_SURFACE }}>
            Data Tidak Ditemukan
          </h2>
          <p className="text-sm mb-6" style={{ color: ON_SURFACE_VARIANT }}>
            {error}
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ background: PRIMARY }}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  const IMPLEMENTED_TABS = ["overview", "pembayaran"]

  return (
    <div className="min-h-screen" style={{ background: BG, color: ON_SURFACE }}>
      {/* ── Top Nav ── */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 py-4 shadow-sm"
        style={{ background: SURFACE }}
      >
        <button
          onClick={() => router.push("/")}
          className="flex-shrink-0 rounded-full p-2 transition hover:bg-gray-100 active:scale-95"
          aria-label="Kembali"
        >
          <ArrowLeft className="h-5 w-5" style={{ color: ON_SURFACE }} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate" style={{ color: ON_SURFACE_VARIANT }}>
            NIK: {nikDisplay}
          </p>
          <p className="text-sm font-bold truncate" style={{ color: ON_SURFACE, fontFamily: "Manrope, Inter, sans-serif" }}>
            {isLoading ? "Memuat..." : namaKonsumen}
          </p>
        </div>

        <div
          className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ background: "#dcfce7" }}
        >
          <BadgeCheck className="h-4 w-4" style={{ color: SECONDARY }} />
          <span className="text-xs font-semibold" style={{ color: SECONDARY }}>
            Terverifikasi
          </span>
        </div>
      </header>

      {/* ── Tab Navigation ── */}
      <div
        className="sticky top-[61px] z-20 flex justify-center gap-1 overflow-x-auto px-4 sm:px-6 py-3 no-scrollbar"
        style={{ background: SURFACE, borderBottom: `1px solid ${OUTLINE_VARIANT}40` }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all"
              style={
                isActive
                  ? { background: PRIMARY, color: "#ffffff" }
                  : { background: "transparent", color: ON_SURFACE_VARIANT }
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Main Content ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Banner Slider — always visible */}
        <BannerSlider />

        {/* Tab Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <SkeletonCard className="lg:col-span-1" />
            <SkeletonCard className="lg:col-span-2" />
            <SkeletonCard className="lg:col-span-2" />
            <SkeletonCard className="lg:col-span-1" />
          </div>
        ) : activeTab === "pembayaran" ? (
          <TabPembayaran data={data} />
        ) : activeTab === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* ─ Left Column ─ */}
            <div className="lg:col-span-1 space-y-5">
              {/* Profile Card */}
              <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE }}>
                {/* Card header with gradient */}
                <div
                  className="px-6 pt-6 pb-10"
                  style={{
                    background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_CONTAINER} 100%)`,
                  }}
                />
                <div className="px-6 pb-6 -mt-8">
                  {/* Avatar */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg overflow-hidden"
                    style={{ background: SURFACE_LOW, border: `3px solid ${SURFACE}` }}
                  >
                    {data?.foto_url ? (
                      <img
                        src={data.foto_url}
                        alt={namaKonsumen}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8" style={{ color: PRIMARY_CONTAINER }} />
                    )}
                  </div>

                  <h2
                    className="text-base font-bold leading-tight"
                    style={{ color: ON_SURFACE, fontFamily: "Manrope, Inter, sans-serif" }}
                  >
                    {namaKonsumen}
                  </h2>

                  {data?.status_konsumen && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <ShieldCheck className="h-3.5 w-3.5" style={{ color: SECONDARY }} />
                      <p className="text-xs font-medium" style={{ color: SECONDARY }}>
                        {data.status_konsumen}
                        {data.bergabung_sejak ? ` · Sejak ${data.bergabung_sejak}` : ""}
                      </p>
                    </div>
                  )}

                  {/* Contact info */}
                  <div className="mt-4 space-y-2">
                    {data?.email && (
                      <a
                        href={`mailto:${data.email}`}
                        className="flex items-center gap-2 text-xs hover:underline"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{data.email}</span>
                      </a>
                    )}
                    {data?.no_hp && (
                      <a
                        href={`tel:${data.no_hp}`}
                        className="flex items-center gap-2 text-xs hover:underline"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{data.no_hp}</span>
                      </a>
                    )}
                    {data?.alamat && (
                      <div
                        className="flex items-start gap-2 text-xs"
                        style={{ color: ON_SURFACE_VARIANT }}
                      >
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{data.alamat}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Agent Contact Card */}
              <div className="rounded-2xl p-5" style={{ background: SURFACE }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: ON_SURFACE_VARIANT }}>
                  Sales Advisor
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{ background: SURFACE_LOW }}
                  >
                    {data?.foto_agent ? (
                      <img src={data.foto_agent} alt={data.nama_agent} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-5 w-5" style={{ color: PRIMARY_CONTAINER }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: ON_SURFACE }}>
                      {data?.nama_agent ?? "Tim Sapphire"}
                    </p>
                    <p className="text-xs truncate" style={{ color: ON_SURFACE_VARIANT }}>
                      {data?.jabatan_agent ?? "Customer Success"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsContactOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: SECONDARY }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Hubungi Agen
                </button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Pembayaran", icon: CreditCard, tab: "pembayaran" },
                  { label: "Pembangunan", icon: Building2, tab: "pembangunan" },
                  { label: "Dokumen", icon: FileText, tab: "dokumen" },
                  { label: "Legalitas", icon: Scale, tab: "legalitas" },
                ].map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.tab}
                      onClick={() => setActiveTab(action.tab)}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl py-4 px-3 text-xs font-semibold transition-all hover:shadow-md active:scale-95 group"
                      style={{ background: SURFACE }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: PRIMARY + "12" }}
                      >
                        <Icon className="h-4 w-4" style={{ color: PRIMARY }} />
                      </div>
                      <span style={{ color: ON_SURFACE }}>{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ─ Right Column ─ */}
            <div className="lg:col-span-2 space-y-5">
              {/* Unit Info Card */}
              <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE }}>
                {/* Unit photo */}
                {data?.foto_unit?.[0] ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={data.foto_unit[0]}
                      alt="Foto Unit"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(3,22,50,0.6) 0%, transparent 60%)" }} />
                    {data.nama_blok && (
                      <div className="absolute bottom-4 left-5">
                        <p className="text-xl font-bold text-white" style={{ fontFamily: "Manrope, Inter, sans-serif" }}>
                          {data.nama_blok} {data.nomor_unit}
                        </p>
                        {data.nama_proyek && (
                          <p className="text-sm text-white/80">{data.nama_proyek}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="h-36 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_CONTAINER} 100%)` }}
                  >
                    <div className="text-center">
                      <Building2 className="h-10 w-10 text-white/40 mx-auto mb-2" />
                      {data?.nama_blok && (
                        <p className="text-lg font-bold text-white" style={{ fontFamily: "Manrope, Inter, sans-serif" }}>
                          {data.nama_blok} {data.nomor_unit}
                        </p>
                      )}
                      {data?.nama_proyek && (
                        <p className="text-sm text-white/70">{data.nama_proyek}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-5">
                  {/* Unit specs pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                    <StatPill
                      icon={Home}
                      label="Tipe Unit"
                      value={data?.tipe_unit ?? "—"}
                    />
                    <StatPill
                      icon={TrendingUp}
                      label="Skema"
                      value={data?.skema_pembiayaan ?? "—"}
                    />
                    <StatPill
                      icon={CalendarDays}
                      label="Target Selesai"
                      value={data?.target_selesai ?? "—"}
                    />
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold" style={{ color: ON_SURFACE }}>
                        Progres Pembangunan
                      </p>
                      <span className="text-sm font-bold" style={{ color: PRIMARY }}>
                        {progres}%
                      </span>
                    </div>
                    <div
                      className="relative h-3 rounded-full overflow-hidden"
                      style={{ background: SURFACE_LOW }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                        style={{
                          width: `${progres}%`,
                          background: `linear-gradient(90deg, ${PRIMARY} 0%, ${PRIMARY_CONTAINER} 100%)`,
                        }}
                      />
                    </div>
                    {data?.status_pembangunan && (
                      <p className="text-xs mt-1.5" style={{ color: ON_SURFACE_VARIANT }}>
                        Status: {data.status_pembangunan}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline / Milestones */}
              <div className="rounded-2xl p-5" style={{ background: SURFACE }}>
                <div className="flex items-center justify-between mb-4">
                  <p
                    className="text-sm font-bold"
                    style={{ color: ON_SURFACE, fontFamily: "Manrope, Inter, sans-serif" }}
                  >
                    Milestone Pembangunan
                  </p>
                  <span className="text-xs" style={{ color: ON_SURFACE_VARIANT }}>
                    {milestones.filter((m) => m.status === "completed").length}/{milestones.length} selesai
                  </span>
                </div>
                <div className="space-y-0">
                  {milestones.map((m, i) => (
                    <MilestoneItem key={i} item={m} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* "Segera Hadir" modal for unimplemented tabs */}
        {!isLoading && !IMPLEMENTED_TABS.includes(activeTab) && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setActiveTab("overview")}
          >
            <div
              className="max-w-xs w-full mx-4 rounded-2xl p-8 text-center shadow-2xl"
              style={{ background: SURFACE }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: PRIMARY + "12" }}
              >
                {(() => {
                  const tab = TABS.find((t) => t.id === activeTab)
                  const Icon = tab?.icon ?? Home
                  return <Icon className="h-7 w-7" style={{ color: PRIMARY }} />
                })()}
              </div>
              <p
                className="text-base font-bold mb-2"
                style={{ color: ON_SURFACE, fontFamily: "Manrope, Inter, sans-serif" }}
              >
                Segera Hadir
              </p>
              <p className="text-sm mb-5" style={{ color: ON_SURFACE_VARIANT }}>
                Fitur{" "}
                <strong>{TABS.find((t) => t.id === activeTab)?.label}</strong>{" "}
                sedang dalam pengembangan.
              </p>
              <button
                onClick={() => setActiveTab("overview")}
                className="rounded-full px-6 py-2.5 text-sm font-semibold text-white"
                style={{ background: PRIMARY }}
              >
                Kembali ke Overview
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        agentName={data?.nama_agent ?? "Tim Sapphire"}
        agentTitle={data?.jabatan_agent ?? "Customer Success"}
        agentPhone={data?.no_hp_agent}
        agentPhoto={data?.foto_agent}
        konsumenName={data?.nama}
      />
    </div>
  )
}
