"use client"

import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import { CreditCard, Wallet, CheckCircle, ArrowRight } from "lucide-react"
import { PaymentButton } from "@/components/mercadopago/PaymentButton"
import Link from "next/link"
import { Card } from "../ui/card"

const Step4: React.FC = () => {
  const { formData, closeForm, resetForm } = useFormStore()

  const handlePayCash = async () => {
    closeForm()
    resetForm()
  }

  const baseURL = "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id="
  const preferenceId = useFormStore((state) => state.paymentURL)
  const fullURL = `${baseURL}${preferenceId}`

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center gap-2 mb-4">
        <CreditCard className="h-5 w-5 text-pink-600" />
        <h3 className="text-lg font-medium text-gray-800">Elija su método de pago</h3>
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6 flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-green-800 font-medium">¡Su turno ha sido reservado con éxito!</p>
          <p className="text-green-700 text-sm mt-1">Por favor, seleccione cómo desea realizar el pago:</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="border-pink-100 overflow-hidden transition-all duration-200 hover:shadow-md">
          <button onClick={handlePayCash} className="w-full text-left">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 flex items-center justify-center w-16">
                <Wallet className="h-6 w-6 text-pink-600" />
              </div>

              <div className="flex-1 p-4">
                <h4 className="font-medium text-gray-800">Pagar en el local</h4>
                <p className="text-sm text-gray-500 mt-1">Realice el pago cuando llegue a su cita</p>
              </div>

              <div className="pr-4">
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </button>
        </Card>

        {/* <PaymentButton /> */}

        <Link href={fullURL} className="block">
          <Card className="border-blue-100 overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 flex items-center justify-center w-16">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>

              <div className="flex-1 p-4">
                <h4 className="font-medium text-gray-800">Pagar con Mercado Pago</h4>
                <p className="text-sm text-gray-500 mt-1">Pague ahora con tarjeta, transferencia o efectivo</p>
              </div>

              <div className="pr-4">
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </Card>
        </Link>
        
      </div>
    </div>
  )
}

export default Step4

