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
import { EditPackageDialog } from "./edit-package-dialog"
import { DeletePackageDialog } from "./delete-package-dialog"
import usePackageStore from "../store/usePackageStore"
import { ArrowUpDown, Filter, Loader2, Plus, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreatePackageDialog } from "./create-package-dialog"
import useAuthStore from "../store/useAuthStore"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Service } from "../store/usePackageStore"

export function PackagesTable() {
  const {
    packages,
    total,
    currentPage,
    pageSize,
    isLoading,
    error,
    orderBy,
    orderType,
    filter,
    fetchPackage,
    setOrderBy,
    setOrderType,
    setFilter,
  } = usePackageStore()

  const [searchTerm, setSearchTerm] = useState(filter)
  const [isSearching, setIsSearching] = useState(false)
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: "", max: "" })
  const [serviceCountFilter, setServiceCountFilter] = useState<string>("all")

  const token = useAuthStore((state) => state.token)
  const hasPermission = useAuthStore((state) => state.hasPermission)

  useEffect(() => {
    fetchPackage()
  }, [fetchPackage, orderBy, orderType, currentPage])

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

  // Filtrar paquetes por número de servicios y rango de precios
  const filteredPackages = packages.filter((pkg) => {
    // Filtro por número de servicios
    if (serviceCountFilter !== "all") {
      if (serviceCountFilter === "single" && pkg.services.length !== 1) {
        return false
      }
      if (serviceCountFilter === "multiple" && pkg.services.length <= 1) {
        return false
      }
    }

    // Filtro por rango de precios
    const minPrice = priceRange.min ? Number.parseFloat(priceRange.min) : 0
    const maxPrice = priceRange.max ? Number.parseFloat(priceRange.max) : Number.POSITIVE_INFINITY

    if (pkg.price < minPrice || pkg.price > maxPrice) {
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

  const handleServiceCountFilter = (value: string) => {
    setServiceCountFilter(value)
  }

  const handlePriceRangeChange = (type: "min" | "max", value: string) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  const resetFilters = () => {
    setSearchTerm("")
    setServiceCountFilter("all")
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
            Error al cargar los paquetes
          </CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button onClick={() => fetchPackage()} variant="outline">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-purple-700">Paquetes</CardTitle>
            <CardDescription>Gestione los paquetes de servicios ofrecidos en su plataforma</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar paquetes..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-9 w-full sm:w-[250px] border-purple-200 focus-visible:ring-purple-500"
              />
              {isSearching && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-purple-500" />}
            </div>

            {hasPermission("create:packages") && (
              <CreatePackageDialog>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Paquete
                </Button>
              </CreatePackageDialog>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="p-4 border-b border-purple-100 bg-purple-50/50 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Tipo de paquete</label>
            <Select value={serviceCountFilter} onValueChange={handleServiceCountFilter}>
              <SelectTrigger className="w-[180px] border-purple-200">
                <SelectValue placeholder="Todos los paquetes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los paquetes</SelectItem>
                <SelectItem value="single">Servicio único</SelectItem>
                <SelectItem value="multiple">Múltiples servicios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Precio mínimo</label>
            <Input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => handlePriceRangeChange("min", e.target.value)}
              className="w-[100px] border-purple-200"
              min="0"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Precio máximo</label>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => handlePriceRangeChange("max", e.target.value)}
              className="w-[100px] border-purple-200"
              min="0"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="border-purple-200 text-purple-700 hover:bg-purple-50 mt-auto"
          >
            Limpiar filtros
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-purple-50/50">
                <TableHead onClick={() => handleSort("id")} className="cursor-pointer w-[80px]">
                  ID
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "id" ? "text-purple-600" : "text-gray-400"} ${orderBy === "id" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                  Nombre
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "name" ? "text-purple-600" : "text-gray-400"} ${orderBy === "name" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("description")} className="cursor-pointer">
                  Descripción
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "description" ? "text-purple-600" : "text-gray-400"} ${orderBy === "description" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("duration")} className="cursor-pointer w-[120px] text-right">
                  Duración
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "duration" ? "text-purple-600" : "text-gray-400"} ${orderBy === "duration" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("price")} className="cursor-pointer w-[120px] text-right">
                  Precio
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "price" ? "text-purple-600" : "text-gray-400"} ${orderBy === "price" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead className="w-[200px]">Servicios</TableHead>
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
              ) : filteredPackages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Filter className="h-8 w-8 mb-2 text-gray-400" />
                      <p>No se encontraron paquetes con los filtros aplicados</p>
                      <Button variant="link" onClick={resetFilters} className="mt-2 text-purple-600">
                        Limpiar filtros
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPackages.map((pkg) => (
                  <TableRow key={pkg.id} className="hover:bg-purple-50/30">
                    <TableCell className="font-medium">{pkg.id}</TableCell>
                    <TableCell className="font-medium text-purple-700">{pkg.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate" title={pkg.description}>
                      {pkg.description}
                    </TableCell>
                    <TableCell className="text-right">{pkg.duration} min</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(pkg.price)}</TableCell>
                    <TableCell>
                      <Collapsible className="w-full">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {pkg.services.length} {pkg.services.length === 1 ? "servicio" : "servicios"}
                          </Badge>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ArrowUpDown className="h-4 w-4" />
                                  </Button>
                                </CollapsibleTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Ver servicios</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <CollapsibleContent className="mt-2">
                          <ul className="space-y-1 text-sm">
                            {Array.isArray(pkg.services) && pkg.services.length > 0 ? (
                              pkg.services.map((service: Service) => (
                                <li
                                  key={service.id}
                                  className="flex items-center gap-2 p-1 rounded-md hover:bg-purple-50"
                                >
                                  <Badge
                                    variant="outline"
                                    className="h-5 min-w-[20px] px-1 flex items-center justify-center"
                                  >
                                    {service.id}
                                  </Badge>
                                  <span className="font-medium">{service.name}</span>
                                  <span className="text-xs text-gray-500 ml-auto">{formatCurrency(service.price)}</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-gray-500 italic">No hay servicios asociados</li>
                            )}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {hasPermission("update:packages") && <EditPackageDialog pkg={pkg} />}
                        {hasPermission("delete:packages") && <DeletePackageDialog packageId={pkg.id} />}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t border-purple-100 p-4">
        <div className="text-sm text-gray-500">
          {isLoading ? (
            <Skeleton className="h-5 w-40" />
          ) : (
            <>
              Mostrando {filteredPackages.length} de {total} paquetes
            </>
          )}
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => fetchPackage(Math.max(currentPage - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {totalPages > 6 ? (
              <>
                <PaginationItem>
                  <PaginationLink onClick={() => fetchPackage(1)} isActive={currentPage === 1}>
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
                      <PaginationLink onClick={() => fetchPackage(page)} isActive={currentPage === page}>
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
                  <PaginationLink onClick={() => fetchPackage(totalPages)} isActive={currentPage === totalPages}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            ) : (
              [...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink onClick={() => fetchPackage(i + 1)} isActive={currentPage === i + 1}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => fetchPackage(Math.min(currentPage + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  )
}

