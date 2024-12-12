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
import { EditPackageDialog } from './edit-package-dialog'
import { DeletePackageDialog } from './delete-package-dialog'
import usePackageStore from '../store/usePackageStore'
import { ArrowUpDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CreatePackageDialog } from './create-package-dialog'
import useAuthStore from '../store/useAuthStore'

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
    setFilter
  } = usePackageStore()

  const token = useAuthStore((state) => state.token);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  useEffect(() => {
    fetchPackage()
  }, [fetchPackage, orderBy, orderType, filter])

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
            <CardTitle>Paquetes</CardTitle>
            <CardDescription>Ver y actualizar paquete de la plataforma</CardDescription>
          </div>
          <div className="flex flex-row">

            <Input
              placeholder="Filtrar paquetes"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />

            {hasPermission('create:packages') && <CreatePackageDialog />}

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
                  Servicios <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>{pkg.id}</TableCell>
                  <TableCell>{pkg.name.toUpperCase()}</TableCell>
                  <TableCell>{pkg.description.toUpperCase()}</TableCell>
                  <TableCell>{pkg.duration}</TableCell>
                  <TableCell>{pkg.price}</TableCell>
                  <TableCell>
                    <ul>
                      {Array.isArray(pkg.services) ? pkg.services.map((service: { id: string; name: string }) => (
                        <li key={service.id}>{service.name}</li>
                      )) : <li>No hay servicios asociados</li>}
                    </ul>
                  </TableCell>
                  <TableCell>
                    {hasPermission("update:packages") && (
                      <EditPackageDialog pkg={pkg} />
                    )}
                    {hasPermission("delete:packages") && (
                      <DeletePackageDialog packageId={pkg.id} />
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
                    fetchPackage(Math.max(currentPage - 1, 1))
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
                  {/* <PaginationItem>
                <PaginationLink onClick={() => fetchUsers(totalPages)} isActive={currentPage === totalPages}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem> */}
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
                <PaginationNext onClick={() => fetchPackage(Math.min(currentPage + 1, totalPages))} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

    </div>
  )
}
