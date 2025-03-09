"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import useStatisticsStore from "@/app/store/useStatisticsStore"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"

const chartConfig = {
  visitors: {
    label: "Total",
  },
  pendiente_pago: {
    label: "Pendiente de Pago",
    color: "hsl(var(--chart-1))",
  },
  efectivo: {
    label: "Efectivo",
    color: "hsl(var(--chart-2))",
  },
  mercadopago: {
    label: "MercadoPago",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background p-2 border rounded shadow-sm">
        <p className="font-medium">{chartConfig[data.browser as keyof typeof chartConfig].label}</p>
        <p className="text-sm">{data.percentage}%</p>
      </div>
    )
  }
  return null
}

export function PayMethod() {
  const { payMethod, fetchPayMethod, startDate, endDate } = useStatisticsStore()

  // React.useEffect(() => {
  //   fetchPayMethod(startDate, endDate)
  // }, [fetchPayMethod, startDate, endDate])

  const chartData = React.useMemo(() => {
    if (!payMethod || !payMethod.totals) return []

    const total =
      (payMethod.totals.total_pendiente_pago || 0) +
      (payMethod.totals.total_efectivo || 0) +
      (payMethod.totals.total_mercadopago || 0)

    return [
      {
        browser: "pendiente_pago",
        visitors: payMethod.totals.total_pendiente_pago || 0,
        percentage: total > 0 ? (((payMethod.totals.total_pendiente_pago || 0) / total) * 100).toFixed(1) : 0,
        fill: "hsl(var(--chart-1))",
      },
      {
        browser: "efectivo",
        visitors: payMethod.totals.total_efectivo || 0,
        percentage: total > 0 ? (((payMethod.totals.total_efectivo || 0) / total) * 100).toFixed(1) : 0,
        fill: "hsl(var(--chart-2))",
      },
      {
        browser: "mercadopago",
        visitors: payMethod.totals.total_mercadopago || 0,
        percentage: total > 0 ? (((payMethod.totals.total_mercadopago || 0) / total) * 100).toFixed(1) : 0,
        fill: "hsl(var(--chart-3))",
      },
    ]
  }, [payMethod])

  const totalPayments = React.useMemo(() => {
    if (!chartData.length) return 0
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [chartData])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Métodos de Pago</CardTitle>
        <CardDescription>Distribución de pagos</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Pie data={chartData} dataKey="visitors" nameKey="browser" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {totalPayments.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Pagos
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
          {chartData.map((item) => (
            <div key={item.browser} className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
              <span>
                {chartConfig[item.browser as keyof typeof chartConfig].label}: {item.visitors} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}

