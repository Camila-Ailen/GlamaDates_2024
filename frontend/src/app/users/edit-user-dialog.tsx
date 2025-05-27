"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import useUserStore, { type User } from "../store/useUserStore"
import useRoleStore from "../store/useRoleStore"
import useCategoryStore from "../store/useCategoryStore"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Pencil, PenIcon as UserPen } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Schema dinámico que valida categorías solo si el rol es "profesional"
const createUserSchema = (selectedRole: string) =>
  z.object({
    firstName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    lastName: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
    email: z.string().email({ message: "Debe ser un correo electrónico válido" }),
    gender: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().optional(),
    roleId: z.string().min(1, { message: "Debe seleccionar un rol" }),
    categories:
      selectedRole === "profesional"
        ? z.array(z.number()).min(1, { message: "Debe seleccionar al menos una categoría" })
        : z.array(z.number()).optional(),
  })

type UserFormValues = {
  firstName: string
  lastName: string
  email: string
  gender?: string
  phone?: string
  password?: string
  roleId: string
  categories?: number[]
}

export function EditUserDialog({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState(user.role.role)

  const updateUser = useUserStore((state) => state.updateUser)
  const { roles, isLoading: rolesLoading, fetchRoles } = useRoleStore()
  const { categories, isLoading: categoriesLoading, fetchCategories } = useCategoryStore()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(createUserSchema(selectedRole)),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender || "",
      phone: user.phone || "",
      password: "",
      roleId: user.role.id.toString(),
      categories: user.categories?.map((cat) => cat.id) || [],
    },
  })

  useEffect(() => {
    fetchRoles()
    fetchCategories()
  }, [fetchRoles, fetchCategories])

  // Actualizar el schema cuando cambie el rol seleccionado
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "roleId") {
        const role = roles.find((r) => r.id.toString() === value.roleId)
        const roleName = role?.role || ""
        setSelectedRole(roleName)

        // Limpiar categorías si no es profesional
        if (roleName !== "profesional") {
          form.setValue("categories", [])
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, roles])

  const isProfessionalRole = selectedRole === "profesional"

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true)
    try {
      const userData = {
        id: user.id,
        firstName: data.firstName.toUpperCase(),
        lastName: data.lastName.toUpperCase(),
        email: data.email.toLowerCase(),
        gender: data.gender,
        phone: data.phone,
        role: { id: Number.parseInt(data.roleId) },
        categories: data.categories || [],
        ...(data.password && { password: data.password }),
      }

      const success = await updateUser(userData)
      if (success) {
        setIsOpen(false)
      }
    } catch (error) {
      console.error("Error updating user:", error)
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
            <UserPen className="h-5 w-5" />
            Editar Usuario
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
            <div className="space-y-4 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Nombre
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" {...field} className="border-blue-200 focus-visible:ring-blue-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Apellido
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Pérez" {...field} className="border-blue-200 focus-visible:ring-blue-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Correo Electrónico
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="juan.perez@ejemplo.com"
                        {...field}
                        className="border-blue-200 focus-visible:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-blue-200 focus:ring-blue-500">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Femenino</SelectItem>
                            <SelectItem value="O">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1234567890"
                          {...field}
                          className="border-blue-200 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormDescription>Dejar en blanco para mantener la contraseña actual</FormDescription>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
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
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Rol
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormDescription>Seleccione un rol para el usuario</FormDescription>
                    <FormControl>
                      {rolesLoading ? (
                        <div className="flex items-center justify-center p-3 border rounded-md border-blue-200">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                          <span className="text-sm">Cargando roles...</span>
                        </div>
                      ) : !Array.isArray(roles) || roles.length === 0 ? (
                        <div className="p-3 text-center border rounded-md border-blue-200">
                          <p className="text-gray-500 text-sm">No hay roles disponibles</p>
                        </div>
                      ) : (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-blue-200 focus:ring-blue-500">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{role.role.toUpperCase()}</span>
                                  {role.description && (
                                    <span className="text-xs text-gray-500">{role.description}</span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de categorías - solo visible si el rol es "profesional" */}
              {isProfessionalRole && (
                <FormField
                  control={form.control}
                  name="categories"
                  render={() => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Categorías
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        Seleccione las categorías en las que el profesional puede trabajar
                      </FormDescription>
                      <FormControl>
                        {categoriesLoading ? (
                          <div className="flex items-center justify-center p-3 border rounded-md border-blue-200">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                            <span className="text-sm">Cargando categorías...</span>
                          </div>
                        ) : !Array.isArray(categories) || categories.length === 0 ? (
                          <div className="p-3 text-center border rounded-md border-blue-200">
                            <p className="text-gray-500 text-sm">No hay categorías disponibles</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 p-3 border rounded-md border-blue-200 max-h-32 overflow-y-auto">
                            {categories.map((category) => (
                              <FormField
                                key={category.id}
                                control={form.control}
                                name="categories"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={category.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(category.id)}
                                          onCheckedChange={(checked) => {
                                            const currentValue = field.value || []
                                            return checked
                                              ? field.onChange([...currentValue, category.id])
                                              : field.onChange(currentValue?.filter((value) => value !== category.id))
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal cursor-pointer">
                                        {category.name}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
              <Button type="submit" disabled={isSubmitting || rolesLoading} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Usuario"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
