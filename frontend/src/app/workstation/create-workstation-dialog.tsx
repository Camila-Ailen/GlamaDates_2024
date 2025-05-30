"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import useWorkstationStore from "../store/useWorkstationStore"
import useCategoryStore from "../store/useCategoryStore"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Plus, Monitor } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

const createWorkstationSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  description: z.string().optional(),
  state: z.enum(["ACTIVO", "INACTIVO", "ELIMINADO"]).optional(),
  categories: z.array(z.number()).min(1, { message: "Debe seleccionar al menos una categoría" }),
})

type WorkstationFormValues = {
  name: string
  description?: string
  state?: "ACTIVO" | "INACTIVO" | "ELIMINADO"
  categories: number[]
}

export function CreateWorkstationDialog({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createWorkstation = useWorkstationStore((state) => state.createWorkstation)
  const { categories, isLoading: categoriesLoading, fetchCategories } = useCategoryStore()

  const form = useForm<WorkstationFormValues>({
    resolver: zodResolver(createWorkstationSchema),
    defaultValues: {
      name: "",
      description: "",
      state: "ACTIVO",
      categories: [],
    },
  })

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [fetchCategories, isOpen])

  const onSubmit = async (data: WorkstationFormValues) => {
    setIsSubmitting(true)
    try {
      const workstationData = {
        name: data.name.toUpperCase(),
        description: data.description || undefined,
        state: data.state ?? "ACTIVO",
        categories: data.categories,
      }

      const success = await createWorkstation(workstationData)
      if (success) {
        form.reset()
        setIsOpen(false)
      }
    } catch (error) {
      console.error("Error creating workstation:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children || <Button>Crear Estación de Trabajo</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-700 flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Crear Nueva Estación de Trabajo
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
            <div className="space-y-4 overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Nombre de la Estación
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Estación Principal"
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
                        placeholder="Descripción de la estación de trabajo (opcional)"
                        {...field}
                        className="border-blue-200 focus-visible:ring-blue-500 min-h-[80px]"
                      />
                    </FormControl>
                    <FormDescription>Descripción opcional de la estación de trabajo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-200 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Estado Activo</FormLabel>
                      <FormDescription>La estación de trabajo estará disponible para reservas</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === "ACTIVO"}
                        onCheckedChange={(checked) => field.onChange(checked ? "ACTIVO" : "INACTIVO")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

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
                      Seleccione las categorías que pueden usar esta estación de trabajo
                    </FormDescription>
                    <FormControl>
                      {categoriesLoading ? (
                        <div className="flex items-center justify-center p-6 border rounded-md border-blue-200">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                          <span className="text-sm">Cargando categorías...</span>
                        </div>
                      ) : !Array.isArray(categories) || categories.length === 0 ? (
                        <div className="p-6 text-center border rounded-md border-blue-200">
                          <p className="text-gray-500 text-sm">No hay categorías disponibles</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-48 w-full border rounded-md border-blue-200 p-4">
                          <div className="space-y-3">
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
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-medium cursor-pointer">
                                          {category.name}
                                        </FormLabel>
                                        {category.description && (
                                          <p className="text-xs text-gray-500">{category.description}</p>
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
                onClick={() => {
                  setIsOpen(false)
                  form.reset()
                }}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || categoriesLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Estación
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
