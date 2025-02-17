import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import Step1 from "./Step1"
import Step2 from "./Step2"
import Step3 from "./Step3"
import Step4 from "./Step4"
import ProgressBar from "./ProgressBar"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import "@/components/multistep/calendar-appointment-dialog.css"
import type { Package } from "@/app/store/usePackageStore"
import { toast } from "sonner"
import Step0 from "./Step0"
import { RecommendationDialog } from "./RecommendationDialog"
import { format } from "date-fns/format"
import { es } from "date-fns/locale/es"

interface MultiStepFormProps {
  availability: Date[]
  selectedPackage: Package
  onClose: () => void
  onPackageSelect: () => void
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ availability, selectedPackage, onClose, onPackageSelect }) => {
  const { currentStep, setStep, isStepValid, submitForm, isOpen, openForm, closeForm, updateFormData, updateDiscount, formData } =
    useFormStore()
  const [showRecommendation, setShowRecommendation] = useState(false)


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 availableDates={availability} />
      case 2:
        return <Step2 />
      case 3:
        return formData.selectedPackage ? <Step3 selectedPackage={formData.selectedPackage} /> : null
      case 4:
        return <Step4 />
      default:
        return null
    }
  }

  const handleNext = () => {
    if (currentStep < 4 && isStepValid(currentStep)) {
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
      setStep(currentStep + 1)
    }
  }

  const handleCancel = async () => {
    closeForm()
    onClose()
  }

  const handleOpenForm = () => {
    onPackageSelect()
    setShowRecommendation(true)
    openForm()
  }

  const handleAcceptFullRecommendation = (date: Date, time: string) => {
    updateDiscount(1)
    const times = availability
      .filter((d) => new Date(d).toDateString() === date.toDateString())
      .map((d) => format(d, "h:mm a", { locale: es }))
    updateFormData("step1", { date, availableTimes: times })
    updateFormData("step2", { time })
    setShowRecommendation(false)
    setStep(3)
    openForm()
  }

  const handleAcceptDateRecommendation = (date: Date) => {
    updateDiscount(2)
    const times = availability
      .filter((d) => new Date(d).toDateString() === date.toDateString())
      .map((d) => format(d, "h:mm a", { locale: es }))
    updateFormData("step1", { date, availableTimes: times })
    setShowRecommendation(false)
    setStep(2)
    openForm()
  }

  const handleRejectRecommendation = () => {
    updateDiscount(null)
    setShowRecommendation(false)
    setStep(1)
    openForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? handleOpenForm() : closeForm())}>
      <DialogTrigger asChild>
        <button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
          Seleccionar Paquete
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="custom-dialog-title">
            Formulario de Reserva para {formData.selectedPackage?.name.toUpperCase()}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
            {availability.length > 0 ? (
              <>
                {showRecommendation ? (
                  <RecommendationDialog
                    isOpen={showRecommendation}
                    onClose={() => setShowRecommendation(false)}
                    availability={availability}
                    onAcceptFull={handleAcceptFullRecommendation}
                    onAcceptDate={handleAcceptDateRecommendation}
                    onReject={handleRejectRecommendation}
                  />
                ) : (
                  <>
                    <ProgressBar currentStep={currentStep} totalSteps={4} />
                    {renderStep()}
                    <div className="mt-6 flex justify-between">
                      {currentStep < 4 && (
                        <button
                          onClick={handlePrevious}
                          disabled={currentStep === 1}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                        >
                          Anterior
                        </button>
                      )}
                      {currentStep < 3 ? (
                        <button
                          onClick={handleNext}
                          disabled={!isStepValid(currentStep)}
                          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                        >
                          Siguiente
                        </button>
                      ) : currentStep === 3 ? (
                        <button
                          onClick={handleSubmit}
                          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
                        >
                          Confirmar
                        </button>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <Step0 />
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleCancel}
                    className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    Volver al Catalogo
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MultiStepForm