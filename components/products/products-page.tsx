"use client"

import { useEffect, useState } from "react"
import { ProductsList } from "./products-list"
import { ProductForm } from "./product-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/components/types/product"

/*interface Product {
  id: number
  name: string
  category: string
  price: number
  quantity: number
  description?: string
  minStock: number
}*/

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products")
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      const fixed = data.map((p: any) => ({
        id: Number(p.id),                        // 🔥 obligatorio
        name: p.name ?? "",
        category: p.category ?? "",
        price: Number(p.price ?? 0),
        quantity: Number(p.quantity ?? 0),
        description: p.description ?? "",
        minStock: Number(p.minStock ?? 0),
      }));

      setProducts(fixed);
    } catch (error) {
      console.error("[v0] Error fetching products:", error)
      toast.error("Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (product: Omit<Product, "id">) => {
    try {
      let response: Response
      if (editingId) {
        response = await fetch(`/api/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        })
      } else {
        response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        })
      }

      if (!response.ok) throw new Error("Failed to save product")
      await fetchProducts()
      setShowForm(false)
      setEditingId(null)
      toast.success(editingId ? "Producto actualizado" : "Producto creado")
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      toast.error("Error al guardar producto")
    }
  }

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete product")
      await fetchProducts()
      toast.success("Producto eliminado")
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      toast.error("Error al eliminar producto")
    }
  }

  const handleEditProduct = (product: Product) => {
    if (!product.id) return  // seguridad adicional
    setEditingId(product.id)
    setShowForm(true)
  }


  const editingProduct = editingId ? products.find((p) => p.id === editingId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h2 className="text-4xl font-black text-foreground tracking-tight">
            Gestión de Productos
          </h2>

          <p className="text-muted-foreground mt-1 text-sm">
            Crea y administra tus productos
          </p>
        </div>

        <Button
            onClick={() => {
              setEditingId(null)
              setShowForm(!showForm)
            }}
            className="
      bg-gradient-to-r
      from-pink-500
      to-purple-500
      hover:opacity-90
      text-white
      shadow-md
      gap-2
      h-12
      px-6
    "
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancelar" : "Nuevo Producto"}
        </Button>
      </div>


      {/* Form */}
      {showForm && (
        <ProductForm
          product={editingProduct || undefined}
          onSubmit={handleAddProduct}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Products List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando productos...</div>
      ) : (
        <ProductsList products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
      )}
    </div>
  )
}
