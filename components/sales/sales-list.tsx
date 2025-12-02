"use client";

import { Card } from "@/components/ui/card";
import { ShoppingCart, Trash2, Pencil } from "lucide-react";
import { useMemo } from "react";

interface Sale {
    id: number;
    product_id: number;
    product_name: string;
    category: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes?: string;
    created_at?: string;
}

interface SalesListProps {
    sales: Sale[];
    onRefresh: () => void;
    onEdit: (sale: Sale) => void;
    onDelete: (id: number) => void;
}

export function SalesList({ sales, onEdit, onDelete }: SalesListProps) {

    const formatPrice = useMemo(
        () =>
            new Intl.NumberFormat("es-PE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        []
    );

    const formatHour = (date?: string) =>
        date ? new Date(date).toLocaleTimeString("es-PE") : "-";

    // -------------------------------
    // VACÍO
    // -------------------------------
    if (sales.length === 0) {
        return (
            <Card className="p-12 text-center bg-white border rounded-2xl shadow-sm">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">
                    No hay ventas registradas para esta fecha
                </p>
            </Card>
        );
    }

    return (
        <Card className="p-6 bg-white border rounded-2xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="bg-gray-50 border-b">
                        <Th>Producto</Th>
                        <Th>Categoría</Th>
                        <Th className="text-center">Cantidad</Th>
                        <Th className="text-right">Precio Unit.</Th>
                        <Th className="text-right">Total</Th>
                        <Th className="text-center">Hora</Th>
                        <Th className="text-center">Acciones</Th>
                    </tr>
                    </thead>

                    <tbody>
                    {sales.map((sale, idx) => (
                        <tr
                            key={sale.id}
                            className={`transition-colors ${
                                idx % 2 === 0
                                    ? "bg-white"
                                    : "bg-gray-50"
                            } hover:bg-accent/10`}
                        >
                            {/* PRODUCTO */}
                            <Td>
                  <span className="font-semibold text-gray-800">
                    {sale.product_name}
                  </span>
                            </Td>

                            {/* CATEGORÍA */}
                            <Td>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-semibold">
                    {sale.category}
                  </span>
                            </Td>

                            {/* CANTIDAD */}
                            <Td className="text-center font-medium">
                                {sale.quantity}
                            </Td>

                            {/* PRECIO UNIT */}
                            <Td className="text-right text-gray-600">
                                S/ {formatPrice.format(sale.unit_price)}
                            </Td>

                            {/* TOTAL */}
                            <Td className="text-right font-bold text-accent">
                                S/ {formatPrice.format(sale.total_price)}
                            </Td>

                            {/* HORA */}
                            <Td className="text-center text-xs text-muted-foreground">
                                {formatHour(sale.created_at)}
                            </Td>

                            {/* ACCIONES */}
                            <Td className="text-center">
                                <div className="flex justify-center gap-2">

                                    {/* EDITAR */}
                                    <button
                                        onClick={() => onEdit(sale)}
                                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                                        title="Editar venta"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>

                                    {/* ELIMINAR */}
                                    <button
                                        onClick={() => onDelete(sale.id)}
                                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                                        title="Eliminar venta"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                </div>
                            </Td>

                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

// -------------------------------
// Subcomponentes Reusables
// -------------------------------
const Th = ({
                children,
                className = "",
            }: {
    children: React.ReactNode;
    className?: string;
}) => (
    <th
        className={`text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide ${className}`}
    >
        {children}
    </th>
);

const Td = ({
                children,
                className = "",
            }: {
    children: React.ReactNode;
    className?: string;
}) => (
    <td className={`py-3 px-4 text-gray-800 ${className}`}>{children}</td>
);
