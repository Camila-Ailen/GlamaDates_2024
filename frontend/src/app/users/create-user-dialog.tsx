"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useUserStore from "../store/useUserStore";

export function CreateUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(false);
  const createUser = useUserStore((state) => state.createUser);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userData = Object.fromEntries(formData);
    try {
      await createUser(userData);
      setIsOpen(false);
    } catch (error) {
      setError(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Crear Usuario</Button>
      </DialogTrigger>
      <DialogContent className={error ? "border-red-500 border-4" : ""}>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                Nombre
              </Label>
              <Input id="firstName" name="firstName" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Apellido
              </Label>
              <Input id="lastName" name="lastName" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Correo
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rol
              </Label>
              <Input id="role" name="role" className="col-span-3" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Crear Usuario</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
