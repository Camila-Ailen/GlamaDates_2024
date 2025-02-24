import { create } from 'zustand';
import useAuthStore from './useAuthStore';
import { toast } from 'sonner';

interface EditStoreState {
    isAvailable: boolean | null;
    isOpen: boolean;
    appointment: number | null;
    datetimeOld: string | null;
    fetchRearrange: (data: { packageId: number; datetime: string }) => Promise<void>;
    rearrangeAppointment: (details: any) => Promise<void>;
    setAppointment: (appointmentId: number) => void;
    openDialog: () => void;
    closeDialog: () => void;
}

const token = useAuthStore.getState().token

export const useEditStore = create<EditStoreState>((set) => ({
    isAvailable: null,
    isOpen: false,
    appointment: null,
    datetimeOld: null,
    

    fetchRearrange: async (data) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/isAvailable?packageId=${data.packageId}&datetimeStart=${data.datetime}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },

            });

            if (response.status === 403) {
                console.error('Session expired');
                useAuthStore.getState().logout();
                return;
            }

            const result = await response.json();
            set({ isAvailable: result.available });
            set({ datetimeOld: data.datetime });
           
        } catch (error) {
            console.error('Error fetching rearrange availability:', error);
            set({ isAvailable: false });
        }
    },

    rearrangeAppointment: async (details) => {
        try {
            console.log('details', details)
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/rearrange/${details.id}`, {
            method: 'PATCH',
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(details)
          });
    
          if (!response.ok) {
            throw new Error('Failed to rearrange appointment');
          }
    
          const result = await response.json();
          toast.success('Turno modificado');
        //   set({ appointmentDetails: result.data });
        } catch (error) {
          console.error('Error rearranging appointment:', error);
          toast.error('Error rearranging appointment');
        }
      },

      setAppointment: (appointmentId: number) => set({ appointment: appointmentId }),


    openDialog: () => set({ isOpen: true }),
    closeDialog: () => set({ isOpen: false }),
}));

export default useEditStore;