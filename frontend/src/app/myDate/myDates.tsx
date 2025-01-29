"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import useMyDatesStore from "../store/useMyDatesStore"
import { format } from "date-fns/format"
import useAuthStore from "../store/useAuthStore"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { ViewMydateDialog } from "./view-mydate-dialog"


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


    // useEffect(() => {
    //     fetchMyDates()
    // }, [fetchMyDates])

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

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <h1 className="text-3xl font-bold text-center text-pink-700 mb-6">Mis Citas</h1>
            <div className="flex flex-wrap justify-center gap-6">
                {myDates.map((myDate) => (
                    <div key={myDate.id} className="p-6 bg-pink-100 rounded-2xl shadow-lg cursor-pointer hover:bg-pink-200 transition" style={{ minWidth: '250px', minHeight: '250px' }}>
                        <Card className="h-full flex flex-col justify-center items-center text-center">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-pink-700">
                                    <div>{format(new Date(myDate.datetimeStart), 'dd/MM/yyyy')}  </div>
                                    <div>{format(new Date(myDate.datetimeStart), 'HH:mm')}hs</div>
                                    <p className="text-pink-600"> {myDate.package.name.toUpperCase()}</p>
                                </CardTitle>
                                <CardDescription className="text-pink-500">
                                    {myDate.package.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {myDate.package && myDate.package.services && myDate.package.services.length >= 1 && (
                                    <ul className="list-disc list-inside text-pink-500">
                                        {myDate.package.services.map((service) => (
                                            <li key={service.id}>{service.name}</li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                            <CardFooter>
                                <ViewMydateDialog appointment={myDate} />
                            </CardFooter>
                        </Card>
                    </div>
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
        </div>
    )
}

// export default MyDates