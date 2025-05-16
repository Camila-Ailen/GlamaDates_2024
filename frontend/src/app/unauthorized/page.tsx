"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ShieldAlert, Home, ArrowLeft } from "lucide-react"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-red-100">
            <ShieldAlert className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Acceso no autorizado</h1>
          <p className="mt-2 text-gray-600">No tienes los permisos necesarios para acceder a esta página.</p>
        </div>

        <div className="flex flex-col space-y-3">
          <Button onClick={() => router.back()} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver atrás
          </Button>

          <Button onClick={() => router.push("/catalog")} className="w-full bg-pink-600 hover:bg-pink-700">
            <Home className="mr-2 h-4 w-4" />
            Ir al catálogo
          </Button>
        </div>
      </div>
    </div>
  )
}
