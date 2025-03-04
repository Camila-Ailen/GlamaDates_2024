"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AppointmentCard } from "./appointment-card"
import { ViewMydateDialog } from "@/app/myDate/view-mydate-dialog"

interface AppointmentListDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  date: Date | null
  appointments: any[]
}


export function AppointmentListDialog({ isOpen, setIsOpen, date, appointments }: AppointmentListDialogProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsDetailDialogOpen(true)
    setIsOpen(false)
  }

  if (!date) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Citas para el {format(date, "d 'de' MMMM, yyyy", { locale: es })}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {appointments.length === 0 ? (
              <p className="text-center text-muted-foreground">No hay citas para este día</p>
            ) : (
              appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onClick={() => handleAppointmentClick(appointment)}
                  compact
                />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedAppointment && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <ViewMydateDialog appointment={selectedAppointment} />
        </Dialog>
      )}
    </>
  )
}

