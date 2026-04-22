// Home del catalogo con filtros por categoria, subcategoria, busqueda, orden y acceso al detalle.
"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import WishlistButton from "@/components/WishlistButton";
import ProductImage from "@/components/ProductImage";
import { normalizeInlineText } from "@/lib/text";
import type { Categoria, Producto, Subcategoria } from "@/types/producto";

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoriaURL = searchParams.get("categoria");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(() => categoriaURL || "");
  const categoriaActiva = categoriaURL || categoriaSeleccionada;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState("");
  const [orden, setOrden] = useState("");

  const obtenerCategorias = async () => {
    const { data } = await supabase
      .from("categorias")
      .select("*")
      .order("orden", { ascending: true });

    setCategorias(data || []);
  };

  const obtenerSubcategorias = async (categoriaId: string) => {
    if (!categoriaId) {
      setSubcategorias([]);
      return;
    }

    const { data } = await supabase
      .from("subcategorias")
      .select("*")
      .eq("categoria_id", categoriaId)
      .order("orden", { ascending: true });

    setSubcategorias(data || []);
  };

  const obtenerProductos = useEffectEvent(async () => {
    let query = supabase.from("productos").select("*").is("deleted_at", null);

    if (categoriaActiva) {
      query = query.eq("categoria_id", Number(categoriaActiva));
    }

    if (subcategoriaSeleccionada) {
      query = query.eq("subcategoria_id", Number(subcategoriaSeleccionada));
    }

    if (orden === "precio_asc") {
      query = query.order("precio", { ascending: true });
    }

    if (orden === "precio_desc") {
      query = query.order("precio", { ascending: false });
    }

    const { data } = await query;

    setProductos(
      (data || []).map((producto) => ({
        ...producto,
        imagen_url: producto.imagen_url || null,
      }))
    );
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void obtenerCategorias();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void obtenerProductos();
  }, [categoriaActiva, subcategoriaSeleccionada, orden]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void obtenerSubcategorias(categoriaActiva);
  }, [categoriaActiva]);

  const normalizar = (texto: string) =>
    texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const productosFiltrados = productos.filter((producto) => {
    const texto = normalizar(busqueda.trim());
    if (!texto) return true;

    return (
      normalizar(producto.nombre).includes(texto) ||
      normalizar(producto.descripcion).includes(texto)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 grid gap-4 rounded-[28px] border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-4">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto"
            className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          />

          <select
            value={categoriaActiva}
            onChange={(e) => {
              const value = e.target.value;
              setCategoriaSeleccionada(value);
              router.replace("/");
              setSubcategoriaSeleccionada("");
              void obtenerSubcategorias(value);
            }}
            className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>

          <select
            value={subcategoriaSeleccionada}
            onChange={(e) => setSubcategoriaSeleccionada(e.target.value)}
            className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          >
            <option value="">Todas las subcategorías</option>
            {subcategorias.map((subcategoria) => (
              <option key={subcategoria.id} value={subcategoria.id}>
                {subcategoria.nombre}
              </option>
            ))}
          </select>

          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          >
            <option value="">Ordenar</option>
            <option value="precio_asc">Menor precio</option>
            <option value="precio_desc">Mayor precio</option>
          </select>
        </section>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {productosFiltrados.map((producto) => (
            <article
              key={producto.id}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              onClick={() => router.push(`/producto/${producto.id}`)}
            >
              <div className="relative h-64 overflow-hidden">
                <div
                  className="absolute right-3 top-3 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <WishlistButton product={producto} />
                </div>
                <div className="h-full transition duration-500 group-hover:scale-[1.03]">
                  <ProductImage src={producto.imagen_url} alt={producto.nombre} />
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-bold tracking-tight text-gray-900">
                  {producto.nombre}
                </h2>

                <p className="mt-3 line-clamp-1 text-sm leading-6 text-gray-600">
                  {normalizeInlineText(producto.descripcion)}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-2xl font-black text-green-600">Q{producto.precio}</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/producto/${producto.id}`);
                    }}
                    className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    Seleccionar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
