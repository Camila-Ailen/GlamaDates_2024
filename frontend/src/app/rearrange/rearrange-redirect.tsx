"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEditStore } from "../store/useEditStore"

export function RearrangeRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { fetchRearrange, isAvailable, openDialog } = useEditStore()

  useEffect(() => {
    const datetime = searchParams.get("datetime")
    const packageId = searchParams.get("packageId")
    const appointmentId = searchParams.get("appointmentId")

    if (datetime && packageId) {
      fetchRearrange({ packageId: Number(packageId), datetime })
    }
  }, [searchParams, fetchRearrange])

  useEffect(() => {
    if (isAvailable !== null) {
      console.log("isAvailable", isAvailable)
      openDialog()
      router.push("/myDate")
    }
  }, [isAvailable, router, openDialog])

  return (
    <p>Redirigiendo...</p>
  )
}