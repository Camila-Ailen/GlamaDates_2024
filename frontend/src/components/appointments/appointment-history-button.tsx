"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import { AppointmentHistoryDialog } from "./appointment-history-dialog"

interface AppointmentHistoryButtonProps {
  appointmentId: number
  appointmentData?: any
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function AppointmentHistoryButton({
  appointmentId,
  appointmentData,
  variant = "outline",
  size = "sm",
  className,
}: AppointmentHistoryButtonProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={(e) => {
          e.stopPropagation()
          setIsHistoryOpen(true)
        }}
        className={className}
      >
        <History className="h-4 w-4 mr-1" />
        Historial
      </Button>

      <AppointmentHistoryDialog
        isOpen={isHistoryOpen}
        setIsOpen={setIsHistoryOpen}
        appointmentId={appointmentId}
        appointmentData={appointmentData}
      />
    </>
  )
}
