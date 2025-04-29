"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Step1 from "@/components/multistep/Step1"
import Step2 from "@/components/multistep/Step2"
import ProgressBar from "@/components/multistep/ProgressBar"
import { useFormStore } from "@/app/store/formStore"
import { useEditStore } from "@/app/store/useEditStore"
import { Button } from "@/components/ui/button"
import { RecommendationDialog } from "@/components/multistep/RecommendationDialog"
import { CalendarIcon as CalendarEdit } from "lucide-react"
import { toast } from "sonner"
import useAppointmentStore from "@/app/store/useAppointmentStore"

interface EditAppointmentDialogProps {
  appointmentId: number
  packageId: number
  currentDatetime: string
}

export function EditAppointmentDialog({ appointmentId, packageId, currentDatetime }: EditAppointmentDialogProps) {
  const { isOpenEdit, closeEditDialog, rearrangeAppointment } = useEditStore()
  const { fetchPackageAvailability, fetchOneAppointment } = useAppointmentStore()
  const [availability, setAvailability] = useState<Date[]>([])
  const [loading, setLoading] = useState(false)
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [appointment, setAppointment] = useState<any>(null)

  const { currentStep, setStep, isStepValid, formData, updateFormData, updateDiscount, resetForm } = useFormStore()

  useEffect(() => {
    if (isOpenEdit) {
      resetForm()
      loadAvailability()
      loadAppointment()
    }
  }, [isOpenEdit, packageId])

  const loadAppointment = async () => {
    if (appointmentId) {
      const data = await fetchOneAppointment(appointmentId)
      if (data) {
        setAppointment(data)
      }
    }
  }

  const loadAvailability = async () => {
    setLoading(true)
    try {
      const availabilityData = await fetchPackageAvailability(packageId, "datetimeStart", "ASC", 1, 1000)
      if (availabilityData && availabilityData.length > 0) {
        const dates = availabilityData.map((dateStr) => new Date(dateStr))
        setAvailability(dates)
        setShowRecommendation(true)
      } else {
        setAvailability([])
      }
    } catch (error) {
      console.error("Error loading availability:", error)
      toast.error("No se pudo cargar la disponibilidad")
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 availableDates={availability} />
      case 2:
        return <Step2 />
      default:
        return null
    }
  }

  const handleNext = () => {
    if (currentStep < 2 && isStepValid(currentStep)) {
      setStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!formData.step1.date || !formData.step2.time) {
      toast.error("Por favor seleccione fecha y hora")
      return
    }

    // Convertir la hora seleccionada a formato de 24 horas
    const convertTo24HourFormat = (time: string) => {
      const [timePart, modifier] = time.split(" ")
      let [hours, minutes] = timePart.split(":").map(Number)

      if (modifier.replace(/\s+/g, "").trim() === "p.m." && hours < 12) {
        hours += 12
      }
      return { hours, minutes }
    }

    const date = formData.step1.date
    const time = formData.step2.time

    const { hours, minutes } = convertTo24HourFormat(time)
    const datetime = new Date(date!)
    datetime.setHours(hours)
    datetime.setMinutes(minutes)
    datetime.setSeconds(0)
    datetime.setMilliseconds(0)

    const datetimeStart = datetime.toISOString()

    try {
      await rearrangeAppointment({
        id: appointmentId,
        datetimeStart,
        datetimeOld: currentDatetime,
      })
      closeEditDialog()
      // Recargar la página para ver los cambios
      window.location.reload()
    } catch (error) {
      console.error("Error al editar el turno:", error)
      toast.error("No se pudo editar el turno. Intente nuevamente.")
    }
  }

  const handleAcceptFullRecommendation = (date: Date, time: string) => {
    updateDiscount(1)
    const times = availability
      .filter((d) => new Date(d).toDateString() === date.toDateString())
      .map((d) => new Date(d).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }))
    updateFormData("step1", { date, availableTimes: times })
    updateFormData("step2", { time })
    setShowRecommendation(false)
    setStep(2)
  }

  const handleAcceptDateRecommendation = (date: Date) => {
    updateDiscount(2)
    const times = availability
      .filter((d) => new Date(d).toDateString() === date.toDateString())
      .map((d) => new Date(d).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }))
    updateFormData("step1", { date, availableTimes: times })
    setShowRecommendation(false)
    setStep(2)
  }

  const handleRejectRecommendation = () => {
    updateDiscount(null)
    setShowRecommendation(false)
    setStep(1)
  }

  return (
    <Dialog open={isOpenEdit} onOpenChange={(open) => !open && closeEditDialog()}>
      <DialogContent className="sm:max-w-md md:max-w-lg p-0 overflow-hidden bg-white rounded-xl">
        <DialogHeader className="bg-gradient-to-r from-pink-50 to-purple-50 p-6">
          <DialogTitle className="text-xl font-bold text-pink-700 text-center flex items-center justify-center gap-2">
            <CalendarEdit className="h-5 w-5" />
            Editar Fecha y Hora del Turno
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
          ) : availability.length > 0 ? (
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
                  <div className="mt-4 mb-6">{renderStep()}</div>
                  <div className="flex justify-between mt-8">
                    {currentStep > 1 && (
                      <Button
                        onClick={handlePrevious}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors"
                      >
                        Anterior
                      </Button>
                    )}
                    {currentStep < 2 ? (
                      <Button
                        onClick={handleNext}
                        disabled={!isStepValid(currentStep)}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
                      >
                        Confirmar Cambio
                      </Button>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-600 mb-4">No hay horarios disponibles para este servicio.</p>
              <Button onClick={closeEditDialog} className="bg-pink-600 hover:bg-pink-700">
                Volver
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
