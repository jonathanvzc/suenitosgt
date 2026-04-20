"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCart } from "../lib/cart";
import { supabase } from "@/lib/supabase";

type Categoria = {
  id: number;
  nombre: string;
  orden: number;
};

export default function Navbar() {
  const router = useRouter();

  const [cartCount, setCartCount] = useState(0);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  

  useEffect(() => {
  const checkAdmin = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setIsAdmin(profile?.role === "admin");
  };

  checkAdmin();
}, []);
  // =========================
  // 🛒 CART
  // =========================
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

  

  // =========================
  // ❤️ WISHLIST
  // =========================
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

  // =========================
  // 📦 CATEGORÍAS (API)
  // =========================
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setLoadingCategorias(true);

        const res = await fetch("/api/categorias"); // 👈 AQUÍ VA
        const data = await res.json();

        setCategorias(data || []);
      } catch (error) {
        console.error("Error cargando categorías:", error);
        setCategorias([]);
      } finally {
        setLoadingCategorias(false);
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
            🛍️ Sueñitos GT
          </h1>
        </Link>

        {/* CATEGORÍAS */}
        <div className="hidden md:flex gap-6 text-gray-800 font-semibold">

          {/* LOADING */}
          {loadingCategorias && (
            <span className="text-gray-400 animate-pulse">
              Cargando...
            </span>
          )}

          {/* DATA */}
          {!loadingCategorias && categorias.length > 0 && (
            categorias.map((cat) => (
              <span
                key={cat.id}
                onClick={() => router.push(`/?categoria=${cat.id}`)}
                className="cursor-pointer hover:text-green-600 transition"
              >
                {cat.nombre}
              </span>
            ))
          )}

          {/* EMPTY */}
          {!loadingCategorias && categorias.length === 0 && (
            <span className="text-gray-400">
              Sin categorías
            </span>
          )}
        </div>

        
        {/* ICONOS */}
        <div className="flex items-center gap-5">

          {/* 🔥 ADMIN PANEL (SOLO SI ES ADMIN) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-bold hover:bg-green-700"
            >
              Admin Panel
            </Link>
          )}

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