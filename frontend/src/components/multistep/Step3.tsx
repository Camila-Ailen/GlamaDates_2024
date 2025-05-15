"use client"

import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import { useEffect } from "react"
import type { Package } from "@/app/store/usePackageStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Calendar, Clock, CreditCard, CheckCircle, Scissors, Percent } from "lucide-react"
import { Separator } from "../ui/separator"
import { Switch } from "../ui/switch"
import { CategoryIcon, getCategoryGradient } from "../catalog/category-icon"
import { useSystemConfigStore } from "@/app/store/usePreferencesStore"

interface Step3Props {
  selectedPackage: Package
}

const Step3: React.FC<{ selectedPackage: Package }> = ({ selectedPackage }) => {
  const { formData, updateFormData } = useFormStore()
  const {
    config,
    isLoading,
    error,
    fetchConfig,
  } = useSystemConfigStore()

  useEffect(() => {
    if (!config && !isLoading) {
      fetchConfig()
    }
  }, [config, fetchConfig, isLoading])

  const discountMap: { [key: number]: number } = {
    1: config?.descountFull || 0,
    2: config?.descountPartial || 0,
  }

  const price = selectedPackage.services.reduce((acc, service) => acc + service.price, 0)
  const discountAmount = formData.discount !== null ? (price * discountMap[formData.discount]) / 100 : 0
  const finalPrice = price - discountAmount

  useEffect(() => {
    if (selectedPackage && selectedPackage.id) {
      updateFormData("step3", { packageId: selectedPackage.id })
    }
  }, [selectedPackage, updateFormData])

  const handleNotificationChange = (checked: boolean) => {
    updateFormData("step3", { advance: checked })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center gap-2 mb-4">
        <CheckCircle className="h-5 w-5 text-pink-600" />
        <h3 className="text-lg font-medium text-gray-800">Confirme los detalles de su cita</h3>
      </div>

      <Card className="border-pink-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 pb-4">
          <CardTitle className="text-pink-700">{selectedPackage.name}</CardTitle>
          <CardDescription>{selectedPackage.description}</CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-blue-500">Fecha y hora</p>
                <p className="text-sm font-medium text-blue-700">
                  {formData.step1.date
                    ? formData.step1.date.toLocaleDateString("es-AR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })
                    : "Fecha no seleccionada"}{" "}
                  a las {formData.step2.time || "Hora no seleccionada"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
              <CreditCard className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-green-500">Precio final</p>
                <p className="text-sm font-medium text-green-700">${finalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {formData.discount !== null && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <Percent className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-amber-500">Descuento aplicado</p>
                <p className="text-sm font-medium text-amber-700">
                  ${discountAmount.toFixed(2)} ({discountMap[formData.discount]}%)
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700">Recibir avisos para adelantar el turno</span>
            </div>
            <Switch checked={formData.step3.advance || false} onCheckedChange={handleNotificationChange} />
          </div>

          <Separator className="my-3" />

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
              <Scissors className="h-4 w-4 text-pink-600" />
              Servicios incluidos
            </h4>

            <div className="space-y-3">
              {selectedPackage &&
                Array.isArray(selectedPackage.services) &&
                selectedPackage.services.map((service, index) => {
                  const categoryName = service.category?.name || "default"
                  const gradientClass = getCategoryGradient(categoryName)

                  return (
                    <Card
                      key={index}
                      className="overflow-hidden border-l-4 border-l-pink-400 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <div
                          className={`bg-gradient-to-r ${gradientClass} p-3 flex items-center justify-center w-12 h-full`}
                        >
                          <CategoryIcon category={categoryName} size={20} />
                        </div>

                        <div className="flex-1 p-3">
                          <div className="flex justify-between items-start">
                            <h5 className="font-medium text-gray-800">{service.name}</h5>
                            <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-100">
                              {service.category?.name || "Servicio"}
                            </Badge>
                          </div>

                          <p className="text-xs text-gray-500 mt-1">{service.description}</p>

                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600">{service.duration} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600">${service.price?.toFixed(2) || "0.00"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Step3

