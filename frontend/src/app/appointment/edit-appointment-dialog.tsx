"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Edit, Loader2, Pencil } from "lucide-react"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useEditStore from "../store/useEditStore"
import usePackageStore from "../store/usePackageStore"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
//import { ViewPackageDialog } from "./view-package-dialog"

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

export function EditAppointmentDialog({ appointment }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date(appointment.datetimeStart))
  const [selectedPackage, setSelectedPackage] = useState(appointment.package)
  const [activeTab, setActiveTab] = useState("general")
  const [serviceData, setServiceData] = useState<Record<number, ProfessionalWorkstation>>({})
  const [selectedProfessionals, setSelectedProfessionals] = useState<Record<number, number>>({})
  const [selectedWorkstations, setSelectedWorkstations] = useState<Record<number, number>>({})
  const [viewPackageOpen, setViewPackageOpen] = useState(false)

  const { packages, fetchPackage } = usePackageStore()
  const {
    fetchRearrange,
    rearrangeAppointment,
    fetchProfessionalsAndWorkstations,
    updateAppointmentDetail,
    isAvailable,
  } = useEditStore()

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
            const data = await fetchProfessionalsAndWorkstations(detail.datetimeStart, detail.service.id)

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

  const handlePackageChange = (packageId: number) => {
    const selectedPkg = packages.find((pkg) => pkg.id === packageId)
    if (selectedPkg) {
      setSelectedPackage(selectedPkg)
    }
  }

  const handleDateTimeChange = async () => {
    if (date && selectedPackage) {
      const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss")
      await fetchRearrange({
        packageId: selectedPackage.id,
        datetime: formattedDate,
      })
    }
  }

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

      //setOpen(false)
      toast.success("Cita editada correctamente")
    } catch (error) {
      console.error("Error al guardar los cambios:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
                    <div
                      className="flex-1 cursor-pointer hover:bg-muted p-2 rounded-md transition-colors"
                      onClick={() => setViewPackageOpen(true)}
                    >
                      <p className="font-medium">{selectedPackage.name}</p>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Cambiar
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h4 className="font-medium">Seleccionar paquete</h4>
                          <Select
                            value={selectedPackage.id.toString()}
                            onValueChange={(value) => handlePackageChange(Number.parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar paquete" />
                            </SelectTrigger>
                            <SelectContent>
                              {packages.map((pkg) => (
                                <SelectItem key={pkg.id} value={pkg.id.toString()}>
                                  {pkg.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha y hora</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      onClick={handleDateTimeChange}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP HH:mm", { locale: es }) : "Seleccionar fecha y hora"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
                {isAvailable === false && (
                  <p className="text-sm text-red-500">
                    La fecha y hora seleccionada no está disponible para este paquete.
                  </p>
                )}
                {isAvailable === true && (
                  <p className="text-sm text-green-500">La fecha y hora seleccionada está disponible.</p>
                )}
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
                                    ID: {station.id} - {station.name} - {station.description}
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

    </>
  )
}
