"use client"

import { Suspense, useEffect } from 'react'
import { useRouter } from "next/navigation"
import useAuthStore from "@/app/store/useAuthStore"
import { Loader2 } from "lucide-react"
import { AppointmentsTodayTable } from './appointmentsToday-table'

// Función para verificar permisos 
const hasRequiredPermissions = (user: any) => {
    return !!user &&
        !!user.role &&
        Array.isArray(user.role.permissions) &&
        user.role.permissions.some((perm: any) => perm.permission === "read:todayappointment")
}

export default function AppointmetsTodayPage() {
    const router = useRouter()
    const { user, token, isLoading } = useAuthStore()



    useEffect(() => {
        if (isLoading) return; // Espera a que termine de cargar

        if (!token || !user) {
            router.replace("/login")
            return
        }

        // Si el usuario está cargado y no tiene el rol necesario, redirigir
        if (!hasRequiredPermissions(user)) {
            router.replace("/unauthorized")
            return
        }
    }, [isLoading, token, user, router])

    // Mostrar pantalla de carga mientras se verifica la autenticación
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                    <p className="text-gray-500">Verificando acceso...</p>
                </div>
            </div>
        )
    }

    // Si no hay usuario o token, no renderizar nada (se redirigirá en el useEffect)
    if (!user || !token || !hasRequiredPermissions(user)) {
        return null
    }

    // Si pasa todas las verificaciones, mostrar la página
    return (
        <div className="container mx-auto py-10">
            <Suspense
                fallback={
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-pink-600" />
                            <p className="text-gray-500">Cargando citas...</p>
                        </div>
                    </div>
                }
            >
                <AppointmentsTodayTable />
            </Suspense>
        </div>
    )
}
