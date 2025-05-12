"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Clock } from "lucide-react"

interface TimePickerInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function TimePickerInput({ value, onChange, disabled = false }: TimePickerInputProps) {
  const [open, setOpen] = useState(false)
  const [hours, setHours] = useState<number>(0)
  const [minutes, setMinutes] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Actualizar horas y minutos cuando cambia el valor
  useEffect(() => {
    if (value) {
      const [hoursStr, minutesStr] = value.split(":")
      setHours(Number.parseInt(hoursStr, 10))
      setMinutes(Number.parseInt(minutesStr, 10))
    }
  }, [value])

  // Formatear la hora para mostrarla en el input
  const formatTime = (hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Actualizar horas y minutos si el formato es válido
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/
    if (timeRegex.test(newValue)) {
      const [hoursStr, minutesStr] = newValue.split(":")
      setHours(Number.parseInt(hoursStr, 10))
      setMinutes(Number.parseInt(minutesStr, 10))
    }
  }

  // Actualizar el valor cuando cambian las horas o minutos
  const updateValue = (newHours: number, newMinutes: number) => {
    setHours(newHours)
    setMinutes(newMinutes)
    onChange(formatTime(newHours, newMinutes))
  }

  // Incrementar/decrementar horas
  const adjustHours = (increment: number) => {
    let newHours = hours + increment
    if (newHours < 0) newHours = 23
    if (newHours > 23) newHours = 0
    updateValue(newHours, minutes)
  }

  // Incrementar/decrementar minutos
  const adjustMinutes = (increment: number) => {
    let newMinutes = minutes + increment
    const newHours = hours

    if (newMinutes < 0) {
      newMinutes = 55
      adjustHours(-1)
    }

    if (newMinutes > 55) {
      newMinutes = 0
      adjustHours(1)
    }

    updateValue(newHours, newMinutes)
  }

  // Opciones rápidas de horas
  const hourOptions = [7, 8, 9, 10, 12, 14, 16, 18, 20, 22]

  // Opciones rápidas de minutos
  const minuteOptions = [0, 15, 30, 45]

  return (
    <div className="relative">
      <div className="flex">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="HH:MM"
          className="pr-10"
          disabled={disabled}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="absolute right-0 top-0 h-full" disabled={disabled}>
              <Clock className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-sm font-medium mb-1">Horas</div>
                  <div className="flex flex-col items-center">
                    <Button variant="ghost" size="icon" onClick={() => adjustHours(1)}>
                      <span className="text-lg">▲</span>
                    </Button>
                    <div className="text-2xl font-bold my-1">{hours.toString().padStart(2, "0")}</div>
                    <Button variant="ghost" size="icon" onClick={() => adjustHours(-1)}>
                      <span className="text-lg">▼</span>
                    </Button>
                  </div>
                </div>
                <div className="text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="text-sm font-medium mb-1">Minutos</div>
                  <div className="flex flex-col items-center">
                    <Button variant="ghost" size="icon" onClick={() => adjustMinutes(5)}>
                      <span className="text-lg">▲</span>
                    </Button>
                    <div className="text-2xl font-bold my-1">{minutes.toString().padStart(2, "0")}</div>
                    <Button variant="ghost" size="icon" onClick={() => adjustMinutes(-5)}>
                      <span className="text-lg">▼</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Horas comunes</div>
                <div className="grid grid-cols-5 gap-1">
                  {hourOptions.map((hour) => (
                    <Button
                      key={hour}
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => updateValue(hour, minutes)}
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Minutos</div>
                <div className="grid grid-cols-4 gap-1">
                  {minuteOptions.map((minute) => (
                    <Button
                      key={minute}
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => updateValue(hours, minute)}
                    >
                      {minute.toString().padStart(2, "0")}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateValue(0, 0)
                    setOpen(false)
                  }}
                >
                  Limpiar
                </Button>
                <Button size="sm" onClick={() => setOpen(false)}>
                  Aceptar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
