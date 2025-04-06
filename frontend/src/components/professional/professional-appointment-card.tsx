"use client"

import type React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, User } from "lucide-react"
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
    setIsConfirmOpen(true)
  }

  const confirmComplete = async () => {
    try {
      console.log("appointment.id: ", appointment.id)
      await fetchCompletedAppointment(appointment.id)
      // Recargar la página o actualizar los datos después de completar
      setTimeout(() => {
        window.location.reload()
      }, 1500) // Esperar 1.5 segundos para que el toast sea visible
    } catch (error) {
      toast.error("Error al marcar la cita como completada")
    }
  }

  return (
    <>
      <Card
        className={cn(
          "transition-colors border-l-4 w-full",
          getStatusColor(appointment.state),
          compact ? "p-2" : "",
          onClick ? "cursor-pointer" : "",
        )}
        onClick={onClick}
      >
        <CardHeader className={cn("pb-2", compact ? "p-2" : "")}>
          <div className="flex justify-between items-start flex-wrap">
            <CardTitle className={cn("text-primary", compact ? "text-sm" : "", "break-words")}>
              {appointment.package.name}
            </CardTitle>
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
          <CardDescription className={cn(compact ? "text-xs" : "", "break-words")}>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {format(new Date(appointment.datetimeStart), "d MMM", { locale: es })} •
                {format(new Date(appointment.datetimeStart), " HH:mm")} hs
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {appointment.client.firstName} {appointment.client.lastName}
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        {showActions && appointment.state !== "CANCELADO" 
                     && appointment.state !== "INACTIVO" 
                     && appointment.state !== "COMPLETADO" 
                     && appointment.state !== "MOROSO"
                     && (
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

