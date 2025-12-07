"use client";

import { Card } from "@/components/ui/card";
import { ShoppingCart, Trash2, Pencil, ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import React from "react";

interface SaleItem {
    product_id: number;
    product_name: string;
    category: string;
    quantity: number;
    unit_price: number | string;
    subtotal: number | string;
}

interface Sale {
    id: number;
    total: number;
    created_at?: string;
    items: SaleItem[];
}

interface SalesListProps {
    sales: Sale[];
    onEdit: (sale: Sale) => void;
    onDelete: (id: number) => void;
}

export function SalesList({ sales, onEdit, onDelete }: SalesListProps) {
    const [openSale, setOpenSale] = useState<number | null>(null);

    const toggleSale = (id: number) => {
        setOpenSale(openSale === id ? null : id);
    };

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
            <table className="w-full text-sm">
                <thead>
                <tr className="bg-gray-50 border-b">
                    <Th className="text-left">Venta</Th>
                    <Th className="text-right">Total</Th>
                    <Th className="text-center">Hora</Th>
                    <Th className="text-center">Acciones</Th>
                </tr>
                </thead>

                <tbody>
                {sales.map((sale) => (
                    <React.Fragment key={`sale-${sale.id}`}>
                        {/* 🔶 FILA PRINCIPAL */}
                        <tr
                            className="bg-yellow-50 font-semibold border-b cursor-pointer hover:bg-yellow-100 transition"
                            onClick={() => toggleSale(sale.id)}
                        >
                            <Td className="text-left">
                                <div className="flex items-center gap-2">
                                    {openSale === sale.id ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                    Venta #{sale.id}
                                </div>
                            </Td>

                            <Td className="text-right">S/ {formatPrice.format(Number(sale.total))}</Td>

                            <Td className="text-center">{formatHour(sale.created_at)}</Td>

                            <Td className="text-center">
                                <div className="flex justify-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(sale);
                                        }}
                                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                                        title="Editar venta"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(sale.id);
                                        }}
                                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                                        title="Eliminar venta"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </Td>
                        </tr>

                        {/* 🔷 SUBTABLA SOLO SI ESTÁ ABIERTA */}
                        {openSale === sale.id && (
                            <tr>
                                <td colSpan={4} className="p-0">
                                    <div className="overflow-x-auto border-t bg-white">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100">
                                            <tr>
                                                <Th className="text-left">Producto</Th>
                                                <Th className="text-left">Categoría</Th>
                                                <Th className="text-center">Cantidad</Th>
                                                <Th className="text-right">Precio Unit.</Th>
                                                <Th className="text-right">Subtotal</Th>
                                            </tr>
                                            </thead>

                                            <tbody>
                                            {sale.items.map((item, idx) => {
                                                const price = Number(item.unit_price) || 0;
                                                const subtotal = Number(item.subtotal) || price * item.quantity;

                                                return (
                                                    <tr key={`item-${sale.id}-${idx}`} className="border-b hover:bg-gray-50 transition">
                                                        <Td className="text-left">{item.product_name}</Td>

                                                        <Td className="text-left">
                                                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md">
                                                            {item.category}
                                                          </span>
                                                        </Td>

                                                        <Td className="text-center">{item.quantity}</Td>

                                                        <Td className="text-right">S/ {price.toFixed(2)}</Td>

                                                        <Td className="text-right font-bold text-yellow-600">
                                                            S/ {subtotal.toFixed(2)}
                                                        </Td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
        </Card>
    );
}

// -------------------------------
const Th = ({ children, className = "" }: any) => (
    <th
        className={`py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide ${className}`}
    >
        {children}
    </th>
);

const Td = ({ children, className = "", ...props }: any) => (
    <td className={`py-3 px-4 ${className}`} {...props}>
        {children}
    </td>
);