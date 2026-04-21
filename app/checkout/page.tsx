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

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = cart.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0
  );

  // =========================
  // 🔒 VALIDAR TELÉFONO
  // =========================
  const validarTelefono = (tel: string) => {
    return /^[0-9]{8}$/.test(tel);
  };

  // =========================
  // 🔒 SANITIZAR INPUTS (ANTI XSS)
  // =========================
  const sanitize = (text: string) => {
    return text.replace(/<[^>]*>?/gm, "").trim();
  };

  // =========================
  // ⚡ VALIDACIÓN EN TIEMPO REAL
  // =========================
  useEffect(() => {
    const valido =
      nombre.trim().length > 0 &&
      direccion.trim().length > 0 &&
      horario.trim().length > 0 &&
      validarTelefono(telefono);

    setIsValid(valido);
  }, [nombre, telefono, direccion, horario]);

  // =========================
  // 📲 GENERAR MENSAJE
  // =========================
  const generarMensajeWhatsApp = (
    nombreSafe: string,
    telefonoSafe: string,
    direccionSafe: string,
    horarioSafe: string
  ) => {
    let mensaje = `🧾 NUEVO PEDIDO\n\n`;
    mensaje += `👤 ${nombreSafe}\n📞 ${telefonoSafe}\n📍 ${direccionSafe}\n⏰ ${horarioSafe}\n\n`;

    cart.forEach((p) => {
      mensaje += `• ${p.nombre} x${p.cantidad} = Q${p.precio * p.cantidad}\n`;
    });

    mensaje += `\n💰 TOTAL: Q${total}`;

    return mensaje;
  };

  // =========================
  // 🚀 ENVIAR PEDIDO
  // =========================
  const enviarPedido = async () => {

    // 🔴 VALIDACIÓN FINAL (doble seguridad)
    if (!nombre.trim() || !telefono.trim() || !direccion.trim() || !horario.trim()) {
      toast.error("Completa todos los campos");
      return;
    }

    if (!validarTelefono(telefono)) {
      toast.error("Teléfono inválido (8 dígitos)");
      return;
    }

    // 🚫 ANTI-SPAM (10 segundos)
    const lastOrderTime = localStorage.getItem("last_order");

    if (lastOrderTime && Date.now() - Number(lastOrderTime) < 10000) {
      toast.error("Espera unos segundos antes de enviar otro pedido");
      return;
    }

    localStorage.setItem("last_order", Date.now().toString());

    // 🔒 SANITIZAR DATOS
    const nombreSafe = sanitize(nombre);
    const telefonoSafe = sanitize(telefono);
    const direccionSafe = sanitize(direccion);
    const horarioSafe = sanitize(horario);

    // 📲 GENERAR MENSAJE
    const mensaje = generarMensajeWhatsApp(
      nombreSafe,
      telefonoSafe,
      direccionSafe,
      horarioSafe
    );

    const numero = "50236338637";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");

    // 🧹 LIMPIAR CARRITO
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));

    toast.success("Pedido enviado 🎉");
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

        {/* 📦 FORMULARIO */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow">

          {/* 🔒 SEGURIDAD */}
          <div className="mb-4 flex items-center gap-2 text-green-600 font-semibold">
            🔒 Compra segura | Datos protegidos
          </div>

          <h1 className="text-2xl font-bold mb-6 text-black">
            Finalizar pedido
          </h1>

          {/* INPUTS */}
          <input
            placeholder="Nombre completo"
            className="w-full border p-3 rounded-lg mb-3 text-black"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            placeholder="Teléfono (8 dígitos)"
            className={`w-full border p-3 rounded-lg mb-3 text-black ${
              telefono && !validarTelefono(telefono)
                ? "border-red-500"
                : ""
            }`}
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          <input
            placeholder="Dirección de entrega"
            className="w-full border p-3 rounded-lg mb-3 text-black"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />

          <input
            placeholder="Horario de entrega"
            className="w-full border p-3 rounded-lg mb-3 text-black"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
          />

          {/* BOTÓN */}
          <button
            disabled={!isValid}
            onClick={enviarPedido}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              isValid
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Confirmar pedido
          </button>

          {/* TEXTO AYUDA */}
          {!isValid && (
            <p className="text-sm text-gray-500 mt-2">
              El botón se activará cuando completes todos los datos correctamente
            </p>
          )}
        </div>

        {/* 📊 RESUMEN */}
        <div className="bg-white p-6 rounded-2xl shadow h-fit sticky top-4">

          <h2 className="text-lg font-bold mb-4 text-black">
            Resumen del pedido
          </h2>

          {cart.map((p) => (
            <div key={p.id} className="flex justify-between mb-2 text-sm">
              <span className="text-black">
                {p.nombre} x{p.cantidad}
              </span>
              <span className="text-green-600 font-bold">
                Q{p.precio * p.cantidad}
              </span>
            </div>
          ))}

          <hr className="my-3" />

          <div className="flex justify-between font-bold text-lg">
            <span className="text-black">Total</span>
            <span className="text-green-600">Q{total}</span>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            🔒 Pagos seguros • Datos encriptados • Compra protegida
          </div>
        </div>

      </div>
    </div>
  );
}