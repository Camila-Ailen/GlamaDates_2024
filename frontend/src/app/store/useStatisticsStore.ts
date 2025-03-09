import { create } from 'zustand'
import useAuthStore from './useAuthStore'
import { toast } from 'sonner'


interface StatisticsState {

    startDate: string;
    endDate: string;
    error: string | null;
    isLoading: boolean;
    appointmentTotal: any[];
    payMethod: any[];
    perCategory: any[];
    perProfessional: any[];
    perDay: any[];

    fetchTotalDates: (startDate: string, endDate: string) => Promise<any>;
    fetchPayMethod: (startDate: string, endDate: string) => Promise<any>;
    fetchPerCategory: (startDate: string, endDate: string) => Promise<any>;
    fetchPerProfessional: (startDate: string, endDate: string) => Promise<any>;
    fetchPerDay: (startDate: string, endDate: string) => Promise<any>;

}

const token = useAuthStore.getState().token;

export const useStatisticsStore = create<StatisticsState>((set, get) => ({

    startDate: '',
    endDate: '',
    error: null,
    isLoading: false,
    appointmentTotal: [],
    payMethod: [],
    perCategory: [],
    perProfessional: [],
    perDay: [],



    fetchTotalDates: async (startDate: string, endDate: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/statistics/allDates?begin=${startDate}&end=${endDate}`,
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
                throw new Error('Error al obtener las citas');
            }
            const data = await response.json();
            set({ appointmentTotal: data, isLoading: false });
        } catch (error) {
            console.error(error);
        }
    },

    fetchPayMethod: async (startDate: string, endDate: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/statistics/payMethod?begin=${startDate}&end=${endDate}`,
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
                throw new Error('Error al obtener la cita');
            }
            const data = await response.json();
            set({ payMethod: data, isLoading: false });
        } catch (error) {
            console.error(error);
        }
    },

    fetchPerCategory: async (startDate: string, endDate: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/statistics/perCategory?begin=${startDate}&end=${endDate}`,
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
                throw new Error('Error al obtener la cita');
            }
            const data = await response.json();
            set({ perCategory: data, isLoading: false });
        } catch (error) {
            console.error(error);
        }
    },

    fetchPerProfessional: async (startDate: string, endDate: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/statistics/perProfessional?begin=${startDate}&end=${endDate}`,
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
                throw new Error('Error al obtener la cita');
            }
            const data = await response.json();
            set({ perProfessional: data, isLoading: false });
        } catch (error) {
            console.error(error);
        }
    },

    fetchPerDay: async (startDate: string, endDate: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/statistics/perDay?begin=${startDate}&end=${endDate}`,
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
                throw new Error('Error al obtener la cita');
            }
            const data = await response.json();
            set({ perDay: data, isLoading: false });
        } catch (error) {
            console.error(error);
        }
    },

}))

export default useStatisticsStore;