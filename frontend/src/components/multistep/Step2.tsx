import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import { Button } from "../ui/button"
import { useEffect, useState } from "react"

const Step2: React.FC = () => {
  const { formData, updateFormData } = useFormStore()
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const selectedDate = formData.step1.date
  const availableTimes = formData.step1.availableTimes

  useEffect(() => {
    console.log(`Available times: ${availableTimes} for package: ${formData.selectedPackage?.name}`)
  }, [availableTimes])

  useEffect(() => {
    if (selectedTime) {
      updateFormData("step2", { date: selectedDate, time: selectedTime })
    }
  }, [selectedTime, updateFormData, selectedDate])

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
  }

  return (
    <div className="custom-dialog-content">
      <h2 className="custom-dialog-title">Paso 2: Seleccione el horario para {formData.selectedPackage?.name}</h2>
      <h3> Fecha seleccionada: {selectedDate?.toLocaleDateString("es-AR")}</h3>
      <div className="time-grid">
        {availableTimes.length > 0 ? (
          availableTimes.map((time, index) => (
            <Button
              key={index}
              variant={selectedTime === time ? "default" : "outline"}
              className={`time-button ${selectedTime === time ? "selected-time" : ""}`}
              onClick={() => handleTimeChange(time)}
            >
              {time}
            </Button>
          ))
        ) : (
          <p>Al parecer se acaba de ocupar el ultimo horario disponible para esta fecha. Intenta con otra fecha.</p>
        )}
      </div>
      {formData.step2 && formData.step2.time && <p>Hora seleccionada: {formData.step2.time}</p>}
    </div>
  )
}

export default Step2

