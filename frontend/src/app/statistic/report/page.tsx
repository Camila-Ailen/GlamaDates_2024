"use client"
import StatisticsReport from "@/components/statistic/statistics-report"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

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

      <StatisticsReport companyName="GlamaDates" companyLogo="/logo.png" />
    </div>
  )
}

