// Dashboard administrativo enfocado en métricas accionables de clientes y productos.
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

// Carga ventas y muestra únicamente las tres tarjetas operativas solicitadas.
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

  // Agrupa pedidos por teléfono para detectar clientes con más recurrencia.
  const clientes = useMemo(() => {
    const map = new Map();

    pedidos.forEach((pedido) => {
      const key = pedido.telefono;

      if (!map.has(key)) {
        map.set(key, {
          nombre: pedido.nombre,
          telefono: pedido.telefono,
          pedidos: 0,
          total: 0,
        });
      }

      const cliente = map.get(key);
      cliente.pedidos += 1;
      cliente.total += pedido.total;
    });

    return Array.from(map.values()).sort((a, b) => b.pedidos - a.pedidos);
  }, [pedidos]);

  // Suma unidades vendidas por producto para construir rankings comerciales.
  const ventas = useMemo(() => {
    const map = new Map();

    detalles.forEach((detalle) => {
      map.set(detalle.producto_id, (map.get(detalle.producto_id) || 0) + detalle.cantidad);
    });

    return productos.map((producto) => ({
      ...producto,
      ventas: map.get(producto.id) || 0,
    }));
  }, [detalles, productos]);

  const top10 = [...ventas].sort((a, b) => b.ventas - a.ventas).slice(0, 10);
  const topIds = new Set(top10.map((producto) => producto.id));
  const menosVendidos = [...ventas]
    .filter((producto) => !topIds.has(producto.id))
    .sort((a, b) => a.ventas - b.ventas)
    .slice(0, 10);

  return (
    <div className="space-y-6 p-4">
      <div>

        <h1 className="mt-2 text-3xl font-black text-gray-900">Dashboard administrativo</h1>
        <p className="mt-2 text-sm text-gray-500">
          Resumen comercial para detectar clientes frecuentes y productos con mejor o peor salida.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Box title="Clientes frecuentes">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b font-semibold text-gray-900">
                <th className="py-1 text-left">Cliente</th>
                <th className="text-left">Teléfono</th>
                <th className="text-right">Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {clientes.slice(0, 10).map((cliente, index) => (
                <tr key={`${cliente.telefono}-${index}`} className="border-b">
                  <td className="py-1 font-medium text-gray-900">{cliente.nombre}</td>
                  <td className="text-gray-800">{cliente.telefono}</td>
                  <td className="text-right font-bold text-gray-900">{cliente.pedidos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Box title="Top 10 productos más vendidos">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b font-semibold text-gray-900">
                <th className="py-1 text-left">Producto</th>
                <th className="text-right">Ventas</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((producto) => (
                <tr key={producto.id} className="border-b">
                  <td className="py-1 font-medium text-gray-900">{producto.nombre}</td>
                  <td className="text-right font-bold text-green-700">{producto.ventas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Box title="Top 10 productos menos vendidos">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b font-semibold text-gray-900">
                <th className="py-1 text-left">Producto</th>
                <th className="text-right">Ventas</th>
              </tr>
            </thead>
            <tbody>
              {menosVendidos.map((producto) => (
                <tr key={producto.id} className="border-b">
                  <td className="py-1 font-medium text-gray-900">{producto.nombre}</td>
                  <td className="text-right font-bold text-rose-600">{producto.ventas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </div>
    </div>
  );
}

// Tarjeta base reutilizable para bloques del dashboard.
function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-bold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}
