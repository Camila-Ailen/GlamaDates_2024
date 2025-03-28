import { create } from 'zustand'
import useAuthStore from './useAuthStore'
import { toast } from 'sonner'
import { Appointment } from '@/app/store/useAppointmentStore'
import { m } from 'framer-motion'


interface MyDatesState {
    myDates: Appointment[]
    total: number
    currentPage: number
    pageSize: number
    isLoading: boolean
    error: string | null
    orderBy: string
    orderType: 'ASC' | 'DESC'
    filter: string
    // setMyDates: (dates: Date[]) => void
    fetchMyDates: (page?: number, token?: string) => Promise<void>
    cancelAppointment: (id: number) => Promise<void>
    setOrderBy: (field: string) => void
    setOrderType: (type: 'ASC' | 'DESC') => void
    setFilter: (filter: string) => void
}

const token = useAuthStore.getState().token;


export const useMyDatesStore = create<MyDatesState>((set, get) => ({
    myDates: [],
    total: 0,
    currentPage: 1,
    pageSize: 8,
    isLoading: false,
    error: null,
    orderBy: 'datetimeStart',
    orderType: 'DESC',
    filter: '',

    fetchMyDates: async (page?: number) => {
        const { pageSize, orderBy, orderType, filter } = get();
        const currentPage = page || get().currentPage;

        set({ isLoading: true, error: null });

        try {
            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_BACKEND_URL
                }/api/appointment/userDates`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            
            if (response.status === 403 || response.status === 500) {
                
                useAuthStore.getState().logout();
                toast.error("Sesión expirada");
                return;
            } 

            // console.log('response.status: ', response);
            
            if (!response.ok) throw new Error("Error al obtener mis citas");
            const data = await response.json();
            console.log('data: ', data);
            set({
                myDates: data.data,
                // total: data.data.total,
                // currentPage,
                isLoading: false,
            });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }

    },

    cancelAppointment: async (id: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/cancel/${id}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 403) {
                toast.error("Sesión expirada");
                useAuthStore.getState().logout();
                return;
            }
            if (!response.ok){
                throw new Error('Error al cancelar la cita');
            } else {
                toast.success('Cita cancelada exitosamente');
            }
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error(error);
        }
    },

    setOrderBy: (field) => set({ orderBy: field }),
    setOrderType: (type) => set({ orderType: type }),
    setFilter: (filter) => set({ filter }),
}));

export default useMyDatesStore