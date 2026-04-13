"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { addToCart } from "@/lib/cart";
import { getWishlist, toggleWishlist } from "@/lib/wishlist";
import toast from "react-hot-toast";
import Link from "next/link";

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria_id?: number;
};

type WishlistItem = {
  id: number;
};

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();

  const productId = Number(params?.id);

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Producto[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  // =========================
  // WISHLIST (TIPADO CORRECTO)
  // =========================
  const cargarWishlist = () => {
    const list: WishlistItem[] = getWishlist();
    setWishlistIds(list.map((p) => p.id));
  };

  // =========================
  // PRODUCTO
  // =========================
  const getProducto = async (id: number) => {
    setLoading(true);

    const { data } = await supabase
      .from("productos")
      .select("*")
      .eq("id", id)
      .single();

    setProducto(data ?? null);
    setLoading(false);

    if (data?.categoria_id) {
      const { data: rel } = await supabase
        .from("productos")
        .select("*")
        .eq("categoria_id", data.categoria_id)
        .neq("id", data.id)
        .limit(4);

      setRelated(rel ?? []);
    }
  };

  // =========================
  // EFFECT CONTROLADO
  // =========================
  useEffect(() => {
    if (!productId || Number.isNaN(productId)) return;

    getProducto(productId);
    cargarWishlist();
  }, [productId]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Cargando producto...
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="p-10 text-center text-gray-500">
        Producto no encontrado
      </div>
    );
  }

  const isWishlisted = wishlistIds.includes(producto.id);

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">

      {/* PRODUCTO PRINCIPAL */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 bg-white p-4 md:p-6 rounded-2xl shadow">

        <div className="overflow-hidden rounded-xl border">
          <img
            src={producto.imagen_url}
            className="w-full h-[280px] md:h-[420px] object-cover"
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold">
            {producto.nombre}
          </h1>

          <p className="text-gray-600 mt-3">
            {producto.descripcion}
          </p>

          <p className="text-2xl font-bold text-green-600 mt-5">
            Q{producto.precio}
          </p>

          <div className="mt-6 space-y-3">

            <button
              onClick={() => {
                addToCart({
                  id: producto.id,
                  nombre: producto.nombre,
                  precio: producto.precio,
                  imagen_url: producto.imagen_url,
                  cantidad: 1,
                });

                toast.success("Agregado al carrito");
              }}
              className="w-full bg-green-600 text-white py-2 rounded-xl"
            >
              Agregar al carrito
            </button>

            <button
              onClick={() => {
                toggleWishlist(producto);
                cargarWishlist();

                toast.success(
                  isWishlisted
                    ? "Eliminado de favoritos"
                    : "Agregado a favoritos"
                );
              }}
              className={`w-full py-3 rounded-xl border font-semibold ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "text-red-500 border-red-500"
              }`}
            >
              {isWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
            </button>

            <Link
              href="/"
              className="block text-center text-sm text-gray-500"
            >
              Volver a la tienda
            </Link>

          </div>
        </div>
      </div>

      {/* RELACIONADOS */}
      {related.length > 0 && (
        <div className="max-w-6xl mx-auto mt-10">

          <h2 className="text-lg font-bold mb-4">
            Productos relacionados
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {related.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow cursor-pointer"
                onClick={() => router.push(`/producto/${p.id}`)}
              >
                <img
                  src={p.imagen_url}
                  className="w-full h-32 object-cover"
                />

                <div className="p-3">
                  <h3 className="text-sm font-semibold">
                    {p.nombre}
                  </h3>

                  <p className="text-green-600 font-bold">
                    Q{p.precio}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      )}

    </div>
  );
}