'use client'

import { useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
// import { EditPackageDialog } from './edit-package-dialog'
// import { DeletePackageDialog } from './delete-package-dialog'
import useAppointmentStore from '../store/useAppointmentStore'
import { ArrowUpDown, View } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { CreatePackageDialog } from './create-package-dialog'
import useAuthStore from '../store/useAuthStore'
import { ViewAppointmentDialog } from '../appointment/view-appointment-dialog'
import { PayCashDialog } from './pay-cash-dialog'
import { ViewCashDialog } from './view-cash-dialog'

export function AppointmentsTodayTable() {
    const {
        appointments,
        total,
        currentPage,
        pageSize,
        isLoading,
        error,
        orderBy,
        orderType,
        filter,
        fetchTodayAppointments,
        setOrderBy,
        setOrderType,
        setFilter
    } = useAppointmentStore()

    const token = useAuthStore((state) => state.token);
    const hasPermission = useAuthStore((state) => state.hasPermission);


    useEffect(() => {
        if (token) {
            fetchTodayAppointments()
        }
    }, [fetchTodayAppointments, token, orderBy, orderType, filter])

    if (isLoading) return <div>Cargando...</div>
    if (error) return <div>Ocurrió un error: {error}</div>

    const totalPages = Math.ceil(total / pageSize)

    const handleSort = (field: string) => {
        if (field === orderBy) {
            setOrderType(orderType === 'ASC' ? 'DESC' : 'ASC')
        } else {
            setOrderBy(field)
            setOrderType('ASC')
        }
    }

    return (
        <div>
            <Card>
                <CardHeader className="flex-row justify-between">
                    <div>
                        <CardTitle>Citas para hoy {format(new Date(), "EEEE d 'de' MMMM 'del' yyyy", { locale: es })}</CardTitle>
                        <CardDescription>Ver y actualizar citas de la plataforma</CardDescription>
                    </div>
                    <div className="flex flex-row">

                        <Input
                            placeholder="Filtrar citas"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="max-w-sm"
                        />

                        {/* {hasPermission('create:packages') && <CreatePackageDialog />} */}

                    </div>

                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    onClick={() => handleSort("id")}
                                    className="cursor-pointer"
                                >
                                    ID <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>

                                <TableHead
                                    onClick={() => handleSort("appointment.client.firstName")}
                                    className="cursor-pointer"
                                >
                                    Cliente <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>

                                <TableHead
                                    onClick={() => handleSort("package.name")}
                                    className="cursor-pointer"
                                >
                                    Paquete <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>

                                {/* <TableHead
                                    onClick={() => handleSort("datetimeStart")}
                                    className="cursor-pointer"
                                >
                                    Fecha <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead> */}

                                <TableHead
                                    onClick={() => handleSort("datetimeStart")}
                                    className="cursor-pointer"
                                >
                                    Hora Inicio <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>

                                {/* <TableHead
                                    onClick={() => handleSort("datetimeEnd")}
                                    className="cursor-pointer"
                                >
                                    Hora Fin <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead> */}

                                <TableHead
                                    onClick={() => handleSort("state")}
                                    className="cursor-pointer"
                                >
                                    Estado <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>

                                 <TableHead
                                    onClick={() => handleSort("price")}
                                    className="cursor-pointer"
                                >
                                    Precio <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>

                                <TableHead
                                    onClick={() => handleSort("pending")}
                                    className="cursor-pointer"
                                >
                                    Pago <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>

                                

                               
                                {/* <TableHead
                  onClick={() => handleSort("category")}
                  className="cursor-pointer"
                >
                  Servicios <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead> */}
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments.map((appointment) => (
                                <TableRow key={appointment.id}>
                                    
                                    <TableCell>{appointment.id}</TableCell>
                                    <TableCell>{appointment.client.firstName.toUpperCase()} {appointment.client.lastName.toUpperCase()}</TableCell>
                                    <TableCell>{appointment.package.name.toUpperCase()}</TableCell>
                                    {/* <TableCell>{format(new Date(appointment.datetimeStart), 'dd/MM/yyyy')}</TableCell> */}
                                    <TableCell>{new Date(appointment.datetimeStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                    {/* <TableCell>{new Date(appointment.datetimeEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell> */}
                                    <TableCell>{appointment.state}</TableCell>
                                    <TableCell>{appointment.total}</TableCell>
                                    <TableCell>{appointment.pending > 0 ? (
                                             <span className="text-red-600 font-bold">PENDIENTE</span>
                                        ) : (
                                            <span className="text-green-600 font-bold">COMPLETADO</span>
                                    )}
                                    </TableCell>
                                    <TableCell>{appointment.pending > 0 ? (
                                        <PayCashDialog appointment={appointment} />
                                    ) : (
                                        <ViewCashDialog appointment={appointment} />
                                    )}
                                        {hasPermission("read:appointments") && (
                                            <ViewAppointmentDialog appointment={appointment} />
                                        )}
                                        {/* {hasPermission("update:appointments") && (
                        <EditPackageDialog pkg={appointment.package} />
                      )}
                      {hasPermission("delete:appointments") && (
                        <DeletePackageDialog packageId={appointment.package.id} />
                      )} */}
                                    </TableCell>
                                </TableRow>
                            ))

                            }


                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Pagination className="mt-4">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() =>
                                        fetchTodayAppointments(Math.max(currentPage - 1, 1), token || undefined)
                                    }
                                />
                            </PaginationItem>
                            {totalPages > 6 ? (
                                <>
                                    <PaginationItem></PaginationItem>
                                    {currentPage > 3 && (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )}
                                    {[...Array(totalPages)]
                                        .map((_, i) => i + 1)
                                        .filter(
                                            (page) => 
                                                page === 1 || 
                                                page === totalPages || 
                                                (page >= currentPage - 2 && page <= currentPage + 2))
                                        .map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink 
                                                    onClick={() => fetchTodayAppointments(page, token || undefined)} 
                                                    isActive={currentPage === page}>
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                    {currentPage < totalPages - 2 && (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )}
                                    {/* <PaginationItem>
                <PaginationLink onClick={() => fetchUsers(totalPages)} isActive={currentPage === totalPages}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem> */}
                                </>
                            ) : (
                                [...Array(totalPages)].map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink 
                                            onClick={() => fetchTodayAppointments(i + 1, token || undefined)} 
                                            isActive={currentPage === i + 1}>
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))
                            )}
                            <PaginationItem>
                                <PaginationNext 
                                    onClick={() => 
                                        fetchTodayAppointments(
                                            Math.min(currentPage + 1, totalPages), 
                                            token || undefined)} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </CardFooter>
            </Card>

        </div>
    )
}
