import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(request: Request,  context: { params: Promise<{ id: string }> }) {
    try {
        const { name, type } = await request.json()
        const { id } = await context.params

        const result = await query("UPDATE categories SET name = $1, type = $2 WHERE id = $3 RETURNING *", [name, type, id])

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 })
        }

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error("[v0] PUT category error:", error)
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
        console.log("🔎 DELETE category id:", id)

        const result = await query("DELETE FROM categories WHERE id = $1 RETURNING *", [id])

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[v0] DELETE category error:", error)
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
    }
}
