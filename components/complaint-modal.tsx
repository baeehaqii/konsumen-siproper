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

interface Blok {
  id: string
  nama_blok: string
  [key: string]: unknown
}

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
  const [blokOptions, setBlokOptions] = useState<Blok[]>([])
  const [isLoadingBlok, setIsLoadingBlok] = useState(false)
  const [blokError, setBlokError] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchProyek()
    }
  }, [isOpen])

  const fetchProyek = async () => {
    setIsLoadingProyek(true)
    try {
      console.log("🚀 Fetching proyek from /api/proyek...")
      const response = await fetch("/api/proyek")
      console.log("📡 Response status:", response.status, response.statusText)
      
      const data = await response.json()
      console.log("📥 Response data:", data)
      console.log("📊 Data type:", typeof data)
      console.log("📊 Data.data:", data.data)
      console.log("📊 Is data.data array:", Array.isArray(data.data))

      if (data.status === "success" && data.data) {
        console.log("✅ Setting proyek options from data.data:", data.data.length)
        setProyekOptions(data.data)
      } else if (Array.isArray(data.data)) {
        console.log("✅ Setting proyek options from array data.data:", data.data.length)
        setProyekOptions(data.data)
      } else if (Array.isArray(data)) {
        console.log("✅ Setting proyek options from direct array:", data.length)
        setProyekOptions(data)
      } else {
        console.log("⚠️ Unexpected data format, setting empty array")
        setProyekOptions([])
      }
    } catch (error) {
      console.error("❌ Error fetching proyek:", error)
      setProyekOptions([])
    } finally {
      setIsLoadingProyek(false)
    }
  }

  const fetchBlok = async (proyekId: string) => {
    if (!proyekId) {
      setBlokOptions([])
      setBlokError("")
      return
    }

    setIsLoadingBlok(true)
    setBlokError("")
    setBlokOptions([])

    try {
      console.log("🔍 Fetching blok for proyek:", proyekId)
      const response = await fetch(`/api/proyek/${proyekId}/blok`)
      const data = await response.json()

      if (data.status === "error") {
        console.log("⚠️ Error from API:", data.message)
        setBlokError(data.message || "Proyek belum memiliki blok")
        setBlokOptions([])
      } else if (data.status === "success" && data.data) {
        console.log("✅ Blok loaded:", data.data.length, "blok")
        // show a small sample for debugging
        console.log("🔎 Sample blok items:", data.data.slice(0, 5))
        setBlokOptions(data.data)
        setBlokError("")
      } else if (Array.isArray(data.data)) {
        setBlokOptions(data.data)
        setBlokError("")
      } else if (Array.isArray(data)) {
        setBlokOptions(data)
        setBlokError("")
      } else {
        console.log("⚠️ Unexpected data format")
        setBlokError("Format data tidak sesuai")
      }
    } catch (error) {
      console.error("❌ Error fetching blok:", error)
      setBlokError("Gagal memuat blok")
      setBlokOptions([])
    } finally {
      setIsLoadingBlok(false)
    }
  }

  const handleProyekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const proyekId = e.target.value
    setFormData({ ...formData, proyek: proyekId, blok: "" })
    fetchBlok(proyekId)
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

    try {
      console.log("📤 Submitting komplain:", formData)

      const response = await fetch("/api/komplain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proyek_id: formData.proyek,
          blok_id: formData.blok,
          nama_konsumen: formData.namaKonsumen,
          no_whatsapp: formData.noWhatsApp,
          tanggal_komplain: formData.tanggalKomplain,
          tanggal_bast: formData.tanggalBAST,
          deskripsi: formData.deskripsi,
          jenis_komplain: formData.jenisKomplain,
          cluster_komplain: formData.clusterKomplain,
        }),
      })

      const data = await response.json()
      console.log("📥 Komplain response status:", response.status)
      console.log("📥 Komplain response:", data)

      if (!response.ok || data.status === "error") {
        const errorMessage = data.message || `Gagal mengirim komplain (${response.status})`
        console.error("❌ Submit failed:", errorMessage)
        throw new Error(errorMessage)
      }

      console.log("✅ Komplain berhasil dikirim!")

      // Extract complaint number from response
      const nomorKomplain = data.data?.nomor_komplain || data.nomor_komplain
      console.log("📋 Nomor komplain:", nomorKomplain)

      // Store customer name before resetting form
      const namaKonsumen = formData.namaKonsumen

      // Reset form
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

      // Close modal first
      onClose()

      // Redirect to success page with complaint number and customer name
      const params = new URLSearchParams()
      if (nomorKomplain) {
        params.append('nomor_komplain', nomorKomplain)
      }
      if (namaKonsumen) {
        params.append('nama_konsumen', namaKonsumen)
      }

      window.location.href = `/komplain/sukses?${params.toString()}`

      onSubmit()
    } catch (error) {
      console.error("❌ Error submitting komplain:", error)
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat mengirim komplain")
    } finally {
      setIsLoading(false)
    }
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
                  onChange={handleProyekChange}
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={!formData.proyek || isLoadingBlok || blokOptions.length === 0}
                >
                  <option value="">
                    {!formData.proyek
                      ? "Pilih proyek terlebih dahulu"
                      : isLoadingBlok
                        ? "Memuat blok..."
                        : blokError
                          ? blokError
                          : blokOptions.length === 0
                            ? "Tidak ada blok tersedia"
                            : "Pilih Blok"}
                  </option>
                  {blokOptions.map((blok: any, index: number) => {
                    // Prefer fields that contain proper blok identifiers
                    const label = blok?.nama_blok ?? blok?.nama ?? blok?.kode_blok ?? blok?.kode ?? blok?.blok ?? (typeof blok === 'string' ? blok : undefined) ?? `Blok ${index + 1}`
                    const value = blok?.id ?? blok?.kode_blok ?? blok?.blok ?? blok?.nama_blok ?? label
                    const key = blok?.id ?? `${value}-${index}`
                    return (
                      <option key={key} value={value}>
                        {label}
                      </option>
                    )
                  })}
                </select>
                {blokError && (
                  <p className="mt-1 text-sm text-red-600">{blokError}</p>
                )}
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
