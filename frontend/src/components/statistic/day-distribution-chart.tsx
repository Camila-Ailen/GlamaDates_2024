"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import useStatisticsStore from "@/app/store/useStatisticsStore"

const COLORS = [
  "#e91e63", // Rosa principal
  "#ec407a",
  "#f06292",
  "#f48fb1",
  "#f8bbd0",
  "#fce4ec",
  "#d81b60",
]

export function DayDistributionChart() {
  const { perDay } = useStatisticsStore()

  const chartData =
    perDay?.map((item: any, index: number) => {
      const dayTranslations: Record<string, string> = {
        Monday: "Lunes",
        Tuesday: "Martes",
        Wednesday: "Miércoles",
        Thursday: "Jueves",
        Friday: "Viernes",
        Saturday: "Sábado",
        Sunday: "Domingo",
      }

      return {
        name: dayTranslations[item.day] || item.day,
        value: item.count,
      }
    }) || []

  return (
    <Card id="day-distribution-card">
      <CardHeader>
        <CardTitle className="card-title">Distribución por Día</CardTitle>
        <CardDescription>Cantidad de citas por día de la semana</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer id="day-distribution-chart" className="aspect-square h-[300px] w-full" config={{}}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#e91e63"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry: { name: string; value: number }, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} citas`, "Cantidad"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

