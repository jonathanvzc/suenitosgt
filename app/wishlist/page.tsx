// Pagina de favoritos almacenados localmente para reingresar productos al flujo de compra.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWishlist, removeFromWishlist, WishlistProduct } from "@/lib/wishlist";
import { toastSuccess } from "@/lib/toast";
import { normalizeInlineText } from "@/lib/text";
import SmartImage from "@/components/SmartImage";

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistProduct[]>(() => getWishlist());

  useEffect(() => {
    const update = () => setItems(getWishlist());
    window.addEventListener("wishlistUpdated", update);

    return () => window.removeEventListener("wishlistUpdated", update);
  }, []);

  const handleRemove = (id: number) => {
    removeFromWishlist(id);
    toastSuccess("Producto eliminado de favoritos");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[30px] border border-gray-200 bg-white px-6 py-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">
            Favoritos
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Mi wishlist</h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-gray-300 bg-white px-6 py-20 text-center text-gray-500">
            No tienes productos en favoritos todavía.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((producto) => (
              <article
                key={producto.id}
                className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56">
                  <SmartImage
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    width={560}
                    height={560}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-900">{producto.nombre}</h2>
                  <p className="mt-2 line-clamp-1 text-sm leading-6 text-gray-600">
                    {normalizeInlineText(producto.descripcion) || "Sin descripción disponible."}
                  </p>
                  <p className="mt-4 text-2xl font-black text-green-600">Q{producto.precio}</p>

                  <div className="mt-5 space-y-2">
                    <button
                      onClick={() => router.push(`/producto/${producto.id}`)}
                      className="w-full rounded-full bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      Ver producto
                    </button>

                    <button
                      onClick={() => handleRemove(producto.id)}
                      className="w-full rounded-full border border-rose-300 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      Quitar de favoritos
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
