"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import useStatisticsStore from "@/app/store/useStatisticsStore"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"

const chartConfig = {
  total_citas: {
    label: "Citas",
    color: "hsl(var(--chart-1))",
  },
  total_ingresos: {
    label: "Ingresos",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background p-3 border rounded shadow-sm">
        <p className="font-medium text-base mb-1">{data.categoria}</p>
        <p className="text-sm mb-1">
          <span className="font-medium">Citas:</span> {data.total_citas} ({data.percentage}%)
        </p>
        <p className="text-sm">
          <span className="font-medium">Ingresos:</span> ${data.total_ingresos}
        </p>
      </div>
    )
  }
  return null
}

export function PerCategory() {
  const { perCategory, fetchPerCategory, startDate, endDate } = useStatisticsStore()

  // React.useEffect(() => {
  //   fetchPerCategory(startDate, endDate)
  // }, [fetchPerCategory, startDate, endDate])

  const chartData = React.useMemo(() => {
    if (!perCategory || !perCategory.totals || !perCategory.totals.length) return []

    const totalCitas = perCategory.totals.reduce((acc: number, curr: { total_citas?: number }) => acc + (curr.total_citas || 0), 0)

    return perCategory.totals.map((item: { categoria: string; total_citas?: number; total_ingresos?: number }) => ({
      categoria: item.categoria,
      total_citas: item.total_citas || 0,
      total_ingresos: item.total_ingresos || 0,
      percentage: totalCitas > 0 ? (((item.total_citas || 0) / totalCitas) * 100).toFixed(1) : 0,
    }))
  }, [perCategory])

  const totalCitas = React.useMemo(() => {
    if (!chartData.length) return 0
    return chartData.reduce((acc: number, curr: { total_citas: number }) => acc + curr.total_citas, 0)
  }, [chartData])

  const totalIngresos = React.useMemo(() => {
    if (!chartData.length) return 0
    return chartData.reduce((acc: number, curr: { total_ingresos: number }) => acc + curr.total_ingresos, 0)
  }, [chartData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citas por Categoría</CardTitle>
        <CardDescription>
          Total: {totalCitas} citas - ${totalIngresos} en ingresos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 30,
                right: 30,
                left: 20,
                bottom: 20,
              }}
              barGap={20}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="categoria" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis
                yAxisId="left"
                orientation="left"
                tickLine={false}
                axisLine={false}
                label={{ value: "Citas", angle: -90, position: "insideLeft" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total_citas" fill="var(--color-total_citas)" radius={[4, 4, 0, 0]} yAxisId="left">
                <LabelList
                  dataKey="total_citas"
                  position="top"
                  offset={10}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) =>
                    `${value} (${chartData.find((item: { total_citas: number }) => item.total_citas === value)?.percentage}%)`
                  }
                />
                <LabelList
                  dataKey="total_ingresos"
                  position="center"
                  className="fill-background font-medium"
                  fontSize={11}
                  formatter={(value: number) => `$${value}`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="grid grid-cols-2 w-full gap-4">
          {chartData.map((item: { categoria: string; total_citas: number; total_ingresos: number; percentage: string }) => (
            <div key={item.categoria} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "var(--color-total_citas)" }} />
              <div className="flex flex-col">
                <span className="font-medium">{item.categoria}</span>
                <span className="text-xs text-muted-foreground">
                  {item.total_citas} citas ({item.percentage}%) - ${item.total_ingresos}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}

