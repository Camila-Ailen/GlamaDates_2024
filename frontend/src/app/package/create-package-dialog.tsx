"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import usePackageStore from "../store/usePackageStore"
import useServiceStore from "../store/useServiceStore"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Package, Plus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

const packageSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  services: z.array(z.string()).min(1, { message: "Debe seleccionar al menos un servicio" }),
})

type PackageFormValues = z.infer<typeof packageSchema>

export function CreatePackageDialog({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)

  const createPackage = usePackageStore((state) => state.createPackage)
  const { services, isLoading: servicesLoading, fetchServices } = useServiceStore()

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      description: "",
      services: [],
    },
  })

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Calcular precio y duración total cuando cambian los servicios seleccionados
  useEffect(() => {
    let price = 0
    let duration = 0

    selectedServices.forEach((serviceId) => {
      const service = services.find((s) => s.id.toString() === serviceId)
      if (service) {
        price += service.price
        duration += service.duration
      }
    })

    setTotalPrice(price)
    setTotalDuration(duration)
  }, [selectedServices, services])

  const onSubmit = async (data: PackageFormValues) => {
    setIsSubmitting(true)
    try {
      // Calcular precio y duración total
      const packageData = {
        ...data,
        price: totalPrice,
        duration: totalDuration,
      }

      await createPackage(packageData)
      form.reset()
      setSelectedServices([])
      setIsOpen(false)
    } catch (error) {
      console.error("Error creating package:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices((prev) => [...prev, serviceId])
      form.setValue("services", [...selectedServices, serviceId])
    } else {
      setSelectedServices((prev) => prev.filter((id) => id !== serviceId))
      form.setValue(
        "services",
        selectedServices.filter((id) => id !== serviceId),
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children || <Button>Crear Paquete</Button>}</DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-purple-700 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Crear Nuevo Paquete
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
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Paquete de belleza completo"
                        {...field}
                        className="border-purple-200 focus-visible:ring-purple-500"
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
                        placeholder="Describa el paquete..."
                        {...field}
                        className="border-purple-200 focus-visible:ring-purple-500 min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="services"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Servicios incluidos</FormLabel>
                      <FormDescription>Seleccione los servicios que formarán parte de este paquete</FormDescription>
                    </div>

                    {servicesLoading ? (
                      <div className="flex items-center justify-center p-4 border rounded-md border-purple-200">
                        <Loader2 className="h-5 w-5 animate-spin text-purple-500 mr-2" />
                        <span>Cargando servicios...</span>
                      </div>
                    ) : services.length === 0 ? (
                      <div className="p-4 text-center border rounded-md border-purple-200">
                        <p className="text-gray-500">No hay servicios disponibles</p>
                        <p className="text-sm text-gray-400 mt-1">Debe crear servicios antes de crear paquetes</p>
                      </div>
                    ) : (
                      <>
                        <div className="border rounded-md border-purple-200 overflow-hidden">
                          <div className="bg-purple-50 p-2 border-b border-purple-200 flex justify-between items-center">
                            <span className="text-sm font-medium text-purple-700">Seleccione servicios</span>
                            {selectedServices.length > 0 && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-700">
                                {selectedServices.length} seleccionados
                              </Badge>
                            )}
                          </div>

                          <ScrollArea className="h-[200px]">
                            <div className="p-2 space-y-1">
                              {services.map((service) => (
                                <div
                                  key={service.id}
                                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-purple-50"
                                >
                                  <Checkbox
                                    id={`service-${service.id}`}
                                    checked={selectedServices.includes(service.id.toString())}
                                    onCheckedChange={(checked) =>
                                      handleServiceToggle(service.id.toString(), checked as boolean)
                                    }
                                    className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                  />
                                  <div className="flex-1 grid grid-cols-3 gap-2">
                                    <label
                                      htmlFor={`service-${service.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 col-span-2"
                                    >
                                      {service.name}
                                      <span
                                        className="block text-xs text-gray-500 mt-1 truncate"
                                        title={service.description}
                                      >
                                        {service.description}
                                      </span>
                                    </label>
                                    <div className="text-right">
                                      <span className="text-sm font-medium">{formatCurrency(service.price)}</span>
                                      <span className="block text-xs text-gray-500">{service.duration} min</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>

                        {selectedServices.length > 0 && (
                          <div className="mt-4 p-3 bg-purple-50 rounded-md border border-purple-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-purple-700">Resumen del paquete</span>
                              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                {selectedServices.length} {selectedServices.length === 1 ? "servicio" : "servicios"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Duración total:</span>
                                <span className="font-medium">{totalDuration} minutos</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Precio total:</span>
                                <span className="font-medium">{formatCurrency(totalPrice)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
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
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || selectedServices.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Paquete
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

