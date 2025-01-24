import { toast } from 'sonner';
import { create } from 'zustand'
import { createJSONStorage, persist } from "zustand/middleware"

interface FormData {
  step1: { date: Date }
  step2: { time: string }
  step3: { interests: string[] }
}

interface FormStore {
  currentStep: number
  formData: FormData
  setStep: (step: number) => void
  updateFormData: (step: keyof FormData, data: Partial<FormData[keyof FormData]>) => void
  isStepValid: (step: number) => boolean
  submitForm: () => Promise<void>
}

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      formData: {
        step1: { date: new Date() },
        step2: { time: " " },
        step3: { interests: [] },
      },
      setStep: (step) => set({ currentStep: step }),
      updateFormData: (step, data) =>
        set((state) => ({
          formData: { ...state.formData, [step]: { ...state.formData[step], ...data } },
        })),
      isStepValid: (step) => {
        const { formData } = get()
        switch (step) {
          case 1:
            return !!formData.step1.date 
          case 2:
            return formData.step2.time.length > 0
          case 3:
            return formData.step3.interests.length > 0
          default:
            return false
        }
      },
      submitForm: async () => {
        const { formData } = get()
        console.log("Submitting form:", formData);
        toast.success("Turno agendado exitosamente 🎉");
        try {
          const response = await fetch("/api/submit-form", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          })
          if (!response.ok) throw new Error("Failed to submit form")
          // Handle successful submission
        } catch (error) {
          console.error("Error submitting form:", error)
          // Handle error
        }
      },
    }),
    {
      name: "form-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

