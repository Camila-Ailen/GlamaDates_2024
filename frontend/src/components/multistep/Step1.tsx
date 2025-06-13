"use client"

import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import { Calendar } from "react-calendar"
import "react-calendar/dist/Calendar.css"
import "@/components/multistep/calendar-appointment-dialog.css"
import { useEffect, useState } from "react"
import { CalendarDays, CalendarCheck } from "lucide-react"

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
        // Eliminar duplicados usando Set
        .filter((time, index, array) => array.indexOf(time) === index)
        // Ordenar los horarios
        .sort((a, b) => {
          const timeA = new Date(`1970-01-01 ${a}`)
          const timeB = new Date(`1970-01-01 ${b}`)
          return timeA.getTime() - timeB.getTime()
        })

      updateFormData("step1", { date: selectedDate, availableTimes: times })
    }
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
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 mb-4">
        <CalendarDays className="h-5 w-5 text-pink-600" />
        <h3 className="text-lg font-medium text-gray-800">Seleccione una fecha disponible</h3>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 border border-pink-100">
        <Calendar
          onChange={handleDateChange}
          tileClassName={tileClassName}
          locale="es-AR"
          className="custom-calendar w-full"
          prevLabel={<span className="text-pink-600">←</span>}
          nextLabel={<span className="text-pink-600">→</span>}
          prev2Label={null}
          next2Label={null}
        />
      </div>

      {selectedDate && (
        <div className="mt-4 p-3 bg-pink-50 rounded-lg border border-pink-100 flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-pink-600 flex-shrink-0" />
          <p className="text-sm text-pink-700">
            Fecha seleccionada:{" "}
            <span className="font-medium">
              {selectedDate.toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

export default Step1
