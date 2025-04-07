"use client"

import { useState } from "react"
import type { Package } from "@/app/store/usePackageStore"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
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

interface ServicesListProps {
  services: Package[]
  onPackageSelect: (pkg: Package) => Promise<void>
  availability: Date[]
}

export function ServicesList({ services, onPackageSelect, availability }: ServicesListProps) {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { resetForm, updateFormData } = useFormStore()
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Verificar que services es un array y tiene elementos
  if (!Array.isArray(services) || services.length === 0) {
    return <div className="text-center py-12 text-gray-500">No hay servicios individuales disponibles</div>
  }

  const totalPages = Math.ceil(services.length / itemsPerPage)
  const currentServices = services.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleCardClick = (pkg: Package) => {
    setSelectedPackage(pkg)
    setIsDialogOpen(true)
  }

  const handlePackageSelect = async (pkg: Package) => {
    updateFormData("selectedPackage", pkg)
    await onPackageSelect(pkg)
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentServices.map((service) => {
          // Determinar la categoría del servicio
          const categoryName = service.services?.[0]?.category?.name || "default"
          const gradientClass = getCategoryGradient(categoryName)

          return (
            <Dialog
              key={service.id}
              open={isDialogOpen && selectedPackage?.id === service.id}
              onOpenChange={setIsDialogOpen}
            >
              <DialogTrigger asChild>
                <Card
                  className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg border-pink-100 hover:border-pink-300 cursor-pointer"
                  onClick={() => handleCardClick(service)}
                >
                  <div className={`h-40 bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
                    <div className="h-20 w-20 rounded-full bg-white/50 flex items-center justify-center">
                      <CategoryIcon category={categoryName} size={40} />
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-pink-700">{service.name}</CardTitle>
                      <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                        {categoryName !== "default" ? categoryName : "Servicio"}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-600 line-clamp-2">{service.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700">${service.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-700">{service.duration} minutos</span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-4">
                    <div onClick={(e) => e.stopPropagation()} className="w-full">
                      {hasPermission("read:mydate") && (
                        <MultiStepForm
                          availability={availability}
                          selectedPackage={service}
                          onClose={() => {
                            setSelectedPackage(null)
                            resetForm()
                          }}
                          onPackageSelect={() => handlePackageSelect(service)}
                        />
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </DialogTrigger>

              {selectedPackage && selectedPackage.id === service.id && <ViewMydateDialog _package={selectedPackage} />}
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

