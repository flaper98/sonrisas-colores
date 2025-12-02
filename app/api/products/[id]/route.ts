import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {

    const { id } = await Promise.resolve(params)
    const result = await query("SELECT * FROM products WHERE id = $1", [Number.parseInt(id, 10)])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("[v0] GET product error:", error)
    return NextResponse.json({ error: "Failed to fetch product", details: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await Promise.resolve(params)
    const body = await request.json()
    const { name, category, price, quantity, description , minStock } = body

    const result = await query(
      "UPDATE products SET name = $1, category = $2, price = $3, quantity = $4, description = $5, min_stock  = $6 , updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *",
      [
        name,
        category,
        Number.parseFloat(price),
        Number.parseInt(quantity, 10),
        description || null,
        Number(minStock ?? 0),
        Number.parseInt(id, 10),


      ],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("[v0] PUT product error:", error)
    return NextResponse.json({ error: "Failed to update product", details: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await Promise.resolve(params)
    const result = await query("DELETE FROM products WHERE id = $1 RETURNING *", [Number.parseInt(id, 10)])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("[v0] DELETE product error:", error)
    return NextResponse.json({ error: "Failed to delete product", details: String(error) }, { status: 500 })
  }
}
