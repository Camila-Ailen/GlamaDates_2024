import { create } from 'zustand'
import useAuthStore from './useAuthStore'
import { toast } from 'sonner'

interface Package {
    id: number
    name: string
    description: string
    services: {
        id: number
        name: string
        description: string
        price: number
        duration: number
    }
    price: number
    duration: number
}

interface PackageState {
    packages: Package[]
    total: number
    currentPage: number
    pageSize: number
    isLoading: boolean
    error: string | null
    orderBy: string
    orderType: 'ASC' | 'DESC'
    filter: string
    fetchPackage: (page?: number) => Promise<void>
    createPackage: (packageData: Partial<Package>) => Promise<void>
    updatePackage: (packageData: Partial<Package>) => Promise<void>
    deletePackage: (packageId: number) => Promise<void>
    setOrderBy: (field: string) => void
    setOrderType: (type: 'ASC' | 'DESC') => void
    setFilter: (filter: string) => void
}

const token = useAuthStore.getState().token;

const usePackageStore = create<PackageState>((set, get) => ({
    packages: [],
    total: 0,
    currentPage: 1,
    pageSize: 8,
    isLoading: false,
    error: null,
    orderBy: 'id',
    orderType: 'DESC',
    filter: '',


    


    fetchPackage: async (page?: number) => {
        const { pageSize, orderBy, orderType, filter } = get()
        const currentPage = page || get().currentPage

        console.log("BACKEND_URL: ", process.env.NEXT_PUBLIC_BACKEND_URL);


        set({ isLoading: true, error: null })
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL
                }/api/packages?orderBy=${orderBy}&orderType=${orderType}&offset=${(currentPage - 1) * pageSize
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
            if (!response.ok) throw new Error('Error al obtener paquetes')
            const data = await response.json()
            set({ packages: data.data.results, total: data.data.total, currentPage, isLoading: false })
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    createPackage: async (packageData) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/packages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(packageData),
                })
            if (response.status === 403) {
                toast.error("Sesión expirada");
                useAuthStore.getState().logout();
                return;
            }

            if (response.status === 409) {
                toast.error("El paquete ya existe");
                throw new Error("El paquete ya existe");
            }

            if (!response.ok) toast.error('Error al crear paquete')
            toast.success('Paquete creado exitosamente')
            await get().fetchPackage()
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    updatePackage: async (packageData) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/packages/${packageData.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(packageData),
                })
            if (response.status === 403) {
                toast.error("Sesión expirada");
                useAuthStore.getState().logout();
                return;
            }

            if (!response.ok) throw new Error('Error al actualizar paquete')
            await get().fetchPackage()
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    deletePackage: async (packageId) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/packages/${packageId}`,
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

            if (!response.ok) throw new Error('Error al eliminar paquete')
            await get().fetchPackage()
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    setOrderBy: (field) => set({ orderBy: field }),
    setOrderType: (type) => set({ orderType: type }),
    setFilter: (filter) => set({ filter }),
}))

export default usePackageStore
