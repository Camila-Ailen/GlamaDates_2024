"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import useAuditStore from "../store/useAuditStore"
import { ArrowUpDown, Clock, Filter, Loader2, Search, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import useAuthStore from "../store/useAuthStore"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import useUserStore from "../store/useUserStore"

export function AuditsTable() {
  const {
    audits,
    total,
    currentPage,
    pageSize,
    isLoading,
    error,
    orderBy,
    orderType,
    filter,
    entityFilter,
    actionFilter,
    userFilter,
    fetchAudits,
    setOrderBy,
    setOrderType,
    setFilter,
    setEntityFilter,
    setActionFilter,
    setUserFilter,
    fetchFilterOptions,
  } = useAuditStore()

  const { users, fetchAllUsers } = useUserStore()
  const [searchTerm, setSearchTerm] = useState(filter)
  const [isSearching, setIsSearching] = useState(false)
  const [filterOptions, setFilterOptions] = useState<{
    entities: string[]
    actions: string[]
    users: (number | null)[]
  }>({
    entities: [],
    actions: [],
    users: [],
  })

  const token = useAuthStore((state) => state.token)

  // Cargar datos iniciales
  useEffect(() => {
    if (token) {
      fetchAudits(1)
      fetchAllUsers()
      // Cargar opciones de filtro
      fetchFilterOptions().then(setFilterOptions)
    }
  }, [token])

  // Efecto para manejar el debounce de la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filter) {
        setFilter(searchTerm)
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, setFilter, filter])

  // Función para obtener el nombre de usuario a partir del ID
  const getUserName = (userId: number | null) => {
    if (userId === null) return "Sistema"
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : `Usuario #${userId}`
  }

  const handleSort = (field: string) => {
    if (field === orderBy) {
      setOrderType(orderType === "ASC" ? "DESC" : "ASC")
    } else {
      setOrderBy(field)
      setOrderType("ASC")
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setIsSearching(true)
  }

  const handlePageChange = (page: number) => {
    fetchAudits(page)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setEntityFilter("all")
    setActionFilter("all")
    setUserFilter("all")
    setFilter("")
  }

  const totalPages = Math.ceil(total / pageSize)

  // Función para obtener el color del badge según la acción
  const getActionBadgeColor = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREAR":
        return "bg-green-50 text-green-700 border-green-200"
      case "ACTUALIZAR":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "ELIMINAR":
        return "bg-red-50 text-red-700 border-red-200"
      case "LOGIN":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "LOGOUT":
        return "bg-gray-50 text-gray-700 border-gray-200"
      default:
        return "bg-amber-50 text-amber-700 border-amber-200"
    }
  }

  // Función para formatear los datos JSON para mostrarlos
  const formatJsonData = (data: any) => {
    if (!data) return "Sin datos"
    try {
      if (typeof data === "string") {
        return data
      }
      return JSON.stringify(data, null, 2)
    } catch (e) {
      return "Datos no válidos"
    }
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader className="bg-red-50 text-red-700">
          <CardTitle className="flex items-center gap-2">
            <span className="i-lucide-alert-circle" />
            Error al cargar las auditorías
          </CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button onClick={() => fetchAudits(1)} variant="outline">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Registro de Auditorías
            </CardTitle>
            <CardDescription>Historial de acciones realizadas en el sistema</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="p-4 border-b border-blue-100 bg-blue-50/50 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Filtrar por entidad</label>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[180px] border-blue-200">
                <SelectValue placeholder="Todas las entidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las entidades</SelectItem>
                {filterOptions.entities.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    {entity.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Filtrar por acción</label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px] border-blue-200">
                <SelectValue placeholder="Todas las acciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                {filterOptions.actions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Filtrar por usuario</label>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[180px] border-blue-200">
                <SelectValue placeholder="Todos los usuarios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {filterOptions.users
                  .filter((userId) => userId !== null)
                  .map((userId) => (
                    <SelectItem key={userId} value={userId.toString()}>
                      {getUserName(userId)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 mt-auto"
          >
            Limpiar filtros
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-blue-50/50">
                <TableHead onClick={() => handleSort("id")} className="cursor-pointer w-[80px]">
                  ID
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${
                      orderBy === "id" ? "text-blue-600" : "text-gray-400"
                    } ${orderBy === "id" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("date")} className="cursor-pointer w-[180px]">
                  Fecha y Hora
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${
                      orderBy === "date" ? "text-blue-600" : "text-gray-400"
                    } ${orderBy === "date" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("userId")} className="cursor-pointer">
                  Usuario
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${
                      orderBy === "userId" ? "text-blue-600" : "text-gray-400"
                    } ${orderBy === "userId" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("accion")} className="cursor-pointer w-[120px]">
                  Acción
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${
                      orderBy === "accion" ? "text-blue-600" : "text-gray-400"
                    } ${orderBy === "accion" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("entity")} className="cursor-pointer w-[140px]">
                  Entidad
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${
                      orderBy === "entity" ? "text-blue-600" : "text-gray-400"
                    } ${orderBy === "entity" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead className="w-[300px]">Descripción</TableHead>
                <TableHead className="w-[300px]">Datos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-6 w-10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-48" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : audits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Filter className="h-8 w-8 mb-2 text-gray-400" />
                      <p>No se encontraron auditorías con los filtros aplicados</p>
                      <Button variant="link" onClick={resetFilters} className="mt-2 text-blue-600">
                        Limpiar filtros
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                audits.map((audit) => (
                  <TableRow key={audit.id} className="hover:bg-blue-50/30">
                    <TableCell className="font-medium">{audit.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">
                            {format(new Date(audit.date), "dd/MM/yyyy", { locale: es })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(audit.date), "HH:mm:ss", { locale: es })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{getUserName(audit.userId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getActionBadgeColor(audit.accion)} font-medium text-xs`}>
                        {audit.accion.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium text-xs">
                        {audit.entity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[300px] truncate text-sm text-gray-600">
                              {audit.description || <span className="text-gray-400 italic">Sin descripción</span>}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md">
                            <p className="text-sm">{audit.description || "Sin descripción"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {audit.newData && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="max-w-[300px] truncate text-sm text-green-600 bg-green-50 p-1 rounded">
                                  <span className="font-medium">Nuevos datos:</span>{" "}
                                  {formatJsonData(audit.newData).substring(0, 50)}
                                  {formatJsonData(audit.newData).length > 50 ? "..." : ""}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-md">
                                <pre className="text-xs whitespace-pre-wrap">{formatJsonData(audit.newData)}</pre>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {audit.oldData && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="max-w-[300px] truncate text-sm text-red-600 bg-red-50 p-1 rounded">
                                  <span className="font-medium">Datos anteriores:</span>{" "}
                                  {formatJsonData(audit.oldData).substring(0, 50)}
                                  {formatJsonData(audit.oldData).length > 50 ? "..." : ""}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-md">
                                <pre className="text-xs whitespace-pre-wrap">{formatJsonData(audit.oldData)}</pre>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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

      <CardFooter className="flex justify-between items-center border-t border-blue-100 p-4">
        <div className="text-sm text-gray-500">
          {isLoading ? (
            <Skeleton className="h-5 w-40" />
          ) : (
            <>
              Mostrando {audits.length} de {total} auditorías
            </>
          )}
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {totalPages > 6 ? (
              <>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(1)}
                    isActive={currentPage === 1}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {[...Array(totalPages)]
                  .map((_, i) => i + 1)
                  .filter(
                    (page) => page !== 1 && page !== totalPages && page >= currentPage - 1 && page <= currentPage + 1,
                  )
                  .map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
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

                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(totalPages)}
                    isActive={currentPage === totalPages}
                    className="cursor-pointer"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            ) : (
              [...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => handlePageChange(i + 1)}
                    isActive={currentPage === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  )
}
