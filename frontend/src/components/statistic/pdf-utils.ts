// Utilidades para la generación de PDF
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useEffect } from "react"

// Función para formatear fechas en español
export const formatDateString = (dateStr: string) => {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
}

useEffect(() => {
  console.log("PDF utilities loaded")
}
, [])

// Función para generar un PDF con paginación adecuada
export const generatePDF = async (
  element: HTMLElement,
  title: string,
  startDate: string,
  endDate: string,
  companyName: string,
  userInfo: { name: string; lastName: string; email: string },
) => {
  try {
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
    const margin = 15
    const contentWidth = pageWidth - margin * 2

    // Obtener las secciones del informe
    const sections = element.querySelectorAll("section")
    const header = element.querySelector(".report-header") as HTMLElement

    // Calcular el número total de páginas (estimación)
    // Este es un cálculo aproximado basado en el contenido
    const totalPages = Math.max(Math.ceil(sections.length / 1.5), 1)

    // Posición vertical actual
    let yPosition = margin
    let pageCount = 1

    // Función para añadir encabezado de página
    const addPageHeader = (isFirstPage = false) => {
      if (isFirstPage && header) {
        // En la primera página, usamos el encabezado completo
        return html2canvas(header, {
          scale: 2,
          useCORS: true,
          logging: false,
        }).then((headerCanvas) => {
          const headerImgData = headerCanvas.toDataURL("image/png")
          const headerHeight = (headerCanvas.height * contentWidth) / headerCanvas.width

          pdf.addImage(headerImgData, "PNG", margin, yPosition, contentWidth, headerHeight)
          return headerHeight + 5 // Retornamos la altura + espacio
        })
      } else {
        // En las páginas siguientes, usamos un encabezado simplificado
        pdf.setFontSize(12)
        pdf.setTextColor(0, 0, 0)
        pdf.setFont("helvetica", "bold")
        pdf.text(title, margin, margin + 5)
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        pdf.text(`Período: ${formatDateString(startDate)} - ${formatDateString(endDate)}`, margin, margin + 10)
        return 15 // Altura del encabezado simplificado
      }
    }

    // Función para añadir pie de página
    const addPageFooter = () => {
      pdf.setFontSize(9)
      pdf.setTextColor(100, 100, 100)
      //pdf.text(`Página ${pageCount} de ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      //  align: "center",
      //})

      // Información de copyright
      pdf.setFontSize(8)
      pdf.text(
        `© ${new Date().getFullYear()} ${companyName} - Todos los derechos reservados`,
        pageWidth / 2,
        pageHeight - 5,
        { align: "center" },
      )
    }

    // Iniciar primera página
    const headerHeight = await addPageHeader(true)
    yPosition += headerHeight

    // Añadir información del usuario que solicita el informe
    pdf.setFontSize(10)
    pdf.setTextColor(80, 80, 80)
    pdf.text(`Informe solicitado por: ${userInfo.name} ${userInfo.lastName}`, margin, yPosition)
    pdf.text(`Email: ${userInfo.email}`, margin, yPosition + 5)
    yPosition += 15 // Espacio después de la info del usuario

    // Procesar cada sección
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i] as HTMLElement

      // Verificar si es una tabla
      const isTable = section.querySelector("table") !== null

      // Renderizar la sección a un canvas
      const sectionCanvas = await html2canvas(section, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const sectionImgData = sectionCanvas.toDataURL("image/png")
      const sectionHeight = (sectionCanvas.height * contentWidth) / sectionCanvas.width

      // Verificar si la sección cabe en la página actual
      const remainingSpace = pageHeight - yPosition - margin

      // Si es una tabla y no cabe completa, o si cualquier sección no cabe
      if (
        (isTable && sectionHeight > remainingSpace * 0.8) ||
        (!isTable && yPosition + sectionHeight > pageHeight - margin - 15)
      ) {
        // Añadir pie de página
        addPageFooter()

        // Nueva página
        pdf.addPage()
        pageCount++
        yPosition = margin

        // Añadir encabezado en la nueva página
        const newHeaderHeight = await addPageHeader()
        yPosition += newHeaderHeight
      }

      // Añadir la sección a la página
      pdf.addImage(sectionImgData, "PNG", margin, yPosition, contentWidth, sectionHeight)
      yPosition += sectionHeight + 10 // Espacio después de la sección
    }

    // Añadir pie de página en la última página
    addPageFooter()

    return pdf
  } catch (error) {
    console.error("Error al generar PDF:", error)
    throw error
  }
}

// Función para dividir tablas grandes en chunks para mejor paginación
export const splitTableForPagination = (data: any[], itemsPerPage = 10) => {
  if (!data || data.length <= itemsPerPage) return [data]

  const chunks = []
  for (let i = 0; i < data.length; i += itemsPerPage) {
    chunks.push(data.slice(i, i + itemsPerPage))
  }
  return chunks
}

