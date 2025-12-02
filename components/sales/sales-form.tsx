"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Save, Search } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/components/types/product"
import { ReactNode } from "react";

/*interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}*/

interface SalesFormProps {
  onSubmit: (sales: any[]) => void;
  onCancel: () => void;
}

export function SalesForm({ onSubmit, onCancel }: SalesFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<
      { product_id: number; quantity: number; unit_price: number; name: string }[]
  >([]);

  // -------------------------------
  // CARGA PRODUCTOS
  // -------------------------------
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

  // -------------------------------
  // FILTRO
  // -------------------------------
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];
    return products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // -------------------------------
  // AGREGAR PRODUCTO
  // -------------------------------
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

  const totalGeneral = useMemo(
      () => items.reduce((acc, i) => acc + i.quantity * i.unit_price, 0),
      [items]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Añade al menos un producto");
      return;
    }

    const formattedItems = items.map((i) => ({
      product_id: i.product_id,
      quantity: Number(i.quantity),
      unit_price: Number(i.unit_price),
      notes: null,
    }));

    onSubmit(formattedItems);
    setItems([]);
  };

  // -------------------------------
  // UI
  // -------------------------------
  return (
      <Card className="p-8 bg-white border border-gray-200 shadow-md rounded-2xl space-y-8">

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
                placeholder="Escribe para buscar..."
                className="pl-10 py-2 border-gray-300 rounded-lg focus:ring-accent"
            />
          </div>

          {search.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg bg-white shadow-lg animate-in fade-in slide-in-from-top-2">
                {filteredProducts.map((p) => (
                    <div
                        key={p.id}
                        onClick={() => addProduct(p)}
                        className="px-4 py-2 cursor-pointer hover:bg-accent/10"
                    >
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-gray-500">S/ {p.price.toFixed(2)}</p>
                    </div>
                ))}

                {filteredProducts.length === 0 && (
                    <div className="px-4 py-2 text-muted-foreground text-sm">
                      No encontrado
                    </div>
                )}
              </div>
          )}
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto rounded-lg border">
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

                  <Td className="w-32 text-center">
                    <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                            updateQuantity(item.product_id, Number(e.target.value))
                        }
                        className="w-20 mx-auto text-center"
                    />
                  </Td>

                  <Td className="text-right">S/ {item.unit_price.toFixed(2)}</Td>

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
                  <td
                      colSpan={5}
                      className="py-4 text-center text-muted-foreground"
                  >
                    No hay productos añadidos
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="flex justify-end text-xl font-bold text-gray-800">
          Total: <span className="text-accent ml-2">S/ {totalGeneral.toFixed(2)}</span>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3">
          <Button
              className="flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={onCancel}
          >
            <X className="w-4 h-4" /> Cancelar
          </Button>

          <Button
              disabled={items.length === 0}
              onClick={handleSubmit}
              className={`flex items-center gap-2 text-white px-6 
            ${
                  items.length === 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-accent to-accent-orange hover:opacity-90 shadow-md"
              }`}
          >
            <Save className="w-4 h-4" />
            Registrar Venta
          </Button>
        </div>
      </Card>
  );
}

// ------------------------------------------------------
// Subcomponentes
// ------------------------------------------------------
const Th = ({
              children,
              className = "",
            }: {
  children: ReactNode;
  className?: string;
}) => (
    <th className={`py-3 px-4 text-sm font-semibold text-gray-600 ${className}`}>
      {children}
    </th>
);

const Td = ({
              children,
              className = "",
            }: {
  children: ReactNode;
  className?: string;
}) => (
    <td className={`py-3 px-4 ${className}`}>
      {children}
    </td>
);