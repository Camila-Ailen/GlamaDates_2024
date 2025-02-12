"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { usePaymentStore } from "../store/usePaymentStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PaymentRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setPaymentData } = usePaymentStore()
  const [message, setMessage] = useState("Procesando pago...")

  useEffect(() => {
    const paymentId = searchParams.get("payment_id")
    const status = searchParams.get("status")
    const paymentUrl = searchParams.get("preference_id")

    console.log("Payment data:", { paymentId, status })

    if (paymentId && status === "approved") {
      // setPaymentData(paymentId, Number.parseFloat(amount))
      setMessage("¡Pago exitoso! Redirigiendo...")

      // Aquí deberías hacer la llamada a tu API para guardar los datos
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/save-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, paymentUrl }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Payment saved:", data)
          setTimeout(() => router.push("/myDate"), 3000)
        })
        .catch((error) => {
          console.error("Error saving payment:", error)
          setMessage("Hubo un error al procesar el pago. Contacte al soporte.")
        })
    } else {
      setMessage("Pago no aprobado o datos incompletos.")
    }
  }, [searchParams, setPaymentData, router])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado del Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{message}</p>
      </CardContent>
    </Card>
  )
}

