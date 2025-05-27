import { create } from 'zustand'
import useAuthStore from './useAuthStore'
import { toast } from 'sonner'

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
    fetchCategories: (page?: number, token?: string) => Promise<void>
    createCategory: (categoryData: Partial<Category>) => Promise<void>
    updateCategory: (categoryData: Partial<Category>) => Promise<void>
    deleteCategory: (categoryId: number) => Promise<void>
    setOrderBy: (field: string) => void
    setOrderType: (type: 'ASC' | 'DESC') => void
    setFilter: (filter: string) => void
}

const token = useAuthStore.getState().token;

const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    total: 0,
    currentPage: 1,
    pageSize: 10,
    isLoading: false,
    error: null,
    orderBy: 'id',
    orderType: 'DESC',
    filter: '',


    fetchCategories: async (page?: number) => {
        const { pageSize, orderBy, orderType, filter } = get()
        const currentPage = page || get().currentPage

        set({ isLoading: true, error: null })
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL
                }/api/categories?orderBy=${orderBy}&orderType=${orderType}&offset=${(currentPage - 1) * pageSize
                }&pageSize=${pageSize}&filter=${filter}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
            if (response.status === 403) {
                toast.error("Sesión expirada");
                useAuthStore.getState().logout();
                return;
            }

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
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(categoryData),
                })
            if (response.status === 403) {
                toast.error("Sesión expirada");
                useAuthStore.getState().logout();
                return;
            }

            if (response.status === 409) {
                toast.error("La categoria ya existe");
                throw new Error("La categoria ya existe");
            }

            if (!response.ok) toast.error('Error al crear categoria')
            toast.success('Categoria creada exitosamente')
            await get().fetchCategories()
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    updateCategory: async (categoryData) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${categoryData.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(categoryData),
                })
            if (response.status === 403) {
                toast.error("Sesión expirada");
                useAuthStore.getState().logout();
                return;
            }

            if (!response.ok) throw new Error('Error al actualizar categoria')
            await get().fetchCategories()
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    deleteCategory: async (categoryId) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${categoryId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            if (response.status === 403) {
                toast.error("Sesión expirada");
                useAuthStore.getState().logout();
                return;
            }

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
