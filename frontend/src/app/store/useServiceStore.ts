import { create } from 'zustand'
import useAuthStore from './useAuthStore'
import { toast } from 'sonner'

interface Service {
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
    orderType: 'ASC' | 'DESC'
    filter: string
    fetchServices: (page?: number, token?: string) => Promise<void>
    createService: (serviceData: Partial<Service>) => Promise<void>
    updateService: (serviceData: Partial<Service>) => Promise<void>
    deleteService: (serviceId: number) => Promise<void>
    setOrderBy: (field: string) => void
    setOrderType: (type: 'ASC' | 'DESC') => void
    setFilter: (filter: string) => void
}

const token = useAuthStore.getState().token;

const useServiceStore = create<ServiceState>((set, get) => ({
    services: [],
    total: 0,
    currentPage: 1,
    pageSize: 8,
    isLoading: false,
    error: null,
    orderBy: 'id',
    orderType: 'DESC',
    filter: '',


    fetchServices: async (page?: number) => {
        const { pageSize, orderBy, orderType, filter } = get()
        const currentPage = page || get().currentPage

        console.log("BACKEND_URL: ", process.env.NEXT_PUBLIC_BACKEND_URL);


        set({ isLoading: true, error: null })
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL
                }/api/services?orderBy=${orderBy}&orderType=${orderType}&offset=${(currentPage - 1) * pageSize
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

            console.log("response: ", response);
            if (!response.ok) throw new Error('Error al obtener servicios')
            const data = await response.json()
            set({ services: data.data.results, total: data.data.total, currentPage, isLoading: false })
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    createService: async (serviceData) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/services`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(serviceData),
                })
            if (response.status === 403) {
                toast.error("Sesión expirada");
                useAuthStore.getState().logout();
                return;
            }

            if (response.status === 409) {
                toast.error("El servicio ya existe");
                throw new Error("El servicio ya existe");
            }

            if (!response.ok) toast.error('Error al crear servicio')
            toast.success('Servicio creado exitosamente')
            await get().fetchServices()
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    updateService: async (serviceData) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/services/${serviceData.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(serviceData),
                })
            if (response.status === 403) {
                toast.error("Sesión expirada");
                useAuthStore.getState().logout();
                return;
            }

            if (!response.ok) throw new Error('Error al actualizar servicio')
            await get().fetchServices()
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    deleteService: async (serviceId) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/services/${serviceId}`,
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

            if (!response.ok) throw new Error('Error al eliminar servicio')
            await get().fetchServices()
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    setOrderBy: (field) => set({ orderBy: field }),
    setOrderType: (type) => set({ orderType: type }),
    setFilter: (filter) => set({ filter }),
}))

export default useServiceStore
