import { Suspense } from 'react'
import {PaymentRedirect} from './payment-redirect'


export default function RedirectPage() {
    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Cargando...</div>}>
                <PaymentRedirect />
            </Suspense>
        </div>
    )
}
