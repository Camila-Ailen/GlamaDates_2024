"use client"

import { useState, useEffect } from "react"
import { ProfessionalCalendar } from "@/components/professional/professional-calendar"
import { TodayAppointments } from "@/components/professional/today-appointments"
import { WeeklyProfessionalView } from "@/components/professional/weekly-professional-view"
import { useMyCalendarStore } from "@/app/store/useMyCalendarStore"
import useAuthStore from "@/app/store/useAuthStore"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { startOfWeek, endOfWeek, addDays, isSameDay, isToday, isThisWeek } from "date-fns"

export function ProfessionalDashboard() {
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
  } = useMyCalendarStore()

  const token = useAuthStore((state) => state.token)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [activeTab, setActiveTab] = useState("today")

  useEffect(() => {
    if (token) {
      fetchMyDates(1)
    }
  }, [fetchMyDates, token, orderBy, orderType])

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

  // Filtrar citas de hoy
  const todayAppointments = appointmentsWithDates.filter((appointment) => isToday(appointment.dateObj))

  // Filtrar citas de la semana
  const weeklyAppointments = appointmentsWithDates.filter(
    (appointment) => isThisWeek(appointment.dateObj, { weekStartsOn: 1 }), // Semana comienza el lunes
  )

  // Agrupar citas por día de la semana
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Lunes
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }) // Domingo

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i)
    return {
      date: day,
      appointments: appointmentsWithDates.filter((appointment) => isSameDay(appointment.dateObj, day)),
    }
  })

  return (
    <div className="space-y-6">
      <Tabs defaultValue="today" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today">Vista de Hoy</TabsTrigger>
          <TabsTrigger value="week">Vista Semanal</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <h2 className="text-lg font-medium mb-4 text-center">Citas de Hoy</h2>
              <TodayAppointments
                appointments={todayAppointments}
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
              <ProfessionalCalendar
                availableDates={availableDates}
                appointments={appointmentsWithDates}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </div>

            <div className="md:col-span-1">
              <h2 className="text-lg font-medium mb-4 text-center">Próximas Citas</h2>
              <TodayAppointments
                appointments={appointmentsWithDates.filter((a) => !isToday(a.dateObj))}
                onSort={(field) => {
                  if (field === orderBy) {
                    setOrderType(orderType === "ASC" ? "DESC" : "ASC")
                  } else {
                    setOrderBy(field)
                    setOrderType("ASC")
                  }
                }}
                title="Próximas"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="week" className="mt-6">
          <WeeklyProfessionalView weekDays={weekDays} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

