"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useFormStore } from "@/app/store/formStore"
import { CalendarClock, CalendarDays, Clock, Percent, X } from "lucide-react"
import { Card } from "../ui/card"

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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-xl">
        <DialogHeader className="bg-gradient-to-r from-pink-50 to-purple-50 p-6">
          <DialogTitle className="text-xl font-bold text-pink-700 text-center flex items-center justify-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Recomendación de Cita
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {recommendedDate && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-3">Para su comodidad, le sugerimos la siguiente fecha y hora:</p>

                <Card className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 border-pink-100 shadow-sm">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CalendarDays className="h-5 w-5 text-pink-600" />
                    <p className="font-medium text-pink-700">
                      {recommendedDate.toLocaleString("es-AR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5 text-pink-600" />
                    <p className="font-medium text-pink-700">{recommendedTime} hs</p>
                  </div>
                </Card>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 transition-all duration-300 h-auto py-3"
                  onClick={handleAcceptFull}
                >
                  <div className="flex flex-col items-center">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-4 w-4" />
                      Aceptar Fecha y Hora
                    </span>
                    <span className="text-xs mt-1 flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      Obtener un descuento de 10% en la cita
                    </span>
                  </div>
                </Button>

                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-300 h-auto py-3"
                  onClick={handleAcceptDate}
                >
                  <div className="flex flex-col items-center">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      Aceptar Solo Fecha
                    </span>
                    <span className="text-xs mt-1 flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      Obtener un descuento de 5% en la cita
                    </span>
                  </div>
                </Button>

                <Button
                  className="w-full border-pink-200 text-pink-700 hover:bg-pink-50 h-auto py-3"
                  variant="outline"
                  onClick={onReject}
                >
                  <div className="flex flex-col items-center">
                    <span className="flex items-center gap-1">
                      <X className="h-4 w-4" />
                      Rechazar
                    </span>
                    <span className="text-xs mt-1 text-gray-500">Buscar otra fecha y hora</span>
                  </div>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

