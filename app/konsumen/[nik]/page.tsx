"use client"

import { useState, useEffect, use, Fragment, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
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
  Hammer,
  HardHat,
  ClipboardCheck,
  Layers,
  PaintBucket,
  Paintbrush,
  ShieldAlert,
  Info,
  Wallet,
  Activity,
  X,
  ChevronLeft,
  ChevronRight,
  ImageOff,
} from "lucide-react"
// import BannerSlider from "@/components/banner-slider"
import ContactModal from "@/components/contact-modal"
import AdsSlider from "@/components/ads-slider"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Milestone {
  nama: string
  status: "completed" | "in_progress" | "upcoming"
  tanggal?: string
}

interface ProgresTahap {
  id: string
  nama: string
  persen: number
  status: "completed" | "in_progress" | "upcoming" | "pending_bast"
  tanggal_mulai?: string
  tanggal_selesai?: string
  catatan?: string
  foto?: string[]
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
  progres_tahap?: ProgresTahap[]
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

// ─── Design tokens ────────────────────────────────────────────────────────────
// Dark glass dashboard (ui-ux-pro-max: Dark Mode, teal/cyan accent + status colors)

const GLASS = "rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl"
const TILE = "rounded-2xl bg-white/[0.07]"
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
const HATCH = "repeating-linear-gradient(135deg, rgba(255,255,255,0.14) 0 2px, transparent 2px 7px)"

const CYAN = "#5fd4de"
const GREEN = "#6fd39a"
const AMBER = "#f0b64f"
const CORAL = "#f07a5a"

const PAGE_BG =
  "radial-gradient(ellipse 80% 60% at 60% 35%, #14505c 0%, #0c2a33 40%, #07151c 75%, #050e13 100%)"

const TABS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "pembayaran", label: "Pembayaran", icon: CreditCard },
  { id: "pembangunan", label: "Pembangunan", icon: Building2 },
  { id: "dokumen", label: "Dokumen", icon: FileText },
  { id: "legalitas", label: "Legalitas", icon: Scale },
]

const IMPLEMENTED_TABS = ["overview", "pembayaran", "pembangunan"]

const DEFAULT_MILESTONES: Milestone[] = [
  { nama: "Booking & Reservasi", status: "completed", tanggal: "Jan 2024" },
  { nama: "Akad Kredit & Legalitas", status: "completed", tanggal: "Mar 2024" },
  { nama: "Konstruksi Dinding", status: "in_progress" },
  { nama: "Pemasangan Atap", status: "upcoming" },
  { nama: "Finishing Interior", status: "upcoming" },
  { nama: "Serah Terima Kunci", status: "upcoming", tanggal: "Okt 2024" },
]

const DEFAULT_PROGRES_TAHAP: ProgresTahap[] = [
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
]

const TAHAP_ICONS: Record<string, React.ElementType> = {
  pondasi: Hammer,
  atap: HardHat,
  fasad: Paintbrush,
  hitaman: PaintBucket,
  bast: ClipboardCheck,
}

// Hotspot positions on the isometric house image (percent of the square image)
const HOTSPOTS: Record<string, { top: string; left: string }> = {
  atap: { top: "13%", left: "40%" },
  fasad: { top: "36%", left: "66%" },
  pondasi: { top: "62%", left: "4%" },
  hitaman: { top: "58%", left: "44%" },
}

const STATUS_STYLE = {
  completed: { label: "Selesai", color: GREEN, icon: CheckCircle2 },
  in_progress: { label: "Sedang Berjalan", color: AMBER, icon: Clock },
  upcoming: { label: "Belum Dimulai", color: "#8fa3a8", icon: Circle },
  pending_bast: { label: "Menunggu BAST", color: CYAN, icon: ClipboardCheck },
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatRupiahShort(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)
}

function getPayment(data: KonsumenData | null) {
  const total = data?.total_harga ?? 1450000000
  const cicilan = data?.cicilan_per_bulan ?? 8450000
  const terbayar = data?.jumlah_terbayar ?? Math.round(total * 0.7)
  const persen = Math.min(100, Math.round((terbayar / total) * 100))
  return { total, cicilan, terbayar, sisa: total - terbayar, persen }
}

function barFill(t: ProgresTahap) {
  if (t.status === "completed") return `linear-gradient(180deg, ${CYAN} 0%, #2a8f9a 100%)`
  if (t.status === "in_progress") return `linear-gradient(180deg, ${AMBER} 0%, #b9742a 100%)`
  return "transparent"
}

// ─── Shared bits ──────────────────────────────────────────────────────────────

function CardHeader({
  title,
  subtitle,
  onOpen,
  openLabel,
}: {
  title: string
  subtitle?: string
  onOpen?: () => void
  openLabel?: string
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-white/60">{subtitle}</p>}
      </div>
      {onOpen && (
        <button
          onClick={onOpen}
          aria-label={openLabel ?? `Buka ${title}`}
          className={`flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/[0.08] text-white/70 transition-colors duration-200 hover:bg-white/15 hover:text-white ${FOCUS}`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

function ProgressBar({ value, color = CYAN, className = "h-2" }: { value: number; color?: string; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-full bg-white/10 ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full motion-safe:transition-[width] motion-safe:duration-700"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  )
}

function StatusChip({ status }: { status: ProgresTahap["status"] }) {
  const s = STATUS_STYLE[status]
  const Icon = s.icon
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: `${s.color}1f`, color: s.color }}
    >
      <Icon className="h-3 w-3" />
      {s.label}
    </span>
  )
}

function HelpCard({ title, text, cta, onClick }: { title: string; text: string; cta: string; onClick: () => void }) {
  return (
    <div className={`${GLASS} flex flex-col gap-4 p-5 sm:flex-row sm:items-center`}>
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: `${CYAN}22` }}>
        <MessageCircle className="h-5 w-5" style={{ color: CYAN }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-sm text-white/60">{text}</p>
      </div>
      <button
        onClick={onClick}
        className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-[#062026] transition-opacity duration-200 hover:opacity-90 ${FOCUS}`}
        style={{ background: CYAN }}
      >
        <MessageCircle className="h-4 w-4" />
        {cta}
      </button>
    </div>
  )
}

function Notice({ icon: Icon, color, title, text }: { icon: React.ElementType; color: string; title?: string; text: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border p-4" style={{ background: `${color}14`, borderColor: `${color}40` }}>
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color }} />
      <div>
        {title && <p className="mb-0.5 text-sm font-semibold text-white">{title}</p>}
        <p className="text-sm leading-relaxed text-white/70">{text}</p>
      </div>
    </div>
  )
}

// ─── Overview: left panel ─────────────────────────────────────────────────────

function ProfilePanel({
  data,
  id,
  onContact,
}: {
  data: KonsumenData | null
  id: string
  onContact: () => void
}) {
  const tahap = data?.progres_tahap ?? DEFAULT_PROGRES_TAHAP
  const milestones = data?.milestones ?? DEFAULT_MILESTONES
  const pay = getPayment(data)

  const tiles = [
    { label: "Progres Unit", value: String(data?.progres_pembangunan ?? 65), unit: "%" },
    { label: "Terbayar", value: String(pay.persen), unit: "%" },
    { label: "Tahap Selesai", value: String(tahap.filter((t) => t.status === "completed").length), unit: `/${tahap.length}` },
    { label: "Milestone", value: String(milestones.filter((m) => m.status === "completed").length), unit: `/${milestones.length}` },
  ]

  const rows = [
    { icon: Home, title: "Tipe Unit", sub: data?.gaya ?? "Hunian", value: data?.tipe_unit ?? "—" },
    { icon: Activity, title: "Status Pembangunan", sub: "Tahap saat ini", value: data?.status_pembangunan ?? "—" },
    { icon: TrendingUp, title: "Skema Pembiayaan", sub: "Metode bayar", value: data?.skema_pembiayaan ?? "—" },
    { icon: Wallet, title: "Total Harga", sub: "Harga unit", value: formatRupiahShort(pay.total) },
    { icon: CalendarDays, title: "Target Serah Terima", sub: "Estimasi", value: data?.target_selesai ?? "—" },
  ]

  return (
    <aside className={`${GLASS} flex flex-col p-5`}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
          {data?.foto_url ? (
            <img src={data.foto_url} alt={data?.nama ?? "Foto konsumen"} className="h-full w-full object-cover" />
          ) : (
            <User className="h-6 w-6 text-white/70" />
          )}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-white">{data?.nama ?? "—"}</h2>
          <p className="truncate text-xs text-white/60">ID {id}</p>
        </div>
      </div>

      {data?.status_konsumen && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium" style={{ color: GREEN }}>
          <ShieldCheck className="h-3.5 w-3.5" />
          {data.status_konsumen}
          {data.bergabung_sejak ? ` · Sejak ${data.bergabung_sejak}` : ""}
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {tiles.map((t) => (
          <div key={t.label} className={`${TILE} px-4 py-3.5`}>
            <p className="text-xs text-white/65">{t.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white tabular-nums">
              {t.value}
              <span className="ml-0.5 text-sm font-normal text-white/60">{t.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-white/10">
        {rows.map((r) => {
          const Icon = r.icon
          return (
            <li key={r.title} className="group flex items-center gap-3 py-3.5">
              <Icon className="h-5 w-5 flex-shrink-0 text-white/60 transition-colors duration-200 group-hover:text-[#5fd4de]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white transition-colors duration-200 group-hover:text-[#5fd4de]">
                  {r.title}
                </p>
                <p className="text-xs text-white/55">{r.sub}</p>
              </div>
              <p className="max-w-[45%] text-right text-sm font-medium text-white transition-colors duration-200 group-hover:text-[#5fd4de]">
                {r.value}
              </p>
            </li>
          )
        })}
      </ul>

      <div className="mt-2 space-y-2 border-t border-white/10 pt-4 text-xs text-white/65">
        {data?.email && (
          <a href={`mailto:${data.email}`} className={`flex items-center gap-2 rounded hover:text-white ${FOCUS}`}>
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{data.email}</span>
          </a>
        )}
        {data?.no_hp && (
          <a href={`tel:${data.no_hp}`} className={`flex items-center gap-2 rounded hover:text-white ${FOCUS}`}>
            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
            {data.no_hp}
          </a>
        )}
        {data?.alamat && (
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span className="line-clamp-2">{data.alamat}</span>
          </p>
        )}
      </div>

      <div className={`${TILE} mt-5 flex items-center gap-3 p-3`}>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10">
          {data?.foto_agent ? (
            <img src={data.foto_agent} alt={data.nama_agent ?? "Foto agen"} className="h-full w-full object-cover" />
          ) : (
            <User className="h-5 w-5 text-white/70" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{data?.nama_agent ?? "Tim Sapphire"}</p>
          <p className="truncate text-xs text-white/60">{data?.jabatan_agent ?? "Customer Success"}</p>
        </div>
        <button
          onClick={onContact}
          aria-label="Hubungi agen"
          className={`flex h-11 w-11 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-[#062026] transition-opacity duration-200 hover:opacity-90 ${FOCUS}`}
          style={{ background: CYAN }}
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>
    </aside>
  )
}

// ─── Overview: hero + bottom cards ────────────────────────────────────────────

function HouseHero({ data }: { data: KonsumenData | null }) {
  const tahap = data?.progres_tahap ?? DEFAULT_PROGRES_TAHAP
  const unitLabel = [data?.nama_blok, data?.nomor_unit].filter(Boolean).join(" · ")

  return (
    <div className="relative w-full lg:static">
      <div className="relative z-10 max-w-md lg:absolute lg:left-2 lg:top-2">
        <p className="text-sm font-medium text-white/65">Unit Anda</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{unitLabel || "Unit"}</h1>
        {data?.nama_proyek && <p className="mt-1 text-sm text-white/70">{data.nama_proyek}</p>}
      </div>

      {/* Square wrapper keeps hotspots aligned with the image; negative margins eat its transparent padding */}
      <div className="relative mx-auto aspect-square w-full max-w-[640px] lg:-mb-20 lg:-mt-10 lg:max-w-[780px]">
        <div
          aria-hidden
          className="absolute inset-[4%] rounded-full"
          style={{ background: "radial-gradient(circle closest-side, rgb(110 190 210 / 0.4) 0%, rgb(110 190 210 / 0.15) 55%, transparent 100%)" }}
        />
        <img
          src="/isometric-house/house-v3.webp"
          alt={`Ilustrasi 3D unit ${unitLabel || "rumah"}`}
          width={1600}
          height={1600}
          className="relative h-full w-full object-contain"
        />
        {tahap
          .filter((t) => HOTSPOTS[t.id])
          .map((t) => {
            const s = STATUS_STYLE[t.status]
            return (
              <div
                key={t.id}
                className="absolute flex items-center gap-2 rounded-full border border-white/15 bg-[#07151c]/70 py-1.5 pl-2 pr-3 text-xs font-medium text-white shadow-lg backdrop-blur-md"
                style={HOTSPOTS[t.id]}
              >
                <span className="relative flex h-2.5 w-2.5">
                  {t.status === "in_progress" && (
                    <span className="absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping" style={{ background: s.color }} />
                  )}
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                </span>
                {t.nama}
                <span className="tabular-nums text-white/70">{t.persen}%</span>
              </div>
            )
          })}
      </div>
    </div>
  )
}

function TahapBarsCard({ data, onOpen }: { data: KonsumenData | null; onOpen: () => void }) {
  const tahap = data?.progres_tahap ?? DEFAULT_PROGRES_TAHAP
  return (
    <div className={`${GLASS} p-5`}>
      <CardHeader title="Tahap Pembangunan" onOpen={onOpen} openLabel="Lihat detail pembangunan" />
      <div className="mt-4 flex items-end justify-between gap-2">
        {tahap.map((t) => (
          <div key={t.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-xs tabular-nums text-white/75">{t.persen}%</span>
            <div className="relative h-32 w-full max-w-12 overflow-hidden rounded-xl" style={{ background: HATCH }}>
              <div
                className="absolute inset-x-0 bottom-0 rounded-xl motion-safe:transition-[height] motion-safe:duration-700"
                style={{ height: `${t.persen}%`, background: barFill(t) }}
              />
            </div>
            <span className="w-full truncate text-center text-xs text-white/75">{t.nama}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PaymentCard({ data, onOpen }: { data: KonsumenData | null; onOpen: () => void }) {
  const pay = getPayment(data)
  const TICKS = 48
  const filled = Math.round((pay.persen / 100) * TICKS)
  return (
    <div className={`${GLASS} p-5`}>
      <CardHeader
        title="Pembayaran KPR"
        subtitle={data?.skema_pembiayaan ?? "Cicilan bulanan"}
        onOpen={onOpen}
        openLabel="Lihat detail pembayaran"
      />
      <div className={`${TILE} mt-4 p-4`}>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: `${pay.persen}%`, l: "Terbayar" },
            { v: `${100 - pay.persen}%`, l: "Sisa" },
            { v: formatRupiahShort(pay.cicilan), l: "Per Bulan" },
          ].map((s) => (
            <div key={s.l} className="min-w-0">
              <p className="truncate text-xl font-semibold tabular-nums text-white">{s.v}</p>
              <p className="text-xs text-white/60">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-xs text-white/55">
          <span>Mulai</span>
          <span>Lunas</span>
        </div>
        <div className="mt-1.5 flex h-8 items-stretch gap-[3px]" aria-hidden>
          {Array.from({ length: TICKS }, (_, i) => (
            <span
              key={i}
              className="flex-1 rounded-full"
              style={{ background: i < filled ? CYAN : "rgba(255,255,255,0.18)" }}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-white/65">
        Terbayar {formatRupiahShort(pay.terbayar)} dari {formatRupiahShort(pay.total)}
      </p>
    </div>
  )
}

function MilestoneCard({ data }: { data: KonsumenData | null }) {
  const milestones = data?.milestones ?? DEFAULT_MILESTONES
  const current = Math.max(0, milestones.findIndex((m) => m.status === "in_progress"))
  const start = Math.min(Math.max(0, current - 1), Math.max(0, milestones.length - 4))
  const visible = milestones.slice(start, start + 4)

  return (
    <div className={`${GLASS} p-5`}>
      <CardHeader
        title="Milestone"
        subtitle={`${milestones.filter((m) => m.status === "completed").length} dari ${milestones.length} selesai`}
      />
      <ul className="mt-3 divide-y divide-white/10">
        {visible.map((m) => {
          const s = STATUS_STYLE[m.status]
          const Icon = s.icon
          return (
            <li key={m.nama} className="flex items-center gap-3 py-2.5">
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: `${s.color}24` }}
              >
                <Icon className="h-4 w-4" style={{ color: s.color }} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{m.nama}</p>
                <p className="text-xs text-white/60">
                  {m.status === "in_progress"
                    ? "Sedang berjalan"
                    : `${m.status === "completed" ? "Selesai" : "Target"}${m.tanggal ? ` · ${m.tanggal}` : ""}`}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ─── Pembayaran Tab ───────────────────────────────────────────────────────────

function CicilanItem({ cicilan }: { cicilan: Cicilan }) {
  const style = {
    lunas: { label: "Lunas", color: GREEN, icon: CheckCircle2 },
    menunggu: { label: "Menunggu", color: AMBER, icon: Clock },
    akan_datang: { label: "Akan Datang", color: "#8fa3a8", icon: Circle },
  }[cicilan.status]
  const Icon = style.icon

  return (
    <li className="flex items-center gap-3 px-5 py-4">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${style.color}24` }}>
        <Icon className="h-4 w-4" style={{ color: style.color }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-white">Cicilan #{cicilan.nomor}</p>
          <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: `${style.color}1f`, color: style.color }}>
            {style.label}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-white/60">
          {cicilan.status === "lunas"
            ? `Dibayar ${cicilan.tanggal}${cicilan.metode ? ` · ${cicilan.metode}` : ""}`
            : `Jatuh tempo: ${cicilan.jatuh_tempo}`}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums text-white">{formatRupiah(cicilan.jumlah)}</p>
        {cicilan.status === "menunggu" && (
          <button
            className={`mt-1.5 min-h-9 cursor-pointer rounded-full px-4 text-xs font-semibold text-[#062026] transition-opacity duration-200 hover:opacity-90 ${FOCUS}`}
            style={{ background: CYAN }}
          >
            Bayar
          </button>
        )}
      </div>
    </li>
  )
}

function TabPembayaran({ data, onContact }: { data: KonsumenData | null; onContact: () => void }) {
  const pay = getPayment(data)
  const unitLabel = [data?.nama_blok, data?.nomor_unit].filter(Boolean).join(" ")

  const [showAllCicilan, setShowAllCicilan] = useState(false)
  const cicilanList: Cicilan[] = [
    { nomor: 21, status: "lunas", tanggal: "11 Jul 2023", metode: "Virtual Account BCA", jumlah: pay.cicilan },
    { nomor: 22, status: "lunas", tanggal: "10 Agu 2023", metode: "Virtual Account BCA", jumlah: pay.cicilan },
    { nomor: 23, status: "lunas", tanggal: "12 Sep 2023", metode: "Autodebet BTN", jumlah: pay.cicilan },
    { nomor: 24, status: "lunas", tanggal: "12 Okt 2023", metode: "Virtual Account BCA", jumlah: pay.cicilan },
    { nomor: 25, status: "menunggu", jatuh_tempo: "12 Nov 2023", jumlah: pay.cicilan },
    { nomor: 26, status: "akan_datang", jatuh_tempo: "12 Des 2023", jumlah: pay.cicilan },
    { nomor: 27, status: "akan_datang", jatuh_tempo: "12 Jan 2024", jumlah: pay.cicilan },
    { nomor: 28, status: "akan_datang", jatuh_tempo: "12 Feb 2024", jumlah: pay.cicilan },
  ]
  const visibleCicilan = showAllCicilan ? cicilanList : cicilanList.slice(0, 5)

  const loanRows = [
    { icon: FileText, label: "Nomor Akad", value: data?.nomor_akad ?? "KPR/2021/10/8892" },
    { icon: TrendingUp, label: "Suku Bunga", value: data?.suku_bunga ?? "4,5% Fixed (3 Tahun)" },
    { icon: CalendarDays, label: "Tenor", value: data?.tenor ?? "15 Tahun (180 Bulan)" },
    { icon: CreditCard, label: "Cicilan/Bulan", value: formatRupiah(pay.cicilan) },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Notice
          icon={TrendingUp}
          color={GREEN}
          text={
            <>
              Bulan ini Anda membayar <strong className="text-white">5 hari lebih awal</strong> dari jatuh tempo.
              Pertahankan performa kredit Anda!
            </>
          }
        />

        <div className={`${GLASS} p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white/65">Progres Pembayaran KPR</p>
              {(unitLabel || data?.nama_proyek) && (
                <p className="mt-1 text-sm text-white/75">
                  {unitLabel}
                  {data?.nama_proyek ? ` · ${data.nama_proyek}` : ""}
                </p>
              )}
            </div>
            <p className="text-3xl font-semibold tabular-nums text-white">{pay.persen}%</p>
          </div>
          <ProgressBar value={pay.persen} className="mt-4 h-3" />
          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {[
              { l: "Total Harga", v: pay.total, c: "#fff" },
              { l: "Terbayar", v: pay.terbayar, c: GREEN },
              { l: "Sisa", v: pay.sisa, c: CYAN },
            ].map((a) => (
              <div key={a.l} className={`${TILE} px-4 py-3`}>
                <p className="text-xs text-white/60">{a.l}</p>
                <p className="mt-1 text-sm font-semibold tabular-nums" style={{ color: a.c }}>
                  {formatRupiah(a.v)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className={`${GLASS} overflow-hidden`}>
          <div className="flex items-center justify-between px-5 pb-2 pt-5">
            <h3 className="text-base font-semibold text-white">Riwayat Cicilan</h3>
            <button
              className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full bg-white/[0.08] px-3.5 text-xs font-medium text-white/80 transition-colors duration-200 hover:bg-white/15 ${FOCUS}`}
            >
              <Download className="h-3.5 w-3.5" />
              Unduh Rekap
            </button>
          </div>
          <ul className="divide-y divide-white/10">
            {visibleCicilan.map((c) => (
              <CicilanItem key={c.nomor} cicilan={c} />
            ))}
          </ul>
          <button
            onClick={() => setShowAllCicilan((v) => !v)}
            aria-expanded={showAllCicilan}
            className={`w-full cursor-pointer border-t border-white/10 py-3.5 text-sm font-medium transition-colors duration-200 hover:bg-white/[0.04] ${FOCUS}`}
            style={{ color: CYAN }}
          >
            {showAllCicilan ? "Tampilkan Lebih Sedikit" : `Lihat Semua Cicilan (${cicilanList.length})`}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className={`${GLASS} p-5`}>
          <h3 className="text-base font-semibold text-white">Detail Pinjaman</h3>
          <ul className="mt-3 divide-y divide-white/10">
            {loanRows.map((r) => {
              const Icon = r.icon
              return (
                <li key={r.label} className="flex items-center gap-3 py-3">
                  <Icon className="h-4 w-4 flex-shrink-0 text-white/60" />
                  <p className="flex-1 text-sm text-white/65">{r.label}</p>
                  <p className="max-w-[55%] text-right text-sm font-medium text-white">{r.value}</p>
                </li>
              )
            })}
          </ul>
        </div>

        <HelpCard
          title="Butuh Bantuan?"
          text="Konsultasikan kebutuhan finansial Anda dengan advisor kami."
          cta="Chat Konsultan"
          onClick={onContact}
        />

        <AdsSlider />
      </div>
    </div>
  )
}

// ─── Pembangunan Tab ──────────────────────────────────────────────────────────

// ponytail: picsum placeholders (seeded per tahap) until the API sends `foto`; same seed = same photo at any size
function tahapPhotos(t: ProgresTahap): string[] {
  if (t.foto?.length) return t.foto
  if (t.status === "upcoming") return []
  return Array.from({ length: 5 }, (_, i) => `https://picsum.photos/seed/sapphire-${t.id}-${i + 1}/300/300`)
}

const fullSize = (src: string) => src.replace(/\/300\/300$/, "/1200/1200")

function PhotoPreview({
  tahap,
  index,
  onChange,
  onClose,
}: {
  tahap: ProgresTahap
  index: number
  onChange: (i: number) => void
  onClose: () => void
}) {
  const photos = tahapPhotos(tahap)
  const step = useCallback((d: number) => onChange((index + d + photos.length) % photos.length), [index, photos.length, onChange])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") step(1)
      if (e.key === "ArrowLeft") step(-1)
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose, step])

  const navBtn = `absolute top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors duration-200 hover:bg-black/70 ${FOCUS}`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${tahap.nama}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <img
          src={fullSize(photos[index])}
          alt={`Foto progres ${tahap.nama} ${index + 1} dari ${photos.length}`}
          className="mx-auto max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
        />
        {photos.length > 1 && (
          <>
            <button onClick={() => step(-1)} aria-label="Foto sebelumnya" className={`${navBtn} left-3`}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => step(1)} aria-label="Foto berikutnya" className={`${navBtn} right-3`}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        <div className="mt-3 flex items-center justify-between text-sm text-white/80">
          <span>
            {tahap.nama} · Foto {index + 1} dari {photos.length}
          </span>
          <button
            onClick={onClose}
            aria-label="Tutup pratinjau"
            className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-white/20 ${FOCUS}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function TahapCard({ tahap, onOpenPhoto }: { tahap: ProgresTahap; onOpenPhoto: (i: number) => void }) {
  const Icon = TAHAP_ICONS[tahap.id] ?? Layers
  const s = STATUS_STYLE[tahap.status]
  const photos = tahapPhotos(tahap)

  return (
    <div className={`${GLASS} p-5 ${tahap.status === "upcoming" ? "opacity-75" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${s.color}24` }}>
            <Icon className="h-5 w-5" style={{ color: s.color }} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{tahap.nama}</p>
            {tahap.id === "bast" && <p className="text-xs text-white/60">Berita Acara Serah Terima</p>}
          </div>
        </div>
        <StatusChip status={tahap.status} />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-white/60">Progres</span>
        <span className="text-sm font-semibold tabular-nums" style={{ color: s.color }}>
          {tahap.persen}%
        </span>
      </div>
      <ProgressBar value={tahap.persen} color={tahap.status === "completed" ? CYAN : s.color} className="mt-1.5 h-2" />

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
        {tahap.tanggal_mulai && (
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" />
            Mulai: <span className="font-medium text-white">{tahap.tanggal_mulai}</span>
          </span>
        )}
        {tahap.tanggal_selesai && (
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3" style={{ color: GREEN }} />
            Selesai: <span className="font-medium" style={{ color: GREEN }}>{tahap.tanggal_selesai}</span>
          </span>
        )}
      </div>

      {tahap.catatan && (
        <div className={`${TILE} mt-3 flex items-start gap-2 px-3 py-2.5`}>
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-white/60" />
          <p className="text-xs leading-relaxed text-white/70">{tahap.catatan}</p>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 text-xs text-white/60">Foto Progres</p>
        {photos.length ? (
          <div className="grid grid-cols-5 gap-2">
            {photos.map((src, i) => (
              <button
                key={src}
                onClick={() => onOpenPhoto(i)}
                aria-label={`Lihat foto ${tahap.nama} ${i + 1}`}
                className={`group aspect-square cursor-pointer overflow-hidden rounded-xl bg-white/[0.07] ${FOCUS}`}
              >
                <img
                  src={src}
                  alt=""
                  width={300}
                  height={300}
                  loading="lazy"
                  className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-80"
                />
              </button>
            ))}
          </div>
        ) : (
          <p className={`${TILE} flex items-center gap-2 px-3 py-2.5 text-xs text-white/60`}>
            <ImageOff className="h-3.5 w-3.5" />
            Foto tersedia setelah tahap dimulai.
          </p>
        )}
      </div>
    </div>
  )
}

function TabPembangunan({ data, onContact }: { data: KonsumenData | null; onContact: () => void }) {
  const tahapList = data?.progres_tahap ?? DEFAULT_PROGRES_TAHAP
  const progres = data?.progres_pembangunan ?? 65
  const completed = tahapList.filter((t) => t.status === "completed").length
  const running = tahapList.filter((t) => t.status === "in_progress").length
  const unitLabel = [data?.nama_blok, data?.nomor_unit].filter(Boolean).join(" ")
  const [preview, setPreview] = useState<{ tahap: ProgresTahap; index: number } | null>(null)
  const closePreview = useCallback(() => setPreview(null), [])
  const changePreview = useCallback((index: number) => setPreview((p) => (p ? { ...p, index } : p)), [])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${GLASS} p-5 lg:col-span-2`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white/65">Progres Keseluruhan</p>
              {(unitLabel || data?.nama_proyek) && (
                <p className="mt-1 text-sm text-white/75">
                  {unitLabel}
                  {data?.nama_proyek ? ` · ${data.nama_proyek}` : ""}
                </p>
              )}
            </div>
            <p className="text-3xl font-semibold tabular-nums text-white">{progres}%</p>
          </div>
          <ProgressBar value={progres} color={`linear-gradient(90deg, #2a8f9a, ${CYAN})`} className="mt-4 h-3" />
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {[
              { v: completed, l: "Selesai", c: GREEN },
              { v: running, l: "Berjalan", c: AMBER },
              { v: tahapList.length - completed - running, l: "Menunggu", c: "#fff" },
            ].map((s) => (
              <div key={s.l} className={`${TILE} px-4 py-3 text-center`}>
                <p className="text-2xl font-semibold tabular-nums" style={{ color: s.c }}>
                  {s.v}
                </p>
                <p className="text-xs text-white/60">{s.l}</p>
              </div>
            ))}
          </div>
          {data?.target_selesai && (
            <p className="mt-4 flex items-center gap-2 text-sm text-white/65">
              <CalendarDays className="h-4 w-4" />
              Target Serah Terima: <span className="font-medium text-white">{data.target_selesai}</span>
            </p>
          )}
        </div>

        <TahapBarsCard data={data} onOpen={() => document.getElementById("detail-tahap")?.scrollIntoView({ behavior: "smooth" })} />
      </div>

      <div className={`${GLASS} p-5`}>
        <h3 className="text-base font-semibold text-white">Timeline Tahapan</h3>
        {/* -mx/px + py leave room for the rings and ripples inside the scroll container */}
        <div className="-mx-5 mt-1 flex items-start justify-between overflow-x-auto px-5 py-5 [scrollbar-width:none]">
          {tahapList.map((t, idx) => {
            const Icon = TAHAP_ICONS[t.id] ?? Layers
            const s = STATUS_STYLE[t.status]
            return (
              <Fragment key={t.id}>
                <div className="flex w-16 flex-shrink-0 flex-col items-center gap-1.5">
                  <span
                    className="relative flex h-11 w-11 items-center justify-center rounded-full"
                    style={{
                      background: t.status === "completed" ? CYAN : `${s.color}24`,
                      boxShadow: t.status === "in_progress" ? `0 0 0 2px ${AMBER}` : "none",
                    }}
                  >
                    {t.status === "in_progress" &&
                      [0, 1].map((n) => (
                        <span
                          key={n}
                          aria-hidden
                          className="absolute inset-0 rounded-full border-2 opacity-0 motion-safe:animate-[tahap-ripple_2.4s_ease-out_infinite]"
                          style={{ borderColor: AMBER, animationDelay: `${n * 1.2}s` }}
                        />
                      ))}
                    {t.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-[#062026]" />
                    ) : (
                      <Icon className="h-4 w-4" style={{ color: s.color }} />
                    )}
                  </span>
                  <p className="max-w-16 text-center text-xs font-medium leading-tight text-white/80">{t.nama}</p>
                  <p className="text-xs font-semibold tabular-nums" style={{ color: s.color }}>
                    {t.persen}%
                  </p>
                </div>
                {idx < tahapList.length - 1 && (
                  <div className="-mx-2.5 mt-[21px] h-0.5 min-w-6 flex-1 bg-white/10">
                    <div
                      className="h-full rounded-full bg-[length:200%_100%] motion-safe:animate-[tahap-flow_2.5s_linear_infinite]"
                      style={{
                        // full once the next stage has started, empty otherwise, so the line stops at the last active stage
                        width: tahapList[idx + 1].status === "upcoming" ? "0%" : "100%",
                        backgroundImage: `linear-gradient(90deg, ${t.status === "completed" ? CYAN : AMBER} 0%, #ffffff 25%, ${
                          t.status === "completed" ? CYAN : AMBER
                        } 50%, ${t.status === "completed" ? CYAN : AMBER} 100%)`,
                      }}
                    />
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>
      </div>

      <div id="detail-tahap" className="scroll-mt-32">
        <h3 className="mb-3 text-base font-semibold text-white">Detail Per Tahap</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {tahapList.map((t) => (
            <TahapCard key={t.id} tahap={t} onOpenPhoto={(index) => setPreview({ tahap: t, index })} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Notice
          icon={ShieldAlert}
          color={CYAN}
          title="Informasi BAST"
          text="Berita Acara Serah Terima (BAST) dilakukan setelah seluruh tahap pembangunan selesai dan lolos inspeksi kualitas. Tim kami akan menghubungi Anda untuk penjadwalan."
        />
        <HelpCard
          title="Ada Pertanyaan Tentang Pembangunan?"
          text="Konsultasikan progres unit Anda dengan tim teknis kami."
          cta="Hubungi Tim"
          onClick={onContact}
        />
      </div>

      {preview && <PhotoPreview tahap={preview.tahap} index={preview.index} onChange={changePreview} onClose={closePreview} />}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KonsumenDetailPage({ params }: { params: Promise<{ nik: string }> }) {
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

  const openContact = () => setIsContactOpen(true)

  // ── Render: Error ──
  if (!isLoading && error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: PAGE_BG }}>
        <div className={`${GLASS} max-w-sm p-8 text-center`}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: `${CORAL}24` }}>
            <ShieldCheck className="h-8 w-8" style={{ color: CORAL }} />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-white">Data Tidak Ditemukan</h2>
          <p className="mb-6 text-sm text-white/65">{error}</p>
          <button
            onClick={() => router.push("/")}
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-6 text-sm font-semibold text-[#062026] ${FOCUS}`}
            style={{ background: CYAN }}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  const activeTabInfo = TABS.find((t) => t.id === activeTab)

  return (
    <div className="min-h-screen text-white" style={{ background: PAGE_BG, backgroundAttachment: "fixed" }}>
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07151c]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap">
          <button
            onClick={() => router.push("/")}
            aria-label="Kembali ke beranda"
            className={`flex h-11 w-11 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/[0.08] transition-colors duration-200 hover:bg-white/15 ${FOCUS}`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 flex-col lg:flex-none">
            <span className="truncate text-lg font-semibold leading-tight">Lacak Konsumen</span>
            <span className="truncate text-xs text-white/60">By Siproper Digital System</span>
          </div>

          <nav
            aria-label="Bagian detail konsumen"
            className="order-last -mx-1 flex w-full gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] lg:order-none lg:mx-auto lg:w-auto"
          >
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`min-h-10 flex-shrink-0 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors duration-200 ${FOCUS} ${
                    isActive
                      ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-200"
                      : "border-white/10 bg-white/[0.05] text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>

          <div className="flex flex-shrink-0 items-center gap-2">
            {data?.target_selesai && (
              <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-sm text-white/80 xl:inline-flex">
                <CalendarDays className="h-4 w-4" />
                {data.target_selesai}
              </span>
            )}
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold"
              style={{ background: `${GREEN}1f`, color: GREEN }}
            >
              <BadgeCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Terverifikasi</span>
            </span>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="mx-auto max-w-[1440px] space-y-4 px-4 py-5 sm:px-6">
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-12" aria-busy="true" aria-label="Memuat data">
            <div className={`${GLASS} h-[640px] animate-pulse lg:col-span-4 xl:col-span-3`} />
            <div className="space-y-4 lg:col-span-8 xl:col-span-9">
              <div className="h-[420px] animate-pulse rounded-3xl bg-white/[0.04]" />
              <div className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className={`${GLASS} h-56 animate-pulse`} />
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === "pembayaran" ? (
          <TabPembayaran data={data} onContact={openContact} />
        ) : activeTab === "pembangunan" ? (
          <TabPembangunan data={data} onContact={openContact} />
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-4 xl:col-span-3">
                <ProfilePanel data={data} id={nik} onContact={openContact} />
              </div>
              <section className="relative order-first flex flex-col lg:order-none lg:col-span-8 xl:col-span-9">
                <div className="lg:flex lg:flex-1 lg:items-center">
                  <HouseHero data={data} />
                </div>
                {/* hero wrapper is flex-1, so these cards sit at the bottom, level with the profile panel */}
                <div className="relative z-10 mt-4 grid gap-4 md:grid-cols-2 lg:-mt-28 xl:grid-cols-3">
                  <TahapBarsCard data={data} onOpen={() => setActiveTab("pembangunan")} />
                  <PaymentCard data={data} onOpen={() => setActiveTab("pembayaran")} />
                  <div className="md:col-span-2 xl:col-span-1">
                    <MilestoneCard data={data} />
                  </div>
                </div>
              </section>
            </div>
            {/* <BannerSlider /> */}
          </>
        )}

        {/* "Segera Hadir" modal for unimplemented tabs */}
        {!isLoading && !IMPLEMENTED_TABS.includes(activeTab) && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setActiveTab("overview")}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="segera-hadir-title"
              className="mx-4 w-full max-w-xs rounded-3xl border border-white/10 bg-[#0c2129]/95 p-8 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${CYAN}22` }}>
                {activeTabInfo && <activeTabInfo.icon className="h-7 w-7" style={{ color: CYAN }} />}
              </div>
              <p id="segera-hadir-title" className="mb-2 text-base font-semibold text-white">
                Segera Hadir
              </p>
              <p className="mb-5 text-sm text-white/65">
                Fitur <strong className="text-white">{activeTabInfo?.label}</strong> sedang dalam pengembangan.
              </p>
              <button
                onClick={() => setActiveTab("overview")}
                className={`min-h-11 cursor-pointer rounded-full px-6 text-sm font-semibold text-[#062026] ${FOCUS}`}
                style={{ background: CYAN }}
              >
                Kembali ke Overview
              </button>
            </div>
          </div>
        )}
      </main>

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
