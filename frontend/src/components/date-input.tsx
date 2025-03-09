"use client"
import type React from "react"
import { useState, useEffect } from "react"

interface DateInputProps {
  label: string
  value: string // formato yyyy-MM-dd para el store
  onChange: (date: string) => void // recibe yyyy-MM-dd
  className?: string
}

export function DateInput({ label, value, onChange, className = "" }: DateInputProps) {
  // Estado para el valor mostrado en formato dd/MM/yyyy
  const [displayValue, setDisplayValue] = useState("")

  // Convertir de yyyy-MM-dd a dd/MM/yyyy para mostrar
  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split("-")
      setDisplayValue(`${day}/${month}/${year}`)
    } else {
      setDisplayValue("")
    }
  }, [value])

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setDisplayValue(inputValue)

    // Aplicar máscara automática
    let formattedValue = inputValue.replace(/\D/g, "") // Eliminar no-dígitos
    if (formattedValue.length > 0) {
      // Formatear como dd/MM/yyyy
      if (formattedValue.length <= 2) {
        formattedValue = formattedValue
      } else if (formattedValue.length <= 4) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2)}`
      } else {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 4)}/${formattedValue.slice(4, 8)}`
      }
      setDisplayValue(formattedValue)
    }

    // Convertir a formato yyyy-MM-dd para el store
    if (inputValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = inputValue.split("/")
      onChange(`${year}-${month}-${day}`)
    }
  }

  return (
    <div className="flex flex-col">
      <label className="mb-2">{label}</label>
      <input
        type="text"
        placeholder="dd/mm/yyyy"
        value={displayValue}
        onChange={handleInputChange}
        className={`p-2 border border-gray-300 rounded ${className}`}
      />
    </div>
  )
}

