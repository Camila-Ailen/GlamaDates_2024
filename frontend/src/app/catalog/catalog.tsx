"use client"

import { use, useEffect, useState } from "react"
import useAuthStore from "../store/useAuthStore"
import usePackageStore from "../store/usePackageStore"
import { Separator } from "@/components/ui/separator"
import useAppointmentStore from "../store/useAppointmentStore"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import MultiStepForm from "@/components/multistep/MultiStepForm"
import type { Package } from "../store/usePackageStore"
import { useFormStore } from "../store/formStore"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"


// export function AppointmentCatalog() {
  const AppointmentCatalog = () => {

  const {
    packages,
    total,
    currentPage,
    pageSize,
    isLoading,
    error,
    orderBy,
    orderType,
    filter,
    fetchPackage,
    setOrderBy,
    setOrderType,
    setFilter
  } = usePackageStore()

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

  const token = useAuthStore((state) => state.token);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  useEffect(() => {
    if (token) {
      fetchPackage()
    }
  }, [fetchPackage, token, orderBy, orderType, filter])

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  const totalPages = Math.ceil(total / pageSize)

  const handleSort = (field: string) => {
    if (field === orderBy) {
      setOrderType(orderType === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setOrderBy(field)
      setOrderType('ASC')
    }
  }

  if (packages.length === 0) {
    return (
      <div>No hay paquetes disponibles</div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-3xl font-bold text-center text-pink-700 mb-6">Catalogo de Paquetes y Servicios</h1>
      <div className="flex flex-wrap justify-center gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="p-6 bg-pink-100 rounded-2xl shadow-lg cursor-pointer hover:bg-pink-200 transition" style={{ minWidth: '250px', minHeight: '250px' }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-pink-700">
                  {pkg.name.toUpperCase()}
                </CardTitle>
                <CardDescription className="text-pink-500">
                  {pkg.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>${pkg.price.toFixed(2)}</p>
                <p>{pkg.duration} minutos</p>
                <p>Servicios:</p>
                <ul className="list-disc list-inside text-pink-500">
                  {pkg.services.map((service) => (
                    <li key={service.id}>
                      {service.name.toUpperCase()}
                    </li>
                  ))}
                </ul>
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
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                fetchPackage(Math.max(currentPage - 1, 1), token || undefined)
              }
            />
          </PaginationItem>
          {totalPages > 6 ? (
            <>
              <PaginationItem></PaginationItem>
              {currentPage > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              {[...Array(totalPages)]
                .map((_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2))
                .map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => fetchPackage(page, token || undefined)}
                      isActive={currentPage === page}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              {currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

            </>
          ) : (
            [...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => fetchPackage(i + 1, token || undefined)}
                  isActive={currentPage === i + 1}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                fetchPackage(
                  Math.min(currentPage + 1, totalPages),
                  token || undefined)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

    </div>
  )

}
export default AppointmentCatalog





























// const AppointmentCatalog = () => {
//   const { packages, fetchPackage } = usePackageStore()

//   const { fetchPackageAvailability } = useAppointmentStore()

//   const [availability, setAvailability] = useState<Date[]>([])
//   const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
//   const { updateFormData, resetForm } = useFormStore()

//   const handlePackageSelect = async (pkg: Package) => {
//     const offset = 1
//     const pageSize = 2000
//     const orderBy = "id"
//     const orderType = "DESC"
//     setSelectedPackage(pkg)
//     updateFormData("selectedPackage", pkg)
//     const availabilityData = await fetchPackageAvailability(pkg.id, orderBy, orderType, offset, pageSize)
//     if (availabilityData) {
//       console.log("Desde catalogo de paquetes, el selectedPackage: ", pkg)

//       setAvailability(availabilityData.map((date) => new Date(date)))
//     }
//   } 

//   useEffect(() => {
//     fetchPackage()
//   }, [fetchPackage])

//   if (packages.length === 0) return <div>Cargando...</div>

//   return (
//     <div className="flex flex-1 flex-col gap-4 p-4">
//       <div className="grid auto-rows-min gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
//         {packages.map((pkg) => (
//           <div key={pkg.id} className="p-4 bg-muted/50 rounded-xl shadow-lg cursor-pointer hover:bg-muted transition">
//             <Card>
//               <CardHeader>
//                 <CardTitle>{pkg.name}</CardTitle>
//                 <CardDescription>{pkg.description}</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <p>${pkg.price.toFixed(2)}</p>
//                 <p>{pkg.duration} minutos</p>
//               </CardContent>
//               <CardFooter>
//                 <MultiStepForm
//                   availability={availability}
//                   selectedPackage={pkg}
//                   onClose={() => {
//                     setSelectedPackage(null)
//                     resetForm()
//                   }}
//                   onPackageSelect={() => handlePackageSelect(pkg)}
//                 />
//               </CardFooter>
//             </Card>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default AppointmentCatalog

