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
import { EditRoleDialog } from "./edit-role-dialog"
import { DeleteRoleDialog } from "./delete-role-dialog"
import useRoleStore from "../store/useRoleStore"
import { ArrowUpDown, Filter, Loader2, Plus, Search, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateRoleDialog } from "./create-role-dialog"
import useAuthStore from "../store/useAuthStore"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ViewRoleDialog } from "./view-role-dialog"

export function RolesTable() {
  const {
    roles,
    total,
    currentPage,
    pageSize,
    isLoading,
    error,
    orderBy,
    orderType,
    filter,
    fetchRoles,
    setOrderBy,
    setOrderType,
  } = useRoleStore()

  const [searchTerm, setSearchTerm] = useState(filter)
  const [isSearching, setIsSearching] = useState(false)

  const token = useAuthStore((state) => state.token)
  const hasPermission = useAuthStore((state) => state.hasPermission)

  useEffect(() => {
    if (token) {
      fetchRoles()
    }
  }, [fetchRoles, orderBy, orderType, currentPage, token])

  // Efecto para manejar el debounce de la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filter) {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, filter])

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

  const totalPages = Math.ceil(total / pageSize)

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader className="bg-red-50 text-red-700">
          <CardTitle className="flex items-center gap-2">
            <span className="i-lucide-alert-circle" />
            Error al cargar los roles
          </CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button onClick={() => fetchRoles()} variant="outline">
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
              Roles y Permisos
            </CardTitle>
            <CardDescription>Gestione los roles y sus permisos en la plataforma</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {hasPermission("create:roles") && (
              <CreateRoleDialog>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Rol
                </Button>
              </CreateRoleDialog>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">

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
                <TableHead onClick={() => handleSort("role")} className="cursor-pointer">
                  Nombre del Rol
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 inline transition-transform ${orderBy === "role" ? "text-blue-600" : "text-gray-400"} ${orderBy === "role" && orderType === "DESC" ? "rotate-180" : ""}`}
                  />
                </TableHead>
                <TableHead className="w-[300px]">Descripción</TableHead>
                <TableHead className="w-[200px]">Permisos</TableHead>
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
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-9 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Filter className="h-8 w-8 mb-2 text-gray-400" />
                      <p>No se encontraron roles con los filtros aplicados</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-blue-50/30">
                    <TableCell className="font-medium">{role.id}</TableCell>
                    <TableCell className="font-medium text-blue-700">{role.role.toUpperCase()}</TableCell>
                    <TableCell className="text-gray-600">
                      {role.description || <span className="text-gray-400 text-sm">Sin descripción</span>}
                    </TableCell>
                    <TableCell>
                      {role.permissions && role.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <Badge
                              key={permission.id}
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              {permission.permission}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                              +{role.permissions.length - 3} más
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin permisos</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ViewRoleDialog role={role} />
                        {hasPermission("update:roles") && <EditRoleDialog role={role} />}
                        {hasPermission("delete:roles") && <DeleteRoleDialog roleId={role.id} roleName={role.role} />}
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
              Mostrando {roles.length} de {total} roles
            </>
          )}
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => fetchRoles(Math.max(currentPage - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {totalPages > 6 ? (
              <>
                <PaginationItem>
                  <PaginationLink onClick={() => fetchRoles(1)} isActive={currentPage === 1}>
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
                      <PaginationLink onClick={() => fetchRoles(page)} isActive={currentPage === page}>
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
                  <PaginationLink onClick={() => fetchRoles(totalPages)} isActive={currentPage === totalPages}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            ) : (
              [...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink onClick={() => fetchRoles(i + 1)} isActive={currentPage === i + 1}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => fetchRoles(Math.min(currentPage + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  )
}
