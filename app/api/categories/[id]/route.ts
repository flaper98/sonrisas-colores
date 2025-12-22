import { query } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET - Obtener una categoría por ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const result = await query(
            "SELECT * FROM categories WHERE id = $1",
            [Number.parseInt(id, 10)]
        )

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error("GET category error:", error)
        return NextResponse.json(
            { error: "Failed to fetch category", details: String(error) },
            { status: 500 }
        )
    }
}

// PUT - Actualizar una categoría
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { name, type } = body

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: "Category name is required" },
                { status: 400 }
            )
        }

        const result = await query(
            `UPDATE categories 
       SET name = $1, type = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
            [name.trim(), type || "sale", Number.parseInt(id, 10)]
        )

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(result.rows[0])
    } catch (error: any) {
        console.error("PUT category error:", error)

        // Manejar violación de unique constraint
        if (error.code === "23505") {
            return NextResponse.json(
                {
                    error: "Duplicate category",
                    details: "Ya existe una categoría con este nombre",
                },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: "Failed to update category", details: String(error) },
            { status: 500 }
        )
    }
}

// DELETE - Eliminar una categoría
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const categoryId = Number(id);

        // 1. Verificar si hay productos asociados
        const productsCheck = await query(
            `SELECT COUNT(*) AS count
             FROM products
             WHERE id = $1`,
            [categoryId]
        );

        if (Number(productsCheck.rows[0].count) > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete category",
                    details: `La categoría tiene ${productsCheck.rows[0].count} producto(s) asociados.`,
                },
                { status: 409 }
            );
        }

        // 2. Verificar si hay alquileres asociados
        const rentalsCheck = await query(
            `SELECT COUNT(*) AS count
             FROM rentals
             WHERE id = $1`,
            [categoryId]
        );

        if (Number(rentalsCheck.rows[0].count) > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete category",
                    details: `La categoría tiene ${rentalsCheck.rows[0].count} alquiler(es) asociados.`,
                },
                { status: 409 }
            );
        }

        // 3. Eliminar categoría
        const result = await query(
            `DELETE FROM categories WHERE id = $1 RETURNING *`,
            [categoryId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Category deleted successfully",
            category: result.rows[0],
        });

    } catch (error: any) {
        console.error("DELETE category error:", error);

        return NextResponse.json(
            {
                error: "Failed to delete category",
                details: error.message ?? String(error),
            },
            { status: 500 }
        );
    }
}
