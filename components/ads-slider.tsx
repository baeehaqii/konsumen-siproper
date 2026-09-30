"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronRight } from "lucide-react"

export interface AdSlide {
  id: string
  /** Portrait image (4:5). Without it the slide renders its gradient + text. */
  src?: string
  alt: string
  tag?: string
  title: string
  subtitle?: string
  href?: string
  ctaLabel?: string
  bgFrom: string
  bgTo: string
  accent: string
}

// ponytail: gradient placeholders until marcomm supplies portrait images; set `src` to swap in a photo
const DEFAULT_ADS: AdSlide[] = [
  {
    id: "cashback",
    alt: "Promo cashback hingga 50 juta",
    tag: "Promo Akhir Tahun",
    title: "Cashback Hingga 50 Juta",
    subtitle: "Untuk pelunasan awal KPR sebelum 31 Desember. S&K berlaku.",
    ctaLabel: "Pelajari",
    bgFrom: "#0b3a44",
    bgTo: "#12606b",
    accent: "#5fd4de",
  },
  {
    id: "kpr-express",
    alt: "Promo KPR Express cicilan mulai 2,5 juta",
    tag: "KPR Express",
    title: "Cicilan Mulai 2,5 Juta / Bulan",
    subtitle: "Proses 7 hari kerja, DP mulai 5%, 12 bank rekanan.",
    ctaLabel: "Simulasi KPR",
    bgFrom: "#0d3320",
    bgTo: "#1b6d24",
    accent: "#88d982",
  },
  {
    id: "referral",
    alt: "Program referral dapat 5 juta",
    tag: "Program Referral",
    title: "Ajak Teman, Dapat 5 Juta",
    subtitle: "Bonus langsung setelah akad teman Anda dilaksanakan.",
    ctaLabel: "Ikuti Program",
    bgFrom: "#2a1a00",
    bgTo: "#6a4300",
    accent: "#f5c842",
  },
]

export default function AdsSlider({ slides = DEFAULT_ADS, interval = 5000 }: { slides?: AdSlide[]; interval?: number }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = (i: number) => {
    const el = trackRef.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" })
  }

  // autoplay; skipped for reduced-motion users and while hovered/focused
  useEffect(() => {
    if (paused || slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t = setInterval(() => goTo((index + 1) % slides.length), interval)
    return () => clearInterval(t)
  }, [index, paused, slides.length, interval])

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promo Sapphire"
      className="relative overflow-hidden rounded-3xl border border-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / el.clientWidth))
        }}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} dari ${slides.length}`}
            className="relative aspect-[4/5] w-full flex-shrink-0 snap-start"
            style={{ background: `linear-gradient(160deg, ${s.bgFrom} 0%, ${s.bgTo} 100%)` }}
          >
            {s.src ? (
              <img src={s.src} alt={s.alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            ) : (
              <>
                <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20" style={{ background: s.accent }} />
                <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full opacity-10" style={{ background: s.accent }} />
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 pb-12">
              {s.tag && (
                <span
                  className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
                  style={{ background: `${s.accent}26`, color: s.accent }}
                >
                  {s.tag}
                </span>
              )}
              <p className="text-2xl font-semibold leading-tight text-white">{s.title}</p>
              {s.subtitle && <p className="mt-2 text-sm leading-relaxed text-white/75">{s.subtitle}</p>}
              {s.ctaLabel && (
                <a
                  href={s.href ?? "#"}
                  className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 text-sm font-semibold text-[#062026] transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  style={{ background: s.accent }}
                >
                  {s.ctaLabel}
                  <ChevronRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Tampilkan promo ${i + 1}`}
              aria-current={i === index}
              className="flex h-6 cursor-pointer items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <span
                className="block h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === index ? 20 : 6, background: i === index ? "#fff" : "rgba(255,255,255,0.45)" }}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
