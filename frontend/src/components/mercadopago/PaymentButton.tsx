import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import useFormStore from '@/app/store/formStore';
import { usePaymentStore } from '@/app/store/usePaymentStore';


const publicKey = process.env.NEXT_MERCADOPAGO_PUBLIC_KEY;

interface PaymentButtonProps {
    source: 'now' | 'later';
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({ source }) => {
    // pago en el momento
    const preferenceId = useFormStore((state) => state.paymentURL);
    // pago despues
    const paymentUrl = usePaymentStore((state) => state.paymentUrl);

    const urlToUse = (source === 'now' ? preferenceId : paymentUrl) || '';

    initMercadoPago('APP_USR-6ab17ac5-0375-4c53-83a8-c457e1ab9b2f');
    return (
        <Wallet initialization={{ preferenceId: urlToUse }} customization={{ texts: { valueProp: 'smart_option' } }} />
    )
}


