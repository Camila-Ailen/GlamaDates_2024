"use client"
import { create } from "zustand"

interface PaymentState {
  paymentId: string | null
  amount: number | null
  setPaymentData: (id: string, amount: number) => void
}

export const usePaymentStore = create<PaymentState>((set) => ({
  paymentId: null,
  amount: null,
  setPaymentData: (id, amount) => set({ paymentId: id, amount }),
}))

