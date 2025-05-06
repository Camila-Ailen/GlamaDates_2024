"use client"

import { format } from "date-fns"
import type { Appointment } from "../store/useAppointmentStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, CreditCard, Receipt, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

interface PaymentDetailsDialogProps {
  appointment: Appointment
  isOpen: boolean
  onClose: () => void
}

export function ViewCashDialog({ appointment }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="mr-2" title="Ver detalles de pago">
          <Receipt className="h-4 w-4 text-green-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Check className="mr-2 h-5 w-5 text-green-600" />
            Detalles del Pago Completado
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-medium text-green-800">Pago completado</span>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              ${appointment.total.toFixed(2)}
            </Badge>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">INFORMACIÓN DEL CLIENTE</h3>
            <Separator />

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right font-medium">
                Cliente:
              </Label>
              <div id="client" className="col-span-3 font-semibold">
                {appointment.client.firstName} {appointment.client.lastName}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right font-medium">
                Fecha de cita:
              </Label>
              <div id="date" className="col-span-3">
                {format(new Date(appointment.datetimeStart), "dd/MM/yyyy HH:mm")}
              </div>
            </div>

            <h3 className="font-semibold text-sm text-muted-foreground mt-6">DETALLES DEL PAGO</h3>
            <Separator />

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentType" className="text-right font-medium">
                Tipo de pago:
              </Label>
              <div id="paymentType" className="col-span-3 flex items-center">
                {appointment.payments[0].paymentMethod === "MERCADOPAGO" ? (
                  <>
                    <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                    <span>MercadoPago</span>
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2 text-amber-600" />
                    <span>Efectivo</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentDate" className="text-right font-medium">
                Fecha de pago:
              </Label>
              <div id="paymentDate" className="col-span-3">
                {format(new Date(appointment.payments[0].datetime), "dd/MM/yyyy HH:mm")}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="package" className="text-right font-medium">
                Paquete:
              </Label>
              <div id="package" className="col-span-3">
                {appointment.package.name}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="precio" className="text-right font-medium">
                Precio:
              </Label>
              <div id="precio" className="col-span-3 font-semibold text-green-600">
                ${appointment.total.toFixed(2)}
              </div>
            </div>

           
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount" className="text-right font-medium">
                  Descuento:
                </Label>
                <div id="discount" className="col-span-3 text-green-600">
                  -${appointment.discount.toFixed(2)}
                </div>
              </div>
           

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total" className="text-right font-medium">
                Total Pagado:
              </Label>
              <div id="total" className="col-span-3 font-semibold text-green-600">
                ${(appointment.total - appointment.discount).toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="services" className="text-right font-medium pt-1">
                Servicios:
              </Label>
              <div id="services" className="col-span-3">
                {appointment.details && appointment.details.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {appointment.details.map((detail, index) => (
                      <li key={index}>{detail.service.name}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground italic">No hay servicios disponibles</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="observations" className="text-right font-medium pt-1">
                Observaciones:
              </Label>
              <div id="observations" className="col-span-3">
                {appointment.state ? (
                  <Card className="bg-muted/50">
                    <CardContent className="p-3 text-sm">{appointment.payments[0].observation}</CardContent>
                  </Card>
                ) : (
                  <span className="text-muted-foreground italic">No hay observaciones</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
