"use client"
import { create } from "zustand"
import useAuthStore from "./useAuthStore"
import { toast } from "sonner"

// Definición de la interfaz para los roles
export interface Role {
  id: number
  role: string
  description?: string
  createdAt?: string
  updatedAt?: string
  permissions?: Permission[]
}

// Interfaz para los permisos (si los roles tienen permisos asociados)
export interface Permission {
  id: number
  permission: string
  description?: string
}

// Interfaz para crear/actualizar roles
export interface CreateRoleData {
  role: string
  description?: string
}

export interface UpdateRoleData extends CreateRoleData {
  id: number
}

// Interfaz para el estado del store
interface RoleState {
  roles: Role[]
  total: number
  currentPage: number
  pageSize: number
  isLoading: boolean
  error: string | null
  orderBy: string
  orderType: "ASC" | "DESC"
  filter: string

  // Acciones
  fetchRoles: (page?: number) => Promise<void>
  createRole: (roleData: CreateRoleData) => Promise<boolean>
  updateRole: (roleData: UpdateRoleData) => Promise<boolean>
  deleteRole: (roleId: number) => Promise<boolean>
  setOrderBy: (field: string) => void
  setOrderType: (type: "ASC" | "DESC") => void
  setFilter: (filter: string) => void
  resetFilters: () => void
}

// Crear el store
const useRoleStore = create<RoleState>((set, get) => ({
  roles: [],
  total: 0,
  currentPage: 1,
  pageSize: 10,
  isLoading: false,
  error: null,
  orderBy: "id",
  orderType: "ASC",
  filter: "",

  // Obtener roles con paginación y filtros
  fetchRoles: async (page = 1) => {
    const token = useAuthStore.getState().token
    const { pageSize, orderBy, orderType, filter } = get()

    set({ isLoading: true, error: null, currentPage: page })

    try {
      // Construir parámetros según el controlador
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        orderBy,
        orderType,
        ...(filter && { search: filter }),
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roles?${params}`, {
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
        let rolesData = []
        let totalCount = 0

        if (data.data) {
          // Si data.data es un array directo
          if (Array.isArray(data.data)) {
            rolesData = data.data
            totalCount = data.data.length
          }
          // Si data.data tiene estructura con roles y total
          else if (data.data.roles && Array.isArray(data.data.roles)) {
            rolesData = data.data.roles
            totalCount = data.data.total || data.data.roles.length
          }
          // Si data.data tiene estructura con data y total
          else if (data.data.data && Array.isArray(data.data.data)) {
            rolesData = data.data.data
            totalCount = data.data.total || data.data.data.length
          }
          // Si data.data es un objeto con propiedades
          else if (typeof data.data === "object") {
            // Buscar arrays en las propiedades del objeto
            const possibleArrays = Object.values(data.data).filter(Array.isArray)
            if (possibleArrays.length > 0) {
              rolesData = possibleArrays[0] as Role[]
              totalCount = rolesData.length
            }
          }
        }

        set({
          roles: rolesData,
          total: totalCount,
          isLoading: false,
        })
      } else {
        throw new Error(data.message || "Error al obtener los roles")
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      set({
        error: (error as Error).message,
        isLoading: false,
        roles: [],
        total: 0,
      })
      toast.error("Error al cargar los roles")
    }
  },

  // Crear un nuevo rol
  createRole: async (roleData: CreateRoleData) => {
    const token = useAuthStore.getState().token

    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roleData),
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return false
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status === "success") {
        set({ isLoading: false })
        toast.success("Rol creado correctamente")

        // Recargar la lista de roles
        await get().fetchRoles(get().currentPage)
        return true
      } else {
        throw new Error(data.message || "Error al crear el rol")
      }
    } catch (error) {
      console.error("Error creating role:", error)
      set({ error: (error as Error).message, isLoading: false })
      toast.error((error as Error).message || "Error al crear el rol")
      return false
    }
  },

  // Actualizar un rol existente
  updateRole: async (roleData: UpdateRoleData) => {
    const token = useAuthStore.getState().token

    set({ isLoading: true, error: null })

    try {
      const { id, ...updateData } = roleData

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roles/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return false
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status === "success") {
        set({ isLoading: false })
        toast.success("Rol actualizado correctamente")

        // Recargar la lista de roles
        await get().fetchRoles(get().currentPage)
        return true
      } else {
        throw new Error(data.message || "Error al actualizar el rol")
      }
    } catch (error) {
      console.error("Error updating role:", error)
      set({ error: (error as Error).message, isLoading: false })
      toast.error((error as Error).message || "Error al actualizar el rol")
      return false
    }
  },

  // Eliminar un rol
  deleteRole: async (roleId: number) => {
    const token = useAuthStore.getState().token

    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roles/${roleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return false
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status === "success") {
        set({ isLoading: false })
        toast.success("Rol eliminado correctamente")

        // Recargar la lista de roles
        await get().fetchRoles(get().currentPage)
        return true
      } else {
        throw new Error(data.message || "Error al eliminar el rol")
      }
    } catch (error) {
      console.error("Error deleting role:", error)
      set({ error: (error as Error).message, isLoading: false })
      toast.error((error as Error).message || "Error al eliminar el rol")
      return false
    }
  },

  // Configurar ordenamiento
  setOrderBy: (field: string) => {
    set({ orderBy: field })
  },

  setOrderType: (type: "ASC" | "DESC") => {
    set({ orderType: type })
  },

  // Configurar filtro de búsqueda
  setFilter: (filter: string) => {
    set({ filter, currentPage: 1 }) // Reset a la primera página al filtrar
  },

  // Resetear todos los filtros
  resetFilters: () => {
    set({
      filter: "",
      orderBy: "id",
      orderType: "ASC",
      currentPage: 1,
    })
  },
}))

export default useRoleStore
