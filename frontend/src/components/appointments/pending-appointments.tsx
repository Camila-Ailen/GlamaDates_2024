"use client"

import { useEffect, useState } from "react"
import { AppointmentCard } from "./appointment-card"
import { Dialog } from "@/components/ui/dialog"
import { ViewMydateDialog } from "@/app/myDate/view-mydate-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PendingAppointmentsProps {
  appointments: any[]
  onSort?: (field: string) => void
}

export function PendingAppointments({ appointments, onSort }: PendingAppointmentsProps) {
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

  // Apply sorting whenever appointments or sortField changes
  useEffect(() => {
    const sorted = [...appointments].sort((a, b) => {
      if (sortField === "datetimeStart") {
        // Sort by date
        const dateA = new Date(a.datetimeStart).getTime()
        const dateB = new Date(b.datetimeStart).getTime()
        return dateA - dateB
      } else if (sortField === "package.name") {
        // Sort by package name
        const nameA = a.package?.name || ""
        const nameB = b.package?.name || ""
        return nameA.localeCompare(nameB)
      } else if (sortField === "state") {
        // Sort by state
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
            <p className="text-center text-muted-foreground p-4">No hay citas pendientes de pago</p>
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
