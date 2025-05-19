"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Clock, Edit, Loader2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Tipos de datos
interface Professional {
  id: number
  name: string
}

interface Workspace {
  id: number
  name: string
}

interface Package {
  id: number
  name: string
}

interface Service {
  id: number
  name: string
  professionalId?: number | null
  workspaceId?: number | null
}

interface Appointment {
  id: number
  datetimeStart: string
  datetimeEnd: string
  state: string
  package: {
    id: number
    name: string
  }
  services: Service[]
  client: {
    id: number
    firstName: string
    lastName: string
  }
}

interface EditAppointmentDialogProps {
  appointment: Appointment
  onSave?: (updatedAppointment: any) => void
}

export function EditAppointmentDialog({ appointment, onSave }: EditAppointmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>(new Date(appointment.datetimeStart))
  const [startTime, setStartTime] = useState(format(new Date(appointment.datetimeStart), "HH:mm"))
  const [endTime, setEndTime] = useState(format(new Date(appointment.datetimeEnd), "HH:mm"))
  const [selectedPackage, setSelectedPackage] = useState<number>(appointment.package.id)

  // Datos de ejemplo para la demostración
  const [packages, setPackages] = useState<Package[]>([
    { id: appointment.package.id, name: appointment.package.name },
    { id: 2, name: "Paquete Premium" },
    { id: 3, name: "Paquete Básico" },
  ])

  const [professionals, setProfessionals] = useState<Professional[]>([
    { id: 1, name: "Dr. Juan Pérez" },
    { id: 2, name: "Dra. María López" },
    { id: 3, name: "Dr. Carlos Rodríguez" },
  ])

  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: 1, name: "Consultorio 1" },
    { id: 2, name: "Consultorio 2" },
    { id: 3, name: "Sala de Tratamientos" },
  ])

  // Estado para los servicios y sus asignaciones
  const [services, setServices] = useState<Service[]>(appointment.services || [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Crear objeto con los datos actualizados
      const startDateTime = new Date(date)
      const [startHours, startMinutes] = startTime.split(":").map(Number)
      startDateTime.setHours(startHours, startMinutes, 0, 0)

      const endDateTime = new Date(date)
      const [endHours, endMinutes] = endTime.split(":").map(Number)
      endDateTime.setHours(endHours, endMinutes, 0, 0)

      const updatedAppointment = {
        id: appointment.id,
        datetimeStart: startDateTime.toISOString(),
        datetimeEnd: endDateTime.toISOString(),
        packageId: selectedPackage,
        services: services.map((service) => ({
          id: service.id,
          professionalId: service.professionalId,
          workspaceId: service.workspaceId,
        })),
      }

      // Aquí se llamaría a la API para guardar los cambios
      console.log("Guardando cambios:", updatedAppointment)

      // Simular una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (onSave) {
        onSave(updatedAppointment)
      }

      setOpen(false)
    } catch (error) {
      console.error("Error al guardar los cambios:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateServiceAssignment = (serviceId: number, field: "professionalId" | "workspaceId", value: number) => {
    setServices((prevServices) =>
      prevServices.map((service) => (service.id === serviceId ? { ...service, [field]: value } : service)),
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Edit className="h-4 w-4" />
          Editar Cita
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Cita #{appointment.id}</DialogTitle>
          <DialogDescription>
            Cliente: {appointment.client.firstName} {appointment.client.lastName}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="services">Servicios</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="package">Paquete</Label>
                <Select
                  value={selectedPackage.toString()}
                  onValueChange={(value) => setSelectedPackage(Number.parseInt(value))}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de inicio</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de fin</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4 pt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Asignación de profesionales y espacios de trabajo</h3>

              {services.map((service) => (
                <div key={service.id} className="border rounded-md p-4 space-y-3">
                  <h4 className="font-medium">{service.name}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`professional-${service.id}`}>Profesional</Label>
                      <Select
                        value={service.professionalId?.toString() || ""}
                        onValueChange={(value) =>
                          updateServiceAssignment(service.id, "professionalId", Number.parseInt(value))
                        }
                      >
                        <SelectTrigger id={`professional-${service.id}`}>
                          <SelectValue placeholder="Asignar profesional" />
                        </SelectTrigger>
                        <SelectContent>
                          {professionals.map((professional) => (
                            <SelectItem key={professional.id} value={professional.id.toString()}>
                              {professional.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`workspace-${service.id}`}>Espacio de trabajo</Label>
                      <Select
                        value={service.workspaceId?.toString() || ""}
                        onValueChange={(value) =>
                          updateServiceAssignment(service.id, "workspaceId", Number.parseInt(value))
                        }
                      >
                        <SelectTrigger id={`workspace-${service.id}`}>
                          <SelectValue placeholder="Asignar espacio" />
                        </SelectTrigger>
                        <SelectContent>
                          {workspaces.map((workspace) => (
                            <SelectItem key={workspace.id} value={workspace.id.toString()}>
                              {workspace.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
