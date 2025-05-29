"use client"
import { create } from "zustand"
import useAuthStore from "./useAuthStore"
import { toast } from "sonner"

// Definición de la interfaz para los permisos
export interface Permission {
    id: number
    permission: string
    description?: string
}

// Interfaz para el estado del store
interface PermissionState {
    permissions: Permission[]
    isLoading: boolean
    error: string | null

    // Acciones
    fetchPermissions: () => Promise<void>
}

// Crear el store
const usePermissionStore = create<PermissionState>((set, get) => ({
    permissions: [],
    isLoading: false,
    error: null,

    // Obtener todos los permisos disponibles
    fetchPermissions: async () => {
        const token = useAuthStore.getState().token

        set({ isLoading: true, error: null })

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/permissions`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        //"Content-Type": "application/json",
                    },
                })

            if (response.status === 403) {
                toast.error("Sesión expirada")
                useAuthStore.getState().logout()
                return
            }

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`)
            }

            console.log("Response from permissions API:", response)
            const data = await response.json()

            if (data.status === "success") {
                // Manejar diferentes estructuras de respuesta
                let permissionsData = []

                if (data.data) {
                    if (Array.isArray(data.data)) {
                        permissionsData = data.data
                    } else if (data.data.permissions && Array.isArray(data.data.permissions)) {
                        permissionsData = data.data.permissions
                    } else if (data.data.data && Array.isArray(data.data.data)) {
                        permissionsData = data.data.data
                    }
                }

                set({
                    permissions: permissionsData,
                    isLoading: false,
                })
            } else {
                throw new Error(data.message || "Error al obtener los permisos")
            }
        } catch (error) {
            console.error("Error fetching permissions:", error)
            set({
                error: (error as Error).message,
                isLoading: false,
                permissions: [],
            })
            toast.error("Error al cargar los permisos")
        }
    },
}))

export default usePermissionStore
