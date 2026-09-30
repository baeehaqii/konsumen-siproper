"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, AlertCircle } from "lucide-react"

interface NIKModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NIKModal({ isOpen, onClose }: NIKModalProps) {
  const router = useRouter()
  const [nik, setNik] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const cleaned = nik.replace(/\D/g, "")
    if (cleaned.length !== 16) {
      setError("NIK harus 16 digit angka")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/konsumen/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nik: cleaned }),
      })

      const data = await res.json()

      if (data.status === "error" || !res.ok) {
        setError(data.message || "NIK tidak ditemukan dalam sistem")
        return
      }

      const id = data.data?.id
      if (!id || !data.token) {
        setError("Data konsumen tidak lengkap, hubungi tim kami")
        return
      }

      // NIK tidak pernah masuk URL — hanya consumer ID
      onClose()
      setNik("")
      // ID UNIT memuat "/" → dipakai apa adanya sebagai path; "//" dirapatkan karena URL menormalkannya
      router.push(`/konsumen/${id.replace(/\/+/g, "/")}/${data.token}`)
    } catch {
      setError("Gagal menghubungi server. Periksa koneksi Anda.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setNik("")
    setError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl mx-4">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="mb-1 text-2xl font-bold text-gray-900">Lacak Rumah</h2>
        <p className="mb-6 text-sm text-gray-500">
          Masukkan nomor NIK KTP untuk melihat status pembelian rumah Anda
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nik" className="block text-sm font-medium text-gray-700 mb-1">
              Nomor NIK (16 digit)
            </label>
            <input
              id="nik"
              type="text"
              inputMode="numeric"
              placeholder="Contoh: 3302251111990003"
              value={nik}
              onChange={(e) => {
                setNik(e.target.value)
                if (error) setError("")
              }}
              maxLength={16}
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-60 tabular-nums text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              {nik.replace(/\D/g, "").length}/16 digit
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={nik.replace(/\D/g, "").length !== 16 || isLoading}
              className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Mencari...
                </span>
              ) : (
                "Cari"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
