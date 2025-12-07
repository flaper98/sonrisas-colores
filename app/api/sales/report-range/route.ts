import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const start = searchParams.get("start");
        const end = searchParams.get("end");

        if (!start || !end) {
            return NextResponse.json(
                { error: "Missing date range" },
                { status: 400 }
            );
        }

        const sales = await query(
            `
      SELECT 
        s.id,
        DATE(s.created_at) AS date,
        s.total,
        s.notes,
        COUNT(si.id) AS items,
        SUM(si.quantity) AS total_quantity
      FROM sales s
      LEFT JOIN sale_items si ON si.sale_id = s.id
      WHERE DATE(s.created_at) BETWEEN $1 AND $2
      GROUP BY s.id
      ORDER BY s.created_at DESC
      `,
            [start, end]
        );

        // Obtener productos por venta (detalle)
        const details = await query(
            `
      SELECT 
        si.sale_id,
        p.name AS product_name,
        si.quantity,
        si.unit_price,
        si.subtotal
      FROM sale_items si
      JOIN products p ON p.id = si.product_id
      WHERE si.sale_id IN (
        SELECT id FROM sales WHERE DATE(created_at) BETWEEN $1 AND $2
      )
      ORDER BY si.sale_id, p.name
      `,
            [start, end]
        );

        return NextResponse.json({
            sales,
            details
        });

    } catch (err) {
        console.error("SALES REPORT ERROR:", err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
