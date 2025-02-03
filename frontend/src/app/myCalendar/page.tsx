import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MyCalendar } from './myCalendar'


export default function MyCalendarPage() {
    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Cargando...</div>}>
                <MyCalendar />
            </Suspense>
        </div>
    )
}
