import type React from "react"
import "react-calendar/dist/Calendar.css"
import "@/components/multistep/calendar-appointment-dialog.css"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"



const Unapproved: React.FC = () => {
   

  return (
    <Card>
      <CardContent>
        <CardHeader>
          <CardTitle>Lo siento</CardTitle>
        </CardHeader>
        <div className="flex flex-col items-center">
          <p>Alguien ya ha tomado este espacio.</p>
          <p>Igualmente puedes modificar tu cita a un nuevo dia y/u horario</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default Unapproved

