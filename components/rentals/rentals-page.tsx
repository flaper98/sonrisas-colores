"use client";

import { useEffect, useState } from "react";
import { RentalForm } from "./rental-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { RentalsTable } from "@/components/rentals/RentalsTable";
import { Modal } from "@/components/ui/Modal";
import { useModal } from "@/app/hooks/useModal";
import { Skeleton } from "@/components/ui/skeleton";
import type { Rental } from "@/components/types/rental";
import type { RentalFormData } from "@/components/types/rentalFormData";

/*export interface Rental {
  id: number;
  client_name: string;
  client_dni: string;
  num_children: number;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  total_price: number;
  discount_applied: boolean;
  discount_amount: number;
  status: "active" | "completed" | "cancelled";
  notes?: string;
}*/

export function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rentalToEdit, setRentalToEdit] = useState<Rental | null>(null);
  const [isRealEdit, setIsRealEdit] = useState(false);

  const successModal = useModal();

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/rentals?limit=100");
      if (!response.ok) throw new Error("Error fetching rentals");

      const data = await response.json();
      setRentals(data);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar alquileres");
    } finally {
      setLoading(false);
    }
  };

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
    setShowForm(false);
    setRentalToEdit(null);
  };


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
          client_name: data.client_name,
          client_dni: data.client_dni,
          num_children: data.num_children,
          duration_minutes: data.duration_minutes,
          total_price: data.total_price,
          start_time: startLocal,
          end_time: endLocal,
          discount_applied: rental.discount_applied,
          discount_amount: rental.discount_amount,
          status: rental.status,
          notes: rental.notes,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      await fetchRentals();
      closeForm();
      toast.success("Datos actualizados");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo actualizar");
    }
  };

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

      if (!res.ok) throw new Error("Extend failed");

      await fetchRentals();
      closeForm();
      toast.success("Tiempo extendido");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo extender");
    }
  };

  const handleCompleteRental = async (id: number) => {
    try {
      const rental = rentals.find((r) => r.id === id);
      if (!rental) return;

      const res = await fetch(`/api/rentals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rental, status: "completed" }),
      });

      if (!res.ok) throw new Error("Complete failed");

      await fetchRentals();
      toast.success("Alquiler completado");
    } catch (e) {
      console.error(e);
      toast.error("Error completando alquiler");
    }
  };

  return (
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Alquileres</h2>
            <p className="text-muted-foreground mt-1">
              Gestiona los alquileres activos y completados
            </p>
          </div>

          <Button
              onClick={openCreateForm}
              className="bg-primary text-white hover:bg-primary/90 shadow-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Alquiler
          </Button>
        </div>

        {/* FORM */}
        {showForm && (
            <div className="border rounded-xl bg-white p-6 shadow-sm">
              <RentalForm
                  rentalToEdit={rentalToEdit}
                  isRealEdit={isRealEdit}
                  onSubmit={isRealEdit ? handleRealEditRental : handleUpdateRental}
                  onCancel={closeForm}
              />
            </div>
        )}

        {/* TABLA */}
        {!loading &&(
            <RentalsTable
                rentals={rentals}
                onComplete={handleCompleteRental}
                onEdit={openEditForm}
                onRealEdit={openRealEditForm}
            />
        )}

        {/* MODAL DE ÉXITO */}
        <Modal show={successModal.show} onClose={successModal.close} title="Alquiler registrado">
          <div className="text-green-600 text-6xl animate-bounce">🎉</div>
          <p className="text-lg font-medium">¡El alquiler se registró con éxito!</p>

          <button
              onClick={successModal.close}
              className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg
            font-semibold shadow-sm transition focus:ring-2 focus:ring-green-400"
          >
            Aceptar
          </button>
        </Modal>
      </div>
  );
}
