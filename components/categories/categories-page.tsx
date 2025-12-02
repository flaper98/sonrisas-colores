"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2, FolderPlus, Tag } from "lucide-react"
import { toast } from "sonner"

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

  const [formData, setFormData] = useState<{
    name: string
    type: CategoryType
  }>({
    name: "",
    type: "sale",
  })

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

      if (!res.ok) throw new Error()

      await fetchCategories()
      toast.success(editingId ? "Categoría actualizada" : "Categoría creada")

      // Reset
      setShowForm(false)
      setEditingId(null)
      setFormData({ name: "", type: "sale" })
    } catch (e) {
      console.error(e)
      toast.error("Error al guardar categoría")
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

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta categoría?")) return

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      await fetchCategories()
      toast.success("Categoría eliminada")
    } catch (e) {
      toast.error("Error al eliminar categoría")
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
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
          ))}

          {productCategories.length === 0 && !loading && (
              <p className="text-center text-muted-foreground py-10">
                No hay categorías registradas.
              </p>
          )}
        </div>
      </div>
  )
}
