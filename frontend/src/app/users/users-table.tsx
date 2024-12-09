"use client";

import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EditUserDialog } from "./edit-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { ArrowUpDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateUserDialog } from "./create-user-dialog";
import useUserStore from "../store/useUserStore";
import useAuthStore from "../store/useAuthStore";

export function UsersTable() {
  const {
    users,
    total,
    currentPage,
    pageSize,
    isLoading,
    error,
    orderBy,
    orderType,
    filter,
    fetchUsers,
    setOrderBy,
    setOrderType,
    setFilter,
  } = useUserStore();

  const token = useAuthStore((state) => state.token);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  useEffect(() => {
    if (token) {
      fetchUsers(undefined);
    }
  }, [fetchUsers, orderBy, orderType, filter, token]);

  if (isLoading) return <div>Cargando...</div>;
  //   if (error) return <div>Ocurrió un error: {error}</div>

  const totalPages = Math.ceil(total / pageSize);

  const handleSort = (field: string) => {
    if (field === orderBy) {
      setOrderType(orderType === "ASC" ? "DESC" : "ASC");
    } else {
      setOrderBy(field);
      setOrderType("ASC");
    }
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex-row justify-between">
          <div>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>
              Ver y actualizar usuarios de la plataforma
            </CardDescription>
          </div>
          <div className="flex flex-row">
            <Input
              placeholder="Filtrar usuarios"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />

            {hasPermission("create:users") && <CreateUserDialog />}
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
                  onClick={() => handleSort("firstName")}
                  className="cursor-pointer"
                >
                  Nombre <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("lastName")}
                  className="cursor-pointer"
                >
                  Apellido <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("email")}
                  className="cursor-pointer"
                >
                  Correo <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("role")}
                  className="cursor-pointer"
                >
                  Rol <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.firstName.toUpperCase()}</TableCell>
                  <TableCell>{user.lastName.toUpperCase()}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role.role.toUpperCase()}</TableCell>
                  <TableCell>
                    {hasPermission("update:users") && (
                      <EditUserDialog user={user} />
                    )}
                    {hasPermission("delete:users") && (
                      <DeleteUserDialog userId={user.id} />
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
                    fetchUsers(Math.max(currentPage - 1, 1), token || undefined)
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
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2),
                    )
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => fetchUsers(page, token || undefined)}
                          isActive={currentPage === page}
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
                </>
              ) : (
                [...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => fetchUsers(i + 1, token || undefined)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    fetchUsers(
                      Math.min(currentPage + 1, totalPages),
                      token || undefined,
                    )
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  );
}
