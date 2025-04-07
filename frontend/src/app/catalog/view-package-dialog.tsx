"use client"

import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, Scissors } from "lucide-react"
import { CategoryIcon, getCategoryGradient } from "@/components/catalog/category-icon"

export function ViewMydateDialog({ _package }) {
  // Determinar la categoría principal del paquete
  const getMainCategory = () => {
    if (!_package.services || !Array.isArray(_package.services) || _package.services.length === 0) {
      return "default"
    }

    // Si hay una categoría que se repite más, usarla como principal
    const categories = _package.services
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

  const mainCategory = getMainCategory()

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <Badge className="mb-2 bg-pink-100 text-pink-700 border-pink-200">Paquete #{_package.id}</Badge>
            <DialogTitle className="text-2xl font-bold text-pink-700">{_package.name.toUpperCase()}</DialogTitle>
          </div>
          <div className="h-16 w-16 rounded-full bg-pink-100 flex items-center justify-center">
            <CategoryIcon category={mainCategory} size={32} />
          </div>
        </div>
        <p className="mt-2 text-gray-600 italic">{_package.description}</p>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-green-700">Precio total</p>
              <p className="text-xl font-bold text-green-800">${_package.price?.toFixed(2) || "0.00"}</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">Duración total</p>
              <p className="text-xl font-bold text-blue-800">{_package.duration || 0} minutos</p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Scissors className="h-5 w-5 text-pink-600" />
          Servicios incluidos
        </h3>

        <div className="space-y-4">
          {_package &&
            Array.isArray(_package.services) &&
            _package.services.map((service, index) => {
              const categoryName = service.category?.name || "default"
              const gradientClass = getCategoryGradient(categoryName)

              return (
                <Card
                  key={index}
                  className="overflow-hidden border-l-4 border-l-pink-400 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className={`bg-gradient-to-r ${gradientClass} p-4 flex items-center justify-center md:w-1/4`}>
                      <div className="h-12 w-12 rounded-full bg-white/50 flex items-center justify-center">
                        <CategoryIcon category={categoryName} size={24} />
                      </div>
                    </div>

                    <div className="flex-1">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-pink-700">{service.name}</CardTitle>
                          <Badge variant="outline" className="bg-pink-50 text-pink-700">
                            {service.category?.name || "Servicio"}
                          </Badge>
                        </div>
                        <CardDescription className="text-gray-600">{service.description}</CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-green-700 font-medium">${service.price?.toFixed(2) || "0.00"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-blue-700">{service.duration || 0} minutos</span>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              )
            })}
        </div>
      </div>
    </DialogContent>
  )
}

