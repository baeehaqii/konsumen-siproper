"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface BannerSlide {
  id: string
  tag?: string
  title: string
  subtitle: string
  ctaLabel: string
  onCta?: () => void
  bgFrom: string
  bgTo: string
  accentColor: string
  illustration?: React.ReactNode
}

const DEFAULT_BANNERS: BannerSlide[] = [
  {
    id: "promo-cashback",
    tag: "Promo Akhir Tahun",
    title: "Cashback Hingga 50 Juta",
    subtitle: "Khusus unit Cluster Sapphire yang booking sebelum 31 Desember. Syarat dan ketentuan berlaku.",
    ctaLabel: "Pelajari Selengkapnya",
    bgFrom: "#031632",
    bgTo: "#1a2b48",
    accentColor: "#b6c7eb",
  },
  {
    id: "promo-kpr",
    tag: "KPR Express",
    title: "Cicilan Mulai 2,5 Juta / Bulan",
    subtitle: "Proses KPR cepat 7 hari kerja. Uang muka ringan mulai 5%. Didukung 12 bank rekanan.",
    ctaLabel: "Simulasi KPR",
    bgFrom: "#0d3320",
    bgTo: "#1b6d24",
    accentColor: "#88d982",
  },
  {
    id: "promo-referral",
    tag: "Program Referral",
    title: "Ajak Teman, Dapat 5 Juta",
    subtitle: "Rekomendasikan unit Sapphire kepada teman dan keluarga. Bonus langsung setelah akad dilaksanakan.",
    ctaLabel: "Ikuti Program",
    bgFrom: "#2a1a00",
    bgTo: "#5a3a00",
    accentColor: "#f5c842",
  },
]

interface BannerSliderProps {
  banners?: BannerSlide[]
  autoPlayInterval?: number
}

// Inner content of a slide — shared between ghost (for height) and real slides
function SlideInner({ slide }: { slide: BannerSlide }) {
  return (
    <>
      <div className="relative z-10 flex-1 min-w-0 pr-4">
        {slide.tag && (
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest rounded-full px-3 py-1 mb-3"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: slide.accentColor,
              border: `1px solid ${slide.accentColor}40`,
            }}
          >
            {slide.tag}
          </span>
        )}
        <h3
          className="text-xl sm:text-2xl font-bold leading-tight mb-2"
          style={{ color: "#ffffff", fontFamily: "Manrope, Inter, sans-serif" }}
        >
          {slide.title}
        </h3>
        <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.72)" }}>
          {slide.subtitle}
        </p>
        <button
          onClick={slide.onCta}
          className="inline-flex items-center gap-2 text-sm font-semibold rounded-full px-5 py-2.5 transition-all hover:scale-105 active:scale-95"
          style={{
            background: slide.accentColor,
            color: slide.bgFrom,
          }}
        >
          {slide.ctaLabel}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {slide.illustration && (
        <div className="hidden sm:block flex-shrink-0 w-32 h-24 relative z-10">
          {slide.illustration}
        </div>
      )}
    </>
  )
}

export default function BannerSlider({
  banners = DEFAULT_BANNERS,
  autoPlayInterval = 4500,
}: BannerSliderProps) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const cooldownRef = useRef(false)

  const handleGoTo = useCallback(
    (index: number) => {
      if (cooldownRef.current) return
      cooldownRef.current = true
      setCurrent(((index % banners.length) + banners.length) % banners.length)
      setTimeout(() => { cooldownRef.current = false }, 450)
    },
    [banners.length]
  )

  const handlePrev = useCallback(() => {
    if (cooldownRef.current) return
    cooldownRef.current = true
    setCurrent((c) => (c - 1 + banners.length) % banners.length)
    setTimeout(() => { cooldownRef.current = false }, 450)
  }, [banners.length])

  const handleNext = useCallback(() => {
    if (cooldownRef.current) return
    cooldownRef.current = true
    setCurrent((c) => (c + 1) % banners.length)
    setTimeout(() => { cooldownRef.current = false }, 450)
  }, [banners.length])

  // Stable autoplay — uses functional update to avoid stale closure
  useEffect(() => {
    if (isPaused || banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length)
    }, autoPlayInterval)
    return () => clearInterval(timer)
  }, [isPaused, autoPlayInterval, banners.length])

  if (banners.length === 0) return null

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/*
        Ghost element — invisible, establishes the container height based on
        actual slide content. All real slides are absolute inset-0 on top of it.
      */}
      <div
        className="w-full flex items-center px-8 py-7 invisible pointer-events-none"
        aria-hidden="true"
      >
        <SlideInner slide={banners[0]} />
      </div>

      {/* Real slides — absolutely stacked, crossfade via opacity */}
      {banners.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 flex items-center px-8 py-7"
          style={{
            background: `linear-gradient(135deg, ${slide.bgFrom} 0%, ${slide.bgTo} 100%)`,
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.4s ease",
            pointerEvents: i === current ? "auto" : "none",
            zIndex: i === current ? 1 : 0,
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute right-0 top-0 rounded-full opacity-10 pointer-events-none"
            style={{
              width: 220,
              height: 220,
              background: slide.accentColor,
              transform: "translate(40%, -40%)",
            }}
          />
          <div
            className="absolute right-0 bottom-0 rounded-full opacity-10 pointer-events-none"
            style={{
              width: 120,
              height: 120,
              background: slide.accentColor,
              transform: "translate(20%, 40%)",
            }}
          />

          <SlideInner slide={slide} />
        </div>
      ))}

      {/* Prev / Next */}
      <button
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full p-1.5 transition-all hover:scale-110 active:scale-95"
        style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
        aria-label="Previous"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full p-1.5 transition-all hover:scale-110 active:scale-95"
        style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
        aria-label="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => handleGoTo(i)}
            className="rounded-full transition-all"
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              background: i === current ? "#ffffff" : "rgba(255,255,255,0.4)",
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
