"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { SalesForm } from "./sales-form";
import { SalesList } from "./sales-list";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, ShoppingBag, Receipt, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useModal } from "@/app/hooks/useModal";
import { Modal } from "@/components/ui/Modal";

export interface SaleItem {
  product_id: number;
  product_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  total: number;
  created_at?: string;
  items: SaleItem[];
}

export function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
      new Date().toISOString().split("T")[0]
  );
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);

  // Modales
  const successCreateModal = useModal();
  const successUpdateModal = useModal();
  const successDeleteModal = useModal();
  const confirmDeleteModal = useModal();

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

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.details || errorData.error);
          }

          successCreateModal.open();
          setShowForm(false);
          fetchSales();
        } catch (e: any) {
          console.error("Error registrando venta:", e);
          toast.error(e.message || "Error al registrar venta");
        }
      },
      [fetchSales, successCreateModal]
  );

  // -------------------------
  // EDITAR VENTA
  // -------------------------
  const handleEditSale = async (id: number, items: any[]) => {
    try {
      const res = await fetch(`/api/sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error);
      }

      successUpdateModal.open();
      setEditingSale(null);
      setShowForm(false);
      fetchSales();
    } catch (error: any) {
      console.error("❌ Error en handleEditSale:", error);
      toast.error(error.message || "No se pudo actualizar la venta");
    }
  };

  // -------------------------
  // CONFIRMAR ELIMINAR
  // -------------------------
  const handleDeleteClick = (id: number) => {
    setSaleToDelete(id);
    confirmDeleteModal.open();
  };

  // -------------------------
  // ELIMINAR VENTA
  // -------------------------
  const handleDeleteConfirm = async () => {
    if (!saleToDelete) return;

    try {
      const res = await fetch(`/api/sales/${saleToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      confirmDeleteModal.close();
      successDeleteModal.open();
      setSaleToDelete(null);
      fetchSales();
    } catch {
      toast.error("No se pudo eliminar la venta");
    }
  };

  // -------------------------
  // MEMOS
  // -------------------------
  const totalSales = useMemo(
      () => sales.reduce((sum, s) => sum + Number(s.total), 0),
      [sales]
  );

  const totalItems = useMemo(
      () =>
          sales.reduce((sum, s) => sum + s.items.reduce((a, i) => a + i.quantity, 0), 0),
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
              onClick={() => {
                setShowForm((v) => !v);
                if (showForm) setEditingSale(null);
              }}
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
              onClick={() =>
                  setSelectedDate(new Date().toISOString().split("T")[0])
              }
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
                saleToEdit={editingSale}
                onSubmit={
                  editingSale
                      ? (items) => handleEditSale(editingSale.id, items)
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
                onDelete={handleDeleteClick}
            />
        )}

        {/* ========================================= */}
        {/* MODAL: VENTA CREADA */}
        {/* ========================================= */}
        <Modal
            show={successCreateModal.show}
            onClose={successCreateModal.close}
            title="¡Venta Registrada!"
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <p className="text-lg font-medium text-gray-800 text-center">
              La venta se registró correctamente
            </p>
            <button
                onClick={successCreateModal.close}
                className="mt-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-md transition"
            >
              Aceptar
            </button>
          </div>
        </Modal>

        {/* ========================================= */}
        {/* MODAL: VENTA ACTUALIZADA */}
        {/* ========================================= */}
        <Modal
            show={successUpdateModal.show}
            onClose={successUpdateModal.close}
            title="¡Venta Actualizada!"
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-blue-600" />
            </div>
            <p className="text-lg font-medium text-gray-800 text-center">
              Los cambios se guardaron correctamente
            </p>
            <button
                onClick={successUpdateModal.close}
                className="mt-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-md transition"
            >
              Aceptar
            </button>
          </div>
        </Modal>

        {/* ========================================= */}
        {/* MODAL: CONFIRMAR ELIMINACIÓN */}
        {/* ========================================= */}
        <Modal
            show={confirmDeleteModal.show}
            onClose={() => {
              confirmDeleteModal.close();
              setSaleToDelete(null);
            }}
            title="¿Eliminar esta venta?"
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-12 h-12 text-red-600" />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                  onClick={() => {
                    confirmDeleteModal.close();
                    setSaleToDelete(null);
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition"
              >
                Cancelar
              </button>
              <button
                  onClick={handleDeleteConfirm}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-md transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </Modal>

        {/* ========================================= */}
        {/* MODAL: VENTA ELIMINADA */}
        {/* ========================================= */}
        <Modal
            show={successDeleteModal.show}
            onClose={successDeleteModal.close}
            title="¡Venta Eliminada!"
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <p className="text-lg font-medium text-gray-800 text-center">
              La venta se eliminó y el stock fue restaurado
            </p>
            <button
                onClick={successDeleteModal.close}
                className="mt-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-md transition"
            >
              Aceptar
            </button>
          </div>
        </Modal>
      </div>
  );
}