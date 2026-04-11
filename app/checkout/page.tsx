"use client";

import { useEffect, useState } from "react";
import { getCart } from "../../lib/cart";
import toast from "react-hot-toast";

export default function Checkout() {
  const [cart, setCart] = useState<any[]>([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [horario, setHorario] = useState("");

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = cart.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0
  );
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // 🔥 GENERAR MENSAJE WHATSAPP (CORREGIDO UTF-8 + FORMATO PRO)
  const generarMensajeWhatsApp = (orderId: string) => {
    //orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    let mensaje = "";

    mensaje += ` NUEVO PEDIDO #${orderId}\n\n`;

    mensaje += ` Cliente: ${nombre}\n`;
    mensaje += ` Teléfono: ${telefono}\n`;
    mensaje += ` Lugar de entrega: ${direccion}\n`;
    mensaje += ` Horario: ${horario}\n\n`;

    mensaje += ` DETALLE DEL PEDIDO\n`;
    mensaje += `--------------------------------\n`;
    mensaje += `ID | PRODUCTO | CANT | TOTAL\n`;
    mensaje += `--------------------------------\n`;

    cart.forEach((p) => {
      const totalItem = p.precio * p.cantidad;

      mensaje += `${p.id} | ${p.nombre} | ${p.cantidad} | Q${totalItem}\n`;
    });

    mensaje += `--------------------------------\n\n`;
    mensaje += ` TOTAL GENERAL: Q${total}\n`;
    mensaje += ` Gracias por tu compra`;

    return mensaje;
  };


  const enviarPedido = async () => {
    if (!nombre || !telefono || !direccion || !horario) {
      toast.error("Completa todos los campos");
      return;
    }

    //const orderId = `ORD-${Date.now()}`;

    try {
      // ================================
      // 1. GUARDAR EN BASE DE DATOS
      // ================================
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          telefono,
          direccion,
          horario,
          carrito: cart,
          total,
          orderId,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error("Error al guardar pedido");
        return;
      }

      // ================================
      // 2. ENVIAR EMAIL (ADMIN)
      // ================================
      try {
        await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre,
            telefono,
            direccion,
            horario,
            carrito: cart,
            total,
            orderId,
          }),
        });
      } catch (e) {
        console.log("Email falló pero pedido sigue OK");
      }

      // ================================
      // 3. WHATSAPP ADMIN
      // ================================
      const numero = "50243047979";
      //const encode = (text: string) => encodeURIComponent(text);
      const mensaje = generarMensajeWhatsApp(orderId);
      const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

      //const url = `https://wa.me/${numero}?text=${encode(mensaje)}`;
      window.open(url, "_blank");

      // ================================
      // 4. LIMPIAR CARRITO
      // ================================
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));

      setCart([]);

      toast.success("Pedido enviado correctamente 🎉");

    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          🧾 Finalizar Pedido
        </h1>

        {/* FORMULARIO */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border p-3 rounded-lg text-gray-800"
          />

          <input
            type="text"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full border p-3 rounded-lg text-gray-800"
          />

          <input
            type="text"
            placeholder="Lugar de entrega"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="w-full border p-3 rounded-lg text-gray-800"
          />

          <input
            type="text"
            placeholder="Horario de entrega"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="w-full border p-3 rounded-lg text-gray-800"
          />
        </div>

        {/* RESUMEN */}
        <div className="mt-8">
          <h2 className="font-semibold mb-3 text-gray-700">
            Resumen del pedido
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="p-3 text-left">Producto</th>
                  <th className="p-3 text-center">Cantidad</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>

              <tbody className="text-gray-900 bg-white">
                {cart.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.nombre}</td>
                    <td className="p-3 text-center">{p.cantidad}</td>
                    <td className="p-3 text-right font-bold text-green-600">
                      Q{p.precio * p.cantidad}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4 font-bold text-gray-800">
            <span>Total</span>
            <span className="text-green-600">Q{total}</span>
          </div>
        </div>

        {/* BOTÓN */}
        <button
          onClick={enviarPedido}
          className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition"
        >
          Confirmar pedido
        </button>

      </div>
    </div>
  );
}