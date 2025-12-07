"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

interface SaleReport {
    id: number;
    date: string;
    total: number;
    items: number;
    total_quantity: number;
}

interface SaleDetail {
    sale_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

export function SalesReportsPage() {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [sales, setSales] = useState<SaleReport[]>([]);
    const [details, setDetails] = useState<SaleDetail[]>([]);
    const [searched, setSearched] = useState(false);

    const fetchData = async () => {
        if (!start || !end) {
            return toast.error("Seleccione fechas");
        }

        try {
            const res = await fetch(`/api/sales/report-range?start=${start}&end=${end}`);
            const data = await res.json();

            setSales(data.sales);
            setDetails(data.details);
            setSearched(true);

            toast.success("Reporte cargado");
        } catch (e) {
            toast.error("Error al cargar ventas");
        }
    };

    const format = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString("es-PE");
    };

    // ---------- EXPORTAR PDF ----------
    const exportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(14);
        doc.text(
            `REPORTE DE VENTAS\nDesde ${start}  Hasta ${end}`,
            105,
            15,
            { align: "center" }
        );

        autoTable(doc, {
            startY: 30,
            head: [["ID", "FECHA", "ITEMS", "CANTIDAD", "TOTAL"]],
            body: sales.map((s) => [
                s.id,
                format(s.date),
                s.items,
                s.total_quantity,
                `S/ ${s.total}`,
            ]),
        });

        doc.save("ventas.pdf");
    };

    // ---------- EXPORTAR CSV ----------
    const exportCSV = () => {
        const rows = [
            ["ID", "FECHA", "ITEMS", "CANTIDAD", "TOTAL"],
            ...sales.map((s) => [
                s.id,
                s.date,
                s.items,
                s.total_quantity,
                s.total,
            ]),
        ];

        const csv = rows.map((r) => r.join(",")).join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "ventas.csv";
        a.click();
    };

    return (
        <div className="space-y-6">

            <h2 className="text-3xl font-bold">REPORTE DE VENTAS</h2>

            <Card className="p-4 space-y-3">
                <h3 className="font-bold">Filtrar por fechas</h3>

                <div className="flex gap-3">
                    <input type="date" className="border p-2 rounded" value={start} onChange={(e) => setStart(e.target.value)} />
                    <input type="date" className="border p-2 rounded" value={end} onChange={(e) => setEnd(e.target.value)} />
                    <Button onClick={fetchData}>Buscar</Button>
                </div>
            </Card>

            {searched && (
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-3">Ventas Registradas</h3>

                    <table className="w-full text-sm border">
                        <thead className="bg-gray-100">
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Items</th>
                            <th>Cantidad</th>
                            <th>Total</th>
                        </tr>
                        </thead>

                        <tbody>
                        {sales.map((s) => (
                            <tr key={s.id} className="border-b">
                                <td>{s.id}</td>
                                <td>{format(s.date)}</td>
                                <td>{s.items}</td>
                                <td>{s.total_quantity}</td>
                                <td>S/ {s.total}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="flex mt-4 gap-2">
                        <Button variant="outline" onClick={exportPDF}>
                            <Download className="w-4 h-4" /> PDF
                        </Button>
                        <Button variant="outline" onClick={exportCSV}>
                            <Download className="w-4 h-4" /> CSV
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
