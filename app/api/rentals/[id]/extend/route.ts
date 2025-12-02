import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const {
            duration_minutes,
            total_price,
            end_time,
            status
        } = body;

        const endISO = new Date(end_time).toISOString();

        const result = await query(
            `UPDATE rentals
       SET 
         duration_minutes = $1,
         total_price = $2,
         end_time = $3,
         status = $4,
         updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
            [
                duration_minutes,
                total_price,
                endISO,
                status,
                Number(id)
            ]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Rental not found" }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("[v0] PUT extend error:", error);
        return NextResponse.json(
            { error: "Failed to extend rental", details: String(error) },
            { status: 500 }
        );
    }
}
