import { Suspense } from 'react'
import { PaymentsTable } from './payments-table'

export default function PaymentsPage() {
    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Cargando...</div>}>
                <PaymentsTable />
            </Suspense>
        </div>
    )
}
