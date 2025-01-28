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
import { Package } from '../store/usePackageStore'



export function EditPackageDialog({ pkg }: { pkg: Package }) {
  const [isOpen, setIsOpen] = useState(false)
  const updatePackage = usePackageStore(state => state.updatePackage)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const packageData = Object.fromEntries(formData)
    await updatePackage({ ...packageData, id: pkg.id })
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
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input id="name" name="name" defaultValue={pkg.name} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripcion
              </Label>
              <Input id="description" name="description" defaultValue={pkg.description} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="services" className="text-right">
                Servicios
              </Label>
              <Input
                id="services"
                name="services"
                defaultValue={pkg.services.map(service => service.id).join(', ')}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Actualizar Servicio</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
