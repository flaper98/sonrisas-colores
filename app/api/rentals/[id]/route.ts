import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const {
            client_name,
            client_dni,
            num_children,
            duration_minutes,
            total_price,
            start_time,
            end_time,
            discount_applied,
            discount_amount,
            status,
            payment_method, // ✅ AGREGAR AQUÍ
        } = body;

        // Normalizar fechas ISO
        const startISO = new Date(start_time).toISOString();
        const endISO = new Date(end_time).toISOString();

        const result = await query(
            `UPDATE rentals SET
                                client_name = $1,
                                client_dni = $2,
                                num_children = $3,
                                duration_minutes = $4,
                                total_price = $5,
                                start_time = $6,
                                end_time = $7,
                                discount_applied = $8,
                                discount_amount = $9,
                                status = $10,
                                payment_method = $11,
                                updated_at = NOW()
             WHERE id = $12
                 RETURNING *`,
            [
                client_name,
                client_dni,
                num_children,
                duration_minutes,
                total_price,
                startISO,
                endISO,
                discount_applied,
                discount_amount,
                status,
                payment_method || "Efectivo", // ✅ AGREGAR AQUÍ con valor por defecto
                Number(id),
            ]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Rental not found" }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("[v0] PUT rental error:", error);
        return NextResponse.json(
            { error: "Failed to update rental", details: String(error) },
            { status: 500 }
        );
    }
}