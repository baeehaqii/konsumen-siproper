"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useMemo } from "react"
import { CheckIcon } from "lucide-react"

interface KomplainData {
    nomor_komplain: string
    status_komplain: string
    nama_konsumen: string
    area_blok: string
    tanggal_komplain: string
    jenis_komplain: string
    deskripsi_komplain: string
    hasil_cek?: string
    rekomendasi?: string
    monitoring: string
    sla_mulai_dikerjakan?: string
    sla_selesai_dikerjakan?: string
    estimasi_waktu?: string
    tidak_dikerjakan?: string
    alasan_tidak_dikerjakan?: string
    rencana_dikerjakan?: string
}

function TrackingResultContent() {
    const searchParams = useSearchParams()

    const komplainData: KomplainData | null = useMemo(() => {
        try {
            const dataParam = searchParams.get("data")
            if (!dataParam) return null
            return JSON.parse(decodeURIComponent(dataParam))
        } catch (error) {
            console.error("Error parsing complaint data:", error)
            return null
        }
    }, [searchParams])

    if (!komplainData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Data komplain tidak ditemukan</p>
                    <button
                        onClick={() => window.location.href = "/tracking"}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Kembali ke Tracking
                    </button>
                </div>
            </div>
        )
    }

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "Selesai":
                return "bg-green-100 text-green-800"
            case "Baru":
                return "bg-blue-100 text-blue-800"
            case "Proses":
                return "bg-yellow-100 text-yellow-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const progressSteps = ["Laporan Diterima", "Pengecekan Lapangan", "Pengerjaan Komplain", "QC & QA Test", "Selesai"]
    const currentStepIndex = progressSteps.indexOf(komplainData.monitoring)

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-6 text-center">
                        DETAIL STATUS KOMPLAIN
                    </h2>

                    <div className="mb-6">
                        {/* Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4 mb-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-500">Nomor Komplain:</p>
                                <p className="font-medium">{komplainData.nomor_komplain}</p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-500">Status:</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(komplainData.status_komplain)}`}>
                                    {komplainData.status_komplain}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-500">Nama Konsumen:</p>
                                <p>{komplainData.nama_konsumen}</p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-500">Area/Blok:</p>
                                <p>{komplainData.area_blok}</p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-500">Tanggal Komplain:</p>
                                <p>{komplainData.tanggal_komplain}</p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-500">Jenis Komplain:</p>
                                <p>{komplainData.jenis_komplain}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="border-b pb-4 mb-4">
                            <h3 className="font-semibold text-gray-700 mb-2">Deskripsi Komplain:</h3>
                            <p className="text-gray-600 whitespace-pre-line">{komplainData.deskripsi_komplain}</p>
                        </div>

                        {/* Results */}
                        {komplainData.hasil_cek && (
                            <div className="border-b pb-4 mb-4">
                                <h3 className="font-semibold text-gray-700 mb-2">Hasil Pengecekan:</h3>
                                <p className="text-gray-600 whitespace-pre-line">{komplainData.hasil_cek}</p>
                            </div>
                        )}

                        {komplainData.rekomendasi && (
                            <div className="border-b pb-4 mb-4">
                                <h3 className="font-semibold text-gray-700 mb-2">Rekomendasi:</h3>
                                <p className="text-gray-600 whitespace-pre-line">{komplainData.rekomendasi}</p>
                            </div>
                        )}

                        {/* Progress */}
                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-700 mb-4">Progres Pengerjaan:</h3>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>

                                <div className="relative flex justify-between">
                                    {progressSteps.map((step, index) => (
                                        <div key={step} className="flex flex-col items-center">
                                            <span
                                                className={`h-7 w-7 rounded-full border-2 flex items-center justify-center ${index <= currentStepIndex
                                                        ? "bg-red-600 border-red-600"
                                                        : "bg-white border-gray-300"
                                                    }`}
                                            >
                                                {index <= currentStepIndex && (
                                                    <CheckIcon className="h-5 w-5 text-white" />
                                                )}
                                            </span>
                                            <span className="mt-2 text-xs text-center max-w-20">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Schedule Info */}
                        {komplainData.rencana_dikerjakan !== "Belum dijadwalkan" &&
                            komplainData.rencana_dikerjakan !== "-" &&
                            komplainData.sla_mulai_dikerjakan && (
                                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                                    <h3 className="font-semibold text-gray-700 mb-2">Informasi Pengerjaan:</h3>
                                    <p className="text-sm">
                                        <span className="font-bold">Rencana Dimulai Pengerjaan:</span> {komplainData.sla_mulai_dikerjakan}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-bold">Rencana Selesai Pengerjaan:</span> {komplainData.sla_selesai_dikerjakan}
                                    </p>
                                    {komplainData.estimasi_waktu && (
                                        <p className="text-sm">
                                            <span className="font-bold">Estimasi waktu:</span> {komplainData.estimasi_waktu} Hari
                                        </p>
                                    )}
                                </div>
                            )}

                        {/* Cannot Be Done */}
                        {komplainData.tidak_dikerjakan === "Ya" && (
                            <div className="mt-4 p-4 bg-red-50 rounded-lg">
                                <h3 className="font-semibold text-gray-700 mb-2">Tidak Dapat Dikerjakan:</h3>
                                <p className="text-sm">{komplainData.alasan_tidak_dikerjakan}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function TrackingResultPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Memuat data komplain...</p>
                </div>
            </div>
        }>
            <TrackingResultContent />
        </Suspense>
    )
}