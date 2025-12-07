import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const start = searchParams.get("start")
        const end = searchParams.get("end")

        if (!start || !end) {
            return NextResponse.json(
                { error: "start and end parameters are required" },
                { status: 400 }
            )
        }

        const result = await query(
            `SELECT
                 DATE(start_time) AS date,
                 product_id,
                 client_name,
                 client_dni,
                 num_children,   
                 status,
                 total_price AS total
             FROM rentals
             WHERE DATE(start_time) BETWEEN $1 AND $2
             ORDER BY start_time DESC`,
            [start, end]
        )

        return NextResponse.json(result.rows)
    } catch (error) {
        console.error("GET /rentals/report-range error:", error)
        return NextResponse.json({ error: "Failed to fetch rentals" }, { status: 500 })
    }
}
