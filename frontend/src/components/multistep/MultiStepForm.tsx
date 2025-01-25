import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import Step1 from "./Step1"
import Step2 from "./Step2"
import Step3 from "./Step3"
import ProgressBar from "./ProgressBar"
import { toast } from "sonner"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import "@/components/multistep/calendar-appointment-dialog.css"

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

interface MultiStepFormProps {
  availability: Date[];
  selectedPackage: Package;
  onClose: () => void;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ availability, selectedPackage, onClose }) => {
  
  const { currentStep, setStep, isStepValid, submitForm } = useFormStore()
  const [isOpen, setIsOpen] = useState(false)


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 availableDates={availability} selectedPackage={selectedPackage} />
      case 2:
        return <Step2 />
      case 3:
        return <Step3 selectedPackage={selectedPackage} />
      default:
        return null
    }
  }

  const handleNext = () => {
    if (currentStep < 3 && isStepValid(currentStep)) {
      setStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (isStepValid(3)) {
      await submitForm()
      toast.success("Reserva confirmada con éxito")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark" onClick={() => setIsOpen(true)}>Seleccionar Paquete</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="custom-dialog-title">Formulario de Reserva para {selectedPackage.name.toUpperCase()}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
            <ProgressBar currentStep={currentStep} totalSteps={3} />
            {renderStep()}
            <div className="mt-6 flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
              >
                Anterior
              </button>
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  // disabled={!isStepValid(currentStep)}
                  className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
                >
                  Confirmar
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MultiStepForm

