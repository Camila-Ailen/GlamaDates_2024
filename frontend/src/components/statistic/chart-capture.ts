import html2canvas from "html2canvas"

export interface CapturedChart {
  id: string
  dataUrl: string
  title?: string
}

// Función para capturar todos los gráficos de Recharts en la página
export async function captureChartElements(): Promise<CapturedChart[]> {
  const capturedCharts: CapturedChart[] = []

  // Seleccionar todos los contenedores de gráficos
  const chartContainers = document.querySelectorAll(".recharts-wrapper")

  for (let i = 0; i < chartContainers.length; i++) {
    try {
      const container = chartContainers[i] as HTMLElement

      // Buscar el título del gráfico (si está disponible)
      let title = ""
      const cardHeader = container.closest(".card")?.querySelector(".card-title")
      if (cardHeader) {
        title = cardHeader.textContent || ""
      }

      // Capturar el gráfico como imagen
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null,
      })

      capturedCharts.push({
        id: `chart-${i}`,
        dataUrl: canvas.toDataURL("image/png"),
        title,
      })
    } catch (error) {
      console.error(`Error al capturar gráfico #${i}:`, error)
    }
  }

  return capturedCharts
}

// Función para capturar un gráfico específico por su ID
export async function captureChartById(id: string): Promise<string | null> {
  try {
    const element = document.getElementById(id)
    if (!element) return null

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: null,
    })

    return canvas.toDataURL("image/png")
  } catch (error) {
    console.error(`Error al capturar gráfico #${id}:`, error)
    return null
  }
}

// Función para capturar gráficos específicos por sus IDs
export async function captureSpecificCharts(chartIds: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {}

  for (const id of chartIds) {
    try {
      const element = document.getElementById(id)
      if (!element) continue

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null,
      })

      result[id] = canvas.toDataURL("image/png")
    } catch (error) {
      console.error(`Error al capturar gráfico #${id}:`, error)
    }
  }

  return result
}

