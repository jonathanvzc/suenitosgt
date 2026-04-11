export type CartItem = {
  id: number;
  nombre: string;
  precio: number;
  imagen_url?: string;
  cantidad: number;
};

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
};

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem("cart", JSON.stringify(cart));
  notifyCartUpdate();
};

export const addToCart = (producto: CartItem) => {
  const cart = getCart();

  const index = cart.findIndex((p) => p.id === producto.id);

  if (index !== -1) {
    cart[index].cantidad += 1;
  } else {
    cart.push({ ...producto, cantidad: 1 });
  }

  saveCart(cart);
};

export const removeFromCart = (id: number) => {
  const updated = getCart().filter((p) => p.id !== id);
  saveCart(updated);
};

export const clearCart = () => {
  localStorage.removeItem("cart");
  notifyCartUpdate();
};

export const notifyCartUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cartUpdated"));
  }
};