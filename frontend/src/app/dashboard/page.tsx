"use client";
import {
  BarChart3,
  FileText,
  Folder,
  Package,
  PackagePlus,
  Settings,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MainGraph } from "@/components/dashboard/main-graph";
import { MonthGraph, TodayGraph, WeekGraph } from "@/components/dashboard/countercard";
import React from "react";
import router from "next/router";
import Link from "next/link";
import { toast } from "sonner";

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  index: number;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, index, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={`opacity-0 animate-fade-in ${className}`}
        style={{
          animationDelay: `${index * 85}ms`,
          animationFillMode: "forwards",
        }}
        {...props}
      />
    );
  },
);
AnimatedCard.displayName = "AnimatedCard";

const handleCardClick = () => {
  toast.info("Configuración no disponible");
};

export default function Component() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container py-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatedCard
              className="bg-primary text-primary-foreground"
              index={0}
            >
              <Link href="/appointment">
              <Card
                className="bg-primary text-primary-foreground"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    Citas
                  </CardTitle>
                  <FileText className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-primary-foreground/80">
                    Administracion de citas
                  </CardDescription>
                </CardContent>
              </Card>
              </Link>
            </AnimatedCard>

            <AnimatedCard
              className="bg-primary text-primary-foreground"
              index={1}
            >
              <Link href="/statistic">
              <Card className="bg-primary text-primary-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    Estadisticas
                  </CardTitle>
                  <Folder className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-primary-foreground/80">
                    Administracion de Estadisticas
                  </CardDescription>
                </CardContent>
              </Card>
              </Link>
            </AnimatedCard>
            <AnimatedCard
              className="bg-primary text-primary-foreground"
              index={2}
            >
              <Link  href="/package">
              <Card className="bg-primary text-primary-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    Paquetes
                  </CardTitle>
                  <PackagePlus className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-primary-foreground/80">
                    Administracion de Paquetes
                  </CardDescription>
                </CardContent>
              </Card>
              </Link>
            </AnimatedCard>

            <AnimatedCard
              className="bg-primary text-primary-foreground"
              index={3}
            >
              <Link href="/payment">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">
                      Pagos
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <CardDescription>Administración de pagos</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </AnimatedCard>
            <AnimatedCard
              className="bg-primary text-primary-foreground"
              index={4}
            >
              <Link href="/users">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">
                      Usuarios
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Preferencias de los usuarios
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </AnimatedCard>

            <AnimatedCard
              className="bg-primary text-primary-foreground"
              index={5}
            >
              <Link href="/#">
              <Card onClick={handleCardClick}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    Configuración
                  </CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription>Preferencias del sistema</CardDescription>
                </CardContent>
              </Card>
              </Link>
            </AnimatedCard>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <AnimatedCard
              className="bg-primary text-primary-foreground"
              index={6}
            >
              <TodayGraph />
            </AnimatedCard>

            <AnimatedCard
              className="bg-primary text-primary-foreground"
              index={6}
            >
              <WeekGraph />
            </AnimatedCard>

            <AnimatedCard
              className="bg-primary text-primary-foreground"
              index={7}
            >
              <MonthGraph />
            </AnimatedCard>
          </div>
          <AnimatedCard index={2} className="mt-4">
            <MainGraph />
          </AnimatedCard>
        </div>
      </main>
    </div>
  );
}
