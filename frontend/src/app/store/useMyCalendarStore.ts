import { create } from "zustand"
import { Appointment } from "./useAppointmentStore"
import useAuthStore from "./useAuthStore"
import { toast } from "sonner"


interface MyCalendarState {
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
    setOrderBy: (field: string) => void
    setOrderType: (type: 'ASC' | 'DESC') => void
    setFilter: (filter: string) => void
}

const token = useAuthStore.getState().token;

export const useMyCalendarStore = create<MyCalendarState>((set, get) => ({
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
                }/api/appointment/professional?orderBy=${orderBy}&orderType=${orderType}&offset=${
                    (currentPage - 1) * pageSize
                }&pageSize=${pageSize}&filter=${filter}`,
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

            console.log('response.status: ', response);
            
            if (!response.ok) throw new Error("Error al obtener mis citas");
            const data = await response.json();
            set({
                myDates: data.data.results,
                total: data.data.total,
                currentPage,
                isLoading: false,
            });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }

    },

    setOrderBy: (field) => set({ orderBy: field }),
    setOrderType: (type) => set({ orderType: type }),
    setFilter: (filter) => set({ filter }),
}));

export default useMyCalendarStore