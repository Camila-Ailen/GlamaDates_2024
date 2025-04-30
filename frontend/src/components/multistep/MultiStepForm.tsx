"use client"

import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import Step1 from "./Step1"
import Step2 from "./Step2"
import Step3 from "./Step3"
import Step4 from "./Step4"
import ProgressBar from "./ProgressBar"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import "@/components/multistep/calendar-appointment-dialog.css"
import type { Package } from "@/app/store/usePackageStore"
import { toast } from "sonner"
import Step0 from "./Step0"
import { RecommendationDialog } from "./RecommendationDialog"
import { CalendarClock } from "lucide-react"

interface MultiStepFormProps {
  availability: Date[]
  selectedPackage: Package
  onClose: () => void
  onPackageSelect: () => void
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ availability, selectedPackage, onClose, onPackageSelect }) => {
  const {
    currentStep,
    setStep,
    isStepValid,
    submitForm,
    isOpen,
    openForm,
    closeForm,
    updateFormData,
    updateDiscount,
    formData,
  } = useFormStore()

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
    if (currentStep > 1 && formData.discount === null) {
      setStep(currentStep - 1)
    } else if (currentStep > 2 && formData.discount === 2) {
      setStep(currentStep - 1)
    } else {
      toast.info(
        "No puedes volver atrás si ya aceptaste una recomendación. Si deseas cambiar la fecha, vuelve a solicitar el turno, y rechaza la recomendación.",
      )
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
      .map((d) => new Date(d).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }))
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
      .map((d) => new Date(d).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }))
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
        <button className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
          <CalendarClock className="h-4 w-4" />
          <span>Reservar Cita</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md md:max-w-lg p-0 overflow-hidden bg-white rounded-xl">
        <DialogHeader className="bg-gradient-to-r from-pink-50 to-purple-50 p-6">
          <DialogTitle className="text-xl font-bold text-pink-700 text-center">
            {formData.selectedPackage?.name ? <>Reserva para {formData.selectedPackage.name}</> : <>Reserva de Cita</>}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 max-h-[90vh] overflow-y-auto pr-1">
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
                  <div className="mt-4 mb-6">{renderStep()}</div>
                  <div className="flex justify-between mt-8">
                    {currentStep < 4 && (
                      <button
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                    )}
                    {currentStep < 3 ? (
                      <button
                        onClick={handleNext}
                        disabled={!isStepValid(currentStep)}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    ) : currentStep === 3 ? (
                      <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
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
                  className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-300"
                >
                  Volver al Catálogo
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MultiStepForm

