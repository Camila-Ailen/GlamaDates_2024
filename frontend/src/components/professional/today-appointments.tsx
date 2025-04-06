"use client"

import { useState } from "react"
import { ProfessionalAppointmentCard } from "./professional-appointment-card"
import { Dialog } from "@/components/ui/dialog"
import { ViewMycalendarDialog } from "@/app/myCalendar/view-mycalendar-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TodayAppointmentsProps {
  appointments: any[]
  onSort: (field: string) => void
  title?: string
}

export function TodayAppointments({ appointments, onSort, title = "Hoy" }: TodayAppointmentsProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsDialogOpen(true)
  }

  // Ordenar citas por hora
  const sortedAppointments = [...appointments].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

  return (
    <>
      <div className="mb-4">
        <Select onValueChange={onSort} defaultValue="datetimeStart">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="datetimeStart">Hora</SelectItem>
            <SelectItem value="package.name">Paquete</SelectItem>
            <SelectItem value="client.firstName">Cliente</SelectItem>
            <SelectItem value="state">Estado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[calc(100vh-250px)] pr-4">
        {sortedAppointments.length === 0 ? (
          <p className="text-center text-muted-foreground p-4">No hay citas para {title.toLowerCase()}</p>
        ) : (
          <div className="space-y-3">
            {sortedAppointments.map((appointment) => (
              <ProfessionalAppointmentCard
                key={appointment.id}
                appointment={appointment}
                onClick={() => handleAppointmentClick(appointment)}
                showActions
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {selectedAppointment && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <ViewMycalendarDialog appointment={selectedAppointment} />
        </Dialog>
      )}
    </>
  )
}

