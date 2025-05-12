"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Save, Clock, Calendar, Store, Percent } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TimePickerInput } from "./time-picker-input"

// Esquema de validación para las preferencias del sistema
const systemPreferencesSchema = z
  .object({
    // Intervalo de minutos
    minuteInterval: z.enum(["10", "20", "30", "40", "50", "60"], {
      required_error: "Debes seleccionar un intervalo de minutos",
    }),

    // Máximo días de reserva
    maxReservationDays: z
      .number()
      .int("Debe ser un número entero")
      .positive("Debe ser mayor a 0")
      .max(365, "El máximo es 365 días"),

    // Tipo de horario
    scheduleType: z.enum(["continuous", "split"], {
      required_error: "Debes seleccionar un tipo de horario",
    }),

    // Horarios
    openingTime1: z.string().min(1, "Requerido"),
    closingTime1: z.string().min(1, "Requerido"),
    openingTime2: z.string().min(1, "Requerido").optional(),
    closingTime2: z.string().min(1, "Requerido").optional(),

    // Días abiertos
    openDays: z
      .array(
        z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], {
          required_error: "Selecciona al menos un día",
        }),
      )
      .min(1, "Debes seleccionar al menos un día"),

    // Descuentos
    dayTimeDiscount: z.number().min(0, "El mínimo es 0%").max(100, "El máximo es 100%"),

    dayOnlyDiscount: z.number().min(0, "El mínimo es 0%").max(100, "El máximo es 100%"),
  })
  .refine(
    (data) => {
      // Validar que el horario de cierre sea posterior al de apertura
      const opening1 = data.openingTime1
      const closing1 = data.closingTime1

      if (opening1 >= closing1) {
        return false
      }

      // Si es horario partido, validar el segundo bloque
      if (data.scheduleType === "split") {
        const opening2 = data.openingTime2
        const closing2 = data.closingTime2

        if (!opening2 || !closing2 || opening2 <= closing1 || opening2 >= closing2) {
          return false
        }
      }

      return true
    },
    {
      message:
        "Los horarios no son válidos. Verifica que el cierre sea posterior a la apertura y que no haya solapamientos.",
      path: ["closingTime1"], // Mostrar el error en este campo
    },
  )

// Días de la semana para el selector
const daysOfWeek = [
  { id: "monday", label: "Lunes" },
  { id: "tuesday", label: "Martes" },
  { id: "wednesday", label: "Miércoles" },
  { id: "thursday", label: "Jueves" },
  { id: "friday", label: "Viernes" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
]

export function SystemPreferences() {
  const [isLoading, setIsLoading] = useState(false)

  // Inicializar el formulario con valores predeterminados
  const form = useForm<z.infer<typeof systemPreferencesSchema>>({
    resolver: zodResolver(systemPreferencesSchema),
    defaultValues: {
      minuteInterval: "30",
      maxReservationDays: 30,
      scheduleType: "continuous",
      openingTime1: "08:00",
      closingTime1: "20:00",
      openDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      dayTimeDiscount: 10,
      dayOnlyDiscount: 5,
    },
  })

  // Obtener el tipo de horario seleccionado
  const scheduleType = form.watch("scheduleType")

  // Función para cargar las preferencias desde el servidor
  const loadPreferences = async () => {
    setIsLoading(true)
    try {
      // Aquí iría la llamada a la API para obtener las preferencias
      // const response = await fetch('/api/preferences');
      // const data = await response.json();

      // Simulamos una carga de datos
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Ejemplo de datos que vendrían del servidor
      const mockData: z.infer<typeof systemPreferencesSchema> = {
        minuteInterval: "30",
        maxReservationDays: 30,
        scheduleType: "continuous",
        openingTime1: "08:00",
        closingTime1: "20:00",
        openDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        dayTimeDiscount: 10,
        dayOnlyDiscount: 5,
        // openingTime2 y closingTime2 pueden omitirse si no aplica
      }

      // Actualizar el formulario con los datos recibidos
      form.reset(mockData)
    } catch (error) {
      console.error("Error al cargar las preferencias:", error)
      toast.error("Error al cargar las preferencias del sistema")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar las preferencias al montar el componente
  useEffect(() => {
    loadPreferences()
  }, [])

  // Función para guardar las preferencias
  const onSubmit = async (values: z.infer<typeof systemPreferencesSchema>) => {
    setIsLoading(true)
    try {
      // Aquí iría la llamada a la API para guardar las preferencias
      // await fetch('/api/preferences', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values),
      // });

      // Simulamos una operación de guardado
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Preferencias guardadas correctamente")
    } catch (error) {
      console.error("Error al guardar las preferencias:", error)
      toast.error("Error al guardar las preferencias del sistema")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Preferencias del Sistema</CardTitle>
          <CardDescription>Configura los parámetros generales del sistema de reservas</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="schedule">Horarios</TabsTrigger>
                  <TabsTrigger value="days">Días</TabsTrigger>
                  <TabsTrigger value="discounts">Descuentos</TabsTrigger>
                </TabsList>

                {/* Pestaña General */}
                <TabsContent value="general" className="space-y-6">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Clock className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Configuración General</h3>
                  </div>
                  <Separator />

                  {/* Intervalo de minutos */}
                  <FormField
                    control={form.control}
                    name="minuteInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervalo de minutos</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un intervalo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="10">10 minutos</SelectItem>
                            <SelectItem value="20">20 minutos</SelectItem>
                            <SelectItem value="30">30 minutos</SelectItem>
                            <SelectItem value="40">40 minutos</SelectItem>
                            <SelectItem value="50">50 minutos</SelectItem>
                            <SelectItem value="60">60 minutos</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Define el intervalo de tiempo entre cada reserva disponible</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Máximo días de reserva */}
                  <FormField
                    control={form.control}
                    name="maxReservationDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máximo días de reserva</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={365}
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          Número máximo de días a futuro en los que se pueden realizar reservas (1-365)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Pestaña Horarios */}
                <TabsContent value="schedule" className="space-y-6">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Calendar className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Configuración de Horarios</h3>
                  </div>
                  <Separator />

                  {/* Tipo de horario */}
                  <FormField
                    control={form.control}
                    name="scheduleType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Tipo de horario</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            disabled={isLoading}
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="continuous" />
                              </FormControl>
                              <FormLabel className="font-normal">Horario corrido</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="split" />
                              </FormControl>
                              <FormLabel className="font-normal">Dos bloques horarios</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Primer bloque horario */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="openingTime1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horario de apertura</FormLabel>
                          <FormControl>
                            <TimePickerInput value={field.value} onChange={field.onChange} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="closingTime1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horario de cierre</FormLabel>
                          <FormControl>
                            <TimePickerInput value={field.value} onChange={field.onChange} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Segundo bloque horario (solo si es horario partido) */}
                  {scheduleType === "split" && (
                    <>
                      <Separator />
                      <h4 className="text-sm font-medium text-muted-foreground">Segundo bloque horario</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="openingTime2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Horario de apertura</FormLabel>
                              <FormControl>
                                <TimePickerInput
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="closingTime2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Horario de cierre</FormLabel>
                              <FormControl>
                                <TimePickerInput
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* Pestaña Días */}
                <TabsContent value="days" className="space-y-6">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Store className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Días de Apertura</h3>
                  </div>
                  <Separator />

                  {/* Días abiertos */}
                  <FormField
                    control={form.control}
                    name="openDays"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Días de apertura</FormLabel>
                          <FormDescription>Selecciona los días en los que el local estará abierto</FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {daysOfWeek.map((day) => (
                            <FormField
                              key={day.id}
                              control={form.control}
                              name="openDays"
                              render={({ field }) => {
                                return (
                                  <FormItem key={day.id} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(day.id as any)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, day.id])
                                            : field.onChange(field.value?.filter((value) => value !== day.id))
                                        }}
                                        disabled={isLoading}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{day.label}</FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Pestaña Descuentos */}
                <TabsContent value="discounts" className="space-y-6">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Percent className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Configuración de Descuentos</h3>
                  </div>
                  <Separator />

                  {/* Descuento por día y horario */}
                  <FormField
                    control={form.control}
                    name="dayTimeDiscount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descuento por día y horario recomendado (%)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                              className="pr-8"
                              disabled={isLoading}
                            />
                            <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>Porcentaje de descuento aplicado por día y horario específico</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Descuento solo por día */}
                  <FormField
                    control={form.control}
                    name="dayOnlyDiscount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descuento solo por día recomendado (%)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                              className="pr-8"
                              disabled={isLoading}
                            />
                            <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Porcentaje de descuento aplicado solo por día (por recomendación)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={loadPreferences} disabled={isLoading}>
                Restablecer
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar preferencias
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
