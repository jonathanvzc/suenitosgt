"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { addToCart } from "@/lib/cart";
import { getWishlist, toggleWishlist } from "@/lib/wishlist";
import toast from "react-hot-toast";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";

// =========================
// TYPES
// =========================
type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string | null;
  categoria_id?: number;
  video_url?: string | null;

  imagenes?: {
    id: number;
    imagen_url: string;
  }[];

  tallas?: {
    id: number;
    talla: string;
    stock: number;
  }[];
};

type WishlistItem = {
  id: number;
};

// =========================
// VIDEO FIX
// =========================
const getEmbedUrl = (url: string) => {
  if (!url) return "";

  if (url.includes("watch?v=")) {
    const id = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  }

  if (url.includes("youtu.be")) {
    const id = url.split("/").pop();
    return `https://www.youtube.com/embed/${id}`;
  }

  if (url.includes("vimeo.com")) {
    const id = url.split("/").pop();
    return `https://player.vimeo.com/video/${id}`;
  }

  return url;
};

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Producto[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  const [selectedImage, setSelectedImage] = useState<string | "VIDEO" | null>(null);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);

  // =========================
  // WISHLIST
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
      .select(`
        *,
        producto_imagenes (id, imagen_url),
        producto_tallas (id, talla, stock)
      `)
      .eq("id", id)
      .single();

    if (data) {
      const prod: Producto = {
        ...data,
        imagenes: data.producto_imagenes || [],
        tallas: data.producto_tallas || [],
      };

      setProducto(prod);

      if (prod.imagenes && prod.imagenes.length > 0) {
        setSelectedImage(prod.imagenes[0].imagen_url);
      } else {
        setSelectedImage(prod.imagen_url);
      }

      if (data.categoria_id) {
        const { data: rel } = await supabase
          .from("productos")
          .select("*")
          .eq("categoria_id", data.categoria_id)
          .neq("id", data.id)
          .limit(4);

        setRelated(rel ?? []);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!productId) return;
    getProducto(productId);
    cargarWishlist();
  }, [productId]);

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (!producto) return <div className="p-10 text-center">No encontrado</div>;

  const isWishlisted = wishlistIds.includes(producto.id);

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow">

        {/* ========================= GALERÍA ========================= */}
        <div className="grid grid-cols-[80px_1fr] gap-4">

          {/* MINIATURAS */}
          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">

            {producto.imagenes?.map((img) => (
              <div
                key={img.id}
                className={`relative w-full h-20 rounded-lg overflow-hidden cursor-pointer border ${
                  selectedImage === img.imagen_url
                    ? "border-black"
                    : "border-gray-300"
                }`}
                onClick={() => setSelectedImage(img.imagen_url)}
              >
                <ProductImage src={img.imagen_url} alt="thumb" />
              </div>
            ))}

            {producto.video_url && (
              <div
                onClick={() => setSelectedImage("VIDEO")}
                className="h-20 flex items-center justify-center bg-black text-white text-xs rounded-lg cursor-pointer"
              >
                ▶ Video
              </div>
            )}
          </div>

          {/* PRINCIPAL */}
          <div className="relative w-full h-[500px] bg-gray-100 rounded-xl overflow-hidden">
            {selectedImage === "VIDEO" ? (
              <iframe
                src={getEmbedUrl(producto.video_url || "")}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <ProductImage src={selectedImage} alt={producto.nombre} priority />
            )}
          </div>
        </div>

        {/* ========================= INFO ========================= */}
        <div className="flex flex-col">

          <h1 className="text-3xl font-bold text-gray-900">
            {producto.nombre}
          </h1>

          <p className="mt-4 text-gray-800 leading-relaxed whitespace-pre-line">
            {producto.descripcion}
          </p>

          <p className="text-3xl font-bold text-green-600 mt-4">
            Q{producto.precio}
          </p>

          {/* ========================= TALLAS ========================= */}
          {producto.tallas && producto.tallas.length > 0 && (
            <div className="mt-6">
              <p className="font-semibold mb-2 text-gray-900">
                Selecciona talla:
              </p>

              <div className="flex flex-wrap gap-2">
                {producto.tallas.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTalla(t.talla)}
                    disabled={t.stock === 0}
                    className={`px-4 py-2 rounded-lg border text-sm transition ${
                      selectedTalla === t.talla
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-800 border-gray-300 hover:border-green-500"
                    } ${t.stock === 0 && "opacity-40 cursor-not-allowed"}`}
                  >
                    {t.talla}
                  </button>
                ))}
              </div>

              {/* VALIDACIÓN VISUAL */}
              {!selectedTalla && (
                <p className="text-xs text-red-600 font-medium mt-2">
                  Debes seleccionar una talla
                </p>
              )}
            </div>
          )}

          {/* ========================= BOTONES ========================= */}
          <div className="mt-6 space-y-3">

            <button
              onClick={() => {
                if (producto.tallas?.length && !selectedTalla) {
                  toast.error("Selecciona una talla");
                  return;
                }

                addToCart({
                  id: producto.id,
                  nombre: producto.nombre + (selectedTalla ? ` (${selectedTalla})` : ""),
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
                  : "text-red-600 font-medium border-red-500"
              }`}
            >
              {isWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
            </button>

            {/* BOTÓN MEJORADO */}
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 rounded-xl border border-gray-400 text-gray-800 hover:bg-gray-100 transition font-medium"
            >
              ← Volver a la tienda
            </button>
          </div>
        </div>
      </div>

      {/* ========================= RELACIONADOS ========================= */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto mt-10">

          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Productos relacionados
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow hover:shadow-md cursor-pointer overflow-hidden"
                onClick={() => router.push(`/producto/${p.id}`)}
              >
                <div className="relative w-full h-40">
                  <ProductImage src={p.imagen_url} alt={p.nombre} />
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {p.nombre}
                  </h3>

                  <p className="text-green-700 font-bold">
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