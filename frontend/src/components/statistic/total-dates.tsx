"use client"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import useStatisticsStore from "@/app/store/useStatisticsStore"
import { format } from "date-fns"

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

export function TotalDates() {
  const { startDate, endDate, fetchTotalDates, appointmentTotal } = useStatisticsStore()

  // useEffect(() => {
  //   if (startDate && endDate) {
  //     fetchTotalDates(startDate, endDate)
  //   }
  // }, [startDate, endDate, fetchTotalDates])

  const chartData =
    appointmentTotal.result?.map((item: any) => ({
      fecha: format(new Date(item.fecha), "dd/MM/yyyy"),
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
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="fillCompletado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(328, 73%, 69%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(328, 73%, 69%)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillPendiente" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(340, 82%, 76%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(340, 82%, 76%)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillNoCompletado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(350, 70%, 60%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(350, 70%, 60%)" stopOpacity={0.1} />
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
                  // Verificamos si value ya es una cadena formateada como dd/MM/yyyy
                  if (typeof value === "string" && value.includes("/")) {
                    // Si ya está formateada, extraemos día y mes
                    const parts = value.split("/")
                    if (parts.length >= 3) {
                      // Asumimos formato dd/MM/yyyy
                      return `${parts[0]}/${parts[1]}` // Retornamos solo día/mes
                    }
                    return value // Si no podemos procesarlo, devolvemos el valor original
                  }

                  // Si no es una cadena formateada, intentamos crear una fecha
                  try {
                    const date = new Date(value)
                    if (isNaN(date.getTime())) {
                      return value // Si la fecha es inválida, devolvemos el valor original
                    }
                    return date.toLocaleDateString("es-AR", {
                      month: "short",
                      day: "numeric",
                    })
                  } catch (e) {
                    console.error("Error formateando fecha:", value, e)
                    return value // En caso de error, devolvemos el valor original
                  }
                }}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={5} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                dataKey="total_completado"
                type="monotone"
                fill="url(#fillCompletado)"
                stroke="hsl(328, 73%, 59%)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="total_pendiente_seniado_activo"
                type="monotone"
                fill="url(#fillPendiente)"
                stroke="hsl(340, 82%, 66%)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="total_moroso_inactivo_cancelado"
                type="monotone"
                fill="url(#fillNoCompletado)"
                stroke="hsl(350, 70%, 50%)"
                strokeWidth={2}
                stackId="a"
              />
            </AreaChart>
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
            {/* <div className="flex items-center gap-2 leading-none text-muted-foreground">
              <p>aca {startDate} y aca {endDate}</p>
              {format(startDate, "dd/MM/yyyy")} - {format(endDate, "dd/MM/yyyy")}
            </div> */}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
