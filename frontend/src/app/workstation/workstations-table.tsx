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
import { EditWorkstationDialog } from "./edit-workstation-dialog"
import { DeleteWorkstationDialog } from "./delete-workstation-dialog"
import { ViewWorkstationDialog } from "./view-workstation-dialog"
import useWorkstationStore from "../store/useWorkstationStore"
import { ArrowUpDown, Loader2, Plus, Search, Monitor, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateWorkstationDialog } from "./create-workstation-dialog"
import useAuthStore from "../store/useAuthStore"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

export function WorkstationsTable() {
  const {
    workstations,
    total,
    currentPage,
    pageSize,
    isLoading,
    error,
    orderBy,
    orderType,
    filter,
    fetchWorkstations,
    setOrderBy,
    setOrderType,
    setFilter,
  } = useWorkstationStore()

  const [searchTerm, setSearchTerm] = useState(filter)
  const [isSearching, setIsSearching] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [localCurrentPage, setLocalCurrentPage] = useState(1) // Paginación local para resultados filtrados

  const token = useAuthStore((state) => state.token)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (token) {
      fetchWorkstations()
    }
  }, [fetchWorkstations, orderBy, orderType, currentPage, token])

  // Efecto para manejar el debounce de la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filter) {
        setFilter(searchTerm)
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, setFilter, filter])

  // Filtrar estaciones por búsqueda y estado
  const getFilteredWorkstations = () => {
    let filtered = workstations

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((workstation) => {
        const nameMatch = workstation.name.toLowerCase().includes(term)
        const descriptionMatch = workstation.description?.toLowerCase().includes(term) || false
        const idMatch = workstation.id.toString().includes(term)
        const categoriesMatch = workstation.categories?.some((cat) => cat.name.toLowerCase().includes(term)) || false

        return nameMatch || descriptionMatch || idMatch || categoriesMatch
      })
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((workstation) => {
        if (statusFilter === "active" && workstation.state !== "ACTIVO") return false
        if (statusFilter === "inactive" && workstation.state !== "INACTIVO") return false
        if (statusFilter === "deleted" && workstation.state !== "ELIMINADO") return false
        return true
      })
    }

    return filtered
  }

  const filteredWorkstations = getFilteredWorkstations()

  // Calcular paginación local para los resultados filtrados
  const filteredTotal = filteredWorkstations.length
  const localPageSize = 20
  const totalLocalPages = Math.ceil(filteredTotal / localPageSize)
  const startIndex = (localCurrentPage - 1) * localPageSize
  const endIndex = startIndex + localPageSize
  const paginatedFilteredWorkstations = filteredWorkstations.slice(startIndex, endIndex)

  // Resetear página local cuando cambien los filtros
  useEffect(() => {
    setLocalCurrentPage(1)
  }, [searchTerm, statusFilter])

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

  const clearSearch = () => {
    setSearchTerm("")
    setFilter("")
  }

  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setFilter("")
    setLocalCurrentPage(1)
  }

  const handleLocalPageChange = (page: number) => {
    setLocalCurrentPage(page)
  }

  // Determinar si usar paginación local o del servidor
  const hasActiveFilters = searchTerm.trim() || statusFilter !== "all"
  const totalPages = hasActiveFilters ? totalLocalPages : Math.ceil(total / pageSize)
  const activePage = hasActiveFilters ? localCurrentPage : currentPage
  const displayedWorkstations = hasActiveFilters ? paginatedFilteredWorkstations : workstations

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader className="bg-red-50 text-red-700">
          <CardTitle className="flex items-center gap-2">
            <span className="i-lucide-alert-circle" />
            Error al cargar las estaciones de trabajo
          </CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button onClick={() => fetchWorkstations()} variant="outline">
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
              <Monitor className="h-5 w-5" />
              Estaciones de Trabajo
            </CardTitle>
            <CardDescription>Gestione las estaciones de trabajo y sus categorías asociadas</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar estaciones..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-10 border-blue-200 focus-visible:ring-blue-500 w-64"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
              )}
              {searchTerm && !isSearching && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-blue-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {mounted && hasPermission("create:workstation") && (
              <CreateWorkstationDialog>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Estación
                </Button>
              </CreateWorkstationDialog>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="p-4 border-b border-blue-100 bg-blue-50/50 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Estado</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border-blue-200">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="inactive">Inactivas</SelectItem>
                <SelectItem value="deleted">Eliminadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                {filteredTotal} resultado{filteredTotal !== 1 ? "s" : ""} encontrado{filteredTotal !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 mt-auto"
          >
            <X className="mr-1 h-3 w-3" />
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
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "id" ? "text-blue-600" : "text-gray-400"} ${orderBy === "id" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                  Nombre
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "name" ? "text-blue-600" : "text-gray-400"} ${orderBy === "name" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead className="w-[300px]">Descripción</TableHead>
                <TableHead className="w-[200px]">Categorías</TableHead>
                <TableHead onClick={() => handleSort("state")} className="cursor-pointer w-[100px] text-center">
                  Estado
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "state" ? "text-blue-600" : "text-gray-400"} ${orderBy === "state" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
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
                        <Skeleton className="h-6 w-48" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-9 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : displayedWorkstations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Monitor className="h-8 w-8 mb-2 text-gray-400" />
                      <p>
                        {hasActiveFilters
                          ? "No se encontraron estaciones que coincidan con los filtros"
                          : "No hay estaciones de trabajo disponibles"}
                      </p>
                      {hasActiveFilters && (
                        <Button variant="link" onClick={resetFilters} className="mt-2 text-blue-600">
                          Limpiar filtros
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayedWorkstations.map((workstation) => (
                  <TableRow key={workstation.id} className="hover:bg-blue-50/30">
                    <TableCell className="font-medium">{workstation.id}</TableCell>
                    <TableCell className="font-medium text-blue-700">{workstation.name}</TableCell>
                    <TableCell className="text-gray-600">
                      {workstation.description || <span className="text-gray-400 text-sm">Sin descripción</span>}
                    </TableCell>
                    <TableCell>
                      {workstation.categories && workstation.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {workstation.categories.slice(0, 2).map((category) => (
                            <Badge
                              key={category.id}
                              variant="outline"
                              className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
                            >
                              {category.name}
                            </Badge>
                          ))}
                          {workstation.categories.length > 2 && (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                              +{workstation.categories.length - 2} más
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin categorías</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          workstation.state === "ACTIVO"
                            ? "default"
                            : workstation.state === "INACTIVO"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          workstation.state === "ACTIVO"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : workstation.state === "INACTIVO"
                              ? "bg-gray-100 text-gray-700 border-gray-200"
                              : "bg-red-100 text-red-700 border-red-200"
                        }
                      >
                        {workstation.state === "ACTIVO"
                          ? "Activa"
                          : workstation.state === "INACTIVO"
                            ? "Inactiva"
                            : "Eliminada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ViewWorkstationDialog workstation={workstation} />
                        {hasPermission("update:workstation") && <EditWorkstationDialog workstation={workstation} />}
                        {hasPermission("delete:workstation") &&
                        workstation.state !== "ELIMINADO" && (
                          <DeleteWorkstationDialog workstationId={workstation.id} workstationName={workstation.name} />
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
              Mostrando {displayedWorkstations.length} de {hasActiveFilters ? filteredTotal : total} estaciones
              {hasActiveFilters && <span className="ml-1">(filtradas de {total} total)</span>}
            </>
          )}
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  if (hasActiveFilters) {
                    handleLocalPageChange(Math.max(localCurrentPage - 1, 1))
                  } else {
                    fetchWorkstations(Math.max(currentPage - 1, 1))
                  }
                }}
                className={activePage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {totalPages > 6 ? (
              <>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => {
                      if (hasActiveFilters) {
                        handleLocalPageChange(1)
                      } else {
                        fetchWorkstations(1)
                      }
                    }}
                    isActive={activePage === 1}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {activePage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {[...Array(totalPages)]
                  .map((_, i) => i + 1)
                  .filter(
                    (page) => page !== 1 && page !== totalPages && page >= activePage - 1 && page <= activePage + 1,
                  )
                  .map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => {
                          if (hasActiveFilters) {
                            handleLocalPageChange(page)
                          } else {
                            fetchWorkstations(page)
                          }
                        }}
                        isActive={activePage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                {activePage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationLink
                    onClick={() => {
                      if (hasActiveFilters) {
                        handleLocalPageChange(totalPages)
                      } else {
                        fetchWorkstations(totalPages)
                      }
                    }}
                    isActive={activePage === totalPages}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            ) : (
              [...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => {
                      if (hasActiveFilters) {
                        handleLocalPageChange(i + 1)
                      } else {
                        fetchWorkstations(i + 1)
                      }
                    }}
                    isActive={activePage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  if (hasActiveFilters) {
                    handleLocalPageChange(Math.min(localCurrentPage + 1, totalPages))
                  } else {
                    fetchWorkstations(Math.min(currentPage + 1, totalPages))
                  }
                }}
                className={activePage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  )
}
