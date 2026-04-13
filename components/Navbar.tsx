"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCart } from "../lib/cart";

type Categoria = {
  id: number;
  nombre: string;
};

export default function Navbar() {
  const router = useRouter();

  const [cartCount, setCartCount] = useState(0);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  // 🛒 CART
  useEffect(() => {
    const actualizar = () => {
      const cart = getCart();
      setCartCount(cart.length);
    };

    actualizar();

    window.addEventListener("storage", actualizar);
    window.addEventListener("cartUpdated", actualizar);

    return () => {
      window.removeEventListener("storage", actualizar);
      window.removeEventListener("cartUpdated", actualizar);
    };
  }, []);

  // ❤️ WISHLIST
  useEffect(() => {
    const actualizarWishlist = () => {
      const data = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlistCount(data.length);
    };

    actualizarWishlist();

    window.addEventListener("wishlistUpdated", actualizarWishlist);

    return () =>
      window.removeEventListener("wishlistUpdated", actualizarWishlist);
  }, []);

  // 📦 CATEGORÍAS
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const res = await fetch("/api/categorias");
        const data = await res.json();
        setCategorias(data);
      } catch {
        setCategorias([
          { id: 1, nombre: "Hombre" },
          { id: 2, nombre: "Mujer" },
          { id: 3, nombre: "Niños" },
          { id: 4, nombre: "Niñas" },
          { id: 5, nombre: "Juguetes" },
          { id: 6, nombre: "Hogar" },
        ]);
      }
    };

    cargarCategorias();
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* LOGO */}
        <Link href="/">
          <h1 className="text-xl font-bold text-green-600 hover:scale-105 transition">
            Sueñitos GT3
          </h1>
        </Link>

        {/* CATEGORÍAS */}
        <div className="hidden md:flex gap-6 text-gray-700 font-medium">
          {categorias.map((cat) => (
            <span
              key={cat.id}
              onClick={() => router.push(`/?categoria=${cat.id}`)}
              className="cursor-pointer hover:text-green-600 transition"
            >
              {cat.nombre}
            </span>
          ))}
        </div>

        {/* ICONOS */}
        <div className="flex items-center gap-5">

          {/* ❤️ WISHLIST */}
          <Link href="/wishlist" className="relative text-lg">
            ♥
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-pink-500 text-white text-xs px-2 rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* 🛒 CART */}
          <Link href="/carrito" className="relative text-lg">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 rounded-full animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>

        </div>
      </div>
    </nav>
  );
}