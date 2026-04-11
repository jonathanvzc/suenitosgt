"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { addToCart } from "../lib/cart";
import toast from "react-hot-toast";
import WishlistButton from "@/components/WishlistButton";


type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria_id: number;
  subcategoria_id: number;
};

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
  const searchParams = useSearchParams();
  const categoriaURL = searchParams.get("categoria");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState("");
  const [orden, setOrden] = useState("");

  const obtenerCategorias = async () => {
    const { data } = await supabase.from("categorias").select("*");
    setCategorias(data || []);
  };

  const obtenerSubcategorias = async (categoriaId: string) => {
    const { data } = await supabase
      .from("subcategorias")
      .select("*")
      .eq("categoria_id", categoriaId);

    setSubcategorias(data || []);
  };

  const obtenerProductos = async () => {
    let query = supabase.from("productos").select("*");

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
    setProductos(data || []);
  };

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

      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
        Sueñitos GT
      </h1>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 grid md:grid-cols-4 gap-4">

        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg text-gray-900 bg-white"
        />

        <select
          value={categoriaSeleccionada}
          onChange={(e) => {
            setCategoriaSeleccionada(e.target.value);
            window.history.replaceState({}, "", "/");
            setSubcategoriaSeleccionada("");
            obtenerSubcategorias(e.target.value);
          }}
          className="border border-gray-300 p-2 rounded-lg text-gray-900 bg-white"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id.toString()}>
              {c.nombre}
            </option>
          ))}
        </select>

        <select
          value={subcategoriaSeleccionada}
          onChange={(e) => setSubcategoriaSeleccionada(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg text-gray-900 bg-white"
        >
          <option value="">Subcategoría</option>
          {subcategorias.map((s) => (
            <option key={s.id} value={s.id.toString()}>
              {s.nombre}
            </option>
          ))}
        </select>

        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg text-gray-900 bg-white"
        >
          <option value="">Ordenar</option>
          <option value="precio_asc">Menor precio</option>
          <option value="precio_desc">Mayor precio</option>
        </select>

      </div>

      {/* PRODUCTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {productosFiltrados.map((producto) => (
          <div
            key={producto.id}
            className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-xl transition relative"
            onClick={() => {
              window.location.href = `/producto/${producto.id}`;
            }}
          >

            {/* WISHLIST */}
            <div className="absolute top-2 right-2 z-10">
              <WishlistButton product={producto} />
            </div>

            {/* IMAGEN */}
            <div className="overflow-hidden">
              <img
                src={producto.imagen_url}
                className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
              />
            </div>

            {/* INFO */}
            <div className="p-4">

              <h2 className="text-base font-semibold text-gray-900 group-hover:text-green-600">
                {producto.nombre}
              </h2>

              <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                {producto.descripcion}
              </p>

              <p className="text-lg font-bold text-green-600 mt-2">
                Q{producto.precio}
              </p>

              {/* BOTÓN */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({
                  id: producto.id,
                  nombre: producto.nombre,
                  precio: producto.precio,
                  imagen_url: producto.imagen_url,
                  cantidad: 1
                });
                  toast.success("Agregado al carrito");
                }}
                className="w-full mt-3 bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Agregar al carrito
              </button>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}