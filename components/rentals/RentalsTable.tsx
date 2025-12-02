"use client";

//import { Rental } from "@/app/rentals-page";
import type { Rental } from "@/components/types/rental";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Clock, Edit2 } from "lucide-react";

interface RentalsTableProps {
    rentals: Rental[];
    onComplete: (id: number) => void;
    //onExtend: (id: number, minutes: number) => void;
    onEdit: (rental: Rental) => void;
    onRealEdit: (rental: Rental) => void;
}

export function RentalsTable({
                                 rentals,
                                 onComplete,
                                 onEdit,
                                 onRealEdit,
                             }: RentalsTableProps) {
    const sortedRentals = [...rentals].sort((a, b) => {
        const now = new Date().getTime();
        const timeLeftA = new Date(a.end_time).getTime() - now;
        const timeLeftB = new Date(b.end_time).getTime() - now;

        if (a.status === "completed" && b.status !== "completed") return 1;
        if (b.status === "completed" && a.status !== "completed") return -1;

        if (timeLeftA <= 5 * 60 * 1000 && timeLeftB > 5 * 60 * 1000) return -1;
        if (timeLeftB <= 5 * 60 * 1000 && timeLeftA > 5 * 60 * 1000) return 1;

        return timeLeftA - timeLeftB;
    });

    const getRowStyle = (r: Rental) => {
        const now = new Date().getTime();
        const end = new Date(r.end_time).getTime();
        const diff = end - now;

        // Completed
        if (r.status === "completed")
            return "bg-green-50 border-l-4 border-green-500";

        // Vencido
        if (diff <= 0)
            return "bg-red-50 border-l-4 border-red-500 animate-[pulse_2s_ease-in-out_infinite]";

        // 5 min restantes
        if (diff <= 5 * 60 * 1000)
            return "bg-yellow-50 border-l-4 border-yellow-500";

        // Normal
        return "bg-white border-l-4 border-transparent";
    };

    return (
        <Card className="p-6 shadow-sm hover:shadow-md transition-all rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                    <tr className="text-gray-700 bg-gray-50">
                        <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                        <th className="px-4 py-3 text-center font-semibold">Tiempo</th>
                        <th className="px-4 py-3 text-center font-semibold">Inicio</th>
                        <th className="px-4 py-3 text-center font-semibold">Fin</th>
                        <th className="px-4 py-3 text-center font-semibold">Pago</th>
                        <th className="px-4 py-3 text-center font-semibold">Monto</th>
                        <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                    </tr>
                    </thead>

                    <tbody>
                    {sortedRentals.map((r) => {
                        const start = new Date(r.start_time).toLocaleTimeString("es-PE", {
                            hour: "2-digit",
                            minute: "2-digit",
                        });
                        const end = new Date(r.end_time).toLocaleTimeString("es-PE", {
                            hour: "2-digit",
                            minute: "2-digit",
                        });
                        const duration = `${Math.floor(r.duration_minutes / 60)}h ${
                            r.duration_minutes % 60
                        }m`;

                        return (
                            <tr
                                key={r.id}
                                className={`${getRowStyle(
                                    r
                                )} transition-all hover:bg-gray-100/50`}
                            >
                                {/* Cliente */}
                                <td className="px-4 py-4 font-medium text-gray-800">
                                    {r.client_name}
                                    <div className="text-xs text-gray-500">{r.client_dni}</div>
                                </td>

                                <td className="px-4 py-4 text-center">{duration}</td>
                                <td className="px-4 py-4 text-center">{start}</td>
                                <td className="px-4 py-4 text-center">{end}</td>

                                <td className="px-4 py-4 text-center">
                                    {r.discount_applied ? "YAPE" : "EFECTIVO"}
                                </td>

                                <td className="px-4 py-4 text-center font-semibold text-gray-900">
                                    S/ {r.total_price.toFixed(2)}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">

                                        {/* Editar datos */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => onRealEdit(r)}
                                                    className="text-orange-600 hover:bg-orange-100"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Editar datos del cliente</TooltipContent>
                                        </Tooltip>

                                        {/* Extender tiempo */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => onEdit(r)}
                                                    className="text-purple-600 hover:bg-purple-100"
                                                >
                                                    <Clock className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Extender tiempo</TooltipContent>
                                        </Tooltip>

                                        {/* Completar */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => onComplete(r.id)}
                                                    className="text-blue-600 hover:bg-blue-100"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Completar alquiler</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
