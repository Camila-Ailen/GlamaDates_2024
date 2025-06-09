"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import useStatisticsStore from "@/app/store/useStatisticsStore"
import useAuthStore from "@/app/store/useAuthStore"
import { FileDown, Printer, Loader2, Settings, Eye, EyeOff } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface StatisticsReportProps {
    title?: string
    subtitle?: string
    companyName?: string
    companyLogo?: string
}

interface ReportSection {
    id: string
    name: string
    enabled: boolean
}

const StatisticsReportAdvanced = ({
    title = "Informe de Estadísticas",
    subtitle = "Análisis de Citas",
    companyName = "GlamaDates",
}: StatisticsReportProps) => {
    const reportRef = useRef<HTMLDivElement>(null)
    const { startDate, endDate, appointmentTotal, payMethod, perCategory, perProfessional, perDay } = useStatisticsStore()
    const { user } = useAuthStore()
    const [isExporting, setIsExporting] = useState(false)
    const [chartImages, setChartImages] = useState<{ [key: string]: string }>({})
    const [showSettings, setShowSettings] = useState(false)
    const [includeCharts, setIncludeCharts] = useState(true)
    const [reportSections, setReportSections] = useState<ReportSection[]>([
        { id: "summary", name: "Resumen Ejecutivo", enabled: true },
        { id: "evolution", name: "Evolución de Citas por Fecha", enabled: true },
        { id: "payMethods", name: "Métodos de Pago", enabled: true },
        { id: "weekDays", name: "Distribución por Días de la Semana", enabled: true },
        { id: "categories", name: "Distribución por Categoría", enabled: true },
        { id: "professionals", name: "Distribución por Profesional", enabled: true },
    ])

    const userInfo = user || {
        firstName: "Usuario",
        lastName: "Sistema",
        email: "",
        role: { role: "Invitado" },
    }

    const formatDateString = (dateStr: string) => {
        if (!dateStr) return ""
        const date = new Date(dateStr)
        return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
    }

    // Procesar datos
    const payMethodRows =
        payMethod && payMethod.totals
            ? Object.entries(payMethod.totals).map(([key, value]) => ({
                payMethod: key.replace("total_", "").replace("_", " ").toUpperCase(),
                count: value || 0,
            }))
            : []
    const totalPagos = payMethodRows.reduce((acc, curr) => acc + (typeof curr.count === "number" ? curr.count : 0), 0)

    const dayTranslations: Record<string, string> = {
        Monday: "Lunes",
        Tuesday: "Martes",
        Wednesday: "Miércoles",
        Thursday: "Jueves",
        Friday: "Viernes",
        Saturday: "Sábado",
        Sunday: "Domingo",
    }

    const perCategoryRows =
        perCategory && perCategory.totals && Array.isArray(perCategory.totals)
            ? perCategory.totals.map((item: any) => ({
                category: item.categoria || "No especificado",
                count: item.total_citas || 0,
                totalIngresos: item.total_ingresos || 0,
            }))
            : []
    const totalCitas = perCategoryRows.reduce(
        (acc: number, curr: { count: number }) => acc + (typeof curr.count === "number" ? curr.count : 0),
        0,
    )

    const perProfessionalRows =
        perProfessional && perProfessional.totals && Array.isArray(perProfessional.totals)
            ? perProfessional.totals.map((item: any) => ({
                profesional: item.profesional || "No especificado",
                total_citas: item.total_citas || 0,
                totalIngresos: item.total_ingresos || 0,
            }))
            : []
    const totalCitasProfesional = perProfessionalRows.reduce(
        (acc: number, curr: { total_citas: number }) => acc + (typeof curr.total_citas === "number" ? curr.total_citas : 0),
        0,
    )

    // Capturar gráficos con mejor calidad
    useEffect(() => {
        const captureCharts = async () => {
            try {
                const charts: { [key: string]: string } = {}
                const chartSelectors = [
                    '[data-chart="total-dates"]',
                    '[data-chart="per-professional"]',
                    '[data-chart="per-category"]',
                    '[data-chart="pay-method"]',
                    '[data-chart="week-day"]',
                ]

                for (const selector of chartSelectors) {
                    const chartElement = document.querySelector(selector) as HTMLElement
                    if (chartElement) {
                        try {
                            // Mejorar la calidad de captura
                            const canvas = await html2canvas(chartElement, {
                                scale: 3, // Aumentar escala para mejor calidad
                                useCORS: true,
                                logging: false,
                                backgroundColor: "#ffffff",
                                allowTaint: true,
                                width: chartElement.offsetWidth,
                                height: chartElement.offsetHeight,
                                windowWidth: chartElement.offsetWidth,
                                windowHeight: chartElement.offsetHeight,
                            })
                            charts[selector] = canvas.toDataURL("image/png", 0.95) // Mejor calidad
                            console.log(`✅ Gráfico capturado: ${selector}`)
                        } catch (error) {
                            console.warn(`❌ Error capturando gráfico ${selector}:`, error)
                        }
                    }
                }
                setChartImages(charts)
            } catch (error) {
                console.error("Error capturando gráficos:", error)
            }
        }

        const timer = setTimeout(captureCharts, 2000)
        return () => clearTimeout(timer)
    }, [appointmentTotal, payMethod, perCategory, perProfessional, perDay])

    const toggleSection = (sectionId: string) => {
        setReportSections((prev) =>
            prev.map((section) => (section.id === sectionId ? { ...section, enabled: !section.enabled } : section)),
        )
    }

    const isEnabled = (sectionId: string) => {
        return reportSections.find((section) => section.id === sectionId)?.enabled || false
    }

    // Función mejorada para generar PDF
    const handleExportPDF = async () => {
        if (!reportRef.current) return

        setIsExporting(true)
        try {
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            })

            const pageWidth = 210
            const pageHeight = 297
            const margin = 20
            const contentWidth = pageWidth - margin * 2

            let currentY = margin
            let pageNumber = 1

            const addNewPage = () => {
                pdf.addPage()
                pageNumber++
                currentY = margin

                // Encabezado simplificado
                pdf.setFontSize(12)
                pdf.setTextColor(219, 39, 119)
                pdf.setFont("helvetica", "bold")
                pdf.text(title, margin, currentY)
                currentY += 8

                pdf.setFont("helvetica", "normal")
                pdf.setFontSize(10)
                pdf.setTextColor(100, 100, 100)
                pdf.text(`Período: ${formatDateString(startDate)} - ${formatDateString(endDate)}`, margin, currentY)
                currentY += 15
            }

            const checkSpace = (requiredHeight: number, isTable = false) => {
                const availableSpace = pageHeight - currentY - margin - 20

                // Para tablas, ser más permisivo con el espacio
                if (isTable && availableSpace < requiredHeight && availableSpace > 60) {
                    return false // No crear nueva página si hay espacio razonable
                }

                if (currentY + requiredHeight > pageHeight - margin - 20) {
                    addNewPage()
                    return true
                }
                return false
            }

            const addText = (text: string, fontSize: number, isBold = false, color = [0, 0, 0], spacing = 6) => {
                checkSpace(fontSize + spacing)
                pdf.setFontSize(fontSize)
                pdf.setTextColor(color[0], color[1], color[2])
                pdf.setFont("helvetica", isBold ? "bold" : "normal")
                pdf.text(text, margin, currentY)
                currentY += fontSize * 0.4 + spacing
            }

            const addImage = (imgSrc: string, maxHeight: number, description: string) => {
                if (!includeCharts) return

                checkSpace(maxHeight + 10)
                try {
                    const img = new Image()
                    img.src = imgSrc

                    // Mejorar el cálculo de dimensiones
                    const aspectRatio = img.naturalHeight / img.naturalWidth
                    let imgWidth = contentWidth * 0.95 // 95% del ancho disponible
                    let imgHeight = imgWidth * aspectRatio

                    // Limitar altura máxima pero ser más generoso
                    if (imgHeight > maxHeight) {
                        imgHeight = maxHeight
                        imgWidth = imgHeight / aspectRatio
                    }

                    // Centrar imagen
                    const xOffset = (contentWidth - imgWidth) / 2

                    pdf.addImage(imgSrc, "PNG", margin + xOffset, currentY, imgWidth, imgHeight)
                    currentY += imgHeight + 8 // Menos espacio después de la imagen
                } catch (error) {
                    addText(`[Gráfico: ${description} - No disponible]`, 10, false, [150, 150, 150])
                }
            }

            const addTable = (data: any[], headers: string[], tableTitle: string, allowSamePage = false) => {
                if (!data || data.length === 0) return

                if (tableTitle) {
                    // Si es la misma página y hay poco espacio, no añadir título separado
                    if (allowSamePage && pageHeight - currentY < 100) {
                        // Continuar en la misma página sin título repetido
                    } else {
                        addText(tableTitle, 12, true, [219, 39, 119], 8)
                    }
                }

                const rowHeight = 8
                const headerHeight = 10
                const availableHeight = pageHeight - currentY - 40
                let maxRowsPerPage = Math.floor(availableHeight / rowHeight)

                // Si hay muy pocas filas y caben en la página actual, no paginar
                if (data.length <= 5 && availableHeight > data.length * rowHeight + headerHeight + 30) {
                    maxRowsPerPage = data.length
                }

                const chunks = []
                for (let i = 0; i < data.length; i += maxRowsPerPage) {
                    chunks.push(data.slice(i, i + maxRowsPerPage))
                }

                chunks.forEach((chunk, chunkIndex) => {
                    // Solo crear nueva página si realmente no hay espacio
                    if (chunkIndex > 0 || (!allowSamePage && currentY > pageHeight * 0.7)) {
                        addNewPage()
                        if (tableTitle && chunkIndex > 0) {
                            addText(tableTitle + " (continuación)", 11, true, [219, 39, 119], 8)
                        }
                    }

                    const spaceNeeded = headerHeight + chunk.length * rowHeight + 20
                    checkSpace(spaceNeeded, true)

                    // Encabezados con mejor estilo
                    pdf.setFillColor(248, 250, 252)
                    pdf.rect(margin, currentY, contentWidth, headerHeight, "F")
                    pdf.setDrawColor(219, 39, 119)
                    pdf.setLineWidth(0.5)
                    pdf.rect(margin, currentY, contentWidth, headerHeight, "S")

                    pdf.setFontSize(9)
                    pdf.setTextColor(0, 0, 0)
                    pdf.setFont("helvetica", "bold")

                    const colWidth = contentWidth / headers.length
                    headers.forEach((header, index) => {
                        pdf.text(header, margin + index * colWidth + 4, currentY + 7)
                    })

                    currentY += headerHeight

                    // Filas con mejor formato
                    chunk.forEach((row: any, rowIndex: number) => {
                        if (rowIndex % 2 === 0) {
                            pdf.setFillColor(253, 253, 253)
                            pdf.rect(margin, currentY, contentWidth, rowHeight, "F")
                        }

                        pdf.setDrawColor(230, 230, 230)
                        pdf.setLineWidth(0.2)
                        pdf.rect(margin, currentY, contentWidth, rowHeight, "S")

                        pdf.setFont("helvetica", "normal")
                        pdf.setFontSize(8)
                        pdf.setTextColor(0, 0, 0)

                        Object.values(row).forEach((value: any, colIndex: number) => {
                            const text = String(value || "")
                            const x = margin + colIndex * colWidth + 4
                            pdf.text(text, x, currentY + 5.5)
                        })

                        currentY += rowHeight
                    })

                    currentY += 15
                })
            }

            // CONTENIDO DEL PDF

            // Encabezado principal mejorado
            pdf.setFontSize(24)
            pdf.setTextColor(219, 39, 119)
            pdf.setFont("helvetica", "bold")
            pdf.text(title, margin, currentY)
            currentY += 15

            pdf.setFontSize(16)
            pdf.setTextColor(100, 100, 100)
            pdf.setFont("helvetica", "normal")
            pdf.text(subtitle, margin, currentY)
            currentY += 12

            // Información del período
            pdf.setFontSize(10)
            pdf.setTextColor(80, 80, 80)
            pdf.text(`Período: ${formatDateString(startDate)} - ${formatDateString(endDate)}`, margin, currentY)
            currentY += 6
            pdf.text(`Fecha de generación: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, margin, currentY)
            currentY += 10

            // Información del usuario
            pdf.setFontSize(9)
            pdf.setTextColor(120, 120, 120)
            pdf.text(`Solicitado por: ${userInfo.firstName} ${userInfo.lastName} (${userInfo.email})`, margin, currentY)
            if (userInfo.role) {
                currentY += 5
                pdf.text(`Rol: ${userInfo.role.role}`, margin, currentY)
            }
            currentY += 15

            // Línea separadora
            pdf.setDrawColor(219, 39, 119)
            pdf.setLineWidth(1)
            pdf.line(margin, currentY, pageWidth - margin, currentY)
            currentY += 15

            // Secciones según configuración
            if (isEnabled("summary")) {
                addText("RESUMEN EJECUTIVO", 16, true, [219, 39, 119], 10)
                const summaryData = [
                    { concepto: "Citas Completadas", cantidad: appointmentTotal.totals.total_completado || 0 },
                    { concepto: "Citas Pendientes", cantidad: appointmentTotal.totals.total_pendiente_seniado_activo || 0 },
                    { concepto: "Citas No Completadas", cantidad: appointmentTotal.totals.total_moroso_inactivo_cancelado || 0 },
                ]
                addTable(summaryData, ["Concepto", "Cantidad"], "", true)
            }

            if (isEnabled("evolution")) {
                addNewPage()
                addText("EVOLUCIÓN DE CITAS POR FECHA", 16, true, [219, 39, 119], 10)

                if (includeCharts && chartImages['[data-chart="total-dates"]']) {
                    addImage(chartImages['[data-chart="total-dates"]'], 100, "Evolución de citas")
                }

                if (appointmentTotal.result && appointmentTotal.result.length > 0) {
                    const dateData = appointmentTotal.result.map((item: any) => ({
                        fecha: format(new Date(item.fecha), "dd/MM/yyyy"),
                        completadas: item.total_completado,
                        pendientes: item.total_pendiente_seniado_activo,
                        no_completadas: item.total_moroso_inactivo_cancelado,
                        total: item.total_completado + item.total_pendiente_seniado_activo + item.total_moroso_inactivo_cancelado,
                    }))
                    addTable(
                        dateData,
                        ["Fecha", "Completadas", "Pendientes", "No Completadas", "Total"],
                        "Detalle por Fecha",
                        true,
                    )
                }
            }

            if (isEnabled("payMethods") && payMethodRows.length > 0) {
                addNewPage()
                addText("MÉTODOS DE PAGO", 16, true, [219, 39, 119], 10)

                if (includeCharts && chartImages['[data-chart="pay-method"]']) {
                    addImage(chartImages['[data-chart="pay-method"]'], 80, "Métodos de pago")
                }

                const payData = payMethodRows.map((item: any) => ({
                    metodo: item.payMethod || "No especificado",
                    cantidad: item.count,
                    porcentaje: totalPagos > 0 ? `${((item.count / totalPagos) * 100).toFixed(1)}%` : "0.0%",
                }))
                addTable(payData, ["Método de Pago", "Cantidad", "Porcentaje"], "", true)
            }

            if (isEnabled("weekDays") && perDay && perDay.length > 0) {
                addNewPage()
                addText("DISTRIBUCIÓN POR DÍAS DE LA SEMANA", 16, true, [219, 39, 119], 10)

                if (includeCharts && chartImages['[data-chart="week-day"]']) {
                    addImage(chartImages['[data-chart="week-day"]'], 80, "Distribución por día")
                }

                const total = perDay.reduce((acc: number, curr: { count: number }) => acc + (curr.count || 0), 0)
                const dayData = perDay.map((item: any) => ({
                    dia: dayTranslations[item.day] || item.day,
                    cantidad: item.count,
                    porcentaje: total > 0 ? `${((item.count / total) * 100).toFixed(1)}%` : "0.0%",
                }))
                addTable(dayData, ["Día", "Cantidad", "Porcentaje"], "", true)
            }

            if (isEnabled("categories") && perCategory && perCategory.totals && perCategory.totals.length > 0) {
                addNewPage()
                addText("DISTRIBUCIÓN POR CATEGORÍA", 16, true, [219, 39, 119], 10)

                if (includeCharts && chartImages['[data-chart="per-category"]']) {
                    addImage(chartImages['[data-chart="per-category"]'], 80, "Distribución por categoría")
                }

                const total = perCategory.totals.reduce(
                    (acc: number, curr: { total_citas: number }) => acc + (curr.total_citas || 0),
                    0,
                )
                const categoryData = perCategory.totals.map((item: any) => ({
                    categoria: item.categoria || "No especificado",
                    cantidad: item.total_citas || 0,
                    porcentaje: total > 0 ? `${((item.total_citas / total) * 100).toFixed(1)}%` : "0.0%",
                    ingresos: item.total_ingresos ? `$${item.total_ingresos.toLocaleString()}` : "$0.00",
                }))
                addTable(categoryData, ["Categoría", "Cantidad", "Porcentaje", "Ingresos"], "", true)
            }

            if (
                isEnabled("professionals") &&
                perProfessional &&
                perProfessional.totals &&
                perProfessional.totals.length > 0
            ) {
                addNewPage()
                addText("DISTRIBUCIÓN POR PROFESIONAL", 16, true, [219, 39, 119], 10)

                if (includeCharts && chartImages['[data-chart="per-professional"]']) {
                    addImage(chartImages['[data-chart="per-professional"]'], 80, "Distribución por profesional")
                }

                const total = perProfessional.totals.reduce(
                    (acc: number, curr: { total_citas: number }) => acc + (curr.total_citas || 0),
                    0,
                )
                const professionalData = perProfessional.totals.map((item: any) => ({
                    profesional: item.profesional || "No especificado",
                    cantidad: item.total_citas || 0,
                    porcentaje: total > 0 ? `${(((item.total_citas || 0) / total) * 100).toFixed(1)}%` : "0.0%",
                    ingresos: item.total_ingresos ? `$${item.total_ingresos.toLocaleString()}` : "$0.00",
                }))
                addTable(professionalData, ["Profesional", "Cantidad", "Porcentaje", "Ingresos"], "", true)
            }

            // Pie de página
            checkSpace(25)
            pdf.setDrawColor(200, 200, 200)
            pdf.line(margin, currentY, pageWidth - margin, currentY)
            currentY += 8

            pdf.setFontSize(8)
            pdf.setTextColor(100, 100, 100)
            pdf.text(
                `© ${new Date().getFullYear()} ${companyName} - Todos los derechos reservados`,
                pageWidth / 2,
                currentY,
                { align: "center" },
            )

            // Números de página
            const totalPages = pdf.getNumberOfPages()
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i)
                pdf.setFontSize(9)
                pdf.setTextColor(100, 100, 100)
                pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: "center" })
            }

            const enabledSections = reportSections
                .filter((s) => s.enabled)
                .map((s) => s.name)
                .join("_")
            const chartsText = includeCharts ? "con_graficos" : "solo_tablas"
            const fileName = `Informe_${enabledSections.substring(0, 30)}_${chartsText}_${startDate}_${endDate}.pdf`
            pdf.save(fileName)
        } catch (error) {
            console.error("Error al exportar a PDF:", error)
        } finally {
            setIsExporting(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <>
            <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body * {
            visibility: hidden;
          }
          
          #report-content,
          #report-content * {
            visibility: visible;
          }
          
          #report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .report-section {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 40px;
          }
          
          .chart-container {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 30px;
          }
          
          .chart-image {
            max-width: 100%;
            height: auto;
            object-fit: contain;
            border-radius: 8px;
          }
          
          @page {
            margin: 25mm;
            size: A4;
          }
        }
      `}</style>

            <div className="flex flex-col gap-6">
                {/* Panel de configuración */}
                <Card className="print:hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Configuración del Informe
                            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
                                {showSettings ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    {showSettings && (
                        <CardContent className="space-y-6">
                            {/* Configuración de gráficos */}
                            <div className="flex items-center space-x-2">
                                <Switch id="include-charts" checked={includeCharts} onCheckedChange={setIncludeCharts} />
                                <Label htmlFor="include-charts" className="font-medium">
                                    Incluir gráficos en el PDF
                                </Label>
                            </div>

                            <Separator />

                            {/* Selección de secciones */}
                            <div>
                                <h4 className="font-medium mb-4">Secciones a incluir:</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {reportSections.map((section) => (
                                        <div key={section.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={section.id}
                                                checked={section.enabled}
                                                onCheckedChange={() => toggleSection(section.id)}
                                            />
                                            <Label htmlFor={section.id} className="text-sm">
                                                {section.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Estado de gráficos */}
                            <div>
                                <h4 className="font-medium mb-3">Estado de captura de gráficos:</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {[
                                        { key: '[data-chart="total-dates"]', name: "Evolución de Citas" },
                                        { key: '[data-chart="week-day"]', name: "Días de la Semana" },
                                        { key: '[data-chart="pay-method"]', name: "Métodos de Pago" },
                                        { key: '[data-chart="per-category"]', name: "Por Categoría" },
                                        { key: '[data-chart="per-professional"]', name: "Por Profesional" },
                                    ].map((chart) => (
                                        <div key={chart.key} className="flex items-center gap-2">
                                            <div
                                                className={`w-3 h-3 rounded-full ${chartImages[chart.key] ? "bg-green-500" : "bg-gray-300"}`}
                                            />
                                            <span className={chartImages[chart.key] ? "text-green-700" : "text-gray-500"}>{chart.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Botones de acción */}
                <div className="flex justify-end gap-3 print:hidden">
                    {/*
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2" disabled={isExporting}>
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
            */}
                    <Button onClick={handleExportPDF} className="flex items-center gap-2" disabled={isExporting}>
                        {isExporting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generando PDF personalizado...
                            </>
                        ) : (
                            <>
                                <FileDown className="h-4 w-4" />
                                Exportar PDF {includeCharts ? "con Gráficos" : "Solo Tablas"}
                            </>
                        )}
                    </Button>
                </div>

                {/* Contenido del informe */}
                <div
                    id="report-content"
                    ref={reportRef}
                    className="bg-white p-12 shadow-lg rounded-lg w-full max-w-[210mm] mx-auto"
                    style={{ minHeight: "297mm" }}
                >
                    {/* Encabezado mejorado */}
                    <div className="report-header flex justify-between items-start mb-16 border-b-2 border-pink-200 pb-10">
                        <div className="flex-1">
                            <h1 className="text-5xl font-bold text-pink-700 mb-4">{title}</h1>
                            <h2 className="text-3xl text-gray-600 mb-6">{subtitle}</h2>
                            <div className="space-y-3 text-base text-gray-600">
                                <p>
                                    <span className="font-semibold">Período:</span> {formatDateString(startDate)} -{" "}
                                    {formatDateString(endDate)}
                                </p>
                                <p>
                                    <span className="font-semibold">Fecha de generación:</span>{" "}
                                    {format(new Date(), "dd/MM/yyyy 'a las' HH:mm")}
                                </p>
                                <p>
                                    <span className="font-semibold">Solicitado por:</span> {userInfo.firstName} {userInfo.lastName}
                                </p>
                                <p>
                                    <span className="font-semibold">Email:</span> {userInfo.email}
                                </p>
                                {userInfo.role && (
                                    <p>
                                        <span className="font-semibold">Rol:</span> {userInfo.role.role}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="text-right ml-8">
                            <p className="text-2xl font-bold text-gray-800">{companyName}</p>
                        </div>
                    </div>

                    {/* Resumen ejecutivo */}
                    {isEnabled("summary") && (
                        <section className="report-section mb-16">
                            <h3 className="text-3xl font-bold mb-10 text-pink-700">RESUMEN EJECUTIVO</h3>
                            <div className="grid grid-cols-3 gap-10 mb-12">
                                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-10 rounded-2xl text-center border-2 border-pink-200 shadow-lg">
                                    <p className="text-base text-gray-600 mb-4 font-semibold">Citas Completadas</p>
                                    <p className="text-5xl font-bold text-pink-700">{appointmentTotal.totals.total_completado || 0}</p>
                                </div>
                                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-10 rounded-2xl text-center border-2 border-pink-200 shadow-lg">
                                    <p className="text-base text-gray-600 mb-4 font-semibold">Citas Pendientes</p>
                                    <p className="text-5xl font-bold text-pink-700">
                                        {appointmentTotal.totals.total_pendiente_seniado_activo || 0}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-10 rounded-2xl text-center border-2 border-pink-200 shadow-lg">
                                    <p className="text-base text-gray-600 mb-4 font-semibold">Citas No Completadas</p>
                                    <p className="text-5xl font-bold text-pink-700">
                                        {appointmentTotal.totals.total_moroso_inactivo_cancelado || 0}
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Evolución de citas */}
                    {isEnabled("evolution") && (
                        <section className="report-section mb-16">
                            <h3 className="text-3xl font-bold mb-10 text-pink-700">EVOLUCIÓN DE CITAS POR FECHA</h3>
                            <div className="chart-container">
                                <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[300px] flex items-center justify-center mb-6">
                                    {chartImages['[data-chart="total-dates"]'] ? (
                                        <img
                                            src={chartImages['[data-chart="total-dates"]'] || "/placeholder.svg"}
                                            alt="Gráfico de evolución de citas"
                                            className="chart-image w-full h-auto max-h-[280px] object-contain"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <p className="text-2xl font-semibold">Capturando gráfico de evolución...</p>
                                            <p className="text-base mt-4">Asegúrate de que el gráfico esté visible en la página principal</p>
                                        </div>
                                    )}
                                </div>

                                {/* Tabla detallada */}
                                <div className="overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg">
                                    <table className="min-w-full bg-white">
                                        <thead className="bg-gradient-to-r from-pink-100 to-pink-200">
                                            <tr>
                                                <th className="px-8 py-4 text-left text-base font-bold text-gray-700">Fecha</th>
                                                <th className="px-8 py-4 text-center text-base font-bold text-gray-700">Completadas</th>
                                                <th className="px-8 py-4 text-center text-base font-bold text-gray-700">Pendientes</th>
                                                <th className="px-8 py-4 text-center text-base font-bold text-gray-700">No Completadas</th>
                                                <th className="px-8 py-4 text-center text-base font-bold text-gray-700">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointmentTotal.result && appointmentTotal.result.length > 0 ? (
                                                appointmentTotal.result.map((item: any, index: number) => (
                                                    <tr
                                                        key={index}
                                                        className={`border-b-2 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-pink-50 transition-colors`}
                                                    >
                                                        <td className="px-8 py-4 font-medium">{format(new Date(item.fecha), "dd/MM/yyyy")}</td>
                                                        <td className="px-8 py-4 text-center">{item.total_completado}</td>
                                                        <td className="px-8 py-4 text-center">{item.total_pendiente_seniado_activo}</td>
                                                        <td className="px-8 py-4 text-center">{item.total_moroso_inactivo_cancelado}</td>
                                                        <td className="px-8 py-4 text-center font-bold text-pink-700">
                                                            {item.total_completado +
                                                                item.total_pendiente_seniado_activo +
                                                                item.total_moroso_inactivo_cancelado}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="text-center px-8 py-8 text-gray-500">
                                                        No hay datos disponibles
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Métodos de pago */}
                    {isEnabled("payMethods") && payMethodRows.length > 0 && (
                        <section className="report-section mb-16">
                            <h3 className="text-3xl font-bold mb-10 text-pink-700">MÉTODOS DE PAGO</h3>
                            <div className="chart-container">
                                <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[300px] flex items-center justify-center mb-6">
                                    {chartImages['[data-chart="pay-method"]'] ? (
                                        <img
                                            src={chartImages['[data-chart="pay-method"]'] || "/placeholder.svg"}
                                            alt="Gráfico de métodos de pago"
                                            className="chart-image w-full h-auto max-h-[280px] object-contain"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <p className="text-2xl font-semibold">Capturando gráfico de métodos de pago...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg">
                                    <table className="min-w-full bg-white">
                                        <thead className="bg-gradient-to-r from-pink-100 to-pink-200">
                                            <tr>
                                                <th className="px-8 py-4 text-left text-base font-bold text-gray-700">Método de Pago</th>
                                                <th className="px-8 py-4 text-center text-base font-bold text-gray-700">Cantidad</th>
                                                <th className="px-8 py-4 text-center text-base font-bold text-gray-700">Porcentaje</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payMethodRows.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className={`border-b-2 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-pink-50 transition-colors`}
                                                >
                                                    <td className="px-8 py-4 font-medium">{item.payMethod}</td>
                                                    <td className="px-8 py-4 text-center">{String(item.count)}</td>
                                                    <td className="px-8 py-4 text-center font-semibold text-pink-700">
                                                        {totalPagos > 0 ? ((Number(item.count) / totalPagos) * 100).toFixed(1) : "0.0"}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Distribución por días */}
                    {isEnabled("weekDays") && perDay && perDay.length > 0 && (
                        <section className="report-section mb-16">
                            <h3 className="text-3xl font-bold mb-10 text-pink-700">DISTRIBUCIÓN POR DÍAS DE LA SEMANA</h3>
                            <div className="chart-container">
                                <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[300px] flex items-center justify-center mb-6">
                                    {chartImages['[data-chart="week-day"]'] ? (
                                        <img
                                            src={chartImages['[data-chart="week-day"]'] || "/placeholder.svg"}
                                            alt="Gráfico de días de la semana"
                                            className="chart-image w-full h-auto max-h-[280px] object-contain"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <p className="text-2xl font-semibold">Capturando gráfico de días...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg">
                                    <table className="min-w-full bg-white">
                                        <thead className="bg-gradient-to-r from-pink-100 to-pink-200">
                                            <tr>
                                                <th className="px-8 py-4 text-left text-base font-bold text-gray-700">Día</th>
                                                <th className="px-8 py-4 text-center text-base font-bold text-gray-700">Cantidad</th>
                                                <th className="px-8 py-4 text-center text-base font-bold text-gray-700">Porcentaje</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const totalCitas = perDay.reduce(
                                                    (acc: number, curr: { count: number }) => acc + (curr.count || 0),
                                                    0,
                                                )
                                                return perDay.map((item: { day: string; count: number }, index: number) => (
                                                    <tr
                                                        key={index}
                                                        className={`border-b-2 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-pink-50 transition-colors`}
                                                    >
                                                        <td className="px-8 py-4 font-medium">{dayTranslations[item.day] || item.day}</td>
                                                        <td className="px-8 py-4 text-center">{String(item.count)}</td>
                                                        <td className="px-8 py-4 text-center font-semibold text-pink-700">
                                                            {totalCitas > 0 ? ((Number(item.count) / totalCitas) * 100).toFixed(1) : "0.0"}%
                                                        </td>
                                                    </tr>
                                                ))
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Distribución por categoría */}
                    {isEnabled("categories") && perCategoryRows.length > 0 && (
                        <section className="report-section mb-16">
                            <h3 className="text-3xl font-bold mb-10 text-pink-700">DISTRIBUCIÓN POR CATEGORÍA</h3>
                            <div className="chart-container">
                                <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[300px] flex items-center justify-center mb-6">
                                    {chartImages['[data-chart="per-category"]'] ? (
                                        <img
                                            src={chartImages['[data-chart="per-category"]'] || "/placeholder.svg"}
                                            alt="Gráfico de distribución por categoría"
                                            className="chart-image w-full h-auto max-h-[280px] object-contain"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <p className="text-2xl font-semibold">Capturando gráfico de categorías...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg">
                                    <table className="min-w-full bg-white">
                                        <thead className="bg-gradient-to-r from-pink-100 to-pink-200">
                                            <tr>
                                                <th className="px-8 py-4 text-left text-base font-bold text-gray-700">Categoría</th>
                                                <th className="px-8 py-4 text-center text-base font-bold text-gray-700">Citas</th>
                                                <th className="px-8 py-4 text-center text-base font-bold text-gray-700">Porcentaje</th>
                                                <th className="px-8 py-4 text-center text-base font-bold text-gray-700">Ingresos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {perCategoryRows.map(
                                                (item: { category: string; count: number; totalIngresos: number }, index: number) => (
                                                    <tr
                                                        key={index}
                                                        className={`border-b-2 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-pink-50 transition-colors`}
                                                    >
                                                        <td className="px-8 py-4 font-medium">{item.category}</td>
                                                        <td className="px-8 py-4 text-center">{String(item.count)}</td>
                                                        <td className="px-8 py-4 text-center font-semibold text-pink-700">
                                                            {totalCitas > 0 ? ((Number(item.count) / totalCitas) * 100).toFixed(1) : "0.0"}%
                                                        </td>
                                                        <td className="px-8 py-4 text-center font-semibold text-green-600">
                                                            ${item.totalIngresos ? item.totalIngresos.toLocaleString() : "0.00"}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Distribución por profesional */}
                    {isEnabled("professionals") && perProfessionalRows.length > 0 && (
                        <section className="report-section mb-16">
                            <h3 className="text-3xl font-bold mb-10 text-pink-700">DISTRIBUCIÓN POR PROFESIONAL</h3>
                            <div className="chart-container">
                                <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[300px] flex items-center justify-center mb-6">
                                    {chartImages['[data-chart="per-professional"]'] ? (
                                        <img
                                            src={chartImages['[data-chart="per-professional"]'] || "/placeholder.svg"}
                                            alt="Gráfico de distribución por profesional"
                                            className="chart-image w-full h-auto max-h-[280px] object-contain"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <p className="text-2xl font-semibold">Capturando gráfico de profesionales...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg">
                                    <table className="min-w-full bg-white">
                                        <thead className="bg-gradient-to-r from-pink-100 to-pink-200">
                                            <tr>
                                                <th className="px-8 py-4 text-left text-base font-bold text-gray-700">Profesional</th>
                                                <th className="px-8 py-4 text-center text-base font-bold text-gray-700">Citas</th>
                                                <th className="px-8 py-4 text-center text-base font-bold text-gray-700">Porcentaje</th>
                                                <th className="px-8 py-4 text-center text-base font-bold text-gray-700">Ingresos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {perProfessionalRows.map(
                                                (item: { profesional: string; total_citas: number; totalIngresos: number }, index: number) => (
                                                    <tr
                                                        key={index}
                                                        className={`border-b-2 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-pink-50 transition-colors`}
                                                    >
                                                        <td className="px-8 py-4 font-medium">{item.profesional}</td>
                                                        <td className="px-8 py-4 text-center">{String(item.total_citas)}</td>
                                                        <td className="px-8 py-4 text-center font-semibold text-pink-700">
                                                            {totalCitasProfesional > 0
                                                                ? ((Number(item.total_citas) / totalCitasProfesional) * 100).toFixed(1)
                                                                : "0.0"}
                                                            %
                                                        </td>
                                                        <td className="px-8 py-4 text-center font-semibold text-green-600">
                                                            ${item.totalIngresos ? item.totalIngresos.toLocaleString() : "0.00"}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Pie de página mejorado */}
                    <footer className="mt-24 pt-10 border-t-2 border-pink-200 text-center text-base text-gray-500">
                        <div className="space-y-3">
                            <p className="font-medium">
                                Este informe fue generado automáticamente el {format(new Date(), "dd/MM/yyyy 'a las' HH:mm")} por{" "}
                                {userInfo.firstName} {userInfo.lastName}
                            </p>
                            <p>
                                Período analizado: {formatDateString(startDate)} - {formatDateString(endDate)}
                            </p>
                            <p className="font-bold text-gray-700 text-lg">
                                © {new Date().getFullYear()} {companyName} - Todos los derechos reservados
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    )
}

export default StatisticsReportAdvanced
