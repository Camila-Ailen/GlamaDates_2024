"use client"

import type React from "react"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useMyDatesStore } from "@/app/store/useMyDatesStore"

interface AppointmentCardProps {
  appointment: any
  onClick?: () => void
  compact?: boolean
  showActions?: boolean
}

export function AppointmentCard({ appointment, onClick, compact = false, showActions = false }: AppointmentCardProps) {
  const cancelAppointment = useMyDatesStore((state) => state.cancelAppointment)

  const getStatusColor = (state: string) => {
    switch (state) {
      case "COMPLETADO":
        return "bg-green-50 border-green-200 hover:bg-green-100"
      case "INACTIVO":
      case "CANCELADO":
        return "bg-gray-50 border-gray-200 hover:bg-gray-100"
      case "MOROSO":
        return "bg-red-50 border-red-200 hover:bg-red-100"
      case "PENDIENTE":
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
      default:
        return "bg-pink-50 border-pink-200 hover:bg-pink-100"
    }
  }

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm("¿Estás seguro de que deseas cancelar esta cita?")) {
      await cancelAppointment(appointment.id)
    }
  }

  return (
    <Card
      className={cn(
        "transition-colors border-l-4",
        getStatusColor(appointment.state),
        compact ? "p-2" : "",
        onClick ? "cursor-pointer" : "",
      )}
      onClick={onClick}
    >
      <CardHeader className={cn("pb-2", compact ? "p-2" : "")}>
        <CardTitle className={cn("text-pink-700", compact ? "text-sm" : "")}>{appointment.package.name}</CardTitle>
        <CardDescription className={cn(compact ? "text-xs" : "")}>
          {format(new Date(appointment.datetimeStart), "d MMM", { locale: es })} •
          {format(new Date(appointment.datetimeStart), " HH:mm")} hs
        </CardDescription>
      </CardHeader>
      {(!compact || showActions) && (
        <CardContent className="pt-0 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            <span
              className={cn(
                "inline-block px-2 py-1 rounded-full text-xs font-medium",
                appointment.state === "COMPLETADO"
                  ? "bg-green-100 text-green-800"
                  : appointment.state === "MOROSO"
                    ? "bg-red-100 text-red-800"
                    : appointment.state === "PENDIENTE"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800",
              )}
            >
              {appointment.state}
            </span>
          </div>
          {/* {showActions && appointment.state === "PENDIENTE" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleCancel}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )} */}
        </CardContent>
      )}
    </Card>
  )
}

