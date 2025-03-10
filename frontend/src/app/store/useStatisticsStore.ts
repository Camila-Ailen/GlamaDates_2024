import { create } from "zustand"
import useAuthStore from "./useAuthStore"
import { toast } from "sonner"
import { format, subDays } from "date-fns"

interface StatisticsState {
  startDate: string
  endDate: string
  error: string | null
  isLoading: boolean
  appointmentTotal: any
  payMethod: any
  perCategory: any
  perProfessional: any
  perDay: any

  setStartDate: (date: string) => void
  setEndDate: (date: string) => void
  setError: (error: string | null) => void
  fetchTotalDates: (startDate: string, endDate: string) => Promise<any>
  fetchPayMethod: (startDate: string, endDate: string) => Promise<any>
  fetchPerCategory: (startDate: string, endDate: string) => Promise<any>
  fetchPerProfessional: (startDate: string, endDate: string) => Promise<any>
  fetchPerDay: (startDate: string, endDate: string) => Promise<any>
}

const token = useAuthStore.getState().token

const defaultStartDate = format(subDays(new Date(), 30), "yyyy-MM-dd")
const defaultEndDate = format(new Date(), "yyyy-MM-dd")

export const useStatisticsStore = create<StatisticsState>((set, get) => ({
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  error: null,
  isLoading: false,
  appointmentTotal: { result: [], totals: {} },
  payMethod: {totals:{}},
  perCategory: { totals: {} },
  perProfessional: { totals: {} },
  perDay: { totals: {} },

  setStartDate: (date: string) => {
    // Aseguramos que la fecha se guarde en formato yyyy-MM-dd para la API
    const formattedDate = format(new Date(date), "yyyy-MM-dd")
    set({ startDate: formattedDate })
  },
  setEndDate: (date: string) => {
    // Aseguramos que la fecha se guarde en formato yyyy-MM-dd para la API
    const formattedDate = format(new Date(date), "yyyy-MM-dd")
    set({ endDate: formattedDate })
  },

  setError: (error: string | null) => set({ error }),

  fetchTotalDates: async (startDate: string, endDate: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/statistics/allDates?begin=${startDate}&end=${endDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return
      }

      if (!response.ok) {
        throw new Error("Error al obtener las citas")
      }
      const data = await response.json()
      set({ appointmentTotal: data, isLoading: false })
      console.log(data)
    } catch (error) {
      console.error(error)
      set({ error: (error as any).message, isLoading: false })
    }
  },

  fetchPayMethod: async (startDate: string, endDate: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/statistics/payMethod?begin=${startDate}&end=${endDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return
      }

      if (!response.ok) {
        throw new Error("Error al obtener la cita")
      }
      const data = await response.json()
      set({ payMethod: data, isLoading: false })
    } catch (error) {
      console.error(error)
    }
  },

  fetchPerCategory: async (startDate: string, endDate: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/statistics/perCategory?begin=${startDate}&end=${endDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return
      }

      if (!response.ok) {
        throw new Error("Error al obtener la cita")
      }
      const data = await response.json()
      set({ perCategory: data, isLoading: false })
    } catch (error) {
      console.error(error)
    }
  },

  fetchPerProfessional: async (startDate: string, endDate: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/statistics/perProfessional?begin=${startDate}&end=${endDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return
      }

      if (!response.ok) {
        throw new Error("Error al obtener la cita")
      }
      const data = await response.json()
      set({ perProfessional: data, isLoading: false })
    } catch (error) {
      console.error(error)
    }
  },

  fetchPerDay: async (startDate: string, endDate: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/statistics/perDay?begin=${startDate}&end=${endDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return
      }

      if (!response.ok) {
        throw new Error("Error al obtener la cita")
      }
      const data = await response.json()
      set({ perDay: data, isLoading: false })
    } catch (error) {
      console.error(error)
    }
  },
}))

export default useStatisticsStore

