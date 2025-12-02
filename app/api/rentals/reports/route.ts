import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "daily"
    const days = Number.parseInt(searchParams.get("days") || "30", 10)

    let groupBy: string
    let dateFormat: string

    if (period === "weekly") {
      dateFormat = "TO_CHAR(r.created_at, 'YYYY-WW')"
      groupBy = "TO_CHAR(r.created_at, 'YYYY-WW')"
    } else {
      dateFormat = "DATE(r.created_at)"
      groupBy = "DATE(r.created_at)"
    }

    const result = await query(
      `SELECT 
        ${dateFormat} as date,
        COALESCE(SUM(r.total_price), 0) as total_income,
        COUNT(r.id) as rentals,
        COALESCE(ROUND(AVG(r.total_price), 2), 0) as average_price,
        COALESCE(SUM(r.num_children), 0) as children_served
      FROM rentals r
      WHERE r.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY ${groupBy}
      ORDER BY date DESC`,
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("[v0] GET reports error:", error)
    return NextResponse.json({ error: "Failed to fetch reports", details: String(error) }, { status: 500 })
  }
}
