"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns/format"
import { es } from "date-fns/locale"
import { usePaymentStore } from "@/app/store/usePaymentStore"
import { PaymentButton } from "@/components/mercadopago/PaymentButton"
import useMyDatesStore from "@/app/store/useMyDatesStore"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CreditCard, Frown, MapPin, Scissors, Smile, User } from "lucide-react"
import { EditAppointmentDialog } from "@/components/appointments/edit-appointment-dialog"
import useEditStore from "@/app/store/useEditStore"
import { CancelConfirmationDialog } from "@/components/appointments/cancel-confirmation-dialog"


function canEditAppointment(appointment) {
  // Solo se puede editar si:
  // 1. Ya está abonado (estado ACTIVO o COMPLETADO)
  // 2. No ha sido completado (estado diferente a COMPLETADO)
  // 3. Faltan más de 30 minutos para la cita

  const isPaid = appointment.state === "ACTIVO"
  const isNotCompleted = appointment.state !== "COMPLETADO"

  // Calcular si faltan más de 30 minutos
  const appointmentTime = new Date(appointment.datetimeStart)
  const now = new Date()
  const diffInMinutes = (appointmentTime.getTime() - now.getTime()) / (1000 * 60)
  const hasEnoughTimeLeft = diffInMinutes > 40

  return isPaid && isNotCompleted && hasEnoughTimeLeft
}

export function ViewMydateDialog({ appointment }) {
  const { cancelAppointment } = useMyDatesStore()
  const fetchPaymentUrl = usePaymentStore((state) => state.fetchPaymentUrl)
  const paymentUrl = null
  const { openEditDialog, setAppointment } = useEditStore()
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)


  useEffect(() => {
    fetchPaymentUrl(appointment.id)
  }, [appointment.id, fetchPaymentUrl])

  const handleCancelClick = () => {
    setShowCancelConfirmation(true)
  }

  const handleConfirmCancel = async () => {
    await cancelAppointment(appointment.id)
    window.location.reload()
  }

  const handleEdit = () => {
    setAppointment(appointment.id)
    openEditDialog()
  }

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
        return "bg-pink-100 text-pink-800 border-pink-200"
    }
  }

  // Calcular el precio total sumando todos los servicios si no está disponible directamente
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

  // Obtener todos los servicios, ya sea de details o directamente del paquete
  const getAllServices = () => {
    if (appointment.details && Array.isArray(appointment.details) && appointment.details.length > 0) {
      return appointment.details
    } else if (appointment.package && appointment.package.services && Array.isArray(appointment.package.services)) {
      // Convertir servicios del paquete a un formato similar a details para renderizar
      return appointment.package.services.map((service) => ({
        service: service,
        datetimeStart: appointment.datetimeStart,
        // Valores por defecto para evitar errores
        employee: { firstName: "Por asignar", lastName: "" },
        workstation: { id: "-", description: "Por asignar" },
      }))
    }
    return []
  }

  const services = getAllServices()
  const totalPrice = calculateTotalPrice()

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <Badge className="mb-2 bg-pink-100 text-pink-700 border-pink-200">Cita #{appointment.id}</Badge>
            <DialogTitle className="text-2xl font-bold text-pink-700">
              {appointment.package.name.toUpperCase()}
            </DialogTitle>
          </div>
          <Badge className={`text-sm px-3 py-1 ${getStatusColor(appointment.state)}`}>{appointment.state}</Badge>
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-lg flex items-center gap-3">
            <Calendar className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-sm text-purple-700">Fecha y hora</p>
              <p className="font-medium text-purple-800">
                {format(new Date(appointment.datetimeStart), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                <br />
                {format(new Date(appointment.datetimeStart), "HH:mm")} hs
              </p>
            </div>
          </div>

          <div className="bg-pink-50 p-4 rounded-lg flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-pink-600" />
            <div>
              <p className="text-sm text-pink-700">Precio total</p>
              <p className="font-medium text-pink-800">${totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Scissors className="h-5 w-5 text-pink-600" />
          Servicios incluidos
        </h3>

        <div className="space-y-4">
          {services.length > 0 ? (
            services.map((detail, index) => (
              <Card
                key={index}
                className="overflow-hidden border-l-4 border-l-pink-400 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 flex items-center justify-center md:w-1/4">
                    <div className="text-center">
                      <p className="text-sm text-pink-700">Inicio</p>
                      <p className="text-lg font-bold text-pink-800">
                        {format(new Date(detail.datetimeStart), "HH:mm")} hs
                      </p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-pink-700">{detail.service.name}</CardTitle>
                      <CardDescription className="text-gray-600">{detail.service.description}</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {detail.employee && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-600" />
                            <span>
                              Profesional: {detail.employee.firstName} {detail.employee.lastName}
                            </span>
                          </div>
                        )}
                        {detail.workstation && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-600" />
                            <span>Estación {detail.workstation.id}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span>{detail.service.duration} minutos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                          <span>${detail.service.price?.toFixed(2) || "0.00"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No hay servicios disponibles para mostrar</p>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {appointment.state !== "COMPLETADO" && appointment.state !== "ACTIVO" && <PaymentButton source="later" />}

          {canEditAppointment(appointment) && (
            <Button
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              onClick={handleEdit}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Cambiar fecha y hora
            </Button>
          )}

          {appointment.state === "PENDIENTE" && (
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={handleCancelClick}
            >
              <Frown className="mr-2 h-5 w-5" />
              Cancelar cita
            </Button>
          )}

          {(appointment.state === "COMPLETADO" || appointment.state === "ACTIVO") && (
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Smile className="mr-2 h-5 w-5" />
              Ya has abonado esta cita
              <Smile className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      <CancelConfirmationDialog
        isOpen={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={handleConfirmCancel}
        appointmentDate={format(new Date(appointment.datetimeStart), "EEEE d 'de' MMMM, yyyy", { locale: es })}
      />
      <EditAppointmentDialog
        appointmentId={appointment.id}
        packageId={appointment.package.id}
        currentDatetime={appointment.datetimeStart}
      />
    </DialogContent>
  )
}
