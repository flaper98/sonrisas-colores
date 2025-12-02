import { query } from "@/lib/db";
import { NextResponse } from "next/server";

function normalizeProduct(row: any) {
  return {
    ...row,
    price: Number(row.price),
    quantity: Number(row.quantity),
    minStock: Number(row.min_stock),
  };
}

export async function GET() {
  try {
    const result = await query("SELECT * FROM products ORDER BY created_at DESC");

    // 🔥 Convertir DECIMALS y enteros a números reales
    const products = result.rows.map(normalizeProduct);

    return NextResponse.json(products);
  } catch (error) {
    console.error("[v0] GET products error:", error);
    return NextResponse.json(
        { error: "Failed to fetch products", details: String(error) },
        { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, price, quantity, description, minStock} = body;

    const result = await query(
        `INSERT INTO products (name, category, price, quantity, description, min_stock) 
       VALUES ($1, $2, $3, $4, $5,$6) RETURNING *`,
        [
          name,
          category,
          Number(price),      // 🔥 Convertir antes de guardar
          Number(quantity),   // 🔥 Convertir antes de guardar
          description || null,
          Number(minStock),
        ]
    );

    // Normalizar el producto insertado
    const product = normalizeProduct(result.rows[0]);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[v0] POST product error:", error);
    return NextResponse.json(
        { error: "Failed to create product", details: String(error) },
        { status: 500 }
    );
  }
}
