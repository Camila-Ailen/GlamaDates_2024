import { Injectable } from "@nestjs/common"
//import PDFDocument from 'pdfkit';
const PDFDocument = require("pdfkit")

@Injectable()
export class PdfService {
  async generatePaymentReceiptPdf(data: {
    clientName: string
    transactionId: string
    paymentDate: string
    paymentAmount: number
    paymentMethod: string
    serviceName: string
    appointmentDate: string
    appointmentTime: string
    serviceDuration: string
    professionalName: string
    receiptNumber?: string
    discountAmount?: number
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Crear un nuevo documento PDF
        const doc = new PDFDocument({
          size: "A4",
          margin: 40,
          info: {
            Title: "Comprobante de Pago - Salon de Belleza 'Laura'",
            Author: "GlamaDates",
            Subject: `Comprobante de pago para ${data.clientName}`,
            Keywords: "comprobante, pago, glamadates, salon de belleza",
          },
        })

        const buffers: Buffer[] = []

        // Capturar los datos del PDF en el buffer
        doc.on("data", buffers.push.bind(buffers))
        doc.on("end", () => {
          const pdfData = Buffer.concat(buffers)
          resolve(pdfData)
        })
        doc.on("error", reject)

        // Generar número de recibo si no se proporciona
        const receiptNumber =
          data.receiptNumber || `REC-${Date.now().toString().slice(-8)}-${data.transactionId.slice(-4)}`

        // Calcular el subtotal y total
        const subtotal = data.paymentAmount
        const discount = data.discountAmount || 0
        const total = subtotal - discount

        // Colores principales
        const primaryColor = "#d63384"
        const secondaryColor = "#f783ac"
        const lightPink = "#fce7f3"
        const darkGray = "#333333"
        const lightGray = "#6b7280"

        // ===== ENCABEZADO =====
        // Fondo del encabezado
        doc.rect(40, 40, 515, 100).fillColor(lightPink).fill()

        // Título principal
        doc
          .fontSize(24)
          .font("Helvetica-Bold")
          .fillColor(primaryColor)
          .text("COMPROBANTE DE PAGO", 40, 60, { align: "center" })

        // Subtítulo
        doc.fontSize(14).font("Helvetica").fillColor(darkGray).text("Salon de Belleza 'Laura'", 40, 90, { align: "center" })

        // Información de contacto
        doc
          .fontSize(10)
          .fillColor(lightGray)
          .text("Pueblo Illia, Dos de Mayo | Tel: (123) 456-7890", 40, 110, { align: "center" })

        // ===== NÚMERO DE RECIBO Y FECHA =====
        // Fondo para número de recibo
        doc.rect(40, 150, 515, 40).fillColor(primaryColor).fill()

        // Texto del número de recibo
        doc.fontSize(14).font("Helvetica-Bold").fillColor("white").text(`RECIBO N°: ${receiptNumber}`, 50, 162)

        // Fecha de emisión
        doc.fontSize(12).font("Helvetica").fillColor("white").text(`Fecha de emisión: ${data.paymentDate}`, 350, 164)

        // ===== INFORMACIÓN DEL CLIENTE =====
        // Fondo para información del cliente
        doc.rect(40, 200, 515, 70).fillColor("#f8f9fa").fillOpacity(0.8).fill().fillOpacity(1)

        // Borde izquierdo decorativo
        doc.rect(40, 200, 8, 70).fillColor(secondaryColor).fill()

        // Título de sección
        doc.fontSize(12).font("Helvetica-Bold").fillColor(primaryColor).text("INFORMACIÓN DEL CLIENTE", 60, 210)

        // Datos del cliente
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(darkGray)
          .text("Cliente:", 60, 230)
          .font("Helvetica")
          .text(data.clientName, 150, 230)

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(darkGray)
          .text("Transacción ID:", 60, 250)
          .font("Helvetica")
          .text(data.transactionId, 150, 250)

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(darkGray)
          .text("Método de pago:", 350, 230)
          .font("Helvetica")
          .text(data.paymentMethod, 440, 230)

        // ===== DETALLES DEL SERVICIO =====
        // Fondo para detalles del servicio
        doc.rect(40, 280, 515, 120).fillColor("#f8f9fa").fillOpacity(0.8).fill().fillOpacity(1)

        // Borde izquierdo decorativo
        doc.rect(40, 280, 8, 120).fillColor(secondaryColor).fill()

        // Título de sección
        doc.fontSize(12).font("Helvetica-Bold").fillColor(primaryColor).text("DETALLES DEL SERVICIO", 60, 290)

        // Datos del servicio
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(darkGray)
          .text("Servicio:", 60, 310)
          .font("Helvetica")
          .text(data.serviceName, 150, 310)

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(darkGray)
          .text("Fecha:", 60, 330)
          .font("Helvetica")
          .text(data.appointmentDate, 150, 330)

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(darkGray)
          .text("Hora:", 60, 350)
          .font("Helvetica")
          .text(data.appointmentTime, 150, 350)

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(darkGray)
          .text("Duración:", 60, 370)
          .font("Helvetica")
          .text(`${data.serviceDuration} minutos`, 150, 370)

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(darkGray)
          .text("Profesional:", 350, 310)
          .font("Helvetica")
          .text(data.professionalName, 420, 310)

        // ===== RESUMEN DE PAGO =====
        // Fondo para resumen de pago
        doc.rect(40, 410, 515, 100).fillColor("#f8f9fa").fillOpacity(0.8).fill().fillOpacity(1)

        // Borde izquierdo decorativo
        doc.rect(40, 410, 8, 100).fillColor(primaryColor).fill()

        // Título de sección
        doc.fontSize(12).font("Helvetica-Bold").fillColor(primaryColor).text("RESUMEN DE PAGO", 60, 420)

        // Tabla de resumen
        doc.fontSize(11).font("Helvetica-Bold").fillColor(darkGray).text("Descripción", 60, 440).text("Monto", 450, 440)

        // Línea divisoria
        doc.moveTo(60, 455).lineTo(520, 455).strokeColor(lightGray).lineWidth(0.5).stroke()

        // Subtotal
        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor(darkGray)
          .text("Subtotal", 60, 465)
          .text(`$${subtotal.toFixed(2)}`, 450, 465)

        // Descuento (si aplica)
        if (discount > 0) {
          doc
            .fontSize(11)
            .font("Helvetica")
            .fillColor(darkGray)
            .text("Descuento", 60, 485)
            .text(`-$${discount.toFixed(2)}`, 450, 485)
        }

        // Línea divisoria
        doc.moveTo(350, 505).lineTo(520, 505).strokeColor(lightGray).lineWidth(0.5).stroke()

        // Total
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .fillColor(primaryColor)
          .text("TOTAL", 350, 515)
          .text(`$${total.toFixed(2)}`, 450, 515)

        // ===== SELLO DE PAGADO =====
        // Dibujar un sello de "PAGADO"
        doc
          .rotate(-30, { origin: [300, 350] })
          .fontSize(60)
          .font("Helvetica-Bold")
          .fillColor(primaryColor)
          .fillOpacity(0.2)
          .text("PAGADO", 180, 350)
          .rotate(30, { origin: [300, 350] })
          .fillOpacity(1)

        
        // ===== PIE DE PÁGINA =====
        // Línea divisoria
        doc.moveTo(40, 620).lineTo(555, 620).strokeColor(secondaryColor).lineWidth(1).stroke()

        // Texto legal
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor(lightGray)
          .text(
            "Este documento es un comprobante oficial de pago. Conserve este recibo para cualquier consulta futura.",
            40,
            630,
            { align: "center" },
          )

        doc
          .fontSize(9)
          .text("Para verificar la autenticidad de este comprobante, contacte a GlamaDates.", 40, 645, {
            align: "center",
          })

        // Información de contacto
        doc
          .fontSize(9)
          .fillColor(primaryColor)
          .text("www.glamadates.com | info@glamadates.com | Tel: (123) 456-7890", 40, 670, { align: "center" })

        // Número de página
        doc.fontSize(8).fillColor(lightGray).text("Página 1 de 1", 500, 700)

        // Finalizar el documento
        doc.end()
      } catch (error) {
        console.error("Error generando PDF:", error)
        reject(error)
      }
    })
  }
}
