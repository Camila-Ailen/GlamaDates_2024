import { Suspense } from "react"
import { ServicesTable } from "./services-table"
import { Scissors } from "lucide-react"

export default function ServicesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-6">
        <Scissors className="h-6 w-6 text-pink-600" />
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Servicios</h1>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <Scissors className="h-8 w-8 text-pink-300" />
              <p className="text-pink-600">Cargando servicios...</p>
            </div>
          </div>
        }
      >
        <ServicesTable />
      </Suspense>
    </div>
  )
}

