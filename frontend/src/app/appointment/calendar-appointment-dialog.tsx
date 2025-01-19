'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './calendar-appointment-dialog.css'
import { UserPen } from 'lucide-react'

export interface Appointment {
  id: number;
  datetimeStart: Date;
  datetimeEnd: Date;
  state: string;
  client: string;
  package: string;
  details: [
    {
      id: number;
      priceNow: number;
      durationNow: number;
      appointment: string;
      employee: string;
      workstation: string;
      service: string;
    }
  ];
}

export function CalendarAppointmentDialog({ onClose, packageName, availableDates, services, duration, price }: { onClose: () => void, packageName: string, availableDates: Date[], services: string[], duration: string, price: number }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  const handleDateChange = (date: Date) => {
    const appointmentDates = availableDates.map(d => new Date(d).toDateString())
    if (appointmentDates.includes(date.toDateString())) {
      setSelectedDate(date)

      const times = availableDates
        .filter(d => new Date(d).toDateString() === date.toDateString())
        .map(d => new Date(d).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }))
      setAvailableTimes(times)
      setIsTimeModalOpen(true) // Abrir modal de horarios
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setIsTimeModalOpen(false)
    setIsDetailsModalOpen(true)
  }

  const tileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const appointmentDates = availableDates.map(d => new Date(d).toDateString())
      if (appointmentDates.includes(date.toDateString())) {
        return 'highlight'
      }
    }
    return null
  }

  return (
    <>
      {/* Modal principal */}
      <Dialog open={true} onOpenChange={onClose}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mr-2">Ver calendario</Button>
        </DialogTrigger>
        <DialogContent className="custom-dialog-content">
          <DialogHeader>
            <DialogTitle className="custom-dialog-title">{packageName}</DialogTitle>
          </DialogHeader>
          <Calendar
            onChange={handleDateChange}
            tileClassName={tileClassName}
            locale="es-AR"
            className="custom-calendar"
          />
        </DialogContent>
      </Dialog>

      {/* Modal de horarios */}
      {isTimeModalOpen && selectedDate && (
        <Dialog open={isTimeModalOpen} onOpenChange={() => setIsTimeModalOpen(false)}>
          <DialogTrigger asChild>
            <Button variant="outline" className="mr-2"><UserPen /></Button>
          </DialogTrigger>
          <DialogContent className="custom-dialog-content">
            <DialogHeader>
              <DialogTitle className="custom-dialog-title">
                Horarios disponibles para el {selectedDate.toLocaleDateString('es-AR')}
              </DialogTitle>
            </DialogHeader>
            <div className="time-grid">
              {availableTimes.length > 0 ? (
                availableTimes.map((time, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="time-button"
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </Button>
                ))
              ) : (
                <p>Al parecer se acaba de ocupar el ultimo horario disponible para esta fecha. Intenta con otra fecha.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de detalles del turno */}
      {isDetailsModalOpen && selectedDate && selectedTime && (
        <Dialog open={isDetailsModalOpen} onOpenChange={() => setIsDetailsModalOpen(false)}>
          <DialogContent className="custom-dialog-content">
            <DialogHeader>
              <DialogTitle className="custom-dialog-title">Detalles del Turno</DialogTitle>
            </DialogHeader>
            <div className="appointment-details">
              <p><strong>Nombre del paquete:</strong> {packageName}</p>
              <p><strong>Servicios incluidos:</strong> {services.join(', ')}</p>
              <p><strong>Fecha y hora del turno:</strong> {selectedDate.toLocaleDateString('es-AR')} a las {selectedTime}</p>
              <p><strong>Duración:</strong> {duration}</p>
              <p><strong>Precio:</strong> ${price}</p>
            </div>
            <div className="button-group">
              <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Cancelar</Button>
              <Button variant="solid" onClick={() => alert('Turno confirmado')}>Confirmar Turno</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}