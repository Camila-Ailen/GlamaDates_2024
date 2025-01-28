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
import useServiceStore from '../store/useServiceStore'
import { UserPen } from 'lucide-react'

interface Service {
    id: number;
    name: string;
    description: string;
    duration: number;
    price: number;
    category: {
        id: number;
        name: string;
        description: string;
    };
}

export function EditServiceDialog({ service }: { service: Service }) {
  const [isOpen, setIsOpen] = useState(false)
  const updateService = useServiceStore(state => state.updateService)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const serviceData = Object.fromEntries(formData)
    await updateService({ ...serviceData, id: service.id })
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
              <Input id="name" name="name" defaultValue={service.name} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripcion
              </Label>
              <Input id="description" name="description" defaultValue={service.description} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duracion
              </Label>
              <Input id="duration" name="duration" defaultValue={service.duration} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Precio
              </Label>
              <Input id="price" name="price" defaultValue={service.price} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
              <Input
                id="category"
                name="category"
                defaultValue={service.category.id}
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
