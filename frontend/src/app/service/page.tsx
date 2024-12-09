import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateServiceDialog } from './create-service-dialog'
import { ServicesTable } from './services-table'

export default function UsersPage() {
    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Cargando...</div>}>

                <ServicesTable />
            </Suspense>
        </div>
    )
}
