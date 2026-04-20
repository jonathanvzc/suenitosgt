"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toastSuccess, toastError, toastConfirm } from "@/lib/toast";

type Pedido = {
  id: number;
  numero_orden: string;
  nombre: string;
  telefono: string;
  direccion: string;
  horario: string;
  total: number;
  created_at: string;
};

type DetallePedido = {
  id: number;
  pedido_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [detalles, setDetalles] = useState<DetallePedido[]>([]);
  const [pedidoExpandido, setPedidoExpandido] = useState<number | null>(null);

  // =========================
  // ORDEN FORMATO
  // =========================
const getNumeroOrden = (numero_orden: string) => {
  return numero_orden;
};

  // =========================
  // LOAD DATA (30 días)
  // =========================
  const loadData = async () => {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);

      const pedidosRes = await supabase
        .from("pedidos")
        .select("*")
        .gte("created_at", fechaLimite.toISOString())
        .order("created_at", { ascending: false });

      const detallesRes = await supabase
        .from("detalle_pedido")
        .select("*");

      if (pedidosRes.error) {
        console.error(pedidosRes.error);
        toastError("Error cargando pedidos");
        return;
      }

      if (detallesRes.error) {
        console.error(detallesRes.error);
        toastError("Error cargando detalles");
        return;
      }

      setPedidos(pedidosRes.data || []);
      setDetalles(detallesRes.data || []);
    } catch (error) {
      console.error(error);
      toastError("Error inesperado cargando pedidos");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // DETALLES
  // =========================
  const getDetalles = (pedidoId: number) =>
    detalles.filter((d) => d.pedido_id === pedidoId);

  // =========================
  // TOGGLE ANIMADO
  // =========================
  const togglePedido = (id: number) => {
    setPedidoExpandido((prev) => (prev === id ? null : id));
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = (id: number) => {
    toastConfirm({
      message: "¿Eliminar pedido?",
      type: "danger",
      onConfirm: async () => {
        const { error } = await supabase
          .from("pedidos")
          .delete()
          .eq("id", id);

        if (error) {
          toastError("Error al eliminar");
          return;
        }

        toastSuccess("Pedido eliminado");
        loadData();
      },
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Gestión de Pedidos (Últimos 30 días)
      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full text-sm text-gray-900">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Orden</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Dirección</th>
              <th className="p-3">Total</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pedidos.map((p) => {
              const abierto = pedidoExpandido === p.id;
              const detallesPedido = getDetalles(p.id);

              return (
                <>
                  {/* FILA PRINCIPAL */}
                  <tr
                    key={p.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-bold">
                      {p.numero_orden}
                    </td>

                    <td className="p-3 font-semibold">
                      {p.nombre}
                    </td>

                    <td className="p-3">
                      {p.telefono}
                    </td>

                    <td className="p-3 text-gray-700">
                      {p.direccion}
                    </td>

                    <td className="p-3 font-bold text-green-600">
                      Q{p.total}
                    </td>

                    <td className="p-3 flex gap-2 justify-center">

                      <button
                        onClick={() => togglePedido(p.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                      >
                        {abierto ? "Cerrar" : "Ver"}
                      </button>

                      <button
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition"
                      >
                        Eliminar
                      </button>

                    </td>
                  </tr>

                  {/* DETALLE CON ANIMACIÓN */}
                  <tr>
                    <td colSpan={6}>
                      <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                          abierto ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        {abierto && (
                          <div className="bg-gray-50 p-4">

                            <div className="bg-white border rounded-xl overflow-hidden">

                              {/* HEADER */}
                              <div className="p-3 border-b bg-gray-100">
                                <h3 className="font-bold text-gray-900">
                                  Detalle {p.numero_orden}
                                </h3>
                              </div>

                              {/* TABLA DETALLE */}
                              <table className="w-full text-sm">

                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="p-2 text-left">Producto</th>
                                    <th className="p-2">Precio</th>
                                    <th className="p-2">Cantidad</th>
                                    <th className="p-2 text-right">Subtotal</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {detallesPedido.map((d) => (
                                    <tr key={d.id} className="border-t">
                                      <td className="p-2">{d.nombre}</td>
                                      <td className="p-2">Q{d.precio}</td>
                                      <td className="p-2">{d.cantidad}</td>
                                      <td className="p-2 text-right font-bold text-green-600">
                                        Q{d.subtotal}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>

                              </table>

                              {/* TOTAL */}
                              <div className="flex justify-end p-3 border-t bg-white">
                                <div className="text-right">
                                  <p className="text-gray-500 text-sm">
                                    Total
                                  </p>
                                  <p className="text-xl font-bold text-green-700">
                                    Q{p.total}
                                  </p>
                                </div>
                              </div>

                            </div>

                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>

        </table>

      </div>
    </div>
  );
}