"use client"

import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import useAuthStore from "@/app/store/useAuthStore"
import { Loader2 } from "lucide-react"
import DashboardContent from "./dashboard-content"

export default function DashboardPage() {
  const router = useRouter()
  const { user, token, isLoading } = useAuthStore()

  useEffect(() => {
    // Si no está cargando y no hay token, redirigir al login
    if (!isLoading && !token) {
      router.push("/catalog")
      return
    }

    // Si el usuario está cargado y no tiene el rol necesario, redirigir
    if (user && !hasRequiredPermissions(user)) {
      router.push("/catalog")
      return
    }
  }, [isLoading, token, user, router])

  // Función para verificar permisos
  const hasRequiredPermissions = (user: any) => {
    // Verificar si el usuario tiene el rol de ADMIN o SECRETARIO
    if (user.role.role === "ADMIN" || user.role === "SECRETARIO") {
      return true
    }

    // O verificar si tiene el permiso específico para acceder al dashboard
    return (
      Array.isArray(user.role?.permissions) &&
      user.role.permissions.some((perm: any) => perm.permission === "access:dashboard")
    )
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
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-pink-600" />
            <p className="text-gray-500">Cargando dashboard...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
