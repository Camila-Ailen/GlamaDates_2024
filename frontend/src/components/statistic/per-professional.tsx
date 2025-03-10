"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, Tooltip } from "recharts"
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
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background p-3 border rounded shadow-sm">
        <p className="font-medium text-base mb-1">{data.profesional}</p>
        <p className="text-sm mb-1">
          <span className="font-medium">Citas:</span> {data.total_citas}
        </p>
        <p className="text-sm">
          <span className="font-medium">Ingresos:</span> ${data.total_ingresos}
        </p>
      </div>
    )
  }
  return null
}

export function PerProfessional() {
  const { perProfessional, fetchPerProfessional, startDate, endDate } = useStatisticsStore()

  // React.useEffect(() => {
  //   fetchPerProfessional(startDate, endDate)
  // }, [fetchPerProfessional, startDate, endDate])

  const chartData = React.useMemo(() => {
    if (!perProfessional || !perProfessional.totals || !perProfessional.totals.length) return []

    return perProfessional.totals.map(
      (item: { profesional: string; total_citas?: number; total_ingresos?: number }) => ({
        profesional: item.profesional,
        total_citas: item.total_citas || 0,
        total_ingresos: item.total_ingresos || 0,
      }),
    )
  }, [perProfessional])

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
        <CardTitle>Citas por Profesional</CardTitle>
        <CardDescription>
          Total: {totalCitas} citas - ${totalIngresos} en ingresos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis dataKey="profesional" type="category" tickLine={false} tickMargin={10} axisLine={false} hide />
            <XAxis dataKey="total_citas" type="number" hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total_citas" fill="var(--color-total_citas)" radius={4}>
              <LabelList
                dataKey="profesional"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList dataKey="total_citas" position="right" offset={8} className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {chartData.length > 0 ? "Datos actualizados" : "Sin datos disponibles"} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">Mostrando citas por profesional</div>
        <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4 mt-2">
          {chartData.map((item: { profesional: string; total_citas: number; total_ingresos: number }) => (
            <div key={item.profesional} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "var(--color-total_citas)" }} />
              <div className="flex flex-col">
                <span className="font-medium">{item.profesional}</span>
                <span className="text-xs text-muted-foreground">
                  {item.total_citas} citas - ${item.total_ingresos}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}

