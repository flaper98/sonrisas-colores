"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Search,
} from "lucide-react";

export function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [lastRentals, setLastRentals] = useState<any[]>([]);
  const [durationData, setDurationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#FCD34D", "#0EA5E9", "#9D4EDD", "#FB923C"];

  // ================================
  // Cargar datos reales de la API
  // ================================
  async function loadData() {
    try {
      setLoading(true);

      // 30 días de reportes
      const resReports = await fetch(
          "/api/reports?period=daily&days=30"
      );
      const reportsJson = await resReports.json();

      // últimos alquileres
      const resLast = await fetch("/api/rentals?limit=10");
      const lastJson = await resLast.json();

      // distribución por duración
      const resDur = await fetch("/api/rentals/durations");
      const durJson = await resDur.json();

      setReports(reportsJson);
      setLastRentals(lastJson);
      setDurationData(durJson);
    } catch (err) {
      console.error("[Dashboard] Error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ================================
  // KPIs reales
  // ================================
  const totalRentals = reports.reduce((s, r) => s + Number(r.rentals || 0), 0);
  const totalRevenue = reports.reduce((s, r) => s + Number(r.total_income || 0), 0);
  const totalChildren = reports.reduce((s, r) => s + Number(r.children_served || 0), 0);

  const avgPerRental =
      totalRentals > 0 ? Math.round(totalRevenue / totalRentals) : 0;

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Panel de Administración
            </h2>
            <p className="text-muted-foreground mt-1">
              Estadísticas reales de tus alquileres
            </p>
          </div>

        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
              title="Alquileres"
              value={totalRentals}
              subtext="últimos 30 días"
              icon={Calendar}
              color="from-primary to-primary-light"
              trend="+12%"
          />
          <KPICard
              title="Ingresos"
              value={`S/ ${totalRevenue}`}
              subtext="últimos 30 días"
              icon={DollarSign}
              color="from-accent to-accent-orange"
              trend="+8%"
          />
          <KPICard
              title="Niños Atendidos"
              value={totalChildren}
              subtext="últimos 30 días"
              icon={Users}
              color="from-secondary to-secondary-light"
              trend="+15%"
          />
          <KPICard
              title="Promedio por Alquiler"
              value={`S/ ${avgPerRental}`}
              subtext="promedio"
              icon={TrendingUp}
              color="from-accent-pink to-accent-orange"
              trend="+5%"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card className="p-6 bg-white border-2 border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Ingresos por Día
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reports}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "2px solid #7B2CBF",
                      borderRadius: "8px",
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="total_income"
                    stroke="#7B2CBF"
                    strokeWidth={3}
                    dot={{ fill: "#7B2CBF", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Rentals by Duration */}
          <Card className="p-6 bg-white border-2 border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Alquileres por Duración
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                    data={durationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    dataKey="value"
                >
                  {durationData.map((entry, idx) => (
                      <Cell
                          key={`cell-${idx}`}
                          fill={COLORS[idx % COLORS.length]}
                      />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Rentals Volume */}
        <Card className="p-6 bg-white border-2 border-border lg:col-span-2">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Volumen de Alquileres
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reports}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar
                  dataKey="rentals"
                  fill="#0EA5E9"
                  radius={[8, 8, 0, 0]}
              />
              <Bar
                  dataKey="children_served"
                  fill="#FCD34D"
                  radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Rentals */}
        <Card className="p-6 bg-white border-2 border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Últimas Reservaciones
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b-2 border-border">
              <tr>
                <th className="py-3 px-4 font-bold text-foreground">
                  Fecha
                </th>
                <th className="py-3 px-4 font-bold text-foreground">
                  Niños
                </th>
                <th className="py-3 px-4 font-bold text-foreground">
                  Duración
                </th>
                <th className="py-3 px-4 font-bold text-foreground">
                  Ingreso
                </th>
                <th className="py-3 px-4 font-bold text-foreground">
                  Estado
                </th>
              </tr>
              </thead>

              <tbody>
              {lastRentals.map((r, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="py-3 px-4">
                      {new Date(r.start_time).toLocaleString("es-PE")}
                    </td>
                    <td className="py-3 px-4">{r.num_children}</td>
                    <td className="py-3 px-4">
                      {r.duration_minutes} min
                    </td>
                    <td className="py-3 px-4 text-primary font-bold">
                      S/ {r.total_price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                      {r.status}
                    </span>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
  );
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: any;
  color: string;
  trend: string;
}

function KPICard({
                   title,
                   value,
                   subtext,
                   icon: Icon,
                   color,
                   trend,
                 }: KPICardProps) {
  return (
      <Card className="p-6 bg-white border-2 border-border hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className={`bg-gradient-to-br ${color} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-bold text-green-600">
          {trend}
        </span>
        </div>
        <p className="text-sm text-muted-foreground font-medium mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-foreground mb-2">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </Card>
  );
}
