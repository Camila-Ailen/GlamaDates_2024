"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartData = [
  { date: "2024-09-01", solicitudes: 222, mobile: 150 },
  { date: "2024-09-02", solicitudes: 97, mobile: 180 },
  { date: "2024-09-03", solicitudes: 167, mobile: 120 },
  { date: "2024-09-04", solicitudes: 242, mobile: 260 },
  { date: "2024-09-05", solicitudes: 373, mobile: 290 },
  { date: "2024-09-06", solicitudes: 301, mobile: 340 },
  { date: "2024-09-07", solicitudes: 245, mobile: 180 },
  { date: "2024-09-08", solicitudes: 409, mobile: 320 },
  { date: "2024-09-09", solicitudes: 59, mobile: 110 },
  { date: "2024-09-10", solicitudes: 261, mobile: 190 },
  { date: "2024-09-11", solicitudes: 327, mobile: 350 },
  { date: "2024-09-12", solicitudes: 292, mobile: 210 },
  { date: "2024-09-13", solicitudes: 342, mobile: 380 },
  { date: "2024-09-14", solicitudes: 137, mobile: 220 },
  { date: "2024-09-15", solicitudes: 120, mobile: 170 },
  { date: "2024-09-16", solicitudes: 138, mobile: 190 },
  { date: "2024-09-17", solicitudes: 446, mobile: 360 },
  { date: "2024-09-18", solicitudes: 364, mobile: 410 },
  { date: "2024-09-19", solicitudes: 243, mobile: 180 },
  { date: "2024-09-20", solicitudes: 89, mobile: 150 },
  { date: "2024-09-21", solicitudes: 137, mobile: 200 },
  { date: "2024-09-22", solicitudes: 224, mobile: 170 },
  { date: "2024-09-23", solicitudes: 138, mobile: 230 },
  { date: "2024-09-24", solicitudes: 387, mobile: 290 },
  { date: "2024-09-25", solicitudes: 215, mobile: 250 },
  { date: "2024-09-26", solicitudes: 75, mobile: 130 },
  { date: "2024-09-27", solicitudes: 383, mobile: 420 },
  { date: "2024-09-28", solicitudes: 122, mobile: 180 },
  { date: "2024-09-29", solicitudes: 315, mobile: 240 },
  { date: "2024-09-30", solicitudes: 454, mobile: 380 },
  { date: "2024-10-01", solicitudes: 165, mobile: 220 },
  { date: "2024-10-02", solicitudes: 293, mobile: 310 },
  { date: "2024-10-03", solicitudes: 247, mobile: 190 },
  { date: "2024-10-04", solicitudes: 385, mobile: 420 },
  { date: "2024-10-05", solicitudes: 481, mobile: 390 },
  { date: "2024-10-06", solicitudes: 498, mobile: 520 },
  { date: "2024-10-07", solicitudes: 388, mobile: 300 },
  { date: "2024-10-08", solicitudes: 149, mobile: 210 },
  { date: "2024-10-09", solicitudes: 227, mobile: 180 },
  { date: "2024-10-10", solicitudes: 293, mobile: 330 },
  { date: "2024-10-11", solicitudes: 335, mobile: 270 },
  { date: "2024-10-12", solicitudes: 197, mobile: 240 },
  { date: "2024-10-13", solicitudes: 197, mobile: 160 },
  { date: "2024-10-14", solicitudes: 448, mobile: 490 },
  { date: "2024-10-15", solicitudes: 473, mobile: 380 },
  { date: "2024-10-16", solicitudes: 338, mobile: 400 },
  { date: "2024-10-17", solicitudes: 499, mobile: 420 },
  { date: "2024-10-18", solicitudes: 315, mobile: 350 },
  { date: "2024-10-19", solicitudes: 235, mobile: 180 },
  { date: "2024-10-20", solicitudes: 177, mobile: 230 },
  { date: "2024-10-21", solicitudes: 82, mobile: 140 },
  { date: "2024-10-22", solicitudes: 81, mobile: 120 },
  { date: "2024-10-23", solicitudes: 252, mobile: 290 },
  { date: "2024-10-24", solicitudes: 294, mobile: 220 },
  { date: "2024-10-25", solicitudes: 201, mobile: 250 },
  { date: "2024-10-26", solicitudes: 213, mobile: 170 },
  { date: "2024-10-27", solicitudes: 420, mobile: 460 },
  { date: "2024-10-28", solicitudes: 233, mobile: 190 },
  { date: "2024-10-29", solicitudes: 78, mobile: 130 },
  { date: "2024-10-30", solicitudes: 340, mobile: 280 },
  { date: "2024-10-31", solicitudes: 178, mobile: 230 },
  { date: "2024-11-01", solicitudes: 178, mobile: 200 },
  { date: "2024-11-02", solicitudes: 470, mobile: 410 },
  { date: "2024-11-03", solicitudes: 103, mobile: 160 },
  { date: "2024-11-04", solicitudes: 439, mobile: 380 },
  { date: "2024-11-05", solicitudes: 88, mobile: 140 },
  { date: "2024-11-06", solicitudes: 294, mobile: 250 },
  { date: "2024-11-07", solicitudes: 323, mobile: 370 },
  { date: "2024-11-08", solicitudes: 385, mobile: 320 },
  { date: "2024-11-09", solicitudes: 438, mobile: 480 },
  { date: "2024-11-10", solicitudes: 155, mobile: 200 },
  { date: "2024-11-11", solicitudes: 92, mobile: 150 },
  { date: "2024-11-12", solicitudes: 492, mobile: 420 },
  { date: "2024-11-13", solicitudes: 81, mobile: 130 },
  { date: "2024-11-14", solicitudes: 426, mobile: 380 },
  { date: "2024-11-15", solicitudes: 307, mobile: 350 },
  { date: "2024-11-16", solicitudes: 371, mobile: 310 },
  { date: "2024-11-17", solicitudes: 475, mobile: 520 },
  { date: "2024-11-18", solicitudes: 107, mobile: 170 },
  { date: "2024-11-19", solicitudes: 341, mobile: 290 },
  { date: "2024-11-20", solicitudes: 408, mobile: 450 },
  { date: "2024-11-21", solicitudes: 169, mobile: 210 },
  { date: "2024-11-22", solicitudes: 317, mobile: 270 },
  { date: "2024-11-23", solicitudes: 480, mobile: 530 },
  { date: "2024-11-24", solicitudes: 132, mobile: 180 },
  { date: "2024-11-25", solicitudes: 141, mobile: 190 },
  { date: "2024-11-26", solicitudes: 434, mobile: 380 },
  { date: "2024-11-27", solicitudes: 448, mobile: 490 },
  { date: "2024-11-28", solicitudes: 149, mobile: 200 },
  { date: "2024-11-29", solicitudes: 103, mobile: 160 },
  { date: "2024-11-30", solicitudes: 446, mobile: 400 },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  solicitudes: {
    label: "Solicitudes",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function MainGraph() {
  const [timeRange, setTimeRange] = React.useState("90d");

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Historial de solicitudes</CardTitle>
          <CardDescription>
            Mostrando el total global de solicitudes
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
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
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillsolicitudes" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-solicitudes)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-solicitudes)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
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
                const date = new Date(value);
                return date.toLocaleDateString("es-AR", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={5}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            {/*<Area*/}
            {/*    dataKey="mobile"*/}
            {/*    type="natural"*/}
            {/*    fill="url(#fillMobile)"*/}
            {/*    stroke="var(--color-mobile)"*/}
            {/*    stackId="a"*/}
            {/*/>*/}
            <Area
              dataKey="solicitudes"
              type="natural"
              fill="url(#fillsolicitudes)"
              stroke="var(--color-solicitudes)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
