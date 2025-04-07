"use client"

import type React from "react"
import { CheckCircle } from "lucide-react"

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100

  const steps = [
    { number: 1, label: "Fecha" },
    { number: 2, label: "Hora" },
    { number: 3, label: "Confirmación" },
    { number: 4, label: "Pago" },
  ]

  return (
    <div className="mb-6">
      <div className="relative">
        {/* Barra de progreso */}
        <div className="h-1 w-full bg-gray-200 absolute top-4 z-0"></div>
        <div
          className="h-1 bg-gradient-to-r from-pink-400 to-pink-600 absolute top-4 z-10 transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>

        {/* Pasos */}
        <div className="flex justify-between relative z-20">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center 
                ${
                  currentStep >= step.number
                    ? "bg-gradient-to-r from-pink-400 to-pink-600 text-white"
                    : "bg-white border-2 border-gray-300 text-gray-400"
                }
                transition-all duration-300
              `}
              >
                {currentStep > step.number ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.number}</span>
                )}
              </div>
              <span
                className={`
                text-xs mt-1 font-medium
                ${currentStep >= step.number ? "text-pink-600" : "text-gray-500"}
              `}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProgressBar

