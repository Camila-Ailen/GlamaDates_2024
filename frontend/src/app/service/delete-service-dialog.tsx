"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import useServiceStore from "../store/useServiceStore"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import useAuthStore from "../store/useAuthStore"

export function DeleteServiceDialog({ serviceId }: { serviceId: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteService = useServiceStore((state) => state.deleteService)
  const token = useAuthStore((state) => state.token)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteService(serviceId)
      setIsOpen(false)
    } catch (error) {
      console.error("Error deleting service:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 border-red-200 text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <AlertTriangle className="h-6 w-6 text-red-500 mx-auto" />
          <DialogTitle className="text-xl font-semibold text-center">Eliminar Servicio</DialogTitle>
          <DialogDescription className="text-center">
            Esta acción no se puede deshacer. Eliminará permanentemente este servicio y todas sus asociaciones.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
          <p className="text-sm text-red-700">Al eliminar este servicio, también se eliminarán:</p>
          <ul className="list-disc list-inside text-sm text-red-700 mt-2">
            <li>Todas las citas programadas para este servicio</li>
            <li>Todas las referencias a este servicio en paquetes</li>
            <li>Estadísticas y datos históricos relacionados</li>
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-gray-200">
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Servicio
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

