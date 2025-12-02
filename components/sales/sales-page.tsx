"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { SalesForm } from "./sales-form";
import { SalesList } from "./sales-list";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, ShoppingBag, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useModal } from "@/app/hooks/useModal";
import { Modal } from "@/components/ui/Modal";

export interface Sale {
  id: number;
  product_id: number;
  product_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  created_at?: string;
}

export function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
      new Date().toISOString().split("T")[0]
  );
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const successModal = useModal();

  // -------------------------
  // CARGAR VENTAS
  // -------------------------
  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
          `/api/sales?startDate=${selectedDate}&endDate=${selectedDate}`
      );

      if (!res.ok) throw new Error("Error fetching sales");

      setSales(await res.json());
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // -------------------------
  // REGISTRAR VENTA
  // -------------------------
  const handleAddSale = useCallback(
      async (items: any[]) => {
        try {
          const res = await fetch("/api/sales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(items),
          });

          if (!res.ok) throw new Error();

          successModal.open();
          setShowForm(false);
          fetchSales();
        } catch (e) {
          toast.error("Error al registrar venta");
        }
      },
      [fetchSales, successModal]
  );

  // -------------------------
  // EDITAR VENTA
  // -------------------------
  const handleEditSale = async (id: number, data: any) => {
    try {
      const res = await fetch(`/api/sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast.success("Venta actualizada");
      setEditingSale(null);
      fetchSales();
    } catch {
      toast.error("No se pudo actualizar la venta");
    }
  };

  // -------------------------
  // ELIMINAR VENTA
  // -------------------------
  const handleDeleteSale = async (id: number) => {
    if (!confirm("¿Eliminar esta venta?")) return;

    try {
      const res = await fetch(`/api/sales/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Venta eliminada");
      fetchSales();
    } catch {
      toast.error("No se pudo eliminar la venta");
    }
  };

  // -------------------------
  // MEMOS
  // -------------------------
  const totalSales = useMemo(
      () => sales.reduce((sum, s) => sum + Number(s.total_price), 0),
      [sales]
  );

  const totalItems = useMemo(
      () => sales.reduce((sum, s) => sum + s.quantity, 0),
      [sales]
  );

  // -------------------------
  // UI
  // -------------------------
  return (
      <div className="space-y-10">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Ventas de Productos
            </h2>
            <p className="text-muted-foreground mt-1">
              Registra ventas de golosinas, libros y otros productos
            </p>
          </div>

          <Button
              onClick={() => setShowForm((v) => !v)}
              className="bg-gradient-to-r from-accent to-accent-orange text-white shadow-md hover:shadow-lg gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Cancelar" : "Nueva Venta"}
          </Button>
        </div>

        {/* FILTRO FECHA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-2 border rounded-xl shadow-sm">
            <Calendar className="w-5 h-5 text-accent" />
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent outline-none"
            />
          </div>

          <Button
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-white"
              onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
          >
            Hoy
          </Button>
        </div>

        {/* CARDS ESTADÍSTICOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-yellow-100 border border-yellow-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Total Ventas</p>
              <p className="text-4xl font-bold text-yellow-800 mt-1">
                S/ {totalSales.toFixed(2)}
              </p>
            </div>
            <Receipt className="w-14 h-14 text-yellow-400 opacity-80" />
          </div>

          <div className="bg-blue-100 border border-blue-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Artículos Vendidos</p>
              <p className="text-4xl font-bold text-blue-800 mt-1">
                {totalItems}
              </p>
            </div>
            <ShoppingBag className="w-14 h-14 text-blue-400 opacity-80" />
          </div>

        </div>

        {/* FORMULARIO */}
        {showForm && (
            <SalesForm
                onSubmit={
                  editingSale
                      ? (data) => handleEditSale(editingSale.id, data)
                      : handleAddSale
                }
                onCancel={() => {
                  setShowForm(false);
                  setEditingSale(null);
                }}
            />
        )}

        {/* LISTADO */}
        {loading ? (
            <div className="text-center py-16 text-muted-foreground">
              Cargando ventas...
            </div>
        ) : (
            <SalesList
                sales={sales}
                onRefresh={fetchSales}
                onEdit={(sale) => {
                  setEditingSale(sale);
                  setShowForm(true);
                }}
                onDelete={handleDeleteSale}
            />
        )}

        {/* MODAL ÉXITO */}
        <Modal
            show={successModal.show}
            onClose={successModal.close}
            title="Venta registrada"
        >
          <div className="text-green-600 text-6xl animate-bounce">🎉</div>

          <p className="text-lg font-medium">
            ¡La venta se registró correctamente!
          </p>

          <button
              onClick={successModal.close}
              className="px-6 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Aceptar
          </button>
        </Modal>

      </div>
  );
}
