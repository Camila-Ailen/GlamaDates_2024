'use client'

import { useEffect, useState } from 'react'
import useAuthStore from "../store/useAuthStore";
import usePackageStore from "../store/usePackageStore";
import { Separator } from "@/components/ui/separator";
import useAppointmentStore from '../store/useAppointmentStore';
// import { CalendarAppointmentDialog } from './calendar-appointment-dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MultiStepForm from '@/components/multistep/MultiStepForm';
import { Package } from '../package/edit-package-dialog';



 const AppointmentCatalog = () => {
    const {
        packages,
        total: totalPackages,
        currentPage,
        pageSize,
        offset,
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


    const [availability, setAvailability] = useState<Date[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [isMultiStepFormOpen, setIsMultiStepFormOpen] = useState(false);

    const handlePackageSelect = async (pkg: Package) => {
        const offset = 1;
        const pageSize = 2000;
        const orderBy = 'id'; 
        const orderType = 'DESC'; 
        setSelectedPackage(pkg);
        const availabilityData = await fetchPackageAvailability(pkg.id, orderBy, orderType, offset, pageSize);
        if (availabilityData) {
            setAvailability(availabilityData.map(date => new Date(date))); // Actualiza las fechas disponibles
            setIsMultiStepFormOpen(true);
        }
      };

    // const handleOpenDialog = async (packageId: number, packageName: string) => {
    //     const offset = 1;
    //     const pageSize = 2000;
    //     const orderBy = 'id'; 
    //     const orderType = 'DESC'; 
    //     const availableDates = await fetchPackageAvailability(packageId, orderBy, orderType, offset, pageSize);
    //     if (availableDates) {
    //         setAvailability(availableDates.map(date => new Date(date))); // Actualiza las fechas disponibles
    //         setSelectedPackage(packageName)
    //         setIsDialogOpen(true)
    //     }
    // }

   

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
                        onClick={() => handlePackageSelect(pkg)}
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
                                <MultiStepForm
                                    availability={availability}
                                    selectedPackage={pkg}
                                    onClose={() => setIsMultiStepFormOpen(false)}
                                />
                                {/* <button
                                    className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                    onClick={() => handleOpenDialog(pkg.id, pkg.name)}
                                >
                                    Seleccionar
                                </button> */}
                                
                                    {/* <CalendarAppointmentDialog
                                        availableAppointments={appointments}
                                        availableDates={availability}
                                        services={pkg.services.map(service => service.name)}
                                        onClose={() => setIsDialogOpen(false)}
                                        packageName={selectedPackage}
                                        packageId={pkg.id}
                                    /> */}
                                
                            </CardFooter>
                        </Card>

                    </div>
                ))}
            </div>
            {/* {isMultiStepFormOpen && selectedPackage !== null && (
                <MultiStepForm
                    selectedPackage={selectedPackage}
                    availability={availability}
                    onClose={() => setIsMultiStepFormOpen(false)}
                />
            )} */}
        </div>

    );
};

export default AppointmentCatalog;
