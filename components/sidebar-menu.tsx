"use client";

import {
  X,
  LayoutDashboard,
  Package,
  Tags,
  CalendarDays,
  ShoppingCart,
  FileChartColumn,
  ArrowLeftCircle,
  ArrowRightCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const [collapsed, setCollapsed] = useState(false);

  const sections = [
    {
      title: "General",
      items: [{ icon: LayoutDashboard, label: "Dashboard", id: "dashboard" }],
    },
    {
      title: "Alquileres",
      items: [{ icon: CalendarDays, label: "Alquileres", id: "alquileres" }],
    },
    {
      title: "Ventas",
      items: [
        { icon: ShoppingCart, label: "Ventas de Productos", id: "ventas" },
      ],
    },
    {
      title: "Catálogos",
      items: [
        { icon: Package, label: "Productos", id: "productos" },
        { icon: Tags, label: "Categorías", id: "categorias" },
      ],
    },
    {
      title: "Análisis",
      items: [{ icon: FileChartColumn, label: "Reportes", id: "reportes" }],
    },
  ];

  const handleMenuClick = (id: string) => {
    window.dispatchEvent(new CustomEvent("navigate", { detail: { section: id } }));
    onClose();
  };

  /* -------------------------------
     COMPONENTE SECCIÓN
  -------------------------------- */
  const renderSection = () =>
      sections.map((group) => (
          <div key={group.title} className="mt-5">
            {!collapsed && (
                <p className="text-[11px] uppercase tracking-wide px-4 mb-2 text-[#7e3ca1] font-semibold">
                  {group.title}
                </p>
            )}

            {group.items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={cn(
                        "relative w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                        "text-[#6B21A8] hover:bg-[#E9D5FF] hover:text-[#4C1D95]"
                    )}
                >
                  <item.icon className="w-5 h-5 opacity-90" />
                  {!collapsed && (
                      <span className="font-medium text-[14px] tracking-wide">
                {item.label}
              </span>
                  )}

                  {/* Tooltip en modo colapsado */}
                  {collapsed && (
                      <span className="absolute left-16 bg-[#4C1D95] text-white text-[11px] px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100">
                {item.label}
              </span>
                  )}
                </button>
            ))}
          </div>
      ));

  /* -------------------------------
     SIDEBAR DESKTOP
  -------------------------------- */
  return (
      <>
        <aside
            className={cn(
                "hidden lg:flex flex-col text-[#4C1D95] transition-all duration-300 border-r",
                collapsed ? "w-20" : "w-64",
                "bg-[#F5E8FF]" // Fondo pastel suave
            )}
        >
          {/* Botón de colapsar */}
          <div className="mt-4 px-4">
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center gap-2 text-[#6B21A8] hover:text-[#4C1D95]"
            >
              {collapsed ? (
                  <ArrowRightCircle className="w-6 h-6" />
              ) : (
                  <ArrowLeftCircle className="w-6 h-6" />
              )}
            </button>
          </div>

          <nav className="flex-1 px-2 py-6">{renderSection()}</nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-[#E0C4FF]">
            {!collapsed && (
                <p className="text-[10px] uppercase text-[#7e3ca1] tracking-wide">
                  © 2025 Sonrisas y Colores Kids
                </p>
            )}
          </div>
        </aside>

        {/* MOBILE */}
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 text-[#4C1D95] bg-[#F5E8FF] border-r transition-transform shadow-xl lg:hidden",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-[#E4CFFF]">
            <h2 className="font-bold tracking-widest text-[15px]">MENÚ</h2>
            <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-[#4C1D95]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 px-3 py-6 overflow-y-auto">{renderSection()}</nav>

          <div className="px-4 py-4 border-t border-[#E4CFFF]">
            <p className="text-[10px] uppercase text-[#7e3ca1]">
              © 2025 Sonrisas y Colores Kids
            </p>
          </div>
        </aside>
      </>
  );
}
