export type CartItem = {
  id: number;
  nombre: string;
  precio: number;
  imagen_url?: string;
  cantidad: number;
  talla?: string | null;
};

export const getCartItemKey = (id: number, talla?: string | null) =>
  `${id}::${(talla || "").trim().toUpperCase()}`;

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = JSON.parse(localStorage.getItem("cart") || "[]");

    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.map((item) => ({
      ...item,
      cantidad: Math.max(1, Number(item?.cantidad) || 1),
      talla: item?.talla ? String(item.talla).trim() : null,
    }));
  } catch {
    return [];
  }
};

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem("cart", JSON.stringify(cart));
  notifyCartUpdate();
};

// ✅ ADD CON SOPORTE DE TALLA (CLAVE DEL NEGOCIO)
export const addToCart = (producto: CartItem) => {
  const cart = getCart();
  const normalizedTalla = producto.talla ? producto.talla.trim() : null;

  const index = cart.findIndex(
    (p) =>
      p.id === producto.id &&
      (p.talla || null) === normalizedTalla
  );

  if (index !== -1) {
    cart[index].cantidad += producto.cantidad || 1;
  } else {
    cart.push({
      ...producto,
      cantidad: producto.cantidad || 1,
      talla: normalizedTalla,
    });
  }

  saveCart(cart);
};

export const removeFromCart = (id: number, talla?: string | null) => {
  const updated = getCart().filter(
    (p) => !(p.id === id && (p.talla || null) === (talla ? talla.trim() : null))
  );
  saveCart(updated);
};

export const updateCartItemQuantity = (
  id: number,
  talla: string | null | undefined,
  cantidad: number
) => {
  const updated = getCart().map((item) =>
    item.id === id && (item.talla || null) === (talla ? talla.trim() : null)
      ? { ...item, cantidad: Math.max(1, cantidad) }
      : item
  );

  saveCart(updated);
};

export const clearCart = () => {
  localStorage.removeItem("cart");
  notifyCartUpdate();
};

export const getCartCount = () =>
  getCart().reduce((total, item) => total + item.cantidad, 0);

export const notifyCartUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cartUpdated"));
  }
};
