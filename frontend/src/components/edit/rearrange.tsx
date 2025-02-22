import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import { useEditStore } from "@/app/store/useEditStore"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import "@/components/multistep/calendar-appointment-dialog.css"
import type { Package } from "@/app/store/usePackageStore"
import { toast } from "sonner"
import Unapproved from "./unapproved"
import Approved from "./approved"

const RearrangeForm: React.FC = () => {
  const { isOpen, closeDialog, isAvailable } = useEditStore()

  const handleCancel = async () => {
    closeDialog()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (closeDialog())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="custom-dialog-title">
            Adelantamiento de turno
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
            {isAvailable ? <Approved /> : <Unapproved />}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleCancel}
                className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Volver al Catalogo
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RearrangeForm