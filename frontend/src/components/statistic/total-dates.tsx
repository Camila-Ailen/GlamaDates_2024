"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
    label: "Pendiente/Señado/Activo",
    color: "hsl(var(--chart-2))",
  },
  total_moroso_inactivo_cancelado: {
    label: "Moroso/Inactivo/Cancelado",
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
        <CardTitle>Area Chart - Axes</CardTitle>
        <CardDescription>
          Showing total appointments for the selected date range
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -20,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="fecha"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={3}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="total_completado"
              type="natural"
              fill="var(--color-completado)"
              fillOpacity={0.4}
              stroke="var(--color-completado)"
              stackId="a"
            />
            <Area
              dataKey="total_pendiente_seniado_activo"
              type="natural"
              fill="var(--color-pendiente-seniado-activo)"
              fillOpacity={0.4}
              stroke="var(--color-pendiente-seniado-activo)"
              stackId="a"
            />
            <Area
              dataKey="total_moroso_inactivo_cancelado"
              type="natural"
              fill="var(--color-moroso-inactivo-cancelado)"
              fillOpacity={0.4}
              stroke="var(--color-moroso-inactivo-cancelado)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}