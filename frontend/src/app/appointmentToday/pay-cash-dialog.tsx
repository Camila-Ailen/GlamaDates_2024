"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import type { Appointment } from "../store/useAppointmentStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertCircle, CircleDollarSign, Wallet } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CashPaymentDialogProps {
  appointment: Appointment
  isOpen: boolean
  onClose: () => void
  onSubmit: (amount: number) => void
}

const formSchema = z.object({
  amount: z.number().positive().min(0.01).max(1000000),
})

export function PayCashDialog({ appointment }) {
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: appointment.pending,
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.amount > appointment.pending) {
      setError(`El monto no puede ser mayor a ${appointment.pending}`)
      return
    }
    setError(null)
    // onSubmit(values.amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              <Label htmlFor="total" className="text-right font-medium">
                Total:
              </Label>
              <div id="total" className="col-span-3">
                ${appointment.total.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pending" className="text-right font-medium">
                Pendiente:
              </Label>
              <div id="pending" className="col-span-3 font-semibold text-amber-600">
                ${appointment.pending.toFixed(2)}
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right font-medium">Monto a pagar:</FormLabel>
                        <div className="col-span-3">
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                className="pl-7"
                                {...field}
                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <DialogFooter className="mt-6">
                  <Button type="submit" className="w-full">
                    <Wallet className="mr-2 h-4 w-4" />
                    Registrar Pago
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
