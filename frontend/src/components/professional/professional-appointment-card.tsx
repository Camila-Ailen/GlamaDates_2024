"use client"

import type React from "react"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, User } from "lucide-react"

interface ProfessionalAppointmentCardProps {
  appointment: any
  onClick?: () => void
  compact?: boolean
  showActions?: boolean
}

export function ProfessionalAppointmentCard({
  appointment,
  onClick,
  compact = false,
  showActions = false,
}: ProfessionalAppointmentCardProps) {
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
        return "bg-blue-50 border-blue-200 hover:bg-blue-100"
    }
  }

  const handleMarkComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Aquí iría la lógica para marcar como completada
    alert(`Marcar cita #${appointment.id} como completada`)
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
        <div className="flex justify-between items-start">
          <CardTitle className={cn("text-blue-700", compact ? "text-sm" : "")}>{appointment.package.name}</CardTitle>
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
        <CardDescription className={cn(compact ? "text-xs" : "")}>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3" />
            {format(new Date(appointment.datetimeStart), "d MMM", { locale: es })} •
            {format(new Date(appointment.datetimeStart), " HH:mm")} hs
          </div>
          <div className="flex items-center gap-1 mt-1">
            <User className="h-3 w-3" />
            {appointment.client.firstName} {appointment.client.lastName}
          </div>
        </CardDescription>
      </CardHeader>
      {showActions && appointment.state === "PENDIENTE" && (
        <CardContent className="pt-0 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={handleMarkComplete}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Completada
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

