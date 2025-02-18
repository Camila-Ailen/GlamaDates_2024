"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useFormStore } from "@/app/store/formStore"

interface RecommendationDialogProps {
  isOpen: boolean
  onClose: () => void
  availability: Date[]
  onAcceptFull: (date: Date, time: string) => void
  onAcceptDate: (date: Date) => void
  onReject: () => void
}

export function RecommendationDialog({
  isOpen,
  onClose,
  availability,
  onAcceptFull,
  onAcceptDate,
  onReject,
}: RecommendationDialogProps) {
  const [recommendedDate, setRecommendedDate] = useState<Date | null>(null)
  const [recommendedTime, setRecommendedTime] = useState<string>("")
  const { updateFormData } = useFormStore()

  useEffect(() => {
    if (availability.length > 0) {
      const nextAvailable = availability[0]
      setRecommendedDate(nextAvailable)
      setRecommendedTime(new Date(nextAvailable).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }))
    }
  }, [availability])

  const handleAcceptFull = () => {
    if (recommendedDate) {
      const times = availability
        .filter((d) => new Date(d).toDateString() === recommendedDate.toDateString())
        .map((d) => new Date(d).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }))
      updateFormData("step1", { date: recommendedDate })
      updateFormData("step2", { time: recommendedTime })
      onAcceptFull(recommendedDate, recommendedTime)
    }
  }

  const handleAcceptDate = () => {
    if (recommendedDate) {
      const times = availability
        .filter((d) => new Date(d).toDateString() === recommendedDate.toDateString())
        .map((d) => new Date(d).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }))
      updateFormData("step1", { date: recommendedDate, availableTimes: times })
      onAcceptDate(recommendedDate)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle className="text-center">Recomendación de Cita</DialogTitle>
        </DialogHeader>
        {recommendedDate && (
          <div>
            <p>Te sugerimos la siguiente fecha y hora:</p>
            <p className="font-bold">
              {recommendedDate.toLocaleString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })} a las {recommendedTime}
            </p>
          </div>
        )}
        <DialogFooter className="!flex flex-col space-y-2 sm:!flex-col">
          <Button className="w-full" onClick={handleAcceptFull}>
            <div>
              <span>Aceptar Fecha y Hora</span> <br />
              <span className="text-sm">Y obtener un descuento de 10% en la cita</span>
            </div>
          </Button>
          <Button className="w-full" onClick={handleAcceptDate}>
            <div>
              <span>Aceptar Solo Fecha</span> <br />
              <span className="text-sm">Y obtener un descuento de 5% en la cita</span>
            </div>
          </Button>
          <Button className="w-full" variant="outline" onClick={onReject}>
            <div>
              <span>Rechazar</span> <br />
              <span className="text-sm">Y buscar otra fecha</span>
            </div>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}