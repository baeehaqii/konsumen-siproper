"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { CheckCircleIcon } from "lucide-react"

function SuccessContent() {
    const searchParams = useSearchParams()
    const nomorKomplain = searchParams.get("nomor_komplain")
    const namaKonsumen = searchParams.get("nama_konsumen")

    const handleTrackingClick = () => {
        const params = new URLSearchParams()
        if (nomorKomplain) {
            params.append('nomor_komplain', nomorKomplain)
        }
        if (namaKonsumen) {
            params.append('nama_konsumen', namaKonsumen)
        }
        window.location.href = `/tracking?${params.toString()}`
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Main Content */}
            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                    {/* Success Icon */}
                    <div className="bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
                        <CheckCircleIcon className="h-12 w-12 text-green-600" />
                    </div>

                    <h2 className="text-2xl font-bold mt-4 text-gray-800">
                        Komplain Berhasil Dikirim!
                    </h2>

                    {nomorKomplain ? (
                        <>
                            <p className="mt-2 text-gray-600">
                                Terima kasih telah mengirimkan komplain Anda. Tim kami akan segera menindaklanjuti.
                                Berikut adalah kode komplain Anda:
                            </p>

                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-center text-gray-700">Nomor Komplain</p>
                                <p className="text-center text-xl font-bold text-red-600">{nomorKomplain}</p>
                                <p className="text-center text-xs text-gray-500">
                                    Simpan nomor ini untuk melacak status komplain Anda
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="mt-2 text-gray-600">
                                Terima kasih telah mengirimkan komplain Anda. Tim kami akan segera menindaklanjuti.
                            </p>
                            <p className="mt-2 text-sm text-red-600">Nomor komplain tidak tersedia.</p>
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={handleTrackingClick}
                            className="inline-block px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                        >
                            Lacak Status Komplain
                        </button>
                        <button
                            onClick={() => window.location.href = "/"}
                            className="inline-block px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                        >
                            Kembali ke Formulir
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function KomplainSuksesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Memuat...</p>
                </div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}