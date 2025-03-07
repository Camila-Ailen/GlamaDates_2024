import type React from "react"
import "react-calendar/dist/Calendar.css"
import "@/components/multistep/calendar-appointment-dialog.css"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"



const Step0: React.FC = () => {
   

  return (
    <Card>
      <CardContent>
        <CardHeader>
          <CardTitle>Lo siento</CardTitle>
        </CardHeader>
        <div className="flex flex-col items-center">
          <p>No hay turnos disponibles para este paquete. Disculpe los inconvenientes.</p>
          <p>Puede seguir recorriendo el catálogo en busca de otro paquete.</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default Step0

