// Modal de formulario para crear y editar productos con soporte para galeria, tallas y video.
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Categoria, FormProducto, ProductoTalla, Subcategoria } from "@/types/producto";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  form: FormProducto;
  setForm: React.Dispatch<React.SetStateAction<FormProducto>>;
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  editId: number | null;
};

export default function ProductModal({
  open,
  onClose,
  onSave,
  form,
  setForm,
  categorias,
  subcategorias,
  editId,
}: Props) {
  const [tallaInput, setTallaInput] = useState("");

  const subcategoriasFiltradas = subcategorias.filter(
    (item) => item.categoria_id === form.categoria_id
  );

  const preview = useMemo(() => {
    if (form.imagen) {
      return URL.createObjectURL(form.imagen);
    }

    return form.imagen_url;
  }, [form.imagen, form.imagen_url]);

  const handleAddImagen = (files: FileList | null) => {
    if (!files?.length) return;

    const nuevasImagenes = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      imagen_url: URL.createObjectURL(file),
      file,
    }));

    setForm((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, ...nuevasImagenes],
    }));
  };

  const removeImagen = (id: number) => {
    setForm((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((img) => img.id !== id),
    }));
  };

  const addTalla = () => {
    if (!tallaInput.trim()) return;

    const nuevaTalla: ProductoTalla = {
      id: Date.now(),
      talla: tallaInput.trim(),
      stock: 0,
    };

    setForm((prev) => ({
      ...prev,
      tallas: [...prev.tallas, nuevaTalla],
    }));
    setTallaInput("");
  };

  const removeTalla = (id: number) => {
    setForm((prev) => ({
      ...prev,
      tallas: prev.tallas.filter((talla) => talla.id !== id),
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
              Producto
            </p>
            <h2 className="mt-2 text-2xl font-black text-gray-900">
              {editId ? "Editar producto" : "Nuevo producto"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
          >
            Cerrar
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nombre
              </label>
              <input
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Descripción
              </label>
              <textarea
                value={form.descripcion}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, descripcion: e.target.value }))
                }
                rows={5}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Observaciones
              </label>
              <textarea
                value={form.observaciones}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, observaciones: e.target.value }))
                }
                rows={3}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Precio
                </label>
                <input
                  type="number"
                  value={form.precio}
                  onChange={(e) => setForm((prev) => ({ ...prev, precio: e.target.value }))}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Video
                </label>
                <input
                  value={form.video_url}
                  onChange={(e) => setForm((prev) => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://youtube.com/..."
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Categoría
                </label>
                <select
                  value={form.categoria_id}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      categoria_id: Number(e.target.value),
                      subcategoria_id: null,
                    }))
                  }
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900"
                >
                  <option value={0}>Selecciona categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Subcategoría
                </label>
                <select
                  value={form.subcategoria_id || 0}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      subcategoria_id: Number(e.target.value) || null,
                    }))
                  }
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900"
                >
                  <option value={0}>Sin subcategoría</option>
                  {subcategoriasFiltradas.map((subcategoria) => (
                    <option key={subcategoria.id} value={subcategoria.id}>
                      {subcategoria.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-dashed border-gray-300 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Imagen principal
              </p>

              <div className="overflow-hidden rounded-3xl bg-gray-100">
                {preview ? (
                  <div className="relative h-56 w-full">
                    <Image
                      src={preview}
                      alt="Vista previa"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-56 items-center justify-center text-sm text-gray-400">
                    Sin imagen principal
                  </div>
                )}
              </div>

              <input
                type="file"
                className="mt-4 w-full text-sm"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, imagen: e.target.files?.[0] || null }))
                }
              />
            </div>

            <div className="rounded-[28px] border border-gray-200 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Galería de imágenes
              </p>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {form.imagenes.map((img) => (
                  <div key={img.id} className="relative overflow-hidden rounded-2xl">
                    <div className="relative h-28 w-full">
                      <Image
                        src={img.imagen_url}
                        alt="Imagen de galería"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImagen(img.id)}
                      className="absolute right-2 top-2 rounded-full bg-gray-900 px-2 py-1 text-xs font-semibold text-white"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>

              <input
                type="file"
                multiple
                className="mt-4 w-full text-sm"
                onChange={(e) => handleAddImagen(e.target.files)}
              />
            </div>

            <div className="rounded-[28px] border border-gray-200 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Tallas
              </p>

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={tallaInput}
                  onChange={(e) => setTallaInput(e.target.value)}
                  placeholder="Ej. S, M, 32"
                  className="rounded-2xl border border-gray-300 px-4 py-3 text-gray-900"
                />
                <button
                  onClick={addTalla}
                  className="rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Agregar
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {form.tallas.map((talla) => (
                  <div
                    key={talla.id}
                    className="flex items-center gap-3 rounded-full border border-gray-200 px-4 py-2"
                  >
                    <span className="text-sm font-semibold text-gray-900">
                      {talla.talla}
                    </span>
                    <button
                      onClick={() => removeTalla(talla.id)}
                      className="text-sm font-semibold text-rose-600"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            {editId ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
