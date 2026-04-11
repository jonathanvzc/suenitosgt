"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWishlist, removeFromWishlist, WishlistProduct } from "@/lib/wishlist";
import { addToCart } from "@/lib/cart";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistProduct[]>([]);

  const load = () => {
    setItems(getWishlist());
  };

  useEffect(() => {
    load();

    const update = () => load();
    window.addEventListener("wishlistUpdated", update);

    return () => {
      window.removeEventListener("wishlistUpdated", update);
    };
  }, []);

  const handleRemove = (id: number) => {
    removeFromWishlist(id);
    toast.success("Eliminado de favoritos");
  };

  const handleAddCart = (product: WishlistProduct) => {
    addToCart({
    id: product.id,
    nombre: product.nombre,
    precio: product.precio,
    imagen_url: product.imagen_url,
    cantidad: 1
    });
    toast.success("Agregado al carrito");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Mis favoritos
      </h1>

      {items.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          No tienes productos en favoritos
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {items.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow border overflow-hidden hover:shadow-lg transition"
            >

              {/* IMAGEN */}
              {p.imagen_url && (
                <img
                  src={p.imagen_url}
                  className="w-full h-44 object-cover"
                />
              )}

              {/* CONTENIDO */}
              <div className="p-4">

                <h2 className="font-semibold text-gray-800">
                  {p.nombre}
                </h2>

                <p className="text-sm text-gray-500 line-clamp-2">
                  {p.descripcion}
                </p>

                <p className="text-green-600 font-bold mt-2">
                  Q{p.precio}
                </p>

                {/* BOTONES */}
                <div className="mt-4 space-y-2">

                  <button
                    onClick={() => handleAddCart(p)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                  >
                    Agregar al carrito
                  </button>

                  <button
                    onClick={() => handleRemove(p.id)}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                  >
                    Quitar de favoritos
                  </button>

                  <Link
                    href={`/producto/${p.id}`}
                    className="block text-center text-blue-600 text-sm mt-1"
                  >
                    Ver producto
                  </Link>

                </div>

              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}