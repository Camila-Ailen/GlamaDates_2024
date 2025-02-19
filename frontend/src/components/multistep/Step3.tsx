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
  // const packages = usePackageStore(state => state.packages)
  // const { selectedServices, setSelectedServices } = useAppointmentStore()

  const discountMap: { [key: number]: number } = {
    1: 10,
    2: 5,
  };

  const price = selectedPackage.services.reduce((acc, service) => acc + service.price, 0)

  useEffect(() => {
    if (selectedPackage && selectedPackage.id) {
      updateFormData("step3", { packageId: selectedPackage.id })
    }
  }, [selectedPackage, updateFormData])

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    updateFormData("step3", { advance: checked })
  }

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
        <p>
          <strong>Descuento aplicado:</strong>{" "}
          {formData.discount !== null ? `$${(price * discountMap[formData.discount] / 100).toFixed(2)} - (${discountMap[formData.discount]}%)` : "Sin descuento. Acepta una recomendación al seleccionar una fecha para conseguir un descuento."}
        </p>

        <p>
          <strong>Monto a pagar:</strong>{" "}
          {formData.discount !== null ? `$${(price - (price * discountMap[formData.discount] / 100)).toFixed(2)}` : `$${price.toFixed(2)}`}
        </p>

        <div className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            id="notifications"
            checked={formData.step3.advance || false}
            onChange={handleNotificationChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label
            htmlFor="notifications"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Quiero recibir avisos para poder adelantar el turno
          </label>
        </div>

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

