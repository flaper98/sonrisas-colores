import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// PUT: editar venta
export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    const body = await req.json()

    try {
        await query(
            `UPDATE sales
             SET product_id=$1, quantity=$2, unit_price=$3, total_price=$4, notes=$5
             WHERE id=$6`,
            [
                body.product_id,
                body.quantity,
                body.unit_price,
                body.quantity * body.unit_price,
                body.notes || null,
                id
            ]
        )

        return NextResponse.json({ message: "updated" })
    } catch (error) {
        console.error("PUT /api/sales/[id] error:", error)
        return NextResponse.json({ error: "Error updating sale" }, { status: 500 })
    }
}

// DELETE: eliminar venta
export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params

    try {
        await query(`DELETE FROM sales WHERE id=$1`, [id])
        return NextResponse.json({ message: "deleted" })
    } catch (error) {
        console.error("DELETE /api/sales/[id] error:", error)
        return NextResponse.json({ error: "Error deleting sale" }, { status: 500 })
    }
}
