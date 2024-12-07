'use client';
import {BarChart3, FileText, Folder, Package, Settings, Users} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {MainGraph} from "@/components/dashboard/main-graph";
import {MonthGraph, TodayGraph} from "@/components/dashboard/countercard";
import React from "react";
import InsuranceForm, {useStore} from "@/components/apply-multistep/apply-dialog";


interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
    index: number;
}


const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
    ({className, index, ...props}, ref) => {
        return (
            <Card
                ref={ref}
                className={`opacity-0 animate-fade-in ${className}`}
                style={{
                    animationDelay: `${index * 85}ms`,
                    animationFillMode: 'forwards',
                }}
                {...props}
            />
        )
    }
)
AnimatedCard.displayName = "AnimatedCard"


export default function Component() {
    const {openDialog} = useStore();
    return (
        <div className="flex min-h-screen flex-col">
            <InsuranceForm/>
            <main className="flex-1">
                <div className="container py-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <AnimatedCard className="bg-primary text-primary-foreground" index={0}>
                            <Card className="bg-primary text-primary-foreground" onClick={openDialog}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium">
                                        Nueva solicitud
                                    </CardTitle>
                                    <FileText className="h-4 w-4"/>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-primary-foreground/80">
                                        Vida, casa, autos y más
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </AnimatedCard>

                        <AnimatedCard className="bg-primary text-primary-foreground" index={1}>
                            <Card className="bg-primary text-primary-foreground">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium">
                                        Solicitudes
                                    </CardTitle>
                                    <Folder className="h-4 w-4"/>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-primary-foreground/80">
                                        Lista de solicitudes
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </AnimatedCard>
                        <AnimatedCard className="bg-primary text-primary-foreground" index={2}>
                            <Card className="bg-primary text-primary-foreground">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium">Reportes</CardTitle>
                                    <BarChart3 className="h-4 w-4"/>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-primary-foreground/80">
                                        Reportes customizados
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </AnimatedCard>

                        <AnimatedCard className="bg-primary text-primary-foreground" index={3}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium">Productos</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground"/>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>Administración de productos</CardDescription>
                                </CardContent>
                            </Card>
                        </AnimatedCard>
                        <AnimatedCard className="bg-primary text-primary-foreground" index={4}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium">Usuarios</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground"/>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>Preferencias de los usuarios</CardDescription>
                                </CardContent>
                            </Card>
                        </AnimatedCard>

                        <AnimatedCard className="bg-primary text-primary-foreground" index={5}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium">
                                        Configuración
                                    </CardTitle>
                                    <Settings className="h-4 w-4 text-muted-foreground"/>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>Preferencias del sistema</CardDescription>
                                </CardContent>
                            </Card>
                        </AnimatedCard>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <AnimatedCard className="bg-primary text-primary-foreground" index={6}>
                            <TodayGraph/>
                        </AnimatedCard>

                        <AnimatedCard className="bg-primary text-primary-foreground" index={7}>
                            <MonthGraph/>
                        </AnimatedCard>
                    </div>
                    <AnimatedCard index={2} className="mt-4">
                        <MainGraph/>
                    </AnimatedCard>
                </div>
            </main>
        </div>
    )
}