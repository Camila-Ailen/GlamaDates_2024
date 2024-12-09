"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/store/useAuthStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function ProtectedRoute({
  children,
  requiredPermission,
}: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (
      !isLoading &&
      requiredPermission &&
      !hasPermission(requiredPermission)
    ) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, hasPermission, requiredPermission, router, isLoading]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (
    !isAuthenticated ||
    (requiredPermission && !hasPermission(requiredPermission))
  ) {
    return null;
  }

  return <>{children}</>;
}
