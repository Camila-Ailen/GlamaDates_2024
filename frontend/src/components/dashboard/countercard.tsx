import { Boxes, CalendarDays, CalendarFold, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { use, useEffect, useState } from "react";
import useAppointmentStore from "@/app/store/useAppointmentStore";

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
  const { thisMonthAppointments, lastMonthAppointments, fetchTotalAppointmentsThisMonth, fetchLastMonthAppointments } = useAppointmentStore();
  const [percentage, setPercentage] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const thisMonthData = await fetchTotalAppointmentsThisMonth();
      const lastMonthData = await fetchLastMonthAppointments();
      if (lastMonthData.total_turnos > 0) {
        setPercentage(((thisMonthData.total_turnos - lastMonthData.total_turnos) / lastMonthData.total_turnos) * 100);
      } else {
        setPercentage(0);
      }
    }
    fetchData();
  }, [fetchTotalAppointmentsThisMonth, fetchLastMonthAppointments]);

  if (thisMonthAppointments === null || lastMonthAppointments === null) return <div>Cargando...</div>;

  return (
    <CounterGraph
      targetCount={thisMonthAppointments}
      title="Turnos en este mes"
      description={`Citas cargadas para el mes de ${new Date().toLocaleDateString("es-AR", { month: 'long', year: 'numeric' })}`}
      icon={Boxes}
      ptag={`${percentage?.toFixed(2)}% en relación al mes anterior`}
    />
  );
}

export function WeekGraph() {

  const {
    isLoading,
    error,
    thisWeekAppointments,
    thisMonthAppointments,
    fetchTotalAppointmentsThisMonth,
    fetchTotalAppointmentsThisWeek,
  } = useAppointmentStore();
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const thisWeekData = await fetchTotalAppointmentsThisWeek();
      const thisMonthData = await fetchTotalAppointmentsThisMonth();
      if (thisMonthData.total_turnos > 0) {
        setPercentage((thisWeekData.total_turnos / thisMonthData.total_turnos) * 100);
      } else {
        setPercentage(0);
      }
    }
    fetchData();
  }, [fetchTotalAppointmentsThisWeek, fetchTotalAppointmentsThisMonth]);

  // if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Ocurrió un error: {error}</div>;
  if (thisWeekAppointments === null || thisMonthAppointments === null) return <div>Cargando...</div>;

  return (
    <CounterGraph
      targetCount={thisWeekAppointments}
      title="Turnos en esta semana"
      description={`Citas cargadas para la semana del ${new Date().toLocaleDateString("es-AR")}`}
      icon={Boxes}
      ptag={`${percentage.toFixed(2)}% en relación al mes`}
    />
  );
}

export function TodayGraph() {

  const {
    isLoading,
    error,
    todayAppointments,
    thisWeekAppointments,
    fetchTotalAppointmentsToday,
    fetchTotalAppointmentsThisWeek,
  } = useAppointmentStore();

  const [percentage, setPercentage] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const todayData = await fetchTotalAppointmentsToday();
      const weekData = await fetchTotalAppointmentsThisWeek();
      if (weekData.total_turnos > 0) {
        setPercentage((todayData.total_turnos / weekData.total_turnos) * 100);
      } else {
        setPercentage(0);
      }
    }
    fetchData();
  }, [fetchTotalAppointmentsToday, fetchTotalAppointmentsThisWeek]);

  // if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Ocurrió un error: {error}</div>;
  if (todayAppointments === null || thisWeekAppointments === null) return <div>Cargando...</div>;

  return (
    <CounterGraph
      targetCount={todayAppointments}
      title="Turnos para hoy"
      description={`Citas cargadas para el día ${new Date().toLocaleDateString("es-AR")}`}
      icon={Boxes}
      ptag={`${percentage?.toFixed(2)}% en relación a la semana`}
    />
  );
}
