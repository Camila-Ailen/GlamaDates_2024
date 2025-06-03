import { toast } from "sonner"
import { create } from "zustand"
import useAuthStore from "./useAuthStore"

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  gender?: string
  birthdate?: Date
  phone?: string
  branchOfficeId?: number | null
  deletedAt?: Date | null
  role: {
    id: number
    role: string
    description?: string
    permissions?: Array<{
      id: number
      permission: string
      description: string | null
    }>
  }
  categories?: Array<{
    id: number
    name: string
  }>
  createdAt?: Date
  updatedAt?: Date
}

// Interfaz para crear usuarios (sin password ya que se asigna automáticamente)
export interface CreateUserData {
  firstName: string
  lastName: string
  email: string
  gender?: string
  birthdate?: Date
  phone?: string
  role: { id: number } // Objeto con id del rol
  categories?: number[] // Array de IDs de categorías
}

// Interfaz para actualizar usuarios
export interface UpdateUserData extends Partial<CreateUserData> {
  id: number
  password?: string // Opcional para cambiar contraseña
}

interface UserState {
  users: User[]
  total: number
  currentPage: number
  pageSize: number
  isLoading: boolean
  error: string | null
  orderBy: string
  orderType: "ASC" | "DESC"
  filter: string
  fetchUsers: (page?: number) => Promise<void>
  fetchAllUsers: () => Promise<void>
  createUser: (userData: CreateUserData) => Promise<boolean>
  registerUser: (userData: CreateUserData) => Promise<boolean>
  fetchEmployees: (page?: number) => Promise<void>
  updateUser: (userData: UpdateUserData) => Promise<boolean>
  deleteUser: (userId: number) => Promise<boolean>
  setOrderBy: (field: string) => void
  setOrderType: (type: "ASC" | "DESC") => void
  setFilter: (filter: string) => void
}

const useUserStore = create<UserState>((set, get) => ({
  users: [],
  total: 0,
  currentPage: 1,
  pageSize: 10,
  isLoading: false,
  error: null,
  orderBy: "id",
  orderType: "DESC",
  filter: "",

  fetchAllUsers: async () => {
    const token = useAuthStore.getState().token
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/all`, {
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
      if (!response.ok) throw new Error("Error al obtener usuarios")
      const data = await response.json()
      console.log("Fetched all users data:", data)
      if (data.status === "success") {
        set({
          users: data.data || [],
          total: Array.isArray(data.data) ? data.data.length : 0,
          isLoading: false,
        })
      }
      else {
        throw new Error(data.message || "Error al obtener usuarios")
      }
    } catch (error) {
      console.error("Error fetching all users:", error)
      set({
        error: (error as Error).message,
        isLoading: false,
        users: [],
        total: 0,
      })
      toast.error("Error al cargar usuarios")
    }
  },

  fetchUsers: async (page?: number) => {
    const token = useAuthStore.getState().token
    const { pageSize, orderBy, orderType, filter } = get()
    const currentPage = page || get().currentPage

    set({ isLoading: true, error: null, currentPage })

    try {
      // Construir parámetros según el backend
      const params = new URLSearchParams({
        orderBy,
        orderType,
        offset: ((currentPage - 1) * pageSize).toString(),
        pageSize: pageSize.toString(),
        ...(filter && {
          firstName: filter,
          lastName: filter,
          email: filter,
        }),
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users?${params}`, {
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

      if (!response.ok) throw new Error("Error al obtener usuarios")

      const data = await response.json()

      console.log("Fetched users data:", data)

      if (data.status === "success") {
        set({
          users: data.data.results || [],
          total: data.data.total || 0,
          isLoading: false,
        })
      } else {
        throw new Error(data.message || "Error al obtener usuarios")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      set({
        error: (error as Error).message,
        isLoading: false,
        users: [],
        total: 0,
      })
      toast.error("Error al cargar usuarios")
    }
  },

  fetchEmployees: async (page?: number) => {
    const token = useAuthStore.getState().token
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/employees`, {
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

      if (!response.ok) throw new Error("Error al obtener empleados")

      const data = await response.json()

      if (data.status === "success") {
        set({
          users: data.data || [],
          total: Array.isArray(data.data) ? data.data.length : 0,
          isLoading: false,
        })
      } else {
        throw new Error(data.message || "Error al obtener empleados")
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
      set({
        error: (error as Error).message,
        isLoading: false,
        users: [],
        total: 0,
      })
      toast.error("Error al cargar empleados")
    }
  },

  createUser: async (userData: CreateUserData) => {
    const token = useAuthStore.getState().token
    set({ isLoading: true, error: null })

    try {
      // Preparar datos según el DTO del backend
      const requestData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        gender: userData.gender,
        birthdate: userData.birthdate,
        phone: userData.phone,
        role: userData.role.id.toString(), 
        categories: userData.categories, // Array de IDs
      }


      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return false
      }

      if (response.status === 409) {
        toast.error("El usuario ya existe")
        set({ isLoading: false })
        return false
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status === "success") {
        toast.success("Usuario creado correctamente")
        set({ isLoading: false })

        // Recargar la lista de usuarios
        await get().fetchUsers(get().currentPage)
        return true
      } else {
        throw new Error(data.message || "Error al crear usuario")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      set({ error: (error as Error).message, isLoading: false })
      toast.error((error as Error).message || "Error al crear usuario")
      return false
    }
  },

  registerUser: async (userData: CreateUserData) => {
    set({ isLoading: true, error: null })

    console.log("Registering user with data:", userData)

    try {
      // Preparar datos según el DTO del backend
      const requestData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        gender: userData.gender,
        birthdate: userData.birthdate,
        phone: userData.phone,
        categories: userData.categories, // Array de IDs
      }

      console.log("Registering user with data:", requestData)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (response.status === 409) {
        toast.error("El usuario ya existe")
        set({ isLoading: false })
        return false
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status === "success") {
        toast.success("Usuario creado correctamente")
        set({ isLoading: false })

        return true
      } else {
        throw new Error(data.message || "Error al crear usuario")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      set({ error: (error as Error).message, isLoading: false })
      toast.error((error as Error).message || "Error al crear usuario")
      return false
    }
  },

  updateUser: async (userData: UpdateUserData) => {
    const token = useAuthStore.getState().token
    set({ isLoading: true, error: null })

    try {
      const { id, ...updateData } = userData

      // Preparar datos según el DTO del backend
      const requestData = {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        gender: updateData.gender,
        birthdate: updateData.birthdate,
        phone: updateData.phone,
        role: updateData.role?.id.toString(), 
        categories: updateData.categories,
        ...(updateData.password && { password: updateData.password }),
      }

      console.log("Updating user with data:", requestData)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
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
        toast.success("Usuario actualizado correctamente")
        set({ isLoading: false })

        // Recargar la lista de usuarios
        await get().fetchUsers(get().currentPage)
        return true
      } else {
        throw new Error(data.message || "Error al actualizar usuario")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      set({ error: (error as Error).message, isLoading: false })
      toast.error((error as Error).message || "Error al actualizar usuario")
      return false
    }
  },

  deleteUser: async (userId: number) => {
    const token = useAuthStore.getState().token
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`, {
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
        toast.success("Usuario eliminado correctamente")
        set({ isLoading: false })

        // Recargar la lista de usuarios
        await get().fetchUsers(get().currentPage)
        return true
      } else {
        throw new Error(data.message || "Error al eliminar usuario")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      set({ error: (error as Error).message, isLoading: false })
      toast.error((error as Error).message || "Error al eliminar usuario")
      return false
    }
  },

  setOrderBy: (field) => set({ orderBy: field }),
  setOrderType: (type) => set({ orderType: type }),
  setFilter: (filter) => set({ filter, currentPage: 1 }), // Reset página al filtrar
}))

export default useUserStore
