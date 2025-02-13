"use client"
import { create } from "zustand"

interface PaymentState {
  paymentId: string | null
  amount: number | null
  paymentUrl: string | null
  fetchPaymentUrl: (appointmentId: string) => void
  setPaymentData: (id: string, amount: number) => void
}

export const usePaymentStore = create<PaymentState>((set) => ({
  paymentId: null,
  amount: null,
  paymentUrl: null,

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

  




}))

