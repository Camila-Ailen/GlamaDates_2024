"use client"

import type React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, CreditCard, User } from "lucide-react"
import { useAppointmentStore } from "@/app/store/useAppointmentStore"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const fetchCompletedAppointment = useAppointmentStore((state) => state.fetchCompletedAppointment)

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
        return "bg-blue-50 border-l-blue-500 hover:bg-blue-100"
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
        return "bg-blue-100 text-blue-800"
    }
  }

  const handleMarkComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsConfirmOpen(true)
  }

  const confirmComplete = async () => {
    try {
      await fetchCompletedAppointment(appointment.id)
      toast.success("Cita marcada como completada")
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      toast.error("Error al marcar la cita como completada")
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
    <>
      <Card
        className={cn(
          "transition-all duration-200 border-l-4 shadow-sm hover:shadow-md w-full",
          getStatusColor(appointment.state),
          compact ? "p-2" : "",
          onClick ? "cursor-pointer" : "",
        )}
        onClick={onClick}
      >
        <div className={cn("flex flex-col md:flex-row", compact ? "h-full" : "")}>
          <div
            className={cn(
              "bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center p-3",
              compact ? "md:w-1/4" : "md:w-1/5",
            )}
          >
            <div className="text-center">
              <div className="text-xs text-blue-600 uppercase font-semibold">
                {format(appointmentDate, "MMM", { locale: es })}
              </div>
              <div className="text-2xl font-bold text-blue-700">{format(appointmentDate, "dd")}</div>
              <div className="text-sm font-medium text-blue-600">{format(appointmentDate, "HH:mm")}</div>
            </div>
          </div>

          <div className="flex-1">
            <CardHeader className={cn("pb-2", compact ? "p-2" : "")}>
              <div className="flex justify-between items-start flex-wrap">
                <CardTitle className={cn("text-blue-700", compact ? "text-sm" : "", "break-words")}>
                  {appointment.package.name}
                </CardTitle>
                <Badge className={cn("text-xs", getStatusBadgeColor(appointment.state))}>{appointment.state}</Badge>
              </div>
              <CardDescription className={cn(compact ? "text-xs" : "", "break-words")}>
                <div className="flex flex-wrap gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-500" />
                    <span className="truncate">
                      {appointment.client.firstName} {appointment.client.lastName}
                    </span>
                  </div>
                  {!compact && (
                    <>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span>{format(appointmentDate, "HH:mm")} hs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3 text-gray-500" />
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                    </>
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
                {showActions &&
                  appointment.state !== "CANCELADO" &&
                  appointment.state !== "INACTIVO" &&
                  appointment.state !== "COMPLETADO" &&
                  appointment.state !== "MOROSO" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={handleMarkComplete}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completada
                    </Button>
                  )}
              </CardContent>
            )}
          </div>
        </div>
      </Card>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar acción</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas marcar esta cita como completada?
              <br />
              <br />
              <strong>Cita:</strong> {appointment.package.name}
              <br />
              <strong>Cliente:</strong> {appointment.client.firstName} {appointment.client.lastName}
              <br />
              <strong>Fecha:</strong> {format(new Date(appointment.datetimeStart), "d MMM yyyy", { locale: es })}
              <br />
              <strong>Hora:</strong> {format(new Date(appointment.datetimeStart), "HH:mm", { locale: es })} hs
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmComplete} className="bg-green-600 hover:bg-green-700">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

