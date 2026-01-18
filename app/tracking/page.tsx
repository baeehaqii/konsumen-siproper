"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function TrackingForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        nomor_komplain: "",
        nama_konsumen: "",
    })
    const [error, setError] = useState("")

    // Pre-fill form from URL parameters
    useEffect(() => {
        const nomorKomplain = searchParams.get("nomor_komplain")
        const namaKonsumen = searchParams.get("nama_konsumen")

        if (nomorKomplain || namaKonsumen) {
            setFormData({
                nomor_komplain: nomorKomplain || "",
                nama_konsumen: namaKonsumen || "",
            })
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            console.log("🔍 Tracking komplain:", formData)

            const response = await fetch("/api/tracking-komplain", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()
            console.log("📥 Tracking response:", data)

            if (!response.ok || data.status === "error") {
                const errorMessage = data.message || `Gagal melacak komplain (${response.status})`
                setError(errorMessage)
                return
            }

            // Redirect to result page with data
            const queryParams = new URLSearchParams({
                data: JSON.stringify(data.data || data)
            })
            router.push(`/tracking/result?${queryParams}`)

        } catch (error) {
            console.error("❌ Error tracking komplain:", error)
            setError("Terjadi kesalahan saat melacak komplain")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-md mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-6 text-center">
                        TRACKING STATUS KOMPLAIN
                    </h2>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="nomor_komplain" className="block text-sm font-medium text-gray-700">
                                Nomor Komplain
                            </label>
                            <input
                                type="text"
                                id="nomor_komplain"
                                placeholder="Contoh: KMP-20240118-001"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                                value={formData.nomor_komplain}
                                onChange={(e) => setFormData({ ...formData, nomor_komplain: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="nama_konsumen" className="block text-sm font-medium text-gray-700">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                id="nama_konsumen"
                                placeholder="Masukkan nama lengkap Anda"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                                value={formData.nama_konsumen}
                                onChange={(e) => setFormData({ ...formData, nama_konsumen: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Melacak..." : "Lacak Status Komplain"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default function TrackingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Memuat formulir tracking...</p>
                </div>
            </div>
        }>
            <TrackingForm />
        </Suspense>
    )
}