import { toast } from "sonner"
import { create } from "zustand"
import useAuthStore from "./useAuthStore"
import type { Package } from "./usePackageStore"

interface FormData {
  step1: { date: Date | null; availableTimes: string[] }
  step2: { time: string }
  step3: { packageId: number }
  step4: { paymentMethod: string }
  selectedPackage: Package | null
}

interface FormStore {
  currentStep: number
  formData: FormData
  setStep: (step: number) => void
  updateFormData: (step: keyof FormData | "selectedPackage", data: Partial<FormData[keyof FormData]> | Package) => void
  isStepValid: (step: number) => boolean
  submitForm: () => Promise<void>
  resetForm: () => void
  isOpen: boolean
  openForm: () => void
  closeForm: () => void
}

const token = useAuthStore.getState().token

export const useFormStore = create<FormStore>()((set, get) => ({
  currentStep: 1,
  formData: {
    step1: { date: null, availableTimes: [] },
    step2: { time: "" },
    step3: { packageId: 0 },
    step4: { paymentMethod: "" },
    selectedPackage: null,
  },
  
  setStep: (step) => set({ currentStep: step }),
  
  updateFormData: (step, data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [step]: { ...state.formData[step], ...data },
        ...(step === "selectedPackage" ? { selectedPackage: data as Package } : {}),
      },
    })),
  
    isStepValid: (step) => {
    const { formData } = get()
    switch (step) {
      case 1:
        return formData.step1.date !== null && formData.step1.availableTimes.length > 0
      case 2:
        return formData.step2.time !== ""
      case 3:
        return true
      case 4:
        return formData.step4.paymentMethod !== ""
      default:
        return false
    }
  },
  submitForm: async () => {
    const convertTo24HourFormat = (time: string) => {
      const [timePart, modifier] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
    
      if (modifier.replace(/\s+/g, '').trim() === 'p.m.') {
        hours += 12;
      } 
      return { hours, minutes };
    };

    const { formData } = get()
    const _package = formData.step3.packageId.toString()
    const date = formData.step1.date
    const time = formData.step2.time

    // const paymentMethod = formData.step4.paymentMethod

    if (!date) {
      throw new Error("Date is null")
    }
    const { hours, minutes } = convertTo24HourFormat(time);
    const datetime = new Date(date)
    datetime.setHours(hours)
    datetime.setMinutes(minutes)
    datetime.setSeconds(0)
    datetime.setMilliseconds(0)

    const datetimeStart = datetime.toISOString()


    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ datetimeStart, package: _package }),
      })

      if (response.status === 403) {
        toast.error("Sesión expirada")
        useAuthStore.getState().logout()
        return
      }

      if (response.ok) {
        toast.success("Turno agendado exitosamente 🎉")
      } else {
        toast.error("Error al agendar turno")
        throw new Error("Failed to submit form")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      // Handle error
    }
  },
  
  resetForm: () =>
    set({
      currentStep: 1,
      formData: {
        step1: { date: null, availableTimes: [] },
        step2: { time: "" },
        step3: { packageId: 0 },
        step4: { paymentMethod: "" },
        selectedPackage: null,
      },
    }),
  isOpen: false,
  
  openForm: () => set({ isOpen: true }),
  
  closeForm: () => {
    set({ isOpen: false })
    get().resetForm()
  },
}))

export default useFormStore

