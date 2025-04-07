"use client"

import type React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, CreditCard, Smile, Trash2 } from "lucide-react"
import { useMyDatesStore } from "@/app/store/useMyDatesStore"
import { Badge } from "@/components/ui/badge"

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
        return "bg-green-50 border-l-green-500 hover:bg-green-100"
      case "INACTIVO":
      case "CANCELADO":
        return "bg-gray-50 border-l-gray-500 hover:bg-gray-100"
      case "MOROSO":
        return "bg-red-50 border-l-red-500 hover:bg-red-100"
      case "PENDIENTE":
        return "bg-yellow-50 border-l-yellow-500 hover:bg-yellow-100"
      default:
        return "bg-pink-50 border-l-pink-500 hover:bg-pink-100"
    }
  }

  const getStatusBadgeColor = (state: string) => {
    switch (state) {
      case "COMPLETADO":
        return "bg-green-100 text-green-800"
      case "INACTIVO":
      case "CANCELADO":
        return "bg-gray-100 text-gray-800"
      case "MOROSO":
        return "bg-red-100 text-red-800"
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-pink-100 text-pink-800"
    }
  }

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm("¿Estás seguro de que deseas cancelar esta cita?")) {
      await cancelAppointment(appointment.id)
    }
  }

  // Calcular el precio total
  const calculateTotalPrice = () => {
    if (appointment.total) return appointment.total
    if (appointment.package && appointment.package.price) return appointment.package.price

    let total = 0
    if (appointment.details && Array.isArray(appointment.details)) {
      appointment.details.forEach((detail) => {
        if (detail.service && detail.service.price) {
          total += detail.service.price
        }
      })
    } else if (appointment.package && appointment.package.services && Array.isArray(appointment.package.services)) {
      appointment.package.services.forEach((service) => {
        if (service.price) {
          total += service.price
        }
      })
    }

    return total
  }

  const totalPrice = calculateTotalPrice()
  const appointmentDate = new Date(appointment.datetimeStart)
  const serviceCount = appointment.details?.length || appointment.package?.services?.length || 0

  return (
    <Card
      className={cn(
        "transition-all duration-200 border-l-4 shadow-sm hover:shadow-md",
        getStatusColor(appointment.state),
        compact ? "p-0" : "",
        onClick ? "cursor-pointer" : "",
      )}
      onClick={onClick}
    >
      <div className={cn("flex flex-col md:flex-row", compact ? "h-full" : "")}>
        <div
          className={cn(
            "bg-gradient-to-r from-pink-50 to-purple-50 flex items-center justify-center p-3",
            compact ? "md:w-1/4" : "md:w-1/5",
          )}
        >
          <div className="text-center">
            <div className="text-xs text-pink-600 uppercase font-semibold">
              {format(appointmentDate, "MMM", { locale: es })}
            </div>
            <div className="text-2xl font-bold text-pink-700">{format(appointmentDate, "dd")}</div>
            <div className="text-sm font-medium text-pink-600">{format(appointmentDate, "HH:mm")}</div>
          </div>
        </div>

        <div className="flex-1">
          <CardHeader className={cn("pb-2", compact ? "p-3" : "")}>
            <div className="flex justify-between items-start">
              <CardTitle className={cn("text-pink-700", compact ? "text-sm" : "")}>
                {appointment.package.name}
              </CardTitle>
              <Badge className={cn("text-xs", getStatusBadgeColor(appointment.state))}>{appointment.state}</Badge>
            </div>
            <CardDescription className={cn(compact ? "text-xs" : "")}>
              <div className="flex flex-wrap gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span>{format(appointmentDate, "EEEE", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span>{format(appointmentDate, "HH:mm")} hs</span>
                </div>
                {!compact && (
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3 text-gray-500" />
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </CardDescription>
          </CardHeader>

          {(!compact || showActions) && (
            <CardContent className="pt-0 pb-3 px-4 flex justify-between items-center">
              <div className="text-xs">
                <span className="text-gray-500">
                  {serviceCount} {serviceCount === 1 ? "servicio" : "servicios"}
                </span>
              </div>
                
            </CardContent>
          )}
        </div>
      </div>
    </Card>
  )
}

