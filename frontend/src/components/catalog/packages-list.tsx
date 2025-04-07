"use client"

import { useState } from "react"
import type { Package } from "@/app/store/usePackageStore"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { ViewMydateDialog } from "@/app/catalog/view-package-dialog"
import MultiStepForm from "@/components/multistep/MultiStepForm"
import { useFormStore } from "@/app/store/formStore"
import useAuthStore from "@/app/store/useAuthStore"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { CategoryIcon, getCategoryGradient } from "./category-icon"
import { DialogTrigger } from "@/components/ui/dialog"

interface PackagesListProps {
  packages: Package[]
  onPackageSelect: (pkg: Package) => Promise<void>
  availability: Date[]
}

export function PackagesList({ packages, onPackageSelect, availability }: PackagesListProps) {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { resetForm, updateFormData } = useFormStore()
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Verificar que packages es un array y tiene elementos
  if (!Array.isArray(packages) || packages.length === 0) {
    return <div className="text-center py-12 text-gray-500">No hay paquetes con múltiples servicios disponibles</div>
  }

  const totalPages = Math.ceil(packages.length / itemsPerPage)
  const currentPackages = packages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleCardClick = (pkg: Package) => {
    setSelectedPackage(pkg)
    setIsDialogOpen(true)
  }

  const handlePackageSelect = async (pkg: Package) => {
    updateFormData("selectedPackage", pkg)
    await onPackageSelect(pkg)
  }

  // Función para determinar la categoría principal de un paquete
  const getMainCategory = (pkg: Package) => {
    if (!pkg.services || !Array.isArray(pkg.services) || pkg.services.length === 0) {
      return "default"
    }

    // Si hay una categoría que se repite más, usarla como principal
    const categories = pkg.services
      .filter((service) => service.category && service.category.name)
      .map((service) => service.category.name)

    if (categories.length === 0) return "default"

    // Contar ocurrencias de cada categoría
    const categoryCounts = categories.reduce(
      (acc, category) => {
        acc[category] = (acc[category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Encontrar la categoría con más ocurrencias
    let mainCategory = "default"
    let maxCount = 0

    for (const [category, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count
        mainCategory = category
      }
    }

    return mainCategory
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {currentPackages.map((pkg) => {
          // Determinar la categoría principal del paquete
          const mainCategory = getMainCategory(pkg)
          const gradientClass = getCategoryGradient(mainCategory)

          return (
            <Dialog key={pkg.id} open={isDialogOpen && selectedPackage?.id === pkg.id} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Card
                  className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg border-purple-100 hover:border-purple-300 cursor-pointer"
                  onClick={() => handleCardClick(pkg)}
                >
                  <div className={`h-48 bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
                    <div className="h-24 w-24 rounded-full bg-white/50 flex items-center justify-center">
                      <CategoryIcon category={mainCategory} size={48} />
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-purple-700">{pkg.name}</CardTitle>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">Paquete</Badge>
                    </div>
                    <CardDescription className="text-gray-600">{pkg.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700">${pkg.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-700">{pkg.duration} minutos</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Incluye:</h4>
                      <ul className="space-y-1">
                        {Array.isArray(pkg.services) &&
                          pkg.services.map((service) => (
                            <li key={service.id} className="flex items-center gap-2 text-sm">
                              <CategoryIcon category={service.category?.name || "default"} size={14} />
                              <span>{service.name}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-4">
                    <div onClick={(e) => e.stopPropagation()} className="w-full">
                      {hasPermission("read:mydate") && (
                        <MultiStepForm
                          availability={availability}
                          selectedPackage={pkg}
                          onClose={() => {
                            setSelectedPackage(null)
                            resetForm()
                          }}
                          onPackageSelect={() => handlePackageSelect(pkg)}
                        />
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </DialogTrigger>

              {selectedPackage && selectedPackage.id === pkg.id && <ViewMydateDialog _package={selectedPackage} />}
            </Dialog>
          )
        })}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink onClick={() => setCurrentPage(i + 1)} isActive={currentPage === i + 1}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  )
}

