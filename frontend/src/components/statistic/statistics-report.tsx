"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import useStatisticsStore from "@/app/store/useStatisticsStore"
import { FileDown, Printer } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface StatisticsReportProps {
  title?: string
  subtitle?: string
  companyName?: string
  companyLogo?: string
}

const StatisticsReport = ({
  title = "Informe de Estadísticas",
  subtitle = "Análisis de Citas",
  companyName = "GlamaDates",
  companyLogo = "/logo.png",
}: StatisticsReportProps) => {
  const reportRef = useRef<HTMLDivElement>(null)
  const { startDate, endDate, appointmentTotal, payMethod, perCategory, perProfessional, perDay } = useStatisticsStore()

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
  }

  // Añadir esta función después de formatDateString
  const splitTableForPagination = (data: any[], itemsPerPage = 10) => {
    if (!data || data.length <= itemsPerPage) return [data]

    const chunks = []
    for (let i = 0; i < data.length; i += itemsPerPage) {
      chunks.push(data.slice(i, i + itemsPerPage))
    }
    return chunks
  }

  const handleExportPDF = async () => {
    if (!reportRef.current) return

    try {
      const reportElement = reportRef.current

      // Configuración del PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Dimensiones de página A4 en mm
      const pageWidth = 210
      const pageHeight = 297

      // Márgenes en mm
      const margin = 10
      const contentWidth = pageWidth - margin * 2
      const contentHeight = pageHeight - margin * 2

      // Obtener el número total de elementos para dividir
      const sections = reportElement.querySelectorAll("section")
      const totalSections = sections.length

      // Contador de páginas
      let pageCount = 1

      // Crear la primera página
      let yPosition = margin

      // Añadir encabezado
      const headerElement = reportElement.querySelector(".report-header") as HTMLElement
      if (headerElement) {
        const headerCanvas = await html2canvas(headerElement, {
          scale: 2,
          useCORS: true,
          logging: false,
        })

        const headerImgData = headerCanvas.toDataURL("image/png")
        const headerHeight = (headerCanvas.height * contentWidth) / headerCanvas.width

        pdf.addImage(headerImgData, "PNG", margin, yPosition, contentWidth, headerHeight)
        yPosition += headerHeight + 5 // Espacio después del encabezado
      }

      // Procesar cada sección
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement

        // Renderizar la sección a un canvas
        const sectionCanvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          logging: false,
        })

        const sectionImgData = sectionCanvas.toDataURL("image/png")
        const sectionHeight = (sectionCanvas.height * contentWidth) / sectionCanvas.width

        // Verificar si la sección cabe en la página actual
        if (yPosition + sectionHeight > pageHeight - margin - 15) {
          // 15mm para el pie de página
          // Añadir pie de página con número de página
          pdf.setFontSize(9)
          pdf.setTextColor(100, 100, 100)
          pdf.text(`Página ${pageCount} de ${Math.ceil(totalSections / 2) + 1}`, pageWidth / 2, pageHeight - 5, {
            align: "center",
          })

          // Nueva página
          pdf.addPage()
          pageCount++
          yPosition = margin

          // Añadir encabezado pequeño en las páginas siguientes
          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)
          pdf.text(
            `${title} - Período: ${formatDateString(startDate)} - ${formatDateString(endDate)}`,
            margin,
            yPosition + 5,
          )
          yPosition += 10
        }

        // Añadir la sección a la página
        pdf.addImage(sectionImgData, "PNG", margin, yPosition, contentWidth, sectionHeight)
        yPosition += sectionHeight + 5 // Espacio después de la sección
      }

      // Añadir pie de página en la última página
      pdf.setFontSize(9)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Página ${pageCount} de ${Math.ceil(totalSections / 2) + 1}`, pageWidth / 2, pageHeight - 5, {
        align: "center",
      })

      // Añadir información de copyright en la última página
      pdf.setFontSize(8)
      pdf.text(
        `© ${new Date().getFullYear()} ${companyName} - Todos los derechos reservados`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" },
      )

      const fileName = `Informe_Estadisticas_${startDate}_${endDate}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error al exportar a PDF:", error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Añadir esta función después de handlePrint
  const captureCharts = async () => {
    // Esta función se puede implementar para capturar los gráficos reales
    // de tus componentes de estadísticas
    console.log("Capturando gráficos para el informe")

    // Ejemplo de implementación:
    // const chartElements = document.querySelectorAll('.recharts-wrapper');
    // const chartImages = [];

    // for (let i = 0; i < chartElements.length; i++) {
    //   const canvas = await html2canvas(chartElements[i] as HTMLElement);
    //   chartImages.push(canvas.toDataURL('image/png'));
    // }

    // return chartImages;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
        <Button onClick={handleExportPDF} className="flex items-center gap-2">
          <FileDown className="h-4 w-4" />
          Exportar a PDF
        </Button>
      </div>

      <div
        ref={reportRef}
        className="bg-white p-8 shadow-sm rounded-lg w-full max-w-[210mm] mx-auto"
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

          {/* Gráfico de citas */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Evolución de Citas</p>
            <div className="border rounded-lg p-4 bg-gray-50">
              {appointmentTotal.result && appointmentTotal.result.length > 0 ? (
                <img
                  src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                    <svg width="800" height="300" xmlns="http://www.w3.org/2000/svg">
                      <rect width="800" height="300" fill="#f9fafb" />
                      <text x="400" y="150" font-family="Arial" font-size="14" text-anchor="middle" fill="#666">
                        Gráfico de evolución de citas (vista previa)
                      </text>
                    </svg>
                  `)}`}
                  alt="Gráfico de evolución de citas"
                  className="w-full h-auto"
                />
              ) : (
                <p className="text-center text-gray-500 py-10">No hay datos disponibles para el período seleccionado</p>
              )}
            </div>
          </div>

          {/* Tabla de datos */}
          <div>
            <p className="text-sm font-medium mb-2">Detalle por Fecha</p>
            <div className="overflow-x-auto">
              {appointmentTotal.result && appointmentTotal.result.length > 0 ? (
                splitTableForPagination(appointmentTotal.result).map((chunk, chunkIndex) => (
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
                      {chunkIndex === splitTableForPagination(appointmentTotal.result).length - 1 && (
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
          </div>
        </section>

        {/* Distribución por día de la semana */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-pink-700">Distribución por Día de la Semana</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
              {perDay && perDay.length > 0 ? (
                <img
                  src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
                      <rect width="300" height="300" fill="#f9fafb" />
                      <text x="150" y="150" font-family="Arial" font-size="14" text-anchor="middle" fill="#666">
                        Gráfico circular de días (vista previa)
                      </text>
                    </svg>
                  `)}`}
                  alt="Gráfico de distribución por día"
                  className="w-full h-auto max-h-[200px]"
                />
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
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-pink-700">Métodos de Pago</h3>
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
                  const total = payMethod.reduce((acc: number, curr: { count: number }) => acc + (curr.count || 0), 0)
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
        </section>

        {/* Categorías */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-pink-700">Distribución por Categoría</h3>
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
        <section>
          <h3 className="text-lg font-semibold mb-4 text-pink-700">Distribución por Profesional</h3>
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

export default StatisticsReport

