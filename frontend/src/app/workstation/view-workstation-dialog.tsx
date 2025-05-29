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
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Eye, Monitor, Calendar, FileText, Tag } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Workstation } from "../store/useWorkstationStore"

interface ViewWorkstationDialogProps {
    workstation: Workstation
}

export function ViewWorkstationDialog({ workstation }: ViewWorkstationDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 border-green-200 text-green-700 hover:bg-green-50">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Detalles de la Estación de Trabajo
                    </DialogTitle>
                    <DialogDescription>
                        Información completa de la estación de trabajo y sus categorías asociadas
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-6">
                        {/* Información básica */}
                        <Card className="border-blue-100">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Información General
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Nombre</label>
                                        <p className="text-lg font-semibold text-blue-700">{workstation.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">ID</label>
                                        <p className="text-sm text-gray-700">#{workstation.id}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Estado</label>
                                    <div className="mt-1">
                                        <Badge
                                            variant={
                                                workstation.state === "ACTIVO"
                                                    ? "default"
                                                    : workstation.state === "INACTIVO"
                                                        ? "secondary"
                                                        : "destructive"
                                            }
                                            className={
                                                workstation.state === "ACTIVO"
                                                    ? "bg-green-100 text-green-700 border-green-200"
                                                    : workstation.state === "INACTIVO"
                                                        ? "bg-gray-100 text-gray-700 border-gray-200"
                                                        : "bg-red-100 text-red-700 border-red-200"
                                            }
                                        >
                                            {workstation.state === "ACTIVO"
                                                ? "Activa"
                                                : workstation.state === "INACTIVO"
                                                    ? "Inactiva"
                                                    : "Eliminada"}
                                        </Badge>
                                    </div>
                                </div>

                                {workstation.description && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Descripción</label>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{workstation.description}</p>
                                    </div>
                                )}

                                {workstation.createdAt && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            Creada el{" "}
                                            {new Date(workstation.createdAt).toLocaleDateString("es-ES", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Categorías asociadas */}
                        <Card className="border-purple-100">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-purple-700 flex items-center gap-2">
                                    <Tag className="h-4 w-4" />
                                    Categorías Asociadas
                                </CardTitle>
                                <CardDescription>
                                    {workstation.categories?.length || 0} categoría
                                    {(workstation.categories?.length || 0) !== 1 ? "s" : ""} asociada
                                    {(workstation.categories?.length || 0) !== 1 ? "s" : ""} a esta estación
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!workstation.categories || workstation.categories.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Tag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No hay categorías asociadas a esta estación</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {workstation.categories.map((category) => (
                                            <div
                                                key={category.id}
                                                className="flex items-center gap-3 p-3 bg-purple-50 rounded-md border border-purple-200"
                                            >
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-purple-900">{category.name}</p>
                                                    <p className="text-xs text-purple-600">ID: {category.id}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Resumen estadístico */}
                        <Card className="border-gray-100">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-gray-700">Resumen</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-700">{workstation.categories?.length || 0}</p>
                                        <p className="text-xs text-blue-600">Categorías</p>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-700">{workstation.state ? "SÍ" : "NO"}</p>
                                        <p className="text-xs text-green-600">Activa</p>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <p className="text-2xl font-bold text-purple-700">#{workstation.id}</p>
                                        <p className="text-xs text-purple-600">ID Estación</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>

                <Separator />

                <div className="flex justify-end pt-4">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
