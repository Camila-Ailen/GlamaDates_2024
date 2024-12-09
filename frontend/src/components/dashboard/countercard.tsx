import { CalendarDays, CalendarFold, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

interface CounterGraphProps {
  targetCount: number;
  title: string;
  description: string;
  ptag: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

function CounterGraph({
  targetCount,
  title,
  description,
  ptag,
  icon: Icon,
}: CounterGraphProps) {
  const [count, setCount] = useState(0);
  const totalDuration = 1000; // Duración total fija de 500 milisegundos
  const frameDuration = 16; // Aproximadamente 60fps, cada frame dura ~16ms

  useEffect(() => {
    let current = 0;
    const steps = Math.ceil(totalDuration / frameDuration); // Número total de pasos
    const increment = targetCount / steps; // Valor a incrementar en cada paso

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setCount(targetCount); // Garantizamos no exceder el target
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, frameDuration);

    return () => clearInterval(timer);
  }, [targetCount]);

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Icon className="h-4 w-4" />
      </CardHeader>
      <CardContent className="justify-items-center">
        <div className="text-5xl text-primary font-bold">+{count}</div>
        <p className="text-xs text-muted-foreground flex mt-2">
          {ptag} <TrendingUp className="ml-2 w-4 h-4" />
        </p>
      </CardContent>
    </Card>
  );
}

export function MonthGraph() {
  return (
    <CounterGraph
      targetCount={572}
      title="Solicitudes cargadas este mes"
      description={`Global cargado del mes de ${new Date().toLocaleDateString("es-AR", { month: "long" })}`}
      icon={CalendarDays}
      ptag="+201 desde la semana pasada"
    />
  );
}

export function TodayGraph() {
  return (
    <CounterGraph
      targetCount={172}
      title="Solicitudes cargadas hoy"
      description={`Global cargado del día ${new Date().toLocaleDateString("es-AR")}`}
      icon={CalendarFold}
      ptag="+19 desde la última hora"
    />
  );
}
