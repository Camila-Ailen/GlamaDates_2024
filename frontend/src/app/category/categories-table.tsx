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
import { EditCategoryDialog } from './edit-category-dialog'
import { DeleteCategoryDialog } from './delete-category-dialog'
import useCategoryStore from '../store/useCategoryStore'
import { ArrowUpDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateCategoryDialog } from './create-category-dialog'

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
    filter,
    fetchCategories,
    setOrderBy,
    setOrderType,
    setFilter
  } = useCategoryStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories, orderBy, orderType, filter])

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
        <CardTitle>Categorias</CardTitle>
        <CardDescription>Ver y actualizar categoria de la plataforma</CardDescription>
    </div>
    <div className="flex flex-row">

        <Input
          placeholder="Filtrar categorias"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />

<CreateCategoryDialog />

      </div>

</CardHeader>
  <CardContent>
  <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('id')} className="cursor-pointer">
              ID <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </TableHead>
            <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
              Nombre <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </TableHead>
            <TableHead onClick={() => handleSort('description')} className="cursor-pointer">
              Descripcion <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.id}</TableCell>
              <TableCell>{category.name.toUpperCase()}</TableCell>
              <TableCell>{category.description.toUpperCase()}</TableCell>
              <TableCell>
                <EditCategoryDialog category={category} />
                <DeleteCategoryDialog categoryId={category.id} />
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
            <PaginationPrevious onClick={() => fetchCategories(Math.max(currentPage - 1, 1))} />
          </PaginationItem>
          {totalPages > 6 ? (
            <>
              <PaginationItem>
                {/* <PaginationLink onClick={() => fetchUsers(1)} isActive={currentPage === 1}>
                  1
                </PaginationLink> */}

              </PaginationItem>
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
                    <PaginationLink onClick={() => fetchCategories(page)} isActive={currentPage === page}>
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
                <PaginationLink onClick={() => fetchCategories(i + 1)} isActive={currentPage === i + 1}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))
          )}
          <PaginationItem>
            <PaginationNext onClick={() => fetchCategories(Math.min(currentPage + 1, totalPages))} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
        </CardFooter>
</Card>

    </div>
  )
}