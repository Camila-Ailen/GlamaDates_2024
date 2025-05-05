"use client"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  selected?: Date
  onSelect: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePicker({ selected, onSelect, placeholder = "Seleccionar fecha" }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !selected && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? (
            <div className="flex items-center justify-between w-full">
              <span>{format(selected, "PPP", { locale: es })}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(undefined)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selected} onSelect={onSelect} initialFocus locale={es} />
      </PopoverContent>
    </Popover>
  )
}
