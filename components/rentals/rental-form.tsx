"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, X } from "lucide-react"
import type { RentalFormData } from "@/components/types/rentalFormData"


interface RentalFormProps {
  onSubmit: (rental: RentalFormData, rentalId?: number) => Promise<void>

  onCancel: () => void
  rentalToEdit?: any | null
  isRealEdit?: boolean

}

const getLocalDateTime = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

export function RentalForm({ onSubmit, onCancel, rentalToEdit, isRealEdit }: RentalFormProps) {
  const [formData, setFormData] = useState(() => {
    if (rentalToEdit) {
      return {
        client_name: rentalToEdit.client_name,
        client_dni: rentalToEdit.client_dni,
        num_children: rentalToEdit.num_children,
        duration_minutes: rentalToEdit.duration_minutes,
        total_price: rentalToEdit.total_price,
        start_time: rentalToEdit.start_time,
      }
    }

    return {
      client_name: "",
      client_dni: "",
      num_children: 1,
      duration_minutes: 5,
      total_price: 0,
      start_time: getLocalDateTime(),
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("ENVIANDO FORMULARIO..."); // 🔥

    try {
      await onSubmit({ ...formData }, rentalToEdit?.id);
      console.log("SUBMIT OK"); // 🔥
    } catch (err) {
      console.error("ERROR EN SUBMIT:", err); // 🔥
    }
  };


  return (
      <Card className="p-8 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* ===========================
        DATOS DEL CLIENTE
    ============================ */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-600">Datos del Cliente</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Nombre */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Nombre *</label>
                <Input
                    disabled={!!rentalToEdit && !isRealEdit}
                    value={formData.client_name}
                    className="border-gray-300"
                    required
                    onChange={(e) =>
                        setFormData({ ...formData, client_name: e.target.value })
                    }
                />
              </div>

              {/* DNI */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">DNI *</label>
                <Input
                    maxLength={8}
                    disabled={!!rentalToEdit && !isRealEdit}
                    value={formData.client_dni}
                    className="border-gray-300"
                    required
                    onChange={(e) =>
                        setFormData({ ...formData, client_dni: e.target.value })
                    }
                />
              </div>

            </div>
          </div>

          {/* ===========================
        DETALLES DEL ALQUILER
    ============================ */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-600">Detalles del Alquiler</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Niños */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Niños *</label>
                <Input
                    type="number"
                    min={1}
                    disabled={!!rentalToEdit && !isRealEdit}
                    value={formData.num_children}
                    className="border-gray-300"
                    required
                    onChange={(e) =>
                        setFormData({ ...formData, num_children: Number(e.target.value) })
                    }
                />
              </div>

              {/* Tiempo */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Tiempo (min) *</label>
                <Input
                    type="number"
                    min={1}
                    value={formData.duration_minutes}
                    className="border-gray-300"
                    required
                    onChange={(e) =>
                        setFormData({ ...formData, duration_minutes: Number(e.target.value) })
                    }
                />
              </div>

              {/* Precio */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Precio Total (S/) *</label>
                <Input
                    type="number"
                    value={formData.total_price}
                    className="border-gray-300"
                    required
                    onChange={(e) =>
                        setFormData({ ...formData, total_price: Number(e.target.value) })
                    }
                />
              </div>

            </div>
          </div>

          {/* ===========================
        INICIO DEL SERVICIO
    ============================ */}
          <div className="space-y-4 max-w-md">
            <h3 className="text-sm font-semibold text-gray-600">Inicio del Servicio</h3>

            <div className="flex flex-col gap-1">
              <Input
                  type="datetime-local"
                  disabled={!!rentalToEdit && !isRealEdit}
                  value={formData.start_time}
                  className="border-gray-300"
                  required
                  onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                  }
              />
            </div>
          </div>

          {/* ===========================
        ACCIONES
    ============================ */}
          <div className="flex justify-end gap-4 pt-6">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4" /> Cancelar
            </Button>

            <Button
                type="submit"
                className="bg-primary text-white px-6 hover:bg-primary/90 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {rentalToEdit ? "Guardar Cambios" : "Registrar"}
            </Button>

          </div>
        </form>
      </Card>

  )
}
