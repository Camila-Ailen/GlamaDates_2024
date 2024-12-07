import { Suspense } from 'react'
import { UsersTable } from './users-table'
import { CreateUserDialog } from './create-user-dialog'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function UsersPage() {
  return (
    <div className="container mx-auto py-10">
      <Suspense fallback={<div>Cargando...</div>}>
        <UsersTable />
      </Suspense>
    </div>
  )
}
