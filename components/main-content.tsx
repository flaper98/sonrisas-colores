"use client";

import { useState, useEffect } from "react";
import { ProductsPage } from "@/components/products/products-page";
import { RentalsPage } from "@/components/rentals/rentals-page";
import { RentalsByDate } from "@/components/rentals/rentals-by-date";
import { SalesPage } from "@/components/sales/sales-page";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { ReportsPage } from "@/components/reports/reports-page";
import { CategoriesPage } from "@/components/categories/categories-page";

type Section =
    | "dashboard"
    | "productos"
    | "alquileres"
    | "alquileres-dia"
    | "ventas"
    | "estadisticas"
    | "reportes"
    | "categorias";

export function MainContent() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<{ section: Section }>;
      setActiveSection(customEvent.detail.section);
    };

    window.addEventListener("navigate", handleNavigate);
    return () => window.removeEventListener("navigate", handleNavigate);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "productos":
        return <ProductsPage />;
      case "alquileres":
        return <RentalsPage />;
      case "alquileres-dia":
        return <RentalsByDate />;
      case "ventas":
        return <SalesPage />;
      case "estadisticas":
        return <AdminDashboard />;
      case "reportes":
        return <ReportsPage />;
      case "categorias":
        return <CategoriesPage />;
      case "dashboard":
      default:
        return <DashboardHome onNavigate={setActiveSection} />;
    }
  };

  return (
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {renderContent()}
      </main>
  );
}

/* -------------------------------------------------------------
   DASHBOARD HOME CON DATOS REALES
-------------------------------------------------------------- */

interface DashboardHomeProps {
  onNavigate: (section: Section) => void;
}

/* -------------------------------------------------------------
   DASHBOARD HOME – DISEÑO PROFESIONAL UI
-------------------------------------------------------------- */

function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const [stats, setStats] = useState({
    activeClients: 0,
    loading: true,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const activeRes = await fetch("/api/rentals/active");
      const activeData = await activeRes.json();

      setStats({
        activeClients: activeData.length || 0,
        loading: false,
      });
    } catch (err) {
      console.error("[DashboardHome] Error cargando datos:", err);
      setStats((s) => ({ ...s, loading: false }));
    }
  }

  if (stats.loading) {
    return <p className="text-center text-lg p-6">Cargando datos...</p>;
  }

  return (
      <div className="space-y-8">

        {/* ---------------------------------------------------
          WELCOME BANNER – Minimalista y Profesional
      ---------------------------------------------------- */}
        <div className="
        rounded-2xl p-8 shadow-sm border bg-gradient-to-r
        from-purple-100 via-pink-100 to-orange-100
        text-gray-800
      ">
          <h2 className="text-3xl font-extrabold flex items-center gap-3">
            Bienvenido a Sonrisas y Colores Kids
            <span className="text-4xl">🌈</span>
          </h2>

          <p className="text-base opacity-80 mt-1">
            Gestiona alquileres, productos y actividades de manera rápida y sencilla.
          </p>
        </div>

        {/* ---------------------------------------------------
          QUICK STAT CARD – Profesional, limpio
      ---------------------------------------------------- */}
        <div className="
        flex items-center gap-4 p-6 rounded-2xl shadow-sm
        border bg-white/70 backdrop-blur-sm
      ">
          <div className="text-5xl">👥</div>

          <div>
            <p className="text-sm font-medium text-gray-600">Clientes activos</p>

            <p className="text-4xl font-bold text-gray-900">
              {stats.activeClients}
            </p>

            <span className="text-[11px] bg-purple-100 text-purple-700 px-3 py-1 rounded-full mt-2 inline-block">
            Alquileres en curso
          </span>
          </div>
        </div>

        {/* ---------------------------------------------------
          ACTION CARDS – Diseño tipo SaaS moderno
      ---------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <DashActionCard
              title="Crear Alquiler"
              icon="📋"
              description="Nueva reserva"
              onClick={() => onNavigate("alquileres")}
          />

          <DashActionCard
              title="Gestionar Productos"
              icon="🎪"
              description="Crear / Editar"
              onClick={() => onNavigate("productos")}
          />

          <DashActionCard
              title="Vender Productos"
              icon="🛍️"
              description="Golosinas, libros..."
              onClick={() => onNavigate("ventas")}
          />

          <DashActionCard
              title="Reportes"
              icon="📊"
              description="PDF / Excel"
              onClick={() => onNavigate("reportes")}
          />
        </div>
      </div>
  );
}

/* -------------------------------------------------------------
   COMPONENTE: DashActionCard (Minimalista, Profesional)
-------------------------------------------------------------- */

function DashActionCard({
                          title,
                          description,
                          icon,
                          onClick
                        }: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
      <div className="
      bg-white border rounded-xl p-6 shadow-sm
      hover:shadow-md hover:bg-gray-50 transition cursor-pointer
    "
           onClick={onClick}
      >
        <div className="flex flex-col items-center gap-2 text-center">

          <span className="text-4xl">{icon}</span>

          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

          <p className="text-xs text-gray-500">{description}</p>

          <button
              className="
            mt-4 w-full py-2 rounded-md bg-purple-600 text-white
            hover:bg-purple-700 transition
            text-sm font-medium
          "
          >
            Ir
          </button>
        </div>
      </div>
  );
}

/* -------------------------------------------------------------
   COMPONENTES UI
-------------------------------------------------------------- */

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

function StatCardEnhanced({
                            title,
                            value,
                            icon,
                            badgeText,
                            gradient
                          }: {
  title: string
  value: string
  icon: string
  badgeText?: string
  gradient: string
}) {
  return (
      <div
          className={`
        relative overflow-hidden rounded-2xl p-6 shadow-xl text-white
        bg-gradient-to-r ${gradient}
        transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
      `}
      >
        {/* Fondo decorativo */}
        <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')] pointer-events-none" />

        {/* Contenido */}
        <div className="relative z-10 flex items-center gap-4">

          {/* Icono */}
          <div className="text-5xl drop-shadow-xl">
            {icon}
          </div>

          <div className="flex flex-col">
            <span className="text-sm opacity-90 font-medium">{title}</span>
            <span className="text-4xl font-extrabold drop-shadow-sm tracking-tight">
            {value}
          </span>

            {badgeText && (
                <span className="mt-2 inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold shadow">
              {badgeText}
            </span>
            )}
          </div>

        </div>
      </div>
  )
}


function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
      <div className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white shadow-lg`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-90 font-medium mb-2">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <span className="text-4xl">{icon}</span>
        </div>
      </div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  color: string;
}

function ActionCard({ title, description, icon, onClick, color }: ActionCardProps) {
  const colorClasses = {
    primary: "bg-primary text-white hover:bg-primary-light",
    secondary: "bg-secondary text-white hover:bg-secondary-light",
    accent: "bg-accent text-foreground hover:bg-yellow-400",
  };

  return (
      <div className="bg-white border-2 border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex flex-col items-center text-center gap-2 mb-4">
          <span className="text-3xl">{icon}</span>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <button
            onClick={onClick}
            className={`w-full py-2 px-4 rounded-lg transition-colors font-medium text-sm ${
                colorClasses[color as keyof typeof colorClasses]
            }`}
        >
          Ir
        </button>
      </div>
  );
}
