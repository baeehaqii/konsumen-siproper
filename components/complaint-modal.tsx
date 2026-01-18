"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface ComplaintModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

interface Proyek {
  id: string
  nama_proyek: string
  [key: string]: unknown
}

const blokOptions = ["Blok A-1", "Blok A-2", "Blok A-3"]

export default function ComplaintModal({ isOpen, onClose, onSubmit }: ComplaintModalProps) {
  const [formData, setFormData] = useState({
    proyek: "",
    blok: "",
    namaKonsumen: "",
    noWhatsApp: "",
    tanggalKomplain: "",
    tanggalBAST: "",
    deskripsi: "",
    jenisKomplain: [] as string[],
    clusterKomplain: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [proyekOptions, setProyekOptions] = useState<Proyek[]>([])
  const [isLoadingProyek, setIsLoadingProyek] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchProyek()
    }
  }, [isOpen])

  const fetchProyek = async () => {
    setIsLoadingProyek(true)
    try {
      const response = await fetch("/api/proyek")
      const data = await response.json()
      
      if (data.status === "success" && data.data) {
        setProyekOptions(data.data)
      } else if (Array.isArray(data.data)) {
        setProyekOptions(data.data)
      } else if (Array.isArray(data)) {
        setProyekOptions(data)
      }
    } catch (error) {
      console.error("Error fetching proyek:", error)
    } finally {
      setIsLoadingProyek(false)
    }
  }

  const handleCheckboxChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      jenisKomplain: prev.jenisKomplain.includes(value)
        ? prev.jenisKomplain.filter((item) => item !== value)
        : [...prev.jenisKomplain, value],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    onSubmit()
    setFormData({
      proyek: "",
      blok: "",
      namaKonsumen: "",
      noWhatsApp: "",
      tanggalKomplain: "",
      tanggalBAST: "",
      deskripsi: "",
      jenisKomplain: [],
      clusterKomplain: "",
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6 sm:p-8">
          <h2 className="mb-8 text-2xl font-bold text-center text-gray-800 uppercase tracking-wide">
            Formulir Keluhan dan Komplain
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Proyek & Blok */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proyek</label>
                <select
                  value={formData.proyek}
                  onChange={(e) => setFormData({ ...formData, proyek: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 appearance-none bg-white"
                  required
                  disabled={isLoadingProyek}
                >
                  <option value="">{isLoadingProyek ? "Memuat proyek..." : "Pilih Proyek"}</option>
                  {proyekOptions.map((proyek) => (
                    <option key={proyek.id} value={proyek.id}>
                      {proyek.nama_proyek}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blok</label>
                <select
                  value={formData.blok}
                  onChange={(e) => setFormData({ ...formData, blok: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 appearance-none bg-white"
                  required
                >
                  <option value="">Pilih Blok</option>
                  {blokOptions.map((blok) => (
                    <option key={blok} value={blok}>
                      {blok}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nama & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Konsumen</label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  value={formData.namaKonsumen}
                  onChange={(e) => setFormData({ ...formData, namaKonsumen: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. WhatsApp Aktif</label>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={formData.noWhatsApp}
                  onChange={(e) => setFormData({ ...formData, noWhatsApp: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>
            </div>

            {/* Tanggal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Komplain</label>
                <input
                  type="date"
                  value={formData.tanggalKomplain}
                  onChange={(e) => setFormData({ ...formData, tanggalKomplain: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal BAST (Berita Acara Serah Terima)
                </label>
                <input
                  type="date"
                  value={formData.tanggalBAST}
                  onChange={(e) => setFormData({ ...formData, tanggalBAST: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Komplain</label>
              <textarea
                placeholder="Deskripsikan komplain atau keluhan Anda secara detail..."
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-y"
                required
              />
            </div>

            {/* Jenis & Cluster Komplain */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Jenis Komplain (Bisa pilih lebih dari satu)
                </label>
                <div className="space-y-2">
                  {["Pembangunan", "Legalitas", "Pemasaran", "Kawasan"].map((jenis) => (
                    <label key={jenis} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.jenisKomplain.includes(jenis)}
                        onChange={() => handleCheckboxChange(jenis)}
                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-gray-700">{jenis}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Cluster Komplain (Pilih satu)</label>
                <div className="space-y-2">
                  {["Retensi", "Over Retensi", "Progress"].map((cluster) => (
                    <label key={cluster} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="clusterKomplain"
                        value={cluster}
                        checked={formData.clusterKomplain === cluster}
                        onChange={(e) => setFormData({ ...formData, clusterKomplain: e.target.value })}
                        className="h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-gray-700">{cluster}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-lg bg-red-600 px-8 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Mengirim..." : "Kirim Komplain"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
