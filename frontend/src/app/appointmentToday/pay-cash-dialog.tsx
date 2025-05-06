"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import type { Appointment } from "../store/useAppointmentStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CircleDollarSign, Loader2, Wallet } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import useAppointmentStore from "../store/useAppointmentStore"

interface CashPaymentDialogProps {
  appointment: Appointment
}

const formSchema = z.object({
  observation: z.string().optional(),
})

export function PayCashDialog({ appointment }: CashPaymentDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { fetchCashPayment, fetchTodayAppointments, fetchAppointments } = useAppointmentStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      observation: "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      await fetchCashPayment(appointment.id, values.observation || "")
      setIsSubmitting(false)
      setIsOpen(false)
      if (window.location.pathname.endsWith("/appointment")) {
        fetchAppointments()
      } else if (window.location.pathname.endsWith("/appointmentToday")) {
        fetchTodayAppointments()
      }
    } catch (error) {
      setIsSubmitting(false)
      console.error("Error al procesar el pago:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="mr-2" title="Registrar pago en efectivo">
          <Wallet className="h-4 w-4 text-amber-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <CircleDollarSign className="mr-2 h-5 w-5 text-amber-600" />
            Registrar Pago en Efectivo
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-amber-100 p-2 rounded-full mr-3">
                <Wallet className="h-5 w-5 text-amber-600" />
              </div>
              <span className="font-medium text-amber-800">Pago pendiente</span>
            </div>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              ${appointment.pending.toFixed(2)}
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
                Fecha:
              </Label>
              <div id="date" className="col-span-3">
                {format(new Date(appointment.datetimeStart), "dd/MM/yyyy HH:mm")}
              </div>
            </div>

            <h3 className="font-semibold text-sm text-muted-foreground mt-6">DETALLES DEL PAGO</h3>
            <Separator />

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="package" className="text-right font-medium">
                Paquete:
              </Label>
              <div id="package" className="col-span-3">
                {appointment.package.name}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total" className="text-right font-medium">
                Total:
              </Label>
              <div id="total" className="col-span-3 font-medium">
                ${appointment.total.toFixed(2)}
              </div>
            </div>

            {appointment.discount > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount" className="text-right font-medium">
                  Descuento:
                </Label>
                <div id="discount" className="col-span-3 text-green-600">
                  -${appointment.discount.toFixed(2)}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pending" className="text-right font-medium">
                Monto a pagar:
              </Label>
              <div id="pending" className="col-span-3 font-semibold text-amber-600">
                ${appointment.pending.toFixed(2)}
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="observation"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <FormLabel className="text-right font-medium pt-2">Observaciones:</FormLabel>
                        <div className="col-span-3">
                          <FormControl>
                            <Textarea
                              placeholder="Observaciones opcionales sobre el pago"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter className="mt-6">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-4 w-4" />
                        Registrar Pago de ${appointment.pending.toFixed(2)}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
