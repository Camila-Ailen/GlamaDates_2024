"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useAuthStore from "@/app/store/useAuthStore"
import usePackageStore from "@/app/store/usePackageStore"
import useAppointmentStore from "@/app/store/useAppointmentStore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServicesList } from "@/components/catalog/services-list"
import { PackagesList } from "@/components/catalog/packages-list"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import type { Package } from "@/app/store/usePackageStore"

export default function CatalogPage() {
  const { packages, total, currentPage, pageSize, isLoading, error, fetchPackage } = usePackageStore()
  const { fetchPackageAvailability } = useAppointmentStore()
  const { token, user } = useAuthStore()
  const router = useRouter()

  const [availability, setAvailability] = useState<Date[]>([])
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [activeTab, setActiveTab] = useState("services")

  // Separar servicios individuales de paquetes
  const singleServices = packages.filter((pkg) => Array.isArray(pkg.services) && pkg.services.length === 1)
  const multiServices = packages.filter((pkg) => Array.isArray(pkg.services) && pkg.services.length > 1)

  const handlePackageSelect = async (pkg: Package) => {
    const offset = 1
    const pageSize = 2000
    const orderBy = "id"
    const orderType = "DESC"

    setSelectedPackage(pkg)

    const availabilityData = await fetchPackageAvailability(pkg.id, orderBy, orderType, offset, pageSize)

    if (availabilityData) {
      setAvailability(availabilityData.map((date) => new Date(date)))
    }
  }

  const handleLoginClick = () => {
    // Redirigir al usuario a la página de login con la URL actual como callback
    router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
  }

  useEffect(() => {
    fetchPackage()
  }, [fetchPackage])

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-pink-600 text-xl">Cargando...</div>
      </div>
    )

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )

  if (packages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">No hay paquetes disponibles</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner de inicio de sesión si el usuario no está autenticado */}
      {!token && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 mb-8 rounded-lg border border-pink-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <h3 className="text-lg font-medium text-pink-700">¿Quieres reservar un turno?</h3>
              <p className="text-gray-600">Inicia sesión para acceder a todas las funcionalidades de reserva.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleLoginClick} className="bg-pink-600 hover:bg-pink-700">
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar sesión
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/register")}
                className="border-pink-200 text-pink-700 hover:bg-pink-50"
              >
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-pink-700 mb-2">Nuestros Servicios</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Descubre nuestra amplia gama de servicios y paquetes diseñados para realzar tu belleza natural y brindarte una
          experiencia de relajación única.
        </p>
      </div>

      <Tabs defaultValue="services" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="services" className="text-lg">
              Servicios ({singleServices.length})
            </TabsTrigger>
            <TabsTrigger value="packages" className="text-lg">
              Paquetes ({multiServices.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="services" className="mt-6">
          {singleServices.length > 0 ? (
            <ServicesList services={singleServices} onPackageSelect={handlePackageSelect} availability={availability} />
          ) : (
            <div className="text-center py-12 text-gray-500">No hay servicios individuales disponibles</div>
          )}
        </TabsContent>

        <TabsContent value="packages" className="mt-6">
          {multiServices.length > 0 ? (
            <PackagesList packages={multiServices} onPackageSelect={handlePackageSelect} availability={availability} />
          ) : (
            <div className="text-center py-12 text-gray-500">No hay paquetes con múltiples servicios disponibles</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Botón flotante para iniciar sesión en dispositivos móviles */}
      {!token && (
        <div className="fixed bottom-6 right-6 md:hidden">
          <Button onClick={handleLoginClick} size="lg" className="rounded-full shadow-lg bg-pink-600 hover:bg-pink-700">
            <LogIn className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
