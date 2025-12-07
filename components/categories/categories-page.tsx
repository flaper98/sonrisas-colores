"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2, FolderPlus, Tag, CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useModal } from "@/app/hooks/useModal"
import { Modal } from "@/components/ui/Modal"

interface Category {
  id: number
  name: string
  type: "sale" | "rental"
  created_at: string
}

type CategoryType = "sale" | "rental"

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState("")

  const [formData, setFormData] = useState<{
    name: string
    type: CategoryType
  }>({
    name: "",
    type: "sale",
  })

  // Modales
  const successCreateModal = useModal()
  const successUpdateModal = useModal()
  const successDeleteModal = useModal()
  const confirmDeleteModal = useModal()
  const errorDeleteModal = useModal()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error("Error fetching categories")
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error(error)
      toast.error("Error al cargar categorías")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("El nombre de la categoría es requerido")
      return
    }

    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.details || errorData.error)
      }

      await fetchCategories()

      // Mostrar modal según la acción
      if (editingId) {
        successUpdateModal.open()
      } else {
        successCreateModal.open()
      }

      // Reset
      setShowForm(false)
      setEditingId(null)
      setFormData({ name: "", type: "sale" })
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "Error al guardar categoría")
    }
  }

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id)
    setFormData({
      name: cat.name,
      type: cat.type,
    })
    setShowForm(true)
  }

  const handleDeleteClick = (id: number) => {
    setCategoryToDelete(id)
    confirmDeleteModal.open()
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return

    try {
      const res = await fetch(`/api/categories/${categoryToDelete}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.details || errorData.error)
      }

      confirmDeleteModal.close()
      successDeleteModal.open()
      setCategoryToDelete(null)
      await fetchCategories()
    } catch (e: any) {
      console.error(e)
      confirmDeleteModal.close()
      setDeleteError(e.message || "No se pudo eliminar la categoría")
      errorDeleteModal.open()
    }
  }

  const productCategories = categories.filter((c) => c.type === "sale")

  return (
      <div className="space-y-10">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Tag className="w-6 h-6 text-purple-500" />
              Categorías
            </h2>
            <p className="text-muted-foreground mt-1">
              Administra las categorías utilizadas en tus productos y alquileres.
            </p>
          </div>

          <Button
              onClick={() => {
                setShowForm(!showForm)
                setEditingId(null)
                setFormData({ name: "", type: "sale" })
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:opacity-90 gap-2"
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Cancelar" : "Nueva Categoría"}
          </Button>
        </div>

        {/* FORM */}
        {showForm && (
            <Card className="p-6 bg-white shadow-lg border border-purple-200/40 rounded-xl space-y-6 animate-fadeIn">
              <h3 className="text-xl font-semibold text-purple-600 flex items-center gap-2">
                <FolderPlus className="w-5 h-5" />
                {editingId ? "Editar Categoría" : "Crear Categoría"}
              </h3>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre de la categoría *
                  </label>
                  <Input
                      value={formData.name}
                      onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ej: Libros, Golosinas, Bebidas…"
                      className="h-11"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingId(null)
                      }}
                      variant="outline"
                      className="h-11"
                  >
                    Cancelar
                  </Button>

                  <Button
                      type="submit"
                      className="h-11 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:opacity-90"
                  >
                    {editingId ? "Guardar Cambios" : "Crear Categoría"}
                  </Button>
                </div>
              </form>
            </Card>
        )}

        {/* LISTA DE CATEGORÍAS */}
        <div className="space-y-2">
          {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Cargando categorías...
              </div>
          ) : (
              <>
                {productCategories.map((cat) => (
                    <div
                        key={cat.id}
                        className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition cursor-default group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                          {cat.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-lg">{cat.name}</span>
                      </div>

                      <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-purple-100 text-purple-600"
                            onClick={() => handleEdit(cat)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-red-100 text-red-600"
                            onClick={() => handleDeleteClick(cat.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                ))}

                {productCategories.length === 0 && (
                    <div className="text-center py-16">
                      <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg">
                        No hay categorías registradas
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Crea tu primera categoría para organizar tus productos
                      </p>
                    </div>
                )}
              </>
          )}
        </div>

        {/* ========================================= */}
        {/* MODAL: CATEGORÍA CREADA */}
        {/* ========================================= */}
        <Modal
            show={successCreateModal.show}
            onClose={successCreateModal.close}
            title="¡Categoría Creada!"
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <p className="text-lg font-medium text-gray-800 text-center">
              La categoría se creó correctamente
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
        {/* MODAL: CATEGORÍA ACTUALIZADA */}
        {/* ========================================= */}
        <Modal
            show={successUpdateModal.show}
            onClose={successUpdateModal.close}
            title="¡Categoría Actualizada!"
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
              setCategoryToDelete(null)
            }}
            title="¿Eliminar esta categoría?"
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-12 h-12 text-red-600" />
            </div>
            <p className="text-gray-700 text-center">
              Esta acción no se puede deshacer.
              <br />
              <span className="text-sm text-gray-500">
              (No se puede eliminar si tiene productos asociados)
            </span>
            </p>
            <div className="flex gap-3 mt-4">
              <button
                  onClick={() => {
                    confirmDeleteModal.close()
                    setCategoryToDelete(null)
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
        {/* MODAL: CATEGORÍA ELIMINADA */}
        {/* ========================================= */}
        <Modal
            show={successDeleteModal.show}
            onClose={successDeleteModal.close}
            title="¡Categoría Eliminada!"
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <p className="text-lg font-medium text-gray-800 text-center">
              La categoría se eliminó correctamente
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
                  "Esta categoría no se puede eliminar porque tiene productos asociados"}
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