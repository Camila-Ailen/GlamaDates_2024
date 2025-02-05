import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { CreatePackageDialog } from './create-package-dialog'
import { AppointmentsTodayTable } from './appointmentsToday-table'

export default function AppointmetsTodayPage() {
    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Cargando...</div>}>

                <AppointmentsTodayTable />
            </Suspense>
        </div>
    )
}
