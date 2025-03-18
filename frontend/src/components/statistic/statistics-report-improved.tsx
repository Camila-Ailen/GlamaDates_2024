"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import useStatisticsStore from "@/app/store/useStatisticsStore"
import { FileDown, Printer, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { generatePDF, formatDateString, splitTableForPagination } from "./pdf-utils"
import { captureSpecificCharts } from "./chart-capture"
import { ChartsContainer } from "./charts-container"

interface StatisticsReportProps {
  title?: string
  subtitle?: string
  companyName?: string
  companyLogo?: string
}

const StatisticsReportImproved = ({
  title = "Informe de Estadísticas",
  subtitle = "Análisis de Citas",
  companyName = "GlamaDates",
  companyLogo = "/logo.png",
}: StatisticsReportProps) => {
  const reportRef = useRef<HTMLDivElement>(null)
  const { startDate, endDate, appointmentTotal, payMethod, perCategory, perProfessional, perDay } = useStatisticsStore()
  const [isExporting, setIsExporting] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [chartImages, setChartImages] = useState<Record<string, string>>({})
  const [chartsContainerRef, setChartsContainerRef] = useState<HTMLDivElement | null>(null)

  // Capturar los gráficos cuando el componente se monta
  useEffect(() => {
    const captureCharts = async () => {
      try {
        setIsCapturing(true)
        // Esperar un momento para que los gráficos se rendericen completamente
        setTimeout(async () => {
          const chartIds = [
            "total-dates-chart",
            "week-day-chart",
            "pay-method-chart",
            "per-category-chart",
            "per-professional-chart",
          ]

          const capturedCharts = await captureSpecificCharts(chartIds)
          setChartImages(capturedCharts)
          setIsCapturing(false)
        }, 1000)
      } catch (error) {
        console.error("Error al capturar gráficos:", error)
        setIsCapturing(false)
      }
    }

    if (chartsContainerRef) {
      captureCharts()
    }
  }, [chartsContainerRef])

  const handleExportPDF = async () => {
    if (!reportRef.current) return

    setIsExporting(true)
    try {
      // Capturar los gráficos nuevamente antes de generar el PDF
      const chartIds = [
        "total-dates-chart",
        "week-day-chart",
        "pay-method-chart",
        "per-category-chart",
        "per-professional-chart",
      ]

      const freshChartImages = await captureSpecificCharts(chartIds)
      setChartImages((prev) => ({ ...prev, ...freshChartImages }))

      // Pequeña pausa para asegurar que los gráficos se rendericen en el DOM
      await new Promise((resolve) => setTimeout(resolve, 300))

      const userInfo = { name: "John", lastName: "Doe", email: "john.glamadates@example.com" }
      const pdf = await generatePDF(reportRef.current, title, startDate, endDate, companyName, userInfo)

      const fileName = `Informe_Estadisticas_${startDate}_${endDate}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error al exportar a PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrint = async () => {
    // Asegurarse de que las imágenes estén capturadas antes de imprimir
    if (Object.keys(chartImages).length === 0) {
      setIsCapturing(true)
      const chartIds = [
        "total-dates-chart",
        "week-day-chart",
        "pay-method-chart",
        "per-category-chart",
        "per-professional-chart",
      ]

      const freshChartImages = await captureSpecificCharts(chartIds)
      setChartImages((prev) => ({ ...prev, ...freshChartImages }))

      // Pequeña pausa para asegurar que los gráficos se rendericen en el DOM
      await new Promise((resolve) => setTimeout(resolve, 300))
      setIsCapturing(false)
    }

    window.print()
  }

  const handleChartsContainerReady = (containerRef: HTMLDivElement) => {
    setChartsContainerRef(containerRef)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Contenedor de gráficos para captura - oculto en impresión */}
      <div className="mb-8 print:hidden">
        <ChartsContainer onCaptureReady={handleChartsContainerReady} />
      </div>

      {/* Botones de acción - ocultos en impresión */}
      <div className="flex justify-end gap-2 print:hidden">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="flex items-center gap-2"
          disabled={isExporting || isCapturing}
        >
          <Printer className="h-4 w-4" />
          {isCapturing ? "Preparando..." : "Imprimir"}
        </Button>
        <Button onClick={handleExportPDF} className="flex items-center gap-2" disabled={isExporting || isCapturing}>
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando PDF...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              Exportar a PDF
            </>
          )}
        </Button>
      </div>

      {/* Contenido del informe - visible en impresión */}
      <div
        id="reportRef"
        ref={reportRef}
        className="bg-white p-8 shadow-sm rounded-lg w-full max-w-[210mm] mx-auto print:shadow-none print:p-0 print:max-w-none"
        style={{ minHeight: "297mm" }}
      >
        {/* Encabezado del informe */}
        <div className="report-header flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-pink-700">{title}</h1>
            <h2 className="text-xl text-gray-600">{subtitle}</h2>
            <p className="text-sm text-gray-500 mt-2">
              Período: {formatDateString(startDate)} - {formatDateString(endDate)}
            </p>
          </div>
          <div className="text-right">
            <img src={companyLogo || "/placeholder.svg"} alt={companyName} className="h-12 mb-2" />
            <p className="text-sm font-medium">{companyName}</p>
            <p className="text-xs text-gray-500">Fecha de generación: {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
          </div>
        </div>

        {/* Resumen de citas */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-pink-700">Resumen de Citas</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-pink-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Citas Completadas</p>
              <p className="text-2xl font-bold text-pink-700">{appointmentTotal.totals.total_completado || 0}</p>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Citas Pendientes</p>
              <p className="text-2xl font-bold text-pink-700">
                {appointmentTotal.totals.total_pendiente_seniado_activo || 0}
              </p>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Citas No Completadas</p>
              <p className="text-2xl font-bold text-pink-700">
                {appointmentTotal.totals.total_moroso_inactivo_cancelado || 0}
              </p>
            </div>
          </div>
        </section>

        {/* Gráfico de citas */}
        <section className="mb-8 print:break-inside-avoid">
          <h3 className="text-lg font-semibold mb-4 text-pink-700">Evolución de Citas</h3>
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Evolución de Citas por Fecha</p>
            <div className="border rounded-lg p-4 bg-gray-50">
              {chartImages["total-dates-chart"] ? (
                <img
                  src={chartImages["total-dates-chart"] || "/placeholder.svg"}
                  alt="Gráfico de evolución de citas"
                  className="w-full h-auto"
                />
              ) : isCapturing ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                  <p className="ml-2 text-gray-500">Cargando gráfico...</p>
                </div>
              ) : appointmentTotal.result && appointmentTotal.result.length > 0 ? (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-center text-gray-500">El gráfico se mostrará en el PDF exportado</p>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">No hay datos disponibles para el período seleccionado</p>
              )}
            </div>
          </div>
        </section>

        {/* Tabla de datos */}
        <section className="mb-8 print:break-inside-avoid">
          <h3 className="text-lg font-semibold mb-4 text-pink-700">Detalle por Fecha</h3>
          <div className="overflow-x-auto">
            {appointmentTotal.result && appointmentTotal.result.length > 0 ? (
              splitTableForPagination(appointmentTotal.result, 8).map((chunk, chunkIndex) => (
                <div key={`chunk-${chunkIndex}`} className="mb-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2 text-left">Fecha</th>
                        <th className="border px-4 py-2 text-right">Completadas</th>
                        <th className="border px-4 py-2 text-right">Pendientes</th>
                        <th className="border px-4 py-2 text-right">No Completadas</th>
                        <th className="border px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chunk.map((item: any, index: number) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border px-4 py-2">{format(new Date(item.fecha), "dd/MM/yyyy")}</td>
                          <td className="border px-4 py-2 text-right">{item.total_completado}</td>
                          <td className="border px-4 py-2 text-right">{item.total_pendiente_seniado_activo}</td>
                          <td className="border px-4 py-2 text-right">{item.total_moroso_inactivo_cancelado}</td>
                          <td className="border px-4 py-2 text-right font-medium">
                            {item.total_completado +
                              item.total_pendiente_seniado_activo +
                              item.total_moroso_inactivo_cancelado}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {chunkIndex === splitTableForPagination(appointmentTotal.result, 8).length - 1 && (
                      <tfoot>
                        <tr className="bg-pink-50">
                          <td className="border px-4 py-2 font-medium">Total</td>
                          <td className="border px-4 py-2 text-right font-medium">
                            {appointmentTotal.totals.total_completado || 0}
                          </td>
                          <td className="border px-4 py-2 text-right font-medium">
                            {appointmentTotal.totals.total_pendiente_seniado_activo || 0}
                          </td>
                          <td className="border px-4 py-2 text-right font-medium">
                            {appointmentTotal.totals.total_moroso_inactivo_cancelado || 0}
                          </td>
                          <td className="border px-4 py-2 text-right font-bold">
                            {(appointmentTotal.totals.total_completado || 0) +
                              (appointmentTotal.totals.total_pendiente_seniado_activo || 0) +
                              (appointmentTotal.totals.total_moroso_inactivo_cancelado || 0)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No hay datos disponibles</p>
            )}
          </div>
        </section>

        {/* Distribución por día de la semana */}
        <section className="mb-8 print:break-inside-avoid">
          <h3 className="text-lg font-semibold mb-4 text-pink-700">Distribución por Día de la Semana</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
              {chartImages["week-day-chart"] ? (
                <img
                  src={chartImages["week-day-chart"] || "/placeholder.svg"}
                  alt="Gráfico de distribución por día"
                  className="w-full h-auto max-h-[200px]"
                />
              ) : isCapturing ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                  <p className="ml-2 text-gray-500">Cargando gráfico...</p>
                </div>
              ) : perDay && perDay.length > 0 ? (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-center text-gray-500">El gráfico se mostrará en el PDF exportado</p>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">No hay datos disponibles</p>
              )}
            </div>
            <div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">Día</th>
                    <th className="border px-4 py-2 text-right">Cantidad</th>
                    <th className="border px-4 py-2 text-right">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {perDay && perDay.length > 0 ? (
                    perDay.map((item: any, index: number) => {
                      const dayTranslations: Record<string, string> = {
                        Monday: "Lunes",
                        Tuesday: "Martes",
                        Wednesday: "Miércoles",
                        Thursday: "Jueves",
                        Friday: "Viernes",
                        Saturday: "Sábado",
                        Sunday: "Domingo",
                      }
                      const total = perDay.reduce((acc: number, curr: { count: number }) => acc + (curr.count || 0), 0)
                      const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0.0"

                      return (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border px-4 py-2">{dayTranslations[item.day] || item.day}</td>
                          <td className="border px-4 py-2 text-right">{item.count}</td>
                          <td className="border px-4 py-2 text-right">{percentage}%</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="border px-4 py-2 text-center text-gray-500">
                        No hay datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Métodos de pago */}
        <section className="mb-8 print:break-inside-avoid">
          <h3 className="text-lg font-semibold mb-4 text-pink-700">Métodos de Pago</h3>
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
              {chartImages["pay-method-chart"] ? (
                <img
                  src={chartImages["pay-method-chart"] || "/placeholder.svg"}
                  alt="Gráfico de métodos de pago"
                  className="w-full h-auto max-h-[200px]"
                />
              ) : isCapturing ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                  <p className="ml-2 text-gray-500">Cargando gráfico...</p>
                </div>
              ) : payMethod && payMethod.length > 0 ? (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-center text-gray-500">El gráfico se mostrará en el PDF exportado</p>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">No hay datos disponibles</p>
              )}
            </div>
            <div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">Método de Pago</th>
                    <th className="border px-4 py-2 text-right">Cantidad</th>
                    <th className="border px-4 py-2 text-right">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {payMethod && payMethod.length > 0 ? (
                    payMethod.map((item: any, index: number) => {
                      const total = payMethod.reduce(
                        (acc: number, curr: { count: number }) => acc + (curr.count || 0),
                        0,
                      )
                      const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0.0"

                      return (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border px-4 py-2">{item.payMethod || "No especificado"}</td>
                          <td className="border px-4 py-2 text-right">{item.count}</td>
                          <td className="border px-4 py-2 text-right">{percentage}%</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="border px-4 py-2 text-center text-gray-500">
                        No hay datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section className="mb-8 print:break-inside-avoid">
          <h3 className="text-lg font-semibold mb-4 text-pink-700">Distribución por Categoría</h3>
          <div className="mb-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              {chartImages["per-category-chart"] ? (
                <img
                  src={chartImages["per-category-chart"] || "/placeholder.svg"}
                  alt="Gráfico de categorías"
                  className="w-full h-auto"
                />
              ) : isCapturing ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                  <p className="ml-2 text-gray-500">Cargando gráfico...</p>
                </div>
              ) : perCategory && perCategory.length > 0 ? (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-center text-gray-500">El gráfico se mostrará en el PDF exportado</p>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">No hay datos disponibles</p>
              )}
            </div>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Categoría</th>
                <th className="border px-4 py-2 text-right">Cantidad</th>
                <th className="border px-4 py-2 text-right">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {perCategory && perCategory.length > 0 ? (
                perCategory.map((item: any, index: number) => {
                  const total = perCategory.reduce((acc: number, curr: { count: number }) => acc + (curr.count || 0), 0)
                  const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0.0"

                  return (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border px-4 py-2">{item.category || "No especificado"}</td>
                      <td className="border px-4 py-2 text-right">{item.count}</td>
                      <td className="border px-4 py-2 text-right">{percentage}%</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={3} className="border px-4 py-2 text-center text-gray-500">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Profesionales */}
        <section className="print:break-inside-avoid">
          <h3 className="text-lg font-semibold mb-4 text-pink-700">Distribución por Profesional</h3>
          <div className="mb-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              {chartImages["per-professional-chart"] ? (
                <img
                  src={chartImages["per-professional-chart"] || "/placeholder.svg"}
                  alt="Gráfico de profesionales"
                  className="w-full h-auto"
                />
              ) : isCapturing ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                  <p className="ml-2 text-gray-500">Cargando gráfico...</p>
                </div>
              ) : perProfessional && perProfessional.length > 0 ? (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-center text-gray-500">El gráfico se mostrará en el PDF exportado</p>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">No hay datos disponibles</p>
              )}
            </div>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Profesional</th>
                <th className="border px-4 py-2 text-right">Cantidad</th>
                <th className="border px-4 py-2 text-right">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {perProfessional && perProfessional.length > 0 ? (
                perProfessional.map((item: any, index: number) => {
                  const total = perProfessional.reduce(
                    (acc: number, curr: { count: number }) => acc + (curr.count || 0),
                    0,
                  )
                  const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0.0"

                  return (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border px-4 py-2">{item.professional || "No especificado"}</td>
                      <td className="border px-4 py-2 text-right">{item.count}</td>
                      <td className="border px-4 py-2 text-right">{percentage}%</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={3} className="border px-4 py-2 text-center text-gray-500">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Pie de página */}
        <footer className="mt-12 pt-4 border-t text-center text-xs text-gray-500">
          <p>
            Este informe fue generado automáticamente. Período: {startDate} - {endDate}
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} {companyName} - Todos los derechos reservados
          </p>
          <p className="print-page-number"></p>
        </footer>
      </div>
    </div>
  )
}

export default StatisticsReportImproved

