"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Download, FileText, Table, Calendar, TrendingUp, DollarSign } from "lucide-react"

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"rentals" | "products">("rentals")

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">REPORTES DEL SISTEMA</h2>
            <p className="text-muted-foreground mt-1">Análisis detallado de alquileres y ventas de productos</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Card className="p-1 bg-white border border-border shadow-sm">
          <div className="flex gap-1">
            <Button
                onClick={() => setActiveTab("rentals")}
                variant={activeTab === "rentals" ? "default" : "ghost"}
                className={`flex-1 gap-2 transition-all ${
                    activeTab === "rentals"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                }`}
            >
              <FileText className="w-4 h-4" />
              ALQUILERES
            </Button>
            <Button
                onClick={() => setActiveTab("products")}
                variant={activeTab === "products" ? "default" : "ghost"}
                className={`flex-1 gap-2 transition-all ${
                    activeTab === "products"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              VENTAS
            </Button>
          </div>
        </Card>

        {/* Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === "rentals" ? <RentalReports /> : <ProductReports />}
        </div>
      </div>
  )
}

// RentalReports Component
function RentalReports() {
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split("T")[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [hasSearched, setHasSearched] = useState(false)

  const formatDateNoTimezone = (dateString: string) => {
    if (!dateString) return "-"
    const [year, month, day] = dateString.split("-")
    return `${day}/${month}/${year}`
  }

  // Calcular el total acumulado
  const calculateTotal = () => {
    return reportData.reduce((sum, item) => sum + (Number(item.total) || 0), 0)
  }

  const fetchRentalsByDateRange = async () => {
    if (!startDate || !endDate) {
      toast.error("Por favor seleccione ambas fechas")
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("La fecha inicial no puede ser mayor a la fecha final")
      return
    }

    try {
      setLoading(true)
      setHasSearched(true)
      const response = await fetch(`/api/rentals/report-range?start=${startDate}&end=${endDate}`)

      if (!response.ok) {
        throw new Error("Error al obtener los datos")
      }

      const data = await response.json()
      setReportData(data)

      if (data.length === 0) {
        toast.info("No se encontraron alquileres en el rango seleccionado")
      } else {
        toast.success(`${data.length} registro${data.length !== 1 ? 's' : ''} cargado${data.length !== 1 ? 's' : ''} exitosamente`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al cargar los datos. Por favor, intente nuevamente")
      setReportData([])
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      toast.loading("Generando PDF...")
      const jsPDF = (await import("jspdf")).default
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()
      const start = formatDateNoTimezone(startDate)
      const end = formatDateNoTimezone(endDate)
      const total = calculateTotal()

      const title = `REPORTE DE ALQUILERES\nDesde ${start} Hasta ${end}`
      doc.setFontSize(14)
      doc.text(title, 105, 15, { align: "center" })

      const tableData = reportData.map((item) => [
        new Date(item.date).toLocaleDateString("es-PE"),
        item.client_name || "-",
        item.client_dni || "-",
        item.num_children || "-",
        item.status || "-",
        item.total ? `S/ ${item.total}` : "-",
      ])

      autoTable(doc, {
        startY: 30,
        head: [["FECHA", "CLIENTE", "DNI", "CANTIDAD", "ESTADO", "TOTAL"]],
        body: tableData,
        foot: [["", "", "", "", "TOTAL GENERAL:", `S/ ${total.toFixed(2)}`]],
        footStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' }
      })

      doc.save(`alquileres-${Date.now()}.pdf`)
      toast.dismiss()
      toast.success("PDF generado exitosamente")
    } catch (error) {
      toast.dismiss()
      toast.error("Error al generar el PDF")
    }
  }

  const handleExportCSV = () => {
    try {
      const total = calculateTotal()

      // Usar punto y coma como delimitador para Excel
      const headers = "FECHA;CLIENTE;DNI;CANTIDAD;ESTADO;TOTAL\n"

      // Crear filas de datos
      const rows = reportData.map((item) => {
        const fecha = item.date ? new Date(item.date).toLocaleDateString("es-PE") : "-"
        const cliente = (item.client_name || "-").toString()
        const dni = (item.client_dni || "-").toString()
        const cantidad = (item.num_children || "-").toString()
        const estado = (item.status || "-").toString()
        const totalItem = (item.total || "-").toString()

        return `${fecha};${cliente};${dni};${cantidad};${estado};${totalItem}`
      }).join("\n")

      // Agregar fila de total
      const totalRow = `\n;;;;TOTAL GENERAL;${total.toFixed(2)}`

      const csv = headers + rows + totalRow

      // BOM para UTF-8 y configuración para Excel
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte-alquileres-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success("CSV descargado exitosamente")
    } catch (error) {
      toast.error("Error al generar el CSV")
    }
  }

  return (
      <div className="space-y-6">
        {/* FILTRO DE RANGO */}
        <Card className="p-6 bg-white border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">FILTRAR ALQUILERES POR RANGO</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium mb-2 text-muted-foreground">Fecha Inicial</label>
              <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium mb-2 text-muted-foreground">Fecha Final</label>
              <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <Button
                onClick={fetchRentalsByDateRange}
                className="self-end bg-primary text-white hover:bg-primary/90 transition-all shadow-sm"
                disabled={loading}
            >
              {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Cargando...
                  </>
              ) : (
                  "Buscar"
              )}
            </Button>
          </div>
        </Card>

        {/* Tarjeta de Total */}
        {/* Tarjeta de Resumen */}
        {/* Tarjeta de Resumen */}
        {/* Resumen compacto */}
        {hasSearched && reportData.length > 0 && (
            <Card className="
    px-4 py-3
    bg-primary/5
    border border-primary/20
    shadow-none
    animate-in fade-in slide-in-from-top-1 duration-300
  ">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                {/* Total */}
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Total acumulado
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      S/ {calculateTotal().toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Registros */}
                <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {reportData.length}
        </span>{" "}
                  registro{reportData.length !== 1 ? "s" : ""}
                </div>
              </div>
            </Card>
        )}





        {/* Export buttons */}
        {hasSearched && reportData.length > 0 && (
            <div className="flex gap-2 justify-end animate-in fade-in slide-in-from-top-2 duration-300">
              <Button
                  onClick={handleExportPDF}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                Exportar PDF
              </Button>
              <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all shadow-sm"
              >
                <Table className="w-4 h-4" />
                Exportar CSV
              </Button>
            </div>
        )}

        {/* TABLA */}
        {loading ? (
            <Card className="p-12 bg-white border border-border shadow-sm">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground">Cargando reportes...</p>
              </div>
            </Card>
        ) : hasSearched && reportData.length > 0 ? (
            <Card className="p-6 bg-white border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Detalle de Alquileres</h3>
                <span className="text-sm text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
              {reportData.length} registro{reportData.length !== 1 ? 's' : ''}
            </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-border">
                  <tr>
                    <th className="py-3 px-4 text-left font-bold text-gray-700">FECHA</th>
                    <th className="py-3 px-4 text-left font-bold text-gray-700">CLIENTE</th>
                    <th className="py-3 px-4 text-left font-bold text-gray-700">DNI</th>
                    <th className="py-3 px-4 text-center font-bold text-gray-700">CANTIDAD</th>
                    <th className="py-3 px-4 text-center font-bold text-gray-700">ESTADO</th>
                    <th className="py-3 px-4 text-right font-bold text-gray-700">TOTAL</th>
                  </tr>
                  </thead>
                  <tbody>
                  {reportData.map((row, idx) => (
                      <tr
                          key={idx}
                          className="border-b border-border hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 whitespace-nowrap">{new Date(row.date).toLocaleDateString("es-PE")}</td>
                        <td className="py-3 px-4">{row.client_name || "-"}</td>
                        <td className="py-3 px-4">{row.client_dni || "-"}</td>
                        <td className="py-3 px-4 text-center">{row.num_children || "-"}</td>
                        <td className="py-3 px-4 text-center">
                      <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.status === "completed" || row.status === "Completado"
                                  ? "bg-green-100 text-green-700"
                                  : row.status === "pending" || row.status === "Pendiente"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {row.status || "-"}
                      </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-primary">
                          {row.total ? `S/ ${Number(row.total).toFixed(2)}` : "-"}
                        </td>
                      </tr>
                  ))}
                  </tbody>
                  <tfoot className="bg-primary/5 border-t-2 border-primary">
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-right font-bold text-gray-700">
                      TOTAL GENERAL:
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-primary text-lg">
                      S/ {calculateTotal().toFixed(2)}
                    </td>
                  </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
        ) : hasSearched ? (
            <Card className="p-12 bg-white border border-border shadow-sm text-center">
              <div className="flex flex-col items-center gap-3">
                <FileText className="w-12 h-12 text-gray-300" />
                <p className="text-muted-foreground">No se encontraron alquileres en el rango seleccionado</p>
              </div>
            </Card>
        ) : null}
      </div>
  )
}

// ProductReports Component
function ProductReports() {
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split("T")[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [hasSearched, setHasSearched] = useState(false)

  const formatDateNoTimezone = (dateString: string) => {
    if (!dateString) return "-"
    const [year, month, day] = dateString.split("-")
    return `${day}/${month}/${year}`
  }

  // Calcular el total acumulado
  const calculateTotal = () => {
    return reportData.reduce((sum, item) => sum + (Number(item.total) || 0), 0)
  }

  const fetchProductsByDateRange = async () => {
    if (!startDate || !endDate) {
      toast.error("Por favor seleccione ambas fechas")
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("La fecha inicial no puede ser mayor a la fecha final")
      return
    }

    try {
      setLoading(true)
      setHasSearched(true)
      const response = await fetch(`/api/sales/report-range?start=${startDate}&end=${endDate}`)

      if (!response.ok) {
        throw new Error("Error al obtener los datos")
      }

      const data = await response.json()
      setReportData(data)

      if (data.length === 0) {
        toast.info("No se encontraron ventas en el rango seleccionado")
      } else {
        toast.success(`${data.length} registro${data.length !== 1 ? 's' : ''} cargado${data.length !== 1 ? 's' : ''} exitosamente`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al cargar los datos. Por favor, intente nuevamente")
      setReportData([])
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      toast.loading("Generando PDF...")
      const jsPDF = (await import("jspdf")).default
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()
      const start = formatDateNoTimezone(startDate)
      const end = formatDateNoTimezone(endDate)
      const total = calculateTotal()

      const title = `REPORTE DE VENTAS\nDesde ${start} Hasta ${end}`
      doc.setFontSize(14)
      doc.text(title, 105, 15, { align: "center" })

      const tableData = reportData.map((item) => [
        new Date(item.date).toLocaleDateString("es-PE"),
        item.product_name || "-",
        item.quantity || "-",
        item.unit_price ? `S/ ${item.unit_price}` : "-",
        item.total ? `S/ ${item.total}` : "-",
      ])

      autoTable(doc, {
        startY: 30,
        head: [["FECHA", "PRODUCTO", "CANTIDAD", "PRECIO UNIT.", "TOTAL"]],
        body: tableData,
        foot: [["", "", "", "TOTAL GENERAL:", `S/ ${total.toFixed(2)}`]],
        footStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' }
      })

      doc.save(`ventas-${Date.now()}.pdf`)
      toast.dismiss()
      toast.success("PDF generado exitosamente")
    } catch (error) {
      toast.dismiss()
      toast.error("Error al generar el PDF")
    }
  }

  const handleExportCSV = () => {
    try {
      const total = calculateTotal()

      // Usar punto y coma como delimitador para Excel
      const headers = "FECHA;PRODUCTO;CANTIDAD;PRECIO UNITARIO;TOTAL\n"

      // Crear filas de datos
      const rows = reportData.map((item) => {
        const fecha = item.date ? new Date(item.date).toLocaleDateString("es-PE") : "-"
        const producto = (item.product_name || "-").toString()
        const cantidad = (item.quantity || "-").toString()
        const precioUnit = (item.unit_price || "-").toString()
        const totalItem = (item.total || "-").toString()

        return `${fecha};${producto};${cantidad};${precioUnit};${totalItem}`
      }).join("\n")

      // Agregar fila de total
      const totalRow = `\n;;;TOTAL GENERAL;${total.toFixed(2)}`

      const csv = headers + rows + totalRow

      // BOM para UTF-8 y configuración para Excel
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte-ventas-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success("CSV descargado exitosamente")
    } catch (error) {
      toast.error("Error al generar el CSV")
    }
  }

  return (
      <div className="space-y-6">
        {/* FILTRO DE RANGO */}
        <Card className="p-6 bg-white border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">FILTRAR VENTAS POR RANGO</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium mb-2 text-muted-foreground">Fecha Inicial</label>
              <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium mb-2 text-muted-foreground">Fecha Final</label>
              <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <Button
                onClick={fetchProductsByDateRange}
                className="self-end bg-primary text-white hover:bg-primary/90 transition-all shadow-sm"
                disabled={loading}
            >
              {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Cargando...
                  </>
              ) : (
                  "Buscar"
              )}
            </Button>
          </div>
        </Card>

        {/* Tarjeta de Total */}
        {/* Resumen compacto */}
        {hasSearched && reportData.length > 0 && (
            <Card className="
    px-4 py-3
    bg-primary/5
    border border-primary/20
    shadow-none
    animate-in fade-in slide-in-from-top-1 duration-300
  ">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                {/* Total */}
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Total General
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      S/ {calculateTotal().toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Registros */}
                <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {reportData.length}
        </span>{" "}
                  registro{reportData.length !== 1 ? "s" : ""}
                </div>
              </div>
            </Card>
        )}


        {/* Export buttons */}
        {hasSearched && reportData.length > 0 && (
            <div className="flex gap-2 justify-end animate-in fade-in slide-in-from-top-2 duration-300">
              <Button
                  onClick={handleExportPDF}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                Exportar PDF
              </Button>
              <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all shadow-sm"
              >
                <Table className="w-4 h-4" />
                Exportar CSV
              </Button>
            </div>
        )}

        {/* TABLA */}
        {loading ? (
            <Card className="p-12 bg-white border border-border shadow-sm">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground">Cargando reportes...</p>
              </div>
            </Card>
        ) : hasSearched && reportData.length > 0 ? (
            <Card className="p-6 bg-white border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Detalle de Ventas</h3>
                <span className="text-sm text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
              {reportData.length} registro{reportData.length !== 1 ? 's' : ''}
            </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-border">
                  <tr>
                    <th className="py-3 px-4 text-left font-bold text-gray-700">FECHA</th>
                    <th className="py-3 px-4 text-left font-bold text-gray-700">PRODUCTO</th>
                    <th className="py-3 px-4 text-center font-bold text-gray-700">CANTIDAD</th>
                    <th className="py-3 px-4 text-right font-bold text-gray-700">PRECIO UNIT.</th>
                    <th className="py-3 px-4 text-right font-bold text-gray-700">TOTAL</th>
                  </tr>
                  </thead>
                  <tbody>
                  {reportData.map((row, idx) => (
                      <tr
                          key={idx}
                          className="border-b border-border hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 whitespace-nowrap">{new Date(row.date).toLocaleDateString("es-PE")}</td>
                        <td className="py-3 px-4">{row.product_name || "-"}</td>
                        <td className="py-3 px-4 text-center">{row.quantity || "-"}</td>
                        <td className="py-3 px-4 text-right">{row.unit_price ? `S/ ${Number(row.unit_price).toFixed(2)}` : "-"}</td>
                        <td className="py-3 px-4 text-right font-bold text-primary">
                          {row.total ? `S/ ${Number(row.total).toFixed(2)}` : "-"}
                        </td>
                      </tr>
                  ))}
                  </tbody>
                  <tfoot className="bg-primary/5 border-t-2 border-primary">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-right font-bold text-gray-700">
                      TOTAL GENERAL:
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-primary text-lg">
                      S/ {calculateTotal().toFixed(2)}
                    </td>
                  </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
        ) : hasSearched ? (
            <Card className="p-12 bg-white border border-border shadow-sm text-center">
              <div className="flex flex-col items-center gap-3">
                <TrendingUp className="w-12 h-12 text-gray-300" />
                <p className="text-muted-foreground">No se encontraron ventas en el rango seleccionado</p>
              </div>
            </Card>
        ) : null}
      </div>
  )
}