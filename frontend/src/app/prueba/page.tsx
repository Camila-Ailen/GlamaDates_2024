"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditAppointmentDialog } from "./edit-appointment-dialog"

// Datos de ejemplo para la demostración
const sampleAppointment = {
  id: 1234,
  datetimeStart: "2023-05-15T14:30:00.000Z",
  datetimeEnd: "2023-05-15T15:30:00.000Z",
  state: "PENDIENTE",
  package: {
    id: 1,
    name: "Paquete Estándar",
  },
  services: [
    { id: 1, name: "Consulta inicial", professionalId: 1, workspaceId: 1 },
    { id: 2, name: "Tratamiento facial", professionalId: 2, workspaceId: 2 },
    { id: 3, name: "Masaje terapéutico", professionalId: null, workspaceId: null },
  ],
  client: {
    id: 101,
    firstName: "Juan",
    lastName: "Pérez",
  },
  total: 150.0,
  pending: 50.0,
}

export default function DemoPage() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Demostración de Edición de Citas</CardTitle>
          <CardDescription>Esta página muestra cómo se vería el diálogo de edición de citas</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="text-center max-w-md">
            <p className="mb-4">
              Haz clic en el botón para abrir el diálogo de edición de citas y ver cómo se vería la interfaz.
            </p>
            <EditAppointmentDialog appointment={sampleAppointment} />
          </div>

          <div className="w-full max-w-2xl mt-8 border rounded-lg p-4">
            <h3 className="font-medium mb-2">Datos de la cita de ejemplo:</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
              {JSON.stringify(sampleAppointment, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
