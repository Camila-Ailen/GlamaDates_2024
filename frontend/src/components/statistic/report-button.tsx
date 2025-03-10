"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import StatisticsReport from "./statistics-report"

interface ReportButtonProps {
  companyName?: string
  companyLogo?: string
}

const ReportButton = ({ companyName, companyLogo }: ReportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Generar Informe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Informe de Estadísticas</DialogTitle>
          <DialogDescription>Visualiza y exporta el informe completo de estadísticas en formato PDF.</DialogDescription>
        </DialogHeader>
        <StatisticsReport companyName={companyName} companyLogo={companyLogo} />
      </DialogContent>
    </Dialog>
  )
}

export default ReportButton

