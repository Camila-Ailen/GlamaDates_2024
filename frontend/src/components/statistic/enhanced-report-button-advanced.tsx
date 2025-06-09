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
import StatisticsReportAdvanced from "./statistics-report-advanced"

interface EnhancedReportButtonAdvancedProps {
  companyName?: string
  companyLogo?: string
}

const EnhancedReportButtonAdvanced = ({
  companyName = "GlamaDates",
  companyLogo = "/logo.webp",
}: EnhancedReportButtonAdvancedProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Generar Informe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[98vw] max-h-[98vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Informe de Estadísticas</DialogTitle>
          <DialogDescription>
            Configuración personalizable, selección de secciones y opciones de exportación.
          </DialogDescription>
        </DialogHeader>
        <StatisticsReportAdvanced companyName={companyName} companyLogo={companyLogo} />
      </DialogContent>
    </Dialog>
  )
}

export default EnhancedReportButtonAdvanced
