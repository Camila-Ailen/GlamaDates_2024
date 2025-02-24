import type React from "react"
import "react-calendar/dist/Calendar.css"
import "@/components/multistep/calendar-appointment-dialog.css"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { useEditStore } from "@/app/store/useEditStore"
import { format } from "date-fns"
import useAppointmentStore from "@/app/store/useAppointmentStore"
import { use, useEffect } from "react"

const Approved: React.FC = () => {
    const { appointment, rearrangeAppointment, closeDialog } = useEditStore()
    const { fetchOneAppointment } = useAppointmentStore()

    //   const handleRearrange = async () => {
    //     await rearrangeAppointment(appointmentDetails)
    //     closeDialog()
    //   }

    const handleCancel = () => {
        closeDialog()
    }

    useEffect(() => {
        if (appointment !== null) {
            const appointmentOld = fetchOneAppointment(appointment)
            console.log('appointmentOld: ', appointmentOld)
        }
    }, [appointment])

    return (
        <Card>
            <CardContent>
                <CardHeader>
                    <CardTitle>Reacomodación Disponible</CardTitle>
                </CardHeader>
                <div className="flex flex-col items-center">
                    {/* <p><strong>Turno Viejo:</strong> {format(new Date(appointmentDetails.oldDatetimeStart), "dd/MM/yyyy")}</p>
                    <p><strong>Nuevo Turno:</strong> {format(new Date(appointmentDetails.newDatetimeStart), "PPpp")}</p>
                    <p><strong>Duración:</strong> {appointmentDetails.duration} minutos</p>
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleRearrange}
                            className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                        >
                            Modificar
                        </button>
                        <button
                            onClick={handleCancel}
                            className="w-full py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark ml-4"
                        >
                            Cancelar
                        </button>
                    </div> */}
                </div>
            </CardContent>
        </Card>
    )
}

export default Approved