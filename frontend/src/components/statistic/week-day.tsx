"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import useStatisticsStore from "@/app/store/useStatisticsStore"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"

// Mapeo de días en inglés a español
const dayTranslations = {
  Monday: "Lunes",
  Tuesday: "Martes",
  Wednesday: "Miércoles",
  Thursday: "Jueves",
  Friday: "Viernes",
  Saturday: "Sábado",
  Sunday: "Domingo",
}

// Colores para cada día de la semana
const dayColors = {
  Monday: "hsl(var(--chart-1))",
  Tuesday: "hsl(var(--chart-2))",
  Wednesday: "hsl(var(--chart-3))",
  Thursday: "hsl(var(--chart-4))",
  Friday: "hsl(var(--chart-5))",
  Saturday: "hsl(var(--chart-6))",
  Sunday: "hsl(var(--chart-7))",
}

// Configuración del gráfico
const chartConfig = {
  count: {
    label: "Total",
  },
  Monday: {
    label: "Lunes",
    color: "hsl(var(--chart-1))",
  },
  Tuesday: {
    label: "Martes",
    color: "hsl(var(--chart-2))",
  },
  Wednesday: {
    label: "Miércoles",
    color: "hsl(var(--chart-3))",
  },
  Thursday: {
    label: "Jueves",
    color: "hsl(var(--chart-4))",
  },
  Friday: {
    label: "Viernes",
    color: "hsl(var(--chart-5))",
  },
  Saturday: {
    label: "Sábado",
    color: "hsl(var(--chart-6))",
  },
  Sunday: {
    label: "Domingo",
    color: "hsl(var(--chart-7))",
  },
} satisfies ChartConfig

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background p-2 border rounded shadow-sm">
        <p className="font-medium">{dayTranslations[data.day as keyof typeof dayTranslations] || data.day}</p>
        <p className="text-sm">{data.percentage}%</p>
        <p className="text-sm">{data.count} citas</p>
      </div>
    )
  }
  return null
}

export function WeekDay() {
  const { perDay, fetchPerDay, startDate, endDate } = useStatisticsStore()

  // React.useEffect(() => {
  //   fetchPerDay(startDate, endDate)
  // }, [fetchPerDay, startDate, endDate])

  const chartData = React.useMemo(() => {
    if (!perDay || !perDay.length) return []

    const total = perDay.reduce((acc: number, curr: { count: number }) => acc + (curr.count || 0), 0)

    return perDay.map((item: { day: string; count: number }) => ({
      day: item.day,
      count: item.count || 0,
      percentage: total > 0 ? (((item.count || 0) / total) * 100).toFixed(1) : 0,
      fill: dayColors[item.day as keyof typeof dayColors] || "hsl(var(--chart-1))",
    }))
  }, [perDay])

  const totalAppointments = React.useMemo(() => {
    if (!chartData.length) return 0
    return chartData.reduce((acc: number, curr: { count: number }) => acc + curr.count, 0)
  }, [chartData])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Citas por Día</CardTitle>
        <CardDescription>Distribución semanal (No se incluyen citas canceladas)</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Pie data={chartData} dataKey="count" nameKey="day" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {totalAppointments.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Citas
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex flex-wrap justify-center gap-3 font-medium leading-none">
          {chartData.map((item: { day: string; count: number; percentage: string; fill: string }) => (
            <div key={item.day} className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
              <span>
                {dayTranslations[item.day as keyof typeof dayTranslations] || item.day}: {item.count} ({item.percentage}
                %)
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}

