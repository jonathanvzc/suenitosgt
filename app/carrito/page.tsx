"use client";

import { useEffect, useState } from "react";
import { getCart, removeFromCart } from "../../lib/cart";
import Link from "next/link";

export default function Carrito() {
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const actualizarCantidad = (id: number, cambio: number) => {
    const nuevoCarrito = cart.map((p) => {
      if (p.id === id) {
        return { ...p, cantidad: Math.max(1, p.cantidad + cambio) };
      }
      return p;
    });

    setCart(nuevoCarrito);
    localStorage.setItem("cart", JSON.stringify(nuevoCarrito));
  };

  const eliminar = (id: number) => {
    removeFromCart(id);
    setCart(getCart());
  };

  const total = cart.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0
  );
console.log("USER:", process.env.SMTP_USER);
console.log("PASS EXISTS:", !!process.env.SMTP_PASS);

console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS length:", process.env.SMTP_PASS?.length);

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      
      {/* CONTENEDOR CENTRADO */}
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          🛒 Tu Carrito
        </h1>

        {cart.length === 0 && (
          <p className="text-gray-600 text-center">
            Tu carrito está vacío
          </p>
        )}

        <div className="space-y-4">
          {cart.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-sm border p-4 flex gap-4 items-center"
            >
              {/* Imagen */}
              <img
                src={p.imagen_url || "https://via.placeholder.com/100"}
                className="w-20 h-20 object-cover rounded-lg"
              />

              {/* Info */}
              <div className="flex-1">
                <h2 className="font-semibold text-gray-800">
                  {p.nombre}
                </h2>

                <p className="text-gray-600 text-sm">
                  Q{p.precio}
                </p>

                {/* Cantidad */}
                <div className="flex items-center mt-2 gap-2">
                  <button
                    onClick={() => actualizarCantidad(p.id, -1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-lg hover:bg-black"
                  >
                    −
                  </button>

                  <span className="font-semibold text-gray-800">
                    {p.cantidad}
                  </span>

                  <button
                    onClick={() => actualizarCantidad(p.id, 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-lg hover:bg-black"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* LADO DERECHO */}
              <div className="flex flex-col items-end gap-2">
                <p className="font-bold text-green-600">
                  Q{p.precio * p.cantidad}
                </p>

                <button
                  onClick={() => eliminar(p.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* TOTAL + BOTÓN */}
        {cart.length > 0 && (
          <div className="mt-8 bg-white p-5 rounded-xl shadow border">
            
            {/* Total */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Total
              </h2>

              <h2 className="text-xl font-bold text-green-600">
                Q{total}
              </h2>
            </div>

            {/* Botón Checkout */}
            <Link href="/checkout">
              <button className="w-full bg-green-600 text-white py-3 rounded-xl text-lg hover:bg-green-700 transition">
                Finalizar compra 🚀
              </button>
            </Link>

          </div>
        )}

      </div>
    </div>
  );
}