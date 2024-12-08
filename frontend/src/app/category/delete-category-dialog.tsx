'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import useCategoryStore from '../store/useCategoryStore'
import { Trash2, UserX } from 'lucide-react'

export function DeleteCategoryDialog({ categoryId }) {
  const [isOpen, setIsOpen] = useState(false)
  const deleteCategory = useCategoryStore(state => state.deleteCategory)

  const handleDelete = async () => {
    await deleteCategory(categoryId)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive"><Trash2 /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Está seguro de que desea eliminar esta categoria?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Eliminará permanentemente la categoria.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
