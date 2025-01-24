import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import { Calendar } from "react-calendar"
import 'react-calendar/dist/Calendar.css'

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
    <div>
      <h2 className="text-2xl font-bold mb-4">Paquete: {selectedPackage.name} </h2>
      <h3 className="text-2xl font-bold mb-4">Seleccione la fecha</h3>
      <Calendar
        // onChange={handleDateChange}
        tileClassName={tileClassName}
        locale="es-AR"
        className="custom-calendar"
      />
    </div>
  )
}

export default Step1

