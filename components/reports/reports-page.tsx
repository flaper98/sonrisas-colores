"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/ui/card"

import { Calendar, DollarSign, TrendingUp, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"


interface ReportData {
  date: string
  total_income: number
  rentals: number
  average_price: number
  children_served: number

  // Nuevos campos para la tabla por rango
  client_name?: string
  status?: string
  total?: number
}

export function ReportsPage() {
  const [period, setPeriod] = useState<"daily" | "weekly">("daily")
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split("T")[0]

  // Rango de fechas
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [hasSearched, setHasSearched] = useState(false)

  // -------------------
  // FETCH REPORTES BASE
  // -------------------
  useEffect(() => {
    fetchReports()
  }, [period])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rentals/reports?period=${period}&days=30`)
      if (!response.ok) throw new Error("Failed to fetch reports")
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast.error("Error al cargar reportes")
    } finally {
      setLoading(false)
    }
  }

  // -------------------
  // FETCH POR RANGO
  // -------------------
  const fetchRentalsByDateRange = async () => {
    if (!startDate || !endDate) {
      return toast.error("Seleccione ambas fechas")
    }

    try {
      setLoading(true)
      setHasSearched(true)
      const response = await fetch(`/api/rentals/report-range?start=${startDate}&end=${endDate}`)
      if (!response.ok) throw new Error("Error en servidor")

      const data = await response.json()
      setReportData(data)

      toast.success("Reporte por fechas cargado")
    } catch (error) {
      console.error(error)
      toast.error("Error cargando datos por rango")
    } finally {
      setLoading(false)
    }
  }



  // -------------------
  // EXPORTAR PDF
  // -------------------
  const handleExportPDF = () => {
    const doc = new jsPDF()

    doc.text("Reporte de Alquileres", 14, 15)

    const tableData = reportData.map((item) => [
      new Date(item.date).toLocaleDateString("es-PE"),
      item.client_name || "-",
      item.status || "-",
      item.total ? `S/ ${item.total}` : "-",
    ])

    autoTable(doc, {
      startY: 20,
      head: [["Fecha", "Cliente", "Estado", "Total"]],
      body: tableData,
    })

    doc.save(`alquileres-${Date.now()}.pdf`)
    toast.success("PDF generado")
  }


  // -------------------
  // EXPORTAR CSV
  // -------------------
  const handleExportCSV = () => {
    const csv = [
      ["Fecha", "Cliente", "Estado", "Total"],
      ...reportData.map((item) => [
        item.date,
        item.client_name || "",
        item.status || "",
        item.total || "",
      ]),
    ]
        .map((row) => row.join(","))
        .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte-alquileres.csv`
    a.click()

    toast.success("CSV descargado")
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Reportes de Alquileres</h2>
            <p className="text-muted-foreground mt-1">Análisis detallado por fechas</p>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
                onClick={handleExportPDF}
                variant="outline"
                size="sm"
                className="gap-2 border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>

            <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="gap-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
            >
              <Download className="w-4 h-4" />
              CSV
            </Button>
          </div>
        </div>

        {/* FILTRO DE RANGO */}
        <Card className="p-4 bg-white border border-border">
          <h3 className="text-lg font-bold mb-3">Filtrar Alquileres por Rango</h3>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Desde</label>
              <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border rounded-md"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Hasta</label>
              <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 border rounded-md"
              />
            </div>

            <Button
                onClick={fetchRentalsByDateRange}
                className="self-end mt-2 sm:mt-0 bg-primary text-white"
            >
              Buscar
            </Button>
          </div>
        </Card>

        {/* KPIs */}
        {loading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando reportes...</div>
        ) : (
            <>

              {/* TABLA DETALLE RANGO */}
              {hasSearched && (

                  <Card className="p-6 bg-white border border-border">
                <h3 className="text-lg font-bold mb-4">Detalle de Alquileres por Rango</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                    <tr>
                      <th className="py-3 px-4 text-left font-bold">Fecha</th>
                      <th className="py-3 px-4 text-left font-bold">Cliente</th>
                      <th className="py-3 px-4 text-left font-bold">Estado</th>
                      <th className="py-3 px-4 text-left font-bold">Total</th>
                    </tr>
                    </thead>

                    <tbody>
                    {reportData.map((row, idx) => (
                        <tr key={idx} className="border-b border-border hover:bg-gray-100">
                          <td className="py-3 px-4">{new Date(row.date).toLocaleDateString("es-PE")}</td>
                          <td className="py-3 px-4">{row.client_name || "-"}</td>
                          <td className="py-3 px-4">{row.status || "-"}</td>
                          <td className="py-3 px-4 font-bold text-primary">
                            {row.total ? `S/ ${row.total}` : "-"}
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </Card>
                  )}
            </>
        )}
      </div>
  )
}



