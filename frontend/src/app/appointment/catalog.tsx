'use client'

import { useEffect, useState } from 'react'
import useAuthStore from "../store/useAuthStore";
import usePackageStore from "../store/usePackageStore";
import { Separator } from "@/components/ui/separator";
import useAppointmentStore from '../store/useAppointmentStore';
import { CalendarAppointmentDialog } from './calendar-appointment-dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function AppointmentCatalog() {
    const {
        packages,
        total: totalPackages,
        currentPage,
        pageSize,
        isLoading: isLoadingPackage,
        error: errorPackage,
        orderBy,
        orderType,
        filter,
        setOrderType,
        setOrderBy,
        fetchPackage,

    } = usePackageStore();

    const {
        appointments,
        total,
        currentPage: currentPageAppointments,
        pageSize: pageSizeAppointments,
        isLoading: isLoadingAppointments,
        error: errorAppointments,
        fetchPackageAvailability
    } = useAppointmentStore();


    const [availability, setAvailability] = useState<string[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSelectPackage = async (packageId: number) => {
        const availableDates = await fetchPackageAvailability(packageId);
        console.log("availableDates: ", availableDates);
        if (availableDates) {
            setAvailability(availableDates); // Actualiza las fechas disponibles
        }
    };

    const token = useAuthStore((state) => state.token);
    const hasPermission = useAuthStore((state) => state.hasPermission);

    useEffect(() => {
        fetchPackage()
    }, [fetchPackage, orderBy, orderType, filter])

    // Renderización del componente
    if (isLoadingPackage || isLoadingAppointments) return <div>Cargando...</div>;
    if (errorPackage || errorAppointments)
        return <div>Ocurrió un error: {errorPackage || errorAppointments}</div>;

    const totalPages = Math.ceil(total / pageSize);

    const handleSort = (field: string) => {
        if (field === orderBy) {
            setOrderType(orderType === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setOrderBy(field);
        }
    };

    return (

        <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-5">
                {packages.map((pkg) => (
                    <div
                        key={pkg.id}
                        className="p-4 bg-muted/50 rounded-xl shadow-lg cursor-pointer hover:bg-muted transition"
                    >

                        <Card>
                            <CardHeader>
                                <CardTitle>{pkg.name}</CardTitle>
                                <CardDescription> {pkg.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>${pkg.price.toFixed(2)}</p>
                                <p>{pkg.duration} minutos</p>
                            </CardContent>
                            <CardFooter>
                                <button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark" onClick={() => setIsDialogOpen(true)}>Ver Paquete</button>
                            </CardFooter>
                            <CardFooter>
                            <button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark" onClick={() => setIsDialogOpen(true)}>Seleccionar</button>
                            </CardFooter>
                        </Card>

                    </div>
                ))}
            </div>
        </div>

    );
}
