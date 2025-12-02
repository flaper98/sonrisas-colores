"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import { toast } from "sonner"
import type { Rental } from "@/components/types/rental";

/*interface Rental {
  id: number
  num_children: number
  duration_minutes: number
  start_time: string
  end_time: string
  total_price: number
  discount_applied: boolean
  discount_amount: number
  status: string
  product_name?: string
  created_at?: string
}*/

export function RentalsByDate() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRentalsByDate()
  }, [selectedDate])

  const fetchRentalsByDate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rentals/by-date?date=${selectedDate}`)
      if (!response.ok) throw new Error("Failed to fetch rentals")
      const data = await response.json()
      setRentals(data)
    } catch (error) {
      console.error("[v0] Error fetching rentals:", error)
      toast.error("Error al cargar alquileres")
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    setSelectedDate(date.toISOString().split("T")[0])
  }

  const handleNextDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    setSelectedDate(date.toISOString().split("T")[0])
  }

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0])
  }

  const totalIncome = rentals.reduce((sum, r) => sum + r.total_price, 0)
  const activeRentals = rentals.filter((r) => r.status === "active").length
  const completedRentals = rentals.filter((r) => r.status === "completed").length

  const handleExportPDF = () => {
    toast.info("Exportar PDF - En desarrollo")
  }

  const handleExportExcel = () => {
    const csv = [
      ["Hora Inicio", "Hora Fin", "Niños", "Duración", "Ingreso", "Estado"],
      ...rentals.map((r) => [
        new Date(r.start_time).toLocaleTimeString("es-PE"),
        new Date(r.end_time).toLocaleTimeString("es-PE"),
        r.num_children,
        `${r.duration_minutes} min`,
        `S/ ${r.total_price}`,
        r.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `alquileres-${selectedDate}.csv`
    a.click()
    toast.success("Reporte descargado")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Alquileres del Día</h2>
          <p className="text-muted-foreground mt-1">Selecciona una fecha para ver los alquileres</p>
        </div>
      </div>

      {/* Date Selector */}
      <Card className="p-6 bg-white border-2 border-border">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            onClick={handlePreviousDay}
            variant="outline"
            size="sm"
            className="gap-2 border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-border flex-1"
          />

          <Button
            onClick={handleNextDay}
            variant="outline"
            size="sm"
            className="gap-2 border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleToday}
            variant="outline"
            size="sm"
            className="gap-2 border-secondary text-secondary hover:bg-secondary hover:text-white bg-transparent"
          >
            Hoy
          </Button>

          <Button
            onClick={handleExportExcel}
            variant="outline"
            size="sm"
            className="gap-2 border-accent-orange text-accent-orange hover:bg-accent-orange hover:text-white bg-transparent"
          >
            <Download className="w-4 h-4" />
            Excel
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary to-primary-light text-white border-none">
          <p className="text-sm opacity-90">Total Ingresos</p>
          <p className="text-3xl font-bold">S/ {totalIncome.toFixed(2)}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-secondary to-secondary-light text-white border-none">
          <p className="text-sm opacity-90">Alquileres Activos</p>
          <p className="text-3xl font-bold">{activeRentals}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-accent to-accent-orange text-white border-none">
          <p className="text-sm opacity-90">Completados</p>
          <p className="text-3xl font-bold">{completedRentals}</p>
        </Card>
      </div>

      {/* Rentals List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando alquileres...</div>
      ) : rentals.length === 0 ? (
        <Card className="p-12 text-center bg-white border-2 border-muted">
          <p className="text-muted-foreground">No hay alquileres para esta fecha</p>
        </Card>
      ) : (
        <Card className="p-6 bg-white border-2 border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-border">
              <tr>
                <th className="text-left py-3 px-4 font-bold text-foreground">Hora Inicio</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Hora Fin</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Niños</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Duración</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Ingreso</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Descuento</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
                <tr key={rental.id} className="border-b border-border hover:bg-card transition-colors">
                  <td className="py-3 px-4 text-foreground">
                    {new Date(rental.start_time).toLocaleTimeString("es-PE")}
                  </td>
                  <td className="py-3 px-4 text-foreground">{new Date(rental.end_time).toLocaleTimeString("es-PE")}</td>
                  <td className="py-3 px-4 text-foreground font-medium">{rental.num_children}</td>
                  <td className="py-3 px-4 text-foreground">{rental.duration_minutes} min</td>
                  <td className="py-3 px-4 font-bold text-primary">S/ {rental.total_price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-foreground">
                    {rental.discount_applied ? `S/ ${rental.discount_amount.toFixed(2)}` : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        rental.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : rental.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {rental.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
