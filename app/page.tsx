"use client"

import { useState } from "react"
import GradientBlinds from "@/components/GradientBlinds"
import NIKModal from "@/components/nik-modal"
import ComplaintModal from "@/components/complaint-modal"
import Notification from "@/components/notification"

export default function Home() {
  const [isNIKModalOpen, setIsNIKModalOpen] = useState(false)
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [foundNIK, setFoundNIK] = useState("")

  const handleNIKSubmit = (nik: string) => {
    if (nik.length === 16 && /^\d+$/.test(nik)) {
      setFoundNIK(nik)
      setNotificationMessage("NIK ditemukan!")
      setShowNotification(true)
    }
  }

  const handleComplaintSubmit = () => {
    setFoundNIK("")
    setNotificationMessage("Komplain berhasil dikirim!")
    setShowNotification(true)
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
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
                  onClick={() => setIsNIKModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur transition-all hover:bg-white/20 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent shadow-xl"
                >
                  Lacak Rumah
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsComplaintModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-full border-2 border-red-400/50 bg-red-600/80 px-8 py-4 text-lg font-semibold text-white backdrop-blur transition-all hover:bg-red-600 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-transparent shadow-xl"
                >
                  Komplain
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NIKModal isOpen={isNIKModalOpen} onClose={() => setIsNIKModalOpen(false)} onNIKSubmit={handleNIKSubmit} />

      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onSubmit={handleComplaintSubmit}
      />

      <Notification
        message={notificationMessage}
        nik={foundNIK}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </main>
  )
}
