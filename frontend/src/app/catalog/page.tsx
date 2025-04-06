import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import AppointmentCatalog from './catalog'
import CatalogPage from './catalogPage'


export default function AppointmentPage() {
    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Cargando...</div>}>
                <CatalogPage />
            </Suspense>
        </div>
    )
}
