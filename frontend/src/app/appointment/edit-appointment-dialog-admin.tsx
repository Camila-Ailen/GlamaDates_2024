"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Edit, Loader2, Package, Pencil, Search, Clock, User, MapPin } from "lucide-react"
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
import { DollarSign } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import useAppointmentStore from "../store/useAppointmentStore"
import { EditAppointmentDialog } from "@/components/appointments/edit-appointment-dialog"

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
  const [date, setDate] = useState<Date | null>(appointment.datetimeStart ? new Date(appointment.datetimeStart) : null)
  const [selectedPackage, setSelectedPackage] = useState(appointment.package)
  const [activeTab, setActiveTab] = useState("general")
  const [serviceData, setServiceData] = useState<Record<number, ProfessionalWorkstation>>({})
  const [selectedProfessionals, setSelectedProfessionals] = useState<Record<number, number>>({})
  const [selectedWorkstations, setSelectedWorkstations] = useState<Record<number, number>>({})
  const [packageDialogOpen, setPackageDialogOpen] = useState(false)
  const [packageFilter, setPackageFilter] = useState("")
  const [editType, setEditType] = useState<"dateOnly" | "packageAndDate" | null>(null)

  // Estado local para controlar el diálogo de edición específico de este appointment
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { packages, fetchPackage, isLoading: packagesLoading } = usePackageStore()
  const {
    fetchRearrange,
    rearrangeAppointment,
    fetchProfessionalsAndWorkstations,
    updateAppointmentDetail,
    isAvailable,
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

  // Función para abrir el diálogo de edición de fecha/hora
  const handleEdit = () => {
    console.log("Editando cita - solo fecha y hora, ID:", appointment.id)
    setEditType("dateOnly")

    // Si hay un paquete seleccionado, verificar disponibilidad
    if (selectedPackage) {
      const formattedDate = format(new Date(appointment.datetimeStart), "yyyy-MM-dd'T'HH:mm:ss")
      fetchRearrange({
        packageId: selectedPackage.id,
        datetime: formattedDate,
      })
    }

    // Abrir el diálogo de edición local
    setIsEditDialogOpen(true)
  }

  const handlePackageChange = (pkg) => {
    setSelectedPackage(pkg)
    setPackageDialogOpen(false)
    setEditType("packageAndDate")

    console.log("Paquete seleccionado:", pkg, "para appointment:", appointment.id)

    // Verificar disponibilidad
    const formattedDate =
      date && date instanceof Date && !isNaN(date.getTime())
        ? format(date, "yyyy-MM-dd'T'HH:mm:ss")
        : format(new Date(appointment.datetimeStart), "yyyy-MM-dd'T'HH:mm:ss")

    fetchRearrange({
      packageId: pkg.id,
      datetime: formattedDate,
    })

    // Abrir el diálogo de edición local
    setIsEditDialogOpen(true)
  }

  // Función para cerrar el diálogo de edición
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditType(null)
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
      if (!isEditDialogOpen) {
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
    if (!isEditDialogOpen && appointment) {
      // Recargar los datos de la cita para reflejar los cambios
      const loadUpdatedAppointment = async () => {
        try {
          const updatedAppointment = await fetchOneAppointment(appointment.id)
          if (updatedAppointment) {
            setDate(new Date(updatedAppointment.datetimeStart))

            // Si estábamos editando el paquete y la fecha, ahora debemos guardar los cambios
            if (editType === "packageAndDate") {
              // Resetear el tipo de edición
              setEditType(null)
            }
          }
        } catch (error) {
          console.error("Error al cargar la cita actualizada:", error)
        }
      }

      loadUpdatedAppointment()
    }
  }, [isEditDialogOpen, appointment, fetchOneAppointment, editType])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="mr-2" title="Editar cita">
            <Pencil className="h-4 w-4 text-blue-900" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-lg -m-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-blue-700 flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Editar Cita #{appointment.id}
                </DialogTitle>
                <DialogDescription className="text-blue-600 mt-1">
                  Cliente: {appointment.client.firstName} {appointment.client.lastName}
                </DialogDescription>
              </div>
              <Badge variant="outline" className="bg-white/50">
                {appointment.state}
              </Badge>
            </div>
          </DialogHeader>

          <Tabs defaultValue="general" className="mt-4" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="general" className="data-[state=active]:bg-white">
                Información General
              </TabsTrigger>
              <TabsTrigger value="services" className="data-[state=active]:bg-white">
                Servicios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 pt-6">
              {/* Sección del Paquete */}
              <Card className="border-l-4 border-l-purple-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Paquete de Servicios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-purple-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-purple-900">{selectedPackage.name}</h3>
                        <p className="text-sm text-purple-700 mt-1">{selectedPackage.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">${appointment.total?.toFixed(2) || "0.00"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span>{appointment.details[0].durationNow || 0} min</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPackageDialogOpen(true)}
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Cambiar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sección de Fecha y Hora */}
              <Card className="border-l-4 border-l-blue-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Fecha y Hora
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Fecha programada</p>
                        <p className="text-lg font-semibold text-blue-900">
                          {format(new Date(appointment.datetimeStart), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                        <p className="text-blue-800 font-medium">
                          {format(new Date(appointment.datetimeStart), "HH:mm")} hs
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleEdit}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Cambiar fecha y hora
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-4 pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold">Asignación de Recursos</h3>
                </div>

                <ScrollArea className="h-[50vh] pr-4">
                  {appointment.details &&
                    Array.isArray(appointment.details) &&
                    appointment.details.map((detail, index) => (
                      <Card key={detail.id} className="border-l-4 border-l-indigo-400">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
                              {index + 1}
                            </div>
                            {detail.service.name}
                          </CardTitle>
                          <CardDescription>{detail.service.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`professional-${detail.id}`} className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Profesional
                              </Label>
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
                                      {prof.firstName} {prof.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`workstation-${detail.id}`} className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Estación de trabajo
                              </Label>
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
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="bg-gray-50 p-6 rounded-b-lg -m-6 mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || isAvailable === false}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para seleccionar paquete */}
      <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-t-lg -m-6 mb-4">
            <DialogTitle className="text-xl font-bold text-purple-700 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Seleccionar Paquete
            </DialogTitle>
            <DialogDescription className="text-purple-600">Elige el paquete para esta cita</DialogDescription>
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

          <DialogFooter className="bg-gray-50 p-6 rounded-b-lg -m-6 mt-4">
            <Button variant="outline" onClick={() => setPackageDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición específico para este appointment */}
      {isEditDialogOpen && (
        <EditAppointmentDialog
          appointmentId={appointment.id}
          packageId={selectedPackage.id}
          currentDatetime={appointment.datetimeStart}
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          selectedPackage={selectedPackage}
          editType={editType}
        />
      )}
    </>
  )
}
