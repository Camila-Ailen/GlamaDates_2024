"use client"

import { useState, useEffect } from "react"
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar"
import { WeeklyAppointments } from "@/components/appointments/weekly-appointments"
import { PendingAppointments } from "@/components/appointments/pending-appointments"
import { useMyDatesStore } from "@/app/store/useMyDatesStore"
import useAuthStore from "@/app/store/useAuthStore"
import { toast } from "sonner"

export function AppointmentDashboard() {
  const {
    myDates,
    fetchMyDates,
    isLoading,
    error,
    currentPage,
    pageSize,
    total,
    orderBy,
    orderType,
    setOrderBy,
    setOrderType,
  } = useMyDatesStore()

  const token = useAuthStore((state) => state.token)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (token) {
      fetchMyDates(1)
    }
  }, [fetchMyDates, token])

  if (isLoading) return <div className="flex items-center justify-center h-screen">Cargando...</div>
  if (error) {
    toast.error(error)
    return null
  }

  // Convertir las fechas de string a objetos Date
  const appointmentsWithDates = myDates.map((appointment) => ({
    ...appointment,
    dateObj: new Date(appointment.datetimeStart),
  }))

  // Obtener fechas únicas para el calendario
  const availableDates = [
    ...new Set(
      appointmentsWithDates.map((appointment) => new Date(appointment.dateObj.setHours(0, 0, 0, 0)).toISOString()),
    ),
  ].map((dateStr) => new Date(dateStr))

  // Filtrar citas de la semana actual
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const weeklyAppointments = appointmentsWithDates.filter(
    (appointment) => appointment.dateObj >= startOfWeek && appointment.dateObj <= endOfWeek,
  )

  // Filtrar citas pendientes o morosas
  const pendingAppointments = appointmentsWithDates.filter(
    (appointment) => appointment.state === "PENDIENTE" || appointment.state === "MOROSO",
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1">
        <h2 className="text-lg font-medium mb-4 text-center">Citas de esta semana</h2>
        <WeeklyAppointments
          appointments={weeklyAppointments}
          onSort={(field) => {
            if (field === orderBy) {
              setOrderType(orderType === "ASC" ? "DESC" : "ASC")
            } else {
              setOrderBy(field)
              setOrderType("ASC")
            }
          }}
        />
      </div>

      <div className="md:col-span-1">
        <h2 className="text-lg font-medium mb-4 text-center">Calendario</h2>
        <AppointmentCalendar
          availableDates={availableDates}
          appointments={appointmentsWithDates}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </div>

      <div className="md:col-span-1">
        <h2 className="text-lg font-medium mb-4 text-center">Citas pendientes de pago</h2>
        <PendingAppointments
          appointments={pendingAppointments}
          onSort={(field) => {
            if (field === orderBy) {
              setOrderType(orderType === "ASC" ? "DESC" : "ASC")
            } else {
              setOrderBy(field)
              setOrderType("ASC")
            }
          }}
        />
      </div>
    </div>
  )
}
