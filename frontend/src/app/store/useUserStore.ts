import { toast } from "sonner";
import { create } from "zustand";
import useAuthStore from "./useAuthStore";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  branchOfficeId: number | null;
  role: {
    id: number;
    role: string;
    description: string;
    permissions: Array<{
      id: number;
      permission: string;
      description: string | null;
    }>;
  };
}

interface UserState {
  users: User[];
  total: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  orderBy: string;
  orderType: "ASC" | "DESC";
  filter: string;
  fetchUsers: (page?: number, token?: string) => Promise<void>;
  createUser: (userData: Partial<User>) => Promise<void>;
  fetchEmployees: (page?: number) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  setOrderBy: (field: string) => void;
  setOrderType: (type: "ASC" | "DESC") => void;
  setFilter: (filter: string) => void;
}

const token = useAuthStore.getState().token;

const useUserStore = create<UserState>((set, get) => ({
  users: [],
  total: 0,
  currentPage: 1,
  pageSize: 8,
  isLoading: false,
  error: null,
  orderBy: "id",
  orderType: "DESC",
  filter: "",

  fetchUsers: async (page?: number) => {
    const { pageSize, orderBy, orderType, filter } = get();
    const currentPage = page || get().currentPage;
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/users?orderBy=${orderBy}&orderType=${orderType}&offset=${
          (currentPage - 1) * pageSize
        }&pageSize=${pageSize}&filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status === 403) {
        toast.error("Sesión expirada");
        useAuthStore.getState().logout();
        return;
      }

      if (!response.ok) throw new Error("Error al obtener usuarios");
      const data = await response.json();
      set({
        users: data.data.results,
        total: data.data.total,
        currentPage,
        isLoading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchEmployees: async (page?: number) => {
    const { pageSize, orderBy, orderType, filter } = get();
    const currentPage = page || get().currentPage;
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/users/employees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status === 403) {
        toast.error("Sesión expirada");
        useAuthStore.getState().logout();
        return;
      }

      if (!response.ok) throw new Error("Error al obtener empleados");
      const data = await response.json();
      console.log("Data de empleados:", data);
      set({
        users: data.data,
        total: data.data.length,
        isLoading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      console.log("userData", userData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        },
      );
      if (response.status === 403) {
        toast.error("Sesión expirada");
        useAuthStore.getState().logout();
        return;
      }

      if (response.status === 409) {
        toast.error("El usuario ya existe");
        throw new Error("El usuario ya existe");
      }

      if (!response.ok) toast.error("Error al crear usuario");
      console.log(response);
      toast.success("Registro exitoso. Ahora puedes iniciar sesión.")
      await get().fetchUsers(undefined);
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        },
      );
      if (response.status === 403) {
        toast.error("Sesión expirada");
        useAuthStore.getState().logout();
        return;
      }

      if (!response.ok) throw new Error("Error al actualizar usuario");
      await get().fetchUsers(undefined);
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status === 403) {
        toast.error("Sesión expirada");
        useAuthStore.getState().logout();
        return;
      }

      if (!response.ok) throw new Error("Error al eliminar usuario");
      await get().fetchUsers(undefined);
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setOrderBy: (field) => set({ orderBy: field }),
  setOrderType: (type) => set({ orderType: type }),
  setFilter: (filter) => set({ filter }),
}));

export default useUserStore;
