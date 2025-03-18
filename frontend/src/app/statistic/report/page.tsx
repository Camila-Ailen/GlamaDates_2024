"use client"
import StatisticsReport from "@/components/statistic/statistics-report"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DayDistributionChart } from "@/components/statistic/day-distribution-chart"
import { TotalDates } from "@/components/statistic/total-dates"

export default function ReportPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/statistic">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Estadísticas
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-pink-700">Informe de Estadísticas</h1>
        <p className="text-gray-600">Visualiza y exporta el informe completo en formato PDF.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 print:hidden">
        <TotalDates />
        <DayDistributionChart />
      </div>

      <StatisticsReport companyName="GlamaDates" companyLogo="/logo.png" />
    </div>
  )
}

