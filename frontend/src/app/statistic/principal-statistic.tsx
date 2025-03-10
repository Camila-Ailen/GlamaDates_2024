"use client"

import * as React from "react"
import { WeekDay } from "@/components/statistic/week-day"
import { PayMethod } from "@/components/statistic/pay-method"
import { PerCategory } from "@/components/statistic/per-category"
import { PerProfessional } from "@/components/statistic/per-professional"
import { TotalDates } from "@/components/statistic/total-dates"
import { Card } from "@/components/ui/card"
import { useEffect } from "react"
import useStatisticsStore from "../store/useStatisticsStore"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"

const PrincipalStatistic = () => {
  const {
    startDate,
    endDate,
    error,
    setError,
    fetchTotalDates,
    fetchPayMethod,
    fetchPerCategory,
    fetchPerProfessional,
    fetchPerDay,
    setStartDate,
    setEndDate,
  } = useStatisticsStore()

  // const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const date = e.target.value // Formato yyyy-MM-dd del input date
  //     setStartDate(date)
  //     if (endDate && new Date(date) > new Date(endDate)) {
  //         setError("La fecha de inicio debe ser anterior a la fecha de fin")
  //     } else {
  //         setError("")
  //         fetchTotalDates(date, endDate)
  //         fetchPayMethod(date, endDate)
  //         fetchPerDay(date, endDate)
  //         fetchPerCategory(date, endDate)
  //         fetchPerProfessional(date, endDate)
  //     }
  // }

  // const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const date = e.target.value // Formato yyyy-MM-dd del input date
  //     setEndDate(date)
  //     if (startDate && new Date(date) < new Date(startDate)) {
  //         setError("La fecha de fin debe ser posterior a la fecha de inicio")
  //     } else {
  //         setError("")
  //         fetchTotalDates(startDate, date)
  //         fetchPayMethod(startDate, date)
  //         fetchPerDay(startDate, date)
  //         fetchPerCategory(startDate, date)
  //         fetchPerProfessional(startDate, date)
  //     }
  // }

  useEffect(() => {
    fetchTotalDates(startDate, endDate)
    fetchPayMethod(startDate, endDate)
    fetchPerCategory(startDate, endDate)
    fetchPerProfessional(startDate, endDate)
    fetchPerDay(startDate, endDate)
  }, [startDate, endDate, fetchTotalDates, fetchPayMethod, fetchPerCategory, fetchPerProfessional, fetchPerDay])

  interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
    index: number
  }
  const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(({ className, index, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={`opacity-0 animate-fade-in ${className}`}
        style={{
          animationDelay: `${index * 85}ms`,
          animationFillMode: "forwards",
        }}
        {...props}
      />
    )
  })
  AnimatedCard.displayName = "AnimatedCard"

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  })

  const handleDateRangeSelect = (selectedDateRange: DateRange | undefined) => {
    setDate(selectedDateRange)

    if (selectedDateRange?.from) {
      const formattedStartDate = format(selectedDateRange.from, "yyyy-MM-dd")
      setStartDate(formattedStartDate)

      if (selectedDateRange.to) {
        const formattedEndDate = format(selectedDateRange.to, "yyyy-MM-dd")
        setEndDate(formattedEndDate)

        if (new Date(formattedStartDate) > new Date(formattedEndDate)) {
          setError("La fecha de inicio debe ser anterior a la fecha de fin")
        } else {
          setError("")
          
          fetchTotalDates(formattedStartDate, formattedEndDate)
          fetchPayMethod(formattedStartDate, formattedEndDate)
          fetchPerDay(formattedStartDate, formattedEndDate)
          fetchPerCategory(formattedStartDate, formattedEndDate)
          fetchPerProfessional(formattedStartDate, formattedEndDate)
        }
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-3xl font-bold text-center text-pink-700 mb-6">Estadisticas</h1>
      <h2 className="text-3xl font-bold text-center text-pink-700 mb-6">Estadisticas Generales</h2>
      <p className="text-center mb-4">Seleccione el rango de fechas a analizar:</p>
      <div className="flex flex-row justify-center items-center gap-4 mb-6">
        <div className="flex flex-col items-center">
          <label className="mb-2">Rango de fechas:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(date.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Seleccionar rango de fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      <AnimatedCard index={2} className="mt-4">
        <TotalDates />
      </AnimatedCard>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <AnimatedCard index={3} className="mt-4">
          <PayMethod />
        </AnimatedCard>

        <AnimatedCard index={4} className="mt-4">
          <WeekDay />
        </AnimatedCard>
      </div>

      <AnimatedCard index={5} className="mt-4">
        <PerCategory />
      </AnimatedCard>

      <AnimatedCard index={6} className="mt-4">
        <PerProfessional />
      </AnimatedCard>
    </div>
  )
}

export default PrincipalStatistic

