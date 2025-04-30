"use client"

import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import { Button } from "../ui/button"
import { useEffect, useState } from "react"
import { Clock, CheckCircle } from "lucide-react"

const Step2: React.FC = () => {
  const { formData, updateFormData } = useFormStore()
  const [selectedTime, setSelectedTime] = useState<string | null>(formData.step2.time || null)

  const selectedDate = formData.step1.date
  const availableTimes = formData.step1.availableTimes || []

  useEffect(() => {
    if (selectedTime) {
      updateFormData("step2", { date: selectedDate, time: selectedTime })
    }
  }, [selectedTime, updateFormData, selectedDate])

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
  }

  // Agrupar horarios por mañana, tarde y noche
    const groupedTimes = {
    morning: availableTimes.filter((time) => time.includes('a. m.')),
    afternoon: availableTimes.filter((time) => time.includes('p. m.')),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-pink-600" />
        <h3 className="text-lg font-medium text-gray-800">Seleccione un horario</h3>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 border border-pink-100">
        <div className="mb-2 text-sm text-gray-500">
          Fecha seleccionada:{" "}
          <span className="font-medium text-gray-700">
            {selectedDate?.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </div>

        {availableTimes.length > 0 ? (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {groupedTimes.morning.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-pink-700 mb-2">Mañana</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {groupedTimes.morning.map((time, index) => (
                    <Button
                      key={index}
                      variant={selectedTime === time ? "default" : "outline"}
                      className={`
                        relative h-10 transition-all duration-200
                        ${
                          selectedTime === time
                            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white border-transparent"
                            : "border-pink-200 text-pink-700 hover:bg-pink-50"
                        }
                      `}
                      onClick={() => handleTimeChange(time)}
                    >
                      {time}
                      {selectedTime === time && (
                        <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full text-pink-500" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {groupedTimes.afternoon.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-pink-700 mb-2">Tarde</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {groupedTimes.afternoon.map((time, index) => (
                    <Button
                      key={index}
                      variant={selectedTime === time ? "default" : "outline"}
                      className={`
                        relative h-10 transition-all duration-200
                        ${
                          selectedTime === time
                            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white border-transparent"
                            : "border-pink-200 text-pink-700 hover:bg-pink-50"
                        }
                      `}
                      onClick={() => handleTimeChange(time)}
                    >
                      {time}
                      {selectedTime === time && (
                        <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full text-pink-500" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
            Al parecer se acaba de ocupar el último horario disponible para esta fecha. Intenta con otra fecha.
          </div>
        )}
      </div>

      {selectedTime && (
        <div className="mt-4 p-3 bg-pink-50 rounded-lg border border-pink-100 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-pink-600 flex-shrink-0" />
          <p className="text-sm text-pink-700">
            Horario seleccionado: <span className="font-medium">{selectedTime} hs</span>
          </p>
        </div>
      )}
    </div>
  )
}

export default Step2

