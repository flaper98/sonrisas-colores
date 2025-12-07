"use client";

import type { Rental } from "@/components/types/rental";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Clock, Edit2 } from "lucide-react";

interface RentalsTableProps {
    rentals: Rental[];
    onComplete: (id: number) => void;
    onEdit: (rental: Rental) => void;
    onRealEdit: (rental: Rental) => void;
}

export function RentalsTable({
                                 rentals,
                                 onComplete,
                                 onEdit,
                                 onRealEdit,
                             }: RentalsTableProps) {
    // ==== ORDENAMIENTO USANDO URGENCIA ====
    const sortedRentals = [...rentals].sort((a, b) => {
        const now = Date.now();
        const timeA = new Date(a.end_time).getTime() - now;
        const timeB = new Date(b.end_time).getTime() - now;

        if (a.status === "completed" && b.status !== "completed") return 1;
        if (b.status === "completed" && a.status !== "completed") return -1;

        if (timeA <= 5 * 60 * 1000 && timeB > 5 * 60 * 1000) return -1;
        if (timeB <= 5 * 60 * 1000 && timeA > 5 * 60 * 1000) return 1;

        return timeA - timeB;
    });

    // ==== COLORES POR ESTADO ====
    const getRowStyle = (r: Rental) => {
        const now = Date.now();
        const end = new Date(r.end_time).getTime();
        const diff = end - now;

        if (r.status === "completed") return "bg-green-50 border-l-4 border-green-600";
        if (diff <= 0)
            return "bg-red-50 border-l-4 border-red-600 animate-[pulse_2s_ease-in-out_infinite]";
        if (diff <= 5 * 60 * 1000)
            return "bg-yellow-50 border-l-4 border-yellow-500";

        return "bg-white border-l-4 border-transparent";
    };

    const to12h = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <Card className="p-6 shadow-sm hover:shadow-md transition-all rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                    <tr className="text-gray-700 bg-gray-100">
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
                        const duration = `${Math.floor(r.duration_minutes / 60)}h ${
                            r.duration_minutes % 60
                        }m`;

                        return (
                            <tr
                                key={r.id}
                                className={`${getRowStyle(
                                    r
                                )} transition-all hover:bg-gray-100/70`}
                            >
                                {/* CLIENTE */}
                                <td className="px-4 py-4 font-medium text-gray-800">
                                    {r.client_name}
                                    <div className="text-xs text-gray-500">{r.client_dni}</div>
                                </td>

                                <td className="px-4 py-4 text-center">{duration}</td>

                                {/* HORAS EN 12H */}
                                <td className="px-4 py-4 text-center">{to12h(r.start_time)}</td>
                                <td className="px-4 py-4 text-center">{to12h(r.end_time)}</td>

                                {/* Pago con badge */}
                                <td className="px-4 py-4 text-center">
                    <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                            r.discount_applied
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {r.discount_applied ? "YAPE" : "EFECTIVO"}
                    </span>
                                </td>

                                <td className="px-4 py-4 text-center font-semibold text-gray-900">
                                    S/ {r.total_price.toFixed(2)}
                                </td>

                                {/* ACCIONES */}
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
                                            <TooltipContent>Editar datos completos</TooltipContent>
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

                                        {/* Completar alquiler */}
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
