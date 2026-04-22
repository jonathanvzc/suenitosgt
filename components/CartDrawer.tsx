// Drawer flotante del carrito para mostrar contenido rapido sin salir de la navegacion actual.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import {
  CartItem,
  getCart,
  getCartCount,
  getCartItemKey,
  removeFromCart,
  updateCartItemQuantity,
} from "@/lib/cart";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => getCart());

  const loadCart = () => setCart(getCart());

  useEffect(() => {
    const update = () => loadCart();

    window.addEventListener("cartUpdated", update);
    return () => window.removeEventListener("cartUpdated", update);
  }, []);

  const updateQty = (id: number, talla: string | null | undefined, qty: number) => {
    updateCartItemQuantity(id, talla, qty);
    loadCart();
  };

  const removeItem = (id: number, talla: string | null | undefined) => {
    removeFromCart(id, talla);
    loadCart();
  };

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const isEmpty = cart.length === 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 hidden rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-emerald-700 md:block"
      >
        Carrito ({getCartCount()})
      </button>

      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40"
          aria-label="Cerrar carrito"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Resumen rápido
            </p>
            <h2 className="text-lg font-black text-slate-900">Tu carrito</h2>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="rounded-full border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {isEmpty ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 px-4 py-16 text-center text-slate-500">
              Tu carrito está vacío.
            </div>
          ) : (
            cart.map((item) => (
              <article
                key={getCartItemKey(item.id, item.talla)}
                className="rounded-[24px] border border-slate-200 bg-white p-3"
              >
                <div className="flex gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                    <ProductImage src={item.imagen_url || null} alt={item.nombre} />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{item.nombre}</p>
                    {item.talla && (
                      <p className="mt-1 text-sm text-slate-500">Talla: {item.talla}</p>
                    )}
                    <p className="mt-1 text-sm font-bold text-emerald-600">Q{item.precio}</p>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.talla, item.cantidad - 1)}
                        className="h-9 w-9 rounded-full bg-slate-100 text-slate-900 transition hover:bg-slate-200"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center font-semibold text-slate-900">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.talla, item.cantidad + 1)}
                        className="h-9 w-9 rounded-full bg-slate-100 text-slate-900 transition hover:bg-slate-200"
                      >
                        +
                      </button>

                      <button
                        onClick={() => removeItem(item.id, item.talla)}
                        className="ml-auto text-sm font-semibold text-rose-600 transition hover:text-rose-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="text-2xl font-black text-emerald-600">Q{total}</span>
          </div>

          {isEmpty ? (
            <button
              disabled
              className="w-full rounded-full bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-500"
            >
              Ir a pagar
            </button>
          ) : (
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="block rounded-full bg-emerald-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Ir a pagar
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
