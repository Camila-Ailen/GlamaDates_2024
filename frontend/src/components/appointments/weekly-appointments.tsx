"use client"

import { useEffect, useState } from "react"
import { AppointmentCard } from "./appointment-card"
import { Dialog } from "@/components/ui/dialog"
import { ViewMydateDialog } from "@/app/myDate/view-mydate-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WeeklyAppointmentsProps {
  appointments: any[]
  onSort?: (field: string) => void
}

export function WeeklyAppointments({ appointments, onSort }: WeeklyAppointmentsProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortField, setSortField] = useState<string>("datetimeStart")
  const [sortedAppointments, setSortedAppointments] = useState<any[]>(appointments)

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsDialogOpen(true)
  }

  const handleSort = (field: string) => {
    setSortField(field)
    if (onSort) {
      onSort(field)
    }
  }

  // Aplicar ordenamiento cuando cambian las citas o el campo de ordenamiento
  useEffect(() => {
    const filtered = appointments.filter((appointment) => appointment.state !== "CANCELADO")
    const sorted = [...filtered].sort((a, b) => {
      if (sortField === "datetimeStart") {
        // Ordenar por fecha
        const dateA = new Date(a.datetimeStart).getTime()
        const dateB = new Date(b.datetimeStart).getTime()
        return dateA - dateB
      } else if (sortField === "package.name") {
        // Ordenar por nombre del paquete
        const nameA = a.package?.name || ""
        const nameB = b.package?.name || ""
        return nameA.localeCompare(nameB)
      } else if (sortField === "state") {
        // Ordenar por estado
        const stateA = a.state || ""
        const stateB = b.state || ""
        return stateA.localeCompare(stateB)
      }
      return 0
    })

    setSortedAppointments(sorted)
  }, [appointments, sortField])

  return (
    <>
      <div className="mb-4">
        <Select onValueChange={handleSort} defaultValue={sortField}>
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
          {sortedAppointments.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">No hay citas para esta semana</p>
          ) : (
            sortedAppointments.map((appointment) => (
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
