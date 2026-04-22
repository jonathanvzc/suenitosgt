// Barra inferior movil con acceso persistente al carrito y resumen rapido de items.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CartItem, getCart, getCartCount } from "@/lib/cart";

export default function CartBottomBar() {
  const [cart, setCart] = useState<CartItem[]>(() => getCart());

  const load = () => setCart(getCart());

  useEffect(() => {
    const update = () => load();
    window.addEventListener("cartUpdated", update);

    return () => window.removeEventListener("cartUpdated", update);
  }, []);

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="animate-slideUp flex items-center justify-between border-t border-emerald-100 bg-white p-3 shadow-2xl">
        <div>
          <p className="text-xs text-slate-500">{getCartCount()} producto(s)</p>
          <p className="font-bold text-emerald-600">Q{total}</p>
        </div>

        <Link
          href="/checkout"
          className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition active:scale-95"
        >
          Ir a pagar
        </Link>
      </div>
    </div>
  );
}
