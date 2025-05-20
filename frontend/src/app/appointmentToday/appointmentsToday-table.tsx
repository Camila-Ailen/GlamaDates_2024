"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
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
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, Clock, Loader2, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import useAuthStore from "../store/useAuthStore"
import { ViewAppointmentDialog } from "../appointment/view-appointment-dialog"
import { PayCashDialog } from "./pay-cash-dialog"
import { ViewCashDialog } from "./view-cash-dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EditAppointmentDialogAdmin } from "../appointment/edit-appointment-dialog-admin"

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
    fetchManualCron,
    setOrderBy,
    setOrderType,
    setFilter,
  } = useAppointmentStore()

  const token = useAuthStore((state) => state.token)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const [filteredAppointments, setFilteredAppointments] = useState(appointments)
  const [localFilter, setLocalFilter] = useState(filter)
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [isCronLoading, setIsCronLoading] = useState(false)

  useEffect(() => {
    if (token) {
      fetchTodayAppointments()
      console.log("Fetching today's appointments...", orderBy, orderType, filter)
    }
  }, [fetchTodayAppointments, token, orderBy, orderType, filter])

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

    setFilteredAppointments(result)
  }, [appointments, localFilter, appointmentStatusFilter, paymentStatusFilter])

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

  const handleCron = async () => {
    setIsCronLoading(true)
    try {
      await fetchManualCron()
      await fetchTodayAppointments(currentPage, token || undefined)
    } finally {
      setIsCronLoading(false)
    }
  }

  const getSortIcon = (field: string) => {
    if (field !== orderBy) return <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-50" />
    return orderType === "ASC" ? (
      <ArrowUp className="ml-2 h-4 w-4 inline text-green-600" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 inline text-green-600" />
    )
  }

  const getStatusBadge = (state: string, pending: number) => {
    if (state === "CANCELADO") {
      return <Badge variant="destructive">CANCELADO</Badge>
    }
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
        <CardHeader className="flex-row justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Citas para hoy {format(new Date(), "EEEE d 'de' MMMM 'del' yyyy", { locale: es })}
              </CardTitle>
              <CardDescription>Ver y actualizar citas de la plataforma</CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCron}
                    disabled={isCronLoading}
                    className="h-9 px-3"
                  >
                    {isCronLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    Actualizar estados
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ejecutar actualización manual de estados de citas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={appointmentStatusFilter} onValueChange={setAppointmentStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
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
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pagos</SelectItem>
                  <SelectItem value="pending">Pendientes de pago</SelectItem>
                  <SelectItem value="completed">Pagos completados</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

                  <TableHead onClick={() => handleSort("client.firstName")} className="cursor-pointer font-medium">
                    Cliente {getSortIcon("client.firstName")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("package.name")} className="cursor-pointer font-medium">
                    Paquete {getSortIcon("package.name")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("datetimeStart")} className="cursor-pointer font-medium">
                    Hora Inicio {getSortIcon("datetimeStart")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("state")} className="cursor-pointer font-medium">
                    Estado Cita {getSortIcon("state")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("price")} className="cursor-pointer font-medium text-right">
                    Precio {getSortIcon("price")}
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
                      No se encontraron citas para hoy
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
                      <TableCell>
                        {new Date(appointment.datetimeStart).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{getStatus(appointment.state)}</TableCell>
                      <TableCell className="text-right font-medium">${appointment.total.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(appointment.payments[0].status, appointment.pending)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-1">
                          {appointment.pending > 0 ? (
                            <PayCashDialog appointment={appointment} />
                          ) : (
                            <ViewCashDialog appointment={appointment} />
                          )}
                          {hasPermission("read:appointments") && <ViewAppointmentDialog appointment={appointment} />}
                          <EditAppointmentDialogAdmin appointment={appointment} />
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
                  onClick={() => fetchTodayAppointments(Math.max(currentPage - 1, 1), token || undefined)}
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
                          onClick={() => fetchTodayAppointments(page, token || undefined)}
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
                      onClick={() => fetchTodayAppointments(i + 1, token || undefined)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => fetchTodayAppointments(Math.min(currentPage + 1, totalPages), token || undefined)}
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
