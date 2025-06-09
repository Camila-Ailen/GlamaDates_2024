"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface ChartWrapperProps {
  children: React.ReactNode
  chartId: string
  className?: string
}

export const ChartWrapper = ({ children, chartId, className = "" }: ChartWrapperProps) => {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setAttribute("data-chart", chartId)
    }
    console.log(`ChartWrapper initialized for chartId: ${chartId}`)
  }, [chartId])

  return (
    <div ref={chartRef} className={className} data-chart={chartId}>
      {children}
    </div>
  )
}
