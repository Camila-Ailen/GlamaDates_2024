'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserPen } from 'lucide-react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

export interface Appointment {
    id: number;
    datetimeStart: Date;
    datetimeEnd: Date;
    state: string;
    client: string;
    package: string;
    details: [
        {
            id: number,
            priceNow: number,
            durationNow: number,
            appointment: string,
            employee: string,
            workstation: string,
            service: string
        }
    ]
}

export function CalendarAppointmentDialog({ availableAppointments, onClose, packageName }: { availableAppointments: Appointment[], onClose: () => void, packageName: string }) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const tileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const appointmentDates = availableAppointments.map(app => new Date(app.datetimeStart).toDateString())
      if (appointmentDates.includes(date.toDateString())) {
        return 'highlight'
      }
    }
    return null
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mr-2"><UserPen/></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{packageName}</DialogTitle>
        </DialogHeader>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={tileClassName}
        />
      </DialogContent>
    </Dialog>
  )
}