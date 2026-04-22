// Vista administrativa del historial de pedidos con detalle para seguimiento operativo.
"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toastConfirm, toastError, toastSuccess } from "@/lib/toast";

type Pedido = {
  id: number;
  numero_orden: string;
  nombre: string;
  telefono: string;
  direccion: string;
  horario: string;
  total: number;
  estado?: string | null;
  created_at: string;
};

type DetallePedido = {
  id: number;
  pedido_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  talla?: string | null;
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [detalles, setDetalles] = useState<DetallePedido[]>([]);
  const [pedidoExpandido, setPedidoExpandido] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const loadData = async () => {
    try {
      const [pedidosRes, detallesRes] = await Promise.all([
        supabase.from("pedidos").select("*").order("created_at", { ascending: false }),
        supabase.from("detalle_pedido").select("*"),
      ]);

      if (pedidosRes.error) {
        toastError("Error cargando pedidos");
        return;
      }

      if (detallesRes.error) {
        toastError("Error cargando detalles");
        return;
      }

      setPedidos(pedidosRes.data || []);
      setDetalles(detallesRes.data || []);
    } catch {
      toastError("Error inesperado cargando pedidos");
    }
  };

  useEffect(() => {
    void (async () => {
      await loadData();
    })();
  }, []);

  const pedidosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return pedidos;

    return pedidos.filter((pedido) =>
      [
        pedido.numero_orden,
        pedido.nombre,
        pedido.telefono,
        pedido.estado || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(texto)
    );
  }, [busqueda, pedidos]);

  const getDetalles = (pedidoId: number) =>
    detalles.filter((detalle) => detalle.pedido_id === pedidoId);

  const handleDelete = (id: number) => {
    toastConfirm({
      message: "¿Eliminar pedido?",
      type: "danger",
      onConfirm: async () => {
        const { error } = await supabase.from("pedidos").delete().eq("id", id);

        if (error) {
          toastError("No se pudo eliminar el pedido");
          return;
        }

        toastSuccess("Pedido eliminado");
        loadData();
      },
    });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
            Gestión de pedidos
          </p>
          <h1 className="mt-2 text-3xl font-black text-gray-900">
            Historial de pedidos
          </h1>
        </div>

        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por orden, cliente o estado"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 lg:max-w-md"
        />
      </div>

      <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Número de orden</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => {
                const abierto = pedidoExpandido === pedido.id;
                const detallesPedido = getDetalles(pedido.id);

                return (
                  <Fragment key={pedido.id}>
                    <tr className="border-t border-gray-200 text-gray-800">
                      <td className="px-4 py-3 font-semibold">{pedido.numero_orden}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold">{pedido.nombre}</p>
                          <p className="text-xs text-gray-500">{pedido.telefono}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-green-600">
                        Q{pedido.total}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize">
                          {pedido.estado || "pendiente"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setPedidoExpandido((prev) => (prev === pedido.id ? null : pedido.id))
                            }
                            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                          >
                            {abierto ? "Ocultar" : "Ver"}
                          </button>
                          <button
                            onClick={() => handleDelete(pedido.id)}
                            className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>

                    {abierto && (
                      <tr className="border-t border-gray-100 bg-gray-50/80">
                        <td colSpan={5} className="px-4 py-4">
                          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="rounded-3xl border border-gray-200 bg-white p-4">
                              <h3 className="text-lg font-black text-gray-900">
                                Detalle del pedido
                              </h3>

                              <div className="mt-4 space-y-3">
                                {detallesPedido.map((detalle) => (
                                  <div
                                    key={detalle.id}
                                    className="rounded-2xl border border-gray-200 px-4 py-3"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="font-semibold text-gray-900">
                                          {detalle.nombre}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {detalle.talla ? `Talla ${detalle.talla} · ` : ""}
                                          x{detalle.cantidad}
                                        </p>
                                      </div>
                                      <p className="font-bold text-green-600">
                                        Q{detalle.subtotal}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-3xl border border-gray-200 bg-white p-4">
                              <h3 className="text-lg font-black text-gray-900">
                                Datos de entrega
                              </h3>
                              <div className="mt-4 space-y-3 text-sm text-gray-600">
                                <p>
                                  <span className="font-semibold text-gray-900">
                                    Dirección:
                                  </span>{" "}
                                  {pedido.direccion}
                                </p>
                                <p>
                                  <span className="font-semibold text-gray-900">
                                    Horario:
                                  </span>{" "}
                                  {pedido.horario}
                                </p>
                                <p>
                                  <span className="font-semibold text-gray-900">
                                    Fecha:
                                  </span>{" "}
                                  {new Date(pedido.created_at).toLocaleString("es-GT")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
