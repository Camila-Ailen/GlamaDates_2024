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
import { EditCategoryDialog } from "./edit-category-dialog"
import { DeleteCategoryDialog } from "./delete-category-dialog"
import useCategoryStore from "../store/useCategoryStore"
import { ArrowUpDown, Plus, Search, Tag, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateCategoryDialog } from "./create-category-dialog"
import useAuthStore from "../store/useAuthStore"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export function CategoriesTable() {
  const {
    categories,
    total,
    currentPage,
    pageSize,
    isLoading,
    error,
    orderBy,
    orderType,
    searchTerm,
    fetchCategories,
    setOrderBy,
    setOrderType,
    setSearchTerm,
    getFilteredCategories,
  } = useCategoryStore()

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const [localCurrentPage, setLocalCurrentPage] = useState(1) // Paginación local para resultados filtrados

  const token = useAuthStore((state) => state.token)
  const hasPermission = useAuthStore((state) => state.hasPermission)

  // Obtener categorías filtradas
  const filteredCategories = getFilteredCategories()

  // Calcular paginación local para los resultados filtrados
  const filteredTotal = filteredCategories.length
  const localPageSize = 10 // Puedes ajustar esto
  const totalLocalPages = Math.ceil(filteredTotal / localPageSize)
  const startIndex = (localCurrentPage - 1) * localPageSize
  const endIndex = startIndex + localPageSize
  const paginatedFilteredCategories = filteredCategories.slice(startIndex, endIndex)

  useEffect(() => {
    if (token) {
      fetchCategories()
    }
  }, [fetchCategories, orderBy, orderType, currentPage, token])

  // Efecto para manejar el debounce de la búsqueda local
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm)
      setLocalCurrentPage(1) // Resetear a la primera página cuando se busque
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearchTerm, setSearchTerm])

  const handleSort = (field: string) => {
    if (field === orderBy) {
      setOrderType(orderType === "ASC" ? "DESC" : "ASC")
    } else {
      setOrderBy(field)
      setOrderType("ASC")
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setLocalSearchTerm("")
    setSearchTerm("")
    setLocalCurrentPage(1)
  }

  const handleLocalPageChange = (page: number) => {
    setLocalCurrentPage(page)
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader className="bg-red-50 text-red-700">
          <CardTitle className="flex items-center gap-2">
            <span className="i-lucide-alert-circle" />
            Error al cargar las categorías
          </CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button onClick={() => fetchCategories()} variant="outline">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-emerald-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-emerald-700 flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Categorías
            </CardTitle>
            <CardDescription>Gestione las categorías de servicios de su plataforma</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar categorías..."
                value={localSearchTerm}
                onChange={handleSearch}
                className="pl-10 pr-10 border-emerald-200 focus-visible:ring-emerald-500 w-64"
              />
              {localSearchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-emerald-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {hasPermission("create:categories") && (
              <CreateCategoryDialog/>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Solo mostrar la sección de búsqueda activa si hay búsqueda */}
        {searchTerm && (
          <div className="p-4 border-b border-emerald-100 bg-emerald-50/50 flex flex-wrap gap-3 items-center">
            <span className="text-sm text-gray-600">
              Buscando: <strong>"{searchTerm}"</strong> - {filteredTotal} resultado{filteredTotal !== 1 ? "s" : ""}{" "}
              encontrado{filteredTotal !== 1 ? "s" : ""}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSearch}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <X className="mr-1 h-3 w-3" />
              Limpiar búsqueda
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-emerald-50/50">
                <TableHead onClick={() => handleSort("id")} className="cursor-pointer w-[80px]">
                  ID
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "id" ? "text-emerald-600" : "text-gray-400"} ${orderBy === "id" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                  Nombre
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "name" ? "text-emerald-600" : "text-gray-400"} ${orderBy === "name" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("description")} className="cursor-pointer">
                  Descripción
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "description" ? "text-emerald-600" : "text-gray-400"} ${orderBy === "description" && orderType === "DESC" ? "rotate-180" : ""}`}
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
                        <Skeleton className="h-9 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : paginatedFilteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Tag className="h-8 w-8 mb-2 text-gray-400" />
                      <p>
                        {searchTerm
                          ? `No se encontraron categorías que coincidan con "${searchTerm}"`
                          : "No hay categorías disponibles"}
                      </p>
                      {searchTerm && (
                        <Button variant="link" onClick={clearSearch} className="mt-2 text-emerald-600">
                          Limpiar búsqueda
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFilteredCategories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-emerald-50/30">
                    <TableCell className="font-medium">{category.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          <Tag className="h-3 w-3 mr-1" />
                          {category.name.toUpperCase()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate" title={category.description}>
                      {category.description ? (
                        category.description.toUpperCase()
                      ) : (
                        <span className="text-gray-400 italic">Sin descripción</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {hasPermission("update:categories") && <EditCategoryDialog category={category} />}
                        {hasPermission("delete:categories") && <DeleteCategoryDialog categoryId={category.id} />}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t border-emerald-100 p-4">
        <div className="text-sm text-gray-500">
          {isLoading ? (
            <Skeleton className="h-5 w-40" />
          ) : (
            <>
              Mostrando {paginatedFilteredCategories.length} de {searchTerm ? filteredTotal : total} categorías
              {searchTerm && <span className="ml-1">(filtradas de {total} total)</span>}
            </>
          )}
        </div>

        {/* Paginación: usar paginación local si hay búsqueda, sino paginación del servidor */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  if (searchTerm) {
                    handleLocalPageChange(Math.max(localCurrentPage - 1, 1))
                  } else {
                    fetchCategories(Math.max(currentPage - 1, 1))
                  }
                }}
                className={
                  (searchTerm ? localCurrentPage === 1 : currentPage === 1) ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {(searchTerm ? totalLocalPages : Math.ceil(total / pageSize)) > 6 ? (
              <>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => {
                      if (searchTerm) {
                        handleLocalPageChange(1)
                      } else {
                        fetchCategories(1)
                      }
                    }}
                    isActive={(searchTerm ? localCurrentPage : currentPage) === 1}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {(searchTerm ? localCurrentPage : currentPage) > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {[...Array(searchTerm ? totalLocalPages : Math.ceil(total / pageSize))]
                  .map((_, i) => i + 1)
                  .filter((page) => {
                    const activePage = searchTerm ? localCurrentPage : currentPage
                    const maxPages = searchTerm ? totalLocalPages : Math.ceil(total / pageSize)
                    return page !== 1 && page !== maxPages && page >= activePage - 1 && page <= activePage + 1
                  })
                  .map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => {
                          if (searchTerm) {
                            handleLocalPageChange(page)
                          } else {
                            fetchCategories(page)
                          }
                        }}
                        isActive={(searchTerm ? localCurrentPage : currentPage) === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                {(searchTerm ? localCurrentPage : currentPage) <
                  (searchTerm ? totalLocalPages : Math.ceil(total / pageSize)) - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationLink
                    onClick={() => {
                      const maxPages = searchTerm ? totalLocalPages : Math.ceil(total / pageSize)
                      if (searchTerm) {
                        handleLocalPageChange(maxPages)
                      } else {
                        fetchCategories(maxPages)
                      }
                    }}
                    isActive={
                      (searchTerm ? localCurrentPage : currentPage) ===
                      (searchTerm ? totalLocalPages : Math.ceil(total / pageSize))
                    }
                  >
                    {searchTerm ? totalLocalPages : Math.ceil(total / pageSize)}
                  </PaginationLink>
                </PaginationItem>
              </>
            ) : (
              [...Array(searchTerm ? totalLocalPages : Math.ceil(total / pageSize))].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => {
                      if (searchTerm) {
                        handleLocalPageChange(i + 1)
                      } else {
                        fetchCategories(i + 1)
                      }
                    }}
                    isActive={(searchTerm ? localCurrentPage : currentPage) === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  if (searchTerm) {
                    handleLocalPageChange(Math.min(localCurrentPage + 1, totalLocalPages))
                  } else {
                    fetchCategories(Math.min(currentPage + 1, Math.ceil(total / pageSize)))
                  }
                }}
                className={
                  (searchTerm ? localCurrentPage === totalLocalPages : currentPage === Math.ceil(total / pageSize))
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  )
}
