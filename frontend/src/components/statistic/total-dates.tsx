"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import useStatisticsStore from '@/app/store/useStatisticsStore'
import { useEffect } from 'react'

const chartConfig = {
  total_completado: {
    label: "Completado",
    color: "hsl(var(--chart-1))",
  },
  total_pendiente_seniado_activo: {
    label: "Pendiente",
    color: "hsl(var(--chart-2))",
  },
  total_moroso_inactivo_cancelado: {
    label: "No Completado",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function TotalDates() {
  const { startDate, endDate, fetchTotalDates, appointmentTotal } = useStatisticsStore()

  // useEffect(() => {
  //   if (startDate && endDate) {
  //     fetchTotalDates(startDate, endDate)
  //   }
  // }, [startDate, endDate, fetchTotalDates])

  const chartData = appointmentTotal.result?.map((item: any) => ({
    fecha: new Date(item.fecha).toLocaleDateString(),
    total_completado: item.total_completado,
    total_pendiente_seniado_activo: item.total_pendiente_seniado_activo,
    total_moroso_inactivo_cancelado: item.total_moroso_inactivo_cancelado,
  })) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completitud de citas</CardTitle>
        <CardDescription>
          Se muestra la cantidad de citas completadas, pendientes y no completadas en el rango de fechas seleccionado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              accessibilityLayer
              data={chartData}
            // margin={{
            //   left: -20,
            //   right: 12,
            // }}
            >
              <defs>
                <linearGradient id="fillPendiente" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-pendiente-seniado-activo)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-pendiente-seniado-activo)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={true} />
              <XAxis
                dataKey="fecha"
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
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickCount={5}
              />
              <ChartTooltip cursor={false} content={
                  <ChartTooltipContent />} />
              <Area
                dataKey="total_completado"
                type="monotone"
                fill="url(#fillPendiente)"
                // fillOpacity={0.4}
                stroke="var(--color-completado)"
                stackId="a"
              />
              <Area
                dataKey="total_pendiente_seniado_activo"
                type="monotone"
                fill="url(#fillPendiente)"
                // fillOpacity={0.4}
                stroke="var(--color-pendiente-seniado-activo)"
                strokeWidth={2}
                // stackId="a"
              />
              <Area
                dataKey="total_moroso_inactivo_cancelado"
                type="monotone"
                fill="url(#fillPendiente)"
                // fillOpacity={0.4}
                stroke="var(--color_moroso_inactivo_cancelado)"
                strokeWidth={2}
                // stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              <p>Total de citas completadas: {appointmentTotal.totals.total_completado}</p>
              <p> || Total de citas pendientes: {appointmentTotal.totals.total_pendiente_seniado_activo}</p>
              <p> || Total de citas no completadas: {appointmentTotal.totals.total_moroso_inactivo_cancelado}</p>
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
            {new Date(startDate).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })} - {new Date(endDate).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}