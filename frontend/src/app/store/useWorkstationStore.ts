"use client"
import { create } from "zustand"
import useAuthStore from "./useAuthStore"
import { toast } from "sonner"

// Definición de la interfaz para las estaciones de trabajo
export interface Workstation {
  id: number
  name: string
  description?: string
  state: "ACTIVO" | "INACTIVO" | "ELIMINADO"
  categories: Array<{
    id: number
    name: string
  }>
  createdAt?: string
  updatedAt?: string
}

// Interfaz para crear/actualizar estaciones de trabajo
export interface WorkstationFormData {
  id?: number
  name: string
  description?: string
  state: "ACTIVO" | "INACTIVO" | "ELIMINADO"
  categories: number[]
}

// Interfaz para el estado del store
interface WorkstationState {
  workstations: Workstation[]
  total: number
  currentPage: number
  pageSize: number
  isLoading: boolean
  error: string | null
  orderBy: string
  orderType: "ASC" | "DESC"
  filter: string

  // Acciones
  fetchWorkstations: (page?: number) => Promise<void>
  createWorkstation: (workstation: WorkstationFormData) => Promise<boolean>
  updateWorkstation: (workstation: WorkstationFormData) => Promise<boolean>
  deleteWorkstation: (id: number) => Promise<boolean>
  setOrderBy: (orderBy: string) => void
  setOrderType: (orderType: "ASC" | "DESC") => void
  setFilter: (filter: string) => void
  setWorkstations: (workstations: Workstation[]) => void
}

// Crear el store
export const useWorkstationStore = create<WorkstationState>((set, get) => ({
  workstations: [],
  total: 0,
  currentPage: 1,
  pageSize: 20,
  isLoading: false,
  error: null,
  orderBy: "id",
  orderType: "ASC",
  filter: "",

  // Obtener todas las estaciones de trabajo
  fetchWorkstations: async (page = 1) => {
    const token = useAuthStore.getState().token
    const { orderBy, orderType, filter, pageSize } = get()

    set({ isLoading: true, error: null, currentPage: page })

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        orderBy,
        orderType,
        ...(filter && { search: filter }),
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workstation?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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

      const data = await response.json()

      if (data.status === "success") {
        // Manejar diferentes estructuras de respuesta
        let workstationsData = []
        let totalCount = 0

        if (data.data.results) {
          if (Array.isArray(data.data.results)) {
            workstationsData = data.data.results
            totalCount = data.data.total || data.data.results.length
          }
        }

        set({
          workstations: workstationsData,
          total: totalCount,
          isLoading: false,
        })
      } else {
        throw new Error(data.message || "Error al obtener las estaciones de trabajo")
      }
    } catch (error) {
      console.error("Error fetching workstations:", error)
      set({
        error: (error as Error).message,
        isLoading: false,
        workstations: [],
        total: 0,
      })
      toast.error("Error al cargar las estaciones de trabajo")
    }
  },

  // Crear una nueva estación de trabajo
  createWorkstation: async (workstationData: WorkstationFormData) => {
    const token = useAuthStore.getState().token

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workstation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workstationData),
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return false
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status === "success") {
        toast.success("Estación de trabajo creada correctamente")
        // Refrescar la lista
        get().fetchWorkstations(get().currentPage)
        return true
      } else {
        throw new Error(data.message || "Error al crear la estación de trabajo")
      }
    } catch (error) {
      console.error("Error creating workstation:", error)
      toast.error((error as Error).message || "Error al crear la estación de trabajo")
      return false
    }
  },

  // Actualizar una estación de trabajo existente
  updateWorkstation: async (workstationData: WorkstationFormData) => {
    const token = useAuthStore.getState().token

    if (!workstationData.id) {
      toast.error("ID de estación de trabajo requerido para actualizar")
      return false
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workstation/${workstationData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workstationData),
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return false
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status === "success") {
        toast.success("Estación de trabajo actualizada correctamente")
        // Refrescar la lista
        get().fetchWorkstations(get().currentPage)
        return true
      } else {
        throw new Error(data.message || "Error al actualizar la estación de trabajo")
      }
    } catch (error) {
      console.error("Error updating workstation:", error)
      toast.error((error as Error).message || "Error al actualizar la estación de trabajo")
      return false
    }
  },

  // Eliminar una estación de trabajo
  deleteWorkstation: async (id: number) => {
    const token = useAuthStore.getState().token

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workstation/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return false
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status === "success") {
        toast.success("Estación de trabajo eliminada correctamente")
        // Refrescar la lista
        get().fetchWorkstations(get().currentPage)
        return true
      } else {
        throw new Error(data.message || "Error al eliminar la estación de trabajo")
      }
    } catch (error) {
      console.error("Error deleting workstation:", error)
      toast.error((error as Error).message || "Error al eliminar la estación de trabajo")
      return false
    }
  },

  // Setters para filtros y ordenamiento
  setOrderBy: (orderBy: string) => {
    set({ orderBy })
  },

  setOrderType: (orderType: "ASC" | "DESC") => {
    set({ orderType })
  },

  setFilter: (filter: string) => {
    set({ filter })
  },

  setWorkstations: (workstations: Workstation[]) => {
    set({ workstations })
  },
}))

export default useWorkstationStore
