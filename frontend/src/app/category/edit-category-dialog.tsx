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
import useCategoryStore from '../store/useCategoryStore'
import { UserPen } from 'lucide-react'

export function EditCategoryDialog({ category }) {
  const [isOpen, setIsOpen] = useState(false)
  const updateCategory = useCategoryStore(state => state.updateCategory)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const categoryData = Object.fromEntries(formData)
    await updateCategory({ ...categoryData, id: category.id })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mr-2"><UserPen/></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input id="name" name="name" defaultValue={category.name} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripcion
              </Label>
              <Input id="description" name="description" defaultValue={category.description} className="col-span-3" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Actualizar Categoria</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
