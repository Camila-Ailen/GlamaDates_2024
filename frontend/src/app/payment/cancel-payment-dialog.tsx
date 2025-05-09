"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Ban, Loader2 } from "lucide-react"
import useAuthStore from "../store/useAuthStore"
import { usePaymentStore } from "../store/usePaymentStore"

interface Payment {
  id: number
  appointmentId: number
  datetime: Date
  amount: number
  paymentMethod: string
  paymentType: string
  status: string
  observation: string
  transactionId: string
  paymentURL: string
  created_at: Date
  updated_at: Date
}

interface CancelPaymentDialogProps {
  payment: Payment
  onCancel: () => void
}

export function CancelPaymentDialog({ payment, onCancel }: CancelPaymentDialogProps) {
    const { cancelPayment } = usePaymentStore()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [reason, setReason] = useState("")
  const token = useAuthStore((state) => state.token)

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error("Por favor, ingresa un motivo para la cancelación")
      return
    }

    setIsLoading(true)
    try {
      await cancelPayment(payment.id, reason)

      toast.success("Pago cancelado correctamente")
      setOpen(false)

      // Asegurarse de que la actualización ocurra después de que el diálogo se cierre
      setTimeout(() => {
        onCancel()
      }, 100)
    } catch (error) {
      toast.error((error as Error).message || "Error al cancelar el pago")
    } finally {
      setIsLoading(false)
    }
  }

  const closeDialog = () => {
    setReason("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Ban className="h-4 w-4 text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancelar Pago</DialogTitle>
          <DialogDescription>
            Estás a punto de cancelar el pago #{payment.id} por ${payment.amount.toFixed(2)}. Esta acción no se puede
            deshacer.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Detalles del pago:</h4>
            <div className="text-sm">
              <p>
                <span className="font-medium">ID Transacción:</span> {payment.transactionId || "N/A"}
              </p>
              <p>
                <span className="font-medium">Método:</span> {payment.paymentMethod}
              </p>
              <p>
                <span className="font-medium">Fecha:</span> {new Date(payment.datetime).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">ID Cita:</span> {payment.appointmentId}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Motivo de cancelación
            </label>
            <Textarea
              id="reason"
              placeholder="Ingresa el motivo de la cancelación"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Confirmar Cancelación"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
