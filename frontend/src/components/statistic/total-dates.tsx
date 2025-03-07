"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useAppointmentStore from "@/app/store/useAppointmentStore"
import { useEffect } from "react"

const chartConfig = {
  turnos: {
    label: "Turnos",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function TotalDates() {
  const [timeRange, setTimeRange] = React.useState("90d")
  const { appointmentHistory, fetchAppointmentHistory } = useAppointmentStore()

  useEffect(() => {
    fetchAppointmentHistory(timeRange)
  }, [timeRange, fetchAppointmentHistory])

  const chartData = React.useMemo(() => {
    return appointmentHistory.map((item: { fecha: string; total_turnos: number }) => ({
      date: item.fecha,
      turnos: item.total_turnos,
    }))
  }, [appointmentHistory])

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date()
    const daysToSubtract = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [chartData, timeRange])

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Historial de turnos</CardTitle>
          <CardDescription>Mostrando el total global de turnos</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Select a value">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Últimos 3 meses
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Últimos 30 días
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Últimos 7 días
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillTurnos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-turnos)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-turnos)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={true} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("es-AR", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={5} dataKey="turnos" width={40} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("es-AR", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                    formatter={(value) => [`${value} turnos`, "Turnos"]}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="turnos"
                type="monotone"
                fill="url(#fillTurnos)"
                stroke="var(--color-turnos)"
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

