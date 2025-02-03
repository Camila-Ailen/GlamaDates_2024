import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ViewMydateDialog({ _package }) {

    return ( 
        <DialogContent>
            <DialogHeader>
                <DialogTitle>PAQUETE NUMERO <strong>{_package.id}</strong></DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center">
                <div className="max-w-md mx-auto mt- p-6 flex justify-between bg-white rounded-lg shadow-xl" >
                    <div className="custom-dialog-content">
                        <div className="appointment-details">
                            <p><strong>Paquete:</strong> {_package.name.toUpperCase()}</p>
                            <p>{_package.description}</p>
                            <p><strong>Servicios:</strong></p>
                            <ul>
                                {_package &&
                                    Array.isArray(_package.services) &&
                                    _package.services.map((service, index) => (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>{service.name}</CardTitle>
                                                <CardDescription>
                                                    <li key={index}>
                                                        <ul>
                                                            <li>Categoria: {service.category.name}</li>
                                                            <li>Precio: {service.price.toFixed(2)}</li>
                                                            <li>Duracion: {service.duration} minutos</li>
                                                            <li>Descripcion: {service.description}</li>
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

