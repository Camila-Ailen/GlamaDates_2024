import { create } from 'zustand'
import useAuthStore from './useAuthStore'
import { toast } from 'sonner'
import { Package } from './usePackageStore'
import { User } from './useUserStore'
import { Payment } from './usePaymentStore'

export interface DetailsAppointment {
    id: number,
    priceNow: number,
    durationNow: number,
    appointment: Appointment,
    employee: User,
    workstation: Workstation,
    service: Service,
    datetimeStart: Date,
}

export interface Appointment {
    id: number,
    datetimeStart: Date,
    datetimeEnd: Date,
    state: string,
    client: User,
    package: Package,
    details: DetailsAppointment[],
    total: number,
    discount: number,
    pending: number,
    payments: Payment[],
}

interface Category {
    id: number,
    name: string,
    description: string,
}

export interface Workstation {
    id: number,
    name: string,
    description: string,
    state: string,
    categories: Category[],
    appointment: Appointment[]
}


interface Service {
    id: number;
    name: string;
    price: number;
    duration: number;
    description: string;
    category: Category;
}

interface AppointmentHistoryItem {
    fecha: string;
    total_turnos: number;
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
    selectedServices: Service[]
    todayAppointments: number
    thisMonthAppointments: number
    thisWeekAppointments: number
    lastMonthAppointments: number
    appointmentHistory: []
    fetchManualCron: () => Promise<void>
    fetchCashPayment: (id: number, observation: string) => Promise<void>
    fetchCompletedAppointment: (id: number) => Promise<void>
    fetchOneAppointment: (id: number) => Promise<Appointment | null>
    setSelectedServices: (services: Service[]) => void
    fetchPackageAvailability: (packageId: number, orderBy: string, orderType: 'ASC' | 'DESC', offset: number, pageSize: number) => Promise<string[]>
    fetchAppointments: (page?: number, token?: string) => Promise<void>
    fetchTodayAppointments: (page?: number, token?: string) => Promise<void>
    fetchTodayAppointmentsCount: () => Promise<{ total_turnos: number }>
    fetchTotalAppointmentsThisMonth: () => Promise<{ total_turnos: number }>
    fetchLastMonthAppointments: () => Promise<{ total_turnos: number }>
    fetchTotalAppointmentsThisWeek: () => Promise<{ total_turnos: number }>
    fetchAppointmentHistory: (timeRange: string) => Promise<void>
    setOrderBy: (field: string) => void
    setOrderType: (type: 'ASC' | 'DESC') => void
    setFilter: (filter: string) => void
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
    orderType: 'DESC',
    filter: '',
    todayAppointments: 0,
    thisWeekAppointments: 0,
    thisMonthAppointments: 0,
    lastMonthAppointments: 0,
    appointmentHistory: [],

    selectedServices: [],
    setSelectedServices: (services) => set({ selectedServices: services }),

    fetchManualCron: async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/updatePendingToInactive`,
                {
                    method: 'PATCH',
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
                throw new Error('Error al ejecutar el cron manualmente');
            }
            toast.success("Ejecución del cron manual exitosa.")
            toast.info('Se han actualizado los turnos pendientes a inactivos.')
            return;
        } catch (error) {
            console.error(error);
            return;
        }
    },

    fetchCashPayment: async (id: number, observation: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/registerCashPayment/${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ observation }),
                }
            );
            if (response.status === 403) {
                toast.error("Sesión expirada");
                useAuthStore.getState().logout();
                return;
            }

            if (!response.ok) {
                throw new Error('Error al registrar el pago en efectivo');
            }
            toast.success("Pago en efectivo registrado con éxito")
            return;
        } catch (error) {
            console.error(error);
            return;
        }
    },

    fetchCompletedAppointment: async (id: number) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/complete/${id}`,
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
                throw new Error('Error al completar la cita');
            }
            toast.success("Cita completada con éxito")
            return;
        }
        catch (error) {
            console.error(error);
            return;
        }
    },


    fetchOneAppointment: async (id: number) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/user/one/${id}`,
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
            return data; // Retorna la cita
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    fetchPackageAvailability: async (packageId: number, orderBy: string, orderType: 'ASC' | 'DESC', offset: number, pageSize: number) => {
        try {
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


    fetchAppointments: async (page?: number) => {
        const { pageSize, orderBy, orderType, filter } = get()
        const currentPage = page || get().currentPage

        set({ isLoading: true, error: null })
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL
                }/api/appointment?orderBy=${orderBy}&orderType=${orderType}&offset=${(currentPage - 1) * pageSize
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

            if (!response.ok) throw new Error('Error al obtener citas')
            const data = await response.json()
            set({ appointments: data.data.results, total: data.data.total, currentPage, isLoading: false })
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },

    fetchTodayAppointments: async (page?: number) => {
        const { pageSize, orderBy, orderType, filter } = get()
        const currentPage = page || get().currentPage

        set({ isLoading: true, error: null })
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL
                }/api/appointment/today?orderBy=${orderBy}&orderType=${orderType}&offset=${(currentPage - 1) * pageSize
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

            if (!response.ok) throw new Error('Error al obtener citas')
            const data = await response.json()
            set({ appointments: data.data.results, total: data.data.total, currentPage, isLoading: false })
        } catch (error) {
            set({ error: (error as any).message, isLoading: false })
        }
    },


    fetchTodayAppointmentsCount: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/todayCount`,
                {
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
                throw new Error('Error al obtener la cantidad de turnos');
            }
            const data = await response.json();
            set({ todayAppointments: data.total_turnos, isLoading: false });
            return data; // Retorna la cantidad de turnos
        } catch (error) {
            console.error(error);
            return { total_turnos: 0 };
        }
    },

    fetchTotalAppointmentsThisMonth: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/thisMonth`,
                {
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
                throw new Error('Error al obtener la cantidad de turnos');
            }
            const data = await response.json();
            set({ thisMonthAppointments: data.total_turnos, isLoading: false });
            return data; // Retorna la cantidad de turnos
        } catch (error) {
            console.error(error);
            return { total_turnos: 0 };
        }
    },

    fetchLastMonthAppointments: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`
            ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/lastMonth`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            if (response.status === 403) {
                toast.error("Sesión expirada");
                useAuthStore.getState().logout();
                return;
            }
            if (!response.ok) throw new Error('Error al obtener turnos del mes pasado');
            const data = await response.json();
            set({ lastMonthAppointments: data.total_turnos, isLoading: false });
            return data;
        } catch (error) {
            console.error(error);
            return { total_turnos: 0 };
        }
    },

    fetchTotalAppointmentsThisWeek: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/week`,
                {
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
                throw new Error('Error al obtener la cantidad de turnos');
            }
            const data = await response.json();
            set({ thisWeekAppointments: data.total_turnos, isLoading: false });
            return data; // Retorna la cantidad de turnos
        } catch (error) {
            console.error(error);
            return { total_turnos: 0 };
        }
    },

    fetchAppointmentHistory: async (timeRange) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/history?range=${timeRange}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 403) {
                toast.error("Sesión expirada");
                useAuthStore.getState().logout();
                return;
            }
            if (!response.ok) throw new Error('Error al obtener el historial de turnos');
            const data = await response.json();
            set({ appointmentHistory: data, isLoading: false });
        } catch (error) {
            console.error(error);
            //   set({ isLoading: false, error: error.message });
        }
    },




    setOrderBy: (field) => set({ orderBy: field }),
    setOrderType: (type) => set({ orderType: type }),
    setFilter: (filter) => set({ filter }),

}));

export default useAppointmentStore