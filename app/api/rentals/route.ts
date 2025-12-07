import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// Normalizador asegurando que las fechas siempre regresan en ISO Z
function normalizeRental(row: any) {
    return {
        id: row.id,
        product_id: row.product_id,
        product_name: row.product_name,

        num_children: Number(row.num_children),
        duration_minutes: Number(row.duration_minutes),

        // 🔥 CONVERTIR FECHAS A ISO CON Z (UTC REAL)
        start_time: row.start_time ? new Date(row.start_time).toISOString() : null,
        end_time: row.end_time ? new Date(row.end_time).toISOString() : null,

        total_price: Number(row.total_price),

        discount_applied: row.discount_applied,
        discount_amount: Number(row.discount_amount),

        client_name: row.client_name || "",
        client_dni: row.client_dni || "",

        payment_method: row.payment_method || "Efectivo", // Nuevo campo

        notes: row.notes,
        status: row.status,

        created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
        updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = Number.parseInt(searchParams.get("limit") || "100", 10)
        const offset = Number.parseInt(searchParams.get("offset") || "0", 10)

        const result = await query(
            `SELECT r.*, p.name AS product_name
             FROM rentals r
                      LEFT JOIN products p ON r.product_id = p.id
             ORDER BY r.created_at DESC
                 LIMIT $1 OFFSET $2`,
            [limit, offset]
        )

        return NextResponse.json(result.rows.map(normalizeRental))
    } catch (error) {
        console.error("[v0] GET rentals error:", error)
        return NextResponse.json({ error: "Failed to fetch rentals" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Convertir start_time a ISO
        const startISO = new Date(body.start_time).toISOString()

        // 🔥 Calcular end_time automáticamente
        const endISO = new Date(
            new Date(body.start_time).getTime() + (body.duration_minutes * 60000)
        ).toISOString()

        const result = await query(
            `INSERT INTO rentals (
                product_id, num_children, duration_minutes,
                start_time, end_time, total_price,
                discount_applied, discount_amount, notes,
                client_name, client_dni, payment_method
            )
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
                 RETURNING *`,
            [
                body.product_id || null,
                Number(body.num_children),
                Number(body.duration_minutes),
                startISO,
                endISO,
                Number(body.total_price),
                body.discount_applied ?? false,
                Number(body.discount_amount ?? 0),
                body.notes || null,
                body.client_name || null,
                body.client_dni || null,
                body.payment_method || "Efectivo", // Nuevo campo
            ]
        )

        return NextResponse.json(normalizeRental(result.rows[0]), { status: 201 })
    } catch (error) {
        console.error("[POST rental error]", error)
        return NextResponse.json({ error: "Failed to create rental" }, { status: 500 })
    }
}