"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, X, Package, Tag, Coins, Layers } from "lucide-react"
import type { Product } from "@/components/types/product"

/*interface Product {
  id?: number
  name: string
  category: string
  price: number
  quantity: number
  description?: string
  minStock?: number
}*/

interface ProductFormProps {
  product?: Product
  onSubmit: (product: Omit<Product, "id">) => Promise<void>;
  onCancel: () => void
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: product?.name || "",
    category: product?.category || "",
    price: product?.price || 0,
    quantity: product?.quantity || 0,
    description: product?.description || "",
    minStock: product?.minStock ?? 0,
  })

  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories`)
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data.map((cat: any) => cat.name))
    } catch (error) {
      console.error("[v0] Error fetching categories:", error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.category && formData.price > 0) {
      onSubmit(formData)
    }
  }

  return (
      <Card className="p-8 bg-white shadow-lg rounded-2xl border border-purple-200/40 space-y-8">

        {/* TÍTULO DEL FORMULARIO */}
        <div className="pb-4 border-b">
          <h3 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-500" />
            {product ? "Editar Producto" : "Nuevo Producto"}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Completa los datos para registrar el producto
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* INFORMACIÓN BÁSICA */}
          <div>
            <h4 className="font-semibold text-purple-600 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Información General
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Inca Kola"
                    required
                    className="h-11"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 border rounded-md px-3 bg-white focus:ring-2 focus:ring-purple-400"
                    required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PRECIOS Y STOCK */}
          <div>
            <h4 className="font-semibold text-purple-600 mb-3 flex items-center gap-2">
              <Coins className="w-4 h-4" /> Precio y Stock
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium mb-1">Precio (S/.) *</label>
                <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="0.00"
                    min="1"
                    step="0.10"
                    required
                    className="h-11"
                />
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium mb-1">Cantidad *</label>
                <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="h-11"
                />
              </div>

              {/* Stock mínimo */}
              <div>
                <label className="block text-sm font-medium mb-1">Stock mínimo *</label>
                <Input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="h-11"
                />
              </div>
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <h4 className="font-semibold text-purple-600 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Descripción
            </h4>
            <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el producto..."
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="gap-2 h-11"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>

            <Button
                type="submit"
                className="h-11 bg-gradient-to-r from-pink-500 to-purple-500 shadow-md hover:opacity-90 gap-2 text-white font-semibold"
            >
              <Save className="w-4 h-4" />
              {product ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </div>
        </form>
      </Card>
  )
}
