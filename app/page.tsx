"use client"

import { useState } from "react"
import GradientBlinds from "@/components/GradientBlinds"
import Navbar from "@/components/Navbar"
import NIKModal from "@/components/nik-modal"
import Notification from "@/components/notification"

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [foundNIK, setFoundNIK] = useState("")

  const handleNIKSubmit = (nik: string) => {
    if (nik.length === 16 && /^\d+$/.test(nik)) {
      setFoundNIK(nik)
      setShowNotification(true)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Navbar />

      {/* Animated Gradient Background */}
      <div className="fixed inset-0 w-full h-full flex items-center justify-center">
        <GradientBlinds
          gradientColors={["#0f1629", "#5d0a0a", "#C70008", "#8a0606"]}
          angle={15}
          noise={0.25}
          blindCount={13}
          blindMinWidth={50}
          spotlightRadius={0.38}
          spotlightSoftness={1.6}
          spotlightOpacity={0.42}
          mouseDampening={0.15}
          distortAmount={0}
          shineDirection="left"
          mixBlendMode="overlay"
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center justify-center min-h-screen w-full px-5 sm:px-20">
            <div className="relative z-10 flex max-w-4xl flex-col items-center gap-8 text-center">
              <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl text-balance drop-shadow-2xl">
                Lacak Pembelian Rumah di Sapphire Grup
              </h1>
              <p className="text-xl text-white/90 max-w-3xl text-pretty drop-shadow-lg">
                Cek status akad KPR, pantau progress pembangunan, riwayat pembayaran, hingga layanan komplain secara
                real-time dan transparan.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur transition-all hover:bg-white/20 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent shadow-xl"
                >
                  Lacak Rumah
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NIKModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onNIKSubmit={handleNIKSubmit} />

      <Notification
        message="NIK ditemukan!"
        nik={foundNIK}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </main>
  )
}
