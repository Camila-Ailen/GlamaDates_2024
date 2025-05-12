import { Suspense } from 'react'
import { SystemPreferences } from './system-preferences'

export default function PreferencesPage() {
    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Cargando...</div>}>
                <SystemPreferences />
            </Suspense>
        </div>
    )
}
