import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MyDates } from './myDates'
import { AppointmentDashboard } from './appointment-dashboard'


export default function MyDatesPage() {
    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Cargando...</div>}>
                {/* <MyDates /> */}
                <AppointmentDashboard />
            </Suspense>
        </div>
    )
}
