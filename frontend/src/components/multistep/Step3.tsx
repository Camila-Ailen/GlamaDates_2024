import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import useAppointmentStore from "@/app/store/useAppointmentStore"
import usePackageStore from "@/app/store/usePackageStore"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"
import type { Package } from "@/app/store/usePackageStore"

interface Step3Props {
  selectedPackage: Package
}

interface Service {
  id: number
  name: string
  price: number
  duration: number
  description: string
  category: {
    id: number
    name: string
    description: string
  }
}

const Step3: React.FC<{ selectedPackage: Package }> = ({ selectedPackage }) => {
  const { formData, updateFormData } = useFormStore()
  console.log("Step3 -> formData", formData)
  // const packages = usePackageStore(state => state.packages)
  // const { selectedServices, setSelectedServices } = useAppointmentStore()

  useEffect(() => {
    if (selectedPackage && selectedPackage.id) {
      updateFormData("step3", { packageId: selectedPackage.id })
    }
  }, [selectedPackage, updateFormData])

  return (
    <div className="custom-dialog-content">
      <h2 className="custom-dialog-title">Paso 3: Confirmacion de datos para {selectedPackage.name}</h2>
      <div className="appointment-details">
        <p>
          <strong>Paquete:</strong> {selectedPackage.name}
        </p>
        <p>
          <strong>Fecha y hora del turno:</strong>{" "}
          {formData.step1.date ? formData.step1.date.toLocaleDateString("es-AR") : "Fecha no seleccionada"} a las{" "}
          {formData.step2.time || "Hora no seleccionada"}
        </p>
        <h3>Servicios:</h3>
        <ul>
          {selectedPackage &&
            Array.isArray(selectedPackage.services) &&
            selectedPackage.services.map((service, index) => (
              <Card>
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>
                    <li key={index}>
                      <ul>
                        <li>Categoria: {service.category.name}</li>
                        <li>Duración: {service.duration} minutos</li>
                        <li>Precio: ${service.price.toFixed(2)}</li>
                        <li>Descipcion: {service.description}</li>
                      </ul>
                    </li>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
        </ul>
      </div>
    </div>
  )
}

export default Step3

