import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const result = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'categories'
    `)

        return NextResponse.json(result.rows)
    } catch (e) {
        console.error("DEBUG DB ERROR:", e)
        return NextResponse.json({ error: "DB debug failed" }, { status: 500 })
    }
}
