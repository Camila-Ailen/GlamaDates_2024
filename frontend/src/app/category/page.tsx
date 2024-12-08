import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateCategoryDialog } from './create-category-dialog'
import { CategoriesTable } from './categories-table'

export default function UsersPage() {
    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Cargando...</div>}>

                <CategoriesTable />
            </Suspense>
        </div>
    )
}
