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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import usePackageStore from '../store/usePackageStore'
import { UserPen } from 'lucide-react'

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

export function CalendarAppointmentDialog({ availableAppointments }: { availableAppointments: Appointment[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const updatePackage = usePackageStore(state => state.updatePackage)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const packageData = Object.fromEntries(formData)
    await updatePackage({ ...packageData, id: availableAppointments. })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mr-2"><UserPen/></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Servicio</DialogTitle>
        </DialogHeader>

        </DialogContent>
    </Dialog>
  )
}