import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import AppointmentCatalog from './catalog'


export default function AppointmentPage() {
    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Cargando...</div>}>
                <AppointmentCatalog />
            </Suspense>
        </div>
    )
}
