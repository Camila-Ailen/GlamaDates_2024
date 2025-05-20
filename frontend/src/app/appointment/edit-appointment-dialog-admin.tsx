"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Edit, Loader2, Package, Pencil, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import useEditStore from "../store/useEditStore"
import usePackageStore from "../store/usePackageStore"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import useAppointmentStore from "../store/useAppointmentStore"

interface ProfessionalWorkstation {
  selectedProfessional: {
    id: number
    firstName: string
    lastName: string
    email: string
    birthdate: string | null
    gender: string
    phone: string
    branchOfficeId: number | null
  }[]
  selectedWorkstation: {
    id: number
    name: string
    description: string
    state: string
  }[]
}

export function EditAppointmentDialogAdmin({ appointment }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date(appointment.datetimeStart))
  const [selectedPackage, setSelectedPackage] = useState(appointment.package)
  const [activeTab, setActiveTab] = useState("general")
  const [serviceData, setServiceData] = useState<Record<number, ProfessionalWorkstation>>({})
  const [selectedProfessionals, setSelectedProfessionals] = useState<Record<number, number>>({})
  const [selectedWorkstations, setSelectedWorkstations] = useState<Record<number, number>>({})
  const [packageDialogOpen, setPackageDialogOpen] = useState(false)
  const [packageFilter, setPackageFilter] = useState("")

  const { packages, fetchPackage, isLoading: packagesLoading } = usePackageStore()
  const {
    fetchRearrange,
    rearrangeAppointment,
    fetchProfessionalsAndWorkstations,
    updateAppointmentDetail,
    isAvailable,
    setAppointment,
    openEditDialog,
    isOpenEdit,
  } = useEditStore()

  // Agregar el useAppointmentStore
  const { fetchOneAppointment } = useAppointmentStore()

  // Inicializar los valores seleccionados cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      fetchPackage()

      // Inicializar los profesionales y estaciones de trabajo seleccionados
      if (appointment.details && Array.isArray(appointment.details)) {
        const profMap: Record<number, number> = {}
        const workMap: Record<number, number> = {}

        appointment.details.forEach((detail) => {
          if (detail.employee && detail.employee.id) {
            profMap[detail.id] = detail.employee.id
          }
          if (detail.workstation && detail.workstation.id) {
            workMap[detail.id] = detail.workstation.id
          }
        })

        setSelectedProfessionals(profMap)
        setSelectedWorkstations(workMap)
      }
    }
  }, [open, fetchPackage, appointment])

  // Cargar datos de profesionales y estaciones de trabajo para cada servicio
  useEffect(() => {
    const loadServiceData = async () => {
      if (open && activeTab === "services" && appointment.details && Array.isArray(appointment.details)) {
        const newServiceData: Record<number, ProfessionalWorkstation> = {}

        for (const detail of appointment.details) {
          try {
            const data = await fetchProfessionalsAndWorkstations(appointment.datetimeStart, detail.service.id)

            if (data) {
              newServiceData[detail.id] = data
            }
          } catch (error) {
            console.error(`Error fetching data for service ${detail.service.id}:`, error)
          }
        }

        setServiceData(newServiceData)
      }
    }

    loadServiceData()
  }, [open, activeTab, appointment, fetchProfessionalsAndWorkstations])

  // Modificar la función handleEdit para usar fetchPackageAvailability
  const handleEdit = () => {
    console.log("Editando cita")
    setAppointment(appointment.id)
    console.log("Cita seleccionada:", appointment.id)

    // Si hay un paquete seleccionado, verificar disponibilidad
    if (selectedPackage) {
      const formattedDate = format(new Date(appointment.datetimeStart), "yyyy-MM-dd'T'HH:mm:ss")
      fetchRearrange({
        packageId: selectedPackage.id,
        datetime: formattedDate,
      })
    }

    // Abrir el diálogo de edición
    openEditDialog()
  }

  const handlePackageChange = (pkg) => {
    setSelectedPackage(pkg)
    setPackageDialogOpen(false)

    // Si hay una fecha seleccionada, verificar disponibilidad y abrir el diálogo de edición
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss")
      fetchRearrange({
        packageId: pkg.id,
        datetime: formattedDate,
      }).then(() => {
        setAppointment(appointment.id)
        openEditDialog()
      })
    } else {
      // Si no hay fecha, solo establecer la cita y abrir el diálogo
      setAppointment(appointment.id)
      openEditDialog()
    }
  }

  const handleDateTimeChange = async () => {
    if (date && selectedPackage) {
      const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss")
      await fetchRearrange({
        packageId: selectedPackage.id,
        datetime: formattedDate,
      })

      // Abrir el diálogo de edición independientemente del resultado de disponibilidad
      setAppointment(appointment.id)
      openEditDialog()
    }
  }

  // Modificar la función handleSave para actualizar los datos después de guardar
  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Guardar cambios generales (paquete y fecha/hora)
      if (activeTab === "general" && date) {
        const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss")

        await rearrangeAppointment({
          id: appointment.id,
          datetimeStart: formattedDate,
          packageId: selectedPackage.id,
        })

        // Actualizar la cita después de guardar
        const updatedAppointment = await fetchOneAppointment(appointment.id)
        if (updatedAppointment) {
          // Actualizar la fecha en el estado local
          setDate(new Date(updatedAppointment.datetimeStart))
        }
      }

      // Guardar cambios de servicios (profesionales y estaciones de trabajo)
      if (activeTab === "services" && appointment.details) {
        for (const detail of appointment.details) {
          const detailId = detail.id
          const employeeId = selectedProfessionals[detailId]
          const workstationId = selectedWorkstations[detailId]

          if (employeeId && workstationId) {
            await updateAppointmentDetail(detailId, employeeId.toString(), workstationId.toString())
          }
        }
      }

      // No cerramos el diálogo principal si venimos de editar fecha/hora
      if (!isOpenEdit) {
        setOpen(false)
      }
    } catch (error) {
      console.error("Error al guardar los cambios:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar paquetes según el texto de búsqueda
  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(packageFilter.toLowerCase()) ||
      pkg.description.toLowerCase().includes(packageFilter.toLowerCase()),
  )

  // Agregar este useEffect después de los otros useEffect
  useEffect(() => {
    // Cuando se cierra el diálogo de edición, actualizar la fecha si cambió
    if (!isOpenEdit && appointment) {
      // Recargar los datos de la cita para reflejar los cambios
      const loadUpdatedAppointment = async () => {
        try {
          const updatedAppointment = await fetchOneAppointment(appointment.id)
          if (updatedAppointment) {
            setDate(new Date(updatedAppointment.datetimeStart))
          }
        } catch (error) {
          console.error("Error al cargar la cita actualizada:", error)
        }
      }

      loadUpdatedAppointment()
    }
  }, [isOpenEdit, appointment, fetchOneAppointment])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Pencil className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar cita</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="sr-only">Editar cita</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Editar Cita #{appointment.id}</DialogTitle>
            <DialogDescription>
              Cliente: {appointment.client.firstName} {appointment.client.lastName}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="mt-4" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Información General</TabsTrigger>
              <TabsTrigger value="services">Servicios</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Paquete</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 p-2 rounded-md">
                      <p className="font-medium">{selectedPackage.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedPackage.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setPackageDialogOpen(true)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Cambiar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <div className="bg-purple-50 p-4 rounded-lg flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-700">Fecha y hora</p>
                    <p className="font-medium text-purple-800">
                      {format(new Date(appointment.datetimeStart), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                      <br />
                      {format(new Date(appointment.datetimeStart), "HH:mm")} hs
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                  onClick={handleEdit}
                >
                  Cambiar fecha y hora
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-4 pt-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Asignación de profesionales y estaciones de trabajo</h3>

                {appointment.details &&
                  Array.isArray(appointment.details) &&
                  appointment.details.map((detail) => (
                    <Card key={detail.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{detail.service.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`professional-${detail.id}`}>Profesional</Label>
                            <Select
                              value={selectedProfessionals[detail.id]?.toString() || ""}
                              onValueChange={(value) =>
                                setSelectedProfessionals({
                                  ...selectedProfessionals,
                                  [detail.id]: Number.parseInt(value),
                                })
                              }
                            >
                              <SelectTrigger id={`professional-${detail.id}`}>
                                <SelectValue placeholder="Seleccionar profesional" />
                              </SelectTrigger>
                              <SelectContent>
                                {serviceData[detail.id]?.selectedProfessional?.map((prof) => (
                                  <SelectItem key={prof.id} value={prof.id.toString()}>
                                    ID: {prof.id} - {prof.firstName} {prof.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`workstation-${detail.id}`}>Estación de trabajo</Label>
                            <Select
                              value={selectedWorkstations[detail.id]?.toString() || ""}
                              onValueChange={(value) =>
                                setSelectedWorkstations({
                                  ...selectedWorkstations,
                                  [detail.id]: Number.parseInt(value),
                                })
                              }
                            >
                              <SelectTrigger id={`workstation-${detail.id}`}>
                                <SelectValue placeholder="Seleccionar estación" />
                              </SelectTrigger>
                              <SelectContent>
                                {serviceData[detail.id]?.selectedWorkstation?.map((station) => (
                                  <SelectItem key={station.id} value={station.id.toString()}>
                                    {station.name} - {station.description}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading || isAvailable === false}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para seleccionar paquete */}
      <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Seleccionar Paquete</DialogTitle>
            <DialogDescription>Elige el paquete para esta cita</DialogDescription>
          </DialogHeader>

          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paquetes..."
              className="pl-9"
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[50vh] pr-4">
              {packagesLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredPackages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron paquetes que coincidan con la búsqueda
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {filteredPackages.map((pkg) => (
                    <Card
                      key={pkg.id}
                      className={cn(
                        "cursor-pointer hover:border-primary transition-colors",
                        selectedPackage.id === pkg.id && "border-primary bg-primary/5",
                      )}
                      onClick={() => handlePackageChange(pkg)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className="mb-1" variant="outline">
                              ID: {pkg.id}
                            </Badge>
                            <CardTitle className="text-lg">{pkg.name}</CardTitle>
                          </div>
                          {selectedPackage.id === pkg.id && <Badge className="bg-primary">Seleccionado</Badge>}
                        </div>
                        <CardDescription>{pkg.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">${pkg.price?.toFixed(2) || "0.00"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span>{pkg.duration || 0} minutos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-purple-600" />
                            <span>{pkg.services?.length || 0} servicios</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setPackageDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
