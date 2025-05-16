"use client"

import { Suspense, useEffect } from 'react'
import { useRouter } from "next/navigation"
import useAuthStore from "@/app/store/useAuthStore"
import { Loader2 } from "lucide-react"
import { SystemPreferences } from './system-preferences'

export default function PreferencesPage() {
    const router = useRouter()
    const { user, token, isLoading } = useAuthStore()

    useEffect(() => {
        // Si no está cargando y no hay token, redirigir al login
        if (!isLoading && !token) {
            router.push("/login")
            return
        }

        // Si el usuario está cargado y no tiene el rol necesario, redirigir
        if (user && !hasRequiredPermissions(user)) {
            router.push("/unauthorized")
            return
        }
    }, [isLoading, token, user, router])

    // Función para verificar permisos 
    const hasRequiredPermissions = (user: any) => {
        return Array.isArray(user.role.permissions) &&
            user.role.permissions.some((perm: any) => perm.permission === "read:preference")
    }

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
    if (!user || !token) {
        return null
    }

    // Si el usuario no tiene permisos, no renderizar nada (se redirigirá en el useEffect)
    if (!hasRequiredPermissions(user)) {
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
                <SystemPreferences />
            </Suspense>
        </div>
    )
}
