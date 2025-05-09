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
import { usePaymentStore } from "../store/usePaymentStore"
import { ArrowDown, ArrowUp, ArrowUpDown, CreditCard, Search, SlidersHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import useAuthStore from "../store/useAuthStore"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { DatePicker } from "../appointment/date-picker"
import { CancelPaymentDialog } from "./cancel-payment-dialog"

export function PaymentsTable() {
  const { payments, total, currentPage, pageSize, isLoading, error, orderBy, orderType, filter, fetchPayments } =
    usePaymentStore()

  const token = useAuthStore((state) => state.token)
  const hasPermission = useAuthStore((state) => state.hasPermission)

  // Estados locales para filtros
  const [filteredPayments, setFilteredPayments] = useState(payments)
  const [localFilter, setLocalFilter] = useState(filter)
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (token) {
      fetchPayments()
    }
  }, [fetchPayments, token, orderBy, orderType, filter, refreshTrigger])

  // Aplicar filtros locales
  useEffect(() => {
    let result = [...payments]

    // Filtro de texto
    if (localFilter) {
      const searchTerm = localFilter.toLowerCase()
      result = result.filter(
        (payment) =>
          payment.id.toString().includes(searchTerm) ||
          payment.transactionId?.toLowerCase().includes(searchTerm) ||
          payment.appointment.id.toString().includes(searchTerm) ||
          payment.observation?.toLowerCase().includes(searchTerm),
      )
    }

    // Filtro de estado
    if (statusFilter !== "all") {
      result = result.filter((payment) => payment.status === statusFilter)
    }

    // Filtro de método de pago
    if (methodFilter !== "all") {
      result = result.filter((payment) => payment.paymentMethod === methodFilter)
    }

    // Filtro de fecha
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filterDate.setHours(0, 0, 0, 0)

      result = result.filter((payment) => {
        const paymentDate = new Date(payment.datetime)
        paymentDate.setHours(0, 0, 0, 0)
        return paymentDate.getTime() === filterDate.getTime()
      })
    }

    setFilteredPayments(result)
  }, [payments, localFilter, statusFilter, methodFilter, dateFilter])

  const handleSearch = () => {
    // Implementar búsqueda en el backend si es necesario
    setLocalFilter(localFilter)
  }

  const handleSort = (field: string) => {
    // Esta función debería actualizar el estado global para ordenar desde el backend
    // Por ahora, solo implementamos ordenamiento local
    const newOrderType = field === orderBy && orderType === "ASC" ? "DESC" : "ASC"

    // Aquí deberías actualizar el estado global y refrescar los datos
    // setOrderBy(field)
    // setOrderType(newOrderType)
  }

  const getSortIcon = (field: string) => {
    if (field !== orderBy) return <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-50" />
    return orderType === "ASC" ? (
      <ArrowUp className="ml-2 h-4 w-4 inline text-primary" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 inline text-primary" />
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETADO":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            COMPLETADO
          </Badge>
        )
      case "PENDIENTE":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            PENDIENTE
          </Badge>
        )
      case "CANCELADO":
        return <Badge variant="destructive">CANCELADO</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method.toUpperCase()) {
      case "EFECTIVO":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            EFECTIVO
          </Badge>
        )
      case "TARJETA":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            TARJETA
          </Badge>
        )
      case "TRANSFERENCIA":
        return (
          <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">
            TRANSFERENCIA
          </Badge>
        )
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  const clearFilters = () => {
    setLocalFilter("")
    setStatusFilter("all")
    setMethodFilter("all")
    setDateFilter(undefined)
  }

  if (isLoading)
    return (
      <Card className="w-full">
        <CardContent className="p-8 flex justify-center items-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Cargando pagos...</p>
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
              <CreditCard className="mr-2 h-5 w-5 text-primary" />
              Registro de Pagos
            </CardTitle>
            <CardDescription>Ver y gestionar todos los pagos de la plataforma</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pagos..."
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
                  {(statusFilter !== "all" || methodFilter !== "all" || dateFilter) && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1">
                      {(statusFilter !== "all" ? 1 : 0) + (methodFilter !== "all" ? 1 : 0) + (dateFilter ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filtros</h4>
                  <Separator />

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Estado</h5>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="COMPLETADO">Completados</SelectItem>
                        <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                        <SelectItem value="CANCELADO">Cancelados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Método de Pago</h5>
                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los métodos</SelectItem>
                        <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                        <SelectItem value="TARJETA">Tarjeta</SelectItem>
                        <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
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

                  <TableHead onClick={() => handleSort("transactionId")} className="cursor-pointer font-medium">
                    ID Transacción {getSortIcon("transactionId")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("datetime")} className="cursor-pointer font-medium">
                    Fecha y Hora {getSortIcon("datetime")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("amount")} className="cursor-pointer font-medium text-right">
                    Monto {getSortIcon("amount")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("paymentMethod")} className="cursor-pointer font-medium">
                    Método {getSortIcon("paymentMethod")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("status")} className="cursor-pointer font-medium">
                    Estado {getSortIcon("status")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("observation")} className="cursor-pointer font-medium">
                    Observación {getSortIcon("observation")}
                  </TableHead>

                  <TableHead onClick={() => handleSort("appointmentId")} className="cursor-pointer font-medium">
                    ID Cita {getSortIcon("appointmentId")}
                  </TableHead>

                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No se encontraron pagos que coincidan con los filtros
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.transactionId || "-"}</TableCell>
                      <TableCell>{format(new Date(payment.datetime), "dd/MM/yyyy HH:mm")}</TableCell>
                      <TableCell className="text-right font-medium">${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{getPaymentMethodBadge(payment.paymentMethod)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{payment.observation || "-"}</TableCell>
                      <TableCell>{payment.appointment.id}</TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          {payment.status !== "CANCELADO" && hasPermission("cancel:payment") && (
                            <CancelPaymentDialog
                              payment={{ ...payment, appointmentId: payment.appointment.id }}
                              onCancel={() => {
                                // Incrementar el trigger para forzar la actualización
                                setRefreshTrigger((prev) => prev + 1)
                              }}
                            />
                          )}
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
            Mostrando {filteredPayments.length} de {total} pagos
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => fetchPayments(Math.max(currentPage - 1, 1))}
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
                        <PaginationLink onClick={() => fetchPayments(page)} isActive={currentPage === page}>
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
                    <PaginationLink onClick={() => fetchPayments(i + 1)} isActive={currentPage === i + 1}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => fetchPayments(Math.min(currentPage + 1, totalPages))}
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
