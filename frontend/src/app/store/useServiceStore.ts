import { create } from "zustand"
import useAuthStore from "./useAuthStore"
import { toast } from "sonner"

export interface Service {
  id: number
  name: string
  description: string
  price: number
  duration: number
  category: {
    id: number
    name: string
    description: string
  }
}

interface ServiceState {
  services: Service[]
  total: number
  currentPage: number
  pageSize: number
  isLoading: boolean
  error: string | null
  orderBy: string
  orderType: "ASC" | "DESC"
  filter: string
  fetchServices: (page?: number, token?: string) => Promise<void>
  createService: (serviceData: Partial<Service>) => Promise<void>
  updateService: (serviceData: Partial<Service>) => Promise<void>
  deleteService: (serviceId: number) => Promise<void>
  setOrderBy: (field: string) => void
  setOrderType: (type: "ASC" | "DESC") => void
  setFilter: (filter: string) => void
}

const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  total: 0,
  currentPage: 1,
  pageSize: 20,
  isLoading: false,
  error: null,
  orderBy: "id",
  orderType: "DESC",
  filter: "",

  fetchServices: async (page?: number) => {
    const { pageSize, orderBy, orderType, filter } = get()
    const currentPage = page || get().currentPage
    const token = useAuthStore.getState().token

    set({ isLoading: true, error: null })
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/services?orderBy=${orderBy}&orderType=${orderType}&offset=${
          (currentPage - 1) * pageSize
        }&pageSize=${pageSize}&filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Error al obtener servicios")
      }

      const data = await response.json()
      set({ services: data.data.results, total: data.data.total, currentPage, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      toast.error(`Error: ${(error as Error).message}`)
    }
  },

  createService: async (serviceData) => {
    set({ isLoading: true, error: null })
    const token = useAuthStore.getState().token

    try {
      // Validaciones adicionales
      if (!serviceData.name?.trim()) {
        throw new Error("El nombre del servicio es obligatorio")
      }

      if (!serviceData.category) {
        throw new Error("Debe seleccionar una categoría")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(serviceData),
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        set({ isLoading: false })
        return
      }

      if (response.status === 409) {
        toast.error("El servicio ya existe")
        set({ isLoading: false })
        throw new Error("El servicio ya existe")
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Error al crear servicio")
      }

      toast.success("Servicio creado exitosamente")
      await get().fetchServices()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      toast.error(`Error: ${(error as Error).message}`)
      throw error
    }
  },

  updateService: async (serviceData) => {
    set({ isLoading: true, error: null })
    const token = useAuthStore.getState().token

    try {
      // Validaciones adicionales
      if (!serviceData.id) {
        throw new Error("ID de servicio no válido")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/services/${serviceData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(serviceData),
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        set({ isLoading: false })
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Error al actualizar servicio")
      }

      toast.success("Servicio actualizado exitosamente")
      await get().fetchServices()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      toast.error(`Error: ${(error as Error).message}`)
      throw error
    }
  },

  deleteService: async (serviceId) => {
    set({ isLoading: true, error: null })
    const token = useAuthStore.getState().token

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/services/${serviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        set({ isLoading: false })
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Error al eliminar servicio")
      }

      toast.success("Servicio eliminado exitosamente")
      await get().fetchServices()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      toast.error(`Error: ${(error as Error).message}`)
      throw error
    }
  },

  setOrderBy: (field) => set({ orderBy: field }),
  setOrderType: (type) => set({ orderType: type }),
  setFilter: (filter) => set({ filter }),
}))

export default useServiceStore

