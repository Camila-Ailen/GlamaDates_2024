"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Eye, Calendar, User, Package, Clock, Info, MapPin, UserCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns/format"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AppointmentHistoryButton } from "@/components/appointments/appointment-history-button"

interface AppointmentDetail {
  service: {
    name: string
    price: number
    duration: number
    description: string
  }
  datetimeStart: string
  employee: {
    firstName: string
    lastName: string
  }
  workstation: {
    id: number
    description: string
  }
}

interface Appointment {
  id: number
  state: string
  datetimeStart: string
  client: {
    firstName: string
    lastName: string
  }
  package: {
    name: string
  }
  total: number
  details: AppointmentDetail[]
}

export function ViewAppointmentDialog({ appointment }: { appointment: Appointment }) {
  const [isOpen, setIsOpen] = useState(false)

  const getStatusBadge = (state: string) => {
    switch (state) {
      case "CANCELADO":
        return <Badge variant="destructive">CANCELADO</Badge>
      case "COMPLETADO":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            COMPLETADO
          </Badge>
        )
      case "PENDIENTE":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            PENDIENTE
          </Badge>
        )
      default:
        return <Badge variant="secondary">{state}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="mr-2" title="Ver detalles de la cita">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            Detalles de la Cita #{appointment.id}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Sección de información general */}
            <div className="bg-muted/30 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <Info className="mr-2 h-4 w-4 text-primary" />
                  Información General
                </h3>
                {getStatusBadge(appointment.state)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Fecha
                  </div>
                  <p className="font-medium">
                    {format(new Date(appointment.datetimeStart), "EEEE d 'de' MMMM 'del' yyyy", { locale: es })}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    Hora
                  </div>
                  <p className="font-medium">{format(new Date(appointment.datetimeStart), "HH:mm")} hs</p>
                </div>
              </div>
            </div>

            {/* Sección de cliente y paquete */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <User className="mr-2 h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Cliente</h3>
                  </div>
                  <p className="text-lg font-medium">
                    {appointment.client.firstName.toUpperCase()} {appointment.client.lastName.toUpperCase()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <Package className="mr-2 h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Paquete</h3>
                  </div>
                  <p className="text-lg font-medium">{appointment.package.name.toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total: ${appointment.total.toFixed(2)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Sección de servicios */}
            <div>
              <h3 className="font-semibold text-lg flex items-center mb-4">
                <Package className="mr-2 h-5 w-5 text-primary" />
                Servicios Incluidos
              </h3>

              <div className="space-y-4">
                {appointment &&
                  Array.isArray(appointment.details) &&
                  appointment.details.map((detail, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="bg-primary/10 px-6 py-3 border-b">
                        <h4 className="font-semibold">{detail.service.name}</h4>
                      </div>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <Label className="text-muted-foreground text-xs">PRECIO</Label>
                              <p className="font-medium">${detail.service.price.toFixed(2)}</p>
                            </div>

                            <div>
                              <Label className="text-muted-foreground text-xs">HORARIO</Label>
                              <p className="font-medium">
                                {format(new Date(detail.datetimeStart), "HH:mm")} hs
                                <span className="text-muted-foreground ml-2">({detail.service.duration} min)</span>
                              </p>
                            </div>

                            <div>
                              <Label className="text-muted-foreground text-xs">EMPLEADO</Label>
                              <div className="flex items-center">
                                <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                                <p className="font-medium">
                                  {detail.employee.firstName} {detail.employee.lastName}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <Label className="text-muted-foreground text-xs">ESTACIÓN DE TRABAJO</Label>
                              <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4 text-blue-600" />
                                <p className="font-medium">
                                  #{detail.workstation.id} - {detail.workstation.description}
                                </p>
                              </div>
                            </div>

                            <div>
                              <Label className="text-muted-foreground text-xs">DESCRIPCIÓN</Label>
                              <p className="text-sm mt-1">{detail.service.description}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {(!appointment.details || appointment.details.length === 0) && (
                  <div className="text-center p-4 border rounded-md text-muted-foreground">
                    No hay servicios disponibles para esta cita
                  </div>
                )}
              </div>
            </div>

            {/* Historial */}
            <div className="flex gap-2 justify-center">
              <AppointmentHistoryButton
                appointmentId={appointment.id}
                appointmentData={appointment}
                size="sm"
                variant="ghost"
              />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
