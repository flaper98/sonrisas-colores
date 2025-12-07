// app/api/sales/report-range/route.ts
import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

// Configuración usando tus variables de entorno
const pool = new Pool({
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
})

export async function GET(request: NextRequest) {
    console.log("📊 Iniciando reporte de ventas...")

    try {
        const searchParams = request.nextUrl.searchParams
        const start = searchParams.get("start")
        const end = searchParams.get("end")

        console.log("📅 Rango de fechas:", { start, end })

        if (!start || !end) {
            return NextResponse.json(
                { error: "Se requieren las fechas start y end" },
                { status: 400 }
            )
        }

        // Prueba de conexión
        console.log("🔌 Intentando conectar a la base de datos...")
        const testConnection = await pool.query("SELECT NOW()")
        console.log("✅ Conexión exitosa:", testConnection.rows[0])

        // Query principal
        const query = `
      SELECT 
        DATE(s.created_at) as date,
        p.name as product_name,
        si.quantity,
        si.unit_price,
        si.subtotal as total,
        s.id as sale_id
      FROM sales s
      INNER JOIN sale_items si ON s.id = si.sale_id
      INNER JOIN products p ON si.product_id = p.id
      WHERE DATE(s.created_at) BETWEEN $1 AND $2
      ORDER BY s.created_at DESC, s.id DESC
    `

        console.log("🔍 Ejecutando query...")
        const { rows } = await pool.query(query, [start, end])
        console.log(`✅ Se encontraron ${rows.length} registros`)

        // Formateamos los datos
        const reportData = rows.map(row => ({
            date: row.date,
            product_name: row.product_name,
            quantity: parseInt(row.quantity),
            unit_price: parseFloat(row.unit_price),
            total: parseFloat(row.total),
            sale_id: row.sale_id
        }))

        console.log("📦 Datos formateados:", reportData.length, "registros")
        return NextResponse.json(reportData)

    } catch (error: any) {
        console.error("❌ ERROR COMPLETO:", error)
        console.error("❌ Error message:", error.message)
        console.error("❌ Error stack:", error.stack)

        return NextResponse.json(
            {
                error: "Error interno del servidor",
                details: error.message,
                hint: "Revisa los logs del servidor para más detalles"
            },
            { status: 500 }
        )
    }
}