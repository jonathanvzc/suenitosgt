// Vista del carrito con ajuste de cantidades, eliminacion de items y acceso al checkout.
"use client";

import { useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import {
  CartItem,
  getCart,
  getCartItemKey,
  removeFromCart,
  updateCartItemQuantity,
} from "@/lib/cart";

export default function CarritoPage() {
  const [cart, setCart] = useState<CartItem[]>(() => getCart());

  const actualizarCantidad = (id: number, talla: string | null | undefined, cambio: number) => {
    const item = cart.find(
      (producto) => producto.id === id && (producto.talla || null) === (talla || null)
    );

    if (!item) return;

    updateCartItemQuantity(id, talla, item.cantidad + cambio);
    setCart(getCart());
  };

  const eliminar = (id: number, talla: string | null | undefined) => {
    removeFromCart(id, talla);
    setCart(getCart());
  };

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
            Resumen
          </p>
          <h1 className="mt-2 text-4xl font-black text-gray-900">Tu carrito</h1>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[30px] border border-dashed border-gray-300 bg-white/80 px-6 py-20 text-center">
            <p className="text-gray-600">Tu carrito está vacío.</p>
            <Link
              href="/"
              className="mt-4 inline-flex rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Volver a la tienda
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((producto) => (
                <article
                  key={getCartItemKey(producto.id, producto.talla)}
                  className="flex gap-4 rounded-[28px] border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-gray-100">
                    <ProductImage src={producto.imagen_url || null} alt={producto.nombre} />
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{producto.nombre}</h2>
                      {producto.talla && (
                        <p className="mt-1 text-sm font-medium text-gray-500">
                          Talla: {producto.talla}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        Q{producto.precio} por unidad
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <div className="flex items-center gap-2 rounded-full bg-gray-100 px-2 py-2">
                        <button
                          onClick={() => actualizarCantidad(producto.id, producto.talla, -1)}
                          className="h-9 w-9 rounded-full bg-white text-lg font-bold text-gray-900 transition hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="min-w-8 text-center font-semibold text-gray-900">
                          {producto.cantidad}
                        </span>
                        <button
                          onClick={() => actualizarCantidad(producto.id, producto.talla, 1)}
                          className="h-9 w-9 rounded-full bg-white text-lg font-bold text-gray-900 transition hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-xl font-black text-green-600">
                        Q{producto.precio * producto.cantidad}
                      </p>

                      <button
                        onClick={() => eliminar(producto.id, producto.talla)}
                        className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <section className="mt-8 rounded-[30px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Total</h2>
                <p className="text-3xl font-black text-green-600">Q{total}</p>
              </div>

              <Link
                href="/checkout"
                className="mt-5 block rounded-full bg-green-600 px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Finalizar compra
              </Link>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
