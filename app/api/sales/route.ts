import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let sql =
        "SELECT s.*, p.name as product_name, p.category FROM sales s JOIN products p ON s.product_id = p.id";
    const params: any[] = [];

    if (startDate && endDate) {
      sql += " WHERE DATE(s.created_at) BETWEEN $1 AND $2";
      params.push(startDate, endDate);
    }

    sql += " ORDER BY s.created_at DESC LIMIT 1000";

    const result = await query(sql, params);
    return NextResponse.json(
        result.rows.map((r: any) => ({
          ...r,
          total_price: Number(r.total_price),
          unit_price: Number(r.unit_price),
          quantity: Number(r.quantity),
        }))
    );
  } catch (error) {
    console.error("[v0] GET sales error:", error);
    return NextResponse.json(
        { error: "Failed to fetch sales", details: String(error) },
        { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const items = await request.json();
    console.log("RECIBIDO EN API:", items);

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
          { error: "Debe enviar al menos un producto" },
          { status: 400 }
      );
    }

    const results: any[] = [];

    for (const item of items) {
      const { product_id, quantity, unit_price, notes } = item;

      const qty = Number(quantity);
      const price = Number(unit_price);
      const totalPrice = qty * price;

      if (!product_id || qty <= 0 || price <= 0) {
        return NextResponse.json(
            { error: "Formato de venta inválido" },
            { status: 400 }
        );
      }

      // Verificar stock
      const stockRes = await query(
          `SELECT quantity FROM products WHERE id = $1`,
          [product_id]
      );

      if (stockRes.rows.length === 0) {
        return NextResponse.json(
            { error: `Producto ${product_id} no encontrado` },
            { status: 404 }
        );
      }

      const currentStock = Number(stockRes.rows[0].quantity);

      if (currentStock < qty) {
        return NextResponse.json(
            {
              error: `Stock insuficiente para producto ${product_id}. Disponible: ${currentStock}`,
            },
            { status: 400 }
        );
      }

      // Registrar venta
      const insertRes = await query(
          `INSERT INTO sales (product_id, quantity, unit_price, total_price, notes)
           VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
          [product_id, qty, price, totalPrice, notes || null]
      );

      // Reducir stock
      await query(
          `UPDATE products SET quantity = quantity - $1 WHERE id = $2`,
          [qty, product_id]
      );

      results.push(insertRes.rows[0]);
    }

    return NextResponse.json(
        { message: "Ventas registradas", items: results },
        { status: 201 }
    );
  } catch (error) {
    console.error("[v0] POST sale error:", error);
    return NextResponse.json(
        { error: "Failed to create sale", details: String(error) },
        { status: 500 }
    );
  }
}
