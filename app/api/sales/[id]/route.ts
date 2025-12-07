import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// -------------------------------------------------------
// PUT → actualizar venta completa (items + total + stock)
// -------------------------------------------------------
export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // ✅ IMPORTANTE: En Next.js 15+ params es una promesa
        const { id } = await context.params;
        const items = await req.json();

        console.log("📥 PUT recibido - ID:", id, "Items:", items);

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "Items inválidos" },
                { status: 400 }
            );
        }

        // 1️⃣ DEVOLVER STOCK de los items antiguos
        const oldItemsRes = await query(
            `SELECT product_id, quantity FROM sale_items WHERE sale_id = $1`,
            [id]
        );

        console.log("📦 Items antiguos a devolver:", oldItemsRes.rows);

        for (const oldItem of oldItemsRes.rows) {
            await query(
                `UPDATE products
                 SET quantity = quantity + $1
                 WHERE id = $2`,
                [oldItem.quantity, oldItem.product_id]
            );
        }

        // 2️⃣ Borrar items antiguos
        await query(`DELETE FROM sale_items WHERE sale_id = $1`, [id]);

        let newTotal = 0;

        // 3️⃣ Insertar items nuevos Y descontar stock
        for (const it of items) {
            const qty = Number(it.quantity);
            const price = Number(it.unit_price);
            const subtotal = qty * price;

            // Verificar que hay stock suficiente
            const stockRes = await query(
                `SELECT quantity FROM products WHERE id = $1`,
                [it.product_id]
            );

            if (stockRes.rows.length === 0) {
                throw new Error(`Producto ${it.product_id} no existe`);
            }

            const currentStock = Number(stockRes.rows[0].quantity);
            if (currentStock < qty) {
                throw new Error(
                    `Stock insuficiente para producto ${it.product_id}. Disponible: ${currentStock}`
                );
            }

            // Insertar item
            await query(
                `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
                 VALUES ($1, $2, $3, $4, $5)`,
                [id, it.product_id, qty, price, subtotal]
            );

            // Descontar stock
            await query(
                `UPDATE products
                 SET quantity = quantity - $1
                 WHERE id = $2`,
                [qty, it.product_id]
            );

            newTotal += subtotal;
        }

        // 4️⃣ Actualizar total en tabla sales
        await query(
            `UPDATE sales SET total = $1 WHERE id = $2`,
            [newTotal, id]
        );

        console.log("✅ Venta actualizada correctamente - Nuevo total:", newTotal);

        return NextResponse.json({
            message: "Venta actualizada correctamente",
            total: newTotal,
        });
    } catch (error: any) {
        console.error("❌ PUT /api/sales/[id] error:", error);
        return NextResponse.json(
            { error: "Error actualizando venta", details: error.message },
            { status: 500 }
        );
    }
}

// -------------------------------------------------------
// DELETE → eliminar venta completa Y devolver stock
// -------------------------------------------------------
export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // ✅ IMPORTANTE: En Next.js 15+ params es una promesa
        const { id } = await context.params;

        console.log("🗑️ DELETE recibido - ID:", id);

        // 1️⃣ DEVOLVER STOCK antes de eliminar
        const itemsRes = await query(
            `SELECT product_id, quantity FROM sale_items WHERE sale_id = $1`,
            [id]
        );

        console.log("📦 Items a devolver:", itemsRes.rows);

        for (const item of itemsRes.rows) {
            await query(
                `UPDATE products
                 SET quantity = quantity + $1
                 WHERE id = $2`,
                [item.quantity, item.product_id]
            );
        }

        // 2️⃣ Ahora sí eliminar
        await query(`DELETE FROM sale_items WHERE sale_id = $1`, [id]);
        await query(`DELETE FROM sales WHERE id = $1`, [id]);

        console.log("✅ Venta eliminada y stock restaurado");

        return NextResponse.json({ message: "Venta eliminada y stock restaurado" });
    } catch (error) {
        console.error("❌ DELETE /api/sales/[id] error:", error);
        return NextResponse.json(
            { error: "Error eliminando venta" },
            { status: 500 }
        );
    }
}