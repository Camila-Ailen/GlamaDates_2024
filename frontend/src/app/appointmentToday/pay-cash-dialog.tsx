import { useEffect, useState } from "react"
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
import { Activity, AirVent, AlarmSmoke, CircleDollarSign, Eye, EyeOff, Wallet } from "lucide-react"

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

    // Verificar el objeto appointment
    useEffect(() => {
    }, [appointment]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="mr-2"><Wallet /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Pago en Efectivo</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="client" className="text-right">
                            Cliente:
                        </Label>
                        <div id="client" className="col-span-3">
                            {appointment.client.firstName} {appointment.client.lastName}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Fecha:
                        </Label>
                        <div id="date" className="col-span-3">
                            {format(appointment.datetimeStart, "dd/MM/yyyy HH:mm")}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="total" className="text-right">
                            Total:
                        </Label>
                        <div id="total" className="col-span-3">
                            ${appointment.total.toFixed(2)}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pending" className="text-right">
                            Pendiente:
                        </Label>
                        <div id="pending" className="col-span-3">
                            ${appointment.pending.toFixed(2)}
                        </div>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto a pagar</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {error && <div className="text-red-500">{error}</div>}
                            <DialogFooter>
                                <Button type="submit">Registrar Pago</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}

