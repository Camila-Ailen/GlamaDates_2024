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
import useRoleStore from "../store/useRoleStore"

interface DeleteRoleDialogProps {
  roleId: number
  roleName: string
}

export function DeleteRoleDialog({ roleId, roleName }: DeleteRoleDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const deleteRole = useRoleStore((state) => state.deleteRole)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const success = await deleteRole(roleId)
      if (success) {
        setOpen(false)
      }
    } catch (error) {
      toast.error("Error al eliminar el rol")
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
          <DialogTitle className="text-red-700">Eliminar Rol</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el rol "{roleName}"? Esta acción no se puede deshacer y puede afectar a
            los usuarios que tengan este rol asignado.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-700">
            <strong>Advertencia:</strong> Al eliminar este rol, todos los usuarios que lo tengan asignado perderán sus
            permisos asociados. Serán reasignados al rol por defecto del sistema, Cliente.
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
                Eliminar Rol
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
