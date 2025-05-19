import { create } from "zustand"
import useAuthStore from "./useAuthStore"
import { toast } from "sonner"

interface EditStoreState {
  isAvailable: boolean | null
  isOpen: boolean
  isOpenEdit: boolean
  appointment: number | null
  datetimeOld: string | null
  fetchRearrange: (data: { packageId: number; datetime: string }) => Promise<void>
  rearrangeAppointment: (details: any) => Promise<void>
  setAppointment: (appointmentId: number) => void
  openDialog: () => void
  closeDialog: () => void

  openEditDialog: () => void
  closeEditDialog: () => void
  fetchProfessionalsAndWorkstations: (datetimeStart: string, serviceId: number) => Promise<any | null>
  updateAppointmentDetail: (detailId: number, employeeId: string, workstationId: string) => Promise<boolean>
}

const token = useAuthStore.getState().token

export const useEditStore = create<EditStoreState>((set) => ({
  isAvailable: null,
  isOpen: false,
  isOpenEdit: false,
  appointment: null,
  datetimeOld: null,

  fetchRearrange: async (data) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/isAvailable?packageId=${data.packageId}&datetimeStart=${data.datetime}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.status === 403) {
        console.error("Session expired")
        useAuthStore.getState().logout()
        return
      }

      const result = await response.json()
      set({ isAvailable: result.available })
      set({ datetimeOld: data.datetime })
    } catch (error) {
      console.error("Error fetching rearrange availability:", error)
      set({ isAvailable: false })
    }
  },

  rearrangeAppointment: async (details) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/rearrange/${details.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(details),
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al modificar el turno")
      }

      const result = await response.json()
      toast.success("Turno modificado exitosamente")
      set({ isOpen: false })
      return result
    } catch (error) {
      console.error("Error rearranging appointment:", error)
      toast.error(error instanceof Error ? error.message : "Error al modificar el turno")
      throw error
    }
  },

  setAppointment: (appointmentId: number) => set({ appointment: appointmentId }),

  openDialog: () => set({ isOpen: true }),
  closeDialog: () => set({ isOpen: false }),

  openEditDialog: () => set({ isOpenEdit: true }),
  closeEditDialog: () => set({ isOpenEdit: false }),
  fetchProfessionalsAndWorkstations: async (datetimeStart: string, service: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/prof-work?datetimeStart=${encodeURIComponent(datetimeStart)}&service=${service}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.status === 403) {
        console.error("Session expired")
        useAuthStore.getState().logout()
        return null
      }

      if (!response.ok) {
        throw new Error("Error fetching professionals and workstations")
      }
      const data = await response.json()
      console.log("Data fetched:", data)
      return data
    } catch (error) {
      console.error("Error:", error)
      return null
    }
  },

  updateAppointmentDetail: async (detailId: number, employeeId: string, workstationId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/details/${detailId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee: employeeId,
          workstation: workstationId,
        }),
      })

      if (response.status === 403) {
        console.error("Session expired")
        useAuthStore.getState().logout()
        return false
      }

      if (!response.ok) {
        throw new Error("Error updating appointment detail")
      }

      return true
    } catch (error) {
      console.error("Error:", error)
      return false
    }
  },
}))

export default useEditStore
