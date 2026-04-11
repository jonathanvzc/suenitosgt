export type WishlistProduct = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen_url?: string;
};

export const getWishlist = (): WishlistProduct[] => {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem("wishlist") || "[]");
  } catch {
    return [];
  }
};

export const saveWishlist = (items: WishlistProduct[]) => {
  localStorage.setItem("wishlist", JSON.stringify(items));
  notifyWishlistUpdate();
};

export const toggleWishlist = (product: WishlistProduct) => {
  const list = getWishlist();

  const exists = list.find((p) => p.id === product.id);

  let updated: WishlistProduct[];

  if (exists) {
    updated = list.filter((p) => p.id !== product.id);
  } else {
    updated = [...list, product];
  }

  saveWishlist(updated);
};

export const removeFromWishlist = (id: number) => {
  const updated = getWishlist().filter((p) => p.id !== id);
  saveWishlist(updated);
};

export const notifyWishlistUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("wishlistUpdated"));
  }
};