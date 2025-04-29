"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, X } from "lucide-react"

interface CancelConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  appointmentDate: string
}

export function CancelConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  appointmentDate,
}: CancelConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
      // La recarga de la página se maneja en el componente padre
    } catch (error) {
      console.error("Error al cancelar la cita:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-xl">
        <DialogHeader className="bg-gradient-to-r from-red-50 to-orange-50 p-6">
          <DialogTitle className="text-xl font-bold text-red-700 text-center flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Cancelación
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <DialogDescription className="text-center mb-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-red-100 rounded-full p-4">
                <Calendar className="h-10 w-10 text-red-600" />
              </div>
              <p className="text-gray-700 text-base">
                ¿Estás seguro de que deseas cancelar esta cita programada para el{" "}
                <span className="font-medium text-red-700">{appointmentDate}</span>?
              </p>
              <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
            </div>
          </DialogDescription>

          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelando...
                </div>
              ) : (
                "Sí, cancelar cita"
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              No, mantener cita
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
