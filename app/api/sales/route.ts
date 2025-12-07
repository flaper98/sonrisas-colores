import { query } from "@/lib/db";
import { NextResponse } from "next/server";


// -------------------------------------------------------
// GET → listar ventas con sus items
// -------------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const salesRes = await query(
        `
      SELECT * FROM sales
      WHERE DATE(created_at) BETWEEN $1 AND $2
      ORDER BY created_at DESC
      `,
        [startDate, endDate]
    );

    const sales = salesRes.rows;

    for (const sale of sales) {
      const itemsRes = await query(
          `
        SELECT si.*, p.name AS product_name, p.category
        FROM sale_items si
        JOIN products p ON p.id = si.product_id
        WHERE si.sale_id = $1
        `,
          [sale.id]
      );

      sale.items = itemsRes.rows;
    }

    return NextResponse.json(sales);

  } catch (error) {
    console.error("[GET sales error]:", error);
    return NextResponse.json(
        { error: "Error al obtener ventas" },
        { status: 500 }
    );
  }
}

// -------------------------------------------------------
// POST → registrar nueva venta completa
// -------------------------------------------------------
export async function POST(request: Request) {
  try {
    const items = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
          { error: "Debe enviar al menos un item" },
          { status: 400 }
      );
    }

    // Crear la venta principal
    const saleRes = await query(
        `INSERT INTO sales (total) VALUES (0) RETURNING id`
    );

    const saleId = saleRes.rows[0].id;
    let totalVenta = 0;

    for (const item of items) {
      const qty = Number(item.quantity);
      const price = Number(item.unit_price);
      const subtotal = qty * price;

      // Verificar stock
      const stockRes = await query(
          `SELECT quantity FROM products WHERE id = $1`,
          [item.product_id]
      );

      if (stockRes.rows.length === 0) {
        throw new Error(`Producto ${item.product_id} no existe`);
      }

      if (Number(stockRes.rows[0].quantity) < qty) {
        throw new Error(`Stock insuficiente para producto ${item.product_id}`);
      }

      // Registrar item
      await query(
          `
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
        VALUES ($1, $2, $3, $4, $5)
        `,
          [saleId, item.product_id, qty, price, subtotal]
      );

      // Actualizar stock
      await query(
          `UPDATE products SET quantity = quantity - $1 WHERE id = $2`,
          [qty, item.product_id]
      );

      totalVenta += subtotal;
    }

    // Actualizar total final
    await query(
        `UPDATE sales SET total = $1 WHERE id = $2`,
        [totalVenta, saleId]
    );

    return NextResponse.json({
      message: "Venta registrada correctamente",
      sale_id: saleId,
      total: totalVenta,
    });

  } catch (error: any) {
    console.error("POST /api/sales error:", error);
    return NextResponse.json(
        { error: "Error registrando venta", details: error.message },
        { status: 500 }
    );
  }
}
