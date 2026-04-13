"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCart } from "@/lib/cart";

export default function CartBottomBar() {
  const [cart, setCart] = useState<any[]>([]);

  const load = () => setCart(getCart());

  useEffect(() => {
    load();

    const update = () => load();
    window.addEventListener("cartUpdated", update);

    return () => window.removeEventListener("cartUpdated", update);
  }, []);

  const total = cart.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0
  );

  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white shadow-2xl border-t p-3 flex items-center justify-between animate-slideUp">
        
        <div>
          <p className="text-xs text-gray-500">
            {cart.length} productos
          </p>
          <p className="font-bold text-green-600">
            Q{total}
          </p>
        </div>

        <Link
          href="/checkout"
          className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold active:scale-95 transition"
        >
          Ir a pagar
        </Link>
      </div>
    </div>
  );
}