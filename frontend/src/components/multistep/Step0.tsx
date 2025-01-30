import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import { Calendar } from "react-calendar"
import "react-calendar/dist/Calendar.css"
import "@/components/multistep/calendar-appointment-dialog.css"
import { useEffect, useState } from "react"
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

