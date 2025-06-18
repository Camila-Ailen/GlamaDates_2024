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
import { EditServiceDialog } from "./edit-service-dialog"
import { DeleteServiceDialog } from "./delete-service-dialog"
import useServiceStore from "../store/useServiceStore"
import { ArrowUpDown, Filter, Loader2, Plus, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateServiceDialog } from "./create-service-dialog"
import useAuthStore from "../store/useAuthStore"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import useCategoryStore from "../store/useCategoryStore"

export function ServicesTable() {
  const {
    services,
    total,
    currentPage,
    pageSize,
    isLoading,
    error,
    orderBy,
    orderType,
    filter,
    fetchServices,
    setOrderBy,
    setOrderType,
    setFilter,
  } = useServiceStore()

  const [searchTerm, setSearchTerm] = useState(filter)
  const [isSearching, setIsSearching] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: "", max: "" })

  const token = useAuthStore((state) => state.token)
  const hasPermission = useAuthStore((state) => state.hasPermission)

  // Obtener categorías únicas de los servicios
  const { categories, isLoading: isLoadingCategories, fetchCategories } = useCategoryStore()
  const uniqueCategories = Array.from(new Set(services.map((service) => service.category.name)))

  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [fetchServices, fetchCategories, orderBy, orderType, currentPage])

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

  // Filtrar servicios por categoría y rango de precios
  const filteredServices = services.filter((service) => {
    // Filtro por categoría
    if (categoryFilter !== "all" && service.category.name !== categoryFilter) {
      return false
    }

    // Filtro por rango de precios
    const minPrice = priceRange.min ? Number.parseFloat(priceRange.min) : 0
    const maxPrice = priceRange.max ? Number.parseFloat(priceRange.max) : Number.POSITIVE_INFINITY

    if (service.price < minPrice || service.price > maxPrice) {
      return false
    }

    return true
  })

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

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value)
  }



  const resetFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setPriceRange({ min: "", max: "" })
    setFilter("")
  }

  const totalPages = Math.ceil(total / pageSize)

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader className="bg-red-50 text-red-700">
          <CardTitle className="flex items-center gap-2">
            <span className="i-lucide-alert-circle" />
            Error al cargar los servicios
          </CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button onClick={() => fetchServices()} variant="outline">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-pink-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-pink-700">Servicios</CardTitle>
            <CardDescription>Gestione los servicios ofrecidos en su plataforma</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">


            {hasPermission("create:services") && (
              <CreateServiceDialog>
                <Button className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Servicio
                </Button>
              </CreateServiceDialog>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="p-4 border-b border-pink-100 bg-pink-50/50 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Categoría</label>
            <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-[180px] border-pink-200">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="border-pink-200 text-pink-700 hover:bg-pink-50 mt-auto"
          >
            Limpiar filtros
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-pink-50/50">
                <TableHead onClick={() => handleSort("id")} className="cursor-pointer w-[80px]">
                  ID
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "id" ? "text-pink-600" : "text-gray-400"} ${orderBy === "id" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                  Nombre
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "name" ? "text-pink-600" : "text-gray-400"} ${orderBy === "name" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("description")} className="cursor-pointer">
                  Descripción
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "description" ? "text-pink-600" : "text-gray-400"} ${orderBy === "description" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("duration")} className="cursor-pointer w-[120px] text-right">
                  Duración
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "duration" ? "text-pink-600" : "text-gray-400"} ${orderBy === "duration" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("price")} className="cursor-pointer w-[120px] text-right">
                  Precio
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "price" ? "text-pink-600" : "text-gray-400"} ${orderBy === "price" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("category")} className="cursor-pointer">
                  Categoría
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "category" ? "text-pink-600" : "text-gray-400"} ${orderBy === "category" && orderType === "DESC" ? "rotate-180" : ""}`}
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
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-9 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Filter className="h-8 w-8 mb-2 text-gray-400" />
                      <p>No se encontraron servicios con los filtros aplicados</p>
                      <Button variant="link" onClick={resetFilters} className="mt-2 text-pink-600">
                        Limpiar filtros
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id} className="hover:bg-pink-50/30">
                    <TableCell className="font-medium">{service.id}</TableCell>
                    <TableCell className="font-medium text-pink-700">{service.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate" title={service.description}>
                      {service.description}
                    </TableCell>
                    <TableCell className="text-right">{service.duration} min</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(service.price)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                        {service.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {hasPermission("update:services") && <EditServiceDialog service={service} />}
                        {hasPermission("delete:services") && <DeleteServiceDialog serviceId={service.id} />}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t border-pink-100 p-4">
        <div className="text-sm text-gray-500">
          {isLoading ? (
            <Skeleton className="h-5 w-40" />
          ) : (
            <>
              Mostrando {filteredServices.length} de {total} servicios
            </>
          )}
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => fetchServices(Math.max(currentPage - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {totalPages > 6 ? (
              <>
                <PaginationItem>
                  <PaginationLink onClick={() => fetchServices(1)} isActive={currentPage === 1}>
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
                      <PaginationLink onClick={() => fetchServices(page)} isActive={currentPage === page}>
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
                  <PaginationLink onClick={() => fetchServices(totalPages)} isActive={currentPage === totalPages}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            ) : (
              [...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink onClick={() => fetchServices(i + 1)} isActive={currentPage === i + 1}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => fetchServices(Math.min(currentPage + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  )
}

