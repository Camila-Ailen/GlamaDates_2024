"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { CreditCard, Edit, X, CheckCircle, AlertCircle, User, History } from "lucide-react"
import { useAuditStore, type Audit } from "@/app/store/useAuditStore"
import { cn } from "@/lib/utils"

interface AppointmentHistoryDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  appointmentId: number
  appointmentData?: any
}

export function AppointmentHistoryDialog({
  isOpen,
  setIsOpen,
  appointmentId,
  appointmentData,
}: AppointmentHistoryDialogProps) {
  const [appointmentAudits, setAppointmentAudits] = useState<Audit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { fetchAppointmentAudits } = useAuditStore()

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchAppointmentHistory()
    }
  }, [isOpen, appointmentId])

  const fetchAppointmentHistory = async () => {
    setIsLoading(true)
    try {
      // Usar la nueva función del store
      const audits = await fetchAppointmentAudits(appointmentId)
      setAppointmentAudits(audits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    } catch (error) {
      console.error("Error fetching appointment history:", error)
      setAppointmentAudits([])
    } finally {
      setIsLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    const actionUpper = action.toUpperCase()
    if (actionUpper.includes("CREAR") || actionUpper.includes("CREATE")) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    if (actionUpper.includes("ACTUALIZAR") || actionUpper.includes("UPDATE") || actionUpper.includes("EDITAR")) {
      return <Edit className="h-4 w-4 text-blue-600" />
    }
    if (actionUpper.includes("BORRAR") || actionUpper.includes("DELETE") || actionUpper.includes("CANCELAR")) {
      return <X className="h-4 w-4 text-red-600" />
    }
    if (actionUpper.includes("PAGO") || actionUpper.includes("PAYMENT")) {
      return <CreditCard className="h-4 w-4 text-green-600" />
    }
    if (actionUpper.includes("COMPLETAR") || actionUpper.includes("COMPLETE")) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    return <History className="h-4 w-4 text-gray-600" />
  }

  const getActionColor = (action: string) => {
    const actionUpper = action.toUpperCase()
    if (actionUpper.includes("CREAR") || actionUpper.includes("CREATE")) {
      return "bg-green-50 border-l-green-500"
    }
    if (actionUpper.includes("ACTUALIZAR") || actionUpper.includes("UPDATE") || actionUpper.includes("EDITAR")) {
      return "bg-blue-50 border-l-blue-500"
    }
    if (actionUpper.includes("BORRAR") || actionUpper.includes("DELETE") || actionUpper.includes("CANCELAR")) {
      return "bg-red-50 border-l-red-500"
    }
    if (actionUpper.includes("PAGO") || actionUpper.includes("PAYMENT")) {
      return "bg-green-50 border-l-green-500"
    }
    if (actionUpper.includes("COMPLETAR") || actionUpper.includes("COMPLETE")) {
      return "bg-green-50 border-l-green-500"
    }
    return "bg-gray-50 border-l-gray-500"
  }

  const formatAuditData = (data: any) => {
    if (!data) return null

    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data
      return (
        <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
          <pre className="whitespace-pre-wrap">{JSON.stringify(parsed, null, 2)}</pre>
        </div>
      )
    } catch {
      return (
        <div className="text-xs text-gray-600 mt-2">
          {typeof data === "object" ? JSON.stringify(data) : String(data)}
        </div>
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de la Cita #{appointmentId}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Cargando historial...</p>
              </div>
            </div>
          ) : appointmentAudits.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontró historial para esta cita</p>
              <p className="text-sm text-gray-500 mt-2">
                Es posible que la cita sea muy antigua o no tenga cambios registrados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointmentAudits.map((audit, index) => (
                <Card
                  key={audit.id}
                  className={cn("border-l-4 transition-all duration-200", getActionColor(audit.accion))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getActionIcon(audit.accion)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {audit.accion}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(audit.date), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                            </span>
                          </div>

                          <p className="text-sm text-gray-800 mb-2">{audit.description}</p>

                          {audit.userId && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                              <User className="h-3 w-3" />
                              <span>Usuario ID: {audit.userId}</span>
                            </div>
                          )}

                          {audit.oldData && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                                Ver datos anteriores
                              </summary>
                              {formatAuditData(audit.oldData)}
                            </details>
                          )}

                          {audit.newData && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                                Ver datos nuevos
                              </summary>
                              {formatAuditData(audit.newData)}
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
