"use client"

import { useEffect } from "react"
import { CheckCircle } from "lucide-react"

interface NotificationProps {
  message: string
  nik: string
  isVisible: boolean
  onClose: () => void
}

export default function Notification({ message, nik, isVisible, onClose }: NotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in">
      <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 shadow-lg">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-green-900">{message}</p>
          <p className="text-sm text-green-700">NIK: {nik}</p>
        </div>
      </div>
    </div>
  )
}
