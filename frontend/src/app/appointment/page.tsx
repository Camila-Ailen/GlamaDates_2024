import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { CreatePackageDialog } from './create-package-dialog'
import { AppointmentsTable } from './appointments-table'

export default function UsersPage() {
    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Cargando...</div>}>

                <AppointmentsTable />
            </Suspense>
        </div>
    )
}
