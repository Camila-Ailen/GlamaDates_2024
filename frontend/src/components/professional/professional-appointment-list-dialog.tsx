"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProfessionalAppointmentCard } from "./professional-appointment-card"
import { ViewMycalendarDialog } from "@/app/myCalendar/view-mycalendar-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ProfessionalAppointmentListDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  date: Date | null
  appointments: any[]
}

export function ProfessionalAppointmentListDialog({
  isOpen,
  setIsOpen,
  date,
  appointments,
}: ProfessionalAppointmentListDialogProps) {
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
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Citas para el {format(date, "d 'de' MMMM, yyyy", { locale: es })}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 max-h-[60vh]">
            <div className="grid gap-4 py-4">
              {appointments.length === 0 ? (
                <p className="text-center text-muted-foreground">No hay citas para este día</p>
              ) : (
                appointments.map((appointment) => (
                  <ProfessionalAppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onClick={() => handleAppointmentClick(appointment)}
                    compact
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {selectedAppointment && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <ViewMycalendarDialog appointment={selectedAppointment} />
        </Dialog>
      )}
    </>
  )
}

