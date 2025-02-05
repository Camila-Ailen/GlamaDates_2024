import { format, set } from "date-fns"
import type { Appointment } from "../store/useAppointmentStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label" // Import the Label component
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, FileClock } from "lucide-react"

interface PaymentDetailsDialogProps {
    appointment: Appointment
    isOpen: boolean
    onClose: () => void
}

export function ViewCashDialog({ appointment }) {
    const [isOpen, setIsOpen] = useState(false)

    // Verificar el objeto appointment
    useEffect(() => {
        console.log('Appointment desde ViewCashDialog:', appointment);
    }, [appointment]);
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="mr-2"><FileClock /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Detalles del Pago</DialogTitle>
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
                            Total Pagado:
                        </Label>
                        <div id="total" className="col-span-3">
                            ${appointment.total.toFixed(2)}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="services" className="text-right">
                            Servicios:
                        </Label>
                        {/* <div id="services" className="col-span-3">
                            {appointment.package.services.map((service: { name: string }) => service.name).join(", ")}
                        </div> */}
                        <div id="services" className="col-span-3">
                            {appointment.details && appointment.details.length > 0
                                ? appointment.details.map(detail => detail.service.name).join(", ")
                                : "No hay servicios disponibles"}
                        </div>
                        {/* <p>{appointment}</p> */}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

