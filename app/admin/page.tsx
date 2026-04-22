// Dashboard administrativo con KPIs, clientes frecuentes y accesos rapidos al backoffice.
"use client";

import Link from "next/link";
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

const quickLinks = [
  {
    href: "/admin/productos",
    title: "Productos",
    description: "Gestiona productos, imágenes, tallas y video.",
  },
  {
    href: "/admin/categorias",
    title: "Categorías",
    description: "CRUD completo de categorías principales.",
  },
  {
    href: "/admin/subcategorias",
    title: "Subcategorías",
    description: "CRUD amigable filtrado por categoría.",
  },
  {
    href: "/admin/pedidos",
    title: "Pedidos",
    description: "Consulta historial, detalle y entregas.",
  },
];

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [detalles, setDetalles] = useState<Detalle[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

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

    void load();
  }, []);

  const kpis = useMemo(() => {
    const totalVentas = pedidos.reduce((a, b) => a + (b.total || 0), 0);
    const ticket = pedidos.length ? totalVentas / pedidos.length : 0;

    return {
      totalVentas,
      pedidos: pedidos.length,
      ticket,
    };
  }, [pedidos]);

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

    return Array.from(map.values()).sort((a, b) => b.pedidos - a.pedidos);
  }, [pedidos]);

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

  const top10 = [...ventas]
    .sort((a, b) => b.ventas - a.ventas)
    .slice(0, 10);

  const topIds = new Set(top10.map((p) => p.id));

  const menosVendidos = [...ventas]
    .filter((p) => !topIds.has(p.id))
    .sort((a, b) => a.ventas - b.ventas)
    .slice(0, 10);

  return (
    <div className="space-y-6 p-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
          Administración
        </p>
        <h1 className="mt-2 text-3xl font-black text-gray-900">
          Dashboard administrativo
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-black text-gray-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card title="Ventas Totales" value={`Q ${kpis.totalVentas.toFixed(2)}`} />
        <Card title="Pedidos" value={kpis.pedidos} />
        <Card title="Ticket Promedio" value={`Q ${kpis.ticket.toFixed(2)}`} />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
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
                  <td className="py-1 text-gray-900 font-medium">{c.nombre}</td>
                  <td className="text-gray-800">{c.telefono}</td>
                  <td className="text-right font-bold text-gray-900">{c.pedidos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

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
                  <td className="py-1 text-gray-900 font-medium">{p.nombre}</td>
                  <td className="text-right font-bold text-green-700">{p.ventas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

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
                  <td className="py-1 text-gray-900 font-medium">{p.nombre}</td>
                  <td className="text-right font-bold text-red-600">{p.ventas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-800">{title}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-bold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}
