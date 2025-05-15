"use client"
import { create } from "zustand"
import useAuthStore from "./useAuthStore"
import { toast } from "sonner"

// Definición de la interfaz para la configuración del sistema
export interface SystemConfig {
  id?: number
  intervalMinutes: number
  maxReservationDays: number
  openingHour1: string
  closingHour1: string
  openingHour2: string | null
  closingHour2: string | null
  descountFull: number
  descountPartial: number
  openDays: string[]
}

// Interfaz para el estado del store
interface SystemConfigState {
  config: SystemConfig | null
  isLoading: boolean
  error: string | null
  fetchConfig: () => Promise<void>
  updateConfig: (config: SystemConfig) => Promise<boolean>
}

// Crear el store
export const useSystemConfigStore = create<SystemConfigState>((set, get) => ({
  config: null,
  isLoading: false,
  error: null,

  // Obtener la configuración actual del sistema
  fetchConfig: async () => {
    const token = useAuthStore.getState().token

    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/system-config`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return
      }

      if (!response.ok) throw new Error("Error al obtener la configuración del sistema")

      const data = await response.json()

      if (data.status === "success") {
        set({ config: data.data, isLoading: false })
      } else {
        throw new Error(data.message || "Error al obtener la configuración del sistema")
      }
    } catch (error) {
      console.error("Error fetching system config:", error)
      set({ error: (error as Error).message, isLoading: false })
      toast.error("Error al cargar la configuración del sistema")
    }
  },

  // Actualizar la configuración del sistema
  updateConfig: async (config: SystemConfig) => {
    const token = useAuthStore.getState().token

    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/system-config/1`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return false
      }

      if (!response.ok) throw new Error("Error al actualizar la configuración del sistema")

      const data = await response.json()

      if (data.status === "success") {
        set({ config: data.data, isLoading: false })
        toast.success("Configuración actualizada correctamente")
        return true
      } else {
        throw new Error(data.message || "Error al actualizar la configuración del sistema")
      }
    } catch (error) {
      console.error("Error updating system config:", error)
      set({ error: (error as Error).message, isLoading: false })
      toast.error("Error al actualizar la configuración del sistema")
      return false
    }
  },
}))
