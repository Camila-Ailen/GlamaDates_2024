import { CalendarDays, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

export function MonthGraph() {
  const [count, setCount] = useState(0);
  const targetCount = 53; // Número objetivo para este componente
  const totalDuration = 500; // Duración total fija de 500 milisegundos

  useEffect(() => {
    let start = 0;
    const end = targetCount;

    // Si el contador ya está en el valor final, no hace nada
    if (start === end) return;

    // Calcular el tiempo entre incrementos para completar en `totalDuration` milisegundos
    const incrementTime = totalDuration / targetCount; // Tiempo entre cada incremento

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(timer);
  }, [targetCount]);

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>Solicitudes cargadas este mes</CardTitle>
          <CardDescription>
            Global cargado del mes de{" "}
            {new Date().toLocaleDateString("es-AR", { month: "long" })}
          </CardDescription>
        </div>
        <CalendarDays className="h-4 w-4" />
      </CardHeader>
      <CardContent className="justify-items-center">
        <div className="text-5xl text-primary font-bold">+{count}</div>
        <p className="text-xs text-muted-foreground flex mt-2">
          +201 desde la semana pasada <TrendingUp className="ml-2 w-4 h-4" />
        </p>
      </CardContent>
    </Card>
  );
}
