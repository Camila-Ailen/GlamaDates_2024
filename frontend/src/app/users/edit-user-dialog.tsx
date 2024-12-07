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
import useUserStore from '../store/useUserStore'
import { UserPen } from 'lucide-react'

export function EditUserDialog({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const updateUser = useUserStore(state => state.updateUser)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const userData = Object.fromEntries(formData)
    await updateUser({ ...userData, id: user.id })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mr-2"><UserPen/></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                Nombre
              </Label>
              <Input id="firstName" name="firstName" defaultValue={user.firstName} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Apellido
              </Label>
              <Input id="lastName" name="lastName" defaultValue={user.lastName} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Correo
              </Label>
              <Input id="email" name="email" type="email" defaultValue={user.email} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Contraseña
              </Label>
              <Input id="password" name="password" type="password" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rol
              </Label>
              <Input id="role" name="role" defaultValue={user.role.id} className="col-span-3" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Actualizar Usuario</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
