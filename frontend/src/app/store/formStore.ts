import { toast } from 'sonner';
import { create } from 'zustand'
import { createJSONStorage, persist } from "zustand/middleware"
import useAuthStore from './useAuthStore';

interface FormData {
  step1: { date: Date, availableTimes: string[] }
  step2: { time: string }
  step3: { selectedPackage: string }
}

interface FormStore {
  currentStep: number
  formData: {
    step1: { date: Date; availableTimes: string[] }
    step2: { time: string }
    step3: { packageId: number }
  }
  setStep: (step: number) => void
  updateFormData: (step: string, data: any) => void
  isStepValid: (step: number) => boolean
  submitForm: () => Promise<void>
}

const token = useAuthStore.getState().token;

export const useFormStore = create<FormStore>()(
  // persist(
    (set, get) => ({
      currentStep: 1,
      formData: {
        step1: { date: new Date(), availableTimes: [] },
        step2: { time: "" },
        step3: { packageId: 0 },
      },
      setStep: (step) => set({ currentStep: step }),
      updateFormData: (step, data) =>
        set((state) => ({
          formData: { ...state.formData, [step]: { ...(state.formData[step as keyof FormData]), ...data } },
        })),
      isStepValid: (step) => {
        const { formData } = get()
        switch (step) {
          case 1:
            return !!formData.step1.date 
          case 2:
            return formData.step2.time.length > 0
          case 3:
            return true
          default:
            return false
        }
      },


    
      
      submitForm: async () => {
        const { formData } = get()
        const _package = (formData.step3.packageId).toString()
        const date = formData.step1.date
        const time = formData.step2.time

        console.log("time: ", time);

        // fusionamos date y time en un solo objeto
        const datetime = new Date(date)
        datetime.setHours(parseInt(time.split(":")[0]))
        datetime.setMinutes(parseInt(time.split(":")[1]))
        datetime.setSeconds(0)
        datetime.setMilliseconds(0)

        const datetimeStart = datetime.toISOString()

        console.log("Submitting form:", formData);
        
        console.log("Date:", datetimeStart);
        console.log("Package ID:", _package);

        console.log(JSON.stringify({ datetimeStart, package: _package }))

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment`,
            {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
            body: JSON.stringify({ datetimeStart, package: _package }),
          })
          console.log("response ", response);

          if (response.status === 403) {
            toast.error("Sesión expirada");
            useAuthStore.getState().logout();
            return;
        }

          if (response.ok) {
            toast.success("Turno agendado exitosamente 🎉");
          } else {
            toast.error("Error al agendar turno");
            throw new Error("Failed to submit form")
          }

        } catch (error) {
          console.error("Error submitting form:", error)
          // Handle error
        }
      },
    }),
  //   {
  //     name: "form-storage",
  //     storage: createJSONStorage(() => localStorage),
  //   },
  // ),
)

