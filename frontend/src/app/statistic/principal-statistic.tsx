"use client"

import { WeekDay } from '@/components/statistic/week-day';
import { PayMethod } from '@/components/statistic/pay-method';
import { PerCategory } from '@/components/statistic/per-category';
import { PerProfessional } from '@/components/statistic/per-professional';
import { TotalDates } from '@/components/statistic/total-dates';
import { Card } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import useStatisticsStore from '../store/useStatisticsStore';

const PrincipalStatistic = () => {
    const { startDate, endDate, setStartDate, setEndDate } = useStatisticsStore();

  
    const [error, setError] = useState('');

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedDate = formatDate(e.target.value);
        setStartDate(formattedDate);
        if (endDate && new Date(formattedDate.split('/').reverse().join('-')) > new Date(endDate.split('/').reverse().join('-'))) {
            setError('La fecha de inicio debe ser anterior a la fecha de fin');
        } else {
            setError('');
        }
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedDate = formatDate(e.target.value);
        setEndDate(formattedDate);
        if (startDate && new Date(formattedDate.split('/').reverse().join('-')) < new Date(startDate.split('/').reverse().join('-'))) {
            setError('La fecha de fin debe ser posterior a la fecha de inicio');
        } else {
            setError('');
        }
    };

    const formatDate = (date: string) => {
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        setStartDate(formatDate(startDate));
        setEndDate(formatDate(endDate));
        console.log(startDate, endDate);
    }, []);


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

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <h1 className="text-3xl font-bold text-center text-pink-700 mb-6">Estadisticas</h1>
            <h2 className="text-3xl font-bold text-center text-pink-700 mb-6">Estadisticas Generales</h2>
            <p className="text-center mb-4">Seleccione el rango de fechas a analizar:</p>
            <div className="flex flex-row justify-center items-center gap-4">
                <div className="flex flex-col items-center">
                    <label className="mb-2">Fecha de inicio:</label>
                    <input
                        type="date"
                        value={startDate ? startDate.split('/').reverse().join('-') : ''}
                        onChange={handleStartDateChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="flex flex-col items-center">
                    <label className="mb-2">Fecha de fin:</label>
                    <input
                        type="date"
                        value={endDate ? endDate.split('/').reverse().join('-') : ''}
                        onChange={handleEndDateChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                </div>
            </div>
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

            <AnimatedCard index={2} className="mt-4">
                <TotalDates />
            </AnimatedCard>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <AnimatedCard index={3} className="mt-4">
                    <PayMethod />
                </AnimatedCard>

                <AnimatedCard index={4} className="mt-4">
                    <WeekDay />
                </AnimatedCard>
            </div>

            <AnimatedCard index={5} className="mt-4">
                <PerCategory />
            </AnimatedCard>

            <AnimatedCard index={6} className="mt-4">
                <PerProfessional />
            </AnimatedCard>
        </div>
    )
}

export default PrincipalStatistic;