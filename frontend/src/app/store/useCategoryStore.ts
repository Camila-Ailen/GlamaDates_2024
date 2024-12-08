import { create } from 'zustand'

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
  orderType: 'ASC' | 'DESC'
  filter: string
  fetchCategories: (page?: number) => Promise<void>
  createCategory: (categoryData: Partial<Category>) => Promise<void>
  updateCategory: (categoryData: Partial<Category>) => Promise<void>
  deleteCategory: (categoryId: number) => Promise<void>
  setOrderBy: (field: string) => void
  setOrderType: (type: 'ASC' | 'DESC') => void
  setFilter: (filter: string) => void
}


const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    total: 0,
    currentPage: 1,
    pageSize: 8,
    isLoading: false,
    error: null,
    orderBy: 'id',
    orderType: 'DESC',
    filter: '',


    fetchCategories: async (page?: number) => {
        const { pageSize, orderBy, orderType, filter } = get()
        const currentPage = page || get().currentPage

        console.log("BACKEND_URL: ", process.env.NEXT_PUBLIC_BACKEND_URL);


        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`http://localhost:3000/api/categories?orderBy=${orderBy}&orderType=${orderType}&offset=${(currentPage - 1) * pageSize}&pageSize=${pageSize}&filter=${filter}`, {
            })
            console.log("response: ", response);
            if (!response.ok) throw new Error('Error al obtener categorias')
            const data = await response.json()
            set({ categories: data.data.results, total: data.data.total, currentPage, isLoading: false })
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    createCategory: async (categoryData) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`http://localhost:3000/api/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(categoryData),
            })
            if (!response.ok) throw new Error('Error al crear categoria')
            await get().fetchCategories()
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    updateCategory: async (categoryData) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`http://localhost:3000/api/categories/${categoryData.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(categoryData),
            })
            if (!response.ok) throw new Error('Error al actualizar categoria')
            await get().fetchCategories()
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    deleteCategory: async (categoryId) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (!response.ok) throw new Error('Error al eliminar categoria')
            await get().fetchCategories()
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    setOrderBy: (field) => set({ orderBy: field }),
    setOrderType: (type) => set({ orderType: type }),
    setFilter: (filter) => set({ filter }),
}))

export default useCategoryStore
