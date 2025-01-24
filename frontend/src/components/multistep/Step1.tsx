import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import { Calendar } from "react-calendar"
import 'react-calendar/dist/Calendar.css'
import '@/components/multistep/calendar-appointment-dialog.css'
import { useState } from "react"
import { toast } from "sonner"

interface Service {
  id: number;
  name: string;
  description: string;
}

interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  services: Service[];
}

export interface InitialFormData {
  availableDates: Date[]
  selectedPackage: Package
}

const Step1: React.FC<InitialFormData> = ({ availableDates, selectedPackage }) => {
  const { formData, updateFormData } = useFormStore()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  const tileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const appointmentDates = availableDates.map(d => new Date(d).toDateString())
      if (appointmentDates.includes(date.toDateString())) {
        return 'highlight'
      }
      if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
        return 'selected-date'
      }
    }
    return null
  }

  const handleDateChange = (date: Date) => {
    const appointmentDates = availableDates.map(d => new Date(d).toDateString())
    if (appointmentDates.includes(date.toDateString())) {
      setSelectedDate(date)

      const times = availableDates
        .filter(d => new Date(d).toDateString() === date.toDateString())
        .map(d => new Date(d).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }))
      setAvailableTimes(times)
      updateFormData("step1", { date: date, availableTimes: times })
      console.log('Date selected:', date)
      console.log('Available times:', times)
    }
  }

  return (
    <div className="custom-dialog-content">
      {/* <h2 className="text-2xl font-bold mb-4">Paquete: {selectedPackage.name} </h2> */}
      <h3 className="custom-dialog-title">Seleccione la fecha</h3>
      <Calendar
        onChange={handleDateChange}
        tileClassName={tileClassName}
        locale="es-AR"
        className="custom-calendar"
      />
    </div>
  )
}

export default Step1

