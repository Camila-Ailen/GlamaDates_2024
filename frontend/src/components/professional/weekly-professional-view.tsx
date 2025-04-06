"use client"

import { useState } from "react"
import { format, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { ProfessionalAppointmentCard } from "./professional-appointment-card"
import { Dialog } from "@/components/ui/dialog"
import { ViewMycalendarDialog } from "@/app/myCalendar/view-mycalendar-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface WeeklyProfessionalViewProps {
  weekDays: {
    date: Date
    appointments: any[]
  }[]
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
}

export function WeeklyProfessionalView({ weekDays, selectedDate, setSelectedDate }: WeeklyProfessionalViewProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsDialogOpen(true)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {weekDays.map((day, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <div
            className={cn(
              "p-2 text-center font-medium border-b",
              isToday(day.date) ? "bg-blue-100 text-blue-800" : "bg-gray-50",
            )}
          >
            <div>{format(day.date, "EEEE", { locale: es })}</div>
            <div>{format(day.date, "d MMM", { locale: es })}</div>
          </div>

          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="p-2 space-y-2">
              {day.appointments.length === 0 ? (
                <p className="text-center text-muted-foreground text-xs p-4">Sin citas</p>
              ) : (
                day.appointments.map((appointment) => (
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
        </div>
      ))}

      {selectedAppointment && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <ViewMycalendarDialog appointment={selectedAppointment} />
        </Dialog>
      )}
    </div>
  )
}

