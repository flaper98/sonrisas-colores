import { Pool, type QueryResult } from "pg"

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DATABASE_HOST,
      port: Number.parseInt(process.env.DATABASE_PORT || "5432"),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,

    })
    console.info("pool :" , pool)

    pool.on("error", (err:any) => {
      console.error("[v0] Pool error:", err)
    })
  }
  return pool
}

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const pool = getPool()
  try {
    return await pool.query(text, params)
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
