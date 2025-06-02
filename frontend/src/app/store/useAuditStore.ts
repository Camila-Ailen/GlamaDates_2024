"use client"
import { create } from "zustand"
import { toast } from "sonner"
import useAuthStore from "./useAuthStore"

// Definición de la interfaz para las auditorías
export interface Audit {
  id: number
  userId: number | null
  entity: string
  accion: string
  description: string
  date: string
  oldData: any | null
  newData: any | null
}

interface AuditState {
  audits: Audit[]
  total: number
  isLoading: boolean
  error: string | null
  currentPage: number
  pageSize: number
  orderBy: string
  orderType: "ASC" | "DESC"
  filter: string
  entityFilter: string
  actionFilter: string
  userFilter: string

  // Acciones
  setPageSize: (pageSize: number) => void
  setOrderBy: (orderBy: string) => void
  setOrderType: (orderType: "ASC" | "DESC") => void
  setFilter: (filter: string) => void
  setEntityFilter: (entityFilter: string) => void
  setActionFilter: (actionFilter: string) => void
  setUserFilter: (userFilter: string) => void
  fetchAudits: (page?: number) => Promise<void>

  // Nuevas acciones para obtener opciones de filtro
  fetchFilterOptions: () => Promise<{ entities: string[]; actions: string[]; users: (number | null)[] }>
}

export const useAuditStore = create<AuditState>((set, get) => ({
  audits: [],
  total: 0,
  isLoading: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  orderBy: "id",
  orderType: "DESC",
  filter: "",
  entityFilter: "all",
  actionFilter: "all",
  userFilter: "all",

  setPageSize: (pageSize) => {
    set({ pageSize, currentPage: 1 })
    // Refrescar datos con el nuevo tamaño de página
    get().fetchAudits(1)
  },

  setOrderBy: (orderBy) => {
    set({ orderBy, currentPage: 1 })
    // Refrescar datos con el nuevo ordenamiento
    get().fetchAudits(1)
  },

  setOrderType: (orderType) => {
    set({ orderType, currentPage: 1 })
    // Refrescar datos con el nuevo tipo de ordenamiento
    get().fetchAudits(1)
  },

  setFilter: (filter) => {
    set({ filter, currentPage: 1 })
    // Refrescar datos con el nuevo filtro
    get().fetchAudits(1)
  },

  setEntityFilter: (entityFilter) => {
    set({ entityFilter, currentPage: 1 })
    // Refrescar datos con el nuevo filtro de entidad
    get().fetchAudits(1)
  },

  setActionFilter: (actionFilter) => {
    set({ actionFilter, currentPage: 1 })
    // Refrescar datos con el nuevo filtro de acción
    get().fetchAudits(1)
  },

  setUserFilter: (userFilter) => {
    set({ userFilter, currentPage: 1 })
    // Refrescar datos con el nuevo filtro de usuario
    get().fetchAudits(1)
  },

  fetchAudits: async (page = 1) => {
    const token = useAuthStore.getState().token
    const { pageSize, orderBy, orderType, filter, entityFilter, actionFilter, userFilter } = get()

    set({ isLoading: true, error: null, currentPage: page })

    try {
      // Construir parámetros para el backend
      const params = new URLSearchParams({
        orderBy,
        orderType,
        offset: ((page - 1) * pageSize).toString(),
        pageSize: pageSize.toString(),
      })

      // Agregar filtros solo si no son "all" o están vacíos
      if (filter && filter.trim() !== "") {
        params.append("search", filter.trim())
      }

      if (entityFilter && entityFilter !== "all") {
        params.append("entity", entityFilter)
      }

      if (actionFilter && actionFilter !== "all") {
        params.append("accion", actionFilter)
      }

      if (userFilter && userFilter !== "all") {
        if (userFilter === "sistema") {
          params.append("userId", "NULL") // Asumiendo que "sistema" se traduce a null en el backend
        } else {
          params.append("userId", userFilter)
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auditoria?${params}`, {
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
        set({
          audits: data.data.results || [],
          total: data.data.total || 0,
          isLoading: false,
        })
      } else {
        throw new Error(data.message || "Error al obtener las auditorías")
      }
    } catch (error) {
      console.error("Error fetching audits:", error)
      set({
        error: (error as Error).message,
        isLoading: false,
        audits: [],
        total: 0,
      })
      toast.error("Error al cargar las auditorías")
    }
  },

  // Nueva función para obtener opciones de filtro desde el backend
  fetchFilterOptions: async () => {
    const token = useAuthStore.getState().token

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auditoria/filter-options`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.status === "success") {
          return {
            entities: data.data.entities || [],
            actions: data.data.actions || [],
            users: data.data.users || [],
          }
        }
      }

      // Si no hay endpoint específico, usar los datos actuales como fallback
      const { audits } = get()
      return {
        entities: Array.from(new Set(audits.map((audit) => audit.entity))),
        actions: Array.from(new Set(audits.map((audit) => audit.accion))),
        users: Array.from(new Set(audits.map((audit) => audit.userId).filter((id) => id !== undefined && id !== null))),
      }
    } catch (error) {
      console.error("Error fetching filter options:", error)
      // Fallback a datos locales
      const { audits } = get()
      return {
        entities: Array.from(new Set(audits.map((audit) => audit.entity))),
        actions: Array.from(new Set(audits.map((audit) => audit.accion))),
        users: Array.from(new Set(audits.map((audit) => audit.userId).filter((id) => id !== undefined && id !== null))),
      }
    }
  },
}))

export default useAuditStore
