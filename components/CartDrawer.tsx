"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCart, saveCart } from "../lib/cart";

type Item = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen_url?: string;
};

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<Item[]>([]);
  const [pulse, setPulse] = useState(false);

  const loadCart = () => setCart(getCart());

  useEffect(() => {
    loadCart();
    const update = () => loadCart();

    window.addEventListener("cartUpdated", update);
    return () => window.removeEventListener("cartUpdated", update);
  }, []);

  // ✨ ANIMACIÓN GLOBAL
  const triggerPulse = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 200);
  };

  const updateQty = (id: number, qty: number) => {
    const newCart = cart.map((p) =>
      p.id === id ? { ...p, cantidad: qty } : p
    );

    setCart(newCart);
    saveCart(newCart);
    triggerPulse();
  };

  const removeItem = (id: number) => {
    const newCart = cart.filter((p) => p.id !== id);
    setCart(newCart);
    saveCart(newCart);
    triggerPulse();
  };

  const total = cart.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0
  );

  const isEmpty = cart.length === 0;

  return (
    <>
      {/* 🛒 BOTÓN CARRITO */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg z-50 transition active:scale-95 ${
          pulse ? "scale-110" : "scale-100"
        }`}
      >
        🛒 {cart.length}
      </button>

      {/* 🌑 OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* 📦 PANEL */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between">
          <h2 className="font-bold text-lg text-black">
            Tu carrito
          </h2>

          <button
            onClick={() => setOpen(false)}
            className="text-black text-xl active:scale-90"
          >
            ×
          </button>
        </div>

        {/* LISTA */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {isEmpty ? (
            <p className="text-black text-center mt-10">
              🛒 Carrito vacío
            </p>
          ) : (
            cart.map((p) => (
              <div
                key={p.id}
                className="flex gap-3 bg-white border rounded-xl p-3"
              >
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  {p.imagen_url && (
                    <img
                      src={p.imagen_url}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-black text-sm">
                    {p.nombre}
                  </p>

                  <p className="text-green-700 font-bold text-sm">
                    Q{p.precio}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateQty(p.id, Math.max(1, p.cantidad - 1))
                      }
                      className="w-9 h-9 bg-gray-100 text-black rounded-lg font-bold active:scale-95"
                    >
                      -
                    </button>

                    <span className="text-black font-semibold min-w-[20px] text-center">
                      {p.cantidad}
                    </span>

                    <button
                      onClick={() => updateQty(p.id, p.cantidad + 1)}
                      className="w-9 h-9 bg-gray-100 text-black rounded-lg font-bold active:scale-95"
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeItem(p.id)}
                      className="ml-auto text-red-600 text-sm font-bold px-3 py-1 rounded-lg hover:bg-red-50 active:scale-95 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 🔥 RESUMEN STICKY MÓVIL PRO */}
        <div className="border-t bg-white p-4 sticky bottom-0 shadow-lg">
          
          {/* TOTAL */}
          <div className="flex justify-between mb-3">
            <span className="font-bold text-black">Total</span>
            <span className="font-bold text-green-600 text-lg">
              Q{total}
            </span>
          </div>

          {/* BOTÓN */}
          {isEmpty ? (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-600 py-3 rounded-xl font-semibold cursor-not-allowed"
            >
              Ir a pagar
            </button>
          ) : (
            <Link
              href="/checkout"
              onClick={() => {
                setOpen(false);
                triggerPulse();
              }}
              className="block bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-xl font-semibold active:scale-95 transition"
            >
              Ir a pagar
            </Link>
          )}
        </div>
      </div>
    </>
  );
}