// Checkout invitado que guarda el pedido, dispara email y abre WhatsApp con el resumen.
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CartItem, clearCart, getCart, getCartItemKey } from "@/lib/cart";
import { getErrorMessage } from "@/lib/errors";
import { toastError, toastInfo, toastSuccess } from "@/lib/toast";

const WHATSAPP_NUMBER = "50236338637";

type PedidoResponse = {
  success: boolean;
  message?: string;
  numero_orden?: string;
  total?: number;
};

type EmailResponse = {
  success: boolean;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart] = useState<CartItem[]>(() => getCart());
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [horario, setHorario] = useState("");
  const [loading, setLoading] = useState(false);

  const total = useMemo(
    () => cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [cart]
  );

  const validarTelefono = (value: string) => /^[0-9]{8}$/.test(value);
  const sanitize = (value: string) => value.replace(/<[^>]*>?/gm, "").trim();

  const isValid =
    cart.length > 0 &&
    sanitize(nombre).length > 0 &&
    sanitize(direccion).length > 0 &&
    sanitize(horario).length > 0 &&
    validarTelefono(sanitize(telefono));

  const generarMensaje = (
    nombreSafe: string,
    telefonoSafe: string,
    direccionSafe: string,
    horarioSafe: string,
    numeroOrden: string
  ) => {
    const lines = [
      `Pedido ${numeroOrden}`,
      "",
      `Cliente: ${nombreSafe}`,
      `Telefono: ${telefonoSafe}`,
      `Lugar de entrega: ${direccionSafe}`,
      `Horario: ${horarioSafe}`,
      "",
      "Detalle del pedido",
      "------------------------------",
    ];

    cart.forEach((item, index) => {
      const talla = item.talla ? ` | Talla: ${item.talla}` : "";
      lines.push(
        `${index + 1}. ${item.nombre}${talla} | Cant: ${item.cantidad} | Total: Q${
          item.precio * item.cantidad
        }`
      );
    });

    lines.push("------------------------------");
    lines.push(`Total general: Q${total}`);
    lines.push("Gracias por tu compra.");

    return lines.join("\n");
  };

  const enviarPedido = async () => {
    if (cart.length === 0) {
      toastError("Tu carrito está vacío");
      return;
    }

    if (!isValid) {
      toastError("Completa correctamente los datos del pedido");
      return;
    }

    setLoading(true);

    const payload = {
      nombre: sanitize(nombre),
      telefono: sanitize(telefono),
      direccion: sanitize(direccion),
      horario: sanitize(horario),
      carrito: cart,
    };

    try {
      const pedidoRes = await fetch("/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const pedidoData: PedidoResponse = await pedidoRes.json();

      if (!pedidoRes.ok || !pedidoData.success || !pedidoData.numero_orden) {
        throw new Error(pedidoData.message || "No se pudo guardar el pedido");
      }

      const numeroOrden = pedidoData.numero_orden;
      const mensaje = generarMensaje(
        payload.nombre,
        payload.telefono,
        payload.direccion,
        payload.horario,
        numeroOrden
      );

      try {
        const emailRes = await fetch("/api/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            total,
            numero_orden: numeroOrden,
            mensaje,
          }),
        });

        const emailData: EmailResponse = await emailRes.json();

        if (!emailRes.ok || !emailData.success) {
          toastInfo("Pedido guardado, pero el email no pudo enviarse");
        } else {
          toastSuccess("Correo enviado correctamente");
        }
      } catch {
        toastInfo("Pedido guardado, pero el email no pudo enviarse");
      }

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`,
        "_blank"
      );

      clearCart();
      toastSuccess(`Pedido ${numeroOrden} creado correctamente`);
      router.push("/");
    } catch (error) {
      toastError(getErrorMessage(error, "Error al enviar pedido"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        <section className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm md:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
            Checkout
          </p>
          <h1 className="mt-2 text-3xl font-black text-gray-900">Finalizar pedido</h1>

          <div className="mt-6 grid gap-4">
            <input
              placeholder="Nombre completo"
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            <input
              placeholder="Teléfono"
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 8))}
            />

            <input
              placeholder="Dirección de entrega"
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />

            <input
              placeholder="Horario de entrega"
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
            />
          </div>

          <button
            disabled={!isValid || loading}
            onClick={enviarPedido}
            className="mt-6 w-full rounded-full bg-green-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Procesando pedido..." : "Confirmar pedido"}
          </button>
        </section>

        <aside className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Resumen</h2>

          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 text-center font-semibold">Cant.</th>
                  <th className="px-4 py-3 text-center font-semibold">Talla</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr
                    key={getCartItemKey(item.id, item.talla)}
                    className="border-t border-gray-200"
                  >
                    <td className="px-4 py-3 text-gray-900">{item.nombre}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{item.cantidad}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{item.talla || "-"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      Q{item.precio * item.cantidad}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-gray-300 bg-gray-50">
                  <td colSpan={3} className="px-4 py-4 text-right text-base font-black text-gray-900">
                    Gran total
                  </td>
                  <td className="px-4 py-4 text-right text-base font-black text-green-600">
                    Q{total}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </div>
  );
}
