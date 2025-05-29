"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, Trash2 } from "lucide-react"
import useWorkstationStore from "../store/useWorkstationStore"

interface DeleteWorkstationDialogProps {
  workstationId: number
  workstationName: string
}

export function DeleteWorkstationDialog({ workstationId, workstationName }: DeleteWorkstationDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const deleteWorkstation = useWorkstationStore((state) => state.deleteWorkstation)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const success = await deleteWorkstation(workstationId)
      if (success) {
        setOpen(false)
      }
    } catch (error) {
      toast.error("Error al eliminar la estación de trabajo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 border-red-200 text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-700">Eliminar Estación de Trabajo</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar la estación de trabajo "{workstationName}"? Esta acción no se puede
            deshacer y puede afectar las reservas existentes.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-700">
            <strong>Advertencia:</strong> Al eliminar esta estación de trabajo, todas las reservas futuras asociadas
            podrían verse afectadas.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Estación
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
