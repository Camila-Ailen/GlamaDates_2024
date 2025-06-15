"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
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
import useAppointmentStore from "../store/useAppointmentStore"
import { ArrowDown, ArrowUp, ArrowUpDown, CalendarDays, Search, SlidersHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import useAuthStore from "../store/useAuthStore"
import { ViewAppointmentDialog } from "./view-appointment-dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PayCashDialog } from "../appointmentToday/pay-cash-dialog"
import { ViewCashDialog } from "../appointmentToday/view-cash-dialog"
import { Separator } from "@/components/ui/separator"
import { DatePicker } from "./date-picker"
import { EditAppointmentDialogAdmin } from "./edit-appointment-dialog-admin"

export function AppointmentsTable() {
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
    fetchAppointments,
    setOrderBy,
    setOrderType,
    setFilter,
  } = useAppointmentStore()

  const token = useAuthStore((state) => state.token)
  const hasPermission = useAuthStore((state) => state.hasPermission)

  // Estados locales para filtros
  const [filteredAppointments, setFilteredAppointments] = useState(appointments)
  const [localFilter, setLocalFilter] = useState(filter)
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (token) {
      fetchAppointments()
    }
  }, [fetchAppointments, token, orderBy, orderType, filter])

  // Aplicar filtros locales
  useEffect(() => {
    let result = [...appointments]

    // Filtro de texto
    if (localFilter) {
      const searchTerm = localFilter.toLowerCase()
      result = result.filter(
        (appointment) =>
          appointment.client.firstName.toLowerCase().includes(searchTerm) ||
          appointment.client.lastName.toLowerCase().includes(searchTerm) ||
          appointment.package.name.toLowerCase().includes(searchTerm) ||
          appointment.state.toLowerCase().includes(searchTerm) ||
          appointment.id.toString().includes(searchTerm),
      )
    }

    // Filtro de estado de cita
    if (appointmentStatusFilter !== "all") {
      result = result.filter((appointment) => appointment.state === appointmentStatusFilter)
    }

    // Filtro de estado de pago
    if (paymentStatusFilter !== "all") {
      if (paymentStatusFilter === "pending") {
        result = result.filter((appointment) => appointment.pending > 0)
      } else if (paymentStatusFilter === "completed") {
        result = result.filter((appointment) => appointment.pending <= 0)
      }
    }

    // Filtro de fecha
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filterDate.setHours(0, 0, 0, 0)

      result = result.filter((appointment) => {
        const appointmentDate = new Date(appointment.datetimeStart)
        appointmentDate.setHours(0, 0, 0, 0)
        return appointmentDate.getTime() === filterDate.getTime()
      })
    }

    setFilteredAppointments(result)
  }, [appointments, localFilter, appointmentStatusFilter, paymentStatusFilter, dateFilter])

  const handleSearch = () => {
    setFilter(localFilter)
  }

  const handleSort = (field: string) => {
    if (field === orderBy) {
      setOrderType(orderType === "ASC" ? "DESC" : "ASC")
    } else {
      setOrderBy(field)
      setOrderType("ASC")
    }
  }

  const getSortIcon = (field: string) => {
    if (field !== orderBy) return <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-50" />
    return orderType === "ASC" ? (
      <ArrowUp className="ml-2 h-4 w-4 inline text-primary" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 inline text-primary" />
    )
  }

  const getStatus = (state: string) => {
    if (state === "CANCELADO") {
      return <Badge variant="destructive">CANCELADO</Badge>
    }
    if (state === "PENDIENTE") {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
          PENDIENTE
        </Badge>
      )
    }
    if (state === "COMPLETADO") {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          COMPLETADO
        </Badge>
      )
    }
    if (state === "INACTIVO") {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
          INACTIVO
        </Badge>
      )
    }
    if (state === "ACTIVO") {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
          ACTIVO
        </Badge>
      )
    }
    return <Badge variant="outline">{state}</Badge>
  }

  const getPaymentStatusBadge = (pending: number) => {
    if (pending > 0) {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
          PENDIENTE
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
        COMPLETADO
      </Badge>
    )
  }

  const clearFilters = () => {
    setLocalFilter("")
    setAppointmentStatusFilter("all")
    setPaymentStatusFilter("all")
    setDateFilter(undefined)
    setFilter("")
  }

  if (isLoading)
    return (
      <Card className="w-full">
        <CardContent className="p-8 flex justify-center items-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Cargando citas...</p>
          </div>
        </CardContent>
      </Card>
    )

  if (error)
    return (
      <Card className="w-full border-red-200">
        <CardContent className="p-8">
          <div className="text-center text-red-500">
            <p>Ocurrió un error: {error}</p>
          </div>
        </CardContent>
      </Card>
    )

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <Card>
        <CardHeader className="flex-row justify-between items-center flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-primary" />
              Todas las Citas
            </CardTitle>
            <CardDescription>Ver y gestionar todas las citas de la plataforma</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar citas..."
                value={localFilter}
                onChange={(e) => setLocalFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 w-full sm:w-[250px]"
              />
            </div>
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                  {(appointmentStatusFilter !== "all" || paymentStatusFilter !== "all" || dateFilter) && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1">
                      {(appointmentStatusFilter !== "all" ? 1 : 0) +
                        (paymentStatusFilter !== "all" ? 1 : 0) +
                        (dateFilter ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filtros</h4>
                  <Separator />

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Estado de Cita</h5>
                    <Select value={appointmentStatusFilter} onValueChange={setAppointmentStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Estado de cita" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las citas</SelectItem>
                        <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                        <SelectItem value="COMPLETADO">Completadas</SelectItem>
                        <SelectItem value="CANCELADO">Canceladas</SelectItem>
                        <SelectItem value="INACTIVO">Inactivas</SelectItem>
                        <SelectItem value="ACTIVO">Activas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Estado de Pago</h5>
                    <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Estado de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los pagos</SelectItem>
                        <SelectItem value="pending">Pendientes de pago</SelectItem>
                        <SelectItem value="completed">Pagos completados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Fecha</h5>
                    <DatePicker selected={dateFilter} onSelect={setDateFilter} placeholder="Seleccionar fecha" />
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Limpiar filtros
                    </Button>
                    <Button size="sm" onClick={() => setShowFilters(false)}>
                      Aplicar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead onClick={() => handleSort("id")} className="cursor-pointer font-medium">
                    ID {getSortIcon("id")}
                  </TableHead>

                  <TableHead
                    onClick={() => handleSort("appointment.client.firstName")}
                    className="cursor-pointer font-medium"
                  >
                    Cliente {getSortIcon("appointment.client.firstName")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("package.name")} className="cursor-pointer font-medium">
                    Paquete {getSortIcon("package.name")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("datetimeStart")} className="cursor-pointer font-medium">
                    Fecha {getSortIcon("datetimeStart")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("datetimeStart")} className="cursor-pointer font-medium">
                    Hora {getSortIcon("datetimeStart")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("state")} className="cursor-pointer font-medium">
                    Estado Cita {getSortIcon("state")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("total")} className="cursor-pointer font-medium text-right">
                    Total {getSortIcon("total")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("pending")} className="cursor-pointer font-medium">
                    Estado Pago {getSortIcon("pending")}
                  </TableHead>

                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No se encontraron citas que coincidan con los filtros
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{appointment.id}</TableCell>
                      <TableCell className="font-medium">
                        {appointment.client.firstName.toUpperCase()} {appointment.client.lastName.toUpperCase()}
                      </TableCell>
                      <TableCell>{appointment.package.name.toUpperCase()}</TableCell>
                      <TableCell>{format(new Date(appointment.datetimeStart), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        {new Date(appointment.datetimeStart).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{getStatus(appointment.state)}</TableCell>
                      <TableCell className="text-right font-medium">${(appointment.total || 0).toFixed(2)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(appointment.pending || 0)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-1">
                          {appointment.pending > 0 ? (
                            <PayCashDialog appointment={appointment} />
                          ) : appointment.pending === 0 ? (
                            <ViewCashDialog appointment={appointment} />
                          ) : null}
                          {hasPermission("read:appointments") && (
                            <ViewAppointmentDialog
                              appointment={{
                                ...appointment,
                                datetimeStart: appointment.datetimeStart instanceof Date
                                  ? appointment.datetimeStart.toISOString()
                                  : appointment.datetimeStart,
                                details: appointment.details.map((detail: any) => ({
                                  ...detail,
                                  datetimeStart:
                                    detail.datetimeStart instanceof Date
                                      ? detail.datetimeStart.toISOString()
                                      : detail.datetimeStart,
                                })),
                              }}
                            />
                          )}
                          {hasPermission("update:appointments") && <EditAppointmentDialogAdmin appointment={appointment} />}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredAppointments.length} de {total} citas
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => fetchAppointments(Math.max(currentPage - 1, 1), token || undefined)}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {totalPages > 6 ? (
                <>
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  {[...Array(totalPages)]
                    .map((_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2),
                    )
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => fetchAppointments(page, token || undefined)}
                          isActive={currentPage === page}
                        >
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
                      onClick={() => fetchAppointments(i + 1, token || undefined)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => fetchAppointments(Math.min(currentPage + 1, totalPages), token || undefined)}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  )
}
