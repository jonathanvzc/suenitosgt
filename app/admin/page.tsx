"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Pedido = {
  id: number;
  nombre: string;
  telefono: string;
  total: number;
};

type Detalle = {
  producto_id: number;
  cantidad: number;
};

type Producto = {
  id: number;
  nombre: string;
};

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [detalles, setDetalles] = useState<Detalle[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    const load = async () => {
      const [p, d, pr] = await Promise.all([
        supabase.from("pedidos").select("*"),
        supabase.from("detalle_pedido").select("*"),
        supabase.from("productos").select("id, nombre"),
      ]);

      setPedidos(p.data || []);
      setDetalles(d.data || []);
      setProductos(pr.data || []);
    };

    load();
  }, []);

  // =========================
  // KPIS
  // =========================
  const kpis = useMemo(() => {
    const totalVentas = pedidos.reduce((a, b) => a + (b.total || 0), 0);
    const ticket = pedidos.length ? totalVentas / pedidos.length : 0;

    return {
      totalVentas,
      pedidos: pedidos.length,
      ticket,
    };
  }, [pedidos]);

  // =========================
  // CLIENTES FRECUENTES (POR TELEFONO)
  // =========================
  const clientes = useMemo(() => {
    const map = new Map();

    pedidos.forEach((p) => {
      const key = p.telefono;

      if (!map.has(key)) {
        map.set(key, {
          nombre: p.nombre,
          telefono: p.telefono,
          pedidos: 0,
          total: 0,
        });
      }

      const c = map.get(key);
      c.pedidos += 1;
      c.total += p.total;
    });

    return Array.from(map.values()).sort(
      (a, b) => b.pedidos - a.pedidos
    );
  }, [pedidos]);

  // =========================
  // VENTAS POR PRODUCTO
  // =========================
  const ventas = useMemo(() => {
    const map = new Map();

    detalles.forEach((d) => {
      map.set(d.producto_id, (map.get(d.producto_id) || 0) + d.cantidad);
    });

    return productos.map((p) => ({
      ...p,
      ventas: map.get(p.id) || 0,
    }));
  }, [detalles, productos]);

  // =========================
  // TOP 10 PRODUCTOS
  // =========================
  const top10 = [...ventas]
    .sort((a, b) => b.ventas - a.ventas)
    .slice(0, 10);

  const topIds = new Set(top10.map((p) => p.id));

  // =========================
  // MENOS VENDIDOS (SIN DUPLICADOS)
  // =========================
  const menosVendidos = [...ventas]
    .filter((p) => !topIds.has(p.id)) // 🔥 evita duplicados
    .sort((a, b) => a.ventas - b.ventas)
    .slice(0, 10);

  // =========================
  // UI
  // =========================
  return (
    <div className="p-4 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <h1 className="text-lg font-bold text-gray-900 mb-4">
        Dashboard Administrativo
      </h1>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3 mb-4">

        <Card title="Ventas Totales" value={`Q ${kpis.totalVentas.toFixed(2)}`} />
        <Card title="Pedidos" value={kpis.pedidos} />
        <Card title="Ticket Promedio" value={`Q ${kpis.ticket.toFixed(2)}`} />

      </div>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-3">

        {/* CLIENTES */}
        <Box title="Clientes frecuentes">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-gray-900 font-semibold">
                <th className="text-left py-1">Cliente</th>
                <th className="text-left">Teléfono</th>
                <th className="text-right">Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {clientes.slice(0, 10).map((c, i) => (
                <tr key={i} className="border-b">
                  <td className="py-1 text-gray-900 font-medium">
                    {c.nombre}
                  </td>
                  <td className="text-gray-800">
                    {c.telefono}
                  </td>
                  <td className="text-right font-bold text-gray-900">
                    {c.pedidos}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {/* TOP 10 */}
        <Box title="Top 10 productos">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-gray-900 font-semibold">
                <th className="text-left py-1">Producto</th>
                <th className="text-right">Ventas</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-1 text-gray-900 font-medium">
                    {p.nombre}
                  </td>
                  <td className="text-right font-bold text-green-700">
                    {p.ventas}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {/* MENOS VENDIDOS */}
        <Box title="Menos vendidos">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-gray-900 font-semibold">
                <th className="text-left py-1">Producto</th>
                <th className="text-right">Ventas</th>
              </tr>
            </thead>
            <tbody>
              {menosVendidos.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-1 text-gray-900 font-medium">
                    {p.nombre}
                  </td>
                  <td className="text-right font-bold text-red-600">
                    {p.ventas}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

      </div>
    </div>
  );
}

// =========================
// COMPONENTES UI
// =========================

function Card({ title, value }: any) {
  return (
    <div className="bg-white border rounded-lg p-3">
      <p className="text-xs text-gray-800">{title}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Box({ title, children }: any) {
  return (
    <div className="bg-white border rounded-lg p-3">
      <h2 className="text-sm font-bold text-gray-900 mb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}