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
    fetchPackageAvailability: (appointmentId: number) => Promise<string[]>
}

const token = useAuthStore.getState().token;

const useAppointmentStore = create<AppointmentState>((set, get) => ({
    appointments: [],
    total: 0,
    currentPage: 1,
    pageSize: 8,
    isLoading: false,
    error: null,
    orderBy: 'id',
    orderType: 'DESC',
    filter: '',


    fetchPackageAvailability: async (packageId: number) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointment/availability/${packageId}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // JWT token
                        'Content-Type': 'application/json'
                    },
                }
            );
            if (!response.ok) {
                throw new Error('Error al obtener la disponibilidad');
            }
            const data = await response.json(); // Lista de fechas en UTC
            return data; // Retorna la lista de fechas
        } catch (error) {
            console.error(error);
            return null;
        }
    },


}))

export default useAppointmentStore
