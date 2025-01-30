'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useAppointmentStore from '../store/useAppointmentStore'
import { Eye, UserPen, View } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns/format'
import { User } from '../store/useUserStore'
// import { DetailsAppointment } from '../store/useAppointmentStore'

export function ViewMydateDialog({ appointment }) {
    // const [isOpen, setIsOpen] = useState(false)


    return (

        <DialogContent>
            <DialogHeader>
                <DialogTitle>CITA NUMERO <strong>{appointment.id},</strong> {format(new Date(appointment.datetimeStart), 'dd/MM/yyyy')} a las {format(new Date(appointment.datetimeStart), 'HH:mm')}hs</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center">
                <div className="max-w-md mx-auto mt- p-6 flex justify-between bg-white rounded-lg shadow-xl" >
                    <div className="custom-dialog-content">
                        <div className="appointment-details">
                            <p><strong>Paquete:</strong> {appointment.package.name.toUpperCase()}</p>
                            {/* <p><strong>Cliente:</strong> {appointment.client.firstName.toUpperCase()} {appointment.client.lastName.toUpperCase()}</p> */}
                            <p><strong>Fecha:</strong> {format(new Date(appointment.datetimeStart), 'dd/MM/yyyy')}</p>
                            <p><strong>Hora:</strong> {format(new Date(appointment.datetimeStart), 'HH:mm')}hs</p>
                            <p><strong>Estado:</strong> {appointment.state}</p>
                            <p><strong>Servicios:</strong></p>
                            <ul>
                                {appointment &&
                                    Array.isArray(appointment.details) &&
                                    appointment.details.map((detail, index) => (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>{detail.service.name}</CardTitle>

                                                <CardDescription>
                                                    <li key={index}>
                                                        <ul>
                                                            <li><strong>{detail.service.name}</strong></li>
                                                            {/* <li>Categoria: {detail.service.category.name}</li> */}
                                                            <li>Precio: {detail.service.price.toFixed(2)}</li>
                                                            <li>Inicio: {format(new Date(detail.datetimeStart), 'HH:mm')}hs</li>
                                                            <li>Duracion: {detail.service.duration} minutos</li>
                                                            <li>Descripcion: {detail.service.description}</li>
                                                            <li>Empleado: {detail.employee.firstName} {detail.employee.lastName}</li>
                                                            <li>Estacion de trabajo: {detail.workstation.id}, {detail.workstation.description}</li>
                                                        </ul>
                                                    </li>
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </DialogContent>
    )

}

