"use client"

import { useState } from "react"
import { X, Phone, MessageCircle, User, Briefcase } from "lucide-react"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  agentName?: string
  agentTitle?: string
  agentPhone?: string
  agentPhoto?: string
  konsumenName?: string
}

export default function ContactModal({
  isOpen,
  onClose,
  agentName = "Tim Sapphire",
  agentTitle = "Customer Success",
  agentPhone,
  agentPhoto,
  konsumenName = "",
}: ContactModalProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleWhatsApp = () => {
    const phone = agentPhone?.replace(/\D/g, "") ?? ""
    const defaultMsg = encodeURIComponent(
      `Halo ${agentName}, saya ${konsumenName ? konsumenName + " " : ""}ingin menghubungi terkait unit saya di Sapphire Grup.\n\n${message}`
    )
    const url = phone
      ? `https://wa.me/${phone}?text=${defaultMsg}`
      : `https://wa.me/?text=${defaultMsg}`
    window.open(url, "_blank", "noopener")
  }

  const handleCall = () => {
    if (agentPhone) {
      window.location.href = `tel:${agentPhone}`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    await new Promise((r) => setTimeout(r, 600))
    handleWhatsApp()
    setIsSending(false)
    setMessage("")
    onClose()
  }

  if (!isOpen) return null

  const primary = "#031632"
  const primaryContainer = "#1a2b48"

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center gap-4 px-6 py-5"
          style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primaryContainer} 100%)` }}
        >
          {/* Agent avatar */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
            style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)" }}
          >
            {agentPhoto ? (
              <img src={agentPhoto} alt={agentName} className="w-full h-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-base leading-tight truncate">{agentName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Briefcase className="h-3.5 w-3.5 text-white/60 flex-shrink-0" />
              <p className="text-xs text-white/70 truncate">{agentTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1.5 transition hover:bg-white/20"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#44474d" }}>
              Pesan (opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Tulis pesan singkat untuk agen..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2"
              style={{
                borderColor: "#c5c6ce",
                focusRingColor: primary,
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {agentPhone && (
              <button
                type="button"
                onClick={handleCall}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border-2 transition-all hover:bg-gray-50 active:scale-95"
                style={{ borderColor: "#c5c6ce", color: "#191c1d" }}
              >
                <Phone className="h-4 w-4" />
                Telepon
              </button>
            )}
            <button
              type="submit"
              disabled={isSending}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#1b6d24" }}
            >
              <MessageCircle className="h-4 w-4" />
              {isSending ? "Membuka..." : "WhatsApp"}
            </button>
          </div>

          <p className="text-center text-xs" style={{ color: "#75777e" }}>
            Pesan akan dikirim melalui WhatsApp
          </p>
        </form>
      </div>
    </div>
  )
}
