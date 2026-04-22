// Detalle de producto con galeria multimedia, seleccion de talla, favoritos y productos relacionados.
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { addToCart } from "@/lib/cart";
import { getWishlist, toggleWishlist } from "@/lib/wishlist";
import { toastError, toastSuccess } from "@/lib/toast";
import ProductImage from "@/components/ProductImage";
import type { Producto } from "@/types/producto";

type ProductoDetalle = Producto & {
  producto_imagenes?: {
    id: number;
    imagen_url: string;
  }[];
  producto_tallas?: {
    id: number;
    talla: string;
    stock: number;
  }[];
};

type GalleryItem =
  | { key: string; type: "image"; src: string; label?: string }
  | { key: string; type: "video"; src: string; label: string; thumbnail: string | null };

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

const getVideoThumbnail = (url: string) => {
  if (!url) return null;

  if (url.includes("watch?v=")) {
    const id = url.split("v=")[1]?.split("&")[0];
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  }

  if (url.includes("youtu.be")) {
    const id = url.split("/").pop();
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  }

  if (url.includes("vimeo.com")) {
    const id = url.split("/").pop();
    return id ? `https://vumbnail.com/${id}.jpg` : null;
  }

  return null;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);

  const [producto, setProducto] = useState<ProductoDetalle | null>(null);
  const [related, setRelated] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);
  const [showTallaError, setShowTallaError] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(false);

  const cargarWishlist = () => {
    setWishlistIds(getWishlist().map((item) => item.id));
  };

  const getProducto = async (id: number) => {
    setLoading(true);

    const { data } = await supabase
      .from("productos")
      .select(
        `
        *,
        producto_imagenes (id, imagen_url),
        producto_tallas (id, talla, stock)
      `
      )
      .eq("id", id)
      .single();

    if (!data) {
      setProducto(null);
      setLoading(false);
      return;
    }

    const productoActual: ProductoDetalle = {
      ...data,
      producto_imagenes: data.producto_imagenes || [],
      producto_tallas: data.producto_tallas || [],
    };

    setProducto(productoActual);

    const galleryImages = [
      productoActual.imagen_url,
      ...(productoActual.producto_imagenes || []).map((imagen) => imagen.imagen_url),
    ].filter((value, index, array): value is string =>
      Boolean(value) && array.indexOf(value) === index
    );

    setSelectedImage(galleryImages[0] || null);
    setSelectedVideo(false);
    setSelectedTalla(null);
    setShowTallaError(false);

    if (productoActual.categoria_id) {
      const { data: relacionados } = await supabase
        .from("productos")
        .select("*")
        .eq("categoria_id", productoActual.categoria_id)
        .neq("id", productoActual.id)
        .is("deleted_at", null)
        .limit(4);

      setRelated(relacionados || []);
    } else {
      setRelated([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!productId) return;

    void (async () => {
      await getProducto(productId);
      cargarWishlist();
    })();
  }, [productId]);

  const galleryItems = useMemo<GalleryItem[]>(() => {
    if (!producto) return [];

    const items: GalleryItem[] = [];

    if (producto.imagen_url) {
      items.push({
        key: `main-${producto.imagen_url}`,
        type: "image",
        src: producto.imagen_url,
        label: "Principal",
      });
    }

    if (producto.video_url) {
      items.push({
        key: `video-${producto.video_url}`,
        type: "video",
        src: producto.video_url,
        label: "Video",
        thumbnail: getVideoThumbnail(producto.video_url),
      });
    }

    const extraImages = (producto.producto_imagenes || [])
      .map((imagen) => imagen.imagen_url)
      .filter((value): value is string => Boolean(value) && value !== producto.imagen_url);

    extraImages.forEach((src, index) => {
      items.push({
        key: `gallery-${index}-${src}`,
        type: "image",
        src,
        label: `Imagen ${index + 2}`,
      });
    });

    return items;
  }, [producto]);

  if (loading) {
    return <div className="p-10 text-center text-gray-600">Cargando producto...</div>;
  }

  if (!producto) {
    return <div className="p-10 text-center text-gray-600">Producto no encontrado.</div>;
  }

  const isWishlisted = wishlistIds.includes(producto.id);
  const tieneTallas = (producto.producto_tallas || []).length > 0;
  const hasScrollableGallery = galleryItems.length >= 6;

  const handleAddToCart = () => {
    if (tieneTallas && !selectedTalla) {
      setShowTallaError(true);
      toastError("Selecciona una talla antes de agregar el producto");
      return;
    }

    addToCart({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen_url:
        producto.imagen_url ||
        galleryItems.find((item) => item.type === "image")?.src ||
        undefined,
      cantidad: 1,
      talla: selectedTalla,
    });

    setShowTallaError(false);
    toastSuccess("Producto agregado al carrito");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-[32px] border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
        <div className="grid gap-4 md:grid-cols-[92px_1fr]">
          <div
            className={`order-2 flex max-w-full gap-3 overflow-x-auto pb-2 md:order-1 md:flex-col md:overflow-x-hidden md:pr-2 ${
              hasScrollableGallery
                ? "md:max-h-[560px] md:overflow-y-scroll md:[scrollbar-gutter:stable]"
                : ""
            }`}
          >
            {galleryItems.map((item) =>
              item.type === "image" ? (
                <button
                  key={item.key}
                  onClick={() => {
                    setSelectedImage(item.src);
                    setSelectedVideo(false);
                  }}
                  className={`relative h-20 min-w-20 overflow-hidden rounded-2xl border transition ${
                    !selectedVideo && selectedImage === item.src
                      ? "border-green-500 ring-2 ring-green-200"
                      : "border-gray-200"
                  }`}
                >
                  <ProductImage src={item.src} alt={producto.nombre} />
                </button>
              ) : (
                <button
                  key={item.key}
                  onClick={() => setSelectedVideo(true)}
                  className={`relative h-20 min-w-20 overflow-hidden rounded-2xl border transition ${
                    selectedVideo
                      ? "border-green-500 ring-2 ring-green-200"
                      : "border-gray-200"
                  }`}
                >
                  {item.thumbnail ? (
                    <ProductImage src={item.thumbnail} alt={`Miniatura ${item.label}`} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs font-semibold text-gray-500">
                      Video
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm text-gray-900">
                      ▶
                    </span>
                  </div>
                </button>
              )
            )}
          </div>

          <div className="order-1 overflow-hidden rounded-[28px] bg-gray-100 md:order-2">
            <div className="relative h-[420px] w-full transition duration-500 md:h-[560px]">
              {selectedVideo ? (
                <iframe
                  src={getEmbedUrl(producto.video_url || "")}
                  className="h-full w-full"
                  allowFullScreen
                />
              ) : (
                <ProductImage
                  src={selectedImage || producto.imagen_url}
                  alt={producto.nombre}
                  priority
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-green-700">
            Detalle del producto
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight">{producto.nombre}</h1>

          <p className="mt-5 whitespace-pre-line text-base leading-8 text-gray-600">
            {producto.descripcion}
          </p>

          {producto.observaciones && (
            <div className="mt-5 rounded-3xl border border-zinc-200 bg-gray-100 px-4 py-4 text-sm text-amber-900">
          
              <p className="mt-1 whitespace-pre-line">{producto.observaciones}</p>
            </div>
          )}

          <p className="mt-6 text-4xl font-black text-green-600">Q{producto.precio}</p>

          {tieneTallas && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
                Selecciona talla
              </p>

              <div className="flex flex-wrap gap-3">
                {producto.producto_tallas?.map((talla) => (
                  <button
                    key={talla.id}
                    onClick={() => {
                      setSelectedTalla(talla.talla);
                      setShowTallaError(false);
                    }}
                    className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                      selectedTalla === talla.talla
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 bg-white text-gray-800 hover:border-green-500"
                    }`}
                  >
                    {talla.talla}
                  </button>
                ))}
              </div>

              {showTallaError && (
                <p className="mt-3 text-sm font-semibold text-rose-600">
                  Debes seleccionar una talla para continuar.
                </p>
              )}
            </div>
          )}

          <div className="mt-8 space-y-3">
            <button
              onClick={handleAddToCart}
              className="w-full rounded-full bg-green-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Agregar al carrito
            </button>

            <button
              onClick={() => {
                toggleWishlist({
                  id: producto.id,
                  nombre: producto.nombre,
                  descripcion: producto.descripcion,
                  precio: producto.precio,
                  imagen_url: producto.imagen_url || undefined,
                });

                cargarWishlist();
                toastSuccess(
                  isWishlisted ? "Producto eliminado de favoritos" : "Producto agregado a favoritos"
                );
              }}
              className={`w-full rounded-full border px-6 py-4 text-sm font-semibold transition ${
                isWishlisted
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-rose-300 text-rose-600 hover:bg-rose-50"
              }`}
            >
              {isWishlisted ? "Quitar de favoritos" : "Guardar en favoritos"}
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full rounded-full border border-gray-300 px-6 py-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mx-auto mt-10 max-w-7xl">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
                Sugerencias
              </p>
              <h2 className="mt-2 text-2xl font-black">Productos relacionados</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((item) => (
              <article
                key={item.id}
                className="cursor-pointer overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                onClick={() => router.push(`/producto/${item.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <ProductImage src={item.imagen_url} alt={item.nombre} />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-gray-900">{item.nombre}</h3>
                  <p className="mt-2 text-lg font-black text-green-600">Q{item.precio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
