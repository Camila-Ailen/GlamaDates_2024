"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useUserStore from "../store/useUserStore";
import { Trash2, UserX } from "lucide-react";

export function DeleteUserDialog(
  { userId }: { userId: number },
  token: string | undefined,
) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteUser = useUserStore((state) => state.deleteUser);

  const handleDelete = async () => {
    await deleteUser(userId, token);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            ¿Está seguro de que desea eliminar este usuario?
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Eliminará permanentemente la
            cuenta del usuario.
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
  );
}
