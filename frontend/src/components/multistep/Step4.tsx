import type React from "react"
import { useFormStore } from "@/app/store/formStore"
import { Label } from "@/components/ui/label"
import { RadioGroup } from "@radix-ui/react-dropdown-menu"
import { Button } from "../ui/button"
import { CreditCard, Wallet } from "lucide-react"
import { PaymentButton } from "@/components/mercadopago/PaymentButton"
import Link from "next/link"

const Step4: React.FC = () => {
    const { formData, updateFormData } = useFormStore()

    const handlePaymentMethodChange = (value: string) => {
        updateFormData("step4", { paymentMethod: value })
    }
const baseURL = "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=";
const preferenceId = useFormStore((state) => state.paymentURL);
const fullURL = `${baseURL}${preferenceId}`;

    return (
        <div className="custom-dialog-content">
            <h2 className="custom-dialog-title">Paso 4: Elección de medio de pago</h2>
            <div className="flex flex-col space-y-4 mt-4">
                <p>Su turno ya ha sido reservado. Por favor, seleccione el medio de pago preferido:</p>
                <Button
                    onClick={() => handlePaymentMethodChange("local")}
                    variant={formData.step4?.paymentMethod === "efectivo" ? "default" : "outline"}
                    className="w-full justify-start"
                >
                    <Wallet className="mr-2 h-4 w-4" />
                    Pagar en el local
                </Button>
                <PaymentButton />
                <Link href={fullURL}>
                <Button
                    // onClick={() => handlePaymentMethodChange("mercadopago")}
                    variant={formData.step4?.paymentMethod === "mercadopago" ? "default" : "outline"}
                    className="w-full justify-start"
                >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pagar con Mercado Pago
                    </Button>
                </Link>
            </div>
        </div>
    )
}

export default Step4

