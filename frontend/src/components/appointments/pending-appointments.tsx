"use client"

import { useState } from "react"
import { AppointmentCard } from "./appointment-card"
import { Dialog } from "@/components/ui/dialog"
import { ViewMydateDialog } from "@/app/myDate/view-mydate-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PendingAppointmentsProps {
  appointments: any[]
  onSort: (field: string) => void
}

export function PendingAppointments({ appointments, onSort }: PendingAppointmentsProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsDialogOpen(true)
  }

  return (
    <>
      <div className="mb-4">
        <Select onValueChange={onSort} defaultValue="datetimeStart">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="datetimeStart">Fecha</SelectItem>
            <SelectItem value="package.name">Paquete</SelectItem>
            <SelectItem value="state">Estado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[calc(100vh-250px)] pr-4">
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">No hay citas pendientes de pago</p>
          ) : (
            appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onClick={() => handleAppointmentClick(appointment)}
                showActions
              />
            ))
          )}
        </div>
      </ScrollArea>

      {selectedAppointment && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <ViewMydateDialog appointment={selectedAppointment} />
        </Dialog>
      )}
    </>
  )
}

