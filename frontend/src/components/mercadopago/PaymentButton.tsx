declare global {
  interface Window {
    MercadoPago: any;
  }
}

import { useEffect, useRef } from 'react';
import { usePaymentStore } from '@/app/store/usePaymentStore';

const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

export const PaymentButton: React.FC = () => {
  const paymentUrl = usePaymentStore((state) => state.paymentUrl);
  const walletContainer = useRef<HTMLDivElement>(null);
  const alreadyRendered = useRef(false);

  useEffect(() => {
    if (!publicKey || !paymentUrl || !walletContainer.current || alreadyRendered.current) return;

    if (!window.MercadoPago) {
      console.error("❌ MercadoPago SDK no está disponible");
      return;
    }

    alreadyRendered.current = true;

    const mp = new window.MercadoPago(publicKey, { locale: 'es-AR' });

    mp.bricks().create("wallet", "wallet_container", {
      initialization: {
        preferenceId: paymentUrl,
      },
      customization: {
        texts: {
          valueProp: 'smart_option',
        },
      },
      settings: {
        sandbox: true, 
      },
    });
  }, [paymentUrl]);

  return (
    <div className="w-full flex justify-center min-h-[50px]">
      <div id="wallet_container" ref={walletContainer} className="w-full" />
    </div>
  );
};
