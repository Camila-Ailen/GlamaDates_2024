"use client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { LogIn } from "lucide-react";
import { useState } from "react";
import useAuthStore from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      if (user.role === "ADMIN" || user.role === "SECRETARIO") {
        router.push("/dashboard");
      } else if (user.role === "CLIENTE") {
        router.push("/catalog");
      } else if (user.role === "PROFESIONAL") {
        router.push("/myCalendar");
      } else {
        router.push("/catalog");
      }
      // router.push("/catalog");
    } catch (err) {
      setError("Error de autenticación. Por favor, intente de nuevo.");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/fondo2.jpg)" }}
    >
      <Card className="z-20 mx-auto max-w-sm backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <CardHeader>
          <div className="flex flex-row">
            {/* <Image
              src="/logo.webp"
              alt="Image"
              width="128"
              height="128"
              className="h-12 w-12 dark:brightness-[1.4]"
            /> */}
            <h1 className="text-5xl font-bold">
              <span className="text-primary">GLAMA</span>{" "}
              DATES
            </h1>
          </div>
          <CardTitle className="text-2xl">Inicio de sesión</CardTitle>
          <CardDescription>
            Completa tus datos para ingresar a tu cuenta:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/"
                  className="ml-auto inline-block text-sm underline"
                >
                  Olvidé mi contraseña
                </Link>
              </div>

              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {/*recordarme*/}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember-me"
                name="remember-me"
                className="rounded"
              />
              <Label htmlFor="remember-me">Recordarme</Label>
            </div>
            {error && <p className="text-red-500">{error}</p>}

            <Button type="submit" className="w-full">
              Ingresar
              <LogIn />
            </Button>
            <div className="mt-4 text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-primary underline">
                Regístrate aquí
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
