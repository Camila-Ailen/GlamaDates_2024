"use client"

import { TotalDates } from "./total-dates"
import { WeekDay } from "./week-day"
import { PayMethod } from "./pay-method"
import { PerCategory } from "./per-category"
import { PerProfessional } from "./per-professional"
import { useRef, useEffect } from "react"

interface ChartsContainerProps {
  onCaptureReady?: (containerRef: HTMLDivElement) => void
}

export function ChartsContainer({ onCaptureReady }: ChartsContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Notificar cuando el contenedor está listo para captura
  useEffect(() => {
    if (containerRef.current && onCaptureReady) {
      // Dar tiempo para que los gráficos se rendericen completamente
      const timer = setTimeout(() => {
        onCaptureReady(containerRef.current!)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [containerRef, onCaptureReady])

  return (
    <div ref={containerRef} className="charts-container grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
      <TotalDates />
      <WeekDay />
      <PayMethod />
      <PerCategory />
      <PerProfessional />
    </div>
  )
}

