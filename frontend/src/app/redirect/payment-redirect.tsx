"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { usePaymentStore } from "../store/usePaymentStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function PaymentRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setPaymentData } = usePaymentStore()
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing")
  const [message, setMessage] = useState("Procesando pago...")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const paymentId = searchParams.get("payment_id")
    const paymentStatus = searchParams.get("status")
    const paymentUrl = searchParams.get("preference_id")

    console.log("Payment data:", { paymentId, paymentStatus })

    if (paymentId && paymentStatus === "approved") {
      // setPaymentData(paymentId, Number.parseFloat(amount))
      setStatus("success")
      setMessage("¡Pago exitoso! Redirigiendo...")

      // Aquí deberías hacer la llamada a tu API para guardar los datos
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/save-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, paymentUrl }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Iniciar la animación de progreso
          const startTime = Date.now()
          const duration = 3000 // 3 segundos

          const updateProgress = () => {
            const elapsed = Date.now() - startTime
            const newProgress = Math.min(100, (elapsed / duration) * 100)
            setProgress(newProgress)

            if (newProgress < 100) {
              requestAnimationFrame(updateProgress)
            } else {
              router.push("/myDate")
            }
          }

          requestAnimationFrame(updateProgress)
        })
        .catch((error) => {
          console.error("Error saving payment:", error)
          setStatus("error")
          setMessage("Hubo un error al procesar el pago. Contacte al soporte.")
        })
    } else {
      setStatus("error")
      setMessage("Pago no aprobado o datos incompletos.")
    }
  }, [searchParams, setPaymentData, router])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader
        className={`
        ${status === "success" ? "bg-green-50" : ""} 
        ${status === "error" ? "bg-red-50" : ""}
        rounded-t-lg
      `}
      >
        <CardTitle className="flex items-center justify-center text-xl">
          {status === "processing" && <Loader2 className="h-8 w-8 text-blue-500 mr-2 animate-spin" />}
          {status === "success" && <CheckCircle className="h-8 w-8 text-green-500 mr-2" />}
          {status === "error" && <AlertCircle className="h-8 w-8 text-red-500 mr-2" />}
          Estado del Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        <div className="flex flex-col items-center justify-center text-center">
          <div
            className={`
            text-2xl font-semibold mb-4
            ${status === "success" ? "text-green-600" : ""} 
            ${status === "error" ? "text-red-600" : ""}
            ${status === "processing" ? "text-blue-600" : ""}
          `}
          >
            {message}
          </div>

          {status === "success" && (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-75"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-pulse"></div>
                  <CheckCircle className="h-12 w-12 text-green-500 z-10" />
                </div>
              </div>

              <div className="space-y-2 w-full">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Redirigiendo a Mis Citas</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex items-center justify-center text-sm text-muted-foreground animate-pulse">
                <span>Redirigiendo</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-2">
              <p className="text-sm text-red-700">
                Si crees que esto es un error, por favor contacta a soporte técnico o verifica el estado de tu pago en
                tu cuenta.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
