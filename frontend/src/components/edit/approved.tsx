"use client"

import type React from "react"
import "react-calendar/dist/Calendar.css"
import "@/components/multistep/calendar-appointment-dialog.css"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { useEditStore } from "@/app/store/useEditStore"
import { format } from "date-fns"
import useAppointmentStore, { type Appointment } from "@/app/store/useAppointmentStore"
import { useEffect, useState } from "react"
import { CalendarIcon, Clock, User, MapPin } from "lucide-react"
import { Separator } from "../ui/separator"
import { date } from "zod"

const Approved: React.FC = () => {
  const { appointment, datetimeOld, rearrangeAppointment, closeDialog } = useEditStore()
  const { fetchOneAppointment } = useAppointmentStore()
  const [currentAppointment, setCurrentAppointment] = useState<Appointment>()
  const [isLoading, setIsLoading] = useState(true)

  const handleCancel = () => {
    closeDialog()
  }

  useEffect(() => {
    const loadAppointment = async () => {
      if (appointment !== null) {
        setIsLoading(true)
        const appointmentData = await fetchOneAppointment(appointment)
        const data = await appointmentData;
          setCurrentAppointment(data?.data)
        setIsLoading(false)
      }
    }
    loadAppointment()
  }, [appointment, fetchOneAppointment])

  const handleRearrange = async () => {
    if (currentAppointment) {
      await rearrangeAppointment({
        id: currentAppointment.id,
        // datetimeStart: currentAppointment.datetimeStart,
        datetimeStart: datetimeOld,
        datetimeEnd: datetimeOld,
      })
      closeDialog()
      window.location.reload()
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex justify-center items-center h-40">
          <div className="animate-pulse">Cargando detalles del turno...</div>
        </CardContent>
      </Card>
    )
  }

  if (!currentAppointment) {
    return (
      <Card className="w-full">
        <CardContent className="text-center text-red-500">Error al cargar los detalles del turno</CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">Confirmar Cambio de Turno</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Turno Actual */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Turno Actual</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{format(new Date(currentAppointment.datetimeStart), "dd/MM/yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(currentAppointment.datetimeStart), "HH:mm")} -{" "}
                  {format(new Date(currentAppointment.datetimeEnd), "HH:mm")}
                </span>
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  Cliente: {currentAppointment.client.firstName} {currentAppointment.client.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Estación: {currentAppointment.details[0]?.workstation.name}</span>
              </div>
              <Separator />
              <div>
                <span className="font-medium">Servicio: </span>
                {currentAppointment.package.name}
              </div>
              <div>
                <span className="font-medium">Estado: </span>
                <span className="capitalize">{currentAppointment.state.toLowerCase()}</span>
              </div>
            </div>
          </div>

          {/* Nueva Fecha */}
          <div className="border rounded-lg p-4 bg-primary/5">
            <h3 className="font-semibold mb-3">Nueva Fecha Propuesta</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{datetimeOld ? format(new Date(datetimeOld), "dd/MM/yyyy") : "Fecha no disponible"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {datetimeOld ? format(new Date(datetimeOld), "HH:mm") : "Hora no disponible"} 
                  {/* {datetimeOld ? format(new Date(datetimeOld), "HH:mm") : "Hora no disponible"} */}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Misma estación: {currentAppointment.details[0]?.workstation.name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleRearrange}>Confirmar Cambio</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Approved