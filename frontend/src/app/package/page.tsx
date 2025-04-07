import { Suspense } from "react"
import { PackagesTable } from "./packages-table"
import { Package } from "lucide-react"

export default function PackagesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Paquetes</h1>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <Package className="h-8 w-8 text-purple-300" />
              <p className="text-purple-600">Cargando paquetes...</p>
            </div>
          </div>
        }
      >
        <PackagesTable />
      </Suspense>
    </div>
  )
}

