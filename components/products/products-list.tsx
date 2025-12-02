"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Search, Filter } from "lucide-react"
import type { Product } from "@/components/types/product"

/*interface Product {
  id: number
  name: string
  category: string
  price: number
  quantity: number
  description?: string
  minStock?: number
}*/

interface ProductsListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
}

export function ProductsList({ products, onEdit, onDelete }: ProductsListProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")

  const categories = [...new Set(products.map((p) => p.category))]

  // 🔍 Filtrado eficiente
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchName = p.name.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter ? p.category === categoryFilter : true
      return matchName && matchCategory
    })
  }, [products, search, categoryFilter])

// 🔥 Ordenar: primero los productos en stock crítico (≤ minStock)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aCritical = a.quantity <= (a.minStock ?? 0);
    const bCritical = b.quantity <= (b.minStock ?? 0);

    if (aCritical && !bCritical) return -1;
    if (!aCritical && bCritical) return 1;
    return 0;
  });



  return (
      <div className="space-y-4">

        {/* 🔎 Buscador + Filtro */}
        <Card className="p-4 border-2 border-border bg-white flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
            <input
                type="text"
                placeholder="Buscar productos por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="relative w-full md:w-1/3">
            <Filter className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
            <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Lista de productos */}
        <Card className="overflow-hidden border-2 border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
            <tr className="text-left">
              <th className="p-3 font-semibold">Nombre</th>
              <th className="p-3 font-semibold">Categoría</th>
              <th className="p-3 font-semibold">Precio</th>
              <th className="p-3 font-semibold">Stock</th>
              <th className="p-3 font-semibold text-right">Acciones</th>
            </tr>
            </thead>

            <tbody>
            {sortedProducts.map((product) => {
              const isCritical = product.quantity <= (product.minStock ?? 0);

              return (
                  <tr
                      key={product.id}
                      className={`border-b hover:bg-muted/20 ${
                          isCritical ? "bg-red-50" : ""
                      }`}
                  >
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3 font-bold text-primary">S/ {product.price.toFixed(2)}</td>

                    <td
                        className={`p-3 font-bold ${
                            isCritical ? "text-red-600" : "text-foreground"
                        }`}
                    >
                      {product.quantity}
                    </td>

                    <td className="p-3 text-right space-x-2">
                      <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(product)}
                          className="text-secondary border-secondary hover:bg-secondary hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(product.id)}
                          className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
              );
            })}
            </tbody>

          </table>

          {filteredProducts.length === 0 && (
              <p className="text-center py-6 text-muted-foreground">No se encontraron productos</p>
          )}
        </Card>
      </div>
  )
}
