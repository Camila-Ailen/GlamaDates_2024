"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import useMyDatesStore from "../store/useMyDatesStore"
import { format } from "date-fns/format"
import useAuthStore from "../store/useAuthStore"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { ViewMydateDialog } from "./view-mydate-dialog"
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog"
import RearrangeForm from "@/components/edit/rearrange"


export function MyDates() {
    // const { myDates, fetchMyDates } = useMyDatesStore()

    const {
        myDates,
        total,
        currentPage,
        pageSize,
        isLoading,
        error,
        orderBy,
        orderType,
        filter,
        fetchMyDates,
        setOrderBy,
        setOrderType,
        setFilter
    } = useMyDatesStore()

    const token = useAuthStore((state) => state.token);
    const hasPermission = useAuthStore((state) => state.hasPermission);

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [myDate, setMyDate] = useState(null)

    const handleCardClick = (date) => {
        setMyDate(date)
        setIsDialogOpen(true)
    }


    useEffect(() => {
        if (token) {
            fetchMyDates()
        }
    }, [fetchMyDates, token, orderBy, orderType, filter])

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

    if (myDates.length === 0) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4">
                <p>No tienes ninguna cita agendada</p>
            </div>
        )
    }

    const getStatusColor = (state) => {
        switch (state) {
            case "COMPLETADO":
                return "bg-green-100 hover:bg-green-200 text-green-700";
            case "INACTIVO":
            case "CANCELADO":
                return "bg-gray-100 hover:bg-gray-200 text-gray-700";
            case "MOROSO":
                return "bg-red-300 hover:bg-red-500 text-red-700";
            default:
                return "bg-pink-100 hover:bg-pink-200 text-pink-700";
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <h1 className="text-3xl font-bold text-center text-pink-700 mb-6">Mis Citas</h1>
            <div className="flex flex-wrap justify-center gap-6">
                {myDates.map((date) => (
                    <Dialog key={date.id} open={isDialogOpen && myDate.id === date.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <div
                                className={`p-6 rounded-2xl shadow-lg cursor-pointer transition flex flex-col ${getStatusColor(date.state)}`}
                                style={{ minWidth: '250px', minHeight: '250px' }}
                                onClick={() => handleCardClick(date)}>
                                <Card className="h-full flex flex-col justify-center items-center text-center">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold text-pink-700">
                                            <div>{format(new Date(date.datetimeStart), 'dd/MM/yyyy')}  </div>
                                            <div>{format(new Date(date.datetimeStart), 'HH:mm')}hs</div>
                                            <p className="text-pink-600"> {date.package.name.toUpperCase()}</p>
                                        </CardTitle>
                                        <CardDescription className="text-pink-500">
                                            {date.package.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {date.package && date.package.services && date.package.services.length >= 1 && (
                                            <ul className="list-disc list-inside text-pink-500">
                                                {date.package.services.map((service) => (
                                                    <li key={service.id}>{service.name}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </CardContent>
                                    {/* <CardFooter>
                                <ViewMydateDialog appointment={myDate} /> 
                            </CardFooter> */}
                                </Card>
                            </div>
                        </DialogTrigger>
                        {myDate && myDate.id === date.id && (
                        <ViewMydateDialog appointment={myDate} />
                        )}
                    </Dialog>
                ))}
            </div>
            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() =>
                                fetchMyDates(Math.max(currentPage - 1, 1), token || undefined)
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
                                            onClick={() => fetchMyDates(page, token || undefined)}
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

                        </>
                    ) : (
                        [...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    onClick={() => fetchMyDates(i + 1, token || undefined)}
                                    isActive={currentPage === i + 1}>
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))
                    )}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() =>
                                fetchMyDates(
                                    Math.min(currentPage + 1, totalPages),
                                    token || undefined)} />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
            <RearrangeForm />
        </div>
    )
}

// export default MyDates