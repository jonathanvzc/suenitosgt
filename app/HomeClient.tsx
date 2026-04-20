"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabase";
import { addToCart } from "../lib/cart";
import toast from "react-hot-toast";
import WishlistButton from "@/components/WishlistButton";
import type { Producto } from "@/types/producto";
import ProductImage from "@/components/ProductImage";


type Categoria = {
  id: number;
  nombre: string;
};

type Subcategoria = {
  id: number;
  nombre: string;
  categoria_id: number;
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoriaURL = searchParams.get("categoria");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState("");
  const [orden, setOrden] = useState("");

  // =========================
  // CATEGORIAS
  // =========================
  const obtenerCategorias = async () => {
    const { data } = await supabase.from("categorias").select("*");
    setCategorias(data || []);
  };

  // =========================
  // SUBCATEGORIAS
  // =========================
  const obtenerSubcategorias = async (categoriaId: string) => {
    const { data } = await supabase
      .from("subcategorias")
      .select("*")
      .eq("categoria_id", categoriaId);

    setSubcategorias(data || []);
  };

  // =========================
  // PRODUCTOS
  // =========================
  const obtenerProductos = async () => {
    let query = supabase
      .from("productos")
      .select("*")
      .is("deleted_at", null);

    const categoriaActiva = categoriaURL || categoriaSeleccionada;

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

    const normalizados = (data || []).map((p) => ({
      ...p,
      imagen_url: p.imagen_url || null,
    }));

    setProductos(normalizados);
  };

  // =========================
  // EFFECTS
  // =========================
  useEffect(() => {
    obtenerCategorias();
  }, []);

  useEffect(() => {
    obtenerProductos();
  }, [categoriaSeleccionada, subcategoriaSeleccionada, orden, categoriaURL]);

  useEffect(() => {
    if (categoriaURL) {
      setCategoriaSeleccionada(categoriaURL);
      obtenerSubcategorias(categoriaURL);
    } else {
      setCategoriaSeleccionada("");
    }
  }, [categoriaURL]);

  // =========================
  // BUSQUEDA
  // =========================
  const normalizar = (txt: string) =>
    txt?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const productosFiltrados = productos.filter((p) => {
    const texto = normalizar(busqueda.trim());
    if (!texto) return true;

    return (
      normalizar(p.nombre).includes(texto) ||
      normalizar(p.descripcion).includes(texto)
    );
  });

  return (
    <div className="bg-gray-50 min-h-screen p-6">

      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
        Sueñitos GT
      </h1>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 grid md:grid-cols-4 gap-4">

        <select
          value={categoriaSeleccionada}
          onChange={(e) => {
            setCategoriaSeleccionada(e.target.value);
            router.replace("/");
            setSubcategoriaSeleccionada("");
            obtenerSubcategorias(e.target.value);
          }}
          className="border p-2 rounded-lg text-gray-900"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <select
          value={subcategoriaSeleccionada}
          onChange={(e) => setSubcategoriaSeleccionada(e.target.value)}
          className="border p-2 rounded-lg text-gray-900"
        >
          <option value="">Subcategoría</option>
          {subcategorias.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="border p-2 rounded-lg text-gray-900"
        >
          <option value="">Ordenar</option>
          <option value="precio_asc">Menor precio</option>
          <option value="precio_desc">Mayor precio</option>
        </select>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {productosFiltrados.map((producto) => (
          <div
            key={producto.id}
            className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden flex flex-col cursor-pointer"
            onClick={() => router.push(`/producto/${producto.id}`)}
          >

            {/* IMAGEN */}
            <div className="relative w-full h-44">
              <ProductImage
                src={producto.imagen_url}
                alt={producto.nombre}
              />
            </div>

            {/* INFO */}
            <div className="p-3 flex flex-col flex-1">

              <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[40px]">
                {producto.nombre}
              </h2>

              <p
                className="text-gray-800 text-sm mt-1"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  whiteSpace: "pre-line",
                  minHeight: "100px", // 🔥 CLAVE: altura fija para alinear cards
                }}
              >
                {producto.descripcion}
              </p>

              <p className="text-green-600 font-bold mt-2">
                Q{producto.precio}
              </p>

              {/* PUSH BOTÓN ABAJO */}
              <div className="mt-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({
                      id: producto.id,
                      nombre: producto.nombre,
                      precio: producto.precio,
                      imagen_url: producto.imagen_url || "",
                      cantidad: 1,
                    });

                    toast.success("Agregado al carrito");
                  }}
                  className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition"
                >
                  Agregar
                </button>
              </div>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}