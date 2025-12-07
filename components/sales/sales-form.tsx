"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Save, Search, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/components/types/product";
import { ReactNode } from "react";

interface SaleItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  name: string;
}

interface SaleToEdit {
  id: number;
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
    product_name: string;
  }[];
}

interface SalesFormProps {
  onSubmit: (data: any[]) => void;
  onCancel: () => void;
  saleToEdit?: SaleToEdit | null;
}

export function SalesForm({ onSubmit, onCancel, saleToEdit }: SalesFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);

  // ----------------------------------------------------------
  // LOAD PRODUCTS
  // ----------------------------------------------------------
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error();
      setProducts(await res.json());
    } catch {
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ----------------------------------------------------------
  // LOAD ITEMS IF EDITING
  // ----------------------------------------------------------
  useEffect(() => {
    if (saleToEdit) {
      setItems(
          saleToEdit.items.map((i) => ({
            product_id: i.product_id,
            quantity: Number(i.quantity),
            unit_price: Number(i.unit_price ?? 0),
            name: i.product_name,
          }))
      );
    }
  }, [saleToEdit]);

  // ----------------------------------------------------------
  // FILTER SEARCH RESULTS
  // ----------------------------------------------------------
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];
    return products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // ----------------------------------------------------------
  // ADD PRODUCT
  // ----------------------------------------------------------
  const addProduct = (product: Product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.product_id === product.id);
      return exists
          ? prev.map((i) =>
              i.product_id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
          )
          : [
            ...prev,
            {
              product_id: product.id,
              quantity: 1,
              unit_price: product.price,
              name: product.name,
            },
          ];
    });
    setSearch("");
  };

  // ----------------------------------------------------------
  // UPDATE QUANTITY +/-
  // ----------------------------------------------------------
  const changeQty = (id: number, amount: number) => {
    setItems((prev) =>
        prev.map((i) =>
            i.product_id === id
                ? { ...i, quantity: Math.max(1, i.quantity + amount) }
                : i
        )
    );
  };

  const updateQuantity = (id: number, qty: number) => {
    setItems((prev) =>
        prev.map((i) =>
            i.product_id === id ? { ...i, quantity: qty } : i
        )
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.product_id !== id));
  };

  // ----------------------------------------------------------
  // TOTAL GENERAL
  // ----------------------------------------------------------
  const totalGeneral = useMemo(
      () => items.reduce((acc, i) => acc + i.quantity * i.unit_price, 0),
      [items]
  );

  // ----------------------------------------------------------
  // SUBMIT
  // ----------------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Añade al menos un producto");
      return;
    }

    const payload = items.map((i) => ({
      product_id: i.product_id,
      quantity: Number(i.quantity),
      unit_price: Number(i.unit_price),
    }));

    onSubmit(payload);
  };

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------
  return (
      <Card className="p-8 bg-white border border-gray-200 shadow-lg rounded-3xl space-y-8">

        {/* HEADER: EDIT OR CREATE */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {saleToEdit ? `Editar Venta #${saleToEdit.id}` : "Registrar Venta"}
          </h2>

          {saleToEdit && (
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            Modo edición
          </span>
          )}
        </div>

        {/* BUSCADOR */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Buscar producto
          </label>

          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Escribe para buscar un producto..."
                className="pl-10 py-3 border-gray-300 rounded-xl focus:ring-accent"
            />
          </div>

          {/* RESULTADOS DEL BUSCADOR TIPO CARD */}
          {search.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {filteredProducts.length === 0 && (
                    <div className="text-muted-foreground text-sm">
                      No se encontraron productos.
                    </div>
                )}

                {filteredProducts.map((p) => (
                    <div
                        key={p.id}
                        onClick={() => addProduct(p)}
                        className="cursor-pointer p-4 border rounded-xl hover:border-accent hover:bg-accent/5 transition shadow-sm"
                    >
                      <p className="font-semibold text-gray-800">{p.name}</p>
                      <p className="text-sm text-gray-500">S/ {p.price.toFixed(2)}</p>
                    </div>
                ))}
              </div>
          )}
        </div>

        {/* TABLA DE ITEMS */}
        <div className="rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
            <tr>
              <Th>Producto</Th>
              <Th className="text-center">Cantidad</Th>
              <Th className="text-right">Precio</Th>
              <Th className="text-right">Subtotal</Th>
              <Th className="text-center">Acción</Th>
            </tr>
            </thead>

            <tbody>
            {items.map((item) => (
                <tr key={item.product_id} className="border-t">
                  <Td>{item.name}</Td>

                  {/* CANTIDAD STEP-BY-STEP */}
                  <Td className="w-40 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                          onClick={() => changeQty(item.product_id, -1)}
                          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                              updateQuantity(item.product_id, Number(e.target.value))
                          }
                          className="w-16 text-center"
                      />

                      <button
                          onClick={() => changeQty(item.product_id, +1)}
                          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </Td>

                  <Td className="text-right">
                    S/ {item.unit_price.toFixed(2)}
                  </Td>

                  <Td className="text-right font-semibold text-accent">
                    S/ {(item.quantity * item.unit_price).toFixed(2)}
                  </Td>

                  <Td className="text-center">
                    <button
                        onClick={() => removeItem(item.product_id)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Td>
                </tr>
            ))}

            {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No hay productos añadidos
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>

        {/* FOOTER FIJO ESTILO POS */}
        <div className="flex justify-between items-center bg-white py-4 border-t sticky bottom-0 z-20">
          <div className="text-xl font-bold text-gray-800">
            Total: <span className="text-accent">S/ {totalGeneral.toFixed(2)}</span>
          </div>

          <div className="flex gap-3">
            <Button
                className="flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={onCancel}
            >
              <X className="w-4 h-4" /> Cancelar
            </Button>

            <Button
                disabled={items.length === 0}
                onClick={handleSubmit}
                className={`flex items-center gap-2 text-white px-6 rounded-xl
              ${
                    items.length === 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90 shadow-md"
                }`}
            >
              <Save className="w-4 h-4" />
              {saleToEdit ? "Actualizar Venta" : "Registrar Venta"}
            </Button>
          </div>
        </div>
      </Card>
  );
}

// ----------------------------------------------------------
// SUBCOMPONENTES
// ----------------------------------------------------------
const Th = ({ children, className = "" }: any) => (
    <th
        className={`py-3 px-4 text-sm font-bold text-gray-600 uppercase tracking-wide ${className}`}
    >
      {children}
    </th>
);

const Td = ({ children, className = "" }: any) => (
    <td className={`py-3 px-4 text-gray-800 ${className}`}>{children}</td>
);
