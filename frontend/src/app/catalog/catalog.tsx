"use client"

import { useEffect, useState } from "react"
import useAuthStore from "../store/useAuthStore"
import usePackageStore from "../store/usePackageStore"
import { Separator } from "@/components/ui/separator"
import useAppointmentStore from "../store/useAppointmentStore"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import MultiStepForm from "@/components/multistep/MultiStepForm"
import type { Package } from "../store/usePackageStore"
import { useFormStore } from "../store/formStore"

const AppointmentCatalog = () => {
  const { packages, fetchPackage } = usePackageStore()

  const { fetchPackageAvailability } = useAppointmentStore()

  const [availability, setAvailability] = useState<Date[]>([])
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const { updateFormData, resetForm } = useFormStore()

  const handlePackageSelect = async (pkg: Package) => {
    const offset = 1
    const pageSize = 2000
    const orderBy = "id"
    const orderType = "DESC"
    setSelectedPackage(pkg)
    updateFormData("selectedPackage", pkg)
    const availabilityData = await fetchPackageAvailability(pkg.id, orderBy, orderType, offset, pageSize)
    if (availabilityData) {
      console.log("Desde catalogo de paquetes, el selectedPackage: ", pkg)

      setAvailability(availabilityData.map((date) => new Date(date)))
    }
  }

  useEffect(() => {
    fetchPackage()
  }, [fetchPackage])

  if (packages.length === 0) return <div>Cargando...</div>

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {packages.map((pkg) => (
          <div key={pkg.id} className="p-4 bg-muted/50 rounded-xl shadow-lg cursor-pointer hover:bg-muted transition">
            <Card>
              <CardHeader>
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>${pkg.price.toFixed(2)}</p>
                <p>{pkg.duration} minutos</p>
              </CardContent>
              <CardFooter>
                <MultiStepForm
                  availability={availability}
                  selectedPackage={pkg}
                  onClose={() => {
                    setSelectedPackage(null)
                    resetForm()
                  }}
                  onPackageSelect={() => handlePackageSelect(pkg)}
                />
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AppointmentCatalog

