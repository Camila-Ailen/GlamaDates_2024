import { create } from 'zustand'
import {auth} from "@/auth";


interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  branchOfficeId: number | null
  role: {
    id: number
    role: string
    description: string
    permissions: Array<{
      id: number
      permission: string
      description: string | null
    }>
  }
}

interface UserState {
  users: User[]
  total: number
  currentPage: number
  pageSize: number
  isLoading: boolean
  error: string | null
  orderBy: string
  orderType: 'ASC' | 'DESC'
  filter: string
  fetchUsers: (page?: number) => Promise<void>
  createUser: (userData: Partial<User>) => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
  deleteUser: (userId: number) => Promise<void>
  setOrderBy: (field: string) => void
  setOrderType: (type: 'ASC' | 'DESC') => void
  setFilter: (filter: string) => void
}

// const session = await auth();

const useUserStore = create<UserState>((set, get) => ({
    users: [],
    total: 0,
    currentPage: 1,
    pageSize: 8,
    isLoading: false,
    error: null,
    orderBy: 'id',
    orderType: 'DESC',
    filter: '',


    fetchUsers: async (page?: number) => {
        // console.log("session: ",session);
        const { pageSize, orderBy, orderType, filter } = get()
        const currentPage = page || get().currentPage

        console.log("BACKEND_URL: ", process.env.NEXT_PUBLIC_BACKEND_URL);


        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`http://localhost:3000/api/users?orderBy=${orderBy}&orderType=${orderType}&offset=${(currentPage - 1) * pageSize}&pageSize=${pageSize}&filter=${filter}`, {
            })
            console.log("response: ", response);
            if (!response.ok) throw new Error('Error al obtener usuarios')
            const data = await response.json()
            set({ users: data.data.results, total: data.data.total, currentPage, isLoading: false })
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    createUser: async (userData) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`http://localhost:3000/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(userData),
            })
            if (!response.ok) throw new Error('Error al crear usuario')
            await get().fetchUsers()
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    updateUser: async (userData) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`http://localhost:3000/api/users/${userData.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(userData),
            })
            if (!response.ok) throw new Error('Error al actualizar usuario')
            await get().fetchUsers()
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    deleteUser: async (userId) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (!response.ok) throw new Error('Error al eliminar usuario')
            await get().fetchUsers()
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    setOrderBy: (field) => set({ orderBy: field }),
    setOrderType: (type) => set({ orderType: type }),
    setFilter: (filter) => set({ filter }),
}))

export default useUserStore
