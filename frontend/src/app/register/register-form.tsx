"use client"
import Link from "next/link"
import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useUserStore from "@/app/store/useUserStore"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthdate: "",
    gender: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const createUser = useUserStore((state) => state.createUser)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Check password match when either password field changes
    if (name === "password" || name === "confirmPassword") {
      if (name === "confirmPassword") {
        setPasswordMatch(formData.password === value)
      } else {
        setPasswordMatch(value === formData.confirmPassword || formData.confirmPassword === "")
      }
    }
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setPasswordMatch(false)
      return
    }

    // Validate birth date is not in the future
    if (formData.birthdate && new Date(formData.birthdate) > new Date()) {
      setError("La fecha de nacimiento no puede ser posterior a hoy")
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare user data for API
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        // Include optional fields only if they have values
        ...(formData.birthdate && { birthDate: formData.birthdate }),
        ...(formData.gender && { gender: formData.gender }),
        ...(formData.phone && { phone: formData.phone }),
      }

      await createUser(userData)
      toast.success("Registro exitoso. Ahora puedes iniciar sesión.")
      router.push("/login") // Redirect to login after successful registration
    } catch (err) {
      // Error is already handled by toast in the store
      setError("Error al registrar usuario. Por favor, intente de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/fondo2.jpg)" }}
    >
      <Card className="z-20 mx-auto max-w-md backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <CardHeader>
          <div className="flex flex-row">
            <h1 className="text-5xl font-bold">
              <span className="text-primary">GLAMA</span> DATES
            </h1>
          </div>
          <CardTitle className="text-2xl">Registro de usuario</CardTitle>
          <CardDescription>Completa tus datos para crear una cuenta:</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento (opcional)</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthdate}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
              />
              {formData.birthdate && new Date(formData.birthdate) > new Date() && (
                <p className="text-red-500 text-sm">La fecha no puede ser posterior a hoy</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gender">Género (opcional)</Label>
              <Select onValueChange={handleSelectChange} value={formData.gender}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Selecciona tu género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                  <SelectItem value="prefiero-no-decir">Prefiero no decir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Celular (opcional)</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={!passwordMatch ? "border-red-500" : ""}
              />
              {!passwordMatch && <p className="text-red-500 text-sm">Las contraseñas no coinciden</p>}
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrarse"}
              {!isSubmitting && <UserPlus className="ml-2" />}
            </Button>

            <div className="text-center text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary underline">
                Iniciar sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
