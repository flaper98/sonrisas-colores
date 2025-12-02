import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    const result = await query(
      `SELECT r.*, p.name as product_name FROM rentals r 
       LEFT JOIN products p ON r.product_id = p.id
       WHERE DATE(r.start_time) = $1
       ORDER BY r.start_time DESC`,
      [date],
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("[v0] GET rentals by date error:", error)
    return NextResponse.json({ error: "Failed to fetch rentals" }, { status: 500 })
  }
}
