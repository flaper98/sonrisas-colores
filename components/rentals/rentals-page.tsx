"use client";

import { useEffect, useState } from "react";
import { RentalForm } from "./rental-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { RentalsTable } from "@/components/rentals/RentalsTable";
import { Modal } from "@/components/ui/Modal";
import { useModal } from "@/app/hooks/useModal";
import type { Rental } from "@/components/types/rental";
import type { RentalFormData } from "@/components/types/rentalFormData";

export function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [filtered, setFiltered] = useState<Rental[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rentalToEdit, setRentalToEdit] = useState<Rental | null>(null);
  const [isRealEdit, setIsRealEdit] = useState(false);

  // ⭐ NUEVOS ESTADOS DE FILTRO
  const [filterDate, setFilterDate] = useState("today");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const successModal = useModal();

  // ==========================
  // CARGAR ALQUILERES
  // ==========================
  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rentals?limit=100");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRentals(data);
      setFiltered(data);
    } catch (e) {
      toast.error("Error al cargar alquileres");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  //   FILTROS AVANZADOS
  // ==========================
  useEffect(() => {
    filterRentals();
  }, [rentals, filterDate, search, statusFilter]);

  const filterRentals = () => {
    let result = [...rentals];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // === FILTRO POR FECHA ===
    if (filterDate === "today") {
      result = result.filter((r) => {
        const st = new Date(r.start_time);
        return st.toDateString() === today.toDateString();
      });
    }

    if (filterDate === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      result = result.filter((r) => new Date(r.start_time) >= weekAgo);
    }

    if (filterDate === "month") {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      result = result.filter((r) => new Date(r.start_time) >= monthAgo);
    }

    // === FILTRO POR ESTADO ===
    const now = new Date().getTime();

    result = result.filter((r) => {
      const end = new Date(r.end_time).getTime();
      const diff = end - now;

      if (statusFilter === "active") {
        return r.status !== "completed" && diff > 5 * 60000;
      }
      if (statusFilter === "expiring") {
        return r.status !== "completed" && diff > 0 && diff <= 5 * 60000;
      }
      if (statusFilter === "expired") {
        return r.status !== "completed" && diff <= 0;
      }
      if (statusFilter === "completed") {
        return r.status === "completed";
      }
      return true;
    });

    // === BÚSQUEDA ===
    if (search.trim() !== "") {
      result = result.filter(
          (r) =>
              r.client_name.toLowerCase().includes(search.toLowerCase()) ||
              r.client_dni.includes(search)
      );
    }

    setFiltered(result);
  };

  // ==========================
  // ABRIR FORMULARIOS
  // ==========================
  const openCreateForm = () => {
    setRentalToEdit(null);
    setIsRealEdit(false);
    setShowForm(true);
  };

  const openEditForm = (rental: Rental) => {
    setIsRealEdit(false);
    setRentalToEdit(rental);
    setShowForm(true);
  };

  const openRealEditForm = (rental: Rental) => {
    setIsRealEdit(true);
    setRentalToEdit(rental);
    setShowForm(true);
  };

  const closeForm = () => {
    setRentalToEdit(null);
    setShowForm(false);
  };

  // ==========================
  // EDITAR DATOS
  // ==========================
  const handleRealEditRental = async (data: RentalFormData, rentalId?: number) => {
    try {
      const rental = rentals.find((r) => r.id === rentalId);
      if (!rental) return;

      const start = new Date(data.start_time);
      const end = new Date(start.getTime() + data.duration_minutes * 60000);

      const startLocal = new Date(start.getTime() - start.getTimezoneOffset() * 60000)
          .toISOString()
          .replace("Z", "");

      const endLocal = new Date(end.getTime() - end.getTimezoneOffset() * 60000)
          .toISOString()
          .replace("Z", "");

      const res = await fetch(`/api/rentals/${rentalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          start_time: startLocal,
          end_time: endLocal,
          discount_applied: rental.discount_applied,
          discount_amount: rental.discount_amount,
          status: rental.status,
          notes: rental.notes,
        }),
      });

      if (!res.ok) throw new Error();

      await fetchRentals();
      closeForm();
      toast.success("Datos actualizados");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar el alquiler");
    }
  };

  // ==========================
  // EXTENDER ALQUILER
  // ==========================
  const handleUpdateRental = async (data: RentalFormData, rentalId?: number) => {
    try {
      const rental = rentals.find((r) => r.id === rentalId);
      if (!rental) return;

      const newDuration = rental.duration_minutes + data.duration_minutes;
      const start = new Date(rental.start_time);
      const newEnd = new Date(start.getTime() + newDuration * 60000);

      const endLocal = new Date(newEnd.getTime() - newEnd.getTimezoneOffset() * 60000)
          .toISOString()
          .replace("Z", "");

      const newTotal = rental.total_price + data.total_price;

      const res = await fetch(`/api/rentals/${rentalId}/extend`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration_minutes: newDuration,
          total_price: newTotal,
          end_time: endLocal,
          status: rental.status,
        }),
      });

      if (!res.ok) throw new Error();

      await fetchRentals();
      closeForm();
      toast.success("Tiempo extendido");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo extender");
    }
  };

  // ==========================
  // CREAR ALQUILER NUEVO
  // ==========================
  const handleCreateRental = async (data: RentalFormData) => {
    try {
      const start = new Date(data.start_time);
      const end = new Date(start.getTime() + data.duration_minutes * 60000);

      const startLocal = new Date(start.getTime() - start.getTimezoneOffset() * 60000)
          .toISOString()
          .replace("Z", "");

      const endLocal = new Date(end.getTime() - end.getTimezoneOffset() * 60000)
          .toISOString()
          .replace("Z", "");

      const res = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          start_time: startLocal,
          end_time: endLocal,
        }),
      });

      if (!res.ok) throw new Error();

      await fetchRentals();
      closeForm();
      toast.success("Alquiler registrado");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo registrar el alquiler");
    }
  };

  // ==========================
  // COMPLETAR ALQUILER
  // ==========================
  const handleCompleteRental = async (id: number) => {
    try {
      const rental = rentals.find((r) => r.id === id);
      if (!rental) return;

      const res = await fetch(`/api/rentals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rental, status: "completed" }),
      });

      if (!res.ok) throw new Error();

      await fetchRentals();
      toast.success("Alquiler completado");
    } catch (e) {
      toast.error("Error completando alquiler");
    }
  };

  return (
      <div className="space-y-6">

        {/* ======================
          FILTROS SUPERIORES
      ======================= */}
        <div className="bg-white border p-4 rounded-xl shadow-sm space-y-3">

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Alquileres</h2>

            <Button onClick={openCreateForm} className="bg-primary text-white gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Alquiler
            </Button>
          </div>

          {/* ========== FILTRO DE FECHA ========== */}
          <div className="flex gap-2">
            <Button
                variant={filterDate === "today" ? "default" : "outline"}
                onClick={() => setFilterDate("today")}
            >
              Hoy
            </Button>

            <Button
                variant={filterDate === "week" ? "default" : "outline"}
                onClick={() => setFilterDate("week")}
            >
              Últimos 7 días
            </Button>

            <Button
                variant={filterDate === "month" ? "default" : "outline"}
                onClick={() => setFilterDate("month")}
            >
              Últimos 30 días
            </Button>

            <Button
                variant={filterDate === "all" ? "default" : "outline"}
                onClick={() => setFilterDate("all")}
            >
              Todos
            </Button>
          </div>

          {/* ========== BÚSQUEDA ========== */}
          <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              className="w-full border px-3 py-2 rounded-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
          />

          {/* ========== FILTRO POR ESTADO ========== */}
          <div className="flex gap-2">
            <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
            >
              Todos
            </Button>

            <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => setStatusFilter("active")}
            >
              🟢 Activos
            </Button>

            <Button
                variant={statusFilter === "expiring" ? "default" : "outline"}
                onClick={() => setStatusFilter("expiring")}
            >
              🟡 Por vencer
            </Button>

            <Button
                variant={statusFilter === "expired" ? "default" : "outline"}
                onClick={() => setStatusFilter("expired")}
            >
              🔴 Vencidos
            </Button>

            <Button
                variant={statusFilter === "completed" ? "default" : "outline"}
                onClick={() => setStatusFilter("completed")}
            >
              🔵 Completados
            </Button>
          </div>
        </div>

        {/* ======================
          FORMULARIO
      ======================= */}
        {showForm && (
            <div className="border rounded-xl bg-white p-6 shadow-sm">
              <RentalForm
                  rentalToEdit={rentalToEdit}
                  isRealEdit={isRealEdit}
                  onSubmit={
                    rentalToEdit
                        ? isRealEdit
                            ? handleRealEditRental
                            : handleUpdateRental
                        : handleCreateRental
                  }
                  onCancel={closeForm}
              />
            </div>
        )}

        {/* ======================
          TABLA FILTRADA
      ======================= */}
        {!loading && (
            <RentalsTable
                rentals={filtered}
                onComplete={handleCompleteRental}
                onEdit={openEditForm}
                onRealEdit={openRealEditForm}
            />
        )}

        {/* ======================
          MODAL
      ======================= */}
        <Modal show={successModal.show} onClose={successModal.close} title="Alquiler registrado">
          <div className="text-green-600 text-6xl animate-bounce">🎉</div>
          <p className="text-lg font-medium">¡El alquiler se registró con éxito!</p>

          <button
              onClick={successModal.close}
              className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Aceptar
          </button>
        </Modal>

      </div>
  );
}
