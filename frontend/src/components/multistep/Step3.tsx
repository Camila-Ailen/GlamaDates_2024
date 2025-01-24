import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import useAppointmentStore from "@/app/store/useAppointmentStore"
import usePackageStore from "@/app/store/usePackageStore"
import Package from "@/app/store/usePackageStore"

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: {
    id: number;
    name: string;
    description: string;
  };
}

interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  services: Service[];
}

interface Step3Props {
  selectedPackage: Package;
}

const Step3: React.FC<{ selectedPackage: Package }> = ({ selectedPackage }) => {
  console.log('Paquete seleccionado:', selectedPackage);
  const { formData, updateFormData } = useFormStore()
  const { selectedServices, setSelectedServices } = useAppointmentStore()

  // const selectedPackage = usePackageStore(state => state.selectedPackage)
  const selectedDate = formData.step1.date
  const selectedTime = formData.step2.time
  const packages = usePackageStore(state => state.packages)
  // const { selectedPackage } = props

  // const handleInterestChange = (interest: string) => {
  //   const updatedInterests = formData.step3.interests.includes(interest)
  //     ? formData.step3.interests.filter((i: string) => i !== interest)
  //     : [...formData.step3.interests, interest]
  //   updateFormData("step3", { interests: updatedInterests })
  // }

  useEffect(() => {
      if (selectedPackage && selectedPackage.id) {
        const selectedPkg = packages.find(pkg => pkg.id === selectedPackage.id);
        if (selectedPkg) {
          console.log('Setting selected services from package:', selectedPkg.services);
          setSelectedServices(Array.isArray(selectedPkg.services) ? selectedPkg.services : []);
        }
      }
    }, [selectedPackage?.id, packages, setSelectedServices]);

  // const handleCreateTurn = () => {
  //   const datetimeStart = selectedDate.toISOString()
  //   const packageId = selectedPackage.id
  // }

  return (
    <div className="custom-dialog-content">
      <h2 className="custom-dialog-title">Paso 3: Confirmacion de datos</h2>
      <div className="appointment-details">
        
        {selectedPackage && <p><strong>Paquete:</strong> {selectedPackage.name}</p>}
        <p><strong>Fecha y hora del turno:</strong> {selectedDate?.toLocaleDateString('es-AR')} a las {selectedTime}</p>
        <h3>Servicios:</h3>
        <ul>
          {selectedPackage && Array.isArray(selectedPackage.services) && selectedPackage.services.map((service, index) => (
            <li key={index}>
              {service.name} - Duración: {service.duration} minutos - Precio: ${service.price.toFixed(2)} - Categoria {service.category.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Step3

