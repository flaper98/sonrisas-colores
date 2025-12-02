import { query } from "@/lib/db"
import { NextResponse } from "next/server"

// Normalizador estándar (mismo que usas en /api/rentals)
function normalizeRental(row: any) {
    return {
        id: row.id,
        product_id: row.product_id,
        product_name: row.product_name,

        num_children: Number(row.num_children),
        duration_minutes: Number(row.duration_minutes),

        start_time: row.start_time ? new Date(row.start_time).toISOString() : null,
        end_time: row.end_time ? new Date(row.end_time).toISOString() : null,

        total_price: Number(row.total_price),

        discount_applied: row.discount_applied,
        discount_amount: Number(row.discount_amount),

        client_name: row.client_name || "",
        client_dni: row.client_dni || "",

        notes: row.notes,
        status: row.status,

        created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
        updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    }
}

export async function GET() {
    try {
        const result = await query(
            `SELECT r.*, p.name AS product_name
       FROM rentals r
       LEFT JOIN products p ON r.product_id = p.id
       WHERE r.status = 'active'
       ORDER BY r.start_time ASC`
        )

        return NextResponse.json(result.rows.map(normalizeRental))
    } catch (error) {
        console.error("[v0] GET active rentals error:", error)
        return NextResponse.json(
            { error: "Failed to fetch active rentals" },
            { status: 500 }
        )
    }
}
