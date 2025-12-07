import { query } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await query(
        "SELECT * FROM products WHERE id = $1",
        [Number.parseInt(id, 10)]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("GET product error:", error)
    return NextResponse.json(
        { error: "Failed to fetch product", details: String(error) },
        { status: 500 }
    )
  }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, category, price, quantity, description, minStock } = body

    const result = await query(
        `UPDATE products 
       SET name = $1, category = $2, price = $3, quantity = $4, 
           description = $5, min_stock = $6, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 
       RETURNING *`,
        [
          name,
          category,
          Number.parseFloat(price),
          Number.parseInt(quantity, 10),
          description || null,
          Number(minStock ?? 0),
          Number.parseInt(id, 10),
        ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("PUT product error:", error)
    return NextResponse.json(
        { error: "Failed to update product", details: String(error) },
        { status: 500 }
    )
  }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = Number.parseInt(id, 10)

    // ✅ 1. Verificar si el producto tiene ventas asociadas
    const salesCheck = await query(
        `SELECT COUNT(*) as count 
       FROM sale_items 
       WHERE product_id = $1`,
        [productId]
    )

    const salesCount = Number(salesCheck.rows[0]?.count || 0)

    if (salesCount > 0) {
      return NextResponse.json(
          {
            error: "Cannot delete product",
            details: `Este producto no se puede eliminar porque tiene ${salesCount} venta(s) registrada(s). Primero elimina las ventas asociadas.`,
          },
          { status: 409 } // 409 Conflict
      )
    }

    // ✅ 2. Si no tiene ventas, eliminar
    const result = await query(
        "DELETE FROM products WHERE id = $1 RETURNING *",
        [productId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Product deleted successfully",
      product: result.rows[0],
    })
  } catch (error: any) {
    console.error("DELETE product error:", error)

    // Manejar error de constraint de PostgreSQL
    if (error.code === "23503") {
      return NextResponse.json(
          {
            error: "Cannot delete product",
            details:
                "Este producto está siendo usado en ventas registradas. No se puede eliminar.",
          },
          { status: 409 }
      )
    }

    return NextResponse.json(
        { error: "Failed to delete product", details: String(error) },
        { status: 500 }
    )
  }
}