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

export interface Package {
  id: number
  name: string
  description: string
  duration: number
  price: number
  services: Service[]
}

interface PackageState {
  packages: Package[]
  total: number
  currentPage: number
  pageSize: number
  offset?: number
  isLoading: boolean
  error: string | null
  orderBy: string
  orderType: "ASC" | "DESC"
  filter: string
  selectedPackage: Package | null
  fetchPackage: (page?: number, token?: string) => Promise<void>
  createPackage: (packageData: Partial<Package>) => Promise<void>
  updatePackage: (packageData: Partial<Package>) => Promise<void>
  deletePackage: (packageId: number) => Promise<void>
  setOrderBy: (field: string) => void
  setOrderType: (type: "ASC" | "DESC") => void
  setFilter: (filter: string) => void
  selectPackage: (packageId: number) => void
}

const usePackageStore = create<PackageState>((set, get) => ({
  packages: [],
  total: 0,
  currentPage: 1,
  pageSize: 20,
  isLoading: false,
  error: null,
  orderBy: "id",
  orderType: "ASC",
  filter: "",
  selectedPackage: null,

  selectPackage: (packageId: number) => {
    const packageData = get().packages.find((packageItem) => packageItem.id === packageId)
    set({ selectedPackage: packageData })
  },

  fetchPackage: async (page?: number) => {
    const { pageSize, orderBy, orderType, filter } = get()
    const currentPage = page || get().currentPage
    const token = useAuthStore.getState().token

    set({ isLoading: true, error: null })
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/packages?orderBy=${orderBy}&orderType=${orderType}&offset=${
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
        throw new Error(errorData.message || "Error al obtener paquetes")
      }

      const data = await response.json()
      set({ packages: data.data.results, total: data.data.total, currentPage, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      toast.error(`Error: ${(error as Error).message}`)
    }
  },

  createPackage: async (packageData) => {
    set({ isLoading: true, error: null })
    const token = useAuthStore.getState().token

    try {
      // Validaciones adicionales
      if (!packageData.name?.trim()) {
        throw new Error("El nombre del paquete es obligatorio")
      }

      if (!packageData.services || !Array.isArray(packageData.services) || packageData.services.length === 0) {
        throw new Error("Debe seleccionar al menos un servicio")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(packageData),
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        set({ isLoading: false })
        return
      }

      if (response.status === 409) {
        toast.error("El paquete ya existe")
        set({ isLoading: false })
        throw new Error("El paquete ya existe")
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Error al crear paquete")
      }

      toast.success("Paquete creado exitosamente")
      await get().fetchPackage()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      toast.error(`Error: ${(error as Error).message}`)
      throw error
    }
  },

  updatePackage: async (packageData) => {
    set({ isLoading: true, error: null })
    const token = useAuthStore.getState().token

    try {
      // Validaciones adicionales
      if (!packageData.id) {
        throw new Error("ID de paquete no válido")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/packages/${packageData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(packageData),
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        set({ isLoading: false })
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Error al actualizar paquete")
      }

      toast.success("Paquete actualizado exitosamente")
      await get().fetchPackage()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      toast.error(`Error: ${(error as Error).message}`)
      throw error
    }
  },

  deletePackage: async (packageId) => {
    set({ isLoading: true, error: null })
    const token = useAuthStore.getState().token

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/packages/${packageId}`, {
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
        throw new Error(errorData.message || "Error al eliminar paquete")
      }

      toast.success("Paquete eliminado exitosamente")
      await get().fetchPackage()
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

export default usePackageStore

