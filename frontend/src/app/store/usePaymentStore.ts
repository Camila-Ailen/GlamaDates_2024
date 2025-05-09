"use client"
import { create } from "zustand"
import useAuthStore from "./useAuthStore"
import { toast } from "sonner"
import { Appointment } from "./useAppointmentStore"

interface Payment {
  id: number
  appointment: Appointment
  datetime: Date
  amount: number
  paymentMethod: string
  paymentType: string
  status: string
  observation: string
  transactionId: string
  paymentURL: string
  created_at: Date
  updated_at: Date
}

interface PaymentState {
  payments: Payment[]
  paymentId: string | null
  amount: number | null
  paymentUrl: string | null
  total: number
  currentPage: number
  pageSize: number
  isLoading: boolean
  error: string | null
  orderBy: string
  orderType: 'ASC' | 'DESC'
  filter: string
  fetchPaymentUrl: (appointmentId: string) => void
  setPaymentData: (id: string, amount: number) => void
  fetchPayments: (page?: number, token?: string) => Promise<void>
  cancelPayment: (id: number, observation: string) => Promise<void>
  setOrderBy: (orderBy: string) => void
  setOrderType: (orderType: "ASC" | "DESC") => void
}

const token = useAuthStore.getState().token;

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  paymentId: null,
  amount: null,
  paymentUrl: null,
  total: 0,
  currentPage: 1,
  pageSize: 20,
  isLoading: false,
  error: null,
  orderBy: 'id',
  orderType: 'DESC',
  filter: '',

  setPaymentData: (id, amount) => set({ paymentId: id, amount }),

  fetchPaymentUrl: async (appointmentId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/payment-url?appointmentId=${appointmentId}`)
      const data = await response.json()
      if (data.status === 'success') {
        set({ paymentUrl: data.data })
      } else {
        console.error('Error fetching payment URL:', data)
      }
    } catch (error) {
      console.error('Error fetching payment URL:', error)
    }
  },


  fetchPayments: async (page?: number) => {
    const { pageSize, orderBy, orderType, filter } = get()
    const currentPage = page || get().currentPage

    set({ isLoading: true, error: null })
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/payment/all?orderBy=${orderBy}&orderType=${orderType}&offset=${(currentPage - 1) * pageSize
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

      if (!response.ok) throw new Error('Error al obtener pagos')
      const data = await response.json()
      set({ payments: data.data.results, total: data.data.total, currentPage, isLoading: false })
    } catch (error) {
      set({ error: (error as any).message, isLoading: false })
    }
  },

  cancelPayment: async (id: number, observation: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/cancel/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ observation }),
      });
      if (response.status === 403) {
        toast.error("Sesión expirada");
        useAuthStore.getState().logout();
        return;
      }
      if (!response.ok) {
        throw new Error('Error al cancelar el pago');
      } else {
        toast.success('Pago cancelado exitosamente');
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  },

  setOrderBy: (orderBy: string) => set({ orderBy }),
  setOrderType: (orderType: "ASC" | "DESC") => set({ orderType }),

}))

