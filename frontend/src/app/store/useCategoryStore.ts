"use client"
import { create } from "zustand"
import useAuthStore from "./useAuthStore"
import { toast } from "sonner"

interface Category {
  id: number
  name: string
  description: string
}

interface CategoryState {
  categories: Category[]
  total: number
  currentPage: number
  pageSize: number
  isLoading: boolean
  error: string | null
  orderBy: string
  orderType: "ASC" | "DESC"
  searchTerm: string // Cambiado de filter a searchTerm para claridad
  fetchCategories: (page?: number) => Promise<void>
  createCategory: (categoryData: Partial<Category>) => Promise<boolean>
  updateCategory: (categoryData: Partial<Category>) => Promise<boolean>
  deleteCategory: (categoryId: number) => Promise<boolean>
  setOrderBy: (field: string) => void
  setOrderType: (type: "ASC" | "DESC") => void
  setSearchTerm: (searchTerm: string) => void
  getFilteredCategories: () => Category[]
}

const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  total: 0,
  currentPage: 1,
  pageSize: 10,
  isLoading: false,
  error: null,
  orderBy: "id",
  orderType: "DESC",
  searchTerm: "",

  fetchCategories: async (page?: number) => {
    const token = useAuthStore.getState().token
    const { pageSize, orderBy, orderType } = get()
    const currentPage = page || get().currentPage

    set({ isLoading: true, error: null, currentPage })

    try {
      // Solo enviar parámetros de paginación y ordenamiento, NO de búsqueda
      const params = new URLSearchParams({
        orderBy,
        orderType,
        offset: ((currentPage - 1) * pageSize).toString(),
        pageSize: pageSize.toString(),
      })

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories?${params.toString()}`
      console.log("Fetching categories from:", url)

      const response = await fetch(url, {
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
      console.log("Categories response:", data)

      // Manejar la estructura de respuesta según el backend original
      if (data.data) {
        set({
          categories: data.data.results || data.data || [],
          total: data.data.total || data.total || 0,
          isLoading: false,
        })
      } else {
        // Fallback si la estructura es diferente
        set({
          categories: Array.isArray(data) ? data : [],
          total: Array.isArray(data) ? data.length : 0,
          isLoading: false,
        })
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      set({
        error: (error as Error).message,
        isLoading: false,
        categories: [],
        total: 0,
      })
      toast.error("Error al cargar categorías")
    }
  },

  // Función para filtrar categorías localmente
  getFilteredCategories: () => {
    const { categories, searchTerm } = get()

    if (!searchTerm.trim()) {
      return categories
    }

    const term = searchTerm.toLowerCase().trim()

    return categories.filter((category) => {
      const nameMatch = category.name.toLowerCase().includes(term)
      const descriptionMatch = category.description?.toLowerCase().includes(term) || false
      const idMatch = category.id.toString().includes(term)

      return nameMatch || descriptionMatch || idMatch
    })
  },

  createCategory: async (categoryData) => {
    const token = useAuthStore.getState().token
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return false
      }

      if (response.status === 409) {
        toast.error("La categoría ya existe")
        set({ isLoading: false })
        return false
      }

      if (!response.ok) {
        toast.error("Error al crear categoría")
        set({ isLoading: false })
        return false
      }

      toast.success("Categoría creada exitosamente")
      set({ isLoading: false })
      await get().fetchCategories(get().currentPage)
      return true
    } catch (error) {
      console.error("Error creating category:", error)
      set({ error: (error as Error).message, isLoading: false })
      toast.error("Error al crear categoría")
      return false
    }
  },

  updateCategory: async (categoryData) => {
    const token = useAuthStore.getState().token
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${categoryData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return false
      }

      if (!response.ok) {
        toast.error("Error al actualizar categoría")
        set({ isLoading: false })
        return false
      }

      toast.success("Categoría actualizada exitosamente")
      set({ isLoading: false })
      await get().fetchCategories(get().currentPage)
      return true
    } catch (error) {
      console.error("Error updating category:", error)
      set({ error: (error as Error).message, isLoading: false })
      toast.error("Error al actualizar categoría")
      return false
    }
  },

  deleteCategory: async (categoryId) => {
    const token = useAuthStore.getState().token
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${categoryId}`, {
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
        toast.error("Error al eliminar categoría")
        set({ isLoading: false })
        return false
      }

      toast.success("Categoría eliminada exitosamente")
      set({ isLoading: false })
      await get().fetchCategories(get().currentPage)
      return true
    } catch (error) {
      console.error("Error deleting category:", error)
      set({ error: (error as Error).message, isLoading: false })
      toast.error("Error al eliminar categoría")
      return false
    }
  },

  setOrderBy: (field) => set({ orderBy: field }),
  setOrderType: (type) => set({ orderType: type }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
}))

export default useCategoryStore
