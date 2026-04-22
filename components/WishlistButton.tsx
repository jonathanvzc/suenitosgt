// Boton reutilizable para agregar o quitar productos de favoritos desde distintas vistas.
"use client";

import { useEffect, useState } from "react";
import { getWishlist, toggleWishlist } from "../lib/wishlist";
import type { Producto } from "@/types/producto";

type Props = {
  product: Pick<Producto, "id" | "nombre" | "descripcion" | "precio" | "imagen_url">;
};

export default function WishlistButton({ product }: Props) {
  const [active, setActive] = useState(() =>
    getWishlist().some((item) => item.id === product.id)
  );

  useEffect(() => {
    const update = () => {
      const list = getWishlist();
      setActive(list.some((item) => item.id === product.id));
    };

    window.addEventListener("wishlistUpdated", update);

    return () => window.removeEventListener("wishlistUpdated", update);
  }, [product.id]);

  const handleClick = () => {
    toggleWishlist({
      ...product,
      imagen_url: product.imagen_url || undefined,
    });
    setActive((prev) => !prev);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-9 h-9 flex items-center justify-center rounded-full border transition ${
        active
          ? "bg-red-500 text-white border-red-500"
          : "bg-white text-gray-700 border-gray-300"
      }`}
    >
      ♥
    </button>
  );
}
