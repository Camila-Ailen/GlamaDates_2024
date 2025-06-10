"use client"
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import useStatisticsStore from "@/app/store/useStatisticsStore"

const chartConfig = {
  total_completado: {
    label: "Completado",
    color: "hsl(347, 77%, 50%)",  // Tono rosa principal
  },
  total_pendiente_seniado_activo: {
    label: "Pendiente",
    color: "hsl(352, 83%, 91%)",  // Tono rosa más claro
  },
  total_moroso_inactivo_cancelado: {
    label: "No Completado",
    color: "hsl(350, 80%, 72%)",  // Tono rosa más oscuro
  },
} satisfies ChartConfig

// Tooltip personalizado para mostrar valores reales en gráfico apilado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label)
    const formattedDate = date.toLocaleDateString("es-AR", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })

    return (
      <div className="bg-background p-3 border rounded shadow-sm">
        <p className="font-medium text-base mb-2">{formattedDate}</p>
        {payload.reverse().map((entry: any, index: number) => (
          <p key={index} className="text-sm mb-1" style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}:</span> {entry.payload[entry.dataKey]}
          </p>
        ))}
        <div className="border-t pt-2 mt-2">
          <p className="text-sm font-medium">
            Total: {payload.reduce((sum: number, entry: any) => sum + entry.payload[entry.dataKey], 0)}
          </p>
        </div>
      </div>
    )
  }
  return null
}

export function TotalDates() {
  const { startDate, endDate, fetchTotalDates, appointmentTotal } = useStatisticsStore()

  const chartData =
    appointmentTotal.result?.map((item: any) => ({
      fecha: item.fecha,
      total_completado: item.total_completado,
      total_pendiente_seniado_activo: item.total_pendiente_seniado_activo,
      total_moroso_inactivo_cancelado: item.total_moroso_inactivo_cancelado,
    })) || []

  return (
    <Card data-chart="total-dates">
      <CardHeader>
        <CardTitle>Completitud de citas</CardTitle>
        <CardDescription>
          Se muestra la cantidad de citas completadas, pendientes y no completadas en el rango de fechas seleccionado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={true} strokeDasharray="3 3" />
              <XAxis
                dataKey="fecha"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  try {
                    const date = new Date(value)
                    if (isNaN(date.getTime())) {
                      return value
                    }
                    return date.toLocaleDateString("es-AR", {
                      month: "short",
                      day: "numeric",
                    })
                  } catch (e) {
                    return value
                  }
                }}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={5} />
              <ChartTooltip cursor={false} content={<CustomTooltip />} />
              <Line
                dataKey="total_completado"
                type="monotone"
                fill="url(#fillCompletado)"
                stroke="hsl(328, 73%, 59%)"
                strokeWidth={2}
                dot={{ fill: "hsl(328, 73%, 59%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                dataKey="total_pendiente_seniado_activo"
                type="monotone"
                fill="url(#fillPendiente)"
                stroke="hsl(340, 82%, 66%)"
                strokeWidth={2}
                dot={{ fill: "hsl(340, 82%, 66%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                dataKey="total_moroso_inactivo_cancelado"
                type="monotone"
                fill="url(#fillNoCompletado)"
                stroke="hsl(350, 70%, 50%)"
                strokeWidth={2}
                dot={{ fill: "hsl(350, 70%, 50%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-4 font-medium leading-none">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(328, 73%, 69%)" }} />
                <p>Completadas: {appointmentTotal.totals.total_completado}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(340, 82%, 76%)" }} />
                <p>Pendientes: {appointmentTotal.totals.total_pendiente_seniado_activo}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(350, 70%, 60%)" }} />
                <p>No completadas: {appointmentTotal.totals.total_moroso_inactivo_cancelado}</p>
              </div>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
