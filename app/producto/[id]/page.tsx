"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import supabase from "@/lib/supabase";
import { addToCart } from "@/lib/cart";
import { toggleWishlist, getWishlist } from "@/lib/wishlist";
import toast from "react-hot-toast";

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria_id: number;
};

export default function ProductDetail() {
  const { id } = useParams();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Producto[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  const cargarWishlist = () => {
    const list = getWishlist();
    setWishlistIds(list.map((p) => p.id));
  };

  const getProducto = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("productos")
      .select("*")
      .eq("id", id)
      .single();

    setProducto(data);
    setLoading(false);

    if (data?.categoria_id) {
      const { data: rel } = await supabase
        .from("productos")
        .select("*")
        .eq("categoria_id", data.categoria_id)
        .neq("id", data.id)
        .limit(4);

      setRelated(rel || []);
    }
  };

  useEffect(() => {
    getProducto();
    cargarWishlist();
  }, [id]);

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
    <div className="bg-gray-50 min-h-screen p-6">

      {/* PRODUCTO PRINCIPAL */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 bg-white p-6 rounded-2xl shadow">

        {/* IMAGEN */}
        <div className="overflow-hidden rounded-xl border">
          <img
            src={producto.imagen_url}
            className="w-full h-[420px] object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>

        {/* INFO */}
        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            {producto.nombre}
          </h1>

          <p className="text-gray-500 mt-3">
            {producto.descripcion}
          </p>

          <p className="text-3xl font-bold text-green-600 mt-5">
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
                imagen_url: producto.imagen_url,
                cantidad: 1
                });
                toast.success("Agregado al carrito");
              }}
              className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700"
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
              className={`w-full py-3 rounded-xl border ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white text-red-500 border-red-500"
              }`}
            >
              {isWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
            </button>

          </div>
        </div>
      </div>

      {/* RELACIONADOS */}
      {related.length > 0 && (
        <div className="max-w-6xl mx-auto mt-10">

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Productos relacionados
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {related.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow border overflow-hidden cursor-pointer hover:shadow-lg"
                onClick={() => {
                  window.location.href = `/producto/${p.id}`;
                }}
              >
                <img
                  src={p.imagen_url}
                  className="w-full h-32 object-cover"
                />

                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-800">
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