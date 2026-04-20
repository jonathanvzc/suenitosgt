"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { addToCart } from "@/lib/cart";
import { getWishlist, toggleWishlist } from "@/lib/wishlist";
import toast from "react-hot-toast";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string | null;
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
  // WISHLIST
  // =========================
  const cargarWishlist = () => {
    const list: WishlistItem[] = getWishlist();
    setWishlistIds(list.map((p) => p.id));
  };

  // =========================
  // PRODUCTO PRINCIPAL
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

    // RELACIONADOS
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
  // EFFECT
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
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow">

        {/* IMAGEN */}
        <div className="relative w-full h-[300px] md:h-[420px] rounded-xl overflow-hidden border bg-gray-100">
          <ProductImage
            src={producto.imagen_url}
            alt={producto.nombre}
          />
        </div>

        {/* INFO */}
        <div className="flex flex-col">

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {producto.nombre}
          </h1>

          <p className="mt-4 text-gray-700 whitespace-pre-line leading-relaxed">
            {producto.descripcion}
          </p>

          <p className="text-2xl font-bold text-green-600 mt-5">
            Q{producto.precio}
          </p>

          {/* BOTONES */}
          <div className="mt-6 space-y-3">

            <button
              onClick={() => {
                addToCart({
                  id: producto.id,
                  nombre: producto.nombre,
                  precio: producto.precio,
                  imagen_url: producto.imagen_url || "",
                  cantidad: 1,
                });

                toast.success("Agregado al carrito");
              }}
              className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition"
            >
              Agregar al carrito
            </button>

            <button
              onClick={() => {
                toggleWishlist({
                  ...producto,
                  imagen_url: producto.imagen_url ?? undefined,
                });

                cargarWishlist();

                toast.success(
                  isWishlisted
                    ? "Eliminado de favoritos"
                    : "Agregado a favoritos"
                );
              }}
              className={`w-full py-3 rounded-xl border font-semibold transition ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "text-red-500 border-red-500"
              }`}
            >
              {isWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
            </button>

            <Link
              href="/"
              className="block text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Volver a la tienda
            </Link>

          </div>
        </div>
      </div>

      {/* RELACIONADOS */}
      {related.length > 0 && (
        <div className="max-w-6xl mx-auto mt-10">

          <h2 className="text-lg font-bold mb-4 text-gray-900">
            Productos relacionados
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {related.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow hover:shadow-md cursor-pointer overflow-hidden transition"
                onClick={() => router.push(`/producto/${p.id}`)}
              >

                {/* IMAGEN */}
                <div className="relative w-full h-32">
                  <ProductImage
                    src={p.imagen_url}
                    alt={p.nombre}
                  />
                </div>

                <div className="p-3">

                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {p.nombre}
                  </h3>

                  <p className="text-green-600 font-bold mt-1">
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