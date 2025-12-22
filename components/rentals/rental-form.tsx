"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, X, Info, Tag, CreditCard, Banknote, Smartphone } from "lucide-react"
import type { RentalFormData } from "@/components/types/rentalFormData"

interface RentalFormProps {
  onSubmit: (rental: RentalFormData, rentalId?: number) => Promise<void>
  onCancel: () => void
  rentalToEdit?: any | null
  isRealEdit?: boolean
}

const toDatetimeLocal = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const PRICING_TABLE = {
  15: 10,
  30: 15,
  60: 25,
  90: 40,
  120: 50,
}

const PAYMENT_METHODS = [
  { value: "Efectivo", label: "Efectivo", icon: Banknote, color: "bg-green-50 border-green-300 text-green-700" },
  { value: "Tarjeta", label: "Tarjeta", icon: CreditCard, color: "bg-blue-50 border-blue-300 text-blue-700" },
  { value: "Yape", label: "Yape", icon: Smartphone, color: "bg-purple-50 border-purple-300 text-purple-700" },
  { value: "Plin", label: "Plin", icon: Smartphone, color: "bg-orange-50 border-orange-300 text-orange-700" },
]

const getLocalDateTime = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

const isOfferDay = (dateString: string) => {
  const date = new Date(dateString)
  const dayOfWeek = date.getDay()
  return dayOfWeek >= 1 && dayOfWeek <= 4
}

const getChargeableChildren = (numChildren: number, hasOffer: boolean) => {
  if (!hasOffer) return numChildren
  const groups = Math.floor(numChildren / 4)
  const remainder = numChildren % 4
  return (groups * 3) + remainder
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
        start_time: toDatetimeLocal(rentalToEdit.start_time),
        payment_method: rentalToEdit.payment_method || "Efectivo",
      }
    }

    return {
      client_name: "",
      client_dni: "",
      num_children: 1,
      duration_minutes: 30,
      total_price: 15,
      start_time: getLocalDateTime(),
      payment_method: "Efectivo",
    }
  })

  const [manualPriceEdit, setManualPriceEdit] = useState(false)
  const [showPricingInfo, setShowPricingInfo] = useState(false)

  const hasOffer = isOfferDay(formData.start_time)
  const chargeableChildren = getChargeableChildren(formData.num_children, hasOffer)

  const calculateAutoPrice = (children: number, minutes: number, applyOffer: boolean) => {
    const effectiveChildren = applyOffer ? getChargeableChildren(children, true) : children
    const pricePerChild = PRICING_TABLE[minutes as keyof typeof PRICING_TABLE]

    if (pricePerChild) {
      return effectiveChildren * pricePerChild
    }

    const rates = Object.entries(PRICING_TABLE)
    const closest = rates.reduce((prev, curr) => {
      const prevDiff = Math.abs(Number(prev[0]) - minutes)
      const currDiff = Math.abs(Number(curr[0]) - minutes)
      return currDiff < prevDiff ? curr : prev
    })

    const baseMinutes = Number(closest[0])
    const basePrice = Number(closest[1])
    const pricePerMinute = basePrice / baseMinutes

    return Math.round(effectiveChildren * minutes * pricePerMinute)
  }

  useEffect(() => {
    if (!manualPriceEdit) {
      const autoPrice = calculateAutoPrice(
          formData.num_children,
          formData.duration_minutes,
          hasOffer
      )
      setFormData(prev => ({ ...prev, total_price: autoPrice }))
    }
  }, [formData.num_children, formData.duration_minutes, formData.start_time, manualPriceEdit, rentalToEdit, hasOffer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit({ ...formData }, rentalToEdit?.id)
    } catch (err) {
      console.error("ERROR EN SUBMIT:", err)
    }
  }

  const quickDurations = [
    { value: 15, price: 10 },
    { value: 30, price: 15 },
    { value: 60, price: 25 },
    { value: 90, price: 40 },
    { value: 120, price: 50 },
  ]

  const pricePerChild = PRICING_TABLE[formData.duration_minutes as keyof typeof PRICING_TABLE]
  const savedAmount = hasOffer && formData.num_children >= 4
      ? (formData.num_children - chargeableChildren) * (pricePerChild || 0)
      : 0

  return (
      <Card className="p-6 bg-white border border-gray-200 shadow-lg rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* HEADER */}
          <div className="flex items-center justify-between pb-3 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              {rentalToEdit ? "Editar Alquiler" : "Nuevo Alquiler"}
            </h2>
          </div>

          {/* BANNER DE OFERTA COMPACTO */}
          {hasOffer && (
              <div className="flex items-center gap-2 p-2.5 bg-orange-50 border-l-4 border-orange-400 rounded text-sm">
                <Tag className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="text-orange-900">
              <strong>Promoción Lun-Jue:</strong> 4 niños pagan 3
            </span>
              </div>
          )}

          {/* DATOS DEL CLIENTE */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Nombre del Cliente
              </label>
              <Input
                  disabled={!!rentalToEdit && !isRealEdit}
                  value={formData.client_name}
                  placeholder="Ej: María García"
                  className="h-9"
                  required
                  onChange={(e) =>
                      setFormData({ ...formData, client_name: e.target.value })
                  }
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                DNI
              </label>
              <Input
                  maxLength={8}
                  disabled={!!rentalToEdit && !isRealEdit}
                  value={formData.client_dni}
                  placeholder="12345678"
                  className="h-9"
                  required
                  onChange={(e) =>
                      setFormData({ ...formData, client_dni: e.target.value })
                  }
              />
            </div>
          </div>

          {/* FECHA Y HORA */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Fecha y Hora de Inicio
            </label>
            <Input
                type="datetime-local"
                disabled={!!rentalToEdit && !isRealEdit}
                value={formData.start_time}
                className="h-9"
                required
                onChange={(e) => {
                  setFormData({ ...formData, start_time: e.target.value })
                  setManualPriceEdit(false)
                }}
            />
          </div>

          {/* GRID: NIÑOS Y DURACIÓN */}
          <div className="grid grid-cols-2 gap-4">

            {/* NÚMERO DE NIÑOS - COMPACTO */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Número de Niños
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-9">
                <button
                    type="button"
                    disabled={(!!rentalToEdit && !isRealEdit) || formData.num_children <= 1}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        num_children: Math.max(1, prev.num_children - 1)
                      }))
                      setManualPriceEdit(false)
                    }}
                    className="px-3 h-full bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-700 font-bold"
                >
                  -
                </button>

                <div className="flex-1 text-center font-bold text-gray-800">
                  {formData.num_children}
                </div>

                <button
                    type="button"
                    disabled={!!rentalToEdit && !isRealEdit}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        num_children: prev.num_children + 1
                      }))
                      setManualPriceEdit(false)
                    }}
                    className="px-3 h-full bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-700 font-bold"
                >
                  +
                </button>
              </div>

              {/* Mensaje de oferta compacto */}
              {hasOffer && formData.num_children >= 4 && (
                  <p className="text-xs text-orange-700 text-center">
                    Se cobran {chargeableChildren} • Ahorras {formData.num_children - chargeableChildren}
                  </p>
              )}
            </div>

            {/* DURACIÓN - COMPACTO */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Duración
              </label>
              <div className="grid grid-cols-5 gap-1">
                {quickDurations.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, duration_minutes: opt.value }))
                          setManualPriceEdit(false)
                        }}
                        className={`
                    p-1.5 rounded border-2 transition text-center
                    ${formData.duration_minutes === opt.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }
                  `}
                    >
                      <div className="text-xs font-bold text-gray-800">
                        {opt.value}
                      </div>
                      <div className="text-xs text-gray-500">
                        min
                      </div>
                    </button>
                ))}
              </div>

              <details>
                <summary className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
                  Personalizado
                </summary>
                <div className="mt-1.5">
                  <Input
                      type="number"
                      min={1}
                      value={formData.duration_minutes}
                      className="h-8 text-sm"
                      required
                      onChange={(e) => {
                        setFormData({ ...formData, duration_minutes: Number(e.target.value) })
                        setManualPriceEdit(false)
                      }}
                  />
                </div>
              </details>
            </div>
          </div>

          {/* MÉTODO DE PAGO */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Método de Pago
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon
                const isSelected = formData.payment_method === method.value
                return (
                    <button
                        key={method.value}
                        type="button"
                        disabled={!!rentalToEdit && !isRealEdit}
                        onClick={() => setFormData({ ...formData, payment_method: method.value })}
                        className={`
                      p-2.5 rounded-lg border-2 transition-all text-center flex flex-col items-center gap-1
                      ${isSelected
                            ? `${method.color} border-current font-semibold shadow-sm`
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                        }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? '' : 'text-gray-400'}`} />
                      <span className="text-xs font-medium">{method.label}</span>
                    </button>
                )
              })}
            </div>
          </div>

          {/* TOTAL A PAGAR - COMPACTO */}
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700 uppercase">
              Total a Pagar
            </span>

              <button
                  type="button"
                  onClick={() => setShowPricingInfo(!showPricingInfo)}
                  className="text-emerald-600 hover:text-emerald-700"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* TABLA DE PRECIOS */}
            {showPricingInfo && (
                <div className="mb-2 p-2 bg-white rounded text-xs border border-emerald-200">
                  <div className="grid grid-cols-5 gap-1 text-gray-700">
                    {quickDurations.map(d => (
                        <div key={d.value} className="text-center">
                          <div className="font-bold">{d.value}'</div>
                          <div className="text-gray-500">S/{d.price}</div>
                        </div>
                    ))}
                  </div>
                  <p className="text-orange-700 font-semibold mt-2 pt-2 border-t text-center">
                    Lun-Jue: 4x3
                  </p>
                </div>
            )}

            {/* DESGLOSE */}
            {!manualPriceEdit && pricePerChild && (
                <div className="mb-2 text-xs text-center py-1.5 bg-emerald-100/50 rounded">
              <span className="text-emerald-800">
                {chargeableChildren} × S/ {pricePerChild}
              </span>
                  {savedAmount > 0 && (
                      <span className="text-orange-700 font-semibold ml-2">
                  • Ahorras S/ {savedAmount}
                </span>
                  )}
                </div>
            )}

            {/* INPUT PRECIO */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-2 border-2 border-emerald-300">
              <span className="text-lg font-bold text-emerald-700">S/</span>
              <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={formData.total_price}
                  className="flex-1 text-xl font-bold border-0 focus:ring-0 h-auto p-0 text-center"
                  required
                  onChange={(e) => {
                    setFormData({ ...formData, total_price: Number(e.target.value) })
                    setManualPriceEdit(true)
                  }}
              />
              {manualPriceEdit && (
                  <button
                      type="button"
                      onClick={() => {
                        const autoPrice = calculateAutoPrice(
                            formData.num_children,
                            formData.duration_minutes,
                            hasOffer
                        )
                        setFormData(prev => ({ ...prev, total_price: autoPrice }))
                        setManualPriceEdit(false)
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    Auto
                  </button>
              )}
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-9 px-5"
            >
              <X className="w-4 h-4 mr-1.5" />
              Cancelar
            </Button>

            <Button
                type="submit"
                className="h-9 px-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {rentalToEdit ? "Guardar" : "Registrar"}
            </Button>
          </div>
        </form>
      </Card>
  )
}