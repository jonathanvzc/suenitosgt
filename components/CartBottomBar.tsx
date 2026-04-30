// Barra inferior movil con acceso persistente al carrito y resumen rapido de items.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartItem, getCart } from "@/lib/cart";

export default function CartBottomBar() {
  const pathname = usePathname();
  const [cart, setCart] = useState<CartItem[]>([]);

  const load = () => setCart(getCart());

  useEffect(() => {
    const update = () => load();
    const frame = window.requestAnimationFrame(update);
    window.addEventListener("cartUpdated", update);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("cartUpdated", update);
    };
  }, []);

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  if (cart.length === 0 || pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="animate-slideUp flex items-center justify-between border-t border-emerald-100 bg-white p-3 shadow-2xl">
        <div>
          <p className="text-xs text-slate-500">{cart.length} producto(s)</p>
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
