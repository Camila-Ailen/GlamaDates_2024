import { create } from 'zustand'
import useAuthStore from './useAuthStore'
import { toast } from 'sonner'

interface Appointment {
    id: number,
    datetimeStart: Date,
    datetimeEnd: Date,
    state: string,
    client: string,
    package: string,
    details: [
        {
            id: number,
            priceNow: number,
            durationNow: number,
            appointment: string,
            employee: string,
            workstation: string,
            service: string
        }
    ]
}

interface AppointmentState {
    appointments: Appointment[]
    total: number
    currentPage: number
    pageSize: number
    isLoading: boolean
    error: string | null
    orderBy: string
    orderType: 'ASC' | 'DESC'
    filter: string
    fetchPackageAvailability: (packageId: number, orderBy:string, orderType: 'ASC' | 'DESC', offset:number, pageSize:number) => Promise<string[]>
}

const token = useAuthStore.getState().token;

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
    appointments: [],
    total: 0,
    currentPage: 1,
    pageSize: 20,
    isLoading: false,
    error: null,
    orderBy: 'id',
    orderType: 'ASC',
    filter: '',


    fetchPackageAvailability: async (packageId: number, orderBy:string, orderType: 'ASC' | 'DESC', offset: number, pageSize:number) => {
        try {
            console.log('packageId: ', packageId);
            console.log('ruta: ', `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointment/availability2/${packageId}?orderBy=${orderBy}&orderType=${orderType}&offset=${offset}&pageSize=${pageSize}`);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/availability2/${packageId}?orderBy=${orderBy}&orderType=${orderType}&offset=${offset}&pageSize=${pageSize}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 403) {
                toast.error("Sesión expirada");
                useAuthStore.getState().logout();
                return;
            }

            if (!response.ok) {
                throw new Error('Error al obtener la disponibilidad');
            }
            const data = await response.json(); // Lista de fechas en UTC
            return data; // Retorna la lista de fechas
        } catch (error) {
            console.error(error);
            return [];
        }
    },


}));

export default useAppointmentStore
