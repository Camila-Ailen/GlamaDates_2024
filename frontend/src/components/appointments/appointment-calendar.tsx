"use client"

import { useState } from "react"
import { Calendar } from "react-calendar"

import "react-calendar/dist/Calendar.css"
import "@/components/multistep/calendar-appointment-dialog.css"

import { cn } from "@/lib/utils"
import { es } from "date-fns/locale"
import { AppointmentListDialog } from "./appointment-list-dialog"

interface AppointmentCalendarProps {
  availableDates: Date[]
  appointments: any[]
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
}

export function AppointmentCalendar({
  availableDates,
  appointments,
  selectedDate,
  setSelectedDate,
}: AppointmentCalendarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    // Verificar si hay citas para esta fecha
    const hasAppointments = availableDates.some((availableDate) => availableDate.toDateString() === date.toDateString())

    if (hasAppointments) {
      setSelectedDate(date)
      setIsDialogOpen(true)
    }
  }

  // Función para resaltar fechas con citas
  const dayClassName = (date: Date) => {
    const hasAppointment = availableDates.some((availableDate) => availableDate.toDateString() === date.toDateString())

    return hasAppointment ? "bg-pink-100 text-pink-700 font-medium rounded-full" : undefined
  }

  // Filtrar citas para la fecha seleccionada
  const appointmentsForSelectedDate = selectedDate
    ? appointments.filter((appointment) => appointment.dateObj.toDateString() === selectedDate.toDateString())
    : []

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <Calendar
    //   calendarType="ISO 8601"
        // mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        locale="es-AR"
        className="custom-calendar"
        modifiersClassNames={{
          selected: "bg-pink-500 text-white hover:bg-pink-500 hover:text-white focus:bg-pink-500 focus:text-white",
        }}
        modifiers={{
          highlighted: availableDates,
        }}
        modifiersStyles={{
          highlighted: {
            fontWeight: "bold",
            backgroundColor: "rgba(236, 72, 153, 0.1)",
            color: "rgb(190, 24, 93)",
            borderRadius: "100%",
          },
        }}
        components={{
          Day: ({ date, ...props }) => {
            const className = dayClassName(date)
            return <button {...props} className={cn(props.className, className)} />
          },
        }}
      />

      <AppointmentListDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        date={selectedDate}
        appointments={appointmentsForSelectedDate}
      />
    </div>
  )
}

