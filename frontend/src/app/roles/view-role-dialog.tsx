"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Eye, Shield, Calendar, FileText, Key } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Role } from "../store/useRoleStore"

interface ViewRoleDialogProps {
  role: Role
}

export function ViewRoleDialog({ role }: ViewRoleDialogProps) {
  const [open, setOpen] = useState(false)

  // Agrupar permisos por categoría (basado en el prefijo antes de los dos puntos)
  const groupedPermissions =
    role.permissions?.reduce(
      (groups, permission) => {
        const [category] = permission.permission.split(":")
        const categoryName = category || "general"

        if (!groups[categoryName]) {
          groups[categoryName] = []
        }
        groups[categoryName].push(permission)
        return groups
      },
      {} as Record<string, typeof role.permissions>,
    ) || {}

  // Función para obtener el color del badge según la categoría
  const getCategoryColor = (category: string) => {
    const colors = {
      create: "bg-green-50 text-green-700 border-green-200",
      read: "bg-blue-50 text-blue-700 border-blue-200",
      update: "bg-yellow-50 text-yellow-700 border-yellow-200",
      delete: "bg-red-50 text-red-700 border-red-200",
      manage: "bg-purple-50 text-purple-700 border-purple-200",
      admin: "bg-gray-50 text-gray-700 border-gray-200",
    }
    return colors[category as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200"
  }

  // Función para obtener el nombre amigable de la categoría
  const getCategoryName = (category: string) => {
    const names = {
      create: "Crear",
      read: "Leer",
      update: "Actualizar",
      delete: "Eliminar",
      manage: "Gestionar",
      admin: "Administración",
      general: "General",
    }
    return names[category as keyof typeof names] || category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 border-green-200 text-green-700 hover:bg-green-50">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-700 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Detalles del Rol
          </DialogTitle>
          <DialogDescription>Información completa del rol y todos sus permisos asignados</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Información básica del rol */}
            <Card className="border-blue-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nombre del Rol</label>
                    <p className="text-lg font-semibold text-blue-700">{role.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID</label>
                    <p className="text-sm text-gray-700">#{role.id}</p>
                  </div>
                </div>

                {role.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Descripción</label>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{role.description}</p>
                  </div>
                )}

                {role.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Creado el{" "}
                      {new Date(role.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Permisos del rol */}
            <Card className="border-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-700 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Permisos Asignados
                </CardTitle>
                <CardDescription>
                  {role.permissions?.length || 0} permiso{(role.permissions?.length || 0) !== 1 ? "s" : ""} asignado
                  {(role.permissions?.length || 0) !== 1 ? "s" : ""} a este rol
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!role.permissions || role.permissions.length === 0 ? (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hay permisos asignados a este rol</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([category, permissions]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${getCategoryColor(category)} font-medium`}>
                            {getCategoryName(category)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {permissions.length} permiso{permissions.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                          {permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start gap-2 p-2 bg-gray-50 rounded-md border"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{permission.permission}</p>
                                {permission.description && (
                                  <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen estadístico */}
            <Card className="border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-700">Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">{role.permissions?.length || 0}</p>
                    <p className="text-xs text-blue-600">Total Permisos</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{Object.keys(groupedPermissions).length}</p>
                    <p className="text-xs text-green-600">Categorías</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-700">
                      {role.permissions?.filter((p) => p.permission.startsWith("create")).length || 0}
                    </p>
                    <p className="text-xs text-purple-600">Crear</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-700">
                      {role.permissions?.filter((p) => p.permission.startsWith("delete")).length || 0}
                    </p>
                    <p className="text-xs text-orange-600">Eliminar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex justify-end pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
