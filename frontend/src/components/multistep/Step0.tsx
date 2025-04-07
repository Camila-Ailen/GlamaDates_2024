"use client"

import type React from "react"
import "react-calendar/dist/Calendar.css"
import "@/components/multistep/calendar-appointment-dialog.css"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { CalendarOff } from "lucide-react"

const Step0: React.FC = () => {
  return (
    <Card className="border-pink-100 shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 pb-4">
        <CardTitle className="text-center text-pink-700 flex items-center justify-center gap-2">
          <CalendarOff className="h-5 w-5" />
          Sin disponibilidad
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-2">
            <CalendarOff className="h-8 w-8 text-pink-500" />
          </div>
          <p className="text-gray-700">No hay turnos disponibles para este paquete.</p>
          <p className="text-gray-500 text-sm">
            Puede seguir recorriendo el catálogo en busca de otro paquete o intentar más tarde.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default Step0

