"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import useRoleStore, { type Role } from "../store/useRoleStore"
import usePermissionStore from "@/app/store/usePermissionStore"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Pencil, Shield } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

const editRoleSchema = z.object({
  role: z.string().min(2, { message: "El nombre del rol debe tener al menos 2 caracteres" }),
  description: z.string().optional(),
  permissions: z.array(z.number()).min(1, { message: "Debe seleccionar al menos un permiso" }),
})

type RoleFormValues = {
  role: string
  description?: string
  permissions: number[]
}

export function EditRoleDialog({ role }: { role: Role }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateRole = useRoleStore((state) => state.updateRole)
  const { permissions, isLoading: permissionsLoading, fetchPermissions } = usePermissionStore()

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      role: role.role,
      description: role.description || "",
      permissions: role.permissions?.map((p) => p.id) || [],
    },
  })

  useEffect(() => {
    if (isOpen) {
      fetchPermissions()
    }
  }, [fetchPermissions, isOpen])

  const onSubmit = async (data: RoleFormValues) => {
    setIsSubmitting(true)
    try {
      const roleData = {
        id: role.id,
        role: data.role.toUpperCase(),
        description: data.description || undefined,
        permissions: data.permissions,
      }

      const success = await updateRole(roleData)
      if (success) {
        setIsOpen(false)
      }
    } catch (error) {
      console.error("Error updating role:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 border-blue-200 text-blue-700 hover:bg-blue-50">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-700 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Editar Rol
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
            <div className="space-y-4 overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Nombre del Rol
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Administrador"
                        {...field}
                        className="border-blue-200 focus-visible:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción del rol (opcional)"
                        {...field}
                        className="border-blue-200 focus-visible:ring-blue-500 min-h-[80px]"
                      />
                    </FormControl>
                    <FormDescription>Descripción opcional del rol y sus responsabilidades</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Permisos
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormDescription>Seleccione los permisos que tendrá este rol</FormDescription>
                    <FormControl>
                      {permissionsLoading ? (
                        <div className="flex items-center justify-center p-6 border rounded-md border-blue-200">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                          <span className="text-sm">Cargando permisos...</span>
                        </div>
                      ) : !Array.isArray(permissions) || permissions.length === 0 ? (
                        <div className="p-6 text-center border rounded-md border-blue-200">
                          <p className="text-gray-500 text-sm">No hay permisos disponibles</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-48 w-full border rounded-md border-blue-200 p-4">
                          <div className="space-y-3">
                            {permissions.map((permission) => (
                              <FormField
                                key={permission.id}
                                control={form.control}
                                name="permissions"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={permission.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(permission.id)}
                                          onCheckedChange={(checked) => {
                                            const currentValue = field.value || []
                                            return checked
                                              ? field.onChange([...currentValue, permission.id])
                                              : field.onChange(currentValue?.filter((value) => value !== permission.id))
                                          }}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-medium cursor-pointer">
                                          {permission.permission}
                                        </FormLabel>
                                        {permission.description && (
                                          <p className="text-xs text-gray-500">{permission.description}</p>
                                        )}
                                      </div>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || permissionsLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Rol"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
