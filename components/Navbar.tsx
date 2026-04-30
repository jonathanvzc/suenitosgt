// Navegación principal de la tienda con categorías, acceso al admin, favoritos y carrito.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCartCount } from "@/lib/cart";
import { getWishlist } from "@/lib/wishlist";

type Categoria = {
  id: number;
  nombre: string;
  orden?: number;
};

// Muestra navegación pública y sincroniza contadores visuales del storefront.
export default function Navbar() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Consulta la sesión actual para decidir si se muestra el acceso al panel admin.
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

    void checkAdmin();
  }, []);

  useEffect(() => {
    // Sincroniza el contador del carrito con localStorage y eventos internos.
    const update = () => setCartCount(getCartCount());

    update();
    window.addEventListener("storage", update);
    window.addEventListener("cartUpdated", update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cartUpdated", update);
    };
  }, []);

  useEffect(() => {
    // Sincroniza el contador de wishlist cuando cambian los favoritos.
    const update = () => setWishlistCount(getWishlist().length);

    update();
    window.addEventListener("wishlistUpdated", update);

    return () => window.removeEventListener("wishlistUpdated", update);
  }, []);

  useEffect(() => {
    // Carga las categorías públicas visibles en la barra principal.
    const loadCategorias = async () => {
      try {
        setLoadingCategorias(true);
        const response = await fetch("/api/categorias");
        const result = await response.json();
        setCategorias(result.data || []);
      } catch {
        setCategorias([]);
      } finally {
        setLoadingCategorias(false);
      }
    };

    void loadCategorias();
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full text-xl text-white shadow-md">
            🛍️
          </span>
          <div>
   
            <h1 className="text-xl font-black tracking-tight text-slate-900">Sueñitos GT</h1>
          </div>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {loadingCategorias && (
            <span className="text-sm text-slate-400">Cargando categorías...</span>
          )}

          {!loadingCategorias &&
            categorias.map((categoria) => (
              <button
                key={categoria.id}
                onClick={() => router.push(`/?categoria=${categoria.id}`)}
                className="text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
              >
                {categoria.nombre}
              </button>
            ))}
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/5454545admin"
              className="hidden rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 md:inline-flex"
            >
              
            </Link>
          )}

          <Link
            href="/wishlist"
            aria-label="Ver favoritos"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-rose-300 hover:text-rose-500"
          >
            <Heart className="h-5 w-5 stroke-[2.2]" />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/carrito"
            aria-label="Ver carrito"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600"
          >
            <ShoppingBag className="h-5 w-5 stroke-[2.2]" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
