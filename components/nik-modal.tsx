"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface NIKModalProps {
  isOpen: boolean
  onClose: () => void
  onNIKSubmit: (nik: string) => void
}

export default function NIKModal({ isOpen, onClose, onNIKSubmit }: NIKModalProps) {
  const [nik, setNik] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (nik.trim()) {
      setIsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      onNIKSubmit(nik)
      setNik("")
      setIsLoading(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>

        <h2 className="mb-2 text-2xl font-bold text-gray-900">Lacak Rumah</h2>
        <p className="mb-6 text-sm text-gray-600">Masukkan nomor NIK untuk melacak status pembelian rumah Anda</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nik" className="block text-sm font-medium text-gray-700">
              Nomor NIK
            </label>
            <input
              id="nik"
              type="text"
              placeholder="Contoh: 1234567890123456"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              maxLength={16}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!nik.trim() || isLoading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Mencari..." : "Cari"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
