import { Suspense } from 'react'
import { RearrangeRedirect } from './rearrange-redirect'


export default function RearrangePage() {
    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Cargando...</div>}>
                <RearrangeRedirect />
            </Suspense>
        </div>
    )
}
