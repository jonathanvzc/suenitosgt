"use client";

import { useEffect, useState } from "react";
import { getWishlist, toggleWishlist } from "../lib/wishlist";

export default function WishlistButton({ product }: any) {
  const [active, setActive] = useState(false);

  const load = () => {
    const list = getWishlist();
    setActive(list.some((p: any) => p.id === product.id));
  };

  useEffect(() => {
    load();

    const update = () => load();
    window.addEventListener("wishlistUpdated", update);

    return () =>
      window.removeEventListener("wishlistUpdated", update);
  }, []);

  const handleClick = () => {
    toggleWishlist(product);
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