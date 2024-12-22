'use client'

import { useEffect, useState } from 'react'
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
import { Select, SelectItem } from '@radix-ui/react-select'
import useServiceStore from '../store/useServiceStore'
import useCategoryStore from '../store/useCategoryStore'

export function CreateServiceDialog() {
  const {
    categories,
    pageSize,
    fetchCategories
  } = useCategoryStore()
  
  const [isOpen, setIsOpen] = useState(false)
  const createService = useServiceStore(state => state.createService)

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const serviceData = Object.fromEntries(formData)
    await createService(serviceData)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Crear Servicio</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Servicio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input id="name" name="name" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripcion
              </Label>
              <Input id="description" name="description" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duracion
              </Label>
              <Input id="duration" name="duration" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Precio
              </Label>
              <Input id="price" name="price" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
              <select name="category" id="category" className="col-span-3" required>
                <option value="">Seleccione una categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            </div>
          <div className="flex justify-end">
            <Button type="submit">Crear Servicio</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
