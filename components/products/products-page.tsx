"use client"

import { useEffect, useState } from "react"
import { ProductsList } from "./products-list"
import { ProductForm } from "./product-form"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle, Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useModal } from "@/app/hooks/useModal"
import { Modal } from "@/components/ui/Modal"
import type { Product } from "@/components/types/product"

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)

  // Modales
  const successCreateModal = useModal()
  const successUpdateModal = useModal()
  const successDeleteModal = useModal()
  const confirmDeleteModal = useModal()
  const errorDeleteModal = useModal()
  const [deleteError, setDeleteError] = useState("")

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
        id: Number(p.id),
        name: p.name ?? "",
        category: p.category ?? "",
        price: Number(p.price ?? 0),
        quantity: Number(p.quantity ?? 0),
        description: p.description ?? "",
        minStock: Number(p.minStock ?? 0),
      }))

      setProducts(fixed)
    } catch (error) {
      console.error("Error fetching products:", error)
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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error)
      }

      await fetchProducts()
      setShowForm(false)

      // Mostrar modal según la acción
      if (editingId) {
        successUpdateModal.open()
      } else {
        successCreateModal.open()
      }

      setEditingId(null)
    } catch (error: any) {
      console.error("Error saving product:", error)
      toast.error(error.message || "Error al guardar producto")
    }
  }

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id)
    confirmDeleteModal.open()
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    try {
      const response = await fetch(`/api/products/${productToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error)
      }

      confirmDeleteModal.close()
      successDeleteModal.open()
      setProductToDelete(null)
      await fetchProducts()
    } catch (error: any) {
      console.error("Error deleting product:", error)
      confirmDeleteModal.close()
      setDeleteError(error.message || "No se pudo eliminar el producto")
      errorDeleteModal.open()
    }
  }

  const handleEditProduct = (product: Product) => {
    if (!product.id) return
    setEditingId(product.id)
    setShowForm(true)
  }

  const editingProduct = editingId
      ? products.find((p) => p.id === editingId)
      : null

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
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white shadow-md gap-2 h-12 px-6"
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
                onCancel={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
            />
        )}

        {/* Products List */}
        {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando productos...
            </div>
        ) : (
            <ProductsList
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteClick}
            />
        )}

        {/* ========================================= */}
        {/* MODAL: PRODUCTO CREADO */}
        {/* ========================================= */}
        <Modal
            show={successCreateModal.show}
            onClose={successCreateModal.close}
            title="¡Producto Creado!"
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <p className="text-lg font-medium text-gray-800 text-center">
              El producto se creó correctamente
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
        {/* MODAL: PRODUCTO ACTUALIZADO */}
        {/* ========================================= */}
        <Modal
            show={successUpdateModal.show}
            onClose={successUpdateModal.close}
            title="¡Producto Actualizado!"
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
              confirmDeleteModal.close()
              setProductToDelete(null)
            }}
            title="¿Eliminar este producto?"
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-12 h-12 text-red-600" />
            </div>
            <p className="text-gray-700 text-center">
              Esta acción no se puede deshacer.
              <br />
              <span className="text-sm text-gray-500">
              (No se puede eliminar si el producto tiene ventas registradas)
            </span>
            </p>
            <div className="flex gap-3 mt-4">
              <button
                  onClick={() => {
                    confirmDeleteModal.close()
                    setProductToDelete(null)
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
        {/* MODAL: PRODUCTO ELIMINADO */}
        {/* ========================================= */}
        <Modal
            show={successDeleteModal.show}
            onClose={successDeleteModal.close}
            title="¡Producto Eliminado!"
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <p className="text-lg font-medium text-gray-800 text-center">
              El producto se eliminó correctamente
            </p>
            <button
                onClick={successDeleteModal.close}
                className="mt-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-md transition"
            >
              Aceptar
            </button>
          </div>
        </Modal>

        {/* ========================================= */}
        {/* MODAL: ERROR AL ELIMINAR */}
        {/* ========================================= */}
        <Modal
            show={errorDeleteModal.show}
            onClose={errorDeleteModal.close}
            title="No se pudo eliminar"
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-orange-600" />
            </div>
            <p className="text-gray-700 text-center">
              {deleteError ||
                  "Este producto no se puede eliminar porque tiene ventas registradas"}
            </p>
            <button
                onClick={errorDeleteModal.close}
                className="mt-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-md transition"
            >
              Entendido
            </button>
          </div>
        </Modal>
      </div>
  )
}