import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    let sql = "SELECT * FROM categories ORDER BY name"
    let params: any[] = []

    if (type) {
      sql = "SELECT * FROM categories WHERE type = $1 ORDER BY name"
      params = [type]
    }

    const result = await query(sql, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("[v0] GET categories error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
   }
}

export async function POST(request: Request) {
  try {
    const { name, type } = await request.json()

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 })
    }

    const result = await query("INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING *", [name, type])

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("[v0] POST category error:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
