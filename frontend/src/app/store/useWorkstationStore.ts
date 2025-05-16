"use client"
import { create } from "zustand"
import useAuthStore from "./useAuthStore"
import { toast } from "sonner"
import { Workstation } from "./useAppointmentStore"



// Interfaz para el estado del store
interface WorkstationState {
    workstations: Workstation[]
    isLoading: boolean
    error: string | null
    fetchWorkstations: () => Promise<void>
    setWorkstations: (workstations: Workstation[]) => void
}

// Crear el store
export const useWorkstationStore = create<WorkstationState>((set, get) => ({
    workstations: [],
    isLoading: false,
    error: null,

    // Obtener la configuración actual del sistema
    fetchWorkstations: async () => {
        const token = useAuthStore.getState().token

        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workstation`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.status === 403) {
                toast.error("Sesión expirada")
                useAuthStore.getState().logout()
                return
            }

            if (!response.ok) throw new Error("Error al obtener las estaciones de trabajo")

            const data = await response.json()

            console.log("Data de estaciones de trabajo:", data)

            if (data.status === "success") {
                set({ workstations: data.data, isLoading: false })
            } else {
                throw new Error(data.message || "Error al obtener las estaciones de trabajo")
            }
        } catch (error) {
            console.error("Error fetching workstation:", error)
            set({ error: (error as Error).message, isLoading: false })
            toast.error("Error al cargar las estaciones de trabajo")
        }
    },

    setWorkstations: (workstations: Workstation[]) => {
        set({ workstations })
    },

    
}))
