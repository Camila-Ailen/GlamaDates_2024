'use client'

import { useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { EditServiceDialog } from './edit-service-dialog'
import { DeleteServiceDialog } from './delete-service-dialog'
import useServiceStore from '../store/useServiceStore'
import { ArrowUpDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateServiceDialog } from './create-service-dialog'
import useAuthStore from '../store/useAuthStore'

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
    setFilter
  } = useServiceStore()

  const token = useAuthStore((state) => state.token);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  useEffect(() => {
    fetchServices()
  }, [fetchServices, orderBy, orderType, filter])

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

  return (
    <div>
      <Card>
<CardHeader className="flex-row justify-between">
    <div>
        <CardTitle>Servicios</CardTitle>
        <CardDescription>Ver y actualizar servicio de la plataforma</CardDescription>
    </div>
    <div className="flex flex-row">

        <Input
          placeholder="Filtrar servicios"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />

        {hasPermission('create:services') && <CreateServiceDialog />}

      </div>

</CardHeader>
  <CardContent>
  <Table>
  <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => handleSort("id")}
                  className="cursor-pointer"
                >
                  ID <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("name")}
                  className="cursor-pointer"
                >
                  Nombre <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("description")}
                  className="cursor-pointer"
                >
                  Descripcion <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("duration")}
                  className="cursor-pointer"
                >
                  Duracion <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("price")}
                  className="cursor-pointer"
                >
                  Precio <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("category")}
                  className="cursor-pointer"
                >
                  Categoria <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell>{service.id}</TableCell>
              <TableCell>{service.name.toUpperCase()}</TableCell>
              <TableCell>{service.description.toUpperCase()}</TableCell>
                <TableCell>{service.duration}</TableCell>
                <TableCell>{service.price}</TableCell>
                <TableCell>{service.category.name}</TableCell>
              <TableCell>
              {hasPermission("update:services") && (
                      <EditServiceDialog service={service} />
                    )}
                    {hasPermission("delete:users") && (
                      <DeleteServiceDialog serviceId={service.id} />
                    )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
  </CardContent>
  <CardFooter>
  <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
          <PaginationPrevious
                  onClick={() =>
                    fetchServices(Math.max(currentPage - 1, 1), token || undefined)
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
                .filter((page) => page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2))
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
              {/* <PaginationItem>
                <PaginationLink onClick={() => fetchUsers(totalPages)} isActive={currentPage === totalPages}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem> */}
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
            <PaginationNext onClick={() => fetchServices(Math.min(currentPage + 1, totalPages))} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
        </CardFooter>
</Card>

    </div>
  )
}
