"use client"

import { useState } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import "@/components/multistep/calendar-appointment-dialog.css"
import { ProfessionalAppointmentListDialog } from "./professional-appointment-list-dialog"

interface ProfessionalCalendarProps {
  availableDates: Date[]
  appointments: any[]
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
}

export function ProfessionalCalendar({
  availableDates,
  appointments,
  selectedDate,
  setSelectedDate,
}: ProfessionalCalendarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDateSelect = (date: Date) => {
    if (!date) return

    // Verificar si hay citas para esta fecha
    const hasAppointments = availableDates.some((availableDate) => availableDate.toDateString() === date.toDateString())

    if (hasAppointments) {
      setSelectedDate(date)
      setIsDialogOpen(true)
    }
  }

  // Filtrar citas para la fecha seleccionada
  const appointmentsForSelectedDate = selectedDate
    ? appointments.filter((appointment) => appointment.dateObj.toDateString() === selectedDate.toDateString())
    : []

  // Función para personalizar la apariencia de cada día en el calendario
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    // Solo aplicar a la vista mensual
    if (view !== "month") return null

    // Contar citas para esta fecha
    const count = appointments.filter(
      (appointment) => appointment.dateObj.toDateString() === date.toDateString(),
    ).length

    // Si hay citas, mostrar el contador
    if (count > 0) {
      return (
        <div className="appointment-count">
          <span>{count}</span>
        </div>
      )
    }

    return null
  }

  // Función para aplicar clases a los días con citas
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return ""

    const classes = []

    // Verificar si es la fecha seleccionada
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      classes.push("selected-date")
    }

    // Verificar si hay citas para esta fecha
    const hasAppointment = availableDates.some((availableDate) => availableDate.toDateString() === date.toDateString())

    if (hasAppointment) {
      classes.push("highlight")
    }

    return classes.join(" ")
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <style jsx global>{`
        .appointment-count {
          position: absolute;
          top: 2px;
          right: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
          font-size: 10px;
          font-weight: bold;
        }
        
        .react-calendar__tile {
          position: relative;
          height: 48px;
        }
        
        .react-calendar__tile.highlight {
          background-color: rgba(59, 130, 246, 0.1);
          color: rgb(29, 78, 216);
          font-weight: bold;
        }
        
        .react-calendar__tile.selected-date {
          background-color: #3b82f6;
          color: white;
        }
        
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: rgba(59, 130, 246, 0.2);
        }
        
        .react-calendar__tile--active {
          background-color: #3b82f6;
          color: white;
        }
      `}</style>

      <Calendar
        locale="es-AR"
        value={selectedDate}
        onClickDay={handleDateSelect}
        tileClassName={tileClassName}
        tileContent={tileContent}
        className="custom-calendar"
      />

      <ProfessionalAppointmentListDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        date={selectedDate}
        appointments={appointmentsForSelectedDate}
      />
    </div>
  )
}

