"use client"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns/format"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Scissors, CheckCircle, CreditCard } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import useAppointmentStore from "../store/useAppointmentStore"

interface ProfessionalAppointmentCardProps {
  appointment: any
  onClick?: () => void
  compact?: boolean
  showActions?: boolean
}

export function ViewMycalendarDialog({
  appointment,
  showActions = true,
}: ProfessionalAppointmentCardProps) {

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const fetchCompletedAppointment = useAppointmentStore((state) => state.fetchCompletedAppointment)
  

  const getStatusColor = (state: string) => {
    switch (state) {
      case "COMPLETADO":
        return "bg-green-100 text-green-800 border-green-200"
      case "INACTIVO":
      case "CANCELADO":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "MOROSO":
        return "bg-red-100 text-red-800 border-red-200"
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
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

  const serviceCount = appointment.details?.length || appointment.package?.services?.length || 0


  return (
    <>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-2 bg-blue-100 text-blue-700 border-blue-200">Cita #{appointment.id}</Badge>
              <DialogTitle className="text-2xl font-bold text-blue-700">
                {appointment.package.name.toUpperCase()}
              </DialogTitle>
            </div>
            <Badge className={`text-sm px-3 py-1 ${getStatusColor(appointment.state)}`}>{appointment.state}</Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-indigo-50 p-4 rounded-lg flex items-center gap-3">
              <Calendar className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-sm text-indigo-700">Fecha y hora</p>
                <p className="font-medium text-indigo-800">
                  {format(new Date(appointment.datetimeStart), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                  <br />
                  {format(new Date(appointment.datetimeStart), "HH:mm")} hs
                </p>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg flex items-center gap-3">
              <User className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm text-purple-700">Cliente</p>
                <p className="font-medium text-purple-800">
                  {appointment.client.firstName} {appointment.client.lastName}
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Scissors className="h-5 w-5 text-blue-600" />
            Servicios programados
          </h3>

          <div className="space-y-4">
            {appointment &&
              Array.isArray(appointment.details) &&
              appointment.details.map((detail, index) => (
                <Card
                  key={index}
                  className="overflow-hidden border-l-4 border-l-blue-400 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 flex items-center justify-center md:w-1/4">
                      <div className="text-center">
                        <p className="text-sm text-blue-700">Inicio</p>
                        <p className="text-lg font-bold text-blue-800">
                          {format(new Date(detail.datetimeStart), "HH:mm")} hs
                        </p>
                      </div>
                    </div>

                    <div className="flex-1">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-blue-700">{detail.service.name}</CardTitle>
                        <CardDescription className="text-gray-600">{detail.service.description}</CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span>{detail.service.duration} minutos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-600" />
                            <span>
                              Estación {detail.workstation.id}: {detail.workstation.description}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
          </div>

          <div className="mt-2">
            {showActions && (
              <CardContent className="pt-0 pb-0 px-4 flex justify-between items-center">
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
      </DialogContent>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="bg-green-50 p-4 -m-6 mb-4 rounded-t-lg border-b border-green-100 flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <AlertDialogTitle className="text-xl text-green-700 m-0">Confirmar acción</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-4">
              <p className="text-gray-600">¿Estás seguro de que deseas marcar esta cita como completada?</p>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center">
                  <div className="flex items-center justify-center bg-blue-100 rounded-full p-1.5">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="font-medium">{appointment.package.name}</div>

                  <div className="flex items-center justify-center bg-purple-100 rounded-full p-1.5">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    {appointment.client.firstName} {appointment.client.lastName}
                  </div>

                  <div className="flex items-center justify-center bg-amber-100 rounded-full p-1.5">
                    <Calendar className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>{format(new Date(appointment.datetimeStart), "d MMM yyyy", { locale: es })}</div>

                  <div className="flex items-center justify-center bg-pink-100 rounded-full p-1.5">
                    <Clock className="h-4 w-4 text-pink-600" />
                  </div>
                  <div>{format(new Date(appointment.datetimeStart), "HH:mm", { locale: es })} hs</div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="border-gray-200 text-gray-700 hover:bg-gray-50">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmComplete}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

