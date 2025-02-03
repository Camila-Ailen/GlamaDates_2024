import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import useFormStore from '@/app/store/formStore';


const publicKey = process.env.NEXT_MERCADOPAGO_PUBLIC_KEY;

export const PaymentButton = () => {
    const preferenceId = useFormStore((state) => state.paymentURL);
    initMercadoPago('APP_USR-6ab17ac5-0375-4c53-83a8-c457e1ab9b2f');
    return (
        <Wallet initialization={{ preferenceId: preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />
    )
}


