import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import { Calendar } from "react-calendar"
import "react-calendar/dist/Calendar.css"
import "@/components/multistep/calendar-appointment-dialog.css"
import { useEffect, useState } from "react"

export interface InitialFormData {
  availableDates: Date[]
}

const Step1: React.FC<InitialFormData> = ({ availableDates }) => {
  const { formData, updateFormData } = useFormStore()
  const [selectedDate, setSelectedDate] = useState<Date | null>(formData.step1.date)
  const [availableTimes, setAvailableTimes] = useState<string[]>(formData.step1.availableTimes || [])

  useEffect(() => {
    if (selectedDate) {
      const times = availableDates
        .filter((d) => new Date(d).toDateString() === selectedDate.toDateString())
        .map((d) => new Date(d).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }))
      updateFormData("step1", { date: selectedDate, availableTimes: times })
    }
    console.log("Paquete seleccionado: ", formData.selectedPackage?.name)
  }, [selectedDate, availableDates, updateFormData])

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const appointmentDates = availableDates.map((d) => new Date(d).toDateString())
      if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
        return "selected-date"
      }
      if (appointmentDates.includes(date.toDateString())) {
        return "highlight"
      }
    }
    return null
  }

  const handleDateChange = (date: Date) => {
    const appointmentDates = availableDates.map((d) => new Date(d).toDateString())
    if (appointmentDates.includes(date.toDateString())) {
      setSelectedDate(date)
    }
  }

  return (
    <div className="custom-dialog-content calendar-container">
      <h2 className="text-2xl font-bold mb-4">Paquete: {formData.selectedPackage?.name} </h2>
      <h3 className="custom-dialog-title">Seleccione la fecha</h3>
      <Calendar onChange={handleDateChange} tileClassName={tileClassName} locale="es-AR" className="custom-calendar" />
    </div>
  )
}

export default Step1

