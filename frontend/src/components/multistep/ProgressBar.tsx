import type React from "react"

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="mb-4">
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-center mt-2">
        Paso {currentStep} de {totalSteps}
      </div>
    </div>
  )
}

export default ProgressBar

