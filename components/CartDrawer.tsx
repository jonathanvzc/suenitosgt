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

  const loadCart = () => {
    setCart(getCart());
  };

  useEffect(() => {
    loadCart();

    const update = () => loadCart();

    window.addEventListener("cartUpdated", update);
    return () => window.removeEventListener("cartUpdated", update);
  }, []);

  const updateQty = (id: number, qty: number) => {
    const newCart = cart.map((p) =>
      p.id === id ? { ...p, cantidad: qty } : p
    );

    setCart(newCart);
    saveCart(newCart);
  };

  const removeItem = (id: number) => {
    const newCart = cart.filter((p) => p.id !== id);

    setCart(newCart);
    saveCart(newCart);
  };

  const total = cart.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0
  );

  return (
    <>
      {/* BOTÓN */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg z-50"
      >
        Carrito {cart.length}
      </button>

      {/* OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* PANEL */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-2xl transition-transform duration-300 flex flex-col ${
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
            className="text-black text-xl"
          >
            ×
          </button>
        </div>

        {/* LISTA */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {cart.length === 0 ? (
            <p className="text-black text-center mt-10">
              Carrito vacío
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
                      className="w-7 h-7 bg-gray-300 text-black rounded"
                    >
                      -
                    </button>

                    <span className="text-black font-semibold">
                      {p.cantidad}
                    </span>

                    <button
                      onClick={() =>
                        updateQty(p.id, p.cantidad + 1)
                      }
                      className="w-7 h-7 bg-gray-300 text-black rounded"
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeItem(p.id)}
                      className="ml-auto text-red-600 text-xs"
                    >
                      eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t p-4">
          <div className="flex justify-between mb-3">
            <span className="font-bold text-black">Total</span>
            <span className="font-bold text-green-600">
              Q{total}
            </span>
          </div>

          <Link
            href="/checkout"
            onClick={() => setOpen(false)}
            className="block bg-green-600 text-white text-center py-3 rounded-xl"
          >
            Ir a pagar
          </Link>
        </div>
      </div>
    </>
  );
}